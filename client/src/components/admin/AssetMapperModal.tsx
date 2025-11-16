
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
import { ImageIcon, VideoIcon, Quote, Search, Check } from "lucide-react";
import { getPlaceholderType, type PlaceholderId } from "@shared/placeholder-config";

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

  const placeholderType = getPlaceholderType(placeholderId);

  const handleSave = () => {
    if (selectedAssetId) {
      onSave(placeholderId, selectedAssetId);
      onClose();
    }
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
                Select a {placeholderType} from your content library ({getAssetCount()} available)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${placeholderType}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Asset Grid/List */}
          <ScrollArea className="flex-1">
            {placeholderType === "image" && renderImageGrid()}
            {placeholderType === "video" && renderVideoGrid()}
            {placeholderType === "quote" && renderQuoteList()}

            {getAssetCount() === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No {placeholderType}s available in your content library.</p>
                <p className="text-sm mt-2">Add some assets first before mapping placeholders.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Actions */}
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
