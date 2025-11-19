import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ComponentScene } from "@/components/branding/ComponentScene";
import { MobileOverlay } from "@/components/MobileOverlay";
import type { DirectorConfig } from "@shared/schema";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  slug: string;
  client?: string;
  description?: string;
}

interface ProjectScene {
  id: string;
  projectId: string;
  sceneConfig: {
    type: string;
    content: any;
    layout?: string;
    animation?: string;
    director?: DirectorConfig;
  };
  orderIndex: number;
}

/**
 * PreviewPortfolio - Public preview page for portfolios
 * This is the shareable production URL that doesn't require authentication
 * Accessed via /preview/[projectId]
 */
export default function PreviewPortfolio() {
  const { projectId } = useParams();
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch project data (public endpoint)
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}/public`],
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch project scenes (public endpoint)
  const { data: scenes, isLoading: scenesLoading } = useQuery<ProjectScene[]>({
    queryKey: [`/api/projects/${projectId}/scenes/public`],
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize GSAP animations for scenes
  useEffect(() => {
    if (!scenes || scenes.length === 0) return;

    const ctx = gsap.context(() => {
      // Clean up existing ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());

      scenes.forEach((scene, index) => {
        const element = document.querySelector(`[data-scene-index="${index}"]`);
        if (!element) return;

        // Apply director configuration for animations
        const director = scene.sceneConfig.director;
        if (!director) return;

        // Entry animations
        if (director.entryEffect && director.entryEffect !== 'none') {
          gsap.fromTo(element,
            { 
              opacity: 0,
              y: director.entryEffect === 'slide-up' ? 100 : 0,
            },
            {
              opacity: 1,
              y: 0,
              duration: director.entryDuration || 1,
              delay: director.entryDelay || 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 80%",
                toggleActions: "play none none reverse",
              }
            }
          );
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [scenes]);

  // Loading state
  if (projectLoading || scenesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (!project || !scenes) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
          <p className="text-muted-foreground">
            The portfolio you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => setLocation("/")}
            variant="outline"
            data-testid="button-go-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Sort scenes by orderIndex
  const sortedScenes = [...scenes].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <>
      <MobileOverlay 
        includeTablets={true}
        customMessage="Experience the full cinematic portfolio with advanced animations and interactions on a desktop or laptop."
      />
      <Helmet>
        <title>{project.title} | Portfolio</title>
        <meta name="description" content={project.description || `Portfolio showcase for ${project.client || project.title}`} />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={project.description || `Portfolio showcase for ${project.client || project.title}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={project.title} />
        <meta name="twitter:description" content={project.description || `Portfolio showcase for ${project.client || project.title}`} />
      </Helmet>

      <div ref={containerRef} className="min-h-screen bg-background">
        {/* Professional Preview Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Viewing: <span className="font-medium text-foreground">{project.title}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-close-preview"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Main Portfolio Content */}
        <div className="pt-12"> {/* Offset for fixed header */}
          {sortedScenes.map((scene, index) => (
            <div 
              key={scene.id}
              data-scene-index={index}
              className="w-full"
            >
              <ComponentScene
                scene={scene.sceneConfig}
                index={index}
                isPreview={false} // This is production view, not preview
              />
            </div>
          ))}
        </div>

        {/* Optional: Simple view counter (visible to viewers) */}
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-background/80 backdrop-blur-sm border rounded-full px-3 py-1">
            <span className="text-xs text-muted-foreground">
              Portfolio by Cygnus
            </span>
          </div>
        </div>
      </div>
    </>
  );
}