import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AggregatedMediaItem } from "@/hooks/useProjectMedia";

// Generate video poster URL from Cloudinary video URL
const getPosterUrl = (videoUrl: string): string | undefined => {
  if (videoUrl.includes("cloudinary.com") && videoUrl.includes("/video/upload/")) {
    // Transform video URL to get first frame as JPG
    return videoUrl.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_80/");
  }
  return undefined; // Browser will show first frame
};

interface MediaShowcaseOverlayProps {
  /** Whether the overlay is open */
  isOpen: boolean;
  /** Callback when overlay should close */
  onClose: () => void;
  /** All media items to display */
  media: AggregatedMediaItem[];
  /** Currently selected media index */
  currentIndex: number;
  /** Callback when index changes */
  onIndexChange: (index: number) => void;
  /** Optional title for the overlay header */
  title?: string;
}

export function MediaShowcaseOverlay({
  isOpen,
  onClose,
  media,
  currentIndex,
  onIndexChange,
  title,
}: MediaShowcaseOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadedUrls = useRef(new Set<string>());
  const currentMedia = media[currentIndex];

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onIndexChange((currentIndex - 1 + media.length) % media.length);
          break;
        case "ArrowRight":
          e.preventDefault();
          onIndexChange((currentIndex + 1) % media.length);
          break;
      }
    },
    [isOpen, onClose, currentIndex, media.length, onIndexChange]
  );

  // Handle swipe gestures for touch navigation
  const handlePanEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const swipeThreshold = 100;
      const velocityThreshold = 500;
      
      if (Math.abs(info.velocity.x) > velocityThreshold || Math.abs(info.offset.x) > swipeThreshold) {
        if (info.offset.x > 0) {
          onIndexChange((currentIndex - 1 + media.length) % media.length);
        } else {
          onIndexChange((currentIndex + 1) % media.length);
        }
      }
    },
    [currentIndex, media.length, onIndexChange]
  );

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    if (!isOpen || media.length <= 1) return;

    const adjacentIndexes = [
      (currentIndex - 1 + media.length) % media.length,
      (currentIndex + 1) % media.length,
    ];

    adjacentIndexes.forEach((idx) => {
      const item = media[idx];
      if (!item) return;

      // Preload images
      if (item.type === "image" && !preloadedUrls.current.has(item.url)) {
        preloadedUrls.current.add(item.url);
        const img = new Image();
        img.src = item.url;
      }

      // Preload video posters
      if (item.type === "video") {
        const posterUrl = getPosterUrl(item.url);
        if (posterUrl && !preloadedUrls.current.has(posterUrl)) {
          preloadedUrls.current.add(posterUrl);
          const img = new Image();
          img.src = posterUrl;
        }
      }
    });
  }, [isOpen, currentIndex, media]);

  // Navigate to previous
  const goToPrevious = () => {
    onIndexChange((currentIndex - 1 + media.length) % media.length);
  };

  // Navigate to next
  const goToNext = () => {
    onIndexChange((currentIndex + 1) % media.length);
  };

  if (media.length === 0) return null;

  return (
    <LayoutGroup>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
              onClick={onClose}
            />

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            >
            {/* Main content area */}
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 text-white">
                <div className="flex items-center gap-3">
                  {currentMedia?.type === "video" ? (
                    <Film className="w-5 h-5 text-white/70" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-white/70" />
                  )}
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold">{title}</h2>
                    )}
                    <p className="text-sm text-white/70">
                      {currentIndex + 1} of {media.length}
                      {currentMedia?.sectionHeading && (
                        <span className="ml-2">• {currentMedia.sectionHeading}</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Media display with swipe support */}
              <motion.div 
                className="flex-1 relative flex items-center justify-center overflow-hidden rounded-lg touch-pan-y"
                onPanEnd={handlePanEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMedia?.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {currentMedia?.type === "video" ? (
                      <motion.video
                        ref={videoRef}
                        layoutId={`media-showcase-${currentMedia.url}`}
                        src={currentMedia.url}
                        poster={getPosterUrl(currentMedia.url)}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <motion.img
                        layoutId={`media-showcase-${currentMedia?.url}`}
                        src={currentMedia?.url}
                        alt={currentMedia?.alt || currentMedia?.caption || "Media"}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        layout
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                {media.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Caption */}
              {currentMedia?.caption && (
                <motion.p
                  key={`caption-${currentMedia.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-white/80 text-sm"
                >
                  {currentMedia.caption}
                </motion.p>
              )}

              {/* Thumbnail strip for multiple media */}
              {media.length > 1 && (
                <div className="mt-4 flex justify-center gap-2 overflow-x-auto py-2">
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => onIndexChange(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden transition-all ${
                        index === currentIndex
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Film className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Keyboard hints */}
              <div className="mt-4 flex justify-center gap-6 text-xs text-white/50">
                <span>← → Navigate</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

