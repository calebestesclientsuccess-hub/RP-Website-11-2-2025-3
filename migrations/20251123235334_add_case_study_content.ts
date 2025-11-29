import { sql } from "drizzle-orm";

export const up = async (db) => {
  await db.run(
    sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study_content JSONB;`,
  );
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS idx_projects_case_study_content ON projects USING GIN (case_study_content);`,
  );
};

export const down = async (db) => {
  await db.run(
    sql`DROP INDEX IF EXISTS idx_projects_case_study_content;`,
  );
  await db.run(
    sql`ALTER TABLE projects DROP COLUMN IF EXISTS case_study_content;`,
  );
};

