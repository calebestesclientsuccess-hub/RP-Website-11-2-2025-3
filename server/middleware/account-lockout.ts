
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { loginAttemptTracker } from "@shared/schema";
import { eq } from "drizzle-orm";
import { redis } from "../lib/redis";
import {
  MAX_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  ATTEMPT_WINDOW_MS,
  computeNextAttemptState,
} from "../lib/lockout-utils";
import { logger } from "../lib/logger";

const attemptKey = (identifier: string) => `login:attempts:${identifier}`;
const lockKey = (identifier: string) => `login:lock:${identifier}`;

async function getRedisLockTTL(identifier: string): Promise<number | null> {
  try {
    const ttl = await redis.pttl(lockKey(identifier));
    return ttl > 0 ? ttl : null;
  } catch (error) {
    logger.warn("Redis lock TTL check failed", { module: 'account-lockout', identifier }, error as Error);
    return null;
  }
}

async function setRedisLock(identifier: string, durationMs: number) {
  try {
    await redis.set(lockKey(identifier), "1", "PX", durationMs);
  } catch (error) {
    logger.warn("Redis lock set failed", { module: 'account-lockout', identifier, durationMs }, error as Error);
  }
}

async function cacheAttemptState(
  identifier: string,
  payload: { count: number; lastAttempt: Date },
) {
  try {
    await redis.set(
      attemptKey(identifier),
      JSON.stringify({
        count: payload.count,
        lastAttempt: payload.lastAttempt.toISOString(),
      }),
      "PX",
      ATTEMPT_WINDOW_MS,
    );
  } catch (error) {
    logger.warn("Redis attempt cache failed", { module: 'account-lockout', identifier }, error as Error);
  }
}

async function readCachedAttemptState(identifier: string) {
  try {
    const raw = await redis.get(attemptKey(identifier));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { count: number; lastAttempt: string };
    return {
      count: parsed.count,
      lastAttempt: new Date(parsed.lastAttempt),
    };
  } catch (error) {
    logger.warn("Redis attempt fetch failed", { module: 'account-lockout', identifier }, error as Error);
    return null;
  }
}

async function clearRedisState(identifier: string) {
  try {
    await redis.del(attemptKey(identifier));
    await redis.del(lockKey(identifier));
  } catch (error) {
    logger.warn("Redis attempt reset failed", { module: 'account-lockout', identifier }, error as Error);
  }
}

/**
 * Get identifier for tracking (username or IP)
 */
function getIdentifier(req: Request): string {
  const username = req.body.username?.toLowerCase() || "";
  const ip = req.ip || "unknown";
  return `${username}:${ip}`;
}

async function fetchAttempt(identifier: string) {
  return db.query.loginAttemptTracker.findFirst({
    where: eq(loginAttemptTracker.identifier, identifier),
  });
}

async function resetAttempts(identifier: string) {
  await db
    .delete(loginAttemptTracker)
    .where(eq(loginAttemptTracker.identifier, identifier));
}

/**
 * Check if account is locked
 */
export async function checkAccountLockout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const identifier = getIdentifier(req);
  try {
    const redisTtl = await getRedisLockTTL(identifier);
    if (redisTtl && redisTtl > 0) {
      const remainingMinutes = Math.ceil(redisTtl / 60000);
      return res.status(429).json({
        error: "Account temporarily locked",
        message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        lockedUntil: new Date(Date.now() + redisTtl).toISOString(),
      });
    }

    const attempt = await fetchAttempt(identifier);
    if (!attempt) {
      return next();
    }

    const now = Date.now();
    const lockedUntil = attempt.lockedUntil
      ? new Date(attempt.lockedUntil).getTime()
      : null;

    if (lockedUntil && now < lockedUntil) {
      await setRedisLock(identifier, lockedUntil - now);
      const remainingMinutes = Math.ceil((lockedUntil - now) / 60000);
      return res.status(429).json({
        error: "Account temporarily locked",
        message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        lockedUntil: new Date(lockedUntil).toISOString(),
      });
    }

    if (lockedUntil && now >= lockedUntil) {
      await resetAttempts(identifier);
      await clearRedisState(identifier);
    }

    return next();
  } catch (error) {
    console.error("Failed to evaluate lockout:", error);
    return next();
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedAttempt(req: Request): Promise<void> {
  const identifier = getIdentifier(req);
  const now = new Date();
  const attempt = await fetchAttempt(identifier);
  const previousSnapshot = attempt
    ? {
        count: attempt.count,
        lastAttempt: attempt.lastAttempt ? new Date(attempt.lastAttempt) : null,
      }
    : null;

  const { count, lockedUntil } = computeNextAttemptState(previousSnapshot, now);

  await db
    .insert(loginAttemptTracker)
    .values({
      identifier,
      count,
      lastAttempt: now,
      lockedUntil,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: loginAttemptTracker.identifier,
      set: {
        count,
        lastAttempt: now,
        lockedUntil,
        updatedAt: now,
      },
    });

  await cacheAttemptState(identifier, { count, lastAttempt: now });

  if (lockedUntil) {
    await setRedisLock(identifier, lockedUntil.getTime() - now.getTime());
  } else {
    await redis.del(lockKey(identifier));
  }
}

/**
 * Clear login attempts on successful login
 */
export async function clearLoginAttempts(req: Request): Promise<void> {
  const identifier = getIdentifier(req);
  await resetAttempts(identifier);
  await clearRedisState(identifier);
}

/**
 * Get remaining attempts before lockout
 */
export async function getRemainingAttempts(req: Request): Promise<number> {
  const identifier = getIdentifier(req);
  try {
    const cached = await readCachedAttemptState(identifier);
    if (cached?.lastAttempt) {
      const elapsed = Date.now() - cached.lastAttempt.getTime();
      if (elapsed <= ATTEMPT_WINDOW_MS) {
        return Math.max(0, MAX_ATTEMPTS - cached.count);
      }
    }
  } catch (error) {
    logger.warn("Redis remaining attempts lookup failed", { module: 'account-lockout', identifier }, error as Error);
  }

  const attempt = await fetchAttempt(identifier);
  if (!attempt || !attempt.lastAttempt) {
    return MAX_ATTEMPTS;
  }

  const now = Date.now();
  const last = new Date(attempt.lastAttempt).getTime();
  if (now - last > ATTEMPT_WINDOW_MS) {
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.count);
}
