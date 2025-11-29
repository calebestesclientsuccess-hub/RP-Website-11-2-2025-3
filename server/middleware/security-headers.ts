import type { Request, Response, NextFunction } from "express";
import { env, isProduction } from "../config/env";

const EXTERNAL_SCRIPT_SRCS = Object.freeze([
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://js.stripe.com",
]);

const EXTERNAL_STYLE_SRCS = Object.freeze(["https://fonts.googleapis.com"]);
const EXTERNAL_FONT_SRCS = Object.freeze(["https://fonts.gstatic.com"]);
const EXTERNAL_CONNECT_SRCS = Object.freeze([
  "https://www.google-analytics.com",
  "https://www.googletagmanager.com",
  "https://api.replicate.com",
  "https://res.cloudinary.com",
  "https://api.cloudinary.com",
]);

export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const nonce = res.locals.cspNonce as string | undefined;
  const isProd = isProduction;

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  // Use credentialless for cross-origin embedding if possible, or require-corp for strictness
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless"); 
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Origin-Agent-Cluster", "?1");

  // In development, skip CSP entirely to allow Vite HMR and dev tools
  if (!isProd) {
    return next();
  }

  const scriptSrc = new Set<string>(["'self'", ...EXTERNAL_SCRIPT_SRCS]);
  if (nonce) {
    scriptSrc.add(`'nonce-${nonce}'`);
    scriptSrc.add("'strict-dynamic'");
  }
  if (!isProduction) {
    // HMR requires eval in dev only.
    scriptSrc.add("'unsafe-eval'");
  }

  const styleSrc = new Set<string>(["'self'", ...EXTERNAL_STYLE_SRCS]);
  if (nonce) {
    styleSrc.add(`'nonce-${nonce}'`);
  }
  if (!isProduction) {
    styleSrc.add("'unsafe-inline'");
  }

  const styleAttrDirective =
    process.env.DISABLE_INLINE_STYLE_ATTR === "true"
      ? "style-src-attr 'none'"
      : "style-src-attr 'unsafe-inline'";

  const directives = [
    "default-src 'self'",
    `script-src ${Array.from(scriptSrc).join(" ")}`,
    `style-src ${Array.from(styleSrc).join(" ")}`,
    "script-src-attr 'none'",
    styleAttrDirective,
    `font-src 'self' ${EXTERNAL_FONT_SRCS.join(" ")}`,
    "img-src 'self' data: blob: https:",
    "media-src 'self' https: blob:",
    `connect-src 'self' ${EXTERNAL_CONNECT_SRCS.join(" ")} wss:`,
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "prefetch-src 'self'",
    "manifest-src 'self'",
    // "require-trusted-types-for 'script'", // Can break third-party scripts if they aren't compliant
    // "trusted-types default",
    "upgrade-insecure-requests",
  ].join("; ");

  res.setHeader("Content-Security-Policy", directives);

  if (isProd) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()",
  );

  next();
}
