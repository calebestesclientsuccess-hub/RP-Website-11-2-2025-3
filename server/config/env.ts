import "dotenv/config";
import { z } from "zod";
import { logger } from "../lib/logger";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default(
        (() => {
          if (process.env.NODE_ENV === "production") return "production";
          if (process.env.NODE_ENV === "test") return "test";
          return "development";
        })(),
      ),
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string().min(
      32,
      "SESSION_SECRET must be at least 32 characters",
    ),
    AI_INTEGRATIONS_GEMINI_BASE_URL: z.string().url().optional(),
    GOOGLE_AI_KEY: z.string().default(""),
    CLOUDINARY_CLOUD_NAME: z.string().default(""),
    CLOUDINARY_API_KEY: z.string().default(""),
    CLOUDINARY_API_SECRET: z.string().default(""),
    REPLICATE_API_TOKEN: z.string().optional(),
    RESEND_API_KEY: z.string().default(""),
    RESEND_FROM_EMAIL: z.union([z.string().email(), z.literal("")]).default(""),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z
      .string()
      .regex(/^\d+$/, "SMTP_PORT must be a number")
      .default("587"),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    SMTP_FROM: z.union([z.string().email(), z.literal("")]).default(""),
    SMTP_NAME: z.string().default(""),
    HELPSCOUT_EMAIL: z.string().email().optional(),
    SECURITY_ALERT_WEBHOOK_URL: z.string().url().optional(),
    SECURITY_ALERT_EMAIL: z.string().email().optional(),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    REDIS_URL: z.string().optional(),
    // Add alias for Vercel KV
    redis_REDIS_URL: z.string().optional(),
    APP_BASE_URL: z.string().url().default("http://localhost:50005"),
    REPLICATE_WEBHOOK_SECRET: z.string().default(""),
    PUBLIC_TENANT_ID: z.string().min(1, "PUBLIC_TENANT_ID is required in production").optional(),
    ALLOWED_ORIGINS: z
      .string()
      .default("http://localhost:5173,http://localhost:50005"),
    MAX_REQUEST_SIZE: z.string().default("10mb"),
    RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
    RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
    PORT: z
      .string()
      .regex(/^\d+$/, "PORT must be a number")
      .optional(),
    DEV_TENANT_FALLBACK: z.string().optional(),
    TEST_DATABASE_URL: z.string().url().optional(),
    MAX_RESPONSE_SIZE_BYTES: z
      .string()
      .regex(/^\d+$/, "MAX_RESPONSE_SIZE_BYTES must be a number")
      .default("1048576"),
  })
  .refine(
    (data) =>
      data.NODE_ENV !== "production" ||
      Boolean(data.PUBLIC_TENANT_ID && data.PUBLIC_TENANT_ID.trim().length > 0),
    {
      message: "Set PUBLIC_TENANT_ID for production deployments",
      path: ["PUBLIC_TENANT_ID"],
    },
  );

const googleAiKeyCandidates = [
  { value: process.env.GOOGLE_AI_KEY, label: "GOOGLE_AI_KEY" },
  { value: process.env.GPT_3_PRO_THINKING_KEY, label: "GPT_3_PRO_THINKING_KEY" },
  { value: process.env.NANA_BANNA_THINKING_KEY, label: "NANA_BANNA_THINKING_KEY" },
  { value: process.env.NANA_BANNA_PRO_KEY, label: "NANA_BANNA_PRO_KEY" },
  { value: process.env.AI_INTEGRATIONS_GEMINI_API_KEY, label: "AI_INTEGRATIONS_GEMINI_API_KEY" },
  { value: process.env.GEMINI_API_KEY, label: "GEMINI_API_KEY" },
];

const resolvedGoogleAiKeyEntry = googleAiKeyCandidates.find(
  (candidate) => candidate.value && candidate.value.trim().length > 0,
);

const resolvedGoogleAiKey = resolvedGoogleAiKeyEntry?.value?.trim();

const parsedEnv = envSchema.safeParse({
  ...process.env,
  GOOGLE_AI_KEY: resolvedGoogleAiKey,
});

const logEnvWarning = (message: string) => {
  if (process.env.NODE_ENV === "test") return;
  logger.warn(message, { module: "env" });
};

if (
  !process.env.GOOGLE_AI_KEY &&
  resolvedGoogleAiKeyEntry &&
  resolvedGoogleAiKeyEntry.label !== "GOOGLE_AI_KEY"
) {
  logEnvWarning(
    `GOOGLE_AI_KEY not set. Falling back to ${resolvedGoogleAiKeyEntry.label}. Please migrate to GOOGLE_AI_KEY.`,
  );
}

if (!parsedEnv.success) {
  logger.error("Invalid environment configuration", {
    module: "env",
    errors: parsedEnv.error.format(),
  });
  throw new Error("Invalid environment configuration");
}

const forbiddenConnectorVars = [
  "REPLIT_CONNECTORS_HOSTNAME",
  "REPL_IDENTITY",
  "WEB_REPL_RENEWAL",
].filter((name) => process.env[name]);

if (forbiddenConnectorVars.length > 0) {
  throw new Error(
    `Remove deprecated Replit connector environment variables: ${forbiddenConnectorVars.join(
      ", ",
    )}`,
  );
}

export const env = parsedEnv.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

const cloudinaryEnabled =
  Boolean(env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(env.CLOUDINARY_API_KEY) &&
  Boolean(env.CLOUDINARY_API_SECRET);

if (!cloudinaryEnabled) {
  logEnvWarning(
    "Cloudinary credentials missing; media uploads and asset hydration features are disabled.",
  );
}

const resendEnabled =
  Boolean(env.RESEND_API_KEY) && Boolean(env.RESEND_FROM_EMAIL);

const smtpEnabled =
  Boolean(env.SMTP_HOST) &&
  Boolean(env.SMTP_USER) &&
  Boolean(env.SMTP_PASS) &&
  Boolean(env.SMTP_FROM);

if (!smtpEnabled && !resendEnabled) {
  logEnvWarning(
    "SMTP/Resend credentials missing; transactional email features are disabled.",
  );
}

const googleAiEnabled = Boolean(env.GOOGLE_AI_KEY);
if (!googleAiEnabled) {
  logEnvWarning("GOOGLE_AI_KEY not configured; Gemini-powered features are disabled.");
}

export const featureFlags = {
  cloudinaryEnabled,
  resendEnabled,
  smtpEnabled,
  googleAiEnabled,
};

export const securityConfig = {
  cors: {
    origin: env.ALLOWED_ORIGINS.split(","),
    credentials: true,
    maxAge: 86400,
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
};

