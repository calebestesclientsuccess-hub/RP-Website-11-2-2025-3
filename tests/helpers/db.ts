
import { db } from '../../server/db';

/**
 * Get the database instance to use in tests.
 * Returns the transaction-scoped instance if available,
 * otherwise falls back to the global instance.
 */
export function getTestDb() {
  return global.testDb || db;
}

/**
 * Type-safe wrapper for test database operations
 */
export const testDb = new Proxy({} as typeof db, {
  get(_target, prop) {
    const dbInstance = global.testDb || db;
    return dbInstance[prop as keyof typeof db];
  },
});
