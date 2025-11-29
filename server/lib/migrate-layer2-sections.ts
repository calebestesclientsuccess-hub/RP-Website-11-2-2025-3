import { db } from "../db";
import { projects, projectLayer2Sections } from "@shared/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

/**
 * Auto-migration function to convert legacy Challenge/Solution/Outcome fields
 * to the new flexible Layer 2 sections format.
 * 
 * This runs automatically on first fetch of Layer 2 sections if:
 * 1. No Layer 2 sections exist for the project
 * 2. At least one legacy field (challengeText, solutionText, outcomeText) has content
 */
export async function migrateProjectToLayer2(projectId: string): Promise<boolean> {
  try {
    // Check if table exists first
    try {
      await db.execute(sql`SELECT 1 FROM project_layer2_sections LIMIT 1`);
    } catch (error: any) {
      console.warn('[Layer 2 Migration] Table does not exist yet. Skipping migration.');
      return false;
    }

    // Check if Layer 2 sections already exist
    const existingSections = await db.query.projectLayer2Sections.findMany({
      where: eq(projectLayer2Sections.projectId, projectId),
    });

    if (existingSections.length > 0) {
      return false; // Already migrated
    }

    // Fetch project with legacy fields
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: {
        id: true,
        challengeText: true,
        solutionText: true,
        outcomeText: true,
      },
    });

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Build sections array from legacy fields
    const legacySections: Array<{
      heading: string;
      body: string;
      orderIndex: number;
    }> = [];

    if (project.challengeText && project.challengeText.trim()) {
      legacySections.push({
        heading: "The Challenge",
        body: project.challengeText,
        orderIndex: 0,
      });
    }

    if (project.solutionText && project.solutionText.trim()) {
      legacySections.push({
        heading: "Our Solution",
        body: project.solutionText,
        orderIndex: legacySections.length,
      });
    }

    if (project.outcomeText && project.outcomeText.trim()) {
      legacySections.push({
        heading: "The Outcome",
        body: project.outcomeText,
        orderIndex: legacySections.length,
      });
    }

    // Only migrate if we have content
    if (legacySections.length === 0) {
      return false; // Nothing to migrate
    }

    // Insert new Layer 2 sections
    await db.insert(projectLayer2Sections).values(
      legacySections.map((section) => ({
        projectId,
        heading: section.heading,
        body: section.body,
        orderIndex: section.orderIndex,
        mediaType: "none" as const,
        mediaConfig: {},
      }))
    );

    console.log(
      `[Layer 2 Migration] Successfully migrated ${legacySections.length} sections for project ${projectId}`
    );

    return true;
  } catch (error) {
    console.error(`[Layer 2 Migration] Failed to migrate project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Check if a project needs migration (has legacy content but no Layer 2 sections)
 */
export async function needsLayer2Migration(projectId: string): Promise<boolean> {
  try {
    // Check if table exists first
    try {
      await db.execute(sql`SELECT 1 FROM project_layer2_sections LIMIT 1`);
    } catch (error: any) {
      return false; // Table doesn't exist, can't migrate yet
    }

    const existingSections = await db.query.projectLayer2Sections.findMany({
      where: eq(projectLayer2Sections.projectId, projectId),
      limit: 1,
    });

    if (existingSections.length > 0) {
      return false; // Already has Layer 2 sections
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      columns: {
        challengeText: true,
        solutionText: true,
        outcomeText: true,
      },
    });

    if (!project) {
      return false;
    }

    // Needs migration if any legacy field has content
    return Boolean(
      (project.challengeText && project.challengeText.trim()) ||
      (project.solutionText && project.solutionText.trim()) ||
      (project.outcomeText && project.outcomeText.trim())
    );
  } catch (error) {
    console.error(`[Layer 2 Migration] Failed to check migration status for project ${projectId}:`, error);
    return false;
  }
}

