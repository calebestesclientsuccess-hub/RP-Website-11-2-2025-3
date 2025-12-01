import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

type InMemoryEntry = {
  value: string;
  expiresAt?: number;
};

const createInMemoryRedis = () => {
  const store = new Map<string, InMemoryEntry>();

  const withinTtl = (entry: InMemoryEntry | undefined) => {
    if (!entry) return false;
    if (!entry.expiresAt) return true;
    return entry.expiresAt > Date.now();
  };

  return {
    async get(key: string) {
      const entry = store.get(key);
      if (withinTtl(entry)) {
        return entry!.value;
      }
      store.delete(key);
      return null;
    },
    async set(key: string, value: string, mode?: string, ttlMs?: number) {
      const entry: InMemoryEntry = { value };
      if (mode === "PX" && typeof ttlMs === "number") {
        entry.expiresAt = Date.now() + ttlMs;
      }
      store.set(key, entry);
    },
    async del(...keys: string[]) {
      keys.forEach((key) => store.delete(key));
    },
    async pttl(key: string) {
      const entry = store.get(key);
      if (!withinTtl(entry)) {
        store.delete(key);
        return -2;
      }
      if (!entry!.expiresAt) {
        return -1;
      }
      return entry!.expiresAt! - Date.now();
    },
    on() {
      // no-op for compatibility
    },
  };
};

// Check MOCK_REDIS before importing anything
const useMockRedis = process.env.MOCK_REDIS === "true" || !env.REDIS_URL;

export const redis = useMockRedis
  ? createInMemoryRedis()
  : new Redis(env.REDIS_URL!, {
        maxRetriesPerRequest: 3,
        // Enable lazy connect to check eviction policy after connection
        lazyConnect: false,
      });

if (useMockRedis) {
  console.log("[Redis] Using in-memory mock Redis (MOCK_REDIS=true or REDIS_URL missing)");
}

// Track if we've already warned about eviction policy
let evictionPolicyWarningLogged = false;

/**
 * Check Redis eviction policy and warn if it's not suitable for session storage.
 * Sessions require "noeviction" policy to prevent unexpected user logouts.
 */
async function checkEvictionPolicy() {
  if (useMockRedis || evictionPolicyWarningLogged) {
    return;
  }

  try {
    const info = await (redis as Redis).info("memory");
    const policyMatch = info.match(/maxmemory_policy:(\w+)/);
    const policy = policyMatch?.[1];

    if (policy && policy !== "noeviction") {
      evictionPolicyWarningLogged = true;
      logger.warn(
        `[Redis] Eviction policy is "${policy}". For session storage, "noeviction" is recommended. ` +
        `Current policy may cause session data loss under memory pressure. ` +
        `Configure your Redis instance with: CONFIG SET maxmemory-policy noeviction`,
        { module: "redis", evictionPolicy: policy }
      );
    }
  } catch (err) {
    // Non-critical - just skip the check
    if (process.env.NODE_ENV !== "production") {
      console.log("[redis] Could not check eviction policy:", err instanceof Error ? err.message : err);
    }
  }
}

if (useMockRedis) {
  // Provide minimal event interface
  redis.on = () => {};
} else {
  redis.on("error", (error) => {
    console.error("Redis error:", error);
  });

  redis.on("connect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[redis] connected");
    }
    // Check eviction policy after connection is established
    checkEvictionPolicy();
  });

  redis.on("ready", () => {
    // Also check on ready in case connect fires before full initialization
    checkEvictionPolicy();
  });
}

