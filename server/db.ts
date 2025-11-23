import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "./config/env";
import { logger } from "./lib/logger";

neonConfig.webSocketConstructor = ws;

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

// Production-grade connection pool configuration
const pool = new Pool({
  connectionString,
  max: env.NODE_ENV === "test" ? 10 : 20, // Smaller pool for tests
  min: env.NODE_ENV === "test" ? 2 : 5, // Fewer idle connections in tests
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Connection timeout
  maxUses: 7500, // Recycle connections after 7500 uses
});

// Handle pool errors
pool.on('error', (err) => {
  logger.fatal('Unexpected database pool error', { module: 'db' }, err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database pool', { module: 'db' });
  await pool.end();
  process.exit(0);
});

import * as schema from "@shared/schema";

export const db = drizzle(pool, { schema });

// Export pool for session management
export const sessionPool = pool;