import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import crypto from "crypto";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sessionPool } from "./db";
import { securityHeaders } from "./middleware/security-headers";
import { tenantMiddleware } from "./middleware/tenant";
import { sessionTimeoutMiddleware } from './middleware/session-timeout'; // Import session timeout middleware

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply tenant middleware (must be early in the chain)
app.use(tenantMiddleware);

// Apply intrusion detection system
import { blockSuspiciousIPs, detectSuspiciousPatterns, enhancedRateLimiter } from './middleware/intrusion-detection';
app.use(blockSuspiciousIPs);
app.use(detectSuspiciousPatterns);

// Session configuration
const PgSession = connectPgSimple(session);
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours of inactivity

app.use(
  session({
    store: new PgSession({
      pool: sessionPool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: SESSION_TIMEOUT,
      // Tenant-specific cookies (if using subdomains)
      domain: process.env.NODE_ENV === "production" ? ".revenueparty.com" : undefined,
      sameSite: "lax",
    },
    // Add tenant to session
    genid: (req) => {
      const tenantPrefix = (req as any).tenantId?.substring(0, 8) || 'default';
      return `${tenantPrefix}_${crypto.randomBytes(16).toString('hex')}`;
    },
  })
);

// Session timeout middleware
app.use(sessionTimeoutMiddleware);

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();