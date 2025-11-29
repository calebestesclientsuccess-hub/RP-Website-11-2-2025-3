// Import mocks first to ensure they're registered before any other imports
import './setup-mocks';

import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';

// Ensure critical env vars exist before any optional imports
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  'postgresql://placeholder:test@localhost:5432/test';
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || 'test-session-secret-change-me';
process.env.REDIS_URL =
  process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const skipDbTests = process.env.SKIP_DB_TESTS === 'true';

if (!process.env.DATABASE_URL?.includes('test') && !skipDbTests) {
  console.warn('⚠️  Warning: Not using a dedicated test database!');
  console.warn('💡 Tip: Set TEST_DATABASE_URL in your environment to use a separate test database');
}

// Disable console logs during tests (optional, can be enabled with VERBOSE_TESTS=true)
if (!process.env.VERBOSE_TESTS) {
  console.log = () => {};
  console.debug = () => {};
}

// Global test utilities
declare global {
  var testUtils: {
    cleanDatabase: () => Promise<void>;
    createTestTenant: (id?: string) => Promise<any>;
  };
  var testDb: any; // Expose the transaction to global scope for tests
}

if (skipDbTests) {
  beforeEach(() => {});
  afterEach(() => {});
  afterAll(() => {});

  global.testUtils = {
    async cleanDatabase() {},
    async createTestTenant(id: string = 'test-tenant') {
      return { id, name: 'Test Tenant', slug: id };
    },
  };
} else {
  const { db } = await import('../server/db');
  const { sql } = await import('drizzle-orm');

  // Global transaction context for each test
  let testTransaction: any;
  let transactionPromise: Promise<void> | null = null;
  let resolveTransaction: (() => void) | null = null;

  beforeEach(async () => {
    let txResolve: () => void;
    transactionPromise = new Promise<void>((resolve) => {
      txResolve = resolve;
    });
    resolveTransaction = txResolve!;

    db.transaction(async (tx) => {
      testTransaction = tx;
      global.testDb = tx;
      await transactionPromise;
    }).catch((error) => {
      if (!error.message?.includes('rollback')) {
        console.error('Transaction error:', error);
      }
    });

    await new Promise((resolve) => setImmediate(resolve));
  });

  afterEach(async () => {
    if (resolveTransaction) {
      resolveTransaction();
    }

    if (transactionPromise) {
      await transactionPromise.catch(() => {});
    }

    testTransaction = null;
    transactionPromise = null;
    resolveTransaction = null;
    global.testDb = null;
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test database...');

    try {
      await testUtils.cleanDatabase();
      console.log('✅ Test database cleaned');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  });

  let cleanupLock: Promise<void> | null = null;

  global.testUtils = {
    async cleanDatabase() {
      if (cleanupLock) {
        await cleanupLock;
      }

      cleanupLock = (async () => {
        try {
          const tables = await db.execute(sql`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' AND tablename != 'drizzle_migrations' AND tablename != 'session'
            ORDER BY tablename
          `);

          for (const table of tables.rows) {
            try {
              await db.execute(sql.raw(`TRUNCATE TABLE ${table.tablename} RESTART IDENTITY CASCADE`));
            } catch (err: any) {
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
        const [tenant] = await db
          .insert(tenants)
          .values({
            id,
            name: 'Test Tenant',
            slug: id,
          })
          .returning();
        return tenant;
      } catch (error) {
        console.error('Failed to create test tenant:', error);
        throw error;
      }
    },
  };
}