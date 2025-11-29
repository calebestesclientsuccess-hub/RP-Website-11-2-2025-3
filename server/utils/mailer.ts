import nodemailer from "nodemailer";
import { env, featureFlags } from "../config/env";
import { logger } from "../lib/logger";

type EmailRecipient = string | string[];

interface SendEmailOptions {
  to: EmailRecipient;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

let transporter: nodemailer.Transporter | null = null;

if (featureFlags.smtpEnabled) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || "587"),
    secure: Number(env.SMTP_PORT || "587") === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  transporter.verify().then(() => {
    logger.info("SMTP transporter verified successfully", { module: "smtp" });
  }).catch((error) => {
    logger.error("SMTP verification failed", { module: "smtp", error });
  });
}

export function smtpEnabled(): boolean {
  return featureFlags.smtpEnabled && Boolean(transporter);
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!transporter) {
    throw new Error("SMTP is not configured. Set SMTP_* environment variables to enable email sending.");
  }

  const fromName = env.SMTP_NAME?.trim();
  const fromAddress = fromName
    ? `"${fromName}" <${env.SMTP_FROM}>`
    : env.SMTP_FROM;

  await transporter.sendMail({
    from: fromAddress,
    to: Array.isArray(options.to) ? options.to.join(",") : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}

