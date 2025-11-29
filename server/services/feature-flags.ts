import type { Request, Response, NextFunction } from "express";
import type { FeatureFlag } from "@shared/schema";
import {
  featureFlagRegistry,
  featureFlagList,
  type FeatureFlagDefinition,
  type FeatureFlagKey,
} from "@shared/feature-flags";
import { storage } from "../storage";
import { DEFAULT_TENANT_ID } from "../middleware/tenant";

type FlagSnapshot = Record<string, boolean>;

function buildDefaultSnapshot(): FlagSnapshot {
  return featureFlagList.reduce<FlagSnapshot>((acc, definition) => {
    acc[definition.key] = definition.defaultEnabled;
    return acc;
  }, {});
}

function applyOverrides(snapshot: FlagSnapshot, overrides: FeatureFlag[]): FlagSnapshot {
  for (const flag of overrides) {
    if (!flag?.flagKey) continue;
    snapshot[flag.flagKey] = flag.enabled ?? snapshot[flag.flagKey] ?? false;
  }
  return snapshot;
}

export async function loadFeatureFlagsForRequest(req: Request): Promise<FlagSnapshot> {
  if (req.featureFlags) {
    return req.featureFlags;
  }

  const tenantId = req.session?.tenantId || req.tenantId || DEFAULT_TENANT_ID;
  let snapshot = buildDefaultSnapshot();

  try {
    const dbFlags = await storage.getAllFeatureFlags(tenantId);
    snapshot = applyOverrides(snapshot, dbFlags);
  } catch (error) {
    console.error("Error loading feature flags, falling back to defaults:", error);
  }

  req.featureFlags = snapshot;
  return snapshot;
}

export function resolveFeatureFlag(
  snapshot: FlagSnapshot,
  flagKey: string,
): boolean {
  if (flagKey in snapshot) {
    return snapshot[flagKey];
  }

  const definition = featureFlagRegistry[flagKey];
  return definition?.defaultEnabled ?? false;
}

export async function isFeatureEnabled(req: Request, flagKey: FeatureFlagKey): Promise<boolean> {
  const snapshot = await loadFeatureFlagsForRequest(req);
  return resolveFeatureFlag(snapshot, flagKey);
}

interface GateRouteOptions {
  statusCode?: number;
  message?: string;
  logContext?: string;
}

export function gateRoute(
  flagKey: FeatureFlagKey,
  options?: GateRouteOptions,
) {
  const { statusCode = 404, message = "Not found", logContext } = options ?? {};

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enabled = await isFeatureEnabled(req, flagKey);
      if (enabled) {
        return next();
      }

      console.warn(
        `[FeatureFlags] Blocked flag "${flagKey}" for ${req.method} ${req.path}${
          logContext ? ` (${logContext})` : ""
        }`,
      );

      if (statusCode === 404) {
        return res.status(404).json({ error: message });
      }

      return res.status(statusCode).json({ error: message });
    } catch (error) {
      console.error(`Error evaluating feature flag "${flagKey}":`, error);
      return res.status(500).json({ error: "Feature flag evaluation failed" });
    }
  };
}

export async function getFeatureFlagsWithMetadata(tenantId: string) {
  const snapshot = buildDefaultSnapshot();
  let dbFlags: FeatureFlag[] = [];

  try {
    dbFlags = await storage.getAllFeatureFlags(tenantId);
    applyOverrides(snapshot, dbFlags);
  } catch (error) {
    console.error("Error loading feature flags for metadata:", error);
  }

  const definitionsWithState: Array<FeatureFlagDefinition & { enabled: boolean; id?: string }> =
    featureFlagList.map((definition) => ({
      ...definition,
      enabled: snapshot[definition.key],
      id: dbFlags.find((flag) => flag.flagKey === definition.key)?.id,
    }));

  const legacyFlags = dbFlags.filter((flag) => !featureFlagRegistry[flag.flagKey]);
  for (const flag of legacyFlags) {
    definitionsWithState.push({
      key: flag.flagKey,
      name: flag.flagName || flag.flagKey,
      description: flag.description ?? "Legacy flag (not present in registry)",
      scope: "component",
      defaultEnabled: flag.enabled,
      enabled: flag.enabled,
      id: flag.id,
    });
  }

  return definitionsWithState;
}

