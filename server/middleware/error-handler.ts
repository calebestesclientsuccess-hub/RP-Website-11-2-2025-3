
import { Request, Response, NextFunction } from 'express';

interface ErrorLog {
  timestamp: Date;
  error: string;
  stack?: string;
  path: string;
  method: string;
  userId?: string;
  tenantId?: string;
}

const errorLogs: ErrorLog[] = [];
const maxErrorLogs = 500;

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    tenantId: (req as any).tenantId,
  };
  
  // Store error log
  errorLogs.push(errorLog);
  if (errorLogs.length > maxErrorLogs) {
    errorLogs.shift();
  }
  
  // Log to console in production
  console.error('[ERROR]', {
    message: err.message,
    path: req.path,
    method: req.method,
    userId: errorLog.userId,
    tenantId: errorLog.tenantId,
    timestamp: errorLog.timestamp.toISOString(),
  });
  
  // Don't expose stack traces in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}

export function getErrorLogs() {
  return {
    errors: errorLogs,
    count: errorLogs.length,
    recentErrors: errorLogs.slice(-10),
  };
}
