import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const TEXT_GENERATION_QUEUE_NAME = "text-generation";

export type TextJobType = "blog-outline" | "social-caption" | "seo-metadata";

export interface TextGenerationJobData {
  tenantId: string;
  userId?: string;
  payload: {
    brandVoice: string;
    topic: string;
    type: TextJobType;
    content?: string;
  };
}

export interface TextGenerationJobResult {
  text?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const textGenerationQueue = new Queue<TextGenerationJobData>(
  TEXT_GENERATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: 200,
      removeOnFail: 2000,
    },
  },
);


