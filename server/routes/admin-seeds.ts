import { Router } from "express";
import { seedProductionAIPrompts } from "../../scripts/seed-production-ai-prompts";
import { seedProductionConfigs } from "../../scripts/seed-production-configs";
import { seedProductionBlogs } from "../../scripts/seed-production-blogs";
import { db } from "../db";
import { 
  blogPosts, 
  featureFlags, 
  testimonials, 
  aiPromptTemplates,
  projects,
  projectScenes,
  mediaLibrary,
} from "@shared/schema";
import { logger } from "../lib/logger";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";

const router = Router();

// All seed routes require authenticated user with tenant context
// (tenant isolation is handled by middleware)

/**
 * Seed AI Prompt Templates
 */
router.post("/ai-prompts", async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info("AI Prompts seed initiated", { 
      userId: req.user?.id,
      tenantId: req.user?.tenantId 
    });

    const result = await seedProductionAIPrompts();
    
    const duration = Date.now() - startTime;
    
    logger.info("AI Prompts seed completed", { 
      result,
      duration,
      userId: req.user?.id 
    });

    res.json({
      success: true,
      ...result,
      duration,
    });
  } catch (error: any) {
    logger.error("AI Prompts seed failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to seed AI prompts" 
    });
  }
});

/**
 * Seed System Configurations (flags, widgets, testimonials)
 */
router.post("/configs", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    logger.info("Configs seed initiated", { 
      userId: req.user?.id,
      tenantId 
    });

    const result = await seedProductionConfigs(tenantId);
    
    const duration = Date.now() - startTime;
    
    logger.info("Configs seed completed", { 
      result,
      duration,
      userId: req.user?.id 
    });

    res.json({
      success: true,
      ...result,
      duration,
    });
  } catch (error: any) {
    logger.error("Configs seed failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to seed configurations" 
    });
  }
});

/**
 * Seed Blog Posts
 */
router.post("/blogs", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    logger.info("Blogs seed initiated", { 
      userId: req.user?.id,
      tenantId 
    });

    const result = await seedProductionBlogs(tenantId);
    
    const duration = Date.now() - startTime;
    
    logger.info("Blogs seed completed", { 
      result,
      duration,
      userId: req.user?.id 
    });

    res.json({
      success: true,
      ...result,
      duration,
    });
  } catch (error: any) {
    logger.error("Blogs seed failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to seed blog posts" 
    });
  }
});

/**
 * Master Seed - Run all seeds in sequence
 */
router.post("/master", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    logger.info("Master seed initiated", { 
      userId: req.user?.id,
      tenantId 
    });

    const results: any = {};

    // Step 1: AI Prompts
    console.log("Running AI Prompts seed...");
    results.aiPrompts = await seedProductionAIPrompts();

    // Step 2: Configurations
    console.log("Running Configs seed...");
    results.configs = await seedProductionConfigs(tenantId);

    // Step 3: Blog Posts
    console.log("Running Blogs seed...");
    results.blogs = await seedProductionBlogs(tenantId);

    const duration = Date.now() - startTime;
    
    logger.info("Master seed completed", { 
      results,
      duration,
      userId: req.user?.id 
    });

    res.json({
      success: true,
      ...results,
      duration,
      message: "All seeds completed successfully"
    });
  } catch (error: any) {
    logger.error("Master seed failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || "Master seed failed" 
    });
  }
});

/**
 * Export all data as JSON backup
 */
router.get("/export", async (req, res) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    logger.info("Data export initiated", { 
      userId: req.user?.id,
      tenantId 
    });

    // Export tenant-specific data
    const [
      blogsData,
      flagsData,
      testimonialsData,
      projectsData,
      mediaData,
    ] = await Promise.all([
      db.query.blogPosts.findMany({ where: (posts, { eq }) => eq(posts.tenantId, tenantId) }),
      db.query.featureFlags.findMany({ where: (flags, { eq }) => eq(flags.tenantId, tenantId) }),
      db.query.testimonials.findMany({ where: (t, { eq }) => eq(t.tenantId, tenantId) }),
      db.query.projects.findMany({ where: (p, { eq }) => eq(p.tenantId, tenantId) }),
      db.query.mediaLibrary.findMany({ where: (m, { eq }) => eq(m.tenantId, tenantId) }),
    ]);

    // Export global data (AI prompts)
    const aiPromptsData = await db.query.aiPromptTemplates.findMany();

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      tenantId,
      data: {
        blogs: blogsData,
        featureFlags: flagsData,
        testimonials: testimonialsData,
        aiPrompts: aiPromptsData,
        projects: projectsData,
        media: mediaData,
      },
      counts: {
        blogs: blogsData.length,
        featureFlags: flagsData.length,
        testimonials: testimonialsData.length,
        aiPrompts: aiPromptsData.length,
        projects: projectsData.length,
        media: mediaData.length,
      }
    };

    logger.info("Data export completed", { 
      counts: exportData.counts,
      userId: req.user?.id 
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${tenantId}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error: any) {
    logger.error("Data export failed", { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to export data" 
    });
  }
});

export default router;

