import { sql } from 'drizzle-orm';

export const up = async (db) => {
  await db.run(sql`
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS brand_logo_url TEXT,
      ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS component_library TEXT DEFAULT 'shadcn',
      ADD COLUMN IF NOT EXISTS asset_plan JSONB DEFAULT '[]'::jsonb;
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS project_section_plans (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      section_key TEXT NOT NULL,
      label TEXT,
      feature_type TEXT NOT NULL,
      feature_config JSONB DEFAULT '{}'::jsonb,
      order_index INTEGER NOT NULL DEFAULT 0,
      enable_per_section_prompt BOOLEAN NOT NULL DEFAULT false,
      prompt TEXT,
      selected_assets JSONB DEFAULT '[]'::jsonb,
      metrics JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(project_id, section_key)
    );
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS portfolio_pipeline_runs (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      stages JSONB NOT NULL DEFAULT '[]'::jsonb,
      current_stage_index INTEGER DEFAULT 0,
      total_stages INTEGER DEFAULT 6,
      latest_version_number INTEGER,
      started_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_project_section_plans_project
      ON project_section_plans(project_id);
  `);

  await db.run(sql`
    CREATE INDEX IF NOT EXISTS idx_pipeline_runs_project
      ON portfolio_pipeline_runs(project_id);
  `);

  await db.run(sql`
    ALTER TABLE portfolio_versions
      ADD COLUMN IF NOT EXISTS stage_key TEXT,
      ADD COLUMN IF NOT EXISTS pipeline_run_id VARCHAR(36) REFERENCES portfolio_pipeline_runs(id) ON DELETE SET NULL;
  `);
};

export const down = async (db) => {
  await db.run(sql`
    ALTER TABLE portfolio_versions
      DROP COLUMN IF EXISTS pipeline_run_id,
      DROP COLUMN IF EXISTS stage_key;
  `);

  await db.run(sql`DROP TABLE IF EXISTS portfolio_pipeline_runs;`);
  await db.run(sql`DROP TABLE IF EXISTS project_section_plans;`);

  await db.run(sql`
    ALTER TABLE projects
      DROP COLUMN IF EXISTS asset_plan,
      DROP COLUMN IF EXISTS component_library,
      DROP COLUMN IF EXISTS brand_colors,
      DROP COLUMN IF EXISTS brand_logo_url;
  `);
};

