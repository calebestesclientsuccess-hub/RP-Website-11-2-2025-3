import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneConfig } from "@shared/schema";
import { PlaceholderSlot } from "./PlaceholderSlot";
import type { PlaceholderId } from "@shared/placeholder-config";
import { ProgressiveImage } from "@/components/ui/progressive-image";

gsap.registerPlugin(ScrollTrigger);

interface SceneRendererProps {
  scenes: SceneConfig[];
  className?: string;
  assetMap?: Record<string, string>;
  onOpenAssetMapper?: (placeholderId: PlaceholderId) => void;
  isEditMode?: boolean;
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

// Check for reduced motion preference
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SceneRenderer({
  scenes,
  className = "",
  assetMap = {},
  onOpenAssetMapper,
  isEditMode = false
}: SceneRendererProps) {
  return (
    <div className={className}>
      {scenes.map((scene, index) => (
        <SceneItem
          key={index}
          scene={scene}
          index={index}
          assetMap={assetMap}
          onOpenAssetMapper={onOpenAssetMapper}
          isEditMode={isEditMode}
        />
      ))}
    </div>
  );
}

function SceneItem({
  scene,
  index,
  assetMap = {},
  onOpenAssetMapper,
  isEditMode = false
}: {
  scene: SceneConfig;
  index: number;
  assetMap?: Record<string, string>;
  onOpenAssetMapper?: (placeholderId: PlaceholderId) => void;
  isEditMode?: boolean;
}) {
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

  // Type guards for scene content
  const hasTextContent = (content: any): content is { heading?: string; body?: string } => {
    return content && (typeof content.heading === 'string' || typeof content.body === 'string');
  };

  const hasImageContent = (content: any): content is { url: string; alt?: string } => {
    return content && typeof content.url === 'string';
  };

  const hasVideoContent = (content: any): content is { url: string; poster?: string } => {
    return content && typeof content.url === 'string';
  };

  const hasQuoteContent = (content: any): content is { quote: string; author?: string } => {
    return content && typeof content.quote === 'string';
  };

  const hasSplitContent = (content: any): content is { 
    leftContent: { type: string; data: any }; 
    rightContent: { type: string; data: any };
  } => {
    return content && content.leftContent && content.rightContent;
  };

  const hasGalleryContent = (content: any): content is { images: Array<{ url: string; alt?: string; caption?: string }> } => {
    return content && Array.isArray(content.images);
  };

  const renderSceneContent = (scene: SceneConfig, index: number) => {
    const { type, content, director } = scene;

    switch (type) {
      case "text":
        if (!hasTextContent(content)) return null;
        return (
          <div 
            className="max-w-4xl mx-auto text-center space-y-6"
            role="region"
            aria-label={content.heading || "Text content"}
          >
            {content.heading && (
              <h2
                className={`font-bold leading-tight ${headingSizeMap[director?.headingSize || "4xl"] || headingSizeMap["4xl"]}`}
                id={`scene-${index}-heading`}
              >
                {content.heading}
              </h2>
            )}
            {content.body && (
              <p
                className={`${bodySizeMap[director?.bodySize || "base"] || bodySizeMap.base} opacity-90 max-w-3xl mx-auto`}
                aria-describedby={content.heading ? `scene-${index}-heading` : undefined}
              >
                {content.body}
              </p>
            )}
          </div>
        );

      case "image":
        if (!hasImageContent(content)) return null;
        const imageUrl = content.url;
        const imageAlt = content.alt || "";
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

        // Validate alt text exists for accessibility
        const hasValidAlt = imageAlt && imageAlt.trim().length > 0;
        
        return (
          <figure 
            className="w-full max-w-5xl mx-auto"
            role="img"
            aria-label={hasValidAlt ? imageAlt : "Decorative image"}
          >
            <ProgressiveImage
              src={resolveAsset(imageUrl)}
              alt={imageAlt}
              className="w-full h-full object-cover rounded-lg"
              aspectRatio={director?.mediaScale || "16/9"}
              style={{ opacity: director?.mediaOpacity || 1 }}
            />
            {!hasValidAlt && process.env.NODE_ENV === 'development' && (
              <span className="sr-only" role="alert">
                Warning: Image missing alt text for accessibility
              </span>
            )}
          </figure>
        );

      case "video":
        if (!hasVideoContent(content)) return null;
        const videoUrl = content.url;
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
          <figure className="w-full max-w-5xl mx-auto aspect-video">
            <video
              src={resolveAsset(videoUrl)}
              poster={content.poster ? resolveAsset(content.poster) : undefined}
              className="w-full h-full rounded-lg shadow-2xl object-cover"
              controls
              playsInline
              preload="metadata"
              style={{ opacity: director?.mediaOpacity || 1 }}
              aria-label="Video content"
            >
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
            <figcaption className="sr-only">
              Video player with standard controls
            </figcaption>
          </figure>
        );

      case "quote":
        if (!hasQuoteContent(content)) return null;
        const quoteText = content.quote;
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
          <figure 
            className="max-w-3xl mx-auto text-center space-y-4"
            role="figure"
            aria-label={content.author ? `Quote by ${content.author}` : "Quote"}
          >
            <blockquote 
              className="text-2xl md:text-4xl font-serif italic"
              cite={content.author}
            >
              <p>"{quoteText}"</p>
            </blockquote>
            {content.author && (
              <figcaption className="text-lg md:text-xl opacity-80">
                <cite className="not-italic">— {content.author}</cite>
              </figcaption>
            )}
          </figure>
        );

      case "split":
        if (!hasSplitContent(content)) return null;
        return (
          <div 
            className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto items-center"
            role="region"
            aria-label="Split content section"
          >
            <div className="space-y-4" aria-label="Left content">
              {renderSplitContent(content.leftContent, `${index}-left`)}
            </div>
            <div className="space-y-4" aria-label="Right content">
              {renderSplitContent(content.rightContent, `${index}-right`)}
            </div>
          </div>
        );

      case "gallery":
        if (!hasGalleryContent(content)) return null;
        return (
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
            role="region"
            aria-label="Image gallery"
          >
            {content.images.map((img, idx) => (
              <figure key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                <ProgressiveImage
                  src={resolveAsset(img.url)}
                  alt={img.alt || `Gallery image ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  aspectRatio="1/1"
                />
                {img.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        );

      case "fullscreen":
        if (!hasImageContent(content)) return null;
        return (
          <div 
            className="fixed inset-0 flex items-center justify-center"
            role="region"
            aria-label="Fullscreen media"
          >
            <ProgressiveImage
              src={resolveAsset(content.url)}
              alt={content.alt || "Fullscreen image"}
              className="w-full h-full object-cover"
              objectFit="cover"
            />
          </div>
        );

      default:
        if (process.env.NODE_ENV === 'development') {
          return (
            <div 
              className="text-center text-muted-foreground p-8 border-2 border-dashed border-red-500 rounded-lg"
              role="alert"
            >
              <p className="font-bold">Unsupported scene type: {type}</p>
              <p className="text-sm mt-2">This scene type is not yet implemented.</p>
            </div>
          );
        }
        return null;
    }
  };

  // Helper to render split content
  const renderSplitContent = (splitContent: { type: string; data: any }, key: string) => {
    switch (splitContent.type) {
      case "text":
        return (
          <div className="prose max-w-none">
            {splitContent.data.heading && <h3>{splitContent.data.heading}</h3>}
            {splitContent.data.body && <p>{splitContent.data.body}</p>}
          </div>
        );
      case "image":
        return (
          <ProgressiveImage
            src={resolveAsset(splitContent.data.url)}
            alt={splitContent.data.alt || "Split content image"}
            className="w-full h-auto rounded-lg"
          />
        );
      case "video":
        return (
          <video
            src={resolveAsset(splitContent.data.url)}
            controls
            playsInline
            className="w-full h-auto rounded-lg"
            aria-label="Split content video"
          >
            Your browser does not support the video tag.
          </video>
        );
      default:
        return <p>Unsupported split content type</p>;
    }
  };


  // Memoize animation configuration to prevent recalculation
  const animationConfig = useMemo(() => {
    if (prefersReducedMotion()) {
      return {
        entryDuration: 0,
        exitDuration: 0,
        scrollScrub: false,
        enableAnimations: false
      };
    }

    const scrollSpeedMap = {
      'slow': 2,
      'normal': 1,
      'fast': 0.5
    };

    return {
      entryDuration: scene.director.entryDuration,
      exitDuration: scene.director.exitDuration,
      scrollScrub: scrollSpeedMap[scene.director.scrollSpeed || 'normal'],
      enableAnimations: true
    };
  }, [scene.director]);

  useEffect(() => {
    if (!sceneRef.current || !contentRef.current || !animationConfig.enableAnimations) return;

    const director = scene.director;
    const scrollScrub = animationConfig.scrollScrub;

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
    <section
      ref={sceneRef}
      className={sceneClasses}
      style={{
        backgroundColor: director.backgroundColor,
        color: director.textColor,
        zIndex: director.layerDepth || 5,
      }}
      aria-label={`Scene ${index + 1}: ${type}`}
      tabIndex={0}
      role="region"
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
    </section>
  );
}