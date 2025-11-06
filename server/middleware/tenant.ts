import { Request, Response, NextFunction } from "express";

// Default tenant ID for the stubbed multi-tenant architecture
export const DEFAULT_TENANT_ID = 'tnt_revenueparty_default';

// Extend Express Request type to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId: string;
    }
  }
}

// Tenant middleware - for now, always sets the default tenant
// In the future (Phase 3), this will extract tenantId from subdomain or other source
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Stubbed: Always use default tenant
  // Future: Extract from subdomain, JWT claim, or custom header
  req.tenantId = DEFAULT_TENANT_ID;
  
  next();
}
