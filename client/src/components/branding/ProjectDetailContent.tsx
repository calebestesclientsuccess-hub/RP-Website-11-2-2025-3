import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, Images, Sparkles } from "lucide-react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import type { ProjectMediaAsset } from "@shared/schema";
import { buildProjectMediaAssets } from "@/utils/project-media";
import type { AggregatedMediaItem } from "@/hooks/useProjectMedia";

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
  immersive: "max-w-full aspect-[21/9]",
};

const spacingClasses = {
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-8",
};

interface ProjectDetailContentProps {
  project: {
    id: string;
    slug: string;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
    challenge?: string;
    solution?: string;
    outcome?: string;
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
  onOpenOverlay: (mediaIndex: number) => void;
  aggregatedMedia: AggregatedMediaItem[];
  showHeader?: boolean;
  showFullStoryCTA?: boolean;
  onFullStoryClick?: () => void;
}

export function ProjectDetailContent({ 
  project, 
  onOpenOverlay,
  aggregatedMedia,
  showHeader = true,
  showFullStoryCTA = false,
  onFullStoryClick,
}: ProjectDetailContentProps) {
  const [sectionMediaIndices, setSectionMediaIndices] = useState<Record<string, number>>({});
  const { isEnabled: ctaEnabled, isLoading: ctaLoading } = useFeatureFlag("branding-full-story-cta");

  const { data: layer2Sections, isLoading: isLoadingSections } = useQuery<Layer2Section[]>({
    queryKey: [`/api/projects/${project.id}/layer2-sections`],
    enabled: !!project.id,
  });

  const mediaAssets =
    project.mediaAssets && project.mediaAssets.length > 0
      ? project.mediaAssets
      : buildProjectMediaAssets(project);

  const findMediaIndex = (url: string): number => {
    const index = aggregatedMedia.findIndex((m) => m.url === url);
    return index >= 0 ? index : 0;
  };

  const renderSectionMedia = (section: Layer2Section) => {
    if (!section.mediaConfig || section.mediaType === "none") {
      return null;
    }

    const config = section.mediaConfig;

    if (section.mediaType === "image" && config.url) {
      return (
        <div 
          className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border mb-4 cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => onOpenOverlay(findMediaIndex(config.url!))}
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

    if (section.mediaType === "video" && config.url) {
      return (
        <div 
          className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border mb-4 cursor-pointer"
          onClick={() => onOpenOverlay(findMediaIndex(config.url!))}
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

    if (config.items && config.items.length > 0) {
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
              onClick={() => onOpenOverlay(findMediaIndex(currentItem.url))}
            />
          ) : (
            <motion.img
              layoutId={`media-showcase-${currentItem.url}`}
              src={currentItem.url}
              alt={currentItem.caption || `${section.heading} media ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
              onClick={() => onOpenOverlay(findMediaIndex(currentItem.url))}
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
                aria-label="Previous media"
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
                aria-label="Next media"
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
                    aria-label={`View media ${idx + 1} of ${config.items!.length}`}
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

    if ((section.mediaType === "grid-2" || section.mediaType === "grid-3") && config.items && config.items.length > 0) {
      const gridCols = section.mediaType === "grid-2" ? "grid-cols-2" : "grid-cols-3";
      const aspectClass = section.mediaType === "grid-2" ? "aspect-[4/3]" : "aspect-square";
      
      return (
        <div className={`grid ${gridCols} gap-4`}>
          {config.items.map((item, idx) => (
            <div
              key={idx}
              className={`${aspectClass} rounded-xl overflow-hidden bg-muted/50 border border-border cursor-pointer hover:opacity-95 transition-opacity`}
              onClick={() => onOpenOverlay(findMediaIndex(item.url))}
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
    <div className="p-8 md:p-12">
      {showHeader && (
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-4xl font-bold mb-2">{project.clientName}</h2>
            <p className="text-xl text-muted-foreground">{project.projectTitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {aggregatedMedia.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenOverlay(0)}
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
      )}

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
            
            const mediaPosition = style.mediaPosition || "above";
            const mediaSize = style.mediaSize || "standard";
            const spacing = style.spacing || "normal";
            const textWidth = style.textWidth || 50;
            const isHorizontalLayout = mediaPosition === "left" || mediaPosition === "right";
            const layoutClass = hasMedia ? layoutClasses[mediaPosition] : "";
            const spacingClass = spacingClasses[spacing];
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
                {hasMedia && (mediaPosition === "above" || mediaPosition === "left") && (
                  <div className={mediaSize === "immersive" ? sizeClasses.immersive : sizeClasses.standard}>
                    {renderSectionMedia(section)}
                  </div>
                )}
                
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

      {mediaAssets.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {mediaAssets.slice(1, 3).map((asset, idx) => (
            <div
              key={asset.id}
              className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => onOpenOverlay(findMediaIndex(asset.url))}
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

      {project.testimonial && (
        <div className="p-8 bg-muted/50 rounded-xl border border-border mb-12">
          <p className="text-xl italic mb-4 text-foreground/90" data-testid="text-testimonial">
            "{project.testimonial.text}"
          </p>
          <p className="text-base font-semibold text-muted-foreground" data-testid="text-testimonial-author">
            — {project.testimonial.author}
          </p>
        </div>
      )}

      {showFullStoryCTA && !ctaLoading && ctaEnabled && onFullStoryClick && (
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="default"
            className="px-8 py-6 text-lg font-semibold"
            onClick={onFullStoryClick}
            disabled={!project.slug}
            data-testid="button-view-full-story"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Experience the Full Story
          </Button>
        </div>
      )}
    </div>
  );
}

 
