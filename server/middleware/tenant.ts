import type { Request, Response, NextFunction } from "express";
import { env, isProduction } from "../config/env";

const PUBLIC_TENANT_ID = env.PUBLIC_TENANT_ID?.trim();
const DEV_TENANT_FALLBACK =
  !isProduction ? env.DEV_TENANT_FALLBACK?.trim() || "dev_local_tenant" : "";

export const DEFAULT_TENANT_ID = PUBLIC_TENANT_ID || DEV_TENANT_FALLBACK || "";

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      userId?: string;
      requestId?: string;
    }
  }
}

export function tenantMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // 1. Prefer session context
  if (req.session?.tenantId) {
    req.tenantId = req.session.tenantId;
    req.userId = req.session.userId;
    return next();
  }

  // 2. Fallback to configured public tenant (for static sites/landing pages)
  if (DEFAULT_TENANT_ID) {
    req.tenantId = DEFAULT_TENANT_ID;
    return next();
  }

  // 3. Fail closed if no valid tenant context is configured
  if (req.path.startsWith("/api") || req.path.startsWith("/admin")) {
    return _res.status(401).json({ error: "Tenant context is not configured for this environment" });
  }
  
  return next(new Error("Tenant context is not configured"));
}

export function requireUserContext(
  req: Request,
  res: Response,
): string | null {
  const userId = req.session?.userId;

  if (userId) {
    return userId;
  }

  res.status(401).json({ error: "Authentication required." });
  return null;
}
