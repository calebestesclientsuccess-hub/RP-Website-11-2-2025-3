
import { Request, Response, NextFunction } from "express";
import validator from "validator";

// Configure DOMPurify for strict sanitization (used if available)
const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
};

// Lazy-load DOMPurify to avoid jsdom ESM issues on Vercel
let DOMPurify: any = null;
let domPurifyLoadAttempted = false;

async function loadDOMPurify() {
  if (domPurifyLoadAttempted) return DOMPurify;
  domPurifyLoadAttempted = true;
  try {
    const module = await import("isomorphic-dompurify");
    DOMPurify = module.default;
  } catch (err) {
    console.warn("[input-sanitization] DOMPurify not available, using fallback HTML sanitization");
  }
  return DOMPurify;
}

/**
 * Simple HTML tag stripper as fallback when DOMPurify isn't available
 */
function stripHtmlTags(html: string): string {
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove style tags and their content
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  return clean;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (DOMPurify) {
    return DOMPurify.sanitize(html, sanitizeConfig);
  }
  // Fallback: strip dangerous content
  return stripHtmlTags(html);
}

// Try to load DOMPurify at startup (non-blocking)
loadDOMPurify().catch(() => {});

/**
 * Sanitize plain text input
 */
export function sanitizeText(text: string): string {
  return validator.escape(text.trim());
}

interface SanitizeOptions {
  excludeFields?: string[];
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(
  obj: any,
  htmlFields: string[] = [],
  excludeFields: Set<string> = new Set(),
): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, htmlFields, excludeFields));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (excludeFields.has(key)) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "string") {
      // Rich text fields get HTML sanitization
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      } else {
        // Other strings get escaped
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value, htmlFields, excludeFields);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware to sanitize request body
 * @param htmlFields - Array of field names that contain rich text/HTML
 */
export function sanitizeInput(
  htmlFields: string[] = [],
  options?: SanitizeOptions,
) {
  const excludeFields = new Set(options?.excludeFields ?? []);
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body, htmlFields, excludeFields);
    }
    next();
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
}

/**
 * Prevent SQL injection by escaping special characters
 */
export function escapeSql(input: string): string {
  return input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0": return "\\0";
      case "\x08": return "\\b";
      case "\x09": return "\\t";
      case "\x1a": return "\\z";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  });
}
