/**
 * Main application file - dynamically imported by server/index.ts
 * after Vite has been patched to support Replit domains
 */
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { randomUUID } from "crypto";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";
import { env } from "./config/env";
import { securityHeaders } from "./middleware/security-headers";
import { assignCspNonce } from "./middleware/csp-nonce";
import { tenantMiddleware } from "./middleware/tenant";
import { compressionMiddleware, cacheControl } from "./middleware/compression";
import { queryMonitoring } from "./middleware/query-monitoring";
import { errorHandler } from "./middleware/error-handler";
import healthRouter from "./routes/health";
import debugEnvRouter from "./routes/debug-env";
import { sessionMiddleware } from "./middleware/session";
import { sessionTimeoutMiddleware } from "./middleware/session-timeout";
import {
  blockSuspiciousIPs,
  detectSuspiciousPatterns,
} from "./middleware/intrusion-detection";
import sitemapRouter from "./routes/sitemap";
import { corsMiddleware } from "./middleware/cors";
import { apiLimiter } from "./middleware/rate-limit";
import { initializeWorkers } from "./workers";
// import webhookRouter from "./routes/webhooks";
import { registerGracefulShutdown } from "./utils/shutdown";
import { responseSizeGuard } from "./middleware/response-size-limiter";

const app = express();
app.disable("x-powered-by");
const httpServer = createServer(app);
registerGracefulShutdown(httpServer);
const isServerless = Boolean(process.env.VERCEL);

// Trust the first proxy (Replit/Vercel) so secure cookies work correctly
app.set("trust proxy", 1);

if (!isServerless) {
  initializeWorkers();
}
app.use((req, _res, next) => {
  req.requestId = randomUUID();
  next();
});

// Security headers (must be first)
app.use(assignCspNonce);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err.message === "string" && err.message.includes("Origin")) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

// Compression
app.use(compressionMiddleware);
app.use(responseSizeGuard());

// Webhooks (before body parsing)
// app.use("/api/webhooks", webhookRouter);

// Body parsing with size limits
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || "10mb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: process.env.MAX_REQUEST_SIZE || "10mb",
  }),
);

// Cache control
app.use(cacheControl);

// Query monitoring
app.use(queryMonitoring);

// Health checks (before logging)
app.use("/health", healthRouter);

// Debug endpoint (TEMPORARY - remove after debugging)
app.use(debugEnvRouter);

// Session & inactivity tracking
app.use(sessionMiddleware);
app.use(sessionTimeoutMiddleware);

// Global API limiter (fine-grained limiters are applied per-route)
app.use("/api", apiLimiter);

// Apply tenant middleware (must be early in the chain)
app.use(tenantMiddleware);

// Apply intrusion detection system
app.use(blockSuspiciousIPs);
app.use(detectSuspiciousPatterns);

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Register main routes
const register = async () => {
  await registerRoutes(app);

  // Vite or Static serving
  if (app.get("env") === "development") {
    // Dynamically import Vite only in development to avoid bundling it
    const { setupVite } = await import("./vite");
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // Error handling middleware (must be last)
  app.use(errorHandler);
};

// Export the promise for serverless environments to wait on
export const appReady = register().catch((err) => {
  console.error("Failed to register routes:", err);
  if (!isServerless) {
    process.exit(1);
  }
  throw err;
});

if (!isServerless) {
  const port = Number(env.PORT ?? 50005);
  httpServer.listen(port, () => {
    log(`Server listening at http://localhost:${port}`, "server");
  });
}

export default app;
export { app };
