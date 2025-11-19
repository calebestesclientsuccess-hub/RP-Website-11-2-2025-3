import { sql } from 'drizzle-orm';

export const up = async (db) => {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS layout_drafts (
      id SERIAL PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      draft_json JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (db) => {
    await db.run(sql`DROP TABLE IF EXISTS layout_drafts;`);
};
