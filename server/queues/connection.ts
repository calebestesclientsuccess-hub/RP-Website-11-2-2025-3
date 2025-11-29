import IORedis from "ioredis";
import { env } from "../config/env";

// Use mock connection if MOCK_REDIS is enabled
export const redisConnection = process.env.MOCK_REDIS === "true"
  ? null as any  // Queues won't work with MOCK_REDIS, but app will start
  : new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

if (redisConnection) {
  redisConnection.on("error", (error) => {
    console.error("[Redis] connection error:", error);
  });
}


