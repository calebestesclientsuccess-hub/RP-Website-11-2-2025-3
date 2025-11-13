import { useState, Fragment } from "react";
import { AnimatePresence } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { ProjectExpansion } from "./ProjectExpansion";
import { projects } from "@/data/projects";

export function ProjectGrid() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (projectId: number) => {
    setExpandedId(expandedId === projectId ? null : projectId);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Fragment key={project.id}>
              <ProjectCard
                project={project}
                onClick={() => handleToggle(project.id)}
              />
              <AnimatePresence>
                {expandedId === project.id && (
                  <ProjectExpansion project={project} />
                )}
              </AnimatePresence>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
