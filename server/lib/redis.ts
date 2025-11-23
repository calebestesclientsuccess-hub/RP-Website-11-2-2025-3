import Redis from "ioredis";
import { env } from "../config/env";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

redis.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[redis] connected");
  }
});

