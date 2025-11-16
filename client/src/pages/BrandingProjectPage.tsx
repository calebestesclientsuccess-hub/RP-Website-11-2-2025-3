import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DirectorConfig, DEFAULT_DIRECTOR_CONFIG } from "@shared/schema";

gsap.registerPlugin(ScrollTrigger);

// Helper utility maps for director configuration (outside component for performance)
const headingSizeMap: Record<string, string> = {
  "4xl": "text-4xl md:text-5xl",
  "5xl": "text-5xl md:text-6xl",
  "6xl": "text-5xl md:text-6xl",
  "7xl": "text-6xl md:text-7xl",
  "8xl": "text-7xl md:text-8xl",
};

const bodySizeMap: Record<string, string> = {
  "base": "text-base md:text-lg",
  "lg": "text-lg md:text-xl",
  "xl": "text-xl md:text-2xl",
  "2xl": "text-2xl md:text-3xl",
};

const fontWeightMap: Record<string, string> = {
  "normal": "font-normal",
  "medium": "font-medium",
  "semibold": "font-semibold",
  "bold": "font-bold",
};

const alignmentMap: Record<string, string> = {
  "left": "text-left",
  "center": "text-center",
  "right": "text-right",
};

const objectPositionMap: Record<string, string> = {
  "center": "object-center",
  "top": "object-top",
  "bottom": "object-bottom",
  "left": "object-left",
  "right": "object-right",
};

const objectFitMap: Record<string, string> = {
  "cover": "object-cover",
  "contain": "object-contain",
  "fill": "object-fill",
};

// GSAP animation mapping for director entry/exit effects
// Using autoAlpha (opacity + visibility) for all effects for consistency
const entryEffectMap: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  'fade': { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } },
  'slide-up': { from: { autoAlpha: 0, y: 100 }, to: { autoAlpha: 1, y: 0 } },
  'slide-down': { from: { autoAlpha: 0, y: -100 }, to: { autoAlpha: 1, y: 0 } },
  'slide-left': { from: { autoAlpha: 0, x: 100 }, to: { autoAlpha: 1, x: 0 } },
  'slide-right': { from: { autoAlpha: 0, x: -100 }, to: { autoAlpha: 1, x: 0 } },
  'zoom-in': { from: { autoAlpha: 0, scale: 0.8 }, to: { autoAlpha: 1, scale: 1 } },
  'zoom-out': { from: { autoAlpha: 0, scale: 1.2 }, to: { autoAlpha: 1, scale: 1 } },
  'sudden': { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } },
  'cross-fade': { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } }, // Overlaps with previous scene exit
  'rotate-in': { from: { autoAlpha: 0, rotation: -90 }, to: { autoAlpha: 1, rotation: 0 } },
  'flip-in': { from: { autoAlpha: 0, rotationY: -90 }, to: { autoAlpha: 1, rotationY: 0 } },
  'spiral-in': { from: { autoAlpha: 0, rotation: 180, scale: 0.5 }, to: { autoAlpha: 1, rotation: 0, scale: 1 } },
  'elastic-bounce': { from: { autoAlpha: 0, scale: 0.3 }, to: { autoAlpha: 1, scale: 1 } }, // Use elastic ease
  'blur-focus': { from: { autoAlpha: 0, filter: 'blur(20px)' }, to: { autoAlpha: 1, filter: 'blur(0px)' } },
};

const exitEffectMap: Record<string, gsap.TweenVars> = {
  'fade': { autoAlpha: 0 },
  'slide-up': { autoAlpha: 0, y: -100 },
  'slide-down': { autoAlpha: 0, y: 100 },
  'slide-left': { autoAlpha: 0, x: -100 },
  'slide-right': { autoAlpha: 0, x: 100 },
  'zoom-out': { autoAlpha: 0, scale: 0.8 },
  'dissolve': { autoAlpha: 0, filter: 'blur(10px)' },
  'cross-fade': { autoAlpha: 0 }, // Smooth overlap with next scene
  'rotate-out': { autoAlpha: 0, rotation: 90 },
  'flip-out': { autoAlpha: 0, rotationY: 90 },
  'scale-blur': { autoAlpha: 0, scale: 1.2, filter: 'blur(20px)' },
};

// Scroll speed mapping to GSAP scrub values
const scrollSpeedMap: Record<string, number> = {
  'slow': 3,
  'normal': 1.5,
  'fast': 0.5,
};

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
    director?: {
      entryEffect?: string;
      entryDuration?: number;
      entryDelay?: number;
      exitEffect?: string;
      exitDuration?: number;
      backgroundColor?: string;
      textColor?: string;
      gradientColors?: string[];
      headingSize?: string;
      bodySize?: string;
      fontWeight?: string;
      alignment?: string;
      scrollSpeed?: string;
      parallaxIntensity?: number;
      animationDuration?: number;
      blurOnScroll?: boolean;
      fadeOnScroll?: boolean;
      scaleOnScroll?: boolean;
      mediaPosition?: string;
      mediaScale?: string;
      mediaOpacity?: number;
    };
  };
}

export default function BrandingProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [animationsReady, setAnimationsReady] = useState(false);

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

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clean up previous ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Configure ScrollTrigger for smoother performance
    ScrollTrigger.config({
      limitCallbacks: true,
      syncInterval: 150, // Reduce refresh rate for smoother scroll
    });

    // Hero parallax effect
    const heroParallax = scrollContainerRef.current.querySelector('[data-hero-parallax]');
    if (heroParallax && !prefersReducedMotion) {
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

    // Hero Section Fade-In Animation (Not scroll-triggered, loads immediately)
    const heroTitle = document.querySelector('[data-testid="text-project-title"]');
    const heroSubtitle = document.querySelector('[data-testid="text-project-subtitle"]');
    const heroBounce = document.querySelector('[data-testid="hero-bounce-indicator"]');

    // Animate hero title
    if (heroTitle) {
      gsap.fromTo(heroTitle,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: prefersReducedMotion ? 0.5 : 2.5,
          ease: "power3.out",
          delay: prefersReducedMotion ? 0 : 0.3
        }
      );
    }

    // Animate hero subtitle with delay
    if (heroSubtitle) {
      gsap.fromTo(heroSubtitle,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: prefersReducedMotion ? 0.5 : 2,
          ease: "power3.out",
          delay: prefersReducedMotion ? 0.1 : 0.8
        }
      );
    }

    // Animate bounce indicator with longer delay
    if (heroBounce) {
      gsap.fromTo(heroBounce,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: prefersReducedMotion ? 0.5 : 1.5,
          ease: "power2.out",
          delay: prefersReducedMotion ? 0.2 : 1.5
        }
      );
    }

    // Track scroll progress on window with throttling
    let scrollTimeout: NodeJS.Timeout;
    const updateScrollProgress = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }, 100); // Throttle to every 100ms
    };

    // Initial progress update
    updateScrollProgress();

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // Setup scroll-driven animations for each scene
    const sceneElements = scrollContainerRef.current.querySelectorAll('[data-scene]');

    // Helper to get a clean state object, excluding properties GSAP might not handle well directly
    // or that should be explicitly reset.
    const getCleanState = (baseState: gsap.TweenVars = {}): gsap.TweenVars => {
      const clean: gsap.TweenVars = {};
      // Copy properties, excluding potential problematic ones or those we want to manage explicitly
      for (const key in baseState) {
        if (key !== 'opacity' && key !== 'filter' && key !== 'x' && key !== 'y' && key !== 'scale' && key !== 'rotation' && key !== 'rotationY') {
          clean[key] = baseState[key];
        }
      }
      // Ensure autoAlpha is handled
      if ('autoAlpha' in baseState) {
        clean.autoAlpha = baseState.autoAlpha;
      } else if ('opacity' in baseState) {
        clean.autoAlpha = baseState.opacity;
      } else {
        clean.autoAlpha = 1; // Default to visible if not specified
      }
      return clean;
    };

    sceneElements.forEach((element, index) => {
      const scene = scenes[index];
      if (!scene) return;

      // Merge director config with defaults
      const director = { ...DEFAULT_DIRECTOR_CONFIG, ...(scene.sceneConfig.director || {}) };

      // Debug logging for director config (dev only)
      if (import.meta.env.DEV) {
        console.log(`[Scene ${index}] Director config:`, {
          entryEffect: director.entryEffect,
          entryDuration: director.entryDuration,
          entryDelay: director.entryDelay,
          exitEffect: director.exitEffect,
          exitDuration: director.exitDuration,
          scrollSpeed: director.scrollSpeed,
          parallaxIntensity: director.parallaxIntensity,
          fadeOnScroll: director.fadeOnScroll,
          scaleOnScroll: director.scaleOnScroll,
        });
      }

      // Get scrub speed based on director config
      const scrubSpeed = scrollSpeedMap[director.scrollSpeed] || 1.5;

      // Track active scene (throttled state updates)
      let sceneUpdateTimeout: NodeJS.Timeout;
      ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          clearTimeout(sceneUpdateTimeout);
          sceneUpdateTimeout = setTimeout(() => setActiveSceneIndex(index), 50);
        },
        onEnterBack: () => {
          clearTimeout(sceneUpdateTimeout);
          sceneUpdateTimeout = setTimeout(() => setActiveSceneIndex(index), 50);
        },
      });

      // Get director-configured effects and durations
      const entryEffect = entryEffectMap[director.entryEffect || 'fade'] || entryEffectMap.fade;
      const exitEffect = director.exitEffect ? (exitEffectMap[director.exitEffect] || exitEffectMap.fade) : null;
      const entryDuration = director.entryEffect === 'sudden' ? 0.1 : (director.entryDuration || DEFAULT_DIRECTOR_CONFIG.entryDuration);
      const exitDuration = director.exitDuration || DEFAULT_DIRECTOR_CONFIG.exitDuration;

      if (prefersReducedMotion) {
        // Simplified animation for accessibility - just fade in/out
        gsap.fromTo(
          element,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.3,
            delay: director.entryDelay || 0,
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              toggleActions: "play none none reverse",
            }
          }
        );
      } else {
        // SEPARATE background and foreground animations to prevent conflicts
        const contentWrapper = element.querySelector('[data-scene-content]');
        const mediaElements = element.querySelectorAll('[data-media-opacity]');

        // Entry animation - maps already use autoAlpha for visibility control
        const fromState = { ...entryEffect.from };
        const toState = { ...entryEffect.to };

        // Animate the CONTENT WRAPPER ONLY (never the section background)
        const targetElement = contentWrapper || element;

        // Main entry/exit animation with FULL REVERSIBILITY
        // Use elastic ease for bounce effect, otherwise power3
        const entryEase = director.entryEffect === 'elastic-bounce' ? "elastic.out(1, 0.5)" : "power3.out";

        // Apply entry delay - CRITICAL FIX: ensure delay is always respected
        const entryDelayValue = director.entryDelay !== undefined ? director.entryDelay : 0;
        
        gsap.fromTo(
          targetElement,
          fromState,
          {
            ...toState,
            duration: entryDuration,
            delay: entryDelayValue,
            ease: entryEase,
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              // RUSSIAN DOLL EFFECT: play forward on enter, reverse on leave back
              toggleActions: "play none none reverse",
              onLeave: () => {
                // When scrolling DOWN past this scene, apply exit effect
                if (exitEffect) {
                  // Exit effect already uses autoAlpha from exitEffectMap
                  const exitState = { ...getCleanState(), ...exitEffect };
                  gsap.to(targetElement, {
                    ...exitState,
                    duration: exitDuration,
                    ease: "power2.in",
                  });
                }
              },
              onEnterBack: () => {
                // When scrolling UP back into this scene, restore to fully visible state
                const restoreState = { ...getCleanState(), ...toState };
                // Always clear blur filter on restore unless blur is part of the target state
                // Handles: blur-focus, dissolve, scale-blur exit effects
                if (director.entryEffect !== 'blur-focus' && 
                    (!director.exitEffect || ['dissolve', 'scale-blur'].includes(director.exitEffect))) {
                  restoreState.filter = 'blur(0px)';
                }
                gsap.to(targetElement, {
                  ...restoreState,
                  duration: entryDuration * 0.7, // Slightly faster on return
                  ease: "power2.out",
                });
              },
              onLeaveBack: () => {
                // When scrolling UP past this scene, reverse to initial hidden state
                const exitBackState = { ...getCleanState(), ...fromState };
                // Always clear blur filter when leaving back unless blur is part of the from state
                // Handles: blur-focus entry, dissolve/scale-blur exits
                if (!fromState.filter && 
                    director.entryEffect !== 'blur-focus' && 
                    (!director.exitEffect || ['dissolve', 'scale-blur'].includes(director.exitEffect))) {
                  exitBackState.filter = 'blur(0px)';
                }
                gsap.to(targetElement, {
                  ...exitBackState,
                  duration: entryDuration * 0.7,
                  ease: "power2.in",
                });
              },
            }
          }
        );

        // Parallax effect ONLY on media (not on section), and ONLY if no conflicting animations
        if (!prefersReducedMotion && director.parallaxIntensity > 0 && !director.scaleOnScroll) {
          mediaElements.forEach((media) => {
            gsap.to(media, {
              yPercent: 15 * director.parallaxIntensity,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: scrubSpeed,
              }
            });
          });
        }

        // Optional: Fade on scroll effect ONLY on section background (never content wrapper)
        if (director.fadeOnScroll) {
          gsap.to(element, {
            opacity: 0.85,
            scrollTrigger: {
              trigger: element,
              start: "top top",
              end: "bottom top",
              scrub: scrubSpeed,
            }
          });
        }

        // Optional: Scale on scroll effect ONLY on media elements (never full content)
        // This prevents conflict with entry/exit animations
        if (director.scaleOnScroll && !director.parallaxIntensity && mediaElements.length > 0) {
          mediaElements.forEach((media) => {
            gsap.to(media, {
              scale: 0.98,
              scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "bottom top",
                scrub: scrubSpeed,
              }
            });
          });
        }
      }
    });

    // Signal that animations are ready for programmatic navigation
    setAnimationsReady(true);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('scroll', updateScrollProgress);
      setAnimationsReady(false);
    };
  }, [scenes]);

  // Navigate to a specific scene
  const scrollToScene = (index: number) => {
    if (!animationsReady || !scrollContainerRef.current) return;

    const sceneElements = scrollContainerRef.current.querySelectorAll('[data-scene]');
    const targetScene = sceneElements[index] as HTMLElement;

    if (targetScene) {
      const sceneTop = targetScene.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollTarget = sceneTop - (viewportHeight * 0.4);

      window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
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
                    disabled={!animationsReady}
                    className="group hover-elevate active-elevate-2 p-1 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
        <section className="min-h-screen flex items-center justify-center relative pt-24 pb-12 px-4 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-500 via-red-400 to-purple-500 bg-clip-text text-transparent opacity-0" data-testid="text-project-title">
              {project.title}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-8 opacity-0" data-testid="text-project-subtitle">
              Branding Portfolio
            </p>
            <div className="inline-block animate-bounce mt-12 opacity-0" data-testid="hero-bounce-indicator">
              <Circle className="w-3 h-3 fill-muted-foreground text-muted-foreground opacity-50" />
            </div>
          </div>
        </section>

        {/* Dynamic Scenes from Database */}
        {scenes && scenes.length > 0 ? (
          scenes.map((scene, index) => {
            // Merge director config with defaults
            const director = { ...DEFAULT_DIRECTOR_CONFIG, ...(scene.sceneConfig.director || {}) };

            return (
              <section
                key={scene.id}
                data-scene={index}
                className="min-h-screen flex items-center justify-center px-4 py-24"
                data-testid={`scene-${index}`}
                style={{
                  backgroundColor: director.backgroundColor
                }}
              >
                <div className="container mx-auto max-w-4xl" data-scene-content style={{ opacity: 0 }}>
                  {/* Render scene based on sceneConfig type */}
                  <SceneRenderer scene={scene} />
                </div>
              </section>
            );
          })
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

// Scene renderer component that interprets sceneConfig with director customization
function SceneRenderer({ scene }: { scene: ProjectScene }) {
  const { type, content, layout = "default" } = scene.sceneConfig;

  // Merge director config with defaults
  const director = { ...DEFAULT_DIRECTOR_CONFIG, ...(scene.sceneConfig.director || {}) };

  switch (type) {
    case "text":
      return (
        <div className="max-w-none">
          <h2
            className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} ${alignmentMap[director.alignment]} mb-8`}
            style={{ color: director.textColor }}
          >
            {content.heading}
          </h2>
          <p
            className={`${bodySizeMap[director.bodySize]} ${alignmentMap[director.alignment]} leading-relaxed`}
            style={{ color: director.textColor }}
          >
            {content.body}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2
              className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} ${alignmentMap[director.alignment]}`}
              style={{ color: director.textColor }}
            >
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted/50">
            <img
              src={content.url}
              alt={content.alt || "Scene image"}
              className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
              style={{ opacity: director.mediaOpacity }}
              data-media-opacity="true"
              loading="lazy"
            />
          </div>
          {content.caption && (
            <p
              className={`${bodySizeMap[director.bodySize]} ${alignmentMap[director.alignment]} italic`}
              style={{ color: director.textColor }}
            >
              {content.caption}
            </p>
          )}
        </div>
      );

    case "video":
      return (
        <div className="space-y-8">
          {content.heading && (
            <h2
              className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} ${alignmentMap[director.alignment]}`}
              style={{ color: director.textColor }}
            >
              {content.heading}
            </h2>
          )}
          <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-muted/50">
            <video
              src={content.url}
              controls
              className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
              style={{ opacity: director.mediaOpacity }}
              data-media-opacity="true"
            />
          </div>
          {content.caption && (
            <p
              className={`${bodySizeMap[director.bodySize]} ${alignmentMap[director.alignment]} italic`}
              style={{ color: director.textColor }}
            >
              {content.caption}
            </p>
          )}
        </div>
      );

    case "split":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 ${layout === "reverse" ? "md:order-2" : "md:order-1"}`}>
            {content.heading && (
              <h2
                className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} ${alignmentMap[director.alignment]}`}
                style={{ color: director.textColor }}
              >
                {content.heading}
              </h2>
            )}
            {content.body && (
              <p
                className={`${bodySizeMap[director.bodySize]} ${alignmentMap[director.alignment]} leading-relaxed`}
                style={{ color: director.textColor }}
              >
                {content.body}
              </p>
            )}
          </div>
          <div className={`aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted/50 ${layout === "reverse" ? "md:order-1" : "md:order-2"}`}>
            {content.mediaType === "video" ? (
              <video
                src={content.media}
                controls
                className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
                style={{ opacity: director.mediaOpacity }}
                data-media-opacity="true"
              />
            ) : (
              <img
                src={content.media}
                alt={content.alt || "Scene media"}
                className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
                style={{ opacity: director.mediaOpacity }}
                data-media-opacity="true"
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
            <h2
              className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} ${alignmentMap[director.alignment]}`}
              style={{ color: director.textColor }}
            >
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
                    className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
                    style={{ opacity: director.mediaOpacity }}
                    data-media-opacity="true"
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <p
                    className={`text-sm ${alignmentMap[director.alignment]}`}
                    style={{ color: director.textColor }}
                  >
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "quote":
      return (
        <div className={`max-w-3xl mx-auto space-y-8 ${alignmentMap[director.alignment]}`}>
          <div className="text-6xl md:text-8xl opacity-20" style={{ color: director.textColor }}>"</div>
          <blockquote
            className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} leading-relaxed`}
            style={{ color: director.textColor }}
          >
            {content.quote}
          </blockquote>
          {content.author && (
            <cite 
              className={`block ${bodySizeMap[director.bodySize]} not-italic opacity-60`}
              style={{ color: director.textColor }}
            >
              — {content.author}
              {content.role && (
                <span className="block text-base mt-2 opacity-60">
                  {content.role}
                </span>
              )}
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
                className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
                style={{ opacity: director.mediaOpacity }}
                data-media-opacity="true"
              />
            ) : (
              <img
                src={content.url}
                alt={content.alt || "Full screen media"}
                className={`w-full h-full ${objectFitMap[director.mediaScale]} ${objectPositionMap[director.mediaPosition]}`}
                style={{ opacity: director.mediaOpacity }}
                data-media-opacity="true"
                loading="lazy"
              />
            )}
            {content.overlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end p-12">
                <div className="max-w-2xl">
                  {content.heading && (
                    <h2
                      className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight]} mb-4`}
                      style={{ color: director.textColor }}
                    >
                      {content.heading}
                    </h2>
                  )}
                  {content.body && (
                    <p
                      className={`${bodySizeMap[director.bodySize]}`}
                      style={{ color: director.textColor, opacity: 0.9 }}
                    >
                      {content.body}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center p-12 border border-dashed border-border rounded-xl" style={{ color: director.textColor }}>
          <p className="text-lg">Unknown scene type: {type}</p>
          <p className="text-sm mt-2">Available types: text, image, video, split, gallery, quote, fullscreen</p>
        </div>
      );
  }
}