
/**
 * Response Cache for Gemini API
 * Caches AI responses for 30min to reduce API calls
 */

interface CacheEntry {
  prompt: string;
  response: any;
  timestamp: number;
}

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Get cached response if available
   */
  get(prompt: string): any | null {
    const entry = this.cache.get(this.hashPrompt(prompt));
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(this.hashPrompt(prompt));
      return null;
    }
    
    console.log(`✅ Cache HIT for prompt (${prompt.substring(0, 50)}...)`);
    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(prompt: string, response: any): void {
    this.cache.set(this.hashPrompt(prompt), {
      prompt,
      response,
      timestamp: Date.now(),
    });
    console.log(`💾 Cached response for prompt (${prompt.substring(0, 50)}...)`);
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Hash prompt for cache key
   */
  private hashPrompt(prompt: string): string {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

// Singleton instance
export const responseCache = new ResponseCache();

// Cleanup every 10 minutes
setInterval(() => responseCache.cleanup(), 10 * 60 * 1000);
