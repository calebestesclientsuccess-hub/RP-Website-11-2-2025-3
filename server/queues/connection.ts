import IORedis from "ioredis";
import { env } from "../config/env";

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (error) => {
  console.error("[Redis] connection error:", error);
});


