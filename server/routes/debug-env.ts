import { Router } from "express";

const router = Router();

// Temporary debug endpoint - REMOVE AFTER DEBUGGING
router.get("/api/debug/env", (req, res) => {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasPublicTenantId: !!process.env.PUBLIC_TENANT_ID,
    publicTenantIdValue: process.env.PUBLIC_TENANT_ID || "NOT_SET",
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || "NOT_SET",
    hasDevTenantFallback: !!process.env.DEV_TENANT_FALLBACK,
    devTenantFallback: process.env.DEV_TENANT_FALLBACK || "NOT_SET",
    requestTenantId: req.tenantId || "NOT_SET",
    sessionTenantId: (req as any).session?.tenantId || "NOT_SET",
  };

  res.json(envCheck);
});

export default router;

