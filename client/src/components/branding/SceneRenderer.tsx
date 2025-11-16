import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface DirectorConfig {
  entryEffect: string;
  exitEffect: string;
  entryDuration: number;
  exitDuration: number;
  entryDelay: number;
  exitDelay?: number;
  entryEasing: string;
  exitEasing: string;
  backgroundColor: string;
  textColor: string;
  parallaxIntensity: number;
  fadeOnScroll: boolean;
  scaleOnScroll: boolean;
  blurOnScroll: boolean;
  headingSize: string;
  bodySize: string;
  alignment: string;
  transformOrigin?: string;
  backdropBlur?: string;
  mixBlendMode?: string;
  customCSSClasses?: string;
  enablePerspective?: boolean;
  overflowBehavior?: string;
  layerDepth?: number;
  staggerChildren?: number;
  fontWeight?: string;
  textShadow?: boolean;
  textGlow?: boolean;
  paddingTop?: string;
  paddingBottom?: string;
  mediaPosition?: string;
  mediaScale?: string;
  mediaOpacity?: number;
  scrollSpeed?: string; // Added scrollSpeed
}

interface SceneData {
  type: string;
  content: any;
  layout?: string;
  director: DirectorConfig;
}

interface SceneRendererProps {
  scene: SceneData;
  index: number;
}

// Helper to map heading/body sizes to Tailwind classes
const headingSizeMap: Record<string, string> = {
  "4xl": "text-4xl md:text-5xl",
  "5xl": "text-5xl md:text-6xl",
  "6xl": "text-5xl md:text-6xl lg:text-7xl",
  "7xl": "text-6xl md:text-7xl lg:text-8xl",
  "8xl": "text-7xl md:text-8xl lg:text-9xl",
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

const paddingMap: Record<string, string> = {
  "none": "pt-0",
  "sm": "pt-4",
  "md": "pt-8",
  "lg": "pt-12",
  "xl": "pt-16",
  "2xl": "pt-24",
};

const paddingBottomMap: Record<string, string> = {
  "none": "pb-0",
  "sm": "pb-4",
  "md": "pb-8",
  "lg": "pb-12",
  "xl": "pb-16",
  "2xl": "pb-24",
};

export function SceneRenderer({ scene, index }: SceneRendererProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !contentRef.current) return;

    const director = scene.director as DirectorConfig;

    // Map scrollSpeed to GSAP scrub values
    const scrollSpeedMap = {
      'slow': 2,      // Slower, more dramatic scroll animations
      'normal': 1,    // Standard scroll speed
      'fast': 0.5     // Quick, snappy scroll animations
    };
    const scrollScrub = scrollSpeedMap[director.scrollSpeed || 'normal'];

    const sceneEl = sceneRef.current;
    const contentEl = contentRef.current;

    // Helper to map easing names to GSAP easing functions
    const getEasing = (easing: string) => {
      const easingMap: Record<string, string> = {
        linear: "none",
        ease: "power1.inOut",
        "ease-in": "power1.in",
        "ease-out": "power1.out",
        "ease-in-out": "power1.inOut",
        power1: "power1.out",
        power2: "power2.out",
        power3: "power3.out",
        power4: "power4.out",
        back: "back.out(1.7)",
        elastic: "elastic.out(1, 0.3)",
        bounce: "bounce.out",
      };
      return easingMap[easing] || "power1.out";
    };

    // Entry animation configuration
    const getEntryAnimation = () => {
      const baseConfig = {
        opacity: 0,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
      };

      switch (director.entryEffect) {
        case "slide-up":
          return { ...baseConfig, y: 100 };
        case "slide-down":
          return { ...baseConfig, y: -100 };
        case "slide-left":
          return { ...baseConfig, x: 100 };
        case "slide-right":
          return { ...baseConfig, x: -100 };
        case "zoom-in":
          return { ...baseConfig, scale: 0.8 };
        case "zoom-out":
          return { ...baseConfig, scale: 1.2 };
        case "rotate-in":
          return { ...baseConfig, rotation: 90, scale: 0.8 };
        case "flip-in":
          return { ...baseConfig, rotationY: 90 };
        case "spiral-in":
          return { ...baseConfig, rotation: 360, scale: 0 };
        case "blur-focus":
          return { ...baseConfig, filter: "blur(20px)" };
        default:
          return baseConfig;
      }
    };

    // Exit animation configuration
    const getExitAnimation = () => {
      const baseConfig = {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
      };

      switch (director.exitEffect) {
        case "slide-up":
          return { ...baseConfig, y: -100, opacity: 0 };
        case "slide-down":
          return { ...baseConfig, y: 100, opacity: 0 };
        case "slide-left":
          return { ...baseConfig, x: -100, opacity: 0 };
        case "slide-right":
          return { ...baseConfig, x: 100, opacity: 0 };
        case "zoom-out":
          return { ...baseConfig, scale: 0.8, opacity: 0 };
        case "dissolve":
          return { ...baseConfig, opacity: 0, filter: "blur(10px)" };
        case "rotate-out":
          return { ...baseConfig, rotation: -90, scale: 0.8, opacity: 0 };
        case "flip-out":
          return { ...baseConfig, rotationY: -90, opacity: 0 };
        case "scale-blur":
          return { ...baseConfig, scale: 1.2, opacity: 0, filter: "blur(15px)" };
        default:
          return { ...baseConfig, opacity: 0 };
      }
    };

    // Create ScrollTrigger animation for the main content
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sceneEl,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        // Use scrollScrub here if fade/scale/blur are enabled, otherwise default to false
        scrub: (director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll) ? scrollScrub : false,
      },
    });

    // Entry animation
    tl.fromTo(
      contentEl,
      getEntryAnimation(),
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        rotationY: 0,
        filter: "blur(0px)",
        duration: director.entryDuration,
        delay: director.entryDelay,
        ease: getEasing(director.entryEasing),
      }
    );

    // Scroll effects (fade, scale, blur)
    if (director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll) {
      gsap.to(contentEl, {
        scrollTrigger: {
          trigger: sceneEl,
          start: "top center",
          end: "bottom center",
          scrub: scrollScrub, // Apply scrollScrub here
        },
        opacity: director.fadeOnScroll ? 0.3 : 1,
        scale: director.scaleOnScroll ? 1.1 : 1,
        filter: director.blurOnScroll ? "blur(5px)" : "blur(0px)",
      });
    }

    // Parallax effect
    if (director.parallaxIntensity > 0) {
      gsap.to(contentEl, {
        scrollTrigger: {
          trigger: sceneEl,
          start: "top bottom",
          end: "bottom top",
          scrub: scrollScrub, // Apply scrollScrub here
        },
        y: `${director.parallaxIntensity * 100}%`,
      });
    }
    
    // Scale effect for media elements
    if (director.scaleOnScroll) {
        const mediaElements = contentEl.querySelectorAll('img, video'); // Adjust selector as needed
        if (mediaElements.length > 0) {
          ScrollTrigger.create({
            trigger: sceneEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: scrollScrub, // Apply scrollScrub here
            onUpdate: (self) => {
              const scale = 1 - (self.progress * 0.02); // Adjust scale factor as needed
              mediaElements.forEach((el: HTMLElement) => {
                gsap.set(el, { scale });
              });
            },
          });
        }
    }


    // Cleanup ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scene]);

  const { director, content, type } = scene;

  // Build className from director config - NOW INCLUDES ALL CONTROLS
  const sceneClasses = [
    "min-h-screen",
    "flex",
    "items-center",
    "justify-center",
    "relative",
    director.overflowBehavior === "visible" ? "overflow-visible" : director.overflowBehavior === "auto" ? "overflow-auto" : "overflow-hidden",
    paddingMap[director.paddingTop || "md"],
    paddingBottomMap[director.paddingBottom || "md"],
    director.customCSSClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    `text-${director.alignment}`,
    director.backdropBlur && director.backdropBlur !== "none" ? `backdrop-blur-${director.backdropBlur}` : "",
    director.enablePerspective ? "perspective-1000" : "",
    director.textShadow ? "drop-shadow-lg" : "",
    director.textGlow ? "text-shadow-glow" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={sceneRef}
      className={sceneClasses}
      style={{
        backgroundColor: director.backgroundColor,
        color: director.textColor,
        zIndex: director.layerDepth || 5,
      }}
    >
      <div
        ref={contentRef}
        className={contentClasses}
        style={{
          transformOrigin: director.transformOrigin || "center center",
          mixBlendMode: director.mixBlendMode || "normal",
        }}
      >
        {type === "text" && (
          <div className="container mx-auto px-4">
            <h1 className={`${headingSizeMap[director.headingSize]} ${fontWeightMap[director.fontWeight || "bold"]} mb-4`}>
              {content.heading}
            </h1>
            {content.body && (
              <p className={`${bodySizeMap[director.bodySize]}`}>{content.body}</p>
            )}
          </div>
        )}

        {type === "image" && (
          <div className="w-full">
            <img
              src={content.url}
              alt={content.alt}
              className="w-full h-auto object-cover"
              style={{ opacity: director.mediaOpacity || 1 }}
            />
            {content.caption && (
              <p className="text-center mt-4 text-sm opacity-70">{content.caption}</p>
            )}
          </div>
        )}

        {type === "quote" && (
          <div className="container mx-auto px-4 max-w-4xl">
            <blockquote className={`${headingSizeMap[director.headingSize]} font-serif italic mb-6`}>
              "{content.quote}"
            </blockquote>
            <cite className={`${bodySizeMap[director.bodySize]} not-italic`}>
              — {content.author}
              {content.role && <span className="opacity-70">, {content.role}</span>}
            </cite>
          </div>
        )}

        {/* Add more scene type renderers as needed */}
      </div>
    </div>
  );
}