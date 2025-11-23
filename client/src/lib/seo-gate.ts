export interface SeoGateInput {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export function evaluateSeoWarnings({
  title = "",
  description = "",
  canonicalUrl = "",
}: SeoGateInput): string[] {
  const warnings: string[] = [];
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  const normalizedCanonical = canonicalUrl.trim().toLowerCase();

  if (normalizedTitle && normalizedTitle.length > 60) {
    warnings.push("Meta title exceeds 60 characters (truncation likely).");
  }

  if (normalizedDescription && normalizedDescription.length > 160) {
    warnings.push("Meta description exceeds 160 characters (truncation likely).");
  }

  if (normalizedCanonical && !normalizedCanonical.startsWith("https://")) {
    warnings.push("Canonical URL must use HTTPS.");
  }

  return warnings;
}


