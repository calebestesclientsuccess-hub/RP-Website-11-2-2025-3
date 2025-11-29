import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectMediaAsset } from "@shared/schema";
import { buildProjectMediaAssets } from "@/utils/project-media";

interface ProjectModalProps {
  project: {
    id: number;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
    challenge: string;
    solution: string;
    outcome: string;
    mediaAssets?: ProjectMediaAsset[];
    modalMediaAssets?: ProjectMediaAsset[] | null;
    modalMediaUrls?: string[] | null;
    modalMediaType?: string | null;
    galleryImages?: string[];
    testimonial?: {
      text: string;
      author: string;
    };
  } | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const previousOverflow = useRef<string>("");

  const mediaAssets =
    project && project.mediaAssets && project.mediaAssets.length > 0
      ? project.mediaAssets
      : buildProjectMediaAssets(project || undefined);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (project) {
      document.addEventListener("keydown", handleEscape);
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow.current;
    };
  }, [project, onClose]);

  useEffect(() => {
    if (project) {
      setCurrentMediaIndex(0);
    }
  }, [project?.id, mediaAssets.length]);

  const currentAsset =
    mediaAssets.length > 0
      ? mediaAssets[currentMediaIndex % mediaAssets.length]
      : null;

  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
          data-testid="modal-backdrop"
        >
          <motion.div
            layoutId={`project-${project.id}`}
            className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            data-testid={`modal-project-${project.id}`}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-muted flex items-center justify-center">
              {currentAsset ? (
                <>
                  {currentAsset.type === "video" ? (
                    <video
                      key={currentAsset.id}
                      src={currentAsset.url}
                      className="w-full h-full object-cover"
                      controls
                      data-testid={`video-media-${currentMediaIndex}`}
                    />
                  ) : (
                    <img
                      src={currentAsset.url}
                      alt={currentAsset.altText || `${project.clientName} - Media ${currentMediaIndex + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      data-testid={`img-media-${currentMediaIndex}`}
                    />
                  )}

                  {mediaAssets.length > 1 && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() =>
                          setCurrentMediaIndex(
                            (prev) => (prev - 1 + mediaAssets.length) % mediaAssets.length,
                          )
                        }
                        disabled={mediaAssets.length <= 1}
                        aria-label="Previous media"
                        data-testid="button-prev-media"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() =>
                          setCurrentMediaIndex((prev) => (prev + 1) % mediaAssets.length)
                        }
                        disabled={mediaAssets.length <= 1}
                        aria-label="Next media"
                        data-testid="button-next-media"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {mediaAssets.map((asset, index) => (
                          <button
                            key={asset.id}
                            onClick={() => setCurrentMediaIndex(index)}
                            aria-label={`View media ${index + 1} of ${mediaAssets.length}`}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentMediaIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                            data-testid={`button-media-indicator-${index}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground p-8">
                  Visual assets coming soon.
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-3xl font-bold mb-2" data-testid="text-modal-client">
                    {project.clientName}
                  </h2>
                  <p className="text-lg text-muted-foreground" data-testid="text-modal-title">
                    {project.projectTitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {project.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gradient">
                    The Challenge
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-challenge">
                    {project.challenge}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gradient">
                    Our Solution
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-solution">
                    {project.solution}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gradient">
                    The Outcome
                  </h3>
                  <p className="text-foreground/90 leading-relaxed" data-testid="text-outcome">
                    {project.outcome}
                  </p>
                </div>

                {project.testimonial && (
                  <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
                    <p className="text-lg italic mb-4 text-foreground/90" data-testid="text-testimonial">
                      "{project.testimonial.text}"
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground" data-testid="text-testimonial-author">
                      — {project.testimonial.author}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
