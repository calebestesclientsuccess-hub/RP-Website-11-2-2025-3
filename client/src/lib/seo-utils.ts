
/**
 * Validates that alt text is descriptive and not spammy
 */
export function validateAltText(alt: string): boolean {
  if (!alt || alt.trim().length === 0) return false;
  if (alt.length < 5) return false;
  if (alt.length > 125) return false;
  
  // Check for keyword stuffing
  const words = alt.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words);
  
  // If less than 50% unique words, likely keyword stuffing
  if (uniqueWords.size / wordCount < 0.5) return false;
  
  return true;
}

/**
 * Generates SEO-friendly URL slugs
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates meta description length
 */
export function validateMetaDescription(description: string): {
  valid: boolean;
  warning?: string;
} {
  const length = description.length;
  
  if (length < 120) {
    return { valid: false, warning: 'Meta description too short (min 120 chars)' };
  }
  
  if (length > 160) {
    return { valid: false, warning: 'Meta description too long (max 160 chars)' };
  }
  
  return { valid: true };
}

/**
 * Extracts headings from content for TOC and schema
 */
export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, ''); // Strip HTML tags
    const id = generateSlug(text);
    
    headings.push({ level, text, id });
  }
  
  return headings;
}
