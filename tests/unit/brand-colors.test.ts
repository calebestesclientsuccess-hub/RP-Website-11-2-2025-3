import { describe, it, expect } from "vitest";
import {
  brandColorsPayloadSchema,
  ensureBrandColorsDocument,
  layersFromLegacyColors,
  legacyFromLayers,
  DEFAULT_BRAND_COLOR_LAYERS,
  MIN_COLOR_LAYERS,
} from "@shared/brandColors";

describe("brand color schema + utilities", () => {
  it("enforces minimum of two prioritized layers", () => {
    const singleLayer = {
      layers: [
        {
          role: "Primary",
          hex: "#111827",
          importance: 1,
          usage: "background" as const,
        },
      ],
    };

    expect(() => brandColorsPayloadSchema.parse(singleLayer)).toThrow(
      /at least 2 color layers/i,
    );
  });

  it("normalizes custom layers by clamping order + casing", () => {
    const parsed = brandColorsPayloadSchema.parse({
      layers: [
        {
          role: "primary palette",
          hex: "#111827",
          importance: 5,
          usage: "background",
        },
        {
          role: "SECONDARY",
          hex: "f4f4f5",
          importance: 3,
          usage: "text",
        },
        {
          role: "Accent",
          hex: "#F97316",
          importance: 2,
          usage: "accent",
        },
      ],
    });

    expect(parsed.layers).toHaveLength(3);
    expect(parsed.layers[0]).toMatchObject({
      role: "primary palette",
      hex: "#111827",
      importance: 1,
    });
    expect(parsed.layers[1]).toMatchObject({
      role: "SECONDARY",
      hex: "#F4F4F5",
      importance: 2,
    });
  });

  it("hydrates missing layers from defaults to keep steps in sync", () => {
    const { layers } = ensureBrandColorsDocument({
      primary: "#0F0F0F",
    });

    expect(layers).toHaveLength(MIN_COLOR_LAYERS);
    expect(layers[0]).toMatchObject({ role: "Primary", hex: "#0F0F0F" });
  });

  it("converts legacy maps to layered payloads and back again", () => {
    const layers = layersFromLegacyColors({
      primary: "#111111",
      secondary: "#222222",
      accent: "#333333",
      neutral: "#444444",
    });

    expect(layers).toHaveLength(4);
    expect(layers[0].usage).toBe("background");
    expect(layers[1].usage).toBe("text");

    const legacy = legacyFromLayers([
      ...layers,
      {
        role: "Support",
        hex: "#555555",
        importance: 5,
        usage: "neutral",
      },
    ]);

    expect(legacy).toMatchObject({
      primary: "#111111",
      secondary: "#222222",
      accent: "#333333",
      neutral: "#444444",
    });
  });

  it("keeps ordering stable when defaults mix with user layers", () => {
    const custom = [
      ...DEFAULT_BRAND_COLOR_LAYERS.slice(0, 2),
      {
        role: "CTA",
        hex: "#FF0000",
        importance: 5,
        usage: "accent" as const,
      },
    ];
    const { layers } = ensureBrandColorsDocument({ layers: custom });

    expect(layers.map((layer) => layer.importance)).toEqual([1, 2, 3]);
    expect(layers[2].role).toBe("CTA");
  });
});


