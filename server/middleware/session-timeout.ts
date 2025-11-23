
import { Request, Response, NextFunction } from "express";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Track session activity and enforce inactivity timeout
 */
export function sessionTimeoutMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    
    // Check if session has been inactive too long
    if (now - lastActivity > INACTIVITY_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });
      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired due to inactivity. Please log in again.',
      });
    }
    
    // Update last activity timestamp
    req.session.lastActivity = now;
  }
  
  next();
}

/**
 * Get remaining session time in seconds
 */
export function getRemainingSessionTime(req: Request): number {
  if (!req.session || !req.session.userId || !req.session.lastActivity) {
    return 0;
  }
  
  const elapsed = Date.now() - req.session.lastActivity;
  const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);
  return Math.floor(remaining / 1000);
}
