import { Router, Request, Response } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";
import { env } from "../config/env";
import { textGenerationSchema, TEXT_MODEL_ID } from "../services/textGeneration";
import { textGenerationQueue } from "../queues/textGenerationQueue";
import { imageGenerationQueue } from "../queues/imageGenerationQueue";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";
import { db } from "../db";
import { aiGenerationJobs, replicateJobs, mediaLibrary } from "@shared/schema";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { sanitizeText } from "../middleware/input-sanitization";

const router = Router();

// Image Generation Schema
const imageGenSchema = z.object({
  prompt: z.string().min(1),
  aspectRatio: z.string().default("16:9"),
  stylize: z.number().min(0).max(1000).default(100),
  chaos: z.number().min(0).max(100).default(0),
  count: z.number().min(1).max(4).default(4),
});

router.post("/ai/text", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const payload = textGenerationSchema.parse(req.body);
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const job = await textGenerationQueue.add("generate", {
      tenantId,
      userId: req.session?.userId,
      payload,
    });

    await db.insert(aiGenerationJobs).values({
      jobId: job.id,
      tenantId,
      jobType: payload.type,
      provider: "google-genai",
      modelName: TEXT_MODEL_ID,
    });

    return res.status(202).json({
      jobId: job.id,
      status: "queued",
    });
  } catch (error: any) {
    console.error("AI Text Gen Enqueue Error:", error);
    res.status(500).json({ error: error?.message || "Failed to queue text generation job" });
  }
});

router.get("/ai/text/:jobId", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const job = await textGenerationQueue.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const response: Record<string, unknown> = {
      status: state,
      jobId: job.id,
    };

    if (state === "completed") {
      response.result = job.returnvalue;
    } else if (state === "failed") {
      response.error = job.failedReason;
    } else {
      response.progress = job.progress;
    }

    return res.json(response);
  } catch (error: any) {
    console.error("AI Text Job Lookup Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to fetch job status" });
  }
});

// Image Generation Endpoint (Replicate - Flux/SDXL)
router.post("/ai/image", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  if (!env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: "Replicate API token not configured" });
  }

  try {
    const { prompt, aspectRatio, stylize, count } = imageGenSchema.parse(req.body);
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const job = await imageGenerationQueue.add("generate-image", {
      tenantId,
      userId: req.session?.userId,
      prompt,
      aspectRatio,
      stylize,
      count,
    });

    await db.insert(replicateJobs).values({
      jobId: job.id,
      tenantId,
      userId: req.session?.userId ?? null,
      prompt,
      aspectRatio,
      stylize,
      count,
    });

    res.status(202).json({ jobId: job.id, status: "queued" });
  } catch (error: any) {
    console.error("AI Image Gen Error:", error);
    res.status(500).json({ error: error?.message || "Failed to queue image generation" });
  }
});

router.get("/ai/image/:jobId", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const jobRecords = await db
      .select()
      .from(replicateJobs)
      .where(eq(replicateJobs.jobId, jobId))
      .limit(1);

    const jobRecord = jobRecords[0];

    if (!jobRecord) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({
      jobId: jobRecord.jobId,
      status: jobRecord.status,
      predictionId: jobRecord.replicatePredictionId,
      outputUrls: jobRecord.outputUrls ?? [],
      assets: jobRecord.mediaLibraryAssetIds ?? [],
      error: jobRecord.errorMessage,
      durationMs: jobRecord.durationMs ?? null,
    });
  } catch (error: any) {
    console.error("AI Image Job Lookup Error:", error);
    res.status(500).json({ error: error?.message || "Failed to fetch job status" });
  }
});

const saveImageSchema = z.object({
  assetId: z.string().min(1),
  label: z.string().max(120).optional(),
  projectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

router.post("/ai/image/:jobId/save", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { assetId, label, projectId, tags } = saveImageSchema.parse(req.body);
    const jobId = req.params.jobId;
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;

    const jobRecords = await db
      .select()
      .from(replicateJobs)
      .where(and(eq(replicateJobs.jobId, jobId), eq(replicateJobs.tenantId, tenantId)))
      .limit(1);

    const jobRecord = jobRecords[0];
    if (!jobRecord) {
      return res.status(404).json({ error: "Job not found" });
    }

    const assets: Array<{ id?: string; url: string }> = jobRecord.mediaLibraryAssetIds ?? [];
    const matchingAsset = assets.find((asset) => asset.id === assetId);
    if (!matchingAsset) {
      return res.status(400).json({ error: "Asset does not belong to this job" });
    }

    const sanitizedLabel = label ? sanitizeText(label) : undefined;
    const sanitizedTags = tags?.map((tag) => sanitizeText(tag)).filter(Boolean) ?? [];

    const [updatedAsset] = await db
      .update(mediaLibrary)
      .set({
        projectId: projectId ?? null,
        label: sanitizedLabel || matchingAsset.url.split("/").pop() || "AI Image",
        tags: sanitizedTags,
      })
      .where(and(eq(mediaLibrary.id, assetId), eq(mediaLibrary.tenantId, tenantId)))
      .returning();

    return res.json({
      asset: updatedAsset,
      message: "Image saved to media library",
    });
  } catch (error: any) {
    console.error("AI Image Save Error:", error);
    res.status(500).json({ error: error?.message || "Failed to save image" });
  }
});

router.get("/ai/image/metrics", requireAuth, async (req: Request, res: Response) => {
  try {
    const tenantId = req.tenantId || DEFAULT_TENANT_ID;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const summary = await db
      .select({
        total: sql<number>`count(*)`,
        succeeded: sql<number>`sum(case when status = 'succeeded' then 1 else 0 end)`,
        failed: sql<number>`sum(case when status = 'failed' then 1 else 0 end)`,
      })
      .from(replicateJobs)
      .where(and(eq(replicateJobs.tenantId, tenantId), gt(replicateJobs.createdAt, since)));

    const avgDuration = await db
      .select({
        avgMs: sql<number | null>`avg(duration_ms)`,
      })
      .from(replicateJobs)
      .where(and(eq(replicateJobs.tenantId, tenantId), gt(replicateJobs.durationMs, 0)));

    const distribution = await db
      .select({
        status: replicateJobs.status,
        count: sql<number>`count(*)`,
      })
      .from(replicateJobs)
      .where(and(eq(replicateJobs.tenantId, tenantId), gt(replicateJobs.createdAt, since)))
      .groupBy(replicateJobs.status);

    const recentJobs = await db
      .select({
        jobId: replicateJobs.jobId,
        status: replicateJobs.status,
        createdAt: replicateJobs.createdAt,
        durationMs: replicateJobs.durationMs,
        count: replicateJobs.count,
      })
      .from(replicateJobs)
      .where(eq(replicateJobs.tenantId, tenantId))
      .orderBy(desc(replicateJobs.createdAt))
      .limit(5);

    res.json({
      totalJobs: summary[0]?.total ?? 0,
      succeeded: summary[0]?.succeeded ?? 0,
      failed: summary[0]?.failed ?? 0,
      averageDurationMs: avgDuration[0]?.avgMs ?? null,
      statusDistribution: distribution,
      recentJobs,
    });
  } catch (error: any) {
    console.error("AI Image Metrics Error:", error);
    res.status(500).json({ error: error?.message || "Failed to load metrics" });
  }
});

export default router;

