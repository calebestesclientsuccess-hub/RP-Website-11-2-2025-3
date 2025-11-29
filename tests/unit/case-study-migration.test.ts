import { describe, it, expect } from "vitest";
import { sql, eq } from "drizzle-orm";

import { db } from "../../server/db";
import { projects } from "@shared/schema";

describe("Case Study migration & ORM exposure", () => {
  it("adds case_study_content column with GIN index", async () => {
    const columnResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'case_study_content'
    `);

    expect(columnResult.rows.length).toBe(1);

    const indexResult = await db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'projects' AND indexname = 'idx_projects_case_study_content'
    `);

    expect(indexResult.rows.length).toBe(1);
  });

  it("persists and retrieves caseStudyContent via Drizzle model", async () => {
    const tenantId = "migration-test-tenant";
    await global.testUtils.createTestTenant(tenantId);

    const [project] = await db
      .insert(projects)
      .values({
        tenantId,
        slug: `migration-${Date.now()}`,
        title: "Migration Verification",
        caseStudyContent: { sections: [] },
      })
      .returning();

    const stored = await db.query.projects.findFirst({
      where: eq(projects.id, project.id),
    });

    expect(stored?.caseStudyContent?.sections).toEqual([]);
  });
});

