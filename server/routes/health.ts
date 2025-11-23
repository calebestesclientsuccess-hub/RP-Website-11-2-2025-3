import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { redisConnection } from "../queues/connection";
import { env } from "../config/env";
import cloudinary, { cloudinaryEnabled } from "../cloudinary";

const router = Router();
const GOOGLE_AI_KEY = env.GOOGLE_AI_KEY;
const GEMINI_BASE_URL =
  env.AI_INTEGRATIONS_GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com";

router.get("/", async (req, res) => {
  const health: Record<string, string> = {
    status: "healthy",
    uptime: process.uptime().toFixed(2),
    timestamp: new Date().toISOString(),
  };

  let statusCode = 200;

  // Check Database
  try {
    await db.execute(sql`SELECT 1`);
    health.database = "connected";
  } catch (error: any) {
    health.database = "disconnected";
    health.databaseError = error.message;
    health.status = "unhealthy";
    statusCode = 503;
  }

  // Check Redis
  try {
    if (redisConnection && redisConnection.status === "ready") {
      health.redis = "connected";
    } else {
      health.redis = "disconnected";
      health.status = "degraded"; // Redis failure might not be fatal for all apps
    }
  } catch (error: any) {
    health.redis = "error";
    health.redisError = error.message;
  }

  res.status(statusCode).json(health);
});

router.get("/ready", async (_req, res) => {
  const checks = {
    database: false,
    gemini: !GOOGLE_AI_KEY,
    cloudinary: !cloudinaryEnabled,
    replicate: !env.REPLICATE_API_TOKEN,
  };
  const timings: Record<string, number> = {};

  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    checks.database = true;
    timings.database = Date.now() - start;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  if (cloudinaryEnabled) {
    try {
      const start = Date.now();
      await cloudinary.api.ping();
      checks.cloudinary = true;
      timings.cloudinary = Date.now() - start;
    } catch (error) {
      console.error("Cloudinary health check failed:", error);
    }
  }

  if (GOOGLE_AI_KEY) {
    const start = Date.now();
    try {
      const response = await fetch(
        `${GEMINI_BASE_URL.replace(/\/$/, "")}/v1/models?key=${GOOGLE_AI_KEY}&pageSize=1`,
      );
      checks.gemini = response.ok;
    } catch (error) {
      console.error("Gemini health check failed:", error);
    } finally {
      timings.gemini = Date.now() - start;
    }
  }

  if (env.REPLICATE_API_TOKEN) {
    const start = Date.now();
    try {
      const response = await fetch("https://api.replicate.com/v1/models", {
        headers: {
          Authorization: `Token ${env.REPLICATE_API_TOKEN}`,
        },
      });
      checks.replicate = response.ok;
    } catch (error) {
      console.error("Replicate health check failed:", error);
      checks.replicate = false;
    } finally {
      timings.replicate = Date.now() - start;
    }
  }

  const requiredHealthy = checks.database && (cloudinaryEnabled ? checks.cloudinary : true);
  const optionalHealthy =
    (!GOOGLE_AI_KEY || checks.gemini) &&
    (!env.REPLICATE_API_TOKEN || checks.replicate);
  const status = requiredHealthy
    ? optionalHealthy
      ? "ready"
      : "degraded"
    : "down";
  const statusCode = requiredHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    checks,
    timings,
    timestamp: new Date().toISOString(),
  });
});

export default router;
