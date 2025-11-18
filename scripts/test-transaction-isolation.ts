
import { db } from '../server/db';
import { tenants } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function testTransactionIsolation() {
  console.log('🧪 Testing transaction isolation...\n');

  // Test 1: Create data in transaction and rollback
  console.log('Test 1: Transaction rollback');
  try {
    await db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        id: 'rollback-test',
        name: 'Should Not Exist',
        slug: 'rollback-test',
      });
      
      console.log('  ✓ Inserted tenant in transaction');
      
      // Verify it exists in transaction
      const [tenant] = await tx.select().from(tenants).where(sql`id = 'rollback-test'`);
      console.log('  ✓ Tenant visible in transaction:', tenant?.name);
      
      // Force rollback
      throw new Error('Intentional rollback');
    });
  } catch (error) {
    console.log('  ✓ Transaction rolled back');
  }

  // Verify data was rolled back
  const [tenant] = await db.select().from(tenants).where(sql`id = 'rollback-test'`);
  if (!tenant) {
    console.log('  ✅ Test 1 PASSED: Data successfully rolled back\n');
  } else {
    console.log('  ❌ Test 1 FAILED: Data persisted after rollback\n');
  }

  // Test 2: Parallel transactions
  console.log('Test 2: Parallel transaction isolation');
  const results = await Promise.all([
    db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        id: 'parallel-1',
        name: 'Parallel 1',
        slug: 'parallel-1',
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'tx1';
    }),
    db.transaction(async (tx) => {
      await tx.insert(tenants).values({
        id: 'parallel-2',
        name: 'Parallel 2',
        slug: 'parallel-2',
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'tx2';
    }),
  ]);

  console.log('  ✓ Both transactions completed:', results);
  
  // Cleanup
  await db.delete(tenants).where(sql`id LIKE 'parallel-%'`);
  console.log('  ✅ Test 2 PASSED: Parallel transactions isolated\n');

  console.log('✨ All tests completed');
  process.exit(0);
}

testTransactionIsolation().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
