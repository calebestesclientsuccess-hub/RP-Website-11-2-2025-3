import { Resend } from "resend";
import { env, featureFlags } from "../config/env";
import { logger } from "../lib/logger";

const resendClient = featureFlags.resendEnabled
  ? new Resend(env.RESEND_API_KEY)
  : null;

if (!featureFlags.resendEnabled && process.env.NODE_ENV !== "test") {
  logger.warn("[resend] Disabled – missing RESEND_API_KEY or RESEND_FROM_EMAIL.", {
    module: "resend",
  });
}

export async function getUncachableResendClient() {
  if (!resendClient || !featureFlags.resendEnabled) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable email sending.");
  }

  return {
    client: resendClient,
    fromEmail: env.RESEND_FROM_EMAIL,
  };
}
