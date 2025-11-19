import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UnsplashPicker } from "./UnsplashPicker";
import { URLInput } from "./URLInput";
import {
  Image as ImageIcon,
  Link,
  Search,
  Plus,
  X,
} from "lucide-react";

interface MediaSelectorProps {
  onSelect: (url: string, metadata?: any) => void;
  currentValue?: string;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function MediaSelector({
  onSelect,
  currentValue,
  onClear,
  placeholder = "Select or add media",
  className = ""
}: MediaSelectorProps) {
  const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUnsplashSelect = (url: string, metadata?: any) => {
    onSelect(url, metadata);
    setShowUnsplashPicker(false);
  };

  const handleUrlSelect = (url: string, metadata?: any) => {
    onSelect(url, metadata);
    setShowUrlInput(false);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  // If there's a current value, show it with option to change
  if (currentValue) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-h-[40px] rounded-md border bg-muted/50 p-2">
            {/* Image Preview */}
            {currentValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <div className="flex items-center gap-2">
                <img
                  src={currentValue}
                  alt="Selected media"
                  className="h-8 w-8 object-cover rounded"
                  onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const icon = target.nextElementSibling;
                    if (icon) {
                      (icon as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden items-center justify-center h-8 w-8 bg-muted rounded">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm truncate flex-1">{currentValue}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate flex-1">{currentValue}</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            data-testid="button-clear-media"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUnsplashPicker(true)}
            className="flex-1"
            data-testid="button-change-unsplash"
          >
            <Search className="h-4 w-4 mr-2" />
            Change (Unsplash)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(true)}
            className="flex-1"
            data-testid="button-change-url"
          >
            <Link className="h-4 w-4 mr-2" />
            Change (URL)
          </Button>
        </div>

        {/* Dialogs */}
        <UnsplashPicker
          isOpen={showUnsplashPicker}
          onClose={() => setShowUnsplashPicker(false)}
          onSelect={handleUnsplashSelect}
        />
        <URLInput
          isOpen={showUrlInput}
          onClose={() => setShowUrlInput(false)}
          onSelect={handleUrlSelect}
        />
      </div>
    );
  }

  // No value selected - show selection options
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setShowUnsplashPicker(true)}
          data-testid="card-select-unsplash"
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <Search className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Stock Photos</p>
              <p className="text-xs text-muted-foreground">Search Unsplash</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setShowUrlInput(true)}
          data-testid="card-select-url"
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <Link className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Custom URL</p>
              <p className="text-xs text-muted-foreground">Logo or image URL</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <UnsplashPicker
        isOpen={showUnsplashPicker}
        onClose={() => setShowUnsplashPicker(false)}
        onSelect={handleUnsplashSelect}
      />
      <URLInput
        isOpen={showUrlInput}
        onClose={() => setShowUrlInput(false)}
        onSelect={handleUrlSelect}
      />
    </div>
  );
}