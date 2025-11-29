import { useState } from "react";
import { GripVertical, Trash2, Plus, Image as ImageIcon, Video as VideoIcon, Images, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MediaPicker } from "./MediaPicker";
import { LayoutDesigner } from "./LayoutDesigner";
import type { MediaPosition, MediaSize, Spacing } from "./LayoutDesigner";

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
    mediaSize?: MediaSize;
    mediaPosition?: MediaPosition;
    textWidth?: number;
    spacing?: Spacing;
  };
}

interface Layer2SectionEditorProps {
  sections: Layer2Section[];
  onChange: (sections: Layer2Section[]) => void;
  projectId: string;
}

export function Layer2SectionEditor({ sections, onChange, projectId }: Layer2SectionEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingCarouselIndex, setEditingCarouselIndex] = useState<number | null>(null);

  const handleSectionChange = (id: string, field: keyof Layer2Section, value: any) => {
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const handleAddSection = () => {
    if (sections.length >= 5) return;

    const newSection: Layer2Section = {
      id: `temp-${Date.now()}`,
      heading: "",
      body: "",
      orderIndex: sections.length,
      mediaType: "none",
      mediaConfig: undefined,
      styleConfig: {
        alignment: "left",
        headingSize: "text-2xl",
        bodySize: "text-base",
      },
    };

    onChange([...sections, newSection]);
  };

  const handleStyleChange = (sectionId: string, styleKey: string, value: any) => {
    onChange(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              styleConfig: {
                ...section.styleConfig,
                [styleKey]: value,
              },
            }
          : section
      )
    );
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 3) return;

    const filtered = sections.filter((s) => s.id !== id);
    // Reindex remaining sections
    onChange(filtered.map((s, idx) => ({ ...s, orderIndex: idx })));
  };

  const handleMoveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[swapIndex]] = [
      newSections[swapIndex],
      newSections[index],
    ];

    // Update order indices
    onChange(newSections.map((s, idx) => ({ ...s, orderIndex: idx })));
  };

  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    if (!editingSection) return;

    const section = sections.find((s) => s.id === editingSection);
    if (!section) return;

    if (editingCarouselIndex !== null) {
      // Add to carousel
      const items = section.mediaConfig?.items || [];
      items[editingCarouselIndex] = {
        mediaId: media.id,
        url: media.url,
        type: media.type === "video" ? "video" : "image",
        caption: "",
      };

      handleSectionChange(editingSection, "mediaConfig", { items });
    } else {
      // Set single media
      handleSectionChange(editingSection, "mediaConfig", {
        mediaId: media.id,
        url: media.url,
      });
    }

    setMediaPickerOpen(false);
    setEditingSection(null);
    setEditingCarouselIndex(null);
  };

  const handleAddCarouselItem = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const items = section.mediaConfig?.items || [];
    setEditingSection(sectionId);
    setEditingCarouselIndex(items.length);
    setMediaPickerOpen(true);
  };

  const handleRemoveCarouselItem = (sectionId: string, itemIndex: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.mediaConfig?.items) return;

    const items = [...section.mediaConfig.items];
    items.splice(itemIndex, 1);

    handleSectionChange(sectionId, "mediaConfig", { items });
  };

  const applyPreset = (presetName: string) => {
    const presets: Record<string, Partial<Layer2Section>[]> = {
      classic: [
        { heading: "The Challenge", body: "", orderIndex: 0, mediaType: "none" },
        { heading: "Our Solution", body: "", orderIndex: 1, mediaType: "none" },
        { heading: "The Outcome", body: "", orderIndex: 2, mediaType: "none" },
      ],
      story: [
        { heading: "The Problem", body: "", orderIndex: 0, mediaType: "none" },
        { heading: "Our Approach", body: "", orderIndex: 1, mediaType: "none" },
        { heading: "The Results", body: "", orderIndex: 2, mediaType: "none" },
        { heading: "The Impact", body: "", orderIndex: 3, mediaType: "none" },
      ],
      deepDive: [
        { heading: "Context", body: "", orderIndex: 0, mediaType: "none" },
        { heading: "Challenge", body: "", orderIndex: 1, mediaType: "none" },
        { heading: "Strategy", body: "", orderIndex: 2, mediaType: "none" },
        { heading: "Execution", body: "", orderIndex: 3, mediaType: "none" },
        { heading: "Outcomes", body: "", orderIndex: 4, mediaType: "none" },
      ],
    };

    const preset = presets[presetName];
    if (preset) {
      onChange(
        preset.map((p, idx) => ({
          id: `temp-${Date.now()}-${idx}`,
          heading: p.heading!,
          body: p.body!,
          orderIndex: p.orderIndex!,
          mediaType: p.mediaType as any,
          mediaConfig: undefined,
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>
            Choose a preset to quickly set up your sections, or build from scratch
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => applyPreset("classic")}>
            3-Section Classic
          </Button>
          <Button variant="outline" onClick={() => applyPreset("story")}>
            4-Section Story
          </Button>
          <Button variant="outline" onClick={() => applyPreset("deepDive")}>
            5-Section Deep Dive
          </Button>
        </CardContent>
      </Card>

      {/* Section List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Sections ({sections.length}/5)</h3>
            <p className="text-sm text-muted-foreground">
              Minimum 3 sections required, maximum 5 sections allowed
            </p>
          </div>
          <Button
            onClick={handleAddSection}
            disabled={sections.length >= 5}
            data-testid="button-add-section"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, index) => (
          <Card key={section.id} data-testid={`section-editor-${index}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                  <Badge variant="secondary">Section {index + 1}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSection(section.id, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSection(section.id, "down")}
                    disabled={index === sections.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSection(section.id)}
                    disabled={sections.length <= 3}
                    data-testid={`button-delete-section-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Heading */}
              <div>
                <label className="text-sm font-medium mb-1 block">Heading *</label>
                <Input
                  value={section.heading}
                  onChange={(e) => handleSectionChange(section.id, "heading", e.target.value)}
                  placeholder="e.g., The Challenge"
                  maxLength={200}
                  data-testid={`input-heading-${index}`}
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-medium mb-1 block">Body Text *</label>
                <Textarea
                  value={section.body}
                  onChange={(e) => handleSectionChange(section.id, "body", e.target.value)}
                  placeholder="Enter the section content..."
                  className="min-h-[120px]"
                  maxLength={2000}
                  data-testid={`textarea-body-${index}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {section.body.length}/2000 characters
                </p>
              </div>

              {/* Media Type */}
              <div>
                <label className="text-sm font-medium mb-1 block">Media Type</label>
                <Select
                  value={section.mediaType}
                  onValueChange={(value: any) =>
                    handleSectionChange(section.id, "mediaType", value)
                  }
                >
                  <SelectTrigger data-testid={`select-media-type-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Media</SelectItem>
                    <SelectItem value="image">Single Image</SelectItem>
                    <SelectItem value="video">Single Video</SelectItem>
                    <SelectItem value="image-carousel">Image Carousel</SelectItem>
                    <SelectItem value="video-carousel">Video Carousel</SelectItem>
                    <SelectItem value="mixed-carousel">Mixed Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Single Media */}
              {(section.mediaType === "image" || section.mediaType === "video") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Media</label>
                  {section.mediaConfig?.url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      {section.mediaType === "video" ? (
                        <video src={section.mediaConfig.url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={section.mediaConfig.url} alt="Selected media" className="w-full h-full object-cover" />
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => handleSectionChange(section.id, "mediaConfig", undefined)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingSection(section.id);
                        setEditingCarouselIndex(null);
                        setMediaPickerOpen(true);
                      }}
                      data-testid={`button-select-media-${index}`}
                    >
                      {section.mediaType === "video" ? (
                        <VideoIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      Select from Media Library
                    </Button>
                  )}
                </div>
              )}

              {/* Carousel */}
              {section.mediaType.includes("carousel") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Carousel Items</label>
                  <div className="space-y-2">
                    {section.mediaConfig?.items?.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2 p-2 border rounded">
                        <Badge variant="secondary">{itemIdx + 1}</Badge>
                        <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                          {item.type === "video" ? (
                            <VideoIcon className="w-full h-full p-4" />
                          ) : (
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <Input
                          placeholder="Caption (optional)"
                          value={item.caption || ""}
                          onChange={(e) => {
                            const items = [...(section.mediaConfig?.items || [])];
                            items[itemIdx] = { ...items[itemIdx], caption: e.target.value };
                            handleSectionChange(section.id, "mediaConfig", { items });
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCarouselItem(section.id, itemIdx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => handleAddCarouselItem(section.id)}
                      data-testid={`button-add-carousel-item-${index}`}
                    >
                      <Images className="w-4 h-4 mr-2" />
                      Add Carousel Item
                    </Button>
                  </div>
                </div>
              )}

              {/* Styling Controls */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Palette className="w-4 h-4 mr-2" />
                    Styling Options (Optional)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Colors */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">Background Color</label>
                      <Input
                        type="color"
                        value={section.styleConfig?.backgroundColor || "#ffffff"}
                        onChange={(e) => handleStyleChange(section.id, "backgroundColor", e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Text Color</label>
                      <Input
                        type="color"
                        value={section.styleConfig?.textColor || "#000000"}
                        onChange={(e) => handleStyleChange(section.id, "textColor", e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Heading Color</label>
                      <Input
                        type="color"
                        value={section.styleConfig?.headingColor || "#000000"}
                        onChange={(e) => handleStyleChange(section.id, "headingColor", e.target.value)}
                        className="h-10"
                      />
                    </div>

                    {/* Typography */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">Heading Size</label>
                      <Select
                        value={section.styleConfig?.headingSize || "text-2xl"}
                        onValueChange={(value) => handleStyleChange(section.id, "headingSize", value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-xl">XL</SelectItem>
                          <SelectItem value="text-2xl">2XL</SelectItem>
                          <SelectItem value="text-3xl">3XL</SelectItem>
                          <SelectItem value="text-4xl">4XL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Body Size</label>
                      <Select
                        value={section.styleConfig?.bodySize || "text-base"}
                        onValueChange={(value) => handleStyleChange(section.id, "bodySize", value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-sm">Small</SelectItem>
                          <SelectItem value="text-base">Base</SelectItem>
                          <SelectItem value="text-lg">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Alignment */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">Alignment</label>
                      <Select
                        value={section.styleConfig?.alignment || "left"}
                        onValueChange={(value) => handleStyleChange(section.id, "alignment", value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Layout Configuration - only show when section has media */}
                  {section.mediaType !== "none" && (
                    <div className="pt-4 border-t mt-4">
                      <label className="text-xs font-medium mb-3 block">Layout</label>
                      <LayoutDesigner
                        mediaPosition={section.styleConfig?.mediaPosition || "above"}
                        onMediaPositionChange={(pos) => handleStyleChange(section.id, "mediaPosition", pos)}
                        mediaSize={section.styleConfig?.mediaSize || "standard"}
                        onMediaSizeChange={(size) => handleStyleChange(section.id, "mediaSize", size)}
                        textWidth={section.styleConfig?.textWidth || 50}
                        onTextWidthChange={(width) => handleStyleChange(section.id, "textWidth", width)}
                        spacing={section.styleConfig?.spacing || "normal"}
                        onSpacingChange={(spacing) => handleStyleChange(section.id, "spacing", spacing)}
                      />
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Media Picker Dialog */}
      {mediaPickerOpen && (
        <MediaPicker
          onSelect={handleMediaSelect}
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          projectId={projectId}
          mediaType="all"
        />
      )}
    </div>
  );
}

