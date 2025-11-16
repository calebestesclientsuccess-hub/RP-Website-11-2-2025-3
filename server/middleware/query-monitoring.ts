
import { Request, Response, NextFunction } from 'express';

interface QueryMetrics {
  endpoint: string;
  queryTime: number;
  timestamp: Date;
}

const slowQueryThreshold = 1000; // 1 second
const queryMetrics: QueryMetrics[] = [];

export function queryMonitoring(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  // Intercept response to measure query time
  const originalSend = res.send;
  res.send = function(data) {
    const queryTime = Date.now() - startTime;
    
    // Log slow queries
    if (queryTime > slowQueryThreshold) {
      console.warn(`[SLOW QUERY] ${req.method} ${req.path} took ${queryTime}ms`);
      
      queryMetrics.push({
        endpoint: `${req.method} ${req.path}`,
        queryTime,
        timestamp: new Date(),
      });
      
      // Keep only last 100 slow queries
      if (queryMetrics.length > 100) {
        queryMetrics.shift();
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Endpoint to view slow query metrics (admin only)
export function getQueryMetrics() {
  return {
    slowQueries: queryMetrics,
    averageTime: queryMetrics.reduce((sum, m) => sum + m.queryTime, 0) / queryMetrics.length || 0,
    count: queryMetrics.length,
  };
}
