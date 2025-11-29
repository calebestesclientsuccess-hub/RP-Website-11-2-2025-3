import { Request, Response, NextFunction } from "express";
import { isDevelopment } from "../config/env";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // In development mode, bypass auth check if no session exists
  // This allows testing without full login flow
  if (isDevelopment && (!req.session || !req.session.userId)) {
    return next();
  }
  
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

