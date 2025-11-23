import { GoogleGenAI } from "@google/genai";
import { logSecurityEvent } from "../utils/security-logger";

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function invokeWithAiBackoff<T>(
  operation: string,
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let attempt = 0;
  let delay = baseDelayMs;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      logSecurityEvent("ai_generation_error", attempt >= maxAttempts ? "warning" : "info", {
        operation,
        attempt,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (attempt >= maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error(`AI operation ${operation} failed`);
}


