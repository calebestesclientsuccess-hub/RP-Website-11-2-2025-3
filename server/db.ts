import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a singleton pg.Pool for Drizzle with optimized connection settings
// Reduced pool sizes to prevent connection exhaustion (Phase 1.2 optimization)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool (reduced from 20)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return error if connection takes longer than 5 seconds (increased for operations with tenant checks)
});

export const db = drizzle(pool, { schema });

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Add connection health logging (reduced verbosity)
let connectionCount = 0;
pool.on('connect', () => {
  connectionCount++;
});

pool.on('remove', () => {
  connectionCount--;
});

// Log pool health periodically (every 5 minutes)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    console.log(`[DB Pool Health] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
  }, 5 * 60 * 1000);
}

// Create a separate pg.Pool for session storage with optimized settings
// connect-pg-simple requires a node-postgres Pool, not a Drizzle client
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Fewer connections needed for sessions (reduced from 10)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s for session table initialization
});