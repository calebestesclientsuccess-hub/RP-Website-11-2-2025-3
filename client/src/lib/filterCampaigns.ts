import type { Campaign } from "@shared/schema";

/**
 * Zone metadata for fallback display sizing
 * Used when no cached campaign is available to prevent layout shift
 */
interface ZoneMetadata {
  displaySize: string;
  minHeight?: string;
}

/**
 * Zone fallback map - provides deterministic display sizes for each zone
 * Prevents layout shift on cold loads by reserving appropriate space
 */
const ZONE_FALLBACKS: Record<string, ZoneMetadata> = {
  // Hero zones - full-width banner layouts
  "hero-top": { displaySize: "hero", minHeight: "60vh" },
  "hero-center": { displaySize: "hero", minHeight: "60vh" },
  "hero-bottom": { displaySize: "hero", minHeight: "50vh" },
  
  // CTA zones - takeover or large formats
  "cta-top": { displaySize: "large", minHeight: "40vh" },
  "cta-center": { displaySize: "takeover", minHeight: "60vh" },
  "cta-bottom": { displaySize: "large", minHeight: "40vh" },
  
  // Content zones - standard formats
  "content-top": { displaySize: "standard" },
  "content-center": { displaySize: "standard" },
  "content-bottom": { displaySize: "standard" },
  
  // Sidebar zones - inline compact formats
  "sidebar-top": { displaySize: "inline" },
  "sidebar-center": { displaySize: "inline" },
  "sidebar-bottom": { displaySize: "inline" },
  
  // Article zones - inline to standard
  "article-top": { displaySize: "inline" },
  "article-inline": { displaySize: "inline" },
  "article-bottom": { displaySize: "inline" },
  
  // Form zones - standard formats
  "form-embed": { displaySize: "standard" },
  "lead-capture": { displaySize: "standard" },
  
  // Generic fallback
  "default": { displaySize: "standard" },
};

/**
 * Get fallback display size and minHeight for a zone
 * Used when no cached campaign is available
 */
export function getZoneFallback(zone: string): ZoneMetadata {
  return ZONE_FALLBACKS[zone] || ZONE_FALLBACKS["default"];
}

/**
 * Shared campaign filtering logic
 * Used by both useCampaigns hook and WidgetZone skeleton to ensure consistent filtering
 * 
 * @param campaigns - Array of campaigns to filter
 * @param options - Filter criteria
 * @returns Filtered campaigns array
 */
export function filterCampaigns(
  campaigns: Campaign[],
  options: {
    zone?: string;
    pageNames?: string[];
    displayAs?: "inline" | "popup";
  }
): Campaign[] {
  const { zone, pageNames, displayAs } = options;

  return campaigns.filter((campaign) => {
    // Filter by displayAs if specified
    if (displayAs && campaign.displayAs !== displayAs) {
      return false;
    }

    // Filter by zone if specified (for inline campaigns)
    if (zone && campaign.targetZone !== zone) {
      return false;
    }

    // Filter by page names if specified
    // IMPORTANT: If targetPages is empty or null, campaign targets ALL pages (wildcard)
    if (pageNames && pageNames.length > 0) {
      // If targetPages is empty or null, campaign targets all pages
      if (!campaign.targetPages || campaign.targetPages.length === 0) {
        // Match all pages (wildcard behavior - same as server)
      } else {
        // Check if any of the current page names match the campaign's target pages
        const hasMatchingPage = campaign.targetPages.some((targetPage) =>
          pageNames.includes(targetPage)
        );
        if (!hasMatchingPage) {
          return false;
        }
      }
    }

    // Only include active campaigns
    if (!campaign.isActive) {
      return false;
    }

    // Check date range if specified
    const now = new Date();
    if (campaign.startDate && new Date(campaign.startDate) > now) {
      return false;
    }
    if (campaign.endDate && new Date(campaign.endDate) < now) {
      return false;
    }

    return true;
  });
}
