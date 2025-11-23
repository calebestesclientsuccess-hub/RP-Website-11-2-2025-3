
import rateLimit from "express-rate-limit";
import { securityConfig } from "../config/production";

export const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login/registration attempts
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

export const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit lead submissions
  message: "Too many submissions, please try again later.",
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message:
    "Too many AI generation requests. Please wait a moment and try again.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: "Too many form submissions, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
