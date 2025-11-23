import cors, { type CorsOptions } from "cors";
import { securityConfig } from "../config/production";

const wildcardToRegExp = (pattern: string) => {
  const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");
  const regexReady = escaped.replace(/\*/g, ".*");
  return new RegExp(`^${regexReady}$`, "i");
};

const allowedPatterns = securityConfig.cors.origin
  .map((origin) => origin.trim())
  .filter(Boolean);

const originMatchers = allowedPatterns.map((pattern) => {
  if (pattern === "*") {
    return () => true;
  }
  if (pattern.includes("*")) {
    const regex = wildcardToRegExp(pattern);
    return (origin: string) => regex.test(origin);
  }
  return (origin: string) => origin === pattern;
});

const corsOptions: CorsOptions = {
  credentials: securityConfig.cors.credentials,
  maxAge: securityConfig.cors.maxAge,
  origin: (origin, callback) => {
    if (!origin) {
      // Allow same-origin or non-browser clients
      return callback(null, true);
    }

    const isAllowed = originMatchers.some((matcher) => matcher(origin));
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
};

export const corsMiddleware = cors(corsOptions);


