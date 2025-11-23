import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { redisConnection } from "../queues/connection";
import {
  TEXT_GENERATION_QUEUE_NAME,
  type TextGenerationJobData,
  type TextGenerationJobResult,
} from "../queues/textGenerationQueue";
import { generateTextContent } from "../services/textGeneration";
import { db } from "../db";
import { aiGenerationJobs } from "@shared/schema";
import { ensureJobId } from "../utils/type-patches";

let workerInstance:
  | Worker<TextGenerationJobData, TextGenerationJobResult>
  | null = null;

export function initializeTextGenerationWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  workerInstance = new Worker<TextGenerationJobData, TextGenerationJobResult>(
    TEXT_GENERATION_QUEUE_NAME,
    async (job) => {
      const jobId = ensureJobId(job.id);
      
      await db
        .update(aiGenerationJobs)
        .set({
          status: "processing",
        })
        .where(eq(aiGenerationJobs.jobId, jobId));

      const result = await generateTextContent(job.data.payload);

      await db
        .update(aiGenerationJobs)
        .set({
          status: "completed",
          completedAt: new Date(),
          resultSnippet: result.text?.slice(0, 280) ?? null,
        })
        .where(eq(aiGenerationJobs.jobId, jobId));

      return result;
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  workerInstance.on("completed", (job) => {
    console.log(`[Text Generation Worker] Job ${job.id} completed`);
  });

  workerInstance.on("failed", async (job, error) => {
    if (job && job.id) {
      try {
        await db
          .update(aiGenerationJobs)
          .set({
            status: "failed",
            completedAt: new Date(),
            errorMessage: error?.message ?? "Unknown error",
          })
          .where(eq(aiGenerationJobs.jobId, job.id));
      } catch (dbError) {
        console.error("[Text Generation Worker] Failed to persist failure state", dbError);
      }
    }
    console.error(`[Text Generation Worker] Job ${job?.id} failed`, error);
  });

  return workerInstance;
}
