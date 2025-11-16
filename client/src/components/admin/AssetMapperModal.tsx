
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, VideoIcon, Quote, Search, Check, Plus, Loader2 } from "lucide-react";
import { getPlaceholderType, type PlaceholderId } from "@shared/placeholder-config";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";

interface AssetMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeholderId: PlaceholderId;
  currentMapping?: string;
  availableAssets: {
    images: Array<{ id: string; url: string; alt?: string }>;
    videos: Array<{ id: string; url: string; caption?: string }>;
    quotes: Array<{ id: string; quote: string; author: string }>;
  };
  onSave: (placeholderId: PlaceholderId, assetId: string) => void;
}

export function AssetMapperModal({
  isOpen,
  onClose,
  placeholderId,
  currentMapping,
  availableAssets,
  onSave,
}: AssetMapperModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(currentMapping || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"select" | "create">("select");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create asset form state
  const [newAsset, setNewAsset] = useState({
    title: "",
    imageUrl: "",
    altText: "",
    videoUrl: "",
    videoCaption: "",
    quoteText: "",
    quoteAuthor: "",
    quoteRole: "",
  });

  const placeholderType = getPlaceholderType(placeholderId);

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const response = await apiRequest("POST", "/api/content-assets", assetData);
      if (!response.ok) throw new Error("Failed to create asset");
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Asset created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/content-assets"] });
      setSelectedAssetId(data.id);
      setActiveTab("select");
      // Reset form
      setNewAsset({
        title: "",
        imageUrl: "",
        altText: "",
        videoUrl: "",
        videoCaption: "",
        quoteText: "",
        quoteAuthor: "",
        quoteRole: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create asset",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    if (selectedAssetId) {
      // Extract projectId from current URL or pass it as prop
      const projectId = window.location.pathname.split('/').pop();
      
      try {
        // Save to database
        const response = await apiRequest(
          "PUT",
          `/api/projects/${projectId}/asset-map/${placeholderId}`,
          { assetId: selectedAssetId }
        );
        
        if (!response.ok) throw new Error("Failed to save asset mapping");
        
        toast({ title: "Asset mapping saved successfully" });
        onSave(placeholderId, selectedAssetId);
        onClose();
      } catch (error) {
        toast({
          title: "Failed to save asset mapping",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateAsset = () => {
    const assetData: any = {
      assetType: placeholderType,
      title: newAsset.title || undefined,
    };

    if (placeholderType === "image") {
      if (!newAsset.imageUrl) {
        toast({ title: "Image URL is required", variant: "destructive" });
        return;
      }
      assetData.imageUrl = newAsset.imageUrl;
      assetData.altText = newAsset.altText || undefined;
    } else if (placeholderType === "video") {
      if (!newAsset.videoUrl) {
        toast({ title: "Video URL is required", variant: "destructive" });
        return;
      }
      assetData.videoUrl = newAsset.videoUrl;
      assetData.videoCaption = newAsset.videoCaption || undefined;
    } else if (placeholderType === "quote") {
      if (!newAsset.quoteText) {
        toast({ title: "Quote text is required", variant: "destructive" });
        return;
      }
      assetData.quoteText = newAsset.quoteText;
      assetData.quoteAuthor = newAsset.quoteAuthor || undefined;
      assetData.quoteRole = newAsset.quoteRole || undefined;
    }

    createAssetMutation.mutate(assetData);
  };

  const filterAssets = <T extends { id: string }>(assets: T[]): T[] => {
    if (!searchTerm) return assets;
    return assets.filter((asset) =>
      asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderImageGrid = () => {
    const filtered = filterAssets(availableAssets.images);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((image) => (
          <Card
            key={image.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAssetId === image.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedAssetId(image.id)}
          >
            <CardContent className="p-3">
              <div className="aspect-video relative overflow-hidden rounded-md bg-muted mb-2">
                <img
                  src={image.url}
                  alt={image.alt || image.id}
                  className="w-full h-full object-cover"
                />
                {selectedAssetId === image.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate">{image.id}</p>
              {image.alt && (
                <p className="text-xs text-muted-foreground truncate">{image.alt}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderVideoGrid = () => {
    const filtered = filterAssets(availableAssets.videos);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAssetId === video.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedAssetId(video.id)}
          >
            <CardContent className="p-3">
              <div className="aspect-video relative overflow-hidden rounded-md bg-muted mb-2 flex items-center justify-center">
                <VideoIcon className="w-12 h-12 text-muted-foreground" />
                {selectedAssetId === video.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <p className="text-xs font-medium truncate">{video.id}</p>
              {video.caption && (
                <p className="text-xs text-muted-foreground truncate">{video.caption}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuoteList = () => {
    const filtered = filterAssets(availableAssets.quotes);
    return (
      <div className="space-y-3">
        {filtered.map((quote) => (
          <Card
            key={quote.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedAssetId === quote.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedAssetId(quote.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Quote className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm italic mb-2 line-clamp-2">"{quote.quote}"</p>
                  <p className="text-xs text-muted-foreground">— {quote.author}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {quote.id}
                  </Badge>
                </div>
                {selectedAssetId === quote.id && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCreateForm = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="asset-title">Title (Optional)</Label>
          <Input
            id="asset-title"
            value={newAsset.title}
            onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
            placeholder="Give this asset a memorable name"
          />
        </div>

        {placeholderType === "image" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL *</Label>
              <Input
                id="image-url"
                value={newAsset.imageUrl}
                onChange={(e) => setNewAsset({ ...newAsset, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={newAsset.altText}
                onChange={(e) => setNewAsset({ ...newAsset, altText: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>
          </>
        )}

        {placeholderType === "video" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL *</Label>
              <Input
                id="video-url"
                value={newAsset.videoUrl}
                onChange={(e) => setNewAsset({ ...newAsset, videoUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-caption">Caption</Label>
              <Input
                id="video-caption"
                value={newAsset.videoCaption}
                onChange={(e) => setNewAsset({ ...newAsset, videoCaption: e.target.value })}
                placeholder="Video description"
              />
            </div>
          </>
        )}

        {placeholderType === "quote" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote *</Label>
              <Textarea
                id="quote-text"
                value={newAsset.quoteText}
                onChange={(e) => setNewAsset({ ...newAsset, quoteText: e.target.value })}
                placeholder="Enter the quote text"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-author">Author</Label>
              <Input
                id="quote-author"
                value={newAsset.quoteAuthor}
                onChange={(e) => setNewAsset({ ...newAsset, quoteAuthor: e.target.value })}
                placeholder="Who said this?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-role">Role/Title</Label>
              <Input
                id="quote-role"
                value={newAsset.quoteRole}
                onChange={(e) => setNewAsset({ ...newAsset, quoteRole: e.target.value })}
                placeholder="CEO, Designer, etc."
              />
            </div>
          </>
        )}

        <Button
          onClick={handleCreateAsset}
          disabled={createAssetMutation.isPending}
          className="w-full"
        >
          {createAssetMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create & Select Asset
            </>
          )}
        </Button>
      </div>
    );
  };

  const getIcon = () => {
    switch (placeholderType) {
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <VideoIcon className="w-5 h-5" />;
      case "quote":
        return <Quote className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getAssetCount = () => {
    switch (placeholderType) {
      case "image":
        return availableAssets.images.length;
      case "video":
        return availableAssets.videos.length;
      case "quote":
        return availableAssets.quotes.length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <DialogTitle>Assign Asset to {placeholderId}</DialogTitle>
              <DialogDescription>
                Select an existing {placeholderType} or create a new one
                {currentMapping && (
                  <span className="block mt-1 text-xs text-primary">
                    Currently mapped: {currentMapping}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "select" | "create")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">
              Select Existing ({getAssetCount()})
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="flex-1 overflow-hidden flex flex-col mt-4">
            {getAssetCount() > 0 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${placeholderType}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <ScrollArea className="flex-1">
              {placeholderType === "image" && renderImageGrid()}
              {placeholderType === "video" && renderVideoGrid()}
              {placeholderType === "quote" && renderQuoteList()}

              {getAssetCount() === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No {placeholderType}s available yet.</p>
                  <p className="text-sm mt-2">Create your first one using the "Create New" tab.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              {renderCreateForm()}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedAssetId ? (
              <span>
                Selected: <Badge variant="secondary">{selectedAssetId}</Badge>
              </span>
            ) : (
              <span>No asset selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedAssetId}>
              Assign Asset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
