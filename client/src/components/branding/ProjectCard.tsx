import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: {
    id: number;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
  };
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      layoutId={`project-${project.id}`}
      layout
      whileHover={{ scale: 1.03, rotateZ: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group"
      data-testid={`card-project-${project.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={project.thumbnailImage}
          alt={`${project.clientName} - ${project.projectTitle}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2" data-testid={`text-client-${project.id}`}>
            {project.clientName}
          </h3>
          <p className="text-sm text-white/90 mb-3" data-testid={`text-title-${project.id}`}>
            {project.projectTitle}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {project.categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="bg-white/20 text-white border-white/30 no-default-hover-elevate"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
