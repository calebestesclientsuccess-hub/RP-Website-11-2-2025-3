import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import { fromZodError } from "zod-validation-error";

export function validateRequest<T extends ZodType>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({
        error: "Validation failed",
        details: validationError.message,
      });
    }

    req.validated = result.data;
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      validated?: any;
    }
  }
}

