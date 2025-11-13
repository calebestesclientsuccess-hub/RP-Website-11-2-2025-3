import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";
import { Link } from "wouter";

interface ProjectExpansionProps {
  project: {
    id: number;
    clientName: string;
    challenge: string;
    solution: string;
    outcome: string;
    galleryImages: string[];
    testimonial: {
      text: string;
      author: string;
    };
  };
}

export function ProjectExpansion({ project }: ProjectExpansionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="col-span-full overflow-hidden"
      data-testid={`expansion-project-${project.id}`}
    >
      <div className="bg-card rounded-2xl shadow-2xl p-8 md:p-12 my-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Column 1: The Story */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary" data-testid={`heading-challenge-${project.id}`}>
                The Challenge
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.challenge}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary" data-testid={`heading-solution-${project.id}`}>
                The Solution
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.solution}
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary" data-testid={`heading-outcome-${project.id}`}>
                The Outcome
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.outcome}
              </p>
            </div>

            {/* Testimonial */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <Quote className="w-8 h-8 text-primary mb-4" />
              <blockquote className="text-lg italic mb-4" data-testid={`quote-${project.id}`}>
                "{project.testimonial.text}"
              </blockquote>
              <cite className="text-sm text-muted-foreground not-italic font-medium" data-testid={`author-${project.id}`}>
                — {project.testimonial.author}
              </cite>
            </div>
          </div>

          {/* Column 2: Gallery */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold" data-testid={`heading-gallery-${project.id}`}>
              Project Gallery
            </h3>
            
            {/* Horizontal scrolling gallery */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {project.galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-80 h-60 rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={image}
                      alt={`${project.clientName} project image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link href="/audit">
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  data-testid={`button-schedule-session-${project.id}`}
                >
                  Schedule a Brand Diagnostic & Strategy Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
