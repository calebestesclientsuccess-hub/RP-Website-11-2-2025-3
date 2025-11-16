
import { beforeAll, afterAll } from 'vitest';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

beforeAll(async () => {
  // Create test database schema
  console.log('Setting up test database...');
  
  // Run migrations if needed
  // await migrate(db, { migrationsFolder: './migrations' });
});

afterAll(async () => {
  // Clean up test database
  console.log('Cleaning up test database...');
  
  // Close database connection
  // await db.$client.end();
});

// Global test utilities
global.testUtils = {
  async cleanDatabase() {
    // Clean all tables except migrations
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'drizzle_migrations')
        LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
  },
};
