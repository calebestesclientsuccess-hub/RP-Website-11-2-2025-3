
import { describe, it, expect, beforeAll } from 'vitest';
import { getTestDb } from '../helpers/db';
import { tenants, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

describe('Transaction Isolation', () => {
  const testTenantId = 'isolation-test-tenant';

  it('should isolate test data within transaction', async () => {
    const db = getTestDb();
    
    // Create tenant in this test's transaction
    await db.insert(tenants).values({
      id: testTenantId,
      name: 'Isolation Test',
      slug: 'isolation-test',
    });

    // Verify it exists in this transaction
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, testTenantId));
    expect(tenant).toBeDefined();
    expect(tenant.name).toBe('Isolation Test');
  });

  it('should not see data from previous test', async () => {
    const db = getTestDb();
    
    // This should NOT find the tenant from the previous test
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, testTenantId));
    expect(tenant).toBeUndefined();
  });

  it('should handle concurrent operations', async () => {
    const db = getTestDb();
    
    // Create multiple records concurrently
    const promises = Array.from({ length: 5 }, (_, i) =>
      db.insert(tenants).values({
        id: `concurrent-${i}`,
        name: `Concurrent ${i}`,
        slug: `concurrent-${i}`,
      })
    );

    await Promise.all(promises);

    // Verify all were created
    const results = await db.select().from(tenants);
    expect(results.length).toBeGreaterThanOrEqual(5);
  });
});
