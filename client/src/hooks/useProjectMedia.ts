import { useMemo } from "react";
import type { ProjectMediaAsset } from "@shared/schema";

interface Layer2Section {
  id: string;
  heading: string;
  mediaType: "none" | "image" | "video" | "image-carousel" | "video-carousel" | "mixed-carousel" | "grid-2" | "grid-3";
  mediaConfig?: {
    mediaId?: string;
    url?: string;
    items?: Array<{
      mediaId?: string;
      url: string;
      type: "image" | "video";
      caption?: string;
    }>;
  };
}

interface HeroMediaConfig {
  videoUrl?: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

interface ProjectData {
  id: string;
  thumbnailImage?: string;
  heroMediaType?: "image" | "video";
  heroMediaConfig?: HeroMediaConfig;
  modalMediaAssets?: ProjectMediaAsset[] | null;
  modalMediaUrls?: string[] | null;
  galleryImages?: string[];
  mediaAssets?: ProjectMediaAsset[];
}

export interface AggregatedMediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  source: "hero" | "layer2" | "modal" | "gallery" | "legacy";
  sectionId?: string;
  sectionHeading?: string;
  caption?: string;
  alt?: string;
}

/**
 * Aggregates all media from a project into a single flat array
 * Sources: Hero media, Layer 2 sections, modal media, gallery images
 */
export function useProjectMedia(
  project: ProjectData | null | undefined,
  layer2Sections: Layer2Section[] | null | undefined
): AggregatedMediaItem[] {
  return useMemo(() => {
    if (!project) return [];

    const media: AggregatedMediaItem[] = [];
    let idCounter = 0;

    // 1. Hero media
    if (project.heroMediaType === "video" && project.heroMediaConfig?.videoUrl) {
      media.push({
        id: `hero-${idCounter++}`,
        url: project.heroMediaConfig.videoUrl,
        type: "video",
        source: "hero",
        alt: "Hero video",
      });
    } else if (project.thumbnailImage) {
      media.push({
        id: `hero-${idCounter++}`,
        url: project.thumbnailImage,
        type: "image",
        source: "hero",
        alt: "Hero image",
      });
    }

    // 2. Layer 2 section media
    if (layer2Sections) {
      layer2Sections.forEach((section) => {
        if (section.mediaType === "none" || !section.mediaConfig) return;

        const config = section.mediaConfig;

        // Single image/video
        if (config.url) {
          const isVideo = section.mediaType === "video" || 
            /\.(mp4|webm|mov|avi)(\?|$)/i.test(config.url);
          
          media.push({
            id: `layer2-${section.id}-${idCounter++}`,
            url: config.url,
            type: isVideo ? "video" : "image",
            source: "layer2",
            sectionId: section.id,
            sectionHeading: section.heading,
          });
        }

        // Carousel items
        if (config.items && config.items.length > 0) {
          config.items.forEach((item, idx) => {
            media.push({
              id: `layer2-${section.id}-item-${idx}-${idCounter++}`,
              url: item.url,
              type: item.type,
              source: "layer2",
              sectionId: section.id,
              sectionHeading: section.heading,
              caption: item.caption,
            });
          });
        }
      });
    }

    // 3. Modal media assets (from project)
    if (project.modalMediaAssets && project.modalMediaAssets.length > 0) {
      project.modalMediaAssets.forEach((asset) => {
        // Skip if already added from hero
        if (media.some((m) => m.url === asset.url)) return;
        
        media.push({
          id: `modal-${asset.id || idCounter++}`,
          url: asset.url,
          type: asset.type,
          source: "modal",
          alt: asset.alt,
          caption: asset.caption,
        });
      });
    }

    // 4. Legacy modal media URLs
    if (project.modalMediaUrls && project.modalMediaUrls.length > 0) {
      project.modalMediaUrls.forEach((url) => {
        // Skip if already added
        if (media.some((m) => m.url === url)) return;
        
        const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
        media.push({
          id: `modal-url-${idCounter++}`,
          url,
          type: isVideo ? "video" : "image",
          source: "modal",
        });
      });
    }

    // 5. Gallery images (legacy)
    if (project.galleryImages && project.galleryImages.length > 0) {
      project.galleryImages.forEach((url) => {
        // Skip if already added
        if (media.some((m) => m.url === url)) return;
        
        media.push({
          id: `gallery-${idCounter++}`,
          url,
          type: "image",
          source: "gallery",
        });
      });
    }

    // 6. Media assets array (if different from above)
    if (project.mediaAssets && project.mediaAssets.length > 0) {
      project.mediaAssets.forEach((asset) => {
        // Skip if already added
        if (media.some((m) => m.url === asset.url)) return;
        
        media.push({
          id: `asset-${asset.id || idCounter++}`,
          url: asset.url,
          type: asset.type,
          source: "legacy",
          alt: asset.alt,
          caption: asset.caption,
        });
      });
    }

    return media;
  }, [project, layer2Sections]);
}

/**
 * Get the index of a media item by its ID
 */
export function getMediaIndex(media: AggregatedMediaItem[], id: string): number {
  return media.findIndex((m) => m.id === id);
}

/**
 * Filter media by source
 */
export function filterMediaBySource(
  media: AggregatedMediaItem[],
  sources: AggregatedMediaItem["source"][]
): AggregatedMediaItem[] {
  return media.filter((m) => sources.includes(m.source));
}

/**
 * Filter media by type
 */
export function filterMediaByType(
  media: AggregatedMediaItem[],
  types: AggregatedMediaItem["type"][]
): AggregatedMediaItem[] {
  return media.filter((m) => types.includes(m.type));
}

