import { useQuery } from "@tanstack/react-query";
import { ProjectCard } from "./ProjectCard";
import { ProjectExpansion } from "./ProjectExpansion";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
}

interface ProjectGridProps {
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
  onCloseExpansion: () => void;
}

export function ProjectGrid({ onProjectClick, selectedProjectId, onCloseExpansion }: ProjectGridProps) {
  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ['/api/branding/projects'],
  });

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
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {projects.map((project, index) => {
            const isExpanded = selectedProjectId === project.id;
            
            return (
              <motion.div 
                key={project.id}
                layout
                layoutId={`project-${project.id}`}
                className={isExpanded ? "col-span-full" : ""}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={!isExpanded ? { scale: 1.03, rotateZ: 1 } : {}}
                transition={{
                  layout: { type: "spring", stiffness: 200, damping: 25 },
                  opacity: { duration: 0.4, delay: index * 0.1 },
                  y: { duration: 0.4, delay: index * 0.1 },
                  scale: { type: "spring", stiffness: 300, damping: 20 },
                  rotateZ: { type: "spring", stiffness: 300, damping: 20 }
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
        </motion.div>
      </div>
    </section>
  );
}
