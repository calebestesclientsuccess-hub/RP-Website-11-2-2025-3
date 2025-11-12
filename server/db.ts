import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a singleton pg.Pool for Drizzle with optimized connection settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error if connection takes longer than 2 seconds
});

export const db = drizzle(pool, { schema });

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Don't crash the app - just log the error
});

// Add connection retry logic
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Create a separate pg.Pool for session storage with optimized settings
// connect-pg-simple requires a node-postgres Pool, not a Drizzle client
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Fewer connections needed for sessions
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});