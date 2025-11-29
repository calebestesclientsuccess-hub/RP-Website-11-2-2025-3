import { initializeTextGenerationWorker } from "./textGenerationWorker";
import { initializeImageGenerationWorker } from "./imageGenerationWorker";

let initialized = false;

export function initializeWorkers() {
  if (initialized) {
    return;
  }
  
  // Skip workers if using MOCK_REDIS (they require real Redis for job queues)
  if (process.env.MOCK_REDIS === "true") {
    console.log("[Workers] Skipping initialization (MOCK_REDIS enabled)");
    initialized = true;
    return;
  }
  
  initializeTextGenerationWorker();
  initializeImageGenerationWorker();
  initialized = true;
}


