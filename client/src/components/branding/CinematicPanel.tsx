import { useEffect, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProjectDetailContent } from "./ProjectDetailContent";
import { MediaShowcaseOverlay } from "./MediaShowcaseOverlay";
import { useProjectMedia } from "@/hooks/useProjectMedia";
import type { ProjectMediaAsset } from "@shared/schema";

type Stage = "peek" | "focus" | "grid";

interface CinematicPanelProps {
  project: {
    id: string;
    slug: string;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
    challenge?: string;
    solution?: string;
    outcome?: string;
    modalMediaAssets?: ProjectMediaAsset[] | null;
    modalMediaUrls?: string[] | null;
    modalMediaType?: string | null;
    galleryImages?: string[];
    mediaAssets?: ProjectMediaAsset[];
    testimonial?: {
      text: string;
      author: string;
    };
  };
  stage: Stage;
  cardRect: DOMRect | null;
  onStageChange: (stage: Stage) => void;
  onClose: () => void;
}

// Panel target positions (calculated from viewport)
const getPanelTarget = (stage: "peek" | "focus", viewport: { w: number; h: number }) => {
  const targets = {
    peek: {
      x: Math.max(viewport.w * 0.35, 280),
      y: Math.max(viewport.h * 0.12, 60),
      width: Math.min(viewport.w * 0.58, viewport.w - 300),
      height: Math.min(viewport.h * 0.76, viewport.h - 120),
    },
    focus: {
      x: Math.max(viewport.w * 0.08, 40),
      y: Math.max(viewport.h * 0.05, 30),
      width: Math.min(viewport.w * 0.84, viewport.w - 80),
      height: Math.min(viewport.h * 0.9, viewport.h - 60),
    },
  };
  return targets[stage];
};

export function CinematicPanel({ 
  project, 
  stage, 
  cardRect, 
  onStageChange, 
  onClose 
}: CinematicPanelProps) {
  // SSR-safe viewport state
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasTriggeredFocus = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Overlay state (owned by panel)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayIndex, setOverlayIndex] = useState(0);

  // Fetch layer2 sections for media aggregation
  const { data: layer2Sections, isLoading: isLoadingSections } = useQuery({
    queryKey: [`/api/projects/${project.id}/layer2-sections`],
    enabled: !!project.id,
  });

  // Aggregate all media
  const aggregatedMedia = useProjectMedia(
    {
      id: project.id,
      thumbnailImage: project.thumbnailImage,
      modalMediaAssets: project.modalMediaAssets,
      modalMediaUrls: project.modalMediaUrls,
      galleryImages: project.galleryImages,
      mediaAssets: project.mediaAssets,
    },
    layer2Sections || []
  );

  // Track viewport size (SSR-safe)
  useEffect(() => {
    const updateViewport = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Reset scroll trigger when returning to peek
  useEffect(() => {
    if (stage === "peek") {
      hasTriggeredFocus.current = false;
    }
  }, [stage]);

  // Focus panel on open
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Scroll triggers focus (with threshold)
  const handleScroll = useCallback(() => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (!hasTriggeredFocus.current && stage === "peek" && scrollTop > 50) {
      hasTriggeredFocus.current = true;
      onStageChange("focus");
    }
  }, [stage, onStageChange]);

  // Escape key cascade
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isOverlayOpen) {
          setIsOverlayOpen(false);
        } else if (stage === "focus") {
          onStageChange("peek");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, isOverlayOpen, onStageChange, onClose]);

  // Handle media click from content
  const handleOpenOverlay = useCallback((mediaIndex: number) => {
    setOverlayIndex(mediaIndex);
    setIsOverlayOpen(true);
  }, []);

  if (stage === "grid") return null;

  const target = getPanelTarget(stage, viewport);
  
  // Initial position from card rect (or center fallback)
  const initial = cardRect ? {
    x: cardRect.left,
    y: cardRect.top,
    width: cardRect.width,
    height: cardRect.height,
  } : {
    x: viewport.w / 2 - 200,
    y: viewport.h / 2 - 150,
    width: 400,
    height: 300,
  };

  return (
    <>
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        className="fixed top-0 left-0 bg-card rounded-2xl shadow-2xl shadow-black/50 border border-border/50 overflow-hidden z-50 focus:outline-none"
        initial={{ ...initial, opacity: 0 }}
        animate={{ 
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
          opacity: 1,
        }}
        exit={{ ...initial, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.clientName} - ${project.projectTitle}`}
      >
        <div className="h-full flex flex-col glass-panel">
          {/* Header */}
          <header className="p-6 border-b border-border/50 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-bold">{project.clientName}</h2>
              <p className="text-muted-foreground">{project.projectTitle}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </Button>
          </header>

          {/* Content */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto" 
            onScroll={handleScroll}
          >
            {isLoadingSections ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ProjectDetailContent 
                project={project}
                onOpenOverlay={handleOpenOverlay}
                aggregatedMedia={aggregatedMedia}
                showHeader={false}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Media Overlay */}
      <MediaShowcaseOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        media={aggregatedMedia}
        currentIndex={overlayIndex}
        onIndexChange={setOverlayIndex}
        title={`${project.clientName} - Gallery`}
      />
    </>
  );
}


