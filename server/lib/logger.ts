/**
 * Structured logger for server-side logging
 * 
 * Provides consistent, structured logging with levels, context, and JSON output.
 * Can be easily upgraded to Pino/Winston in the future by swapping implementation.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private isProd: boolean;

  constructor() {
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.isProd = process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4,
    };
    return levels[level] >= levels[this.minLevel];
  }

  private formatLog(entry: LogEntry): string {
    if (this.isProd) {
      // JSON format for production (log aggregators like Datadog, LogDNA)
      return JSON.stringify(entry);
    } else {
      // Pretty format for development
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      const emoji = {
        debug: '🔍',
        info: 'ℹ️ ',
        warn: '⚠️ ',
        error: '❌',
        fatal: '💀',
      }[entry.level];
      
      let msg = `${timestamp} ${emoji} [${entry.level.toUpperCase()}] ${entry.message}`;
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        msg += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
      }
      
      if (entry.error) {
        msg += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack) {
          msg += `\n${entry.error.stack}`;
        }
      }
      
      return msg;
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formatted = this.formatLog(entry);

    // Route to appropriate console method
    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
    }

    // In production, also send to external logging service if configured
    if (this.isProd && (level === 'error' || level === 'fatal')) {
      this.shipToExternalService(entry);
    }
  }

  private async shipToExternalService(entry: LogEntry): Promise<void> {
    // Placeholder for external log shipping (Datadog, Sentry, etc.)
    // Implementation depends on chosen service
    
    const logShipUrl = process.env.LOG_SHIP_URL;
    if (!logShipUrl) return;

    try {
      await fetch(logShipUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't throw - logging errors shouldn't crash the app
      console.error('[logger] Failed to ship log to external service:', error);
    }
  }

  /**
   * Debug-level logging (verbose development info)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info-level logging (normal operational messages)
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning-level logging (recoverable issues)
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error-level logging (errors that need attention)
   */
  error(message: string, contextOrError?: LogContext | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log('error', message, undefined, contextOrError);
    } else {
      this.log('error', message, contextOrError, error);
    }
  }

  /**
   * Fatal-level logging (critical errors causing shutdown)
   */
  fatal(message: string, contextOrError?: LogContext | Error, error?: Error): void {
    if (contextOrError instanceof Error) {
      this.log('fatal', message, undefined, contextOrError);
    } else {
      this.log('fatal', message, contextOrError, error);
    }
  }

  /**
   * Create a child logger with default context
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      originalLog(level, message, { ...defaultContext, ...context }, error);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience export for creating child loggers
export function createLogger(context: LogContext): Logger {
  return logger.child(context);
}

