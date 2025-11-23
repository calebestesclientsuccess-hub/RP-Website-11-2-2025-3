import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Generates a per-request CSP nonce so we can authorize specific inline assets
 * without falling back to unsafe directives.
 */
export function assignCspNonce(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
}


