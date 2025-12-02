import type { Express } from "express";
import { db } from "../db";
import { projectLayer2Sections, mediaLibrary, insertProjectLayer2SectionSchema } from "@shared/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { migrateProjectToLayer2, needsLayer2Migration } from "../lib/migrate-layer2-sections";

export function registerProjectLayer2SectionRoutes(app: Express) {
  // Helper to check if table exists
  const checkTableExists = async (): Promise<boolean> => {
    try {
      await db.execute(sql`SELECT 1 FROM project_layer2_sections LIMIT 1`);
      return true;
    } catch (error: any) {
      return false;
    }
  };
  /**
   * GET /api/projects/:id/layer2-sections
   * Fetch all Layer 2 sections for a project (ordered by orderIndex)
   * Auto-migrates legacy content on first access if needed
   */
  app.get("/api/projects/:id/layer2-sections", async (req, res) => {
    try {
      const projectId = req.params.id;

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.json([]);
      }

      // Check if migration is needed and perform it
      const needsMigration = await needsLayer2Migration(projectId);
      if (needsMigration) {
        await migrateProjectToLayer2(projectId);
      }

      // Fetch sections ordered by orderIndex
      const sections = await db.query.projectLayer2Sections.findMany({
        where: eq(projectLayer2Sections.projectId, projectId),
        orderBy: [asc(projectLayer2Sections.orderIndex)],
      });

      // Resolve Media Library URLs for sections with mediaId references
      const sectionsWithResolvedMedia = await Promise.all(
        sections.map(async (section) => {
          if (!section.mediaConfig) {
            return section;
          }

          const config = section.mediaConfig as any;

          // Resolve single media
          if (config.mediaId && !config.url) {
            const media = await db.query.mediaLibrary.findFirst({
              where: eq(mediaLibrary.id, config.mediaId),
            });
            if (media) {
              config.url = media.cloudinaryUrl;
            }
          }

          // Resolve carousel items
          if (config.items && Array.isArray(config.items)) {
            config.items = await Promise.all(
              config.items.map(async (item: any) => {
                if (item.mediaId && !item.url) {
                  const media = await db.query.mediaLibrary.findFirst({
                    where: eq(mediaLibrary.id, item.mediaId),
                  });
                  if (media) {
                    item.url = media.cloudinaryUrl;
                  }
                }
                return item;
              })
            );
          }

          return { ...section, mediaConfig: config };
        })
      );

      res.json(sectionsWithResolvedMedia);
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to fetch sections:", error);
      res.status(500).json({ error: "Failed to fetch sections", details: error.message });
    }
  });

  /**
   * POST /api/projects/:id/layer2-sections
   * Create a new Layer 2 section
   * Enforces max 5 sections per project
   */
  app.post("/api/projects/:id/layer2-sections", async (req, res) => {
    try {
      const projectId = req.params.id;
      console.log("[Layer 2 POST] Creating section for project:", projectId);
      console.log("[Layer 2 POST] Request body:", JSON.stringify(req.body, null, 2));

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.status(503).json({ error: "Service unavailable", details: "Database migration pending" });
      }

      // Validate request body
      console.log("[Layer 2 POST] Validating section data...");
      const validatedData = insertProjectLayer2SectionSchema.parse(req.body);
      console.log("[Layer 2 POST] Validation successful!");

      // Check section count limit (max 5)
      const existingSections = await db.query.projectLayer2Sections.findMany({
        where: eq(projectLayer2Sections.projectId, projectId),
      });

      if (existingSections.length >= 5) {
        return res.status(400).json({ 
          error: "Maximum section limit reached", 
          details: "Projects can have a maximum of 5 Layer 2 sections" 
        });
      }

      // Resolve Media Library URL if mediaId is provided
      let mediaConfig = validatedData.mediaConfig || {};
      if ((mediaConfig as any).mediaId && !(mediaConfig as any).url) {
        const media = await db.query.mediaLibrary.findFirst({
          where: eq(mediaLibrary.id, (mediaConfig as any).mediaId),
        });
        if (media) {
          (mediaConfig as any).url = media.cloudinaryUrl;
        }
      }

      // Resolve carousel items
      if ((mediaConfig as any).items && Array.isArray((mediaConfig as any).items)) {
        (mediaConfig as any).items = await Promise.all(
          (mediaConfig as any).items.map(async (item: any) => {
            if (item.mediaId && !item.url) {
              const media = await db.query.mediaLibrary.findFirst({
                where: eq(mediaLibrary.id, item.mediaId),
              });
              if (media) {
                item.url = media.cloudinaryUrl;
              }
            }
            return item;
          })
        );
      }

      // Insert section
      console.log("[Layer 2 POST] Inserting section with mediaType:", validatedData.mediaType);
      const [newSection] = await db.insert(projectLayer2Sections).values({
        projectId,
        heading: validatedData.heading,
        body: validatedData.body,
        orderIndex: validatedData.orderIndex,
        mediaType: validatedData.mediaType || "none",
        mediaConfig,
      }).returning();

      console.log("[Layer 2 POST] Section created successfully! ID:", newSection.id);
      res.status(201).json(newSection);
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to create section:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      }

      res.status(500).json({ error: "Failed to create section", details: error.message });
    }
  });

  /**
   * PATCH /api/projects/:id/layer2-sections/:sectionId
   * Update an existing Layer 2 section
   */
  app.patch("/api/projects/:id/layer2-sections/:sectionId", async (req, res) => {
    try {
      const { id: projectId, sectionId } = req.params;

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.status(503).json({ error: "Service unavailable", details: "Database migration pending" });
      }

      // Validate request body (allow partial updates)
      const validatedData = insertProjectLayer2SectionSchema.partial().parse(req.body);

      // Resolve Media Library URLs if needed
      if (validatedData.mediaConfig) {
        const mediaConfig = validatedData.mediaConfig as any;

        // Single media
        if (mediaConfig.mediaId && !mediaConfig.url) {
          const media = await db.query.mediaLibrary.findFirst({
            where: eq(mediaLibrary.id, mediaConfig.mediaId),
          });
          if (media) {
            mediaConfig.url = media.cloudinaryUrl;
          }
        }

        // Carousel items
        if (mediaConfig.items && Array.isArray(mediaConfig.items)) {
          mediaConfig.items = await Promise.all(
            mediaConfig.items.map(async (item: any) => {
              if (item.mediaId && !item.url) {
                const media = await db.query.mediaLibrary.findFirst({
                  where: eq(mediaLibrary.id, item.mediaId),
                });
                if (media) {
                  item.url = media.cloudinaryUrl;
                }
              }
              return item;
            })
          );
        }
      }

      // Update section
      const [updatedSection] = await db
        .update(projectLayer2Sections)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectLayer2Sections.id, sectionId),
            eq(projectLayer2Sections.projectId, projectId)
          )
        )
        .returning();

      if (!updatedSection) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.json(updatedSection);
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to update section:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      }

      res.status(500).json({ error: "Failed to update section", details: error.message });
    }
  });

  /**
   * DELETE /api/projects/:id/layer2-sections/:sectionId
   * Delete a Layer 2 section
   * Enforces min 3 sections per project (unless ?force=true for bulk operations)
   */
  app.delete("/api/projects/:id/layer2-sections/:sectionId", async (req, res) => {
    try {
      const { id: projectId, sectionId } = req.params;
      const force = req.query.force === "true";

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.status(503).json({ error: "Service unavailable", details: "Database migration pending" });
      }

      // Check section count limit (min 3) - skip if force flag is set
      if (!force) {
        const existingSections = await db.query.projectLayer2Sections.findMany({
          where: eq(projectLayer2Sections.projectId, projectId),
        });

        if (existingSections.length <= 3) {
          return res.status(400).json({ 
            error: "Minimum section limit", 
            details: "Projects must have at least 3 Layer 2 sections" 
          });
        }
      }

      // Delete section
      const [deletedSection] = await db
        .delete(projectLayer2Sections)
        .where(
          and(
            eq(projectLayer2Sections.id, sectionId),
            eq(projectLayer2Sections.projectId, projectId)
          )
        )
        .returning();

      if (!deletedSection) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.json({ message: "Section deleted successfully", section: deletedSection });
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to delete section:", error);
      res.status(500).json({ error: "Failed to delete section", details: error.message });
    }
  });

  /**
   * PUT /api/projects/:id/layer2-sections
   * Atomically replace all Layer 2 sections for a project
   * Request body: { sections: [{ heading, body, orderIndex, mediaType, mediaConfig }] }
   */
  app.put("/api/projects/:id/layer2-sections", async (req, res) => {
    try {
      const { id: projectId } = req.params;
      const { sections } = req.body;

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.status(503).json({ error: "Service unavailable", details: "Database migration pending" });
      }

      // Validate section count (3-5)
      if (!sections || !Array.isArray(sections) || sections.length < 3 || sections.length > 5) {
        return res.status(400).json({ error: "Must provide 3-5 sections" });
      }

      // Transaction: delete all existing, insert all new
      await db.transaction(async (tx) => {
        // Delete all existing sections for this project
        await tx.delete(projectLayer2Sections)
          .where(eq(projectLayer2Sections.projectId, projectId));

        // Insert all new sections
        for (const section of sections) {
          await tx.insert(projectLayer2Sections).values({
            id: crypto.randomUUID(),
            projectId,
            heading: section.heading,
            body: section.body,
            orderIndex: section.orderIndex,
            mediaType: section.mediaType || "none",
            mediaConfig: section.mediaConfig || {},
          });
        }
      });

      // Return fresh list
      const newSections = await db.query.projectLayer2Sections.findMany({
        where: eq(projectLayer2Sections.projectId, projectId),
        orderBy: [asc(projectLayer2Sections.orderIndex)],
      });

      res.json(newSections);
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to bulk replace sections:", error);
      res.status(500).json({ error: "Failed to replace sections", details: error.message });
    }
  });

  /**
   * POST /api/projects/:id/layer2-sections/reorder
   * Bulk reorder sections
   * Request body: { sections: [{ id, orderIndex }] }
   */
  app.post("/api/projects/:id/layer2-sections/reorder", async (req, res) => {
    try {
      const projectId = req.params.id;
      const { sections } = req.body;

      // Check if table exists
      const tableExists = await checkTableExists();
      if (!tableExists) {
        console.warn('[Layer 2] Table does not exist yet. Run migration with: npx drizzle-kit push');
        return res.status(503).json({ error: "Service unavailable", details: "Database migration pending" });
      }

      if (!Array.isArray(sections)) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: "sections must be an array" 
        });
      }

      // Update all sections in a transaction-like manner
      const updates = await Promise.all(
        sections.map(async ({ id, orderIndex }: { id: string; orderIndex: number }) => {
          const [updated] = await db
            .update(projectLayer2Sections)
            .set({ orderIndex, updatedAt: new Date() })
            .where(
              and(
                eq(projectLayer2Sections.id, id),
                eq(projectLayer2Sections.projectId, projectId)
              )
            )
            .returning();
          return updated;
        })
      );

      res.json({ message: "Sections reordered successfully", sections: updates });
    } catch (error: any) {
      console.error("[Layer 2 Sections] Failed to reorder sections:", error);
      res.status(500).json({ error: "Failed to reorder sections", details: error.message });
    }
  });
}

