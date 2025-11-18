
/**
 * Asset Whitelist Validation System
 * Ensures AI-generated scenes only reference valid, tenant-owned assets
 */

interface AssetCatalog {
  texts: Array<{ id: string; type: string; content: string }>;
  images: Array<{ id: string; url: string; alt: string }>;
  videos: Array<{ id: string; url: string; caption?: string }>;
  quotes: Array<{ id: string; quote: string; author: string }>;
}

export class AssetValidator {
  private catalog: AssetCatalog;
  
  constructor(catalog: AssetCatalog) {
    this.catalog = catalog;
  }

  /**
   * Validate that all asset IDs exist in the catalog
   */
  validateAssetIds(assetIds: string[]): {
    valid: boolean;
    invalidIds: string[];
    suggestions: string[];
  } {
    const allValidIds = new Set([
      ...this.catalog.texts.map(t => t.id),
      ...this.catalog.images.map(i => i.id),
      ...this.catalog.videos.map(v => v.id),
      ...this.catalog.quotes.map(q => q.id),
    ]);

    const invalidIds = assetIds.filter(id => !allValidIds.has(id));
    
    return {
      valid: invalidIds.length === 0,
      invalidIds,
      suggestions: this.getSuggestions(invalidIds),
    };
  }

  /**
   * Get asset type for a given ID
   */
  getAssetType(assetId: string): 'text' | 'image' | 'video' | 'quote' | null {
    if (this.catalog.texts.find(t => t.id === assetId)) return 'text';
    if (this.catalog.images.find(i => i.id === assetId)) return 'image';
    if (this.catalog.videos.find(v => v.id === assetId)) return 'video';
    if (this.catalog.quotes.find(q => q.id === assetId)) return 'quote';
    return null;
  }

  /**
   * Suggest valid asset IDs based on invalid ones (fuzzy matching)
   */
  private getSuggestions(invalidIds: string[]): string[] {
    const allValidIds = [
      ...this.catalog.texts.map(t => t.id),
      ...this.catalog.images.map(i => i.id),
      ...this.catalog.videos.map(v => v.id),
      ...this.catalog.quotes.map(q => q.id),
    ];

    return invalidIds.map(invalidId => {
      // Find closest match by string similarity
      const closest = allValidIds.reduce((best, current) => {
        const currentSimilarity = this.similarity(invalidId, current);
        const bestSimilarity = this.similarity(invalidId, best);
        return currentSimilarity > bestSimilarity ? current : best;
      }, allValidIds[0]);
      
      return `Replace '${invalidId}' with '${closest}'`;
    });
  }

  /**
   * Simple string similarity (Levenshtein-like)
   */
  private similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Get autocomplete suggestions for asset IDs
   */
  getAutocompleteSuggestions(partialId: string, limit = 10): string[] {
    const allValidIds = [
      ...this.catalog.texts.map(t => t.id),
      ...this.catalog.images.map(i => i.id),
      ...this.catalog.videos.map(v => v.id),
      ...this.catalog.quotes.map(q => q.id),
    ];

    return allValidIds
      .filter(id => id.toLowerCase().includes(partialId.toLowerCase()))
      .slice(0, limit);
  }
}
