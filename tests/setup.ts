import { beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

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

beforeAll(async () => {
  console.log('🔧 Setting up test database...');

  try {
    // Run migrations to ensure schema is up to date
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Test database migrations complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
});

let testTransaction: any;

beforeEach(async () => {
  // Start a transaction for test isolation
  testTransaction = await db.transaction(async (tx) => {
    // Return the transaction to be used in tests
    return tx;
  });
});

afterEach(async () => {
  // Rollback transaction instead of truncating
  if (testTransaction) {
    await testTransaction.rollback();
  }
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