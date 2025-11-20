/**
 * Main application file - dynamically imported by server/index.ts
 * after Vite has been patched to support Replit domains
 */
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders } from "./middleware/security-headers";
import { tenantMiddleware } from "./middleware/tenant";
import { compressionMiddleware, cacheControl } from "./middleware/compression";
import { queryMonitoring } from "./middleware/query-monitoring";
import { errorHandler } from "./middleware/error-handler";
import healthRouter from "./routes/health";

const app = express();
const httpServer = createServer(app);
const isServerless = Boolean(process.env.VERCEL);

// Security headers (must be first)
app.use(securityHeaders);

// Compression
app.use(compressionMiddleware);

// Body parsing with size limits
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Cache control
app.use(cacheControl);

// Query monitoring
app.use(queryMonitoring);

// Health checks (before logging)
app.use('/health', healthRouter);

// Apply tenant middleware (must be early in the chain)
app.use(tenantMiddleware);

// Apply intrusion detection system
import { blockSuspiciousIPs, detectSuspiciousPatterns, enhancedRateLimiter } from './middleware/intrusion-detection';
app.use(blockSuspiciousIPs);
app.use(detectSuspiciousPatterns);

// Demo mode - no session/auth required
// All requests are treated as coming from the demo user

// Comprehensive security headers middleware
app.use((req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter (legacy but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');

  // HTTP Strict Transport Security (HSTS) - enforce HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (CSP) - comprehensive security policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
});

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit - try to continue running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - try to continue running
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Dynamic sitemap route
import sitemapRouter from './routes/sitemap';
app.use('/', sitemapRouter);

// Add X-Robots-Tag for SEO
app.use((req, res, next) => {
  if (!req.path.includes('/admin')) {
    res.setHeader('X-Robots-Tag', 'index, follow');
  }
  next();
});

async function bootstrapApplication() {
  // Register routes
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development" && !isServerless) {
    try {
      await setupVite(app, httpServer);
    } catch (error) {
      console.error('Vite setup failed, retrying...', error);
      // Retry once after brief delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await setupVite(app, httpServer);
    }
  } else if (!isServerless) {
    serveStatic(app);
  }

  // Global error handler (must be last)
  app.use(errorHandler);
}

export const appReady = bootstrapApplication();
export { app };

if (!isServerless) {
  appReady.then(() => {
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    httpServer.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Health checks available at /health`);
    });
  });
}