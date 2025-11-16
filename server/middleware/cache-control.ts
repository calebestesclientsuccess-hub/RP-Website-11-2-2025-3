
import { Request, Response, NextFunction } from 'express';

/**
 * Cache control middleware for different content types
 */

export function cacheRelatedContent(duration: number = 3600) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${duration}, s-maxage=${duration * 2}`);
    res.set('CDN-Cache-Control', `public, max-age=${duration * 4}`);
    next();
  };
}

export function cacheStaticContent(duration: number = 86400) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${duration}, immutable`);
    next();
  };
}

export function noCache() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
}
