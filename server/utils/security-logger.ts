
import { db } from '../db';
import { securityEvents } from '@shared/schema';
import { Request } from 'express';

export type SecurityEventType =
  | 'failed_login'
  | 'account_lockout'
  | 'privilege_escalation'
  | 'unauthorized_access'
  | 'api_key_compromised'
  | 'suspicious_activity'
  | 'data_access_anomaly'
  | 'session_hijack_attempt'
  | 'brute_force_attempt';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  details: {
    tenantId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await db.insert(securityEvents).values({
      eventType,
      severity,
      tenantId: details.tenantId || null,
      userId: details.userId || null,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      endpoint: details.endpoint,
      method: details.method,
      details: details.metadata,
      resolved: false,
    });

    // Alert on critical events
    if (severity === 'critical') {
      console.error(`🚨 CRITICAL SECURITY EVENT: ${eventType}`, details);
      // TODO: Send email/Slack notification
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  req: Request,
  username: string,
  reason: string
): Promise<void> {
  await logSecurityEvent('failed_login', 'medium', {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    endpoint: req.path,
    method: req.method,
    metadata: {
      username,
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log privilege escalation attempt
 */
export async function logPrivilegeEscalation(
  req: Request,
  userId: string,
  attemptedAction: string
): Promise<void> {
  await logSecurityEvent('privilege_escalation', 'high', {
    userId,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    endpoint: req.path,
    method: req.method,
    metadata: {
      attemptedAction,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  req: Request,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  await logSecurityEvent('suspicious_activity', 'high', {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    endpoint: req.path,
    method: req.method,
    metadata: {
      description,
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}
