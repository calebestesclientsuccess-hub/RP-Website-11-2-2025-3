
/**
 * Static Placeholder Asset Configuration
 * 
 * This defines the ONLY asset IDs the AI can use when generating scenes.
 * Users will map their real assets to these placeholders.
 */

export const PLACEHOLDER_CONFIG = {
  images: [
    "image-1",
    "image-2",
    "image-3",
    "image-4",
    "image-5",
    "image-6",
    "image-7",
    "image-8",
    "image-9",
    "image-10",
  ],
  videos: [
    "video-1",
    "video-2",
    "video-3",
  ],
  quotes: [
    "quote-1",
    "quote-2",
    "quote-3",
  ],
} as const;

// Type-safe placeholder ID union
export type PlaceholderImageId = typeof PLACEHOLDER_CONFIG.images[number];
export type PlaceholderVideoId = typeof PLACEHOLDER_CONFIG.videos[number];
export type PlaceholderQuoteId = typeof PLACEHOLDER_CONFIG.quotes[number];
export type PlaceholderId = PlaceholderImageId | PlaceholderVideoId | PlaceholderQuoteId;

// Get all valid placeholder IDs
export function getAllPlaceholderIds(): PlaceholderId[] {
  return [
    ...PLACEHOLDER_CONFIG.images,
    ...PLACEHOLDER_CONFIG.videos,
    ...PLACEHOLDER_CONFIG.quotes,
  ];
}

// Check if an ID is a valid placeholder
export function isValidPlaceholder(id: string): id is PlaceholderId {
  return getAllPlaceholderIds().includes(id as PlaceholderId);
}

// Get placeholder type
export function getPlaceholderType(id: PlaceholderId): 'image' | 'video' | 'quote' | null {
  if (PLACEHOLDER_CONFIG.images.includes(id as PlaceholderImageId)) return 'image';
  if (PLACEHOLDER_CONFIG.videos.includes(id as PlaceholderVideoId)) return 'video';
  if (PLACEHOLDER_CONFIG.quotes.includes(id as PlaceholderQuoteId)) return 'quote';
  return null;
}
