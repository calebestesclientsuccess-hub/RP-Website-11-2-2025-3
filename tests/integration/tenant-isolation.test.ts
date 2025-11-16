
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../server/db';
import { campaigns, leads, tenants } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('Tenant Isolation', () => {
  const tenant1Id = 'test-tenant-1';
  const tenant2Id = 'test-tenant-2';

  beforeAll(async () => {
    // Create test tenants
    await db.insert(tenants).values([
      { id: tenant1Id, name: 'Tenant 1', slug: 'tenant-1' },
      { id: tenant2Id, name: 'Tenant 2', slug: 'tenant-2' },
    ]);
  });

  afterAll(async () => {
    // Clean up
    await db.delete(leads).where(eq(leads.tenantId, tenant1Id));
    await db.delete(leads).where(eq(leads.tenantId, tenant2Id));
    await db.delete(campaigns).where(eq(campaigns.tenantId, tenant1Id));
    await db.delete(campaigns).where(eq(campaigns.tenantId, tenant2Id));
    await db.delete(tenants).where(eq(tenants.id, tenant1Id));
    await db.delete(tenants).where(eq(tenants.id, tenant2Id));
  });

  it('should isolate campaigns by tenant', async () => {
    // Create campaigns for each tenant
    await db.insert(campaigns).values([
      {
        tenantId: tenant1Id,
        campaignName: 'Tenant 1 Campaign',
        displayAs: 'inline',
        isActive: true,
        contentType: 'calculator',
      },
      {
        tenantId: tenant2Id,
        campaignName: 'Tenant 2 Campaign',
        displayAs: 'inline',
        isActive: true,
        contentType: 'form',
      },
    ]);

    // Query campaigns for tenant 1
    const tenant1Campaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.tenantId, tenant1Id));

    // Query campaigns for tenant 2
    const tenant2Campaigns = await db.select()
      .from(campaigns)
      .where(eq(campaigns.tenantId, tenant2Id));

    expect(tenant1Campaigns).toHaveLength(1);
    expect(tenant2Campaigns).toHaveLength(1);
    expect(tenant1Campaigns[0].campaignName).toBe('Tenant 1 Campaign');
    expect(tenant2Campaigns[0].campaignName).toBe('Tenant 2 Campaign');
  });

  it('should isolate leads by tenant', async () => {
    // Create leads for each tenant
    await db.insert(leads).values([
      {
        tenantId: tenant1Id,
        email: 'lead1@tenant1.com',
        source: 'test',
        pageUrl: '/test',
      },
      {
        tenantId: tenant2Id,
        email: 'lead2@tenant2.com',
        source: 'test',
        pageUrl: '/test',
      },
    ]);

    // Query leads for tenant 1
    const tenant1Leads = await db.select()
      .from(leads)
      .where(eq(leads.tenantId, tenant1Id));

    // Query leads for tenant 2
    const tenant2Leads = await db.select()
      .from(leads)
      .where(eq(leads.tenantId, tenant2Id));

    expect(tenant1Leads).toHaveLength(1);
    expect(tenant2Leads).toHaveLength(1);
    expect(tenant1Leads[0].email).toBe('lead1@tenant1.com');
    expect(tenant2Leads[0].email).toBe('lead2@tenant2.com');
  });

  it('should prevent cross-tenant data access', async () => {
    // Verify no tenant 2 data appears in tenant 1 queries
    const tenant1AllLeads = await db.select()
      .from(leads)
      .where(eq(leads.tenantId, tenant1Id));

    const hasTenant2Data = tenant1AllLeads.some(
      lead => lead.email === 'lead2@tenant2.com'
    );

    expect(hasTenant2Data).toBe(false);
  });
});
