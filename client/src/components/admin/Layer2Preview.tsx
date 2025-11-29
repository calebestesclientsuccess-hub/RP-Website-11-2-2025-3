import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Layout class mappings for preview
const layoutClasses = {
  above: "flex flex-col",
  below: "flex flex-col-reverse",
  left: "flex flex-row",
  right: "flex flex-row-reverse",
};

const spacingClasses = {
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-6",
};

interface Layer2Section {
  id: string;
  heading: string;
  body: string;
  orderIndex: number;
  mediaType: "none" | "image" | "video" | "image-carousel" | "video-carousel" | "mixed-carousel";
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

interface Layer2PreviewProps {
  sections: Layer2Section[];
}

export function Layer2Preview({ sections }: Layer2PreviewProps) {
  const [sectionMediaIndices, setSectionMediaIndices] = useState<Record<string, number>>({});

  const getGridClass = (count: number) => {
    if (count === 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2";
    if (count === 5) return "grid-cols-3";
    return "grid-cols-3";
  };

  const renderSectionMedia = (section: Layer2Section) => {
    if (!section.mediaConfig || section.mediaType === "none") {
      return null;
    }

    const config = section.mediaConfig;

    // Single image
    if (section.mediaType === "image" && config.url) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border mb-3">
          <img
            src={config.url}
            alt={`${section.heading} media`}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    // Single video
    if (section.mediaType === "video" && config.url) {
      return (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border mb-3">
          <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            Video Preview
          </div>
        </div>
      );
    }

    // Carousels
    if (config.items && config.items.length > 0) {
      const currentIndex = sectionMediaIndices[section.id] || 0;
      const currentItem = config.items[currentIndex % config.items.length];

      return (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border mb-3">
          {currentItem.type === "video" ? (
            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              Video {currentIndex + 1}/{config.items.length}
            </div>
          ) : (
            <img
              src={currentItem.url}
              alt={currentItem.caption || `Media ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          {config.items.length > 1 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {config.items.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${
                    idx === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Add sections to see how they'll look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No sections configured yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Visitor Preview</CardTitle>
        <CardDescription>How this will appear in the expansion view</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Preview at 60% scale */}
        <div className="border rounded-lg bg-card overflow-hidden" style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "166.67%", height: "auto" }}>
          <div className="p-8">
            {/* Mock Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-1">Project Name</h2>
              <p className="text-lg text-muted-foreground">Project Title</p>
            </div>

            {/* Sections Grid */}
            <div className={`grid ${getGridClass(sections.length)} gap-6`}>
              {sections.map((section) => {
                const style = section.styleConfig || {};
                const alignmentClass = style.alignment === "center" ? "text-center" : style.alignment === "right" ? "text-right" : "text-left";
                
                // Layout configuration
                const hasMedia = section.mediaType !== "none" && 
                  (section.mediaConfig?.url || (section.mediaConfig?.items && section.mediaConfig.items.length > 0));
                const mediaPosition = style.mediaPosition || "above";
                const spacing = style.spacing || "normal";
                const isHorizontal = mediaPosition === "left" || mediaPosition === "right";
                const textWidth = style.textWidth || 50;
                
                const layoutClass = hasMedia ? layoutClasses[mediaPosition] : "";
                const spacingClass = hasMedia ? spacingClasses[spacing] : "";

                return (
                  <div
                    key={section.id}
                    className={`p-4 rounded-lg ${hasMedia ? `${layoutClass} ${spacingClass}` : ""} ${alignmentClass}`}
                    style={{
                      backgroundColor: style.backgroundColor,
                      color: style.textColor,
                      fontFamily: style.fontFamily,
                    }}
                  >
                    {/* Media - for above/left positions */}
                    {hasMedia && (mediaPosition === "above" || mediaPosition === "left") && (
                      <div style={isHorizontal ? { width: `${100 - textWidth}%`, flexShrink: 0 } : undefined}>
                        {renderSectionMedia(section)}
                      </div>
                    )}
                    
                    {/* Text content */}
                    <div style={isHorizontal ? { width: `${textWidth}%` } : undefined}>
                      <h3
                        className={`${style.headingSize || "text-2xl"} font-semibold mb-2`}
                        style={{ color: style.headingColor || undefined }}
                      >
                        {section.heading || "Untitled Section"}
                      </h3>
                      <p className={`${style.bodySize || "text-base"} leading-relaxed`}>
                        {section.body || "No content yet..."}
                      </p>
                    </div>
                    
                    {/* Media - for below/right positions */}
                    {hasMedia && (mediaPosition === "below" || mediaPosition === "right") && (
                      <div style={isHorizontal ? { width: `${100 - textWidth}%`, flexShrink: 0 } : undefined}>
                        {renderSectionMedia(section)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mock CTA */}
            <div className="mt-8 text-center">
              <Badge variant="secondary">Experience the Full Story Button</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

