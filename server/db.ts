import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Production-grade connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'test' ? 10 : 20, // Smaller pool for tests
  min: process.env.NODE_ENV === 'test' ? 2 : 5,  // Fewer idle connections in tests
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Connection timeout
  maxUses: 7500, // Recycle connections after 7500 uses
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  process.exit(0);
});

import * as schema from "@shared/schema";

export const db = drizzle(pool, { schema });

// Export pool for session management
export const sessionPool = pool;