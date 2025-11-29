import { sql } from "drizzle-orm";
import type { Migration } from "drizzle-orm/migrator";

export const migration: Migration = {
  up: async (db) => {
    await db.execute(sql`
      ALTER TABLE "project_layer2_sections" 
      ADD COLUMN IF NOT EXISTS "style_config" jsonb DEFAULT '{}'::jsonb;
    `);
  },

  down: async (db) => {
    await db.execute(sql`
      ALTER TABLE "project_layer2_sections" 
      DROP COLUMN IF EXISTS "style_config";
    `);
  },
};

