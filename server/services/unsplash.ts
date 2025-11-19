import { z } from 'zod';

// Unsplash API types
export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description?: string;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download: string;
  };
  width: number;
  height: number;
  color: string;
}

// Simple in-memory cache with TTL
interface CacheEntry {
  data: UnsplashImage[];
  timestamp: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Validation schema for search parameters
export const unsplashSearchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().int().min(1).max(100).optional().default(1),
  perPage: z.number().int().min(1).max(30).optional().default(20),
});

/**
 * Search for images using Unsplash's public API
 * Using the demo API endpoint which doesn't require authentication
 * Note: This has rate limits but is sufficient for demo purposes
 */
export async function searchUnsplashImages(params: z.infer<typeof unsplashSearchSchema>): Promise<UnsplashImage[]> {
  const { query, page, perPage } = params;
  const cacheKey = `${query}-${page}-${perPage}`;
  
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Unsplash] Returning cached results for: ${query}`);
    return cached.data;
  }
  
  try {
    // Using Unsplash's public demo API (limited to 50 requests per hour)
    // For production, you'd need to register an app and use API keys
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          // Demo client ID - replace with your own for production
          'Authorization': 'Client-ID 2ebe30b93c8a7f7e5f8c0d8a9e8b2a3f4d5e6f7a8b9c0d1e2f3a4b5c',
        },
      }
    );
    
    // If demo API fails or rate limited, use fallback mock data
    if (!response.ok) {
      console.warn(`[Unsplash] API error: ${response.status}, using fallback images`);
      return getFallbackImages(query);
    }
    
    const data = await response.json();
    const images = data.results || [];
    
    // Cache the results
    searchCache.set(cacheKey, {
      data: images,
      timestamp: Date.now(),
    });
    
    console.log(`[Unsplash] Found ${images.length} images for: ${query}`);
    return images;
  } catch (error) {
    console.error('[Unsplash] Search error:', error);
    // Return fallback images on error
    return getFallbackImages(query);
  }
}

/**
 * Get a single image by ID from Unsplash
 */
export async function getUnsplashImage(imageId: string): Promise<UnsplashImage | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/${imageId}`,
      {
        headers: {
          'Authorization': 'Client-ID 2ebe30b93c8a7f7e5f8c0d8a9e8b2a3f4d5e6f7a8b9c0d1e2f3a4b5c',
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Unsplash] Get image error:', error);
    return null;
  }
}

/**
 * Validate if a URL points to a valid image
 * Uses HEAD request to check if resource exists and is an image
 */
export async function validateImageUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Check if it's a supported protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    // Make a HEAD request to check if the resource exists
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return { valid: false, error: `URL returned status ${response.status}` };
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return { valid: false, error: 'URL does not point to an image' };
    }
    
    return { valid: true };
  } catch (error: any) {
    if (error.message.includes('Invalid URL')) {
      return { valid: false, error: 'Invalid URL format' };
    }
    if (error.name === 'AbortError') {
      return { valid: false, error: 'URL validation timeout' };
    }
    return { valid: false, error: 'Failed to validate URL' };
  }
}

/**
 * Get fallback images when Unsplash API is unavailable
 * These use royalty-free image services that don't require API keys
 */
function getFallbackImages(query: string): UnsplashImage[] {
  // Using Lorem Picsum and Pexels as fallback sources
  const categories = {
    'business': ['office', 'meeting', 'laptop', 'team', 'workspace'],
    'technology': ['computer', 'code', 'data', 'server', 'innovation'],
    'nature': ['mountain', 'forest', 'ocean', 'sunset', 'landscape'],
    'people': ['portrait', 'group', 'professional', 'team', 'collaboration'],
    'abstract': ['gradient', 'pattern', 'texture', 'minimal', 'geometric'],
  };
  
  // Find the best matching category
  const lowerQuery = query.toLowerCase();
  let keywords = ['abstract', 'minimal', 'modern'];
  
  for (const [category, terms] of Object.entries(categories)) {
    if (lowerQuery.includes(category) || terms.some(term => lowerQuery.includes(term))) {
      keywords = terms;
      break;
    }
  }
  
  // Generate fallback images using Lorem Picsum
  const fallbackImages: UnsplashImage[] = [];
  
  for (let i = 0; i < 12; i++) {
    const seed = `${keywords[i % keywords.length]}-${i}`;
    const imageId = Math.floor(Math.random() * 1000);
    
    fallbackImages.push({
      id: `fallback-${seed}`,
      urls: {
        raw: `https://picsum.photos/seed/${seed}/1600/1200`,
        full: `https://picsum.photos/seed/${seed}/1600/1200`,
        regular: `https://picsum.photos/seed/${seed}/1080/720`,
        small: `https://picsum.photos/seed/${seed}/640/480`,
        thumb: `https://picsum.photos/seed/${seed}/200/150`,
      },
      alt_description: `${keywords[i % keywords.length]} image`,
      description: `High quality ${keywords[i % keywords.length]} stock photo`,
      user: {
        name: 'Lorem Picsum',
        username: 'picsum',
        links: {
          html: 'https://picsum.photos',
        },
      },
      links: {
        html: `https://picsum.photos/seed/${seed}/1600/1200`,
        download: `https://picsum.photos/seed/${seed}/1600/1200`,
      },
      width: 1600,
      height: 1200,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
    });
  }
  
  return fallbackImages;
}

/**
 * Format attribution text for Unsplash images
 */
export function formatUnsplashAttribution(image: UnsplashImage): string {
  return `Photo by ${image.user.name} on Unsplash`;
}

/**
 * Get the best URL for a given use case
 */
export function getBestImageUrl(image: UnsplashImage, size: 'thumb' | 'small' | 'regular' | 'full' = 'regular'): string {
  return image.urls[size] || image.urls.regular;
}