import { sql } from "drizzle-orm";
import type { Migration } from "drizzle-orm/migrator";

export const migration: Migration = {
  up: async (db) => {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "project_layer2_sections" (
        "id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" varchar(255) NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "heading" text NOT NULL,
        "body" text NOT NULL,
        "order_index" integer NOT NULL,
        "media_type" text NOT NULL DEFAULT 'none',
        "media_config" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "project_layer2_sections_order_index_check" CHECK ("order_index" >= 0 AND "order_index" <= 4)
      );
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "project_layer2_sections_project_order_idx" 
      ON "project_layer2_sections" ("project_id", "order_index");
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "project_layer2_sections_project_id_idx" 
      ON "project_layer2_sections" ("project_id");
    `);
  },

  down: async (db) => {
    await db.execute(sql`DROP TABLE IF EXISTS "project_layer2_sections";`);
  },
};

