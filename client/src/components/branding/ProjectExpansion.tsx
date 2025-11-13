import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticleDissolve } from "./ParticleDissolve";

interface ProjectExpansionProps {
  project: {
    id: number;
    slug: string;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
    challenge: string;
    solution: string;
    outcome: string;
    galleryImages: string[];
    testimonial?: {
      text: string;
      author: string;
    };
  };
  onClose: () => void;
}

export function ProjectExpansion({ project, onClose }: ProjectExpansionProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('video') || (url.includes('cloudinary') && url.includes('/video/'));
  };

  return (
    <div
      className="bg-card rounded-2xl shadow-2xl overflow-hidden"
      data-testid={`expansion-project-${project.id}`}
    >
      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
          onClick={onClose}
          data-testid="button-close-expansion"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Hero Carousel Section */}
        <div className="relative aspect-[21/9] overflow-hidden bg-muted">
          {project.galleryImages && project.galleryImages.length > 0 && (
            <>
              {isVideo(project.galleryImages[currentMediaIndex]) ? (
                <video
                  key={project.galleryImages[currentMediaIndex]}
                  src={project.galleryImages[currentMediaIndex]}
                  className="w-full h-full object-cover"
                  controls
                  data-testid={`video-media-${currentMediaIndex}`}
                />
              ) : (
                <img
                  src={project.galleryImages[currentMediaIndex]}
                  alt={`${project.clientName} - Media ${currentMediaIndex + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`img-media-${currentMediaIndex}`}
                />
              )}

              {project.galleryImages.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setCurrentMediaIndex((prev) => (prev - 1 + project.galleryImages.length) % project.galleryImages.length)}
                    disabled={project.galleryImages.length <= 1}
                    aria-label="Previous media"
                    data-testid="button-prev-media"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                    onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % project.galleryImages.length)}
                    disabled={project.galleryImages.length <= 1}
                    aria-label="Next media"
                    data-testid="button-next-media"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {project.galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        aria-label={`View media ${index + 1} of ${project.galleryImages.length}`}
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
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <span className="sr-only" data-testid={`text-client-${project.id}`}>{project.clientName}</span>
              <h2 className="text-4xl font-bold mb-2" data-testid="text-expansion-client">
                {project.clientName}
              </h2>
              <p className="text-xl text-muted-foreground" data-testid="text-expansion-title">
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

          {/* Story Sections - Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gradient">
                The Challenge
              </h3>
              <p className="text-foreground/90 leading-relaxed" data-testid="text-challenge">
                {project.challenge}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gradient">
                Our Solution
              </h3>
              <p className="text-foreground/90 leading-relaxed" data-testid="text-solution">
                {project.solution}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gradient">
                The Outcome
              </h3>
              <p className="text-foreground/90 leading-relaxed" data-testid="text-outcome">
                {project.outcome}
              </p>
            </div>
          </div>

          {/* Feature Media Section - Additional videos/photos */}
          {(project.galleryImages[1] || project.galleryImages[2]) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {project.galleryImages[1] && (
                <div className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border">
                  {isVideo(project.galleryImages[1]) ? (
                    <video
                      src={project.galleryImages[1]}
                      className="w-full h-full object-cover"
                      controls
                      data-testid="video-feature-1"
                    />
                  ) : (
                    <img
                      src={project.galleryImages[1]}
                      alt={`${project.clientName} - Feature 1`}
                      className="w-full h-full object-cover"
                      data-testid="img-feature-1"
                    />
                  )}
                </div>
              )}
              {project.galleryImages[2] && (
                <div className="aspect-video rounded-xl overflow-hidden bg-muted/50 border border-border">
                  {isVideo(project.galleryImages[2]) ? (
                    <video
                      src={project.galleryImages[2]}
                      className="w-full h-full object-cover"
                      controls
                      data-testid="video-feature-2"
                    />
                  ) : (
                    <img
                      src={project.galleryImages[2]}
                      alt={`${project.clientName} - Feature 2`}
                      className="w-full h-full object-cover"
                      data-testid="img-feature-2"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Testimonial Section */}
          {project.testimonial && (
            <div className="p-8 bg-muted/50 rounded-xl border border-border">
              <p className="text-xl italic mb-4 text-foreground/90" data-testid="text-testimonial">
                "{project.testimonial.text}"
              </p>
              <p className="text-base font-semibold text-muted-foreground" data-testid="text-testimonial-author">
                — {project.testimonial.author}
              </p>
            </div>
          )}

          {/* View Full Story CTA */}
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold"
              onClick={() => {
                if (!project.slug) {
                  console.warn("Project missing slug:", project);
                  return;
                }
                setIsTransitioning(true);
              }}
              disabled={!project.slug}
              data-testid="button-view-full-story"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Experience the Full Story
            </Button>
          </div>
        </div>
      </div>

      {/* Particle Dissolve Transition */}
      <ParticleDissolve
        isActive={isTransitioning}
        targetUrl={`/branding/${project.slug}`}
        onComplete={() => setIsTransitioning(false)}
      />
    </div>
  );
}
