import { X, ChevronLeft, ChevronRight, Sparkles, Loader2, Images } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticleDissolve } from "./ParticleDissolve";
import { MediaShowcaseOverlay } from "./MediaShowcaseOverlay";
import type { ProjectMediaAsset } from "@shared/schema";
import { buildProjectMediaAssets } from "@/utils/project-media";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useProjectMedia, type AggregatedMediaItem } from "@/hooks/useProjectMedia";

interface Layer2Section {
  id: string;
  heading: string;
  body: string;
  orderIndex: number;
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
  styleConfig?: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    fontFamily?: string;
    headingSize?: "text-xl" | "text-2xl" | "text-3xl" | "text-4xl";
    bodySize?: "text-sm" | "text-base" | "text-lg";
    alignment?: "left" | "center" | "right";
    // Layout controls
    mediaSize?: "standard" | "immersive";
    mediaPosition?: "above" | "below" | "left" | "right";
    textWidth?: number;
    spacing?: "tight" | "normal" | "loose";
  };
}

// Layout class mappings
const layoutClasses = {
  above: "flex flex-col",
  below: "flex flex-col-reverse",
  left: "grid grid-cols-1 md:grid-cols-2",
  right: "grid grid-cols-1 md:grid-cols-2",
};

const sizeClasses = {
  standard: "max-w-xl aspect-[4/3]",
  immersive: "max-w-full aspect-[16/9]",
};

const spacingClasses = {
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-8",
};

interface ProjectExpansionProps {
  project: {
    id: string;
    slug: string;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    heroMediaType?: "image" | "video";
    categories: string[];
    challenge: string;
    solution: string;
    outcome: string;
    modalMediaAssets?: ProjectMediaAsset[] | null;
    modalMediaUrls?: string[] | null;
    modalMediaType?: string | null;
    galleryImages?: string[];
    mediaAssets?: ProjectMediaAsset[];
    testimonial?: {
      text: string;
      author: string;
    };
  };
  onClose: () => void;
}

export function ProjectExpansion({ project, onClose }: ProjectExpansionProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sectionMediaIndices, setSectionMediaIndices] = useState<Record<string, number>>({});
  
  // Media showcase overlay state
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayIndex, setOverlayIndex] = useState(0);
  const [customOverlayMedia, setCustomOverlayMedia] = useState<Array<{ id: string; url: string; type: string; alt?: string; caption?: string }> | null>(null);
  
  // Feature flag for "Experience the Full Story" CTA button
  const { isEnabled: showFullStoryCTA, isLoading: ctaLoading } = useFeatureFlag('branding-full-story-cta');
  
  const mediaAssets =
    project.mediaAssets && project.mediaAssets.length > 0
      ? project.mediaAssets
      : buildProjectMediaAssets(project);

  // Fetch Layer 2 sections
  const { data: layer2Sections, isLoading: isLoadingSections } = useQuery<Layer2Section[]>({
    queryKey: [`/api/projects/${project.id}/layer2-sections`],
    enabled: !!project.id,
  });
  
  // Aggregate all media for the overlay
  const aggregatedMedia = useProjectMedia(
    {
      id: project.id,
      thumbnailImage: project.thumbnailImage,
      modalMediaAssets: project.modalMediaAssets,
      modalMediaUrls: project.modalMediaUrls,
      galleryImages: project.galleryImages,
      mediaAssets: project.mediaAssets,
    },
    layer2Sections
  );
  
  // Open overlay at specific index
  const openOverlay = (index: number = 0) => {
    setCustomOverlayMedia(null); // Clear custom media to use aggregatedMedia
    setOverlayIndex(index);
    setIsOverlayOpen(true);
  };
  
  // Open overlay with custom scoped media (for grid sections)
  const openScopedOverlay = (media: Array<{ id: string; url: string; type: string; caption?: string }>, index: number = 0) => {
    setCustomOverlayMedia(media);
    setOverlayIndex(index);
    setIsOverlayOpen(true);
  };
  
  // Find index in aggregated media by URL
  const findMediaIndex = (url: string): number => {
    const index = aggregatedMedia.findIndex((m) => m.url === url);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [project?.id, mediaAssets.length]);

  const currentAsset =
    mediaAssets.length > 0
      ? mediaAssets[currentMediaIndex % mediaAssets.length]
      : null;

  // Helper to get grid columns class based on section count
  const getGridClass = (count: number) => {
    if (count === 3) return "grid-cols-1 md:grid-cols-3";
    if (count === 4) return "grid-cols-1 md:grid-cols-2";
    if (count === 5) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 md:grid-cols-3";
  };

  // Render section media based on type
  const renderSectionMedia = (section: Layer2Section) => {
    if (!section.mediaConfig || section.mediaType === "none") {
      return null;
    }

    const config = section.mediaConfig;

    // Single image
    if (section.mediaType === "image" && config.url) {
      return (
        <div 
          className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border mb-4 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => openOverlay(findMediaIndex(config.url!))}
        >
          <motion.img
            layoutId={`media-showcase-${config.url}`}
            src={config.url}
            alt={`${section.heading} media`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }

    // Single video
    if (section.mediaType === "video" && config.url) {
      return (
        <div 
          className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border mb-4 cursor-pointer"
          onClick={() => openOverlay(findMediaIndex(config.url!))}
        >
          <motion.video
            layoutId={`media-showcase-${config.url}`}
            src={config.url}
            className="w-full h-full object-cover"
            controls
          />
        </div>
      );
    }

    // Carousels
    if (section.mediaType.includes("carousel") && config.items && config.items.length > 0) {
      const currentIndex = sectionMediaIndices[section.id] || 0;
      const currentItem = config.items[currentIndex % config.items.length];

      return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border mb-4">
          {currentItem.type === "video" ? (
            <motion.video
              key={currentIndex}
              layoutId={`media-showcase-${currentItem.url}`}
              src={currentItem.url}
              className="w-full h-full object-cover cursor-pointer"
              controls
              onClick={() => openOverlay(findMediaIndex(currentItem.url))}
            />
          ) : (
            <motion.img
              layoutId={`media-showcase-${currentItem.url}`}
              src={currentItem.url}
              alt={currentItem.caption || `${section.heading} media ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
              onClick={() => openOverlay(findMediaIndex(currentItem.url))}
            />
          )}

          {config.items.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() =>
                  setSectionMediaIndices({
                    ...sectionMediaIndices,
                    [section.id]: (currentIndex - 1 + config.items!.length) % config.items!.length,
                  })
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() =>
                  setSectionMediaIndices({
                    ...sectionMediaIndices,
                    [section.id]: (currentIndex + 1) % config.items!.length,
                  })
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {config.items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setSectionMediaIndices({
                        ...sectionMediaIndices,
                        [section.id]: idx,
                      })
                    }
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {currentItem.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-sm text-white">{currentItem.caption}</p>
            </div>
          )}
        </div>
      );
    }

    // 2-column or 3-column grids
    if ((section.mediaType === "grid-2" || section.mediaType === "grid-3") && config.items && config.items.length > 0) {
      const gridCols = section.mediaType === "grid-2" ? "grid-cols-2" : "grid-cols-3";
      
      // Create scoped media array for this grid
      const gridMedia = config.items.map((item, idx) => ({
        id: `${section.id}-grid-${idx}`,
        url: item.url,
        type: item.type,
        caption: item.caption,
      }));
      
      return (
        <div className={`grid ${gridCols} gap-3 mb-4`}>
          {config.items.map((item, idx) => (
            <div
              key={idx}
              className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => openScopedOverlay(gridMedia, idx)}
            >
              {item.type === "video" ? (
                <motion.video
                  layoutId={`media-showcase-${item.url}`}
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                />
              ) : (
                <motion.img
                  layoutId={`media-showcase-${item.url}`}
                  src={item.url}
                  alt={item.caption || `${section.heading} grid item ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <LayoutGroup>
      <div
        className="bg-card rounded-2xl shadow-2xl overflow-hidden"
        data-testid={`expansion-project-${project.id}`}
      >
      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
          data-testid="button-close-expansion"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Hero Carousel Section */}
        <div className="relative aspect-[21/9] overflow-hidden bg-muted flex items-center justify-center">
          {currentAsset ? (
            <>
              {currentAsset.type === "video" ? (
                <motion.video
                  key={currentAsset.id}
                  layoutId={`media-showcase-${currentAsset.url}`}
                  src={currentAsset.url}
                  className="w-full h-full object-cover cursor-pointer"
                  controls
                  onClick={(e) => {
                    // Don't open overlay if clicking on video controls
                    if ((e.target as HTMLElement).tagName !== "VIDEO") return;
                    openOverlay(findMediaIndex(currentAsset.url));
                  }}
                  data-testid={`video-media-${currentMediaIndex}`}
                />
              ) : (
                <motion.img
                  layoutId={`media-showcase-${currentAsset.url}`}
                  src={currentAsset.url}
                  alt={currentAsset.alt || `${project.clientName} media`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  loading="lazy"
                  onClick={() => openOverlay(findMediaIndex(currentAsset.url))}
                  data-testid={`img-media-${currentMediaIndex}`}
                />
              )}

              {mediaAssets.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() =>
                      setCurrentMediaIndex(
                        (prev) => (prev - 1 + mediaAssets.length) % mediaAssets.length,
                      )
                    }
                    disabled={mediaAssets.length <= 1}
                    aria-label="Previous media"
                    data-testid="button-prev-media"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() =>
                      setCurrentMediaIndex((prev) => (prev + 1) % mediaAssets.length)
                    }
                    disabled={mediaAssets.length <= 1}
                    aria-label="Next media"
                    data-testid="button-next-media"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {mediaAssets.map((asset, index) => (
                      <button
                        key={asset.id}
                        onClick={() => setCurrentMediaIndex(index)}
                        aria-label={`View media ${index + 1} of ${mediaAssets.length}`}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentMediaIndex
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        data-testid={`button-media-indicator-${index}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : project.thumbnailImage ? (
            (() => {
              // Check if thumbnail is a video
              const isVideo = project.heroMediaType === "video" || 
                             project.thumbnailImage.match(/\.(mp4|webm|mov|avi)(\?|$)/i) ||
                             project.thumbnailImage.includes('/video/') ||
                             project.thumbnailImage.includes('resource_type=video');
              
              return isVideo ? (
                <video
                  src={project.thumbnailImage}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  data-testid="video-fallback-thumbnail"
                />
              ) : (
                <img
                  src={project.thumbnailImage}
                  alt={`${project.clientName} - ${project.projectTitle}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  data-testid="img-fallback-thumbnail"
                />
              );
            })()
          ) : (
            <div className="text-center text-muted-foreground p-8">
              Visual assets coming soon.
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <span className="sr-only" data-testid={`text-client-${project.id}`}>{project.clientName}</span>
              <h2 className="text-4xl font-bold mb-2" data-testid="text-expansion-client">
                {project.clientName}
              </h2>
              <p className="text-xl text-muted-foreground" data-testid="text-expansion-title">
                {project.projectTitle}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* View Gallery Button */}
              {aggregatedMedia.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openOverlay(0)}
                  className="gap-2"
                >
                  <Images className="w-4 h-4" />
                  View Gallery ({aggregatedMedia.length})
                </Button>
              )}
              <div className="flex flex-wrap gap-2">
                {project.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Layer 2 Sections - Dynamic Layout */}
          {isLoadingSections ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : layer2Sections && layer2Sections.length > 0 ? (
            <div className="space-y-8 mb-12">
              {layer2Sections.map((section) => {
                const style = section.styleConfig || {};
                const alignmentClass = style.alignment === "center" ? "text-center" : style.alignment === "right" ? "text-right" : "text-left";
                const hasMedia = section.mediaType !== "none" && 
                  (section.mediaConfig?.url || (section.mediaConfig?.items && section.mediaConfig.items.length > 0));
                
                // Get layout configuration
                const mediaPosition = style.mediaPosition || "above";
                const mediaSize = style.mediaSize || "standard";
                const spacing = style.spacing || "normal";
                const textWidth = style.textWidth || 50;
                
                // Determine layout class based on position
                const isHorizontalLayout = mediaPosition === "left" || mediaPosition === "right";
                const layoutClass = hasMedia ? layoutClasses[mediaPosition] : "";
                const spacingClass = spacingClasses[spacing];
                
                // Custom styles for grid layouts
                const gridStyle = isHorizontalLayout && hasMedia ? {
                  gridTemplateColumns: mediaPosition === "left" 
                    ? `${100 - textWidth}% ${textWidth}%` 
                    : `${textWidth}% ${100 - textWidth}%`,
                } : undefined;
                
                return (
                  <div 
                    key={section.id} 
                    data-testid={`section-${section.orderIndex}`}
                    className={`p-6 rounded-lg ${hasMedia ? `${layoutClass} ${spacingClass}` : ""} ${alignmentClass}`}
                    style={{
                      backgroundColor: style.backgroundColor,
                      color: style.textColor,
                      fontFamily: style.fontFamily,
                      ...gridStyle,
                    }}
                  >
                    {/* Media - positioned based on layout */}
                    {hasMedia && (mediaPosition === "above" || mediaPosition === "left") && (
                      <div className={mediaSize === "immersive" ? sizeClasses.immersive : sizeClasses.standard}>
                        {renderSectionMedia(section)}
                      </div>
                    )}
                    
                    {/* Text content */}
                    <div className={isHorizontalLayout ? "flex flex-col justify-center" : ""}>
                      <h3 
                        className={`${style.headingSize || "text-2xl"} font-semibold mb-4`}
                        style={{ color: style.headingColor || undefined }}
                      >
                        {section.heading}
                      </h3>
                      <p 
                        className={`${style.bodySize || "text-base"} leading-relaxed whitespace-pre-wrap`}
                      >
                        {section.body}
                      </p>
                    </div>
                    
                    {/* Media - for below/right positions */}
                    {hasMedia && (mediaPosition === "below" || mediaPosition === "right") && (
                      <div className={mediaSize === "immersive" ? sizeClasses.immersive : sizeClasses.standard}>
                        {renderSectionMedia(section)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Fallback to legacy Challenge/Solution/Outcome
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {project.challenge && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gradient">
                    The Challenge
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-challenge">
                    {project.challenge}
                  </p>
                </div>
              )}

              {project.solution && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gradient">
                    Our Solution
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-solution">
                    {project.solution}
                  </p>
                </div>
              )}

              {project.outcome && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gradient">
                    The Outcome
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-outcome">
                    {project.outcome}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feature Media Section - Additional videos/photos */}
          {mediaAssets.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {mediaAssets.slice(1, 3).map((asset, idx) => (
                <div
                  key={asset.id}
                  className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => openOverlay(findMediaIndex(asset.url))}
                >
                  {asset.type === "video" ? (
                    <motion.video
                      layoutId={`media-showcase-${asset.url}`}
                      src={asset.url}
                      className="w-full h-full object-cover"
                      controls
                      data-testid={`video-feature-${idx + 1}`}
                    />
                  ) : (
                    <motion.img
                      layoutId={`media-showcase-${asset.url}`}
                      src={asset.url}
                      alt={asset.alt || `${project.clientName} - Feature ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      data-testid={`img-feature-${idx + 1}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Testimonial Section */}
          {project.testimonial && (
            <div className="p-8 bg-muted/50 rounded-xl border border-border">
              <p className="text-xl italic mb-4 text-foreground/90" data-testid="text-testimonial">
                "{project.testimonial.text}"
              </p>
              <p className="text-base font-semibold text-muted-foreground" data-testid="text-testimonial-author">
                — {project.testimonial.author}
              </p>
            </div>
          )}

          {/* View Full Story CTA - Feature Flagged */}
          {!ctaLoading && showFullStoryCTA && (
            <div className="mt-12 flex justify-center">
              <Button
                size="lg"
                variant="primary"
                className="px-8 py-6 text-lg font-semibold"
                onClick={() => {
                  if (!project.slug) {
                    console.warn("Project missing slug:", project);
                    return;
                  }
                  setIsTransitioning(true);
                }}
                disabled={!project.slug}
                data-testid="button-view-full-story"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Experience the Full Story
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Particle Dissolve Transition */}
      <ParticleDissolve
        isActive={isTransitioning}
        targetUrl={`/branding/${project.slug}`}
        onComplete={() => setIsTransitioning(false)}
      />
      
      {/* Media Showcase Overlay */}
      <MediaShowcaseOverlay
        isOpen={isOverlayOpen}
        onClose={() => {
          setIsOverlayOpen(false);
          setCustomOverlayMedia(null); // Clear custom media when closing
        }}
        media={customOverlayMedia || aggregatedMedia}
        currentIndex={overlayIndex}
        onIndexChange={setOverlayIndex}
        title={`${project.clientName} - ${customOverlayMedia ? 'Grid' : 'Gallery'}`}
      />
      </div>
    </LayoutGroup>
  );
}
