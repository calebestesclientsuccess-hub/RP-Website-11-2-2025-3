import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    /**
     * Snapshot of feature flags for the current tenant, loaded per request.
     */
    featureFlags?: Record<string, boolean>;
  }
}

