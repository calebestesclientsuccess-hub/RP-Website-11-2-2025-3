
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
  const pathname = req.path;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const staticAssetPattern = /\.(?:js|mjs|css|json|txt|map|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|otf|mp4|mp3|webm)$/i;
  const htmlRequest =
    req.headers.accept?.includes('text/html') ||
    pathname === '/' ||
    pathname.endsWith('.html');

  // Avoid overriding headers already set downstream (e.g., express.static)
  if (res.getHeader('Cache-Control')) {
    next();
    return;
  }

  if (isDevelopment) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
    return;
  }

  // Never cache API responses
  if (pathname.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
    return;
  }

  // Let the static asset middleware decide caching strategy
  if (staticAssetPattern.test(pathname)) {
    next();
    return;
  }

  if (req.method === 'GET' && htmlRequest) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
    return;
  }

  // Default caching for other responses
  res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  next();
}
