import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, text, jsonb } from 'drizzle-orm/pg-core';

export const up = async (db) => {
    await db.run(sql`
    CREATE TABLE IF NOT EXISTS brand_settings (
      id SERIAL PRIMARY KEY,
      tenant_id VARCHAR(36) NOT NULL,
      logo_url TEXT,
      colors JSONB,
      component_library VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down = async (db) => {
    await db.run(sql`DROP TABLE IF EXISTS brand_settings;`);
};
