import { motion } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { ProjectExpansion } from "./ProjectExpansion";
import { projects } from "@/data/projects";

interface ProjectGridProps {
  onProjectClick: (projectId: number) => void;
  selectedProjectId: number | null;
  onCloseExpansion: () => void;
}

export function ProjectGrid({ onProjectClick, selectedProjectId, onCloseExpansion }: ProjectGridProps) {
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
