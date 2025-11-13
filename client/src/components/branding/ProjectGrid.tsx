import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "./ProjectCard";
import { ProjectExpansion } from "./ProjectExpansion";
import { Skeleton } from "@/components/ui/skeleton";

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
  galleryImages: string[];
  testimonial?: {
    text: string;
    author: string;
  };
}

interface ProjectGridProps {
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  onCloseExpansion: () => void;
}

export function ProjectGrid({ onProjectClick, selectedProjectId, onCloseExpansion }: ProjectGridProps) {
  const { data: projects, isLoading, isError} = useQuery<Project[]>({
    queryKey: ['/api/branding/projects'],
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !projects) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">Unable to load projects. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {projects.map((project) => {
            const isExpanded = selectedProjectId === project.id;
            
            return (
              <motion.div
                key={project.id}
                layout
                layoutId={`project-${project.id}`}
                className={isExpanded ? "col-span-full" : ""}
                whileHover={!isExpanded ? { scale: 1.03, rotateZ: 1 } : {}}
                transition={{
                  layout: { type: "spring", stiffness: 200, damping: 25 },
                  whileHover: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                {!isExpanded ? (
                  <ProjectCard
                    project={project}
                    onClick={() => onProjectClick(project.id)}
                  />
                ) : (
                  <ProjectExpansion 
                    project={project} 
                    onClose={onCloseExpansion}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
