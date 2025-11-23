import { sql } from "drizzle-orm";

export const up = async (db) => {
  await db.run(sql`
    ALTER TABLE seo_issues
    ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(255) REFERENCES users(id);
  `);
};

export const down = async (db) => {
  await db.run(sql`
    ALTER TABLE seo_issues
    DROP COLUMN IF EXISTS resolved_by;
  `);
};


