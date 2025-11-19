import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Link,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";

interface URLInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, metadata?: {
    source: 'custom';
    alt?: string;
  }) => void;
  title?: string;
  description?: string;
  initialUrl?: string;
}

export function URLInput({
  isOpen,
  onClose,
  onSelect,
  title = "Add Image from URL",
  description = "Enter a direct URL to an image (perfect for logos, custom graphics, or external images)",
  initialUrl = ""
}: URLInputProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState(initialUrl);
  const [altText, setAltText] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Example URLs for quick testing
  const exampleUrls = [
    {
      label: "Logo Example",
      url: "https://via.placeholder.com/300x100/333333/FFFFFF?text=Your+Logo"
    },
    {
      label: "Product Image",
      url: "https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Product"
    },
    {
      label: "Hero Background",
      url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200"
    }
  ];

  // Debounced URL validation
  useEffect(() => {
    if (!url || url === initialUrl) {
      setValidationResult(null);
      setPreviewUrl(null);
      return;
    }

    const timer = setTimeout(() => {
      validateUrl(url);
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  const validateUrl = async (urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setValidationResult(null);
      setPreviewUrl(null);
      return;
    }

    // Basic URL format check
    try {
      new URL(urlToValidate);
    } catch {
      setValidationResult({
        valid: false,
        error: "Please enter a valid URL"
      });
      setPreviewUrl(null);
      return;
    }

    setValidating(true);
    setPreviewError(null);

    try {
      // Validate with backend
      const response = await apiRequest("/api/media/validate-url", {
        method: "POST",
        body: JSON.stringify({ url: urlToValidate })
      });

      setValidationResult(response);
      
      if (response.valid) {
        // Try to load preview
        setPreviewLoading(true);
        setPreviewUrl(urlToValidate);
      } else {
        setPreviewUrl(null);
        setPreviewError(response.error || "Invalid image URL");
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        error: error.message || "Failed to validate URL"
      });
      setPreviewUrl(null);
    } finally {
      setValidating(false);
    }
  };

  const handleImageLoad = () => {
    setPreviewLoading(false);
    setPreviewError(null);
  };

  const handleImageError = () => {
    setPreviewLoading(false);
    setPreviewError("Failed to load image preview");
    setValidationResult({
      valid: false,
      error: "Image failed to load. Please check the URL."
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !validationResult?.valid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }

    const metadata = {
      source: 'custom' as const,
      alt: altText || undefined
    };

    onSelect(url, metadata);
    
    toast({
      title: "Image Added",
      description: "Custom image URL added successfully"
    });

    // Reset and close
    setUrl("");
    setAltText("");
    setValidationResult(null);
    setPreviewUrl(null);
    onClose();
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    validateUrl(exampleUrl);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "URL copied to clipboard"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Image URL</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`pr-10 ${
                    validationResult
                      ? validationResult.valid
                        ? "border-green-500 focus:ring-green-500"
                        : "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  data-testid="input-image-url"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {validating && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!validating && validationResult?.valid && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {!validating && validationResult && !validationResult.valid && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {url && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  data-testid="button-copy-url"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
              {url && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(url, '_blank')}
                  data-testid="button-open-url"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
            {validationResult?.error && (
              <p className="text-sm text-red-500">{validationResult.error}</p>
            )}
          </div>

          {/* Alt Text Input */}
          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text (Optional)</Label>
            <Input
              id="alt"
              type="text"
              placeholder="Describe the image for accessibility"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              data-testid="input-alt-text"
            />
            <p className="text-xs text-muted-foreground">
              Providing alt text improves accessibility and SEO
            </p>
          </div>

          {/* Example URLs */}
          <div className="space-y-2">
            <Label>Quick Examples</Label>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((example, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example.url)}
                  data-testid={`button-example-${index}`}
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-muted">
                {previewLoading && (
                  <Skeleton className="w-full h-64" />
                )}
                {previewError && !previewLoading && (
                  <div className="w-full h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="text-sm">{previewError}</p>
                  </div>
                )}
                {!previewError && (
                  <img
                    src={previewUrl}
                    alt={altText || "Image preview"}
                    className={`w-full h-64 object-contain ${previewLoading ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Tips:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Use direct image URLs (ending in .jpg, .png, .gif, .webp)</li>
                <li>• Ensure the website allows hotlinking</li>
                <li>• For best results, use images at least 1200px wide</li>
                <li>• Consider image licensing and copyright</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url || !validationResult?.valid || validating}
              data-testid="button-add-image"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Add Image
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}