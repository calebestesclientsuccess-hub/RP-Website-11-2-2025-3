import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const IMAGE_GENERATION_QUEUE_NAME = "image-generation";

export interface ImageGenerationJobData {
  tenantId: string;
  userId?: string;
  prompt: string;
  aspectRatio: string;
  stylize: number;
  count: number;
}

export const imageGenerationQueue = new Queue<ImageGenerationJobData>(
  IMAGE_GENERATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 50,
      removeOnFail: 500,
    },
  },
);


