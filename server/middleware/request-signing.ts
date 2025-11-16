
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate HMAC signature for request
 */
export function generateSignature(
  secret: string,
  method: string,
  path: string,
  timestamp: string,
  body: string
): string {
  const payload = `${method}:${path}:${timestamp}:${body}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify HMAC signature to prevent replay attacks
 */
export function verifyRequestSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;

  if (!signature || !timestamp) {
    return res.status(401).json({
      error: 'Missing signature headers',
      details: 'x-signature and x-timestamp headers are required',
    });
  }

  // Check timestamp to prevent replay attacks
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();

  if (isNaN(requestTime)) {
    return res.status(401).json({
      error: 'Invalid timestamp format',
    });
  }

  if (Math.abs(now - requestTime) > SIGNATURE_TOLERANCE_MS) {
    return res.status(401).json({
      error: 'Request timestamp out of tolerance',
      details: 'Request must be made within 5 minutes',
    });
  }

  // Get API secret from environment or validated API key
  const apiSecret = process.env.API_SECRET || (req as any).apiKeySecret;

  if (!apiSecret) {
    return res.status(500).json({
      error: 'Server configuration error',
    });
  }

  // Generate expected signature
  const body = JSON.stringify(req.body || {});
  const expectedSignature = generateSignature(
    apiSecret,
    req.method,
    req.path,
    timestamp,
    body
  );

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    return res.status(401).json({
      error: 'Invalid signature',
    });
  }

  next();
}

/**
 * Middleware for sensitive operations requiring signed requests
 */
export const requireSignedRequest = verifyRequestSignature;
