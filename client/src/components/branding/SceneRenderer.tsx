import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneConfig } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import { PlaceholderSlot } from "./PlaceholderSlot";
import type { PlaceholderId } from "@shared/placeholder-config";

gsap.registerPlugin(ScrollTrigger);

interface SceneRendererProps {
  scenes: SceneConfig[];
  className?: string;
  assetMap?: Record<string, string>;
  onOpenAssetMapper?: (placeholderId: PlaceholderId) => void;
  isEditMode?: boolean;
}

// Placeholder for ProgressiveImage component
const ProgressiveImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);

// Placeholder for SceneConfig interface
// interface SceneConfig { // This is now imported from @shared/schema
//   type: string;
//   content: any;
//   layout?: string;
//   director: DirectorConfig;
//   sceneType?: string; // Added sceneType for image rendering logic
//   imageUrl?: string; // Added imageUrl for image rendering logic
// }


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
  sceneType?: string; // Added sceneType for image rendering logic
  imageUrl?: string; // Added imageUrl for image rendering logic
}

// interface SceneRendererProps { // This is now defined above
//   scene: SceneConfig;
//   index: number;
//   assetMap?: Record<string, string>;
// }

// PlaceholderSlot component (assuming it exists elsewhere or will be defined)
// This is a placeholder for the actual component implementation.
// const PlaceholderSlot: React.FC<{ placeholderId: string; type: string; onAssignAsset: (id: string) => void }> = ({ placeholderId, type, onAssignAsset }) => {
//   return (
//     <div className="placeholder-slot flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg w-full h-full" onClick={() => onAssignAsset(placeholderId)}>
//       <span className="text-gray-500 text-lg">
//         {type === 'image' ? `Image Slot: ${placeholderId}` : `Placeholder: ${placeholderId}`}
//       </span>
//     </div>
//   );
// };


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

export function SceneRenderer({
  scenes,
  className = "",
  assetMap = {},
  onOpenAssetMapper,
  isEditMode = false
}: SceneRendererProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper to check if a value is a placeholder ID
  const isPlaceholderId = (value: string): value is PlaceholderId => {
    return typeof value === 'string' && value.startsWith('placeholder-');
  };

  // Helper to resolve asset from placeholder or return actual URL
  const resolveAsset = (value: string): string => {
    if (isPlaceholderId(value) && assetMap[value]) {
      return assetMap[value];
    }
    return value;
  };

  const renderSceneContent = (scene: SceneConfig, index: number) => {
    const config = scene as any;

    switch (config.type) {
      case "text":
        return (
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {config.content?.heading && (
              <h2
                className={`font-bold leading-tight ${
                  config.director?.headingSize === "8xl" ? "text-5xl md:text-8xl" :
                  config.director?.headingSize === "7xl" ? "text-4xl md:text-7xl" :
                  config.director?.headingSize === "6xl" ? "text-3xl md:text-6xl" :
                  config.director?.headingSize === "5xl" ? "text-2xl md:text-5xl" :
                  "text-xl md:text-4xl"
                }`}
              >
                {config.content.heading}
              </h2>
            )}
            {config.content?.body && (
              <p
                className={`${
                  config.director?.bodySize === "2xl" ? "text-lg md:text-2xl" :
                  config.director?.bodySize === "xl" ? "text-base md:text-xl" :
                  config.director?.bodySize === "lg" ? "text-sm md:text-lg" :
                  "text-sm md:text-base"
                } opacity-90 max-w-3xl mx-auto`}
              >
                {config.content.body}
              </p>
            )}
          </div>
        );

      case "image":
        const imageUrl = config.content?.url || "";
        const isImagePlaceholder = isPlaceholderId(imageUrl);

        if (isEditMode && isImagePlaceholder) {
          return (
            <div className="w-full max-w-5xl mx-auto">
              <PlaceholderSlot
                placeholderId={imageUrl}
                currentMapping={assetMap[imageUrl]}
                onAssignAsset={onOpenAssetMapper || (() => {})}
              />
            </div>
          );
        }

        return (
          <div className="w-full max-w-5xl mx-auto">
            <img
              src={resolveAsset(imageUrl)}
              alt={config.content?.alt || ""}
              className="w-full h-full object-cover"
              style={{ opacity: config.director?.mediaOpacity || 1 }}
            />
          </div>
        );

      case "video":
        const videoUrl = config.content?.url || "";
        const isVideoPlaceholder = isPlaceholderId(videoUrl);

        if (isEditMode && isVideoPlaceholder) {
          return (
            <div className="w-full max-w-5xl mx-auto aspect-video">
              <PlaceholderSlot
                placeholderId={videoUrl}
                currentMapping={assetMap[videoUrl]}
                onAssignAsset={onOpenAssetMapper || (() => {})}
              />
            </div>
          );
        }

        return (
          <div className="w-full max-w-5xl mx-auto aspect-video">
            <video
              src={resolveAsset(videoUrl)}
              className="w-full h-full rounded-lg shadow-2xl object-cover"
              controls
              playsInline
              style={{ opacity: config.director?.mediaOpacity || 1 }}
            />
          </div>
        );

      case "quote":
        const quoteText = config.content?.quote || "";
        const isQuotePlaceholder = isPlaceholderId(quoteText);

        if (isEditMode && isQuotePlaceholder) {
          return (
            <div className="max-w-3xl mx-auto">
              <PlaceholderSlot
                placeholderId={quoteText}
                currentMapping={assetMap[quoteText]}
                onAssignAsset={onOpenAssetMapper || (() => {})}
              />
            </div>
          );
        }

        return (
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <blockquote className="text-2xl md:text-4xl font-serif italic">
              "{quoteText}"
            </blockquote>
            {config.content?.author && (
              <cite className="text-lg md:text-xl opacity-80 not-italic">
                — {config.content.author}
              </cite>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground">
            Unsupported scene type: {config.type}
          </div>
        );
    }
  };


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
        {renderSceneContent(scene, index)}
      </div>
    </div>
  );
}