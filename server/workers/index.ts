import { initializeTextGenerationWorker } from "./textGenerationWorker";
import { initializeImageGenerationWorker } from "./imageGenerationWorker";

let initialized = false;

export function initializeWorkers() {
  if (initialized) {
    return;
  }
  initializeTextGenerationWorker();
  initializeImageGenerationWorker();
  initialized = true;
}


