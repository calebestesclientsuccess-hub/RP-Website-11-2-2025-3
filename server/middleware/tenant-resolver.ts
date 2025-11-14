
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { tenants } from "@shared/schema";
import { eq } from "drizzle-orm";

export const DEFAULT_TENANT_ID = 'tnt_revenueparty_default';

// Cache tenant lookups to avoid DB hits on every request
const tenantCache = new Map<string, { id: string; name: string; slug: string }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedTenant {
  tenant: { id: string; name: string; slug: string };
  timestamp: number;
}

const tenantCacheWithTTL = new Map<string, CachedTenant>();

async function resolveTenantFromSubdomain(hostname: string): Promise<string | null> {
  // Example: customer1.revenueparty.com -> "customer1"
  const parts = hostname.split('.');
  if (parts.length < 3) return null; // No subdomain
  
  const subdomain = parts[0];
  if (subdomain === 'www' || subdomain === 'app' || subdomain === 'admin') {
    return DEFAULT_TENANT_ID; // Main domain
  }
  
  // Check cache first
  const cached = tenantCacheWithTTL.get(subdomain);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.tenant.id;
  }
  
  // Query database
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, subdomain));
  if (tenant) {
    tenantCacheWithTTL.set(subdomain, { tenant, timestamp: Date.now() });
    return tenant.id;
  }
  
  return null;
}

async function resolveTenantFromCustomDomain(hostname: string): Promise<string | null> {
  // Future: Check custom_domains table mapping hostname -> tenant_id
  return null;
}

export async function tenantResolverMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const hostname = req.hostname || req.get('host')?.split(':')[0] || 'localhost';
    
    // Try subdomain resolution first
    let tenantId = await resolveTenantFromSubdomain(hostname);
    
    // Fallback to custom domain lookup
    if (!tenantId) {
      tenantId = await resolveTenantFromCustomDomain(hostname);
    }
    
    // Fallback to default tenant (for local dev, single-tenant mode)
    if (!tenantId) {
      tenantId = DEFAULT_TENANT_ID;
    }
    
    // Verify tenant exists
    const cached = Array.from(tenantCacheWithTTL.values())
      .find(c => c.tenant.id === tenantId);
    
    if (!cached) {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
      if (!tenant) {
        return res.status(404).json({ 
          error: "Tenant not found",
          message: "The requested organization does not exist" 
        });
      }
    }
    
    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error("Tenant resolution error:", error);
    // Fail safe: use default tenant
    req.tenantId = DEFAULT_TENANT_ID;
    next();
  }
}
