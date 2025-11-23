import { apiRequest } from "./queryClient";

export type TextGenerationType = "blog-outline" | "social-caption" | "seo-metadata";

export interface TextGenerationPayload {
  brandVoice: string;
  topic: string;
  type: TextGenerationType;
  content?: string;
}

const POLL_INTERVAL_MS = 1500;

async function pollJob(jobId: string) {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const res = await apiRequest("GET", `/api/ai/text/${jobId}`);
    const status = await res.json();

    if (status.status === "completed") {
      return status.result;
    }

    if (status.status === "failed" || status.status === "stuck") {
      throw new Error(status.error || "Text generation job failed");
    }
  }
}

export async function runTextGenerationJob(payload: TextGenerationPayload) {
  const res = await apiRequest("POST", "/api/ai/text", payload);
  const body = await res.json();

  if (!body.jobId) {
    throw new Error("Text generation job not accepted");
  }

  return pollJob(body.jobId);
}


