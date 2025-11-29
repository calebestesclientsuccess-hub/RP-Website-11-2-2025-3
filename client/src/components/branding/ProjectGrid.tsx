import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef, useMemo, Fragment } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectExpansion } from "./ProjectExpansion";
import { CinematicPanel } from "./CinematicPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  slug: string;
  clientName: string;
  projectTitle: string;
  thumbnailImage: string;
  categories: string[];
  challenge: string;
  solution: string;
  outcome: string;
  expansionLayout?: "vertical" | "cinematic";
}

interface ProjectGridProps {
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  onCloseExpansion: () => void;
}

type Stage = "grid" | "peek" | "focus";

export function ProjectGrid({ onProjectClick, selectedProjectId, onCloseExpansion }: ProjectGridProps) {
  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ['/api/branding/projects'],
  });

  // Cinematic mode state
  const [stage, setStage] = useState<Stage>("grid");
  const [clickedCardRect, setClickedCardRect] = useState<DOMRect | null>(null);
  const [cinematicProjectId, setCinematicProjectId] = useState<string | null>(null);
  
  // Refs for scroll and focus restoration
  const gridScrollPos = useRef(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastFocusedCard = useRef<HTMLElement | null>(null);

  // Desktop detection for cinematic mode
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Get the project being displayed in cinematic mode
  const cinematicProject = useMemo(() => 
    projects?.find(p => p.id === cinematicProjectId),
    [projects, cinematicProjectId]
  );

  // Determine if currently in cinematic mode
  const isCinematicActive = cinematicProjectId !== null && stage !== "grid";

  const handleCardClick = useCallback((project: Project, cardElement: HTMLElement) => {
    // Toggle close on re-click
    if (selectedProjectId === project.id && (isCinematicActive || selectedProjectId === project.id)) {
      handleClose();
      return;
    }

    // Store for focus restoration
    lastFocusedCard.current = cardElement;

    // CRITICAL FIX: Determine mode from CLICKED project, not selectedProject
    const shouldUseCinematic = project.expansionLayout === "cinematic" && isDesktop;

    if (shouldUseCinematic) {
      // Measure card position (viewport-relative)
      const rect = cardElement.getBoundingClientRect();
      setClickedCardRect(rect);

      // Save scroll position
      gridScrollPos.current = gridRef.current?.scrollTop || window.scrollY;

      // Enter cinematic mode
      setCinematicProjectId(project.id);
      setStage("peek");
    } else {
      // Clear any cinematic state
      setCinematicProjectId(null);
      setStage("grid");
    }

    // Always notify parent
    onProjectClick(project.id);
  }, [selectedProjectId, isCinematicActive, isDesktop, onProjectClick]);

  const handleClose = useCallback(() => {
    setStage("grid");
    setClickedCardRect(null);
    setCinematicProjectId(null);
    onCloseExpansion();

    // Restore scroll and focus
    requestAnimationFrame(() => {
      if (gridRef.current) {
        gridRef.current.scrollTop = gridScrollPos.current;
      } else {
        window.scrollTo(0, gridScrollPos.current);
      }
      lastFocusedCard.current?.focus();
    });
  }, [onCloseExpansion]);

  // Grid transform for cinematic mode
  const gridTransform = useMemo(() => ({
    grid: { x: 0, y: 0, scale: 1, filter: "blur(0px)", opacity: 1 },
    peek: { x: 0, y: 0, scale: 1, filter: "blur(0px)", opacity: 1 },
    focus: { x: "-25%", y: "-15%", scale: 0.95, filter: "blur(8px)", opacity: 0.4 },
  }), []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Unable to Load Projects</h2>
          <p className="text-foreground mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">No projects to display yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 bg-background min-h-[600px] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Grid Layer */}
        <motion.div 
          ref={gridRef}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            isCinematicActive && stage === "focus" && "pointer-events-none"
          )}
          animate={isCinematicActive ? gridTransform[stage] : gridTransform.grid}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          style={{ willChange: isCinematicActive ? "transform, filter, opacity" : "auto" }}
        >
          {projects.map((project, index) => {
            const isSelected = selectedProjectId === project.id;
            const isVerticalExpanded = isSelected && !isCinematicActive && project.expansionLayout !== "cinematic";

            return (
              <Fragment key={project.id}>
                <motion.div 
                  layout={!isCinematicActive}
                  layoutId={!isCinematicActive ? `project-${project.id}` : undefined}
                  className={cn(isVerticalExpanded && "col-span-full")}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: cinematicProjectId === project.id && stage !== "grid" ? 0 : 1,
                    y: 0,
                  }}
                  whileHover={!isVerticalExpanded && !isCinematicActive ? { scale: 1.03, rotateZ: 1 } : {}}
                  transition={{
                    layout: { type: "spring", stiffness: 200, damping: 25 },
                    opacity: { duration: 0.25 },
                    y: { duration: 0.4, delay: index * 0.1 },
                  }}
                >
                  {isVerticalExpanded ? (
                    <ProjectExpansion 
                      project={project} 
                      onClose={handleClose}
                    />
                  ) : (
                    <div
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${project.clientName} - ${project.projectTitle}`}
                      onClick={(e) => handleCardClick(project, e.currentTarget)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(project, e.currentTarget);
                        }
                      }}
                      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
                    >
                      <ProjectCard 
                        project={project} 
                        onClick={() => {}} // Required prop, but we handle click on wrapper
                      />
                    </div>
                  )}
                </motion.div>
              </Fragment>
            );
          })}
        </motion.div>
      </div>

      {/* Cinematic Backdrop - dims the grid */}
      <AnimatePresence>
        {isCinematicActive && (
          <motion.div
            key="cinematic-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "focus" ? 0.7 : 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Cinematic Panel */}
      <AnimatePresence>
        {isCinematicActive && cinematicProject && (
          <CinematicPanel
            key={cinematicProject.id}
            project={cinematicProject}
            stage={stage}
            cardRect={clickedCardRect}
            onStageChange={setStage}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
