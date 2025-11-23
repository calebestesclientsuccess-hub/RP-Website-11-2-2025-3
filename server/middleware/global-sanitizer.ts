import { Router, type Request, type Response, type NextFunction } from "express";
import { sanitizeText } from "../middleware/input-sanitization";

const router = Router();

// Middleware to sanitize query/params globally (body sanitization handled per-route)
export const globalSanitizer = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeText(req.query[key] as string);
      }
    }
  }
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === "string") {
        req.params[key] = sanitizeText(req.params[key] as string);
      }
    }
  }
  next();
};

export default router;

