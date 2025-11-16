import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ENTRY_EFFECTS,
  EXIT_EFFECTS,
  HEADING_SIZES,
  BODY_SIZES,
  FONT_WEIGHTS,
  ALIGNMENTS,
  SCROLL_SPEEDS,
  MEDIA_POSITIONS,
  MEDIA_SCALES,
  DEFAULT_DIRECTOR_CONFIG,
  type DirectorConfig,
} from "@shared/schema";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";

interface DirectorConfigFormProps {
  form: UseFormReturn<any>;
  sceneType: string;
}

export function DirectorConfigForm({ form, sceneType }: DirectorConfigFormProps) {
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [isAnimationOpen, setIsAnimationOpen] = useState(false);
  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isEffectsOpen, setIsEffectsOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const isMediaScene = ["image", "video", "fullscreen", "split"].includes(sceneType);

  const resetToDefaults = () => {
    Object.entries(DEFAULT_DIRECTOR_CONFIG).forEach(([key, value]) => {
      form.setValue(`director.${key}`, value);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Visual Configuration</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          data-testid="button-reset-director-defaults"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      {/* Basic Appearance */}
      <Collapsible open={isBasicOpen} onOpenChange={setIsBasicOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-md hover-elevate" data-testid="toggle-basic-appearance">
          <span className="font-medium">Basic Appearance</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isBasicOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director.backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        {...field}
                        value={field.value || DEFAULT_DIRECTOR_CONFIG.backgroundColor}
                        className="w-20 h-9 p-1 cursor-pointer"
                        data-testid="input-background-color"
                      />
                      <Input
                        type="text"
                        {...field}
                        value={field.value || DEFAULT_DIRECTOR_CONFIG.backgroundColor}
                        placeholder="#0a0a0a"
                        className="flex-1"
                        data-testid="input-background-color-text"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.textColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        {...field}
                        value={field.value || DEFAULT_DIRECTOR_CONFIG.textColor}
                        className="w-20 h-9 p-1 cursor-pointer"
                        data-testid="input-text-color"
                      />
                      <Input
                        type="text"
                        {...field}
                        value={field.value || DEFAULT_DIRECTOR_CONFIG.textColor}
                        placeholder="#f0f0f0"
                        className="flex-1"
                        data-testid="input-text-color-text"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="director.alignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Alignment</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.alignment}>
                  <FormControl>
                    <SelectTrigger data-testid="select-alignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALIGNMENTS.map((align) => (
                      <SelectItem key={align} value={align} data-testid={`option-alignment-${align}`}>
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director.textShadow"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 bg-card rounded-md">
                  <FormLabel className="!mt-0">Text Shadow</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      data-testid="switch-text-shadow"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.textGlow"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 bg-card rounded-md">
                  <FormLabel className="!mt-0">Text Glow</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      data-testid="switch-text-glow"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director.paddingTop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Top Padding</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "md"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-padding-top">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["none", "sm", "md", "lg", "xl", "2xl"].map((size) => (
                        <SelectItem key={size} value={size}>{size.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.paddingBottom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bottom Padding</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "md"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-padding-bottom">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["none", "sm", "md", "lg", "xl", "2xl"].map((size) => (
                        <SelectItem key={size} value={size}>{size.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Animation & Timing */}
      <Collapsible open={isAnimationOpen} onOpenChange={setIsAnimationOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-md hover-elevate" data-testid="toggle-animation-timing">
          <span className="font-medium">Animation & Timing</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isAnimationOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director.entryEffect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Effect</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.entryEffect}>
                    <FormControl>
                      <SelectTrigger data-testid="select-entry-effect">
                        <SelectValue placeholder="Select effect" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTRY_EFFECTS.map((effect) => (
                        <SelectItem key={effect} value={effect} data-testid={`option-entry-${effect}`}>
                          {effect.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.exitEffect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Effect</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.exitEffect}>
                    <FormControl>
                      <SelectTrigger data-testid="select-exit-effect">
                        <SelectValue placeholder="Select effect" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXIT_EFFECTS.map((effect) => (
                        <SelectItem key={effect} value={effect} data-testid={`option-exit-${effect}`}>
                          {effect.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="director.entryDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Duration: {(field.value || DEFAULT_DIRECTOR_CONFIG.entryDuration).toFixed(2)}s</FormLabel>
                <FormControl>
                  <Slider
                    min={0.25}
                    max={5}
                    step={0.25}
                    value={[field.value || DEFAULT_DIRECTOR_CONFIG.entryDuration]}
                    onValueChange={([value]) => field.onChange(value)}
                    data-testid="slider-entry-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="director.entryDelay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Delay: {(field.value || DEFAULT_DIRECTOR_CONFIG.entryDelay).toFixed(2)}s</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={10}
                    step={0.25}
                    value={[field.value || DEFAULT_DIRECTOR_CONFIG.entryDelay]}
                    onValueChange={([value]) => field.onChange(value)}
                    data-testid="slider-entry-delay"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="director.exitDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exit Duration: {(field.value || DEFAULT_DIRECTOR_CONFIG.exitDuration).toFixed(2)}s</FormLabel>
                <FormControl>
                  <Slider
                    min={0.25}
                    max={5}
                    step={0.25}
                    value={[field.value || DEFAULT_DIRECTOR_CONFIG.exitDuration]}
                    onValueChange={([value]) => field.onChange(value)}
                    data-testid="slider-exit-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="director.animationDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Animation Duration: {(field.value || DEFAULT_DIRECTOR_CONFIG.animationDuration).toFixed(2)}s</FormLabel>
                <FormControl>
                  <Slider
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={[field.value || DEFAULT_DIRECTOR_CONFIG.animationDuration]}
                    onValueChange={([value]) => field.onChange(value)}
                    data-testid="slider-animation-duration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Typography */}
      <Collapsible open={isTypographyOpen} onOpenChange={setIsTypographyOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-md hover-elevate" data-testid="toggle-typography">
          <span className="font-medium">Typography</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isTypographyOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="director.headingSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.headingSize}>
                    <FormControl>
                      <SelectTrigger data-testid="select-heading-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HEADING_SIZES.map((size) => (
                        <SelectItem key={size} value={size} data-testid={`option-heading-${size}`}>
                          {size.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.bodySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.bodySize}>
                    <FormControl>
                      <SelectTrigger data-testid="select-body-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BODY_SIZES.map((size) => (
                        <SelectItem key={size} value={size} data-testid={`option-body-${size}`}>
                          {size.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="director.fontWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Font Weight</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.fontWeight}>
                  <FormControl>
                    <SelectTrigger data-testid="select-font-weight">
                      <SelectValue placeholder="Select weight" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FONT_WEIGHTS.map((weight) => (
                      <SelectItem key={weight} value={weight} data-testid={`option-weight-${weight}`}>
                        {weight.charAt(0).toUpperCase() + weight.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Scroll Effects */}
      <Collapsible open={isEffectsOpen} onOpenChange={setIsEffectsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-md hover-elevate" data-testid="toggle-scroll-effects">
          <span className="font-medium">Scroll Effects</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isEffectsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <FormField
            control={form.control}
            name="director.scrollSpeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scroll Speed</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.scrollSpeed}>
                  <FormControl>
                    <SelectTrigger data-testid="select-scroll-speed">
                      <SelectValue placeholder="Select speed" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SCROLL_SPEEDS.map((speed) => (
                      <SelectItem key={speed} value={speed} data-testid={`option-speed-${speed}`}>
                        {speed.charAt(0).toUpperCase() + speed.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="director.parallaxIntensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parallax Intensity: {((field.value || DEFAULT_DIRECTOR_CONFIG.parallaxIntensity) * 100).toFixed(0)}%</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value || DEFAULT_DIRECTOR_CONFIG.parallaxIntensity]}
                    onValueChange={([value]) => field.onChange(value)}
                    data-testid="slider-parallax-intensity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="director.fadeOnScroll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 bg-card rounded-md">
                  <FormLabel className="!mt-0">Fade on Scroll</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? DEFAULT_DIRECTOR_CONFIG.fadeOnScroll}
                      onCheckedChange={field.onChange}
                      data-testid="switch-fade-on-scroll"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.blurOnScroll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 bg-card rounded-md">
                  <FormLabel className="!mt-0">Blur on Scroll</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? DEFAULT_DIRECTOR_CONFIG.blurOnScroll}
                      onCheckedChange={field.onChange}
                      data-testid="switch-blur-on-scroll"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="director.scaleOnScroll"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 bg-card rounded-md">
                  <FormLabel className="!mt-0">Scale on Scroll</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? DEFAULT_DIRECTOR_CONFIG.scaleOnScroll}
                      onCheckedChange={field.onChange}
                      data-testid="switch-scale-on-scroll"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Media Settings (conditional) */}
      {isMediaScene && (
        <Collapsible open={isMediaOpen} onOpenChange={setIsMediaOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-card rounded-md hover-elevate" data-testid="toggle-media-settings">
            <span className="font-medium">Media Settings</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMediaOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="director.mediaPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Position</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.mediaPosition}>
                      <FormControl>
                        <SelectTrigger data-testid="select-media-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDIA_POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos} data-testid={`option-position-${pos}`}>
                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="director.mediaScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Scale</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || DEFAULT_DIRECTOR_CONFIG.mediaScale}>
                      <FormControl>
                        <SelectTrigger data-testid="select-media-scale">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEDIA_SCALES.map((scale) => (
                          <SelectItem key={scale} value={scale} data-testid={`option-scale-${scale}`}>
                            {scale.charAt(0).toUpperCase() + scale.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="director.mediaOpacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Opacity: {((field.value || DEFAULT_DIRECTOR_CONFIG.mediaOpacity) * 100).toFixed(0)}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[field.value || DEFAULT_DIRECTOR_CONFIG.mediaOpacity]}
                      onValueChange={([value]) => field.onChange(value)}
                      data-testid="slider-media-opacity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
