
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { apiKeys, apiKeyUsageLogs } from "@shared/schema";
import { eq, and, gt, isNull, or, lt } from "drizzle-orm";
import { PASSWORD_HASH_ROUNDS } from "./password-validator";

const KEY_ROTATION_DAYS = 90; // Rotate keys every 90 days

export interface ApiKeyResult {
  id: string;
  key: string; // Only returned once during generation
  keyPrefix: string;
}

/**
 * Generate a cryptographically secure API key
 */
export function generateApiKey(): string {
  return `rp_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Create a new API key
 */
export async function createApiKey(
  tenantId: string,
  keyName: string,
  scopes: string[],
  createdBy: string,
  expiresAt?: Date
): Promise<ApiKeyResult> {
  const key = generateApiKey();
  const keyPrefix = key.substring(0, 8);
  const keyHash = await bcrypt.hash(key, PASSWORD_HASH_ROUNDS);

  const [apiKey] = await db.insert(apiKeys).values({
    tenantId,
    keyName,
    keyHash,
    keyPrefix,
    scopes,
    expiresAt,
    createdBy,
    isActive: true,
  }).returning();

  return {
    id: apiKey.id,
    key, // Only returned once
    keyPrefix,
  };
}

/**
 * Validate an API key
 */
export async function validateApiKey(
  key: string,
  requiredScope?: string
): Promise<{ valid: boolean; keyId?: string; tenantId?: string; error?: string }> {
  if (!key || key.length < 16 || !key.startsWith("rp_")) {
    return { valid: false, error: 'Invalid API key' };
  }
  const keyPrefix = key.substring(0, 8);
  const now = new Date();

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyPrefix, keyPrefix),
        eq(apiKeys.isActive, true),
        or(
          isNull(apiKeys.expiresAt),
          gt(apiKeys.expiresAt, now) // Fixed: Only valid if expiresAt > now
        )
      )
    );

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  const isValid = await bcrypt.compare(key, apiKey.keyHash);
  if (!isValid) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check expiration (Redundant due to query but good for safety)
  if (apiKey.expiresAt && now > new Date(apiKey.expiresAt)) {
    return { valid: false, error: 'API key expired' };
  }

  // Check scope if required
  if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
    return { valid: false, error: 'Insufficient permissions' };
  }

  // Update last used
  await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, apiKey.id));

  return { valid: true, keyId: apiKey.id, tenantId: apiKey.tenantId };
}
