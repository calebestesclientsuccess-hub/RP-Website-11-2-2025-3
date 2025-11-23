// Import mocks first to ensure they're registered before any other imports
import './setup-mocks';

import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Ensure we're using a test database
if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn('⚠️  Warning: Not using a dedicated test database!');
  console.warn('💡 Tip: Set TEST_DATABASE_URL in your environment to use a separate test database');
}

// Disable console logs during tests (optional, can be enabled with VERBOSE_TESTS=true)
if (!process.env.VERBOSE_TESTS) {
  console.log = () => {};
  console.debug = () => {};
}

// Global transaction context for each test
let testTransaction: any;
let transactionPromise: Promise<void> | null = null;
let resolveTransaction: (() => void) | null = null;

beforeEach(async () => {
  // Create a promise that we can resolve manually to end the transaction
  let txResolve: () => void;
  transactionPromise = new Promise<void>((resolve) => {
    txResolve = resolve;
  });
  resolveTransaction = txResolve!;

  // Start a transaction for test isolation
  const txPromise = db.transaction(async (tx) => {
    testTransaction = tx;
    global.testDb = tx;

    // Keep transaction open until manually resolved
    await transactionPromise;
  }).catch((error) => {
    // Ignore rollback errors - they're expected
    if (!error.message?.includes('rollback')) {
      console.error('Transaction error:', error);
    }
  });

  // Wait a tick to ensure transaction is started
  await new Promise(resolve => setImmediate(resolve));
});

afterEach(async () => {
  // Signal transaction to end
  if (resolveTransaction) {
    resolveTransaction();
  }

  // Wait for transaction cleanup
  if (transactionPromise) {
    await transactionPromise.catch(() => {});
  }

  // Clear state
  testTransaction = null;
  transactionPromise = null;
  resolveTransaction = null;
  global.testDb = null;
});

afterAll(async () => {
  console.log('🧹 Cleaning up test database...');

  try {
    // Clean all tables
    await testUtils.cleanDatabase();
    console.log('✅ Test database cleaned');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
});

// Global test utilities
declare global {
  var testUtils: {
    cleanDatabase: () => Promise<void>;
    createTestTenant: (id?: string) => Promise<any>;
  };
  var testDb: any; // Expose the transaction to global scope for tests
}

// Add a global lock to prevent parallel cleanup
let cleanupLock: Promise<void> | null = null;

global.testUtils = {
  async cleanDatabase() {
    // Wait for any ongoing cleanup to complete
    if (cleanupLock) {
      await cleanupLock;
    }

    // Create new cleanup promise
    cleanupLock = (async () => {
      try {
        // Disable parallel execution by using a serialized approach
        const tables = await db.execute(sql`
          SELECT tablename FROM pg_tables 
          WHERE schemaname = 'public' AND tablename != 'drizzle_migrations' AND tablename != 'session'
          ORDER BY tablename
        `);

        // Truncate tables one at a time to avoid deadlocks
        for (const table of tables.rows) {
          try {
            await db.execute(sql.raw(`TRUNCATE TABLE ${table.tablename} RESTART IDENTITY CASCADE`));
          } catch (err: any) {
            // Skip if table doesn't exist or is already being cleaned
            if (!err.message?.includes('does not exist')) {
              console.warn(`Warning: Could not clean table ${table.tablename}:`, err.message);
            }
          }
        }
      } catch (error) {
        console.error('Failed to clean database:', error);
        throw error;
      } finally {
        cleanupLock = null;
      }
    })();

    await cleanupLock;
  },

  async createTestTenant(id: string = 'test-tenant') {
    const { tenants } = await import('../shared/schema');
    try {
      const [tenant] = await db.insert(tenants).values({
        id,
        name: 'Test Tenant',
        slug: id,
      }).returning();
      return tenant;
    } catch (error) {
      console.error('Failed to create test tenant:', error);
      throw error;
    }
  },
};