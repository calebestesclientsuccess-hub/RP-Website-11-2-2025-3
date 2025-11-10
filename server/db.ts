import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "pg";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a separate pg.Pool for Drizzle
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

// Create a separate pg.Pool for session storage
// connect-pg-simple requires a node-postgres Pool, not a Drizzle client
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});