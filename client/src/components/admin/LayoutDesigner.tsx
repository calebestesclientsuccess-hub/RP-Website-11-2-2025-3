import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

export type MediaPosition = "above" | "below" | "left" | "right";
export type MediaSize = "standard" | "immersive";
export type Spacing = "tight" | "normal" | "loose";

interface LayoutDesignerProps {
  mediaPosition: MediaPosition;
  onMediaPositionChange: (position: MediaPosition) => void;
  mediaSize: MediaSize;
  onMediaSizeChange: (size: MediaSize) => void;
  textWidth: number;
  onTextWidthChange: (width: number) => void;
  spacing: Spacing;
  onSpacingChange: (spacing: Spacing) => void;
  className?: string;
}

// Layout position configurations with icons and labels
const LAYOUT_OPTIONS: Array<{
  value: MediaPosition;
  label: string;
  icon: typeof ArrowUp;
  description: string;
}> = [
  { value: "above", label: "Above", icon: ArrowUp, description: "Media on top" },
  { value: "below", label: "Below", icon: ArrowDown, description: "Media below" },
  { value: "left", label: "Left", icon: ArrowLeft, description: "Media on left" },
  { value: "right", label: "Right", icon: ArrowRight, description: "Media on right" },
];

const SPACING_OPTIONS: Array<{ value: Spacing; label: string }> = [
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "loose", label: "Loose" },
];

export function LayoutDesigner({
  mediaPosition,
  onMediaPositionChange,
  mediaSize,
  onMediaSizeChange,
  textWidth,
  onTextWidthChange,
  spacing,
  onSpacingChange,
  className,
}: LayoutDesignerProps) {
  // Only show text width slider for horizontal layouts
  const isHorizontalLayout = mediaPosition === "left" || mediaPosition === "right";

  return (
    <div className={cn("space-y-5", className)}>
      {/* Media Position */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <LayoutTemplate className="w-3.5 h-3.5" />
          Layout Position
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = mediaPosition === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onMediaPositionChange(option.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                title={option.description}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Size */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Media Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onMediaSizeChange("standard")}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
              mediaSize === "standard"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <Minimize2 className="w-4 h-4" />
            <span className="text-xs font-medium">Standard</span>
          </button>
          <button
            type="button"
            onClick={() => onMediaSizeChange("immersive")}
            className={cn(
              "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
              mediaSize === "immersive"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-xs font-medium">Immersive</span>
          </button>
        </div>
      </div>

      {/* Text/Media Width Ratio - Only for horizontal layouts */}
      {isHorizontalLayout && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Text Width</Label>
            <span className="text-xs text-muted-foreground">{textWidth}%</span>
          </div>
          <Slider
            value={[textWidth]}
            onValueChange={([value]) => onTextWidthChange(value)}
            min={30}
            max={70}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>More Media</span>
            <span>More Text</span>
          </div>
        </div>
      )}

      {/* Spacing */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Spacing</Label>
        <div className="grid grid-cols-3 gap-2">
          {SPACING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSpacingChange(option.value)}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg border-2 transition-all text-xs font-medium",
                spacing === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Indicator */}
      <div className="pt-2 border-t">
        <div
          className={cn(
            "rounded-lg border-2 border-dashed border-muted-foreground/30 p-2 relative overflow-hidden",
            "h-16"
          )}
        >
          {/* Mini preview visualization */}
          <div
            className={cn(
              "absolute inset-2 flex gap-1",
              mediaPosition === "above" && "flex-col",
              mediaPosition === "below" && "flex-col-reverse",
              mediaPosition === "left" && "flex-row",
              mediaPosition === "right" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "bg-primary/20 rounded",
                isHorizontalLayout ? "flex-shrink-0" : "flex-1",
                mediaSize === "immersive" ? "min-h-[40%]" : "min-h-[30%]"
              )}
              style={isHorizontalLayout ? { width: `${100 - textWidth}%` } : undefined}
            />
            <div
              className={cn(
                "bg-muted rounded flex-1",
                isHorizontalLayout && `w-[${textWidth}%]`
              )}
              style={isHorizontalLayout ? { width: `${textWidth}%` } : undefined}
            >
              <div className="h-1 w-2/3 bg-muted-foreground/30 rounded m-1" />
              <div className="h-0.5 w-1/2 bg-muted-foreground/20 rounded mx-1" />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Preview
        </p>
      </div>
    </div>
  );
}

