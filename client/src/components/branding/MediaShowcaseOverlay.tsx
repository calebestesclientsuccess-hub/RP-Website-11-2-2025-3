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
          {/* Backdrop - z-[9999] to appear above EVERYTHING including navbar and popups */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content Container - z-[9999] to appear above CinematicPanel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-8"
          >
            {/* Floating minimal header */}
            <div className="fixed top-6 right-6 z-[10000] flex items-center gap-4">
              <span className="text-sm text-white/70 font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                {currentIndex + 1} / {media.length}
              </span>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all flex items-center justify-center shadow-2xl"
                aria-label="Close gallery"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Full-screen media display with swipe support - Apple TV style */}
            <motion.div 
              className="absolute inset-0 z-[1] flex items-center justify-center touch-pan-y"
              onPanEnd={handlePanEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia?.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="relative flex items-center justify-center max-w-[80vw] max-h-[80vh]"
                >
                  {currentMedia?.type === "video" ? (
                    currentMedia.url ? (
                      <video
                        ref={videoRef}
                        src={currentMedia.url}
                        poster={getPosterUrl(currentMedia.url)}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className="w-[600px] h-[400px] bg-zinc-900 flex items-center justify-center text-white/60 text-center p-8 rounded-2xl">
                        Video URL not available
                      </div>
                    )
                  ) : (
                    currentMedia?.url ? (
                      <img
                        src={currentMedia?.url}
                        alt={currentMedia?.alt || currentMedia?.caption || "Media"}
                        className="w-auto h-auto max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                      />
                    ) : (
                      <div className="w-[600px] h-[400px] bg-zinc-900 flex items-center justify-center text-white/60 text-center p-8 rounded-2xl">
                        Image URL not available
                      </div>
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Premium navigation arrows - separate layer for reliable positioning */}
            {media.length > 1 && (
              <>
                <div className="fixed left-8 top-1/2 -translate-y-1/2 z-[10000]">
                  <button
                    onClick={goToPrevious}
                    aria-label="Previous media"
                    className="w-14 h-14 rounded-full bg-white/90 shadow-2xl hover:scale-110 hover:bg-white active:scale-95 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft className="w-8 h-8 text-black" />
                  </button>
                </div>
                <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[10000]">
                  <button
                    onClick={goToNext}
                    aria-label="Next media"
                    className="w-14 h-14 rounded-full bg-white/90 shadow-2xl hover:scale-110 hover:bg-white active:scale-95 transition-all flex items-center justify-center"
                  >
                    <ChevronRight className="w-8 h-8 text-black" />
                  </button>
                </div>
              </>
            )}

            {/* Floating caption at bottom */}
            {currentMedia?.caption && (
              <motion.div
                key={`caption-${currentMedia.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-0 right-0 flex justify-center px-8 z-[10000]"
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

 
