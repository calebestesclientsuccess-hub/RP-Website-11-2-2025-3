
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  GEMINI_API_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  RESEND_API_KEY: z.string().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  ALLOWED_ORIGINS: z.string().default('https://*.replit.app,https://*.repl.co'),
  MAX_REQUEST_SIZE: z.string().default('10mb'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export const config = envSchema.parse(process.env);

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';

export const securityConfig = {
  cors: {
    origin: config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    maxAge: 86400,
  },
  rateLimit: {
    windowMs: parseInt(config.RATE_LIMIT_WINDOW_MS),
    max: parseInt(config.RATE_LIMIT_MAX_REQUESTS),
  },
  session: {
    secret: config.SESSION_SECRET,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
};
