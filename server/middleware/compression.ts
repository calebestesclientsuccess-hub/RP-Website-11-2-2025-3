
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

export const compressionMiddleware = compression({
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// Smart cache control based on content type
export function cacheControl(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Static assets - long cache
  if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|woff2|woff|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // JS/CSS - cache but revalidate
  else if (path.match(/\.(js|css)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
  }
  // API responses - no cache
  else if (path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
  // HTML - short cache with revalidation
  else {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  
  next();
}
