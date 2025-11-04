import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "pg";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
});

// Create a separate pg.Pool for session storage
// connect-pg-simple requires a node-postgres Pool, not a Drizzle client
export const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
