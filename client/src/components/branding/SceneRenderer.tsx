
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

export function SceneRenderer({ scene, index }: SceneRendererProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !contentRef.current) return;

    const { director } = scene;
    const sceneEl = sceneRef.current;
    const contentEl = contentRef.current;

    // Map easing names to GSAP easing functions
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

    // Create ScrollTrigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sceneEl,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        scrub: director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll,
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

    // Scroll effects (if enabled)
    if (director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll) {
      gsap.to(contentEl, {
        scrollTrigger: {
          trigger: sceneEl,
          start: "top center",
          end: "bottom center",
          scrub: true,
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
          scrub: true,
        },
        y: `${director.parallaxIntensity * 100}%`,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scene]);

  const { director, content, type } = scene;

  // Build className from director config
  const sceneClasses = [
    "min-h-screen",
    "flex",
    "items-center",
    "justify-center",
    "relative",
    "overflow-hidden",
    director.customCSSClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    `text-${director.alignment}`,
    director.backdropBlur && director.backdropBlur !== "none" ? `backdrop-blur-${director.backdropBlur}` : "",
    director.enablePerspective ? "perspective-1000" : "",
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
            <h1 className={`text-${director.headingSize} font-bold mb-4`}>
              {content.heading}
            </h1>
            {content.body && (
              <p className={`text-${director.bodySize}`}>{content.body}</p>
            )}
          </div>
        )}

        {type === "image" && (
          <div className="w-full">
            <img
              src={content.url}
              alt={content.alt}
              className="w-full h-auto object-cover"
            />
            {content.caption && (
              <p className="text-center mt-4 text-sm opacity-70">{content.caption}</p>
            )}
          </div>
        )}

        {type === "quote" && (
          <div className="container mx-auto px-4 max-w-4xl">
            <blockquote className={`text-${director.headingSize} font-serif italic mb-6`}>
              "{content.quote}"
            </blockquote>
            <cite className={`text-${director.bodySize} not-italic`}>
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
