import type { IncomingMessage, ServerResponse } from "http";

// Pre-check environment variables
const envCheck = {
  NODE_ENV: process.env.NODE_ENV,
  HAS_DB_URL: !!process.env.DATABASE_URL,
  HAS_SESSION_SECRET: !!process.env.SESSION_SECRET,
  HAS_PUBLIC_TENANT_ID: !!process.env.PUBLIC_TENANT_ID,
  PUBLIC_TENANT_ID: process.env.PUBLIC_TENANT_ID,
};

let appModule: any = null;
let initError: Error | null = null;

// Lazy load the app module
async function getApp() {
  if (initError) throw initError;
  if (appModule) return appModule;
  
  try {
    console.log("[api/index] Importing dist/server/app.js...");
    // Use static import path - Vercel needs to resolve this at build time
    appModule = await import("../dist/server/app.js");
    console.log("[api/index] Import successful");
    return appModule;
  } catch (err: any) {
    console.error("[api/index] CRITICAL: Failed to import server/app:", err);
    initError = err;
    throw err;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { app, appReady } = await getApp();
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
