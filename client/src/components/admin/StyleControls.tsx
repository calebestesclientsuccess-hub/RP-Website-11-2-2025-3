import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { ChevronDown, Palette, Type, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StyleOverrides {
  /** Whether custom styles are enabled */
  enabled: boolean;
  /** Primary color (hex) - main brand color */
  primaryColor?: string;
  /** Secondary color (hex) - complementary brand color */
  secondaryColor?: string;
  /** Accent color (hex) - highlight/CTA color */
  accentColor?: string;
  /** Background color (hex) */
  backgroundColor?: string;
  /** Text color (hex) */
  textColor?: string;
  /** Heading font family */
  headingFont?: string;
  /** Body font family */
  bodyFont?: string;
}

interface StyleControlsProps {
  value: StyleOverrides;
  onChange: (value: StyleOverrides) => void;
  className?: string;
}

// Sentinel value for "default" font since Radix Select doesn't handle empty strings well
const DEFAULT_FONT_SENTINEL = "__default__";

const FONT_OPTIONS = [
  { value: DEFAULT_FONT_SENTINEL, label: "Default (Space Grotesk)" },
  { value: "Inter", label: "Inter" },
  { value: "Satoshi", label: "Satoshi" },
  { value: "Cabinet Grotesk", label: "Cabinet Grotesk" },
  { value: "General Sans", label: "General Sans" },
  { value: "Clash Display", label: "Clash Display" },
  { value: "Switzer", label: "Switzer" },
  { value: "Outfit", label: "Outfit" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Manrope", label: "Manrope" },
  { value: "Work Sans", label: "Work Sans" },
];

// Color sanitization for native color picker (only accepts valid 6-digit hex)
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const safeColorForPicker = (color: string | undefined, fallback: string): string =>
  color && HEX_REGEX.test(color) ? color : fallback;

const DEFAULT_STYLES: StyleOverrides = {
  enabled: false,
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#f97316",
  backgroundColor: "#0a0a0a",
  textColor: "#fafafa",
  headingFont: "",
  bodyFont: "",
};

export function StyleControls({ value, onChange, className }: StyleControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof StyleOverrides, val: string | boolean) => {
    // Convert sentinel value back to empty string for font fields
    const normalizedVal = val === DEFAULT_FONT_SENTINEL ? "" : val;
    onChange({ ...value, [key]: normalizedVal });
  };

  // Helper to convert empty string to sentinel for Select components
  const fontValueForSelect = (fontValue: string | undefined): string =>
    !fontValue || fontValue === "" ? DEFAULT_FONT_SENTINEL : fontValue;

  const handleReset = () => {
    onChange({ ...DEFAULT_STYLES, enabled: value.enabled });
  };

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Palette className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Style Overrides</h3>
                {value.enabled && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Customize colors and fonts for this portfolio
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-6 border-t pt-4">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Custom Styles</Label>
                <p className="text-xs text-muted-foreground">
                  Override default site aesthetics for this portfolio
                </p>
              </div>
              <Switch
                checked={value.enabled ?? false}
                onCheckedChange={(checked) => handleChange("enabled", checked)}
              />
            </div>

            {value.enabled && (
              <>
                {/* Color section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Colors</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-xs">
                        Primary Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={safeColorForPicker(value.primaryColor, DEFAULT_STYLES.primaryColor!)}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={value.primaryColor || ""}
                          onChange={(e) => handleChange("primaryColor", e.target.value)}
                          placeholder="#6366f1"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor" className="text-xs">
                        Secondary Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={safeColorForPicker(value.secondaryColor, DEFAULT_STYLES.secondaryColor!)}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={value.secondaryColor || ""}
                          onChange={(e) => handleChange("secondaryColor", e.target.value)}
                          placeholder="#8b5cf6"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-xs">
                        Accent Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="accentColor"
                          value={safeColorForPicker(value.accentColor, DEFAULT_STYLES.accentColor!)}
                          onChange={(e) => handleChange("accentColor", e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={value.accentColor || ""}
                          onChange={(e) => handleChange("accentColor", e.target.value)}
                          placeholder="#f97316"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor" className="text-xs">
                        Background
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="backgroundColor"
                          value={safeColorForPicker(value.backgroundColor, DEFAULT_STYLES.backgroundColor!)}
                          onChange={(e) => handleChange("backgroundColor", e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={value.backgroundColor || ""}
                          onChange={(e) => handleChange("backgroundColor", e.target.value)}
                          placeholder="#0a0a0a"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor" className="text-xs">
                        Text Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="textColor"
                          value={safeColorForPicker(value.textColor, DEFAULT_STYLES.textColor!)}
                          onChange={(e) => handleChange("textColor", e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={value.textColor || ""}
                          onChange={(e) => handleChange("textColor", e.target.value)}
                          placeholder="#fafafa"
                          className="flex-1 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color preview */}
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: value.backgroundColor || DEFAULT_STYLES.backgroundColor,
                      color: value.textColor || DEFAULT_STYLES.textColor,
                    }}
                  >
                    <p
                      className="font-semibold mb-1"
                      style={{
                        color: value.primaryColor || DEFAULT_STYLES.primaryColor,
                        fontFamily: value.headingFont || undefined,
                      }}
                    >
                      Preview Heading
                    </p>
                    <p
                      className="text-sm mb-2"
                      style={{
                        color: value.secondaryColor || DEFAULT_STYLES.secondaryColor,
                        fontFamily: value.bodyFont || undefined,
                      }}
                    >
                      Secondary text appears like this
                    </p>
                    <p
                      className="text-sm opacity-80"
                      style={{ fontFamily: value.bodyFont || undefined }}
                    >
                      This is how body text will appear with your selected colors.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{
                          backgroundColor: value.primaryColor || DEFAULT_STYLES.primaryColor,
                        }}
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{
                          backgroundColor: value.secondaryColor || DEFAULT_STYLES.secondaryColor,
                        }}
                      >
                        Secondary
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{
                          backgroundColor: value.accentColor || DEFAULT_STYLES.accentColor,
                        }}
                      >
                        Accent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Typography section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Typography</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="headingFont" className="text-xs">
                        Heading Font
                      </Label>
                      <Select
                        value={fontValueForSelect(value.headingFont)}
                        onValueChange={(v) => handleChange("headingFont", v)}
                      >
                        <SelectTrigger id="headingFont" className="h-9">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem
                              key={font.value || DEFAULT_FONT_SENTINEL}
                              value={font.value}
                              style={{ fontFamily: font.value === DEFAULT_FONT_SENTINEL ? undefined : font.value }}
                            >
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bodyFont" className="text-xs">
                        Body Font
                      </Label>
                      <Select
                        value={fontValueForSelect(value.bodyFont)}
                        onValueChange={(v) => handleChange("bodyFont", v)}
                      >
                        <SelectTrigger id="bodyFont" className="h-9">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem
                              key={font.value || DEFAULT_FONT_SENTINEL}
                              value={font.value}
                              style={{ fontFamily: font.value === DEFAULT_FONT_SENTINEL ? undefined : font.value }}
                            >
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export { DEFAULT_STYLES };

