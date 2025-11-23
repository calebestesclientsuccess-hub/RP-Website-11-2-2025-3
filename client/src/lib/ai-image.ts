import { apiRequest } from "@/lib/queryClient";

export interface ImageGenerationPayload {
  prompt: string;
  aspectRatio: string;
  stylize: number;
  count: number;
}

const POLL_INTERVAL_MS = 2000;

async function pollImageJob(jobId: string) {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const res = await apiRequest("GET", `/api/ai/image/${jobId}`);
    const status = await res.json();

    if (status.status === "succeeded") {
      return status;
    }

    if (status.status === "failed" || status.status === "canceled") {
      throw new Error(status.error || "Image generation failed");
    }
  }
}

export async function runImageGenerationJob(payload: ImageGenerationPayload) {
  const res = await apiRequest("POST", "/api/ai/image", payload);
  const body = await res.json();

  if (!body.jobId) {
    throw new Error("Image generation job not accepted");
  }

  return pollImageJob(body.jobId);
}


