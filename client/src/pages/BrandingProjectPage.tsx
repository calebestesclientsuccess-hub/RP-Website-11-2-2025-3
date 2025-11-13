import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  challengeText: string;
  solutionText: string;
  outcomeText: string;
  modalMediaUrls: string[];
}

interface ProjectScene {
  id: string;
  projectId: string;
  sceneConfig: {
    type: string;
    content: any;
    layout?: string;
    animation?: string;
  };
}

export default function BrandingProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/branding/projects/slug/${slug}`],
  });

  // Fetch project scenes
  const { data: scenes, isLoading: isLoadingScenes } = useQuery<ProjectScene[]>({
    queryKey: [`/api/branding/projects/${project?.id}/scenes`],
    enabled: !!project?.id,
  });

  // Initialize GSAP ScrollTrigger animations
  useEffect(() => {
    if (!scenes || scenes.length === 0 || !scrollContainerRef.current) return;

    // Clean up previous ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Setup scroll-driven animations for each scene
    const sceneElements = scrollContainerRef.current.querySelectorAll('[data-scene]');
    
    sceneElements.forEach((element, index) => {
      const scene = scenes[index];
      if (!scene?.sceneConfig?.animation) return;

      // Apply animation based on scene config
      gsap.fromTo(
        element,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scenes]);

  const isLoading = isLoadingProject || isLoadingScenes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Loading... | Revenue Party</title>
        </Helmet>
        
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => setLocation("/branding")} data-testid="button-back-to-portfolio">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${project.title} | Revenue Party Branding`}</title>
        <meta name="description" content={project.challengeText?.substring(0, 160) || ''} />
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={project.challengeText?.substring(0, 160) || ''} />
        <meta property="og:image" content={project.thumbnailUrl || ''} />
      </Helmet>

      <div className="min-h-screen bg-background" ref={scrollContainerRef}>
        {/* Fixed Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation("/branding")}
              data-testid="button-back-to-portfolio"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>

            <div className="flex items-center gap-2">
              {scenes?.map((_, index) => (
                <Circle
                  key={index}
                  className="w-2 h-2 fill-muted-foreground text-muted-foreground"
                  data-testid={`indicator-scene-${index}`}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* Hero Scene */}
        <section className="min-h-screen flex items-center justify-center relative pt-24 pb-12 px-4">
          <div className="absolute inset-0 z-0">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          </div>

          <div className="container mx-auto relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-500 via-red-400 to-purple-500 bg-clip-text text-transparent" data-testid="text-project-title">
              {project.title}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8" data-testid="text-project-subtitle">
              Branding Portfolio
            </p>
          </div>
        </section>

        {/* Dynamic Scenes from Database */}
        {scenes && scenes.length > 0 ? (
          scenes.map((scene, index) => (
            <section
              key={scene.id}
              data-scene={index}
              className="min-h-screen flex items-center justify-center px-4 py-24"
              data-testid={`scene-${index}`}
            >
              <div className="container mx-auto max-w-4xl">
                {/* Render scene based on sceneConfig type */}
                <SceneRenderer scene={scene} />
              </div>
            </section>
          ))
        ) : (
          /* Fallback: Challenge/Solution/Outcome */
          <>
            <section className="min-h-screen flex items-center justify-center px-4 py-24" data-scene={0}>
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                  Challenge
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {project.challengeText}
                </p>
              </div>
            </section>

            <section className="min-h-screen flex items-center justify-center px-4 py-24" data-scene={1}>
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                  Solution
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {project.solutionText}
                </p>
              </div>
            </section>

            <section className="min-h-screen flex items-center justify-center px-4 py-24" data-scene={2}>
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
                  Outcome
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {project.outcomeText}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

// Scene renderer component that interprets sceneConfig
function SceneRenderer({ scene }: { scene: ProjectScene }) {
  const { type, content } = scene.sceneConfig;

  switch (type) {
    case "text":
      return (
        <div className="prose prose-invert max-w-none">
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
            {content.heading}
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {content.body}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border">
            <img
              src={content.url}
              alt={content.alt || "Scene image"}
              className="w-full h-full object-cover"
            />
          </div>
          {content.caption && (
            <p className="text-muted-foreground text-center">{content.caption}</p>
          )}
        </div>
      );

    case "video":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border">
            <video
              src={content.url}
              controls
              className="w-full h-full object-cover"
            />
          </div>
          {content.caption && (
            <p className="text-muted-foreground text-center">{content.caption}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="text-center text-muted-foreground">
          <p>Unknown scene type: {type}</p>
        </div>
      );
  }
}
