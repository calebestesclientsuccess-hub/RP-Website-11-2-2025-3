import { useState, useCallback, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Image as ImageIcon,
  ExternalLink,
  Check,
  AlertCircle,
  User,
} from "lucide-react";

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description?: string;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download: string;
  };
  width: number;
  height: number;
  color: string;
}

interface UnsplashPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, metadata?: {
    source: 'unsplash';
    imageId: string;
    photographer: string;
    photographerUrl: string;
    alt: string;
  }) => void;
  title?: string;
  description?: string;
}

export function UnsplashPicker({
  isOpen,
  onClose,
  onSelect,
  title = "Select Stock Photo",
  description = "Search millions of free high-quality stock photos from Unsplash"
}: UnsplashPickerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Popular search suggestions
  const suggestions = [
    "business", "technology", "office", "team", "success",
    "innovation", "data", "meeting", "strategy", "growth"
  ];

  const searchImages = useCallback(async (query: string, pageNum: number = 1) => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest("/api/media/search-unsplash", {
        method: "POST",
        body: JSON.stringify({
          query: query.trim(),
          page: pageNum,
          perPage: 20
        })
      });

      if (pageNum === 1) {
        setImages(response.images || []);
      } else {
        setImages(prev => [...prev, ...(response.images || [])]);
      }
      
      setHasMore((response.images?.length || 0) === 20);
      setPage(pageNum);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search images. Please try again.");
      
      // If search fails, show a friendly error
      toast({
        title: "Search Error",
        description: "Unable to search images. Using fallback images instead.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchImages(searchQuery, 1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    searchImages(suggestion, 1);
  };

  const handleImageSelect = () => {
    if (!selectedImage) return;

    const metadata = {
      source: 'unsplash' as const,
      imageId: selectedImage.id,
      photographer: selectedImage.user.name,
      photographerUrl: selectedImage.user.links.html,
      alt: selectedImage.alt_description || selectedImage.description || "Unsplash image"
    };

    // Use the regular size URL for general use
    onSelect(selectedImage.urls.regular, metadata);
    
    toast({
      title: "Image Selected",
      description: `Photo by ${selectedImage.user.name} selected successfully`,
    });

    // Reset and close
    setSelectedImage(null);
    onClose();
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchImages(searchQuery, page + 1);
    }
  };

  // Load popular images on mount
  useEffect(() => {
    if (isOpen && images.length === 0 && !searchQuery) {
      searchImages("business professional", 1);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-unsplash-search"
            />
            <Button type="submit" disabled={loading} data-testid="button-search-unsplash">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
                data-testid={`button-suggestion-${suggestion}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Image Grid */}
        <ScrollArea className="flex-1 px-6 pb-6" style={{ maxHeight: '400px' }}>
          {loading && images.length === 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage?.id === image.id
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                    onClick={() => setSelectedImage(image)}
                    data-testid={`image-result-${image.id}`}
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Unsplash image"}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                    
                    {/* Selected Overlay */}
                    {selectedImage?.id === image.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay with Attribution */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                      <div className="text-white text-xs">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{image.user.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    data-testid="button-load-more"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No images found. Try a different search term." : "Enter a search term to find images"}
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Selected Image Preview & Actions */}
        {selectedImage && (
          <div className="border-t p-6 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedImage.urls.thumb}
                  alt={selectedImage.alt_description || "Selected image"}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">Photo by {selectedImage.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.width} × {selectedImage.height}px
                  </p>
                  <a
                    href={selectedImage.links.html}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View on Unsplash
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                  data-testid="button-cancel-selection"
                >
                  Cancel Selection
                </Button>
                <Button
                  onClick={handleImageSelect}
                  data-testid="button-use-image"
                >
                  Use This Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}