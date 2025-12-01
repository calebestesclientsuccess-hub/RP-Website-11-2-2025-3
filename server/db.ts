import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { env } from "./config/env";
import { logger } from "./lib/logger";

// Configure Neon for HTTP mode (no WebSocket needed)
// This works on Vercel serverless without the ws package
neonConfig.fetchConnectionCache = true;

const connectionString =
  env.NODE_ENV === "test" && env.TEST_DATABASE_URL
    ? env.TEST_DATABASE_URL
    : env.DATABASE_URL;

if (env.NODE_ENV === "test" && !env.TEST_DATABASE_URL) {
  logger.warn(
    "TEST_DATABASE_URL is not set; falling back to DATABASE_URL. Tests may mutate production data.",
    { module: "db" }
  );
}

// Mock pool for fallback
const mockPool = {
  connect: () => Promise.reject(new Error("Mock pool: Database connection failed during initialization")),
  query: () => Promise.reject(new Error("Mock pool: Database connection failed during initialization")),
  end: () => Promise.resolve(),
  on: () => {},
} as unknown as Pool;

// Production-grade connection pool configuration
let pool: Pool;
try {
  pool = new Pool({
    connectionString,
    max: env.NODE_ENV === "test" ? 10 : 20, // Smaller pool for tests
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Connection timeout
  });

  // Handle pool errors
  pool.on('error', (err) => {
    logger.fatal('Unexpected database pool error', { module: 'db' }, err);
  });
} catch (err) {
  console.error("[db] CRITICAL: Failed to initialize database pool:", err);
  pool = mockPool;
}

// Graceful shutdown
if (process.on) {
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing database pool', { module: 'db' });
    if (pool && pool !== mockPool) await pool.end();
    process.exit(0);
  });
}

import * as schema from "@shared/schema";

let dbInstance;
try {
  dbInstance = drizzle(pool, { schema });
} catch (err) {
  console.error("[db] CRITICAL: Failed to initialize drizzle:", err);
  dbInstance = {} as any; 
}

export const db = dbInstance;

// Export pool for session management
export const sessionPool = pool;