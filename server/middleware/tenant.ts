import { Request, Response, NextFunction } from "express";

// Hardcoded demo tenant ID - simplified for demo mode
export const DEFAULT_TENANT_ID = 'demo_tenant_01';
export const DEFAULT_USER_ID = 'demo_user_01';

// Extend Express Request type to include tenantId and mock user
declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      userId?: string;
      demoUser?: {
        id: string;
        username: string;
        email: string;
        tenantId: string;
      };
    }
  }
}

// Demo mode middleware - always sets demo tenant and mock user
export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Hardcoded demo values - no authentication required
  req.tenantId = DEFAULT_TENANT_ID;
  req.userId = DEFAULT_USER_ID;
  
  // Mock user object for any code that expects user context
  req.demoUser = {
    id: DEFAULT_USER_ID,
    username: 'demo_user',
    email: 'demo@example.com',
    tenantId: DEFAULT_TENANT_ID
  };
  
  next();
}
