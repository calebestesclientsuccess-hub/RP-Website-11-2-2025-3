import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CaseStudyWrapper } from "../CaseStudyWrapper";

describe("CaseStudyWrapper", () => {
  it("applies CSS variables when theme is provided", () => {
    const html = renderToStaticMarkup(
      <CaseStudyWrapper
        theme={{
          backgroundColor: "#101010",
          textColor: "#fefefe",
          primaryColor: "#ff0000",
        }}
      >
        <span>Content</span>
      </CaseStudyWrapper>,
    );

    expect(html).toContain('class="case-study-root');
    expect(html).toContain('data-theme-applied="true"');
    expect(html).toContain("--theme-bg:#101010");
    expect(html).toContain("--theme-text:#fefefe");
    expect(html).toContain("<span>Content</span>");
  });

  it("renders without theme data attributes when theme is absent", () => {
    const html = renderToStaticMarkup(
      <CaseStudyWrapper>
        <p>Default</p>
      </CaseStudyWrapper>,
    );

    expect(html).toContain('data-theme-applied="false"');
    expect(html).toContain("<p>Default</p>");
  });
});

