import type { IncomingMessage, ServerResponse } from "http";

// Pre-check environment variables BEFORE importing app
const envCheck = {
  NODE_ENV: process.env.NODE_ENV,
  HAS_DB_URL: !!process.env.DATABASE_URL,
  HAS_SESSION_SECRET: !!process.env.SESSION_SECRET,
  HAS_PUBLIC_TENANT_ID: !!process.env.PUBLIC_TENANT_ID,
  PUBLIC_TENANT_ID: process.env.PUBLIC_TENANT_ID,
};

console.log("[api/index] Environment check:", JSON.stringify(envCheck));

let app: any;
let appReady: Promise<void>;
let initError: Error | null = null;

try {
  const appModule = await import("../server/app");
  app = appModule.app;
  appReady = appModule.appReady;
} catch (err: any) {
  console.error("[api/index] CRITICAL: Failed to import server/app:", err);
  initError = err;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // If there was an import error, report it immediately
  if (initError) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Module Import Error",
      details: initError.message,
      stack: initError.stack,
      env_debug: envCheck,
    }));
    return;
  }

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
      env_debug: envCheck,
    }));
  }
}
