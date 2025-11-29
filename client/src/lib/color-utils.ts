import type { CSSProperties } from "react";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const transform = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
  );
};

export const getContrastColor = (hex: string): "black" | "white" => {
  try {
    const rgb = hexToRgb(hex);
    return luminance(rgb) > 0.5 ? "black" : "white";
  } catch {
    return "black";
  }
};

type ThemeInput = {
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
};

export const applyTheme = (theme?: ThemeInput): CSSProperties => {
  if (!theme) return {};

  const bg = theme.backgroundColor;
  const text = theme.textColor || (bg ? getContrastColor(bg) : undefined);
  const primary = theme.primaryColor || text;
  const border =
    bg && text
      ? text === "black"
        ? "rgba(0,0,0,0.12)"
        : "rgba(255,255,255,0.25)"
      : undefined;

  const style: Record<string, string> = {};
  if (bg) style["--theme-bg"] = bg;
  if (text) style["--theme-text"] = text;
  if (primary) style["--theme-primary"] = primary;
  if (border) style["--theme-border"] = border;

  return style as CSSProperties;
};

