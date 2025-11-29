
import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { securityConfig } from "../config/production";

// Custom handler that returns JSON responses for rate limit errors
const createJsonHandler = (message: string) => (_req: Request, res: Response) => {
  res.status(429).json({ error: message });
};

export const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: createJsonHandler("Too many requests from this IP, please try again later."),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login/registration attempts
  message: { error: "Too many authentication attempts, please try again later." },
  skipSuccessfulRequests: true,
  handler: createJsonHandler("Too many authentication attempts, please try again later."),
});

export const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit lead submissions
  message: { error: "Too many submissions, please try again later." },
  handler: createJsonHandler("Too many submissions, please try again later."),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many AI generation requests. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: createJsonHandler("Too many AI generation requests. Please wait a moment and try again."),
});

export const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: { error: "Too many form submissions, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: createJsonHandler("Too many form submissions, please try again later."),
});
