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
    // Force JSON response even if app is not ready
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.end(JSON.stringify({
      error: "Critical Startup Error",
      details: errorMessage,
      // Always show stack in this debug phase
      stack: err.stack
    }));
  }
}
