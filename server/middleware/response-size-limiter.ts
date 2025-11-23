import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

const DEFAULT_LIMIT = parseInt(env.MAX_RESPONSE_SIZE_BYTES, 10);

const computePayloadSize = (body: unknown): number => {
  if (body === undefined || body === null) {
    return 0;
  }

  if (Buffer.isBuffer(body)) {
    return body.length;
  }

  if (typeof body === "string") {
    return Buffer.byteLength(body);
  }

  if (typeof body === "object") {
    try {
      return Buffer.byteLength(JSON.stringify(body));
    } catch {
      return Buffer.byteLength(String(body));
    }
  }

  return Buffer.byteLength(String(body));
};

export function responseSizeGuard(limit = DEFAULT_LIMIT) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);

    const guardedSend: Response["send"] = function (this: Response, body?: any) {
      if ((res as any).__responseSizeGuardBypassed) {
        return originalSend(body);
      }

      const payloadSize = computePayloadSize(body);
      if (limit && payloadSize > limit) {
        (res as any).__responseSizeGuardBypassed = true;
        return res.status(413).json({
          error: "Response too large. Refine your filters or use pagination.",
        });
      }

      return originalSend(body);
    };

    res.send = guardedSend;

    next();
  };
}

