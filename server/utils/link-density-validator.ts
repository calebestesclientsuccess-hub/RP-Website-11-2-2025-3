
/**
 * Validates that internal links don't exceed recommended density
 */

interface LinkDensityReport {
  isValid: boolean;
  currentDensity: number;
  recommendedMax: number;
  warnings: string[];
}

/**
 * Calculate link density in content
 * Recommended: 2-3% internal links, max 5%
 */
export function validateLinkDensity(content: string): LinkDensityReport {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  
  // Count markdown links
  const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const internalLinks = linkMatches.filter(link => link.includes('/blog/'));
  
  const currentDensity = (internalLinks.length / totalWords) * 100;
  const recommendedMax = 5.0;
  
  const warnings: string[] = [];
  
  if (currentDensity > recommendedMax) {
    warnings.push(`Link density (${currentDensity.toFixed(2)}%) exceeds recommended maximum (${recommendedMax}%)`);
  }
  
  if (currentDensity > 3.0 && currentDensity <= recommendedMax) {
    warnings.push(`Link density (${currentDensity.toFixed(2)}%) is above optimal range (2-3%)`);
  }
  
  return {
    isValid: currentDensity <= recommendedMax,
    currentDensity,
    recommendedMax,
    warnings
  };
}

/**
 * Find optimal positions for link insertion based on content structure
 */
export function findOptimalLinkPositions(content: string, maxLinks: number = 3): number[] {
  const paragraphs = content.split(/\n\n+/);
  const positions: number[] = [];
  
  // Distribute links evenly across content
  const interval = Math.floor(paragraphs.length / (maxLinks + 1));
  
  for (let i = 1; i <= maxLinks && i * interval < paragraphs.length; i++) {
    const paragraphIndex = i * interval;
    const currentPosition = paragraphs.slice(0, paragraphIndex).join('\n\n').length;
    positions.push(currentPosition);
  }
  
  return positions;
}
