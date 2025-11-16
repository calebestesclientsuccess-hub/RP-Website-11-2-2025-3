
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

afterEach(async () => {
  // Clean database after each test to ensure isolation
  await testUtils.cleanDatabase();
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

global.testUtils = {
  async cleanDatabase() {
    try {
      await db.execute(sql`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'drizzle_migrations')
          LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
          END LOOP;
        END $$;
      `);
    } catch (error) {
      console.error('Failed to clean database:', error);
      throw error;
    }
  },
  
  async createTestTenant(id: string = 'test-tenant') {
    const { tenants } = await import('@shared/schema');
    const [tenant] = await db.insert(tenants).values({
      id,
      name: 'Test Tenant',
      slug: 'test-tenant',
    }).returning();
    return tenant;
  },
};
