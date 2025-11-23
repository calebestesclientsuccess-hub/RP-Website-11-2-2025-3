import { describe, it, expect } from "vitest";
import { evaluateSeoWarnings } from "../../client/src/lib/seo-gate";

describe("evaluateSeoWarnings", () => {
  it("detects long titles and descriptions", () => {
    const warnings = evaluateSeoWarnings({
      title: "a".repeat(61),
      description: "b".repeat(170),
    });
    expect(warnings).toEqual([
      "Meta title exceeds 60 characters (truncation likely).",
      "Meta description exceeds 160 characters (truncation likely).",
    ]);
  });

  it("flags non-HTTPS canonical URLs", () => {
    const warnings = evaluateSeoWarnings({
      title: "Valid Title",
      description: "Valid description".repeat(8),
      canonicalUrl: "http://example.com/post",
    });
    expect(warnings).toContain("Canonical URL must use HTTPS.");
  });

  it("returns empty array when inputs are clean", () => {
    const warnings = evaluateSeoWarnings({
      title: "Solid title under limit",
      description: "a".repeat(130),
      canonicalUrl: "https://example.com/post",
    });
    expect(warnings).toHaveLength(0);
  });
});


