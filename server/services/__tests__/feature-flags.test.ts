import { describe, it, expect } from "vitest";
import { resolveFeatureFlag } from "../feature-flags";
import { featureFlagRegistry } from "@shared/feature-flags";

describe("resolveFeatureFlag", () => {
  it("returns the explicit snapshot value when present", () => {
    const snapshot: Record<string, boolean> = { "page-branding": true };
    expect(resolveFeatureFlag(snapshot, "page-branding")).toBe(true);
  });

  it("falls back to registry defaults when snapshot is missing the flag", () => {
    const definition = featureFlagRegistry["page-branding"];
    expect(definition.defaultEnabled).toBe(false);
    const snapshot: Record<string, boolean> = {};
    expect(resolveFeatureFlag(snapshot, "page-branding")).toBe(false);
  });

  it("fails closed for unknown flags", () => {
    const snapshot: Record<string, boolean> = {};
    expect(resolveFeatureFlag(snapshot, "unknown-flag")).toBe(false);
  });
});

