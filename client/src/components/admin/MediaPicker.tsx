import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  Video,
  X,
  Plus,
  Check,
  Search,
  ImagePlus,
  Film,
  Layers,
} from "lucide-react";

interface MediaAsset {
  id: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  mediaType: "image" | "video";
  label?: string;
  tags: string[];
  createdAt: string;
  projectId?: string;
}

export type MediaSelectionMode = "single" | "carousel";
export type MediaTypeFilter = "all" | "image" | "video";

interface MediaPickerProps {
  /** Current selected media URLs */
  value: string[];
  /** Callback when selection changes */
  onChange: (urls: string[]) => void;
  /** Selection mode - single or carousel (multiple) */
  mode?: MediaSelectionMode;
  /** Filter by media type */
  mediaTypeFilter?: MediaTypeFilter;
  /** Placeholder text for the trigger button */
  placeholder?: string;
  /** Optional className for the trigger */
  className?: string;
  /** Max items for carousel mode */
  maxItems?: number;
}

export function MediaPicker({
  value,
  onChange,
  mode = "single",
  mediaTypeFilter = "all",
  placeholder,
  className,
  maxItems = 10,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MediaTypeFilter>(mediaTypeFilter);
  const [tempSelection, setTempSelection] = useState<string[]>([]);

  // Fetch media library
  const { data: mediaAssets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["/api/media-library"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/media-library");
      return response.json();
    },
    enabled: open,
  });

  // Filter media
  const filteredMedia = mediaAssets.filter((asset) => {
    const matchesSearch =
      asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      activeTab === "all" ||
      asset.mediaType === activeTab ||
      (mediaTypeFilter !== "all" && asset.mediaType === mediaTypeFilter);

    return matchesSearch && matchesType;
  });

  // Handle opening the dialog
  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelection([...value]);
    }
    setOpen(isOpen);
  };

  // Handle selecting an asset
  const handleSelect = (asset: MediaAsset) => {
    if (mode === "single") {
      setTempSelection([asset.cloudinaryUrl]);
    } else {
      // Carousel mode
      if (tempSelection.includes(asset.cloudinaryUrl)) {
        setTempSelection(tempSelection.filter((url) => url !== asset.cloudinaryUrl));
      } else if (tempSelection.length < maxItems) {
        setTempSelection([...tempSelection, asset.cloudinaryUrl]);
      }
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    onChange(tempSelection);
    setOpen(false);
  };

  // Remove a selected item
  const handleRemove = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  // Get asset type from URL
  const getMediaType = (url: string): "image" | "video" => {
    if (url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)) return "video";
    return "image";
  };

  // Determine placeholder text
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === "carousel") return "Select media for carousel";
    if (mediaTypeFilter === "image") return "Select image";
    if (mediaTypeFilter === "video") return "Select video";
    return "Select media";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current selection preview */}
      {value.length > 0 && (
        <div className={cn(
          "grid gap-2",
          mode === "carousel" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1"
        )}>
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-video rounded-lg overflow-hidden bg-muted border"
            >
              {getMediaType(url) === "video" ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={url}
                  alt={`Selected media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {mode === "carousel" && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-1 left-1 text-xs"
                >
                  {index + 1}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 text-muted-foreground",
              value.length > 0 && "border-primary/30"
            )}
          >
            {mode === "carousel" ? (
              <Layers className="w-4 h-4" />
            ) : mediaTypeFilter === "video" ? (
              <Film className="w-4 h-4" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {value.length > 0
              ? mode === "carousel"
                ? `${value.length} item${value.length > 1 ? "s" : ""} selected`
                : "Change media"
              : getPlaceholder()}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Media Library
              {mode === "carousel" && (
                <Badge variant="outline" className="ml-2">
                  {tempSelection.length} / {maxItems} selected
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Search and filters */}
          <div className="flex items-center gap-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {mediaTypeFilter === "all" && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MediaTypeFilter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Media grid */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No media found</p>
                <p className="text-sm">Upload media in the Media Library first</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4">
                {filteredMedia.map((asset) => {
                  const isSelected = tempSelection.includes(asset.cloudinaryUrl);
                  const selectionIndex = tempSelection.indexOf(asset.cloudinaryUrl);

                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelect(asset)}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden bg-muted border-2 transition-all hover:border-primary/50",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent"
                      )}
                    >
                      {asset.mediaType === "video" ? (
                        <video
                          src={asset.cloudinaryUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={asset.cloudinaryUrl}
                          alt={asset.label || asset.cloudinaryPublicId}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Type badge */}
                      <Badge
                        variant="secondary"
                        className="absolute bottom-1 left-1 text-xs gap-1"
                      >
                        {asset.mediaType === "video" ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                      </Badge>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          {mode === "carousel" ? (
                            <span className="text-xs font-bold text-primary-foreground">
                              {selectionIndex + 1}
                            </span>
                          ) : (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      )}

                      {/* Label */}
                      {asset.label && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 pt-4">
                          <p className="text-xs text-white truncate">{asset.label}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTempSelection([])}
              disabled={tempSelection.length === 0}
            >
              Clear Selection
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleConfirm}>
                {mode === "single" ? "Select" : `Confirm (${tempSelection.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
