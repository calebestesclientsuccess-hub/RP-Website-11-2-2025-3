import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Circle, GripVertical, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker, type MediaSelectionMode } from "./MediaPicker";
import { LayoutDesigner, type MediaPosition, type MediaSize, type Spacing } from "./LayoutDesigner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

// Character count warning thresholds (as percentage of limit)
const CHAR_THRESHOLDS = {
  warning: 0.7,   // 70% - yellow
  danger: 0.85,   // 85% - orange  
  critical: 0.95, // 95% - red
};

export type MediaType = "none" | "image" | "video" | "carousel";

export interface SectionLayoutConfig {
  mediaSize?: MediaSize;
  mediaPosition?: MediaPosition;
  textWidth?: number;
  spacing?: Spacing;
}

export interface SectionData {
  /** H2 subtitle text */
  heading: string;
  /** Paragraph body text */
  body: string;
  /** Type of media to display */
  mediaType: MediaType;
  /** Media URLs (single for image/video, multiple for carousel) */
  mediaUrls: string[];
  /** Layout configuration */
  layoutConfig?: SectionLayoutConfig;
}

export type SectionStatus = "empty" | "partial" | "complete";

interface ContentSectionCardProps {
  /** Section number (1-5) */
  sectionNumber: number;
  /** Current section data */
  value: SectionData;
  /** Callback when data changes */
  onChange: (data: SectionData) => void;
  /** Whether the card is currently expanded */
  isOpen: boolean;
  /** Callback when the card header is clicked */
  onToggle: () => void;
  /** Optional icon to show in the header */
  icon?: ReactNode;
  /** Whether this section is draggable */
  isDraggable?: boolean;
  /** Suggested title to display when heading is empty */
  suggestedTitle?: string;
  /** Guiding prompt to help users understand what to write */
  suggestedPrompt?: string;
  /** Placeholder text for the heading input */
  headingPlaceholder?: string;
  /** Current body character count */
  bodyCharCount?: number;
  /** Character limit for body text */
  bodyCharLimit?: number;
  /** Error message for body text */
  bodyError?: string;
  /** Warning about content balance relative to other sections */
  balanceWarning?: string;
}

const statusConfig: Record<SectionStatus, { color: string; icon: typeof Check | typeof Circle; label: string }> = {
  empty: {
    color: "text-muted-foreground/50",
    icon: Circle,
    label: "Not started",
  },
  partial: {
    color: "text-amber-500",
    icon: Circle,
    label: "In progress",
  },
  complete: {
    color: "text-emerald-500",
    icon: Check,
    label: "Complete",
  },
};

function getSectionStatus(data: SectionData): SectionStatus {
  const hasHeading = data.heading.trim().length > 0;
  const hasBody = data.body.trim().length > 0;

  if (!hasHeading && !hasBody) return "empty";
  if (hasHeading && hasBody) return "complete";
  return "partial";
}

export function ContentSectionCard({
  sectionNumber,
  value,
  onChange,
  isOpen,
  onToggle,
  icon,
  isDraggable = false,
  suggestedTitle,
  suggestedPrompt,
  headingPlaceholder,
  bodyCharCount = 0,
  bodyCharLimit,
  bodyError,
  balanceWarning,
}: ContentSectionCardProps) {
  const status = getSectionStatus(value);
  const { color, icon: StatusIcon, label } = statusConfig[status];
  
  // Display title: user's heading > suggested title > fallback
  const displayTitle = value.heading || suggestedTitle || `Section ${sectionNumber}`;
  const displayPrompt = suggestedPrompt || "Add subtitle, text, and optional media";

  const handleFieldChange = <K extends keyof SectionData>(
    field: K,
    fieldValue: SectionData[K]
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleMediaTypeChange = (type: MediaType) => {
    // Clear media URLs when changing type
    onChange({ ...value, mediaType: type, mediaUrls: [] });
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all duration-300",
        isOpen
          ? "border-primary/30 shadow-lg shadow-primary/5"
          : "border-border hover:border-primary/20 hover:shadow-md"
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-4 p-5 text-left transition-colors",
          isOpen ? "border-b border-border/50" : ""
        )}
        aria-expanded={isOpen}
        aria-label={`Section ${sectionNumber} - ${label}`}
      >
        {/* Drag handle */}
        {isDraggable && (
          <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Section number badge */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
            status === "complete"
              ? "bg-emerald-500/20 text-emerald-500"
              : status === "partial"
              ? "bg-amber-500/20 text-amber-500"
              : "bg-muted text-muted-foreground"
          )}
        >
          {sectionNumber}
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
        )}

        {/* Title and preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold truncate",
              value.heading ? "text-foreground" : "text-muted-foreground"
            )}>
              {displayTitle}
            </h3>
            <StatusIcon
              className={cn("w-4 h-4 flex-shrink-0", color)}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {value.body
              ? value.body.slice(0, 60) + (value.body.length > 60 ? "..." : "")
              : displayPrompt}
          </p>
        </div>

        {/* Media indicator */}
        {value.mediaType !== "none" && value.mediaUrls.length > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {value.mediaType === "carousel"
              ? `${value.mediaUrls.length} items`
              : value.mediaType}
          </span>
        )}

        {/* Expand/collapse indicator */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-4 space-y-4">
              {/* Heading */}
              <div>
                <Label htmlFor={`section-${sectionNumber}-heading`}>
                  Subtitle (H2)
                </Label>
                <Input
                  id={`section-${sectionNumber}-heading`}
                  placeholder={headingPlaceholder || "Enter section subtitle..."}
                  value={value.heading}
                  onChange={(e) => handleFieldChange("heading", e.target.value)}
                  className="mt-1.5"
                />
                {suggestedPrompt && !value.heading && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic">
                    💡 {suggestedPrompt}
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <Label htmlFor={`section-${sectionNumber}-body`}>
                  Paragraph Text
                </Label>
                <Textarea
                  id={`section-${sectionNumber}-body`}
                  placeholder="Enter section content..."
                  value={value.body}
                  onChange={(e) => handleFieldChange("body", e.target.value)}
                  className={cn(
                    "mt-1.5 min-h-[120px]",
                    bodyError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <div className="flex items-center justify-between mt-1">
                  {bodyError && (
                    <p className="text-xs text-destructive">{bodyError}</p>
                  )}
                  {bodyCharLimit !== undefined && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          bodyCharCount <= bodyCharLimit * CHAR_THRESHOLDS.warning && "text-muted-foreground",
                          bodyCharCount > bodyCharLimit * CHAR_THRESHOLDS.warning && bodyCharCount <= bodyCharLimit * CHAR_THRESHOLDS.danger && "text-amber-500",
                          bodyCharCount > bodyCharLimit * CHAR_THRESHOLDS.danger && bodyCharCount <= bodyCharLimit * CHAR_THRESHOLDS.critical && "text-orange-500",
                          bodyCharCount > bodyCharLimit * CHAR_THRESHOLDS.critical && "text-red-500"
                        )}
                      >
                        {bodyCharCount}/{bodyCharLimit}
                      </span>
                      {bodyCharCount > bodyCharLimit * CHAR_THRESHOLDS.danger && bodyCharCount <= bodyCharLimit && (
                        <span className="text-xs text-orange-500">
                          ⚠️ Consider shortening
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Balance warning */}
                {balanceWarning && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 rounded mt-2">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>{balanceWarning}</span>
                  </div>
                )}
              </div>

              {/* Media type selector */}
              <div>
                <Label htmlFor={`section-${sectionNumber}-media-type`}>
                  Media{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Select
                  value={value.mediaType}
                  onValueChange={(v) => handleMediaTypeChange(v as MediaType)}
                >
                  <SelectTrigger
                    id={`section-${sectionNumber}-media-type`}
                    className="mt-1.5"
                  >
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No media</SelectItem>
                    <SelectItem value="image">Single Image</SelectItem>
                    <SelectItem value="video">Single Video</SelectItem>
                    <SelectItem value="carousel">Media Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Media picker */}
              {value.mediaType !== "none" && (
                <>
                  <MediaPicker
                    value={value.mediaUrls}
                    onChange={(urls) => handleFieldChange("mediaUrls", urls)}
                    mode={value.mediaType === "carousel" ? "carousel" : "single"}
                    mediaTypeFilter={
                      value.mediaType === "carousel"
                        ? "all"
                        : value.mediaType === "video"
                        ? "video"
                        : "image"
                    }
                    placeholder={
                      value.mediaType === "carousel"
                        ? "Select media for carousel"
                        : value.mediaType === "video"
                        ? "Select video from library"
                        : "Select image from library"
                    }
                  />

                  {/* Layout Controls - Only visible when media is selected */}
                  {value.mediaUrls.length > 0 && (
                    <Collapsible className="border rounded-lg">
                      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Layout Options</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 pt-0 border-t">
                          <LayoutDesigner
                            mediaPosition={value.layoutConfig?.mediaPosition || "above"}
                            onMediaPositionChange={(position) =>
                              handleFieldChange("layoutConfig", {
                                ...value.layoutConfig,
                                mediaPosition: position,
                              })
                            }
                            mediaSize={value.layoutConfig?.mediaSize || "standard"}
                            onMediaSizeChange={(size) =>
                              handleFieldChange("layoutConfig", {
                                ...value.layoutConfig,
                                mediaSize: size,
                              })
                            }
                            textWidth={value.layoutConfig?.textWidth || 50}
                            onTextWidthChange={(width) =>
                              handleFieldChange("layoutConfig", {
                                ...value.layoutConfig,
                                textWidth: width,
                              })
                            }
                            spacing={value.layoutConfig?.spacing || "normal"}
                            onSpacingChange={(spacing) =>
                              handleFieldChange("layoutConfig", {
                                ...value.layoutConfig,
                                spacing: spacing,
                              })
                            }
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper to determine overall status for all sections
 */
export function getAllSectionsStatus(sections: SectionData[]): SectionStatus {
  const statuses = sections.map(getSectionStatus);

  if (statuses.every((s) => s === "empty")) return "empty";
  if (statuses.every((s) => s === "complete")) return "complete";
  return "partial";
}

/**
 * Create default section data
 */
export function createDefaultSection(): SectionData {
  return {
    heading: "",
    body: "",
    mediaType: "none",
    mediaUrls: [],
    layoutConfig: {
      mediaSize: "standard",
      mediaPosition: "above",
      textWidth: 50,
      spacing: "normal",
    },
  };
}

