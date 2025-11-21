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
    res.end(JSON.stringify({
      error: "Internal Server Error",
      details: err.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }));
  }
}
