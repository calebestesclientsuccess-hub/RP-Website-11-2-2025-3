import { describe, it, expect } from "vitest";
import { getContrastColor, applyTheme } from "../color-utils";

describe("color-utils", () => {
  it("computes contrast color for dark and light values", () => {
    expect(getContrastColor("#000000")).toBe("white");
    expect(getContrastColor("#ffffff")).toBe("black");
  });

  it("returns CSS custom properties from applyTheme", () => {
    const style = applyTheme({
      backgroundColor: "#123456",
      textColor: "#abcdef",
      primaryColor: "#fedcba",
    });

    expect(style["--theme-bg"]).toBe("#123456");
    expect(style["--theme-text"]).toBe("#abcdef");
    expect(style["--theme-primary"]).toBe("#fedcba");
  });

  it("auto-computes text contrast when not provided", () => {
    const style = applyTheme({
      backgroundColor: "#000000",
    });

    expect(style["--theme-text"]).toBe("white");
  });
});

