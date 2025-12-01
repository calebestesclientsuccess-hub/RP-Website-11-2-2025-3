import type { IncomingMessage, ServerResponse } from "http";
import { app, appReady } from "../server/app";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await appReady;
    app(req as any, res as any);
  } catch (err: any) {
    console.error("Serverless Function Crash:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;

    res.end(JSON.stringify({
      error: "Critical Startup Error",
      details: errorMessage,
      stack: errorStack,
      env_debug: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_DB_URL: !!process.env.DATABASE_URL,
        HAS_SESSION_SECRET: !!process.env.SESSION_SECRET,
        HAS_REDIS_URL: !!process.env.REDIS_URL,
        PUBLIC_TENANT_ID: process.env.PUBLIC_TENANT_ID,
      }
    }));
  }
}
