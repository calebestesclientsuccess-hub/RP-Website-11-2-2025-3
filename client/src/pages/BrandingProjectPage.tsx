import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
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
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

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

    // Enable smooth scrolling
    gsap.to(scrollContainerRef.current, {
      scrollBehavior: "smooth"
    });

    // Hero parallax effect
    const heroParallax = scrollContainerRef.current.querySelector('[data-hero-parallax]');
    if (heroParallax) {
      gsap.to(heroParallax, {
        yPercent: 50,
        ease: "none",
        scrollTrigger: {
          trigger: heroParallax,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      });
    }

    // Track scroll progress on window
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Initial progress update
    updateScrollProgress();

    window.addEventListener('scroll', updateScrollProgress);

    // Setup scroll-driven animations for each scene
    const sceneElements = scrollContainerRef.current.querySelectorAll('[data-scene]');
    
    sceneElements.forEach((element, index) => {
      const scene = scenes[index];
      
      // Parallax effect on images within the scene
      const images = element.querySelectorAll('img, video');
      images.forEach((img) => {
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        });
      });

      // Track active scene
      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveSceneIndex(index),
        onEnterBack: () => setActiveSceneIndex(index),
      });

      // Main scene animation based on config
      const animationType = scene?.sceneConfig?.animation || "fade";
      
      let animationConfig;
      switch (animationType) {
        case "slide":
          animationConfig = {
            from: { opacity: 0, x: -100 },
            to: { opacity: 1, x: 0 }
          };
          break;
        case "zoom":
          animationConfig = {
            from: { opacity: 0, scale: 0.8 },
            to: { opacity: 1, scale: 1 }
          };
          break;
        case "fade":
        default:
          animationConfig = {
            from: { opacity: 0, y: 80 },
            to: { opacity: 1, y: 0 }
          };
      }

      gsap.fromTo(
        element,
        animationConfig.from,
        {
          ...animationConfig.to,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 75%",
            end: "top 25%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [scenes]);

  // Navigate to a specific scene
  const scrollToScene = (index: number) => {
    if (!scrollContainerRef.current) return;
    const sceneElements = scrollContainerRef.current.querySelectorAll('[data-scene]');
    const targetScene = sceneElements[index] as HTMLElement;
    
    if (targetScene) {
      targetScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
              {/* Progress bar */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(scrollProgress)}%</span>
              </div>

              {/* Scene indicators */}
              <div className="flex items-center gap-2">
                {scenes?.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToScene(index)}
                    className="group hover-elevate active-elevate-2 p-1 rounded-full transition-all"
                    data-testid={`button-scene-${index}`}
                    aria-label={`Go to scene ${index + 1}`}
                  >
                    <Circle
                      className={`transition-all ${
                        activeSceneIndex === index
                          ? "w-3 h-3 fill-red-500 text-red-500"
                          : "w-2 h-2 fill-muted-foreground text-muted-foreground group-hover:fill-red-400 group-hover:text-red-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Scene */}
        <section className="min-h-screen flex items-center justify-center relative pt-24 pb-12 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0" data-hero-parallax>
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover opacity-20 scale-110"
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
            <div className="inline-block animate-bounce mt-12">
              <Circle className="w-3 h-3 fill-muted-foreground text-muted-foreground opacity-50" />
            </div>
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
  const { type, content, layout = "default" } = scene.sceneConfig;

  switch (type) {
    case "text":
      return (
        <div className="prose prose-invert max-w-none">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
            {content.heading}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {content.body}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted/50">
            <img
              src={content.url}
              alt={content.alt || "Scene image"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {content.caption && (
            <p className="text-lg text-muted-foreground text-center italic">{content.caption}</p>
          )}
        </div>
      );

    case "video":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted/50">
            <video
              src={content.url}
              controls
              className="w-full h-full object-cover"
            />
          </div>
          {content.caption && (
            <p className="text-lg text-muted-foreground text-center italic">{content.caption}</p>
          )}
        </div>
      );

    case "split":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 ${layout === "reverse" ? "md:order-2" : "md:order-1"}`}>
            {content.heading && (
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                {content.heading}
              </h2>
            )}
            {content.body && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {content.body}
              </p>
            )}
          </div>
          <div className={`aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted/50 ${layout === "reverse" ? "md:order-1" : "md:order-2"}`}>
            {content.mediaType === "video" ? (
              <video
                src={content.mediaUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={content.mediaUrl}
                alt={content.alt || "Scene media"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2 className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              {content.heading}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.images?.map((img: {url: string; alt?: string; caption?: string}, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted/50">
                  <img
                    src={img.url}
                    alt={img.alt || `Gallery image ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <p className="text-sm text-muted-foreground text-center">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "quote":
      return (
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="text-6xl md:text-8xl text-primary/20">"</div>
          <blockquote className="text-3xl md:text-4xl font-medium leading-relaxed text-foreground">
            {content.quote}
          </blockquote>
          {content.author && (
            <cite className="block text-xl text-muted-foreground not-italic">
              — {content.author}
              {content.role && <span className="block text-base mt-2">{content.role}</span>}
            </cite>
          )}
        </div>
      );

    case "fullscreen":
      return (
        <div className="relative -mx-4 md:-mx-8 lg:-mx-12">
          <div className="aspect-[21/9] rounded-xl overflow-hidden">
            {content.mediaType === "video" ? (
              <video
                src={content.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={content.url}
                alt={content.alt || "Full screen media"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {content.overlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end p-12">
                <div className="max-w-2xl">
                  {content.heading && (
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                      {content.heading}
                    </h2>
                  )}
                  {content.body && (
                    <p className="text-xl text-white/90">{content.body}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center text-muted-foreground p-12 border border-dashed border-border rounded-xl">
          <p className="text-lg">Unknown scene type: {type}</p>
          <p className="text-sm mt-2">Available types: text, image, video, split, gallery, quote, fullscreen</p>
        </div>
      );
  }
}
