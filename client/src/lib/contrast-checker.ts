
/**
 * WCAG 2.1 Contrast Checker
 * Ensures all colors meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text/UI)
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// Verify all theme colors meet WCAG AA standards
export function verifyThemeContrast() {
  const results: Array<{
    pair: string;
    ratio: number;
    passes: boolean;
    level: 'AA' | 'AAA' | 'Fail';
  }> = [];

  // Test critical color pairs
  const testPairs = [
    { fg: '#FFFFFF', bg: '#0A0A0A', name: 'Primary Text on Background' },
    { fg: '#d4d4d8', bg: '#0A0A0A', name: 'Secondary Text on Background' },
    { fg: '#FFFFFF', bg: '#ef233c', name: 'Text on Primary Accent' },
    { fg: '#FFFFFF', bg: '#9F8FFF', name: 'Text on Secondary Accent' },
    { fg: '#0A0A0A', bg: '#FAFAFA', name: 'Light Mode Text on Background' },
  ];

  testPairs.forEach(({ fg, bg, name }) => {
    const ratio = getContrastRatio(fg, bg);
    const passesAA = ratio >= 4.5;
    const passesAAA = ratio >= 7;

    results.push({
      pair: name,
      ratio: Math.round(ratio * 100) / 100,
      passes: passesAA,
      level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'Fail',
    });
  });

  return results;
}
