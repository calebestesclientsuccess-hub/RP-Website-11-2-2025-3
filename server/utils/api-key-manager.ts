
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { apiKeys, apiKeyUsageLogs } from '@shared/schema';
import { eq, and, lt, isNull, or } from 'drizzle-orm';

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
  const keyHash = await bcrypt.hash(key, 10);

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
  const keyPrefix = key.substring(0, 8);

  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyPrefix, keyPrefix),
        eq(apiKeys.isActive, true),
        or(
          isNull(apiKeys.expiresAt),
          lt(apiKeys.expiresAt, new Date())
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

  // Check expiration
  if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
    return { valid: false, error: 'API key expired' };
  }

  // Check scope if required
  if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
    return { valid: false, error: 'Insufficient permissions' };
  }

  // Update usage tracking
  await db
    .update(apiKeys)
    .set({
      lastUsedAt: new Date(),
      usageCount: apiKey.usageCount + 1,
    })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    valid: true,
    keyId: apiKey.id,
    tenantId: apiKey.tenantId,
  };
}

/**
 * Rotate an API key (creates new key, marks old as rotated)
 */
export async function rotateApiKey(
  oldKeyId: string,
  createdBy: string
): Promise<ApiKeyResult> {
  const [oldKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, oldKeyId));

  if (!oldKey) {
    throw new Error('API key not found');
  }

  // Create new key
  const newKeyResult = await createApiKey(
    oldKey.tenantId,
    oldKey.keyName,
    oldKey.scopes,
    createdBy,
    oldKey.expiresAt || undefined
  );

  // Mark old key as rotated
  await db
    .update(apiKeys)
    .set({
      isActive: false,
      rotatedAt: new Date(),
      rotatedFrom: newKeyResult.id,
    })
    .where(eq(apiKeys.id, oldKeyId));

  return newKeyResult;
}

/**
 * Auto-rotate keys older than rotation period
 */
export async function autoRotateExpiredKeys(createdBy: string): Promise<number> {
  const rotationDate = new Date();
  rotationDate.setDate(rotationDate.getDate() - KEY_ROTATION_DAYS);

  const expiredKeys = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.isActive, true),
        lt(apiKeys.createdAt, rotationDate),
        isNull(apiKeys.rotatedAt)
      )
    );

  let rotatedCount = 0;
  for (const key of expiredKeys) {
    try {
      await rotateApiKey(key.id, createdBy);
      rotatedCount++;
    } catch (error) {
      console.error(`Failed to rotate key ${key.id}:`, error);
    }
  }

  return rotatedCount;
}

/**
 * Log API key usage
 */
export async function logApiKeyUsage(
  keyId: string,
  endpoint: string,
  method: string,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  statusCode: number,
  responseTime: number
): Promise<void> {
  await db.insert(apiKeyUsageLogs).values({
    apiKeyId: keyId,
    endpoint,
    method,
    ipAddress,
    userAgent,
    statusCode,
    responseTime,
  });
}
