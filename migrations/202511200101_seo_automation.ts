import { sql } from 'drizzle-orm';

export const up = async (db) => {
  await db.run(sql`
    ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS meta_title TEXT,
      ADD COLUMN IF NOT EXISTS meta_description TEXT,
      ADD COLUMN IF NOT EXISTS canonical_url TEXT;
  `);

  await db.run(sql`
    ALTER TABLE campaigns
      ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS seo_issues (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id),
      url TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      issue_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      details TEXT,
      last_checked TIMESTAMP NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(tenant_id, issue_type, entity_id)
    );
  `);

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_seo_issues_status
      ON seo_issues(status);
  `);
};

export const down = async (db) => {
  await db.run(sql`
    DROP TABLE IF EXISTS seo_issues;
  `);

  await db.run(sql`
    ALTER TABLE campaigns
      DROP COLUMN IF EXISTS variants;
  `);

  await db.run(sql`
    ALTER TABLE blog_posts
      DROP COLUMN IF EXISTS canonical_url,
      DROP COLUMN IF EXISTS meta_description,
      DROP COLUMN IF EXISTS meta_title;
  `);
};

