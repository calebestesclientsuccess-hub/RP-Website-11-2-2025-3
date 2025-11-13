import { ProjectCard } from "./ProjectCard";
import { projects } from "@/data/projects";

interface ProjectGridProps {
  onProjectClick: (projectId: number) => void;
}

export function ProjectGrid({ onProjectClick }: ProjectGridProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
