import type { IncomingMessage, ServerResponse } from "http";
import { app, appReady } from "../server/app";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await appReady;
  app(req as any, res as any);
}

