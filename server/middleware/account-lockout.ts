
import { Request, Response, NextFunction } from 'express';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// In-memory store for login attempts (in production, use Redis or database)
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

/**
 * Clean up old login attempts
 */
function cleanupOldAttempts() {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > ATTEMPT_WINDOW && !attempt.lockedUntil) {
      loginAttempts.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupOldAttempts, 5 * 60 * 1000);

/**
 * Get identifier for tracking (username or IP)
 */
function getIdentifier(req: Request): string {
  const username = req.body.username?.toLowerCase() || '';
  const ip = req.ip || 'unknown';
  return `${username}:${ip}`;
}

/**
 * Check if account is locked
 */
export function checkAccountLockout(req: Request, res: Response, next: NextFunction) {
  const identifier = getIdentifier(req);
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    return next();
  }

  const now = Date.now();

  // Check if account is currently locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - now) / 60000);
    return res.status(429).json({
      error: 'Account temporarily locked',
      message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      lockedUntil: attempt.lockedUntil,
    });
  }

  // Reset if lockout period has passed
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(identifier);
  }

  next();
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(req: Request): void {
  const identifier = getIdentifier(req);
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
    return;
  }

  // Reset count if outside attempt window
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
    return;
  }

  // Increment attempt count
  attempt.count += 1;
  attempt.lastAttempt = now;

  // Lock account if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
  }

  loginAttempts.set(identifier, attempt);
}

/**
 * Clear login attempts on successful login
 */
export function clearLoginAttempts(req: Request): void {
  const identifier = getIdentifier(req);
  loginAttempts.delete(identifier);
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(req: Request): number {
  const identifier = getIdentifier(req);
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    return MAX_ATTEMPTS;
  }

  const now = Date.now();
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.count);
}
