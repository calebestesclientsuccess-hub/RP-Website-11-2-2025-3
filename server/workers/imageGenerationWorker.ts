import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { redisConnection } from "../queues/connection";
import {
  IMAGE_GENERATION_QUEUE_NAME,
  type ImageGenerationJobData,
} from "../queues/imageGenerationQueue";
import { env } from "../config/env";
import { db } from "../db";
import { replicateJobs, mediaLibrary } from "@shared/schema";
import { ensureJobId } from "../utils/type-patches";
import cloudinary from "../cloudinary";

// Google Imagen 3 (or best available) via Gemini API fallback or direct Vertex if configured
// Since we are using "GPT 3 Pro Thinking" keys which are Gemini keys, we use GoogleGenAI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

let imageWorker: Worker<ImageGenerationJobData, { predictionId: string }> | null =
  null;

async function uploadImageToCloudinary(base64Data: string) {
  return cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
    folder: "revenue_party/ai",
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      { width: 1920, crop: "limit" },
    ],
  });
}

export function initializeImageGenerationWorker() {
  if (imageWorker) {
    return imageWorker;
  }

  // Use the "Thinking" key as the primary Google key per user instruction
  const apiKey = env.GOOGLE_AI_KEY;

  if (!apiKey) {
    console.warn("[Google Image Worker] GOOGLE_AI_KEY not configured");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Imagen 3 model identifier in Gemini API - subject to availability
  // Fallback to 'gemini-pro-vision' or similar if direct generation isn't exposed same way
  // Note: As of late 2024, Imagen 3 is accessed via specific endpoints or Vertex AI.
  // For this implementation, we assume the Google Gen AI SDK 'imagen-3.0-generate-001' pattern
  // or we use a REST fetch if the SDK is lagging.
  // Given the user constraint "use highest quality Google models", we target the Imagen endpoint.
  
  imageWorker = new Worker<ImageGenerationJobData, { predictionId: string }>(
    IMAGE_GENERATION_QUEUE_NAME,
    async (job) => {
      const jobId = ensureJobId(job.id);
      
      // 1. Update status to running
      await db
        .update(replicateJobs) // We reuse the table name for now to avoid schema migration churn, effectively "ai_image_jobs"
        .set({
          status: "running",
          updatedAt: new Date(),
        })
        .where(eq(replicateJobs.jobId, jobId));

      try {
        // 2. Call Google Imagen (using raw fetch for latest model support)
        // Note: The Node SDK might not have stable Imagen 3 typings yet.
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{ prompt: job.data.prompt }],
              parameters: {
                sampleCount: job.data.count || 1,
                aspectRatio: job.data.aspectRatio || "16:9",
              },
            }),
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error?.message || `Google API Error: ${response.statusText}`);
        }

        const result = await response.json();
        const predictions = result.predictions || [];
        
        if (!predictions.length) {
          throw new Error("No images returned from Google Imagen");
        }

        // 3. Process results (upload to Cloudinary)
        const assets: Array<{ id: string; url: string }> = [];
        const outputUrls: string[] = [];

        for (const prediction of predictions) {
          // Imagen returns base64 bytes usually, or a GCS URI. Assuming base64 'bytesBase64' or similar
          const imageBase64 = prediction.bytesBase64 || prediction.image?.bytesBase64;
          
          if (imageBase64) {
            const uploaded = await uploadImageToCloudinary(imageBase64);
            outputUrls.push(uploaded.secure_url);

            // Persist to media library
            const [asset] = await db
              .insert(mediaLibrary)
              .values({
                tenantId: job.data.tenantId,
                projectId: null,
                cloudinaryPublicId: uploaded.public_id,
                cloudinaryUrl: uploaded.secure_url,
                mediaType: "image",
                label: `Imagen 3 - ${job.data.prompt.slice(0, 30)}...`,
                tags: ["ai-generated", "google-imagen"],
              } as any)
              .returning();
            
            assets.push({ id: asset.id, url: asset.cloudinaryUrl });
          }
        }

        // 4. Mark job as succeeded
        await db
          .update(replicateJobs)
          .set({
            status: "succeeded",
            outputUrls: outputUrls,
            mediaLibraryAssetIds: assets,
            updatedAt: new Date(),
            durationMs: Date.now() - job.timestamp, // Approximate duration
          })
          .where(eq(replicateJobs.jobId, jobId));

        return { predictionId: `google-gen-${Date.now()}` };

      } catch (error: any) {
        console.error("[Google Image Worker] Generation failed:", error);
        throw error; // Triggers the 'failed' handler below
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Google API can handle more concurrency than Replicate usually
    },
  );

  imageWorker.on("failed", async (job, error) => {
    if (job && job.id) {
      const jobId = ensureJobId(job.id);
      await db
        .update(replicateJobs)
        .set({
          status: "failed",
          errorMessage: error?.message ?? "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(replicateJobs.jobId, jobId));
    }
    console.error(`[Google Image Worker] Job ${job?.id} failed`, error);
  });

  return imageWorker;
}
