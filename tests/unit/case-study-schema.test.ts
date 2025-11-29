import { describe, it, expect } from "vitest";
import {
  caseStudyTextBlockSchema,
  caseStudyCarouselBlockSchema,
  caseStudyStatGridSchema,
  caseStudyContentSchema,
} from "@shared/schema";

describe("Case Study Zod Schemas", () => {
  it("accepts valid text blocks", () => {
    const block = caseStudyTextBlockSchema.parse({
      type: "text",
      id: "block-1",
      content: "## Heading\n\nBody copy",
      format: "markdown",
      layout: "center",
    });

    expect(block.layout).toBe("center");
  });

  it("rejects text blocks without id", () => {
    expect(() =>
      caseStudyTextBlockSchema.parse({
        type: "text",
        content: "Missing id",
      }),
    ).toThrowError();
  });

  it("accepts carousel blocks with either mediaId or url per item", () => {
    const block = caseStudyCarouselBlockSchema.parse({
      type: "carousel",
      id: "carousel-1",
      items: [
        { mediaId: "media-1", type: "image", caption: "From library" },
        { url: "https://example.com/video.mp4", type: "video" },
      ],
    });

    expect(block.items).toHaveLength(2);
  });

  it("validates stat grid blocks", () => {
    const block = caseStudyStatGridSchema.parse({
      type: "stat-grid",
      id: "stat-1",
      stats: [
        { label: "Metric A", value: "123%" },
        { label: "Metric B", value: "42" },
      ],
    });

    expect(block.stats[0].label).toBe("Metric A");
  });

  it("dedicates sections with mixed blocks", () => {
    const content = caseStudyContentSchema.parse({
      sections: [
        {
          id: "section-1",
          title: "Hero",
          theme: { backgroundColor: "#000000" },
          blocks: [
            {
              type: "text",
              id: "text-1",
              content: "Hero body",
            },
            {
              type: "stat-grid",
              id: "stats-1",
              stats: [
                { label: "NPS", value: "78" },
                { label: "Growth", value: "230%" },
              ],
            },
          ],
        },
      ],
    });

    expect(content.sections[0].blocks).toHaveLength(2);
  });

  it("rejects payloads without sections", () => {
    expect(() => caseStudyContentSchema.parse({ sections: [] })).toThrowError();
  });
});

