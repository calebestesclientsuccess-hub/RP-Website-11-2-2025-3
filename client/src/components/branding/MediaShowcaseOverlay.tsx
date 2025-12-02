import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - z-[60] to appear above CinematicPanel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content Container - z-[60] to appear above CinematicPanel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
          >
            {/* Floating minimal header */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
              <span className="text-sm text-white/70 font-medium">
                {currentIndex + 1} / {media.length}
              </span>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors flex items-center justify-center group"
                aria-label="Close gallery"
              >
                <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Full-screen media display with swipe support - Apple TV style */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center touch-pan-y"
              onPanEnd={handlePanEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia?.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-[90vw] h-[80vh] max-w-7xl overflow-hidden rounded-3xl"
                >
                  {currentMedia?.type === "video" ? (
                    currentMedia.url ? (
                      <motion.video
                        ref={videoRef}
                        layoutId={`media-showcase-${currentMedia.url}`}
                        src={currentMedia.url}
                        poster={getPosterUrl(currentMedia.url)}
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/60 text-center p-8">Video URL not available</div>
                    )
                  ) : (
                    currentMedia?.url ? (
                      <motion.img
                        layoutId={`media-showcase-${currentMedia?.url}`}
                        src={currentMedia?.url}
                        alt={currentMedia?.alt || currentMedia?.caption || "Media"}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/60 text-center p-8">Image URL not available</div>
                    )
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Premium navigation arrows */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    aria-label="Previous media"
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                  >
                    <ChevronLeft className="w-10 h-10 text-black group-hover:translate-x-[-2px] transition-transform" />
                  </button>
                  <button
                    onClick={goToNext}
                    aria-label="Next media"
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
                  >
                    <ChevronRight className="w-10 h-10 text-black group-hover:translate-x-[2px] transition-transform" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Floating caption at bottom */}
            {currentMedia?.caption && (
              <motion.div
                key={`caption-${currentMedia.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center px-8"
              >
                <p className="text-center text-white/90 text-sm max-w-2xl bg-black/40 backdrop-blur-md px-6 py-3 rounded-full">
                  {currentMedia.caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

