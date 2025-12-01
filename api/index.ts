import type { IncomingMessage, ServerResponse } from "http";

// Dynamic import pattern to catch initialization errors
// import { app, appReady } from "../server/app";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Check critical env vars before even trying to load the app
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is missing from environment variables");
    }
    if (!process.env.SESSION_SECRET) {
      throw new Error("SESSION_SECRET is missing from environment variables");
    }

    // Dynamically import the app so we can catch top-level errors (like DB connection failures or schema validation)
    // @ts-ignore
    const { app, appReady } = await import("../server/app");
    
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
