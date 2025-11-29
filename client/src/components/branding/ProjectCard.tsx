import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: {
    id: string;
    clientName: string;
    projectTitle: string;
    thumbnailImage: string;
    categories: string[];
    heroMediaType?: "image" | "video";
  };
  onClick: () => void;
}

// Helper to detect video URLs
const isVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Determine if hero is video (from explicit type or URL detection)
  const isVideo = project.heroMediaType === "video" || isVideoUrl(project.thumbnailImage);

  return (
    <motion.div
      onClick={onClick}
      className="cursor-pointer rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group bg-card border border-transparent"
      data-testid={`card-project-${project.id}`}
      layoutId={`project-card-${project.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {isVideo ? (
          <video
            src={project.thumbnailImage}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            muted
            autoPlay
            loop
            playsInline
            data-testid={`video-hero-${project.id}`}
          />
        ) : (
          <ProgressiveImage
            src={project.thumbnailImage}
            alt={`${project.clientName} - ${project.projectTitle}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}
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