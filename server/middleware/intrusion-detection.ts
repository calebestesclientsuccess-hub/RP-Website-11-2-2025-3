
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logSecurityEvent, logSuspiciousActivity } from '../utils/security-logger';

interface SuspiciousIP {
  blockUntil: number;
  violations: number;
  lastViolation: number;
}

// In-memory store (use Redis in production)
const blockedIPs = new Map<string, SuspiciousIP>();
const ipViolations = new Map<string, number[]>();

const VIOLATION_THRESHOLD = 10; // Block after 10 violations
const VIOLATION_WINDOW = 60 * 60 * 1000; // 1 hour window
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hour block

/**
 * Clean up old violation records
 */
function cleanupOldViolations() {
  const now = Date.now();
  for (const [ip, timestamps] of ipViolations.entries()) {
    const recent = timestamps.filter(t => now - t < VIOLATION_WINDOW);
    if (recent.length === 0) {
      ipViolations.delete(ip);
    } else {
      ipViolations.set(ip, recent);
    }
  }
}

setInterval(cleanupOldViolations, 5 * 60 * 1000); // Every 5 minutes

/**
 * Record a violation for an IP
 */
export function recordViolation(ip: string, reason: string): void {
  const now = Date.now();
  const violations = ipViolations.get(ip) || [];
  violations.push(now);
  ipViolations.set(ip, violations);

  // Check if should block
  const recentViolations = violations.filter(t => now - t < VIOLATION_WINDOW);
  
  if (recentViolations.length >= VIOLATION_THRESHOLD) {
    blockedIPs.set(ip, {
      blockUntil: now + BLOCK_DURATION,
      violations: recentViolations.length,
      lastViolation: now,
    });

    // Log critical security event
    logSecurityEvent('suspicious_activity', 'critical', {
      ipAddress: ip,
      metadata: {
        reason: 'Automatic IP block',
        violations: recentViolations.length,
        blockDuration: '24 hours',
      },
    });

    console.warn(`🚨 IP ${ip} blocked due to ${recentViolations.length} violations: ${reason}`);
  }
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  const blocked = blockedIPs.get(ip);
  if (!blocked) return false;

  const now = Date.now();
  if (now > blocked.blockUntil) {
    blockedIPs.delete(ip);
    return false;
  }

  return true;
}

/**
 * Middleware to block suspicious IPs
 */
export function blockSuspiciousIPs(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';

  if (isIPBlocked(ip)) {
    const blocked = blockedIPs.get(ip)!;
    const remainingMs = blocked.blockUntil - Date.now();
    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

    return res.status(403).json({
      error: 'Access denied',
      message: `Your IP has been temporarily blocked due to suspicious activity. Please try again in ${remainingHours} hours.`,
      blockedUntil: new Date(blocked.blockUntil).toISOString(),
    });
  }

  next();
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
    const ip = req.ip || 'unknown';
    recordViolation(ip, 'Rate limit exceeded');
    
    logSuspiciousActivity(req, 'Rate limit exceeded', {
      ip,
      endpoint: req.path,
    });

    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later.',
    });
  },
});

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousPatterns(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || '';
  const path = req.path;

  // Detect SQL injection attempts
  const sqlPattern = /(\bor\b|\band\b|union|select|insert|update|delete|drop|exec|script)/i;
  const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
  
  if (sqlPattern.test(queryString)) {
    recordViolation(ip, 'SQL injection attempt');
    logSuspiciousActivity(req, 'Potential SQL injection attempt', {
      query: req.query,
      body: req.body,
    });
  }

  // Detect path traversal attempts
  if (path.includes('../') || path.includes('..\\')) {
    recordViolation(ip, 'Path traversal attempt');
    logSuspiciousActivity(req, 'Path traversal attempt', { path });
  }

  // Detect bot/scanner patterns
  const botPatterns = /bot|crawler|scanner|nikto|sqlmap|nmap|masscan/i;
  if (botPatterns.test(userAgent)) {
    recordViolation(ip, 'Automated scanning detected');
    logSuspiciousActivity(req, 'Automated scanning tool detected', { userAgent });
  }

  next();
};
}
