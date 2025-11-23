
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { logSecurityEvent, logSuspiciousActivity } from "../utils/security-logger";
import { db } from "../db";
import { ipReputation } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";

const VIOLATION_THRESHOLD = 10; // Block after 10 violations
const VIOLATION_WINDOW = 60 * 60 * 1000; // 1 hour window
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hour block

const violationKey = (ip: string) => `security:violations:${ip}`;
const blockKey = (ip: string) => `security:block:${ip}`;

async function getRedisBlockTTL(ip: string): Promise<number | null> {
  try {
    const ttl = await redis.pttl(blockKey(ip));
    return ttl > 0 ? ttl : null;
  } catch (error) {
    logger.warn("Redis block TTL lookup failed", { module: 'intrusion-detection', ip }, error as Error);
    return null;
  }
}

async function setRedisBlock(ip: string, durationMs: number) {
  try {
    await redis.set(blockKey(ip), "1", "PX", durationMs);
  } catch (error) {
    logger.warn("Redis block set failed", { module: 'intrusion-detection', ip, durationMs }, error as Error);
  }
}

async function incrementRedisViolation(ip: string): Promise<number> {
  try {
    const count = await redis.incr(violationKey(ip));
    if (count === 1) {
      await redis.pexpire(violationKey(ip), VIOLATION_WINDOW);
    }
    return count;
  } catch (error) {
    logger.warn("Redis violation increment failed", { module: 'intrusion-detection', ip }, error as Error);
    return 1;
  }
}

/**
 * Record a violation for an IP
 */
async function persistViolation(ip: string, reason: string) {
  const now = new Date();
  const redisCount = await incrementRedisViolation(ip);

  const existing = await db.query.ipReputation.findFirst({
    where: eq(ipReputation.ip, ip),
  });

  let violations = 1;
  if (existing?.lastViolation) {
    const last = new Date(existing.lastViolation);
    if (now.getTime() - last.getTime() < VIOLATION_WINDOW) {
      violations = (existing.violations || 0) + 1;
    }
  }

  const blockActive =
    existing?.blockUntil && new Date(existing.blockUntil) > now;
  const shouldBlock = violations >= VIOLATION_THRESHOLD || redisCount >= VIOLATION_THRESHOLD;
  const blockUntil = shouldBlock
    ? new Date(now.getTime() + BLOCK_DURATION)
    : blockActive
    ? new Date(existing!.blockUntil!)
    : null;

  await db
    .insert(ipReputation)
    .values({
      ip,
      violations,
      lastViolation: now,
      blockUntil,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: ipReputation.ip,
      set: {
        violations,
        lastViolation: now,
        blockUntil,
        updatedAt: now,
      },
    });

  if (shouldBlock) {
    await setRedisBlock(ip, BLOCK_DURATION);
    await logSecurityEvent("suspicious_activity", "critical", {
      ipAddress: ip,
      metadata: {
        reason: "Automatic IP block",
        violations,
        blockDuration: "24 hours",
        source: reason,
      },
    });
  }
}

export function recordViolation(ip: string, reason: string): void {
  void persistViolation(ip, reason).catch((error) => {
    logger.error("Failed to persist IP violation", { module: 'intrusion-detection', ip, reason }, error as Error);
  });
}

/**
 * Middleware to block suspicious IPs
 */
export function blockSuspiciousIPs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || "unknown";

  getRedisBlockTTL(ip)
    .then(async (redisTtl) => {
      if (redisTtl && redisTtl > 0) {
        const remainingHours = Math.ceil(redisTtl / (60 * 60 * 1000));
        return res.status(403).json({
          error: "Access denied",
          message: `Your IP has been temporarily blocked due to suspicious activity. Please try again in ${remainingHours} hour(s).`,
          blockedUntil: new Date(Date.now() + redisTtl).toISOString(),
        });
      }

      const record = await db.query.ipReputation.findFirst({
        where: eq(ipReputation.ip, ip),
      });

      if (!record?.blockUntil) {
        return next();
      }

      const blockUntil = new Date(record.blockUntil);
      const now = Date.now();
      if (now >= blockUntil.getTime()) {
        await db
          .update(ipReputation)
          .set({
            blockUntil: null,
            violations: 0,
            updatedAt: new Date(),
          })
          .where(eq(ipReputation.ip, ip));
        await redis.del(blockKey(ip));
        return next();
      }

      await setRedisBlock(ip, blockUntil.getTime() - now);
      const remainingMs = blockUntil.getTime() - now;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

      return res.status(403).json({
        error: "Access denied",
        message: `Your IP has been temporarily blocked due to suspicious activity. Please try again in ${remainingHours} hour(s).`,
        blockedUntil: blockUntil.toISOString(),
      });
    })
    .catch((error) => {
      logger.error("Failed to check IP reputation", { module: 'intrusion-detection', ip }, error as Error);
      next();
    });
}

/**
 * Enhanced rate limiter with violation tracking
 */
export const enhancedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || "unknown";
    recordViolation(ip, "Rate limit exceeded");

    logSuspiciousActivity(req, "Rate limit exceeded", {
      ip,
      endpoint: req.path,
    });

    res.status(429).json({
      error: "Too many requests",
      message: "Please slow down and try again later.",
    });
  },
});

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousPatterns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || "unknown";
  const userAgent = req.headers["user-agent"] || "";
  const path = req.path;

  // Detect SQL injection attempts
  const sqlPattern = /(\bor\b|\band\b|union|select|insert|update|delete|drop|exec|script)/i;
  const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
  
  if (sqlPattern.test(queryString)) {
    recordViolation(ip, "SQL injection attempt");
    logSuspiciousActivity(req, "Potential SQL injection attempt", {
      query: req.query,
      body: req.body,
    });
  }

  // Detect path traversal attempts
  if (path.includes("../") || path.includes("..\\")) {
    recordViolation(ip, "Path traversal attempt");
    logSuspiciousActivity(req, "Path traversal attempt", { path });
  }

  // Detect bot/scanner patterns
  const botPatterns = /bot|crawler|scanner|nikto|sqlmap|nmap|masscan/i;
  if (botPatterns.test(userAgent)) {
    recordViolation(ip, "Automated scanning detected");
    logSuspiciousActivity(req, "Automated scanning tool detected", { userAgent });
  }

  next();
}
