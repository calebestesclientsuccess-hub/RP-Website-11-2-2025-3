import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneConfig } from "@shared/schema";
import { PlaceholderSlot } from "./PlaceholderSlot";
import type { PlaceholderId } from "@shared/placeholder-config";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { PREMIUM_EASINGS, SCROLL_PRESETS, getIntensity } from "@/lib/animationConfig";

gsap.registerPlugin(ScrollTrigger);

// Configure global GSAP settings for premium performance
gsap.config({
  nullTargetWarn: false,
  force3D: true,
});

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
        enableAnimations: false,
        intensity: 0
      };
    }

    // Premium scroll speed mapping for smoother animation
    const scrollSpeedMap = {
      'slow': 2,      // Very smooth, dampened
      'normal': 1.2,  // Smooth but responsive
      'fast': 0.8     // More direct connection to scroll
    };

    // Determine scene category for optimal defaults
    const getSceneCategory = () => {
      if (scene.type === 'fullscreen' || scene.type === 'hero') return 'hero';
      if (scene.type === 'gallery') return 'gallery';
      if (scene.type === 'quote') return 'testimonial';
      if (scene.type === 'text') return 'text';
      return 'standard';
    };

    const category = getSceneCategory();
    const intensity = getIntensity();

    return {
      entryDuration: scene.director.entryDuration || (category === 'hero' ? 2.4 : 1.5),
      exitDuration: scene.director.exitDuration || (category === 'hero' ? 1.6 : 1.0),
      entryDelay: scene.director.entryDelay || 0.1,
      scrollScrub: scrollSpeedMap[scene.director.scrollSpeed || 'normal'],
      enableAnimations: true,
      intensity,
      category
    };
  }, [scene.director, scene.type]);

  useEffect(() => {
    if (!sceneRef.current || !contentRef.current || !animationConfig.enableAnimations) return;

    const director = scene.director;
    const scrollScrub = animationConfig.scrollScrub;

    const sceneEl = sceneRef.current;
    const contentEl = contentRef.current;

    // Premium easing function mapping
    const getEasing = (easing?: string) => {
      // Use premium easings from config as defaults
      const defaultEasings = {
        hero: PREMIUM_EASINGS.dramatic,
        gallery: PREMIUM_EASINGS.natural,
        testimonial: PREMIUM_EASINGS.smooth,
        text: PREMIUM_EASINGS.smoothOut,
        standard: PREMIUM_EASINGS.smooth
      };

      if (!easing) {
        return defaultEasings[animationConfig.category] || PREMIUM_EASINGS.smooth;
      }

      const easingMap: Record<string, string> = {
        // Basic easings
        linear: "none",
        ease: "power2.inOut",
        "ease-in": "power2.in",
        "ease-out": "power2.out",
        "ease-in-out": "power2.inOut",
        
        // Power easings (refined)
        power1: "power1.out",
        power2: "power2.out",
        power3: "power3.out",
        power4: "power4.out",
        
        // Premium easings
        dramatic: PREMIUM_EASINGS.dramatic,
        smooth: PREMIUM_EASINGS.smooth,
        snappy: PREMIUM_EASINGS.snappy,
        playful: PREMIUM_EASINGS.playful,
        elastic: PREMIUM_EASINGS.elastic,
        natural: PREMIUM_EASINGS.natural,
        
        // Custom presets
        back: "back.out(1.7)",
        "back-subtle": "back.out(1.2)",
        "elastic-subtle": "elastic.out(1, 0.7)",
        bounce: "bounce.out",
        circ: "circ.out",
      };
      
      return easingMap[easing] || defaultEasings[animationConfig.category] || "power2.out";
    };

    // Premium entry animation configuration with refined values
    const getEntryAnimation = () => {
      const intensity = animationConfig.intensity;
      const baseConfig = {
        opacity: 0,
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        transformPerspective: 1000,
        force3D: true, // GPU acceleration
      };

      // Adjust animation intensity based on device/preferences
      const adjustedValue = (val: number) => val * intensity;

      switch (director.entryEffect) {
        case "slide-up":
          return { 
            ...baseConfig, 
            y: adjustedValue(60), // Reduced from 100 for subtlety
            scale: 0.98 // Slight scale for depth
          };
        case "slide-down":
          return { 
            ...baseConfig, 
            y: adjustedValue(-60),
            scale: 0.98
          };
        case "slide-left":
          return { 
            ...baseConfig, 
            x: adjustedValue(80),
            rotation: adjustedValue(-2) // Subtle rotation for organic feel
          };
        case "slide-right":
          return { 
            ...baseConfig, 
            x: adjustedValue(-80),
            rotation: adjustedValue(2)
          };
        case "zoom-in":
          return { 
            ...baseConfig, 
            scale: 0.92, // More subtle scale
            filter: "blur(4px)" // Combine with blur for depth
          };
        case "zoom-out":
          return { 
            ...baseConfig, 
            scale: 1.08, // Reduced scale for elegance
            filter: "blur(4px)"
          };
        case "rotate-in":
          return { 
            ...baseConfig, 
            rotation: adjustedValue(45), // Reduced rotation
            scale: 0.95,
            transformOrigin: "center center"
          };
        case "flip-in":
          return { 
            ...baseConfig, 
            rotationY: adjustedValue(70), // Less extreme flip
            transformOrigin: "center center",
            backfaceVisibility: "hidden"
          };
        case "spiral-in":
          return { 
            ...baseConfig, 
            rotation: adjustedValue(180), // Reduced spiral
            scale: 0.8,
            y: adjustedValue(40)
          };
        case "blur-focus":
          return { 
            ...baseConfig, 
            filter: "blur(12px)", // Optimized blur amount
            scale: 1.02
          };
        case "fade":
        default:
          return { 
            ...baseConfig,
            y: adjustedValue(30), // Default subtle slide-up
            scale: 0.98
          };
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

    // Premium ScrollTrigger configuration based on scene type
    const getScrollTriggerConfig = () => {
      const baseConfig = {
        trigger: sceneEl,
        toggleActions: "play none none reverse",
        onUpdate: (self: ScrollTrigger) => {
          // Add will-change during animation for better performance
          if (self.isActive && contentEl) {
            contentEl.style.willChange = "transform, opacity, filter";
          } else if (contentEl) {
            contentEl.style.willChange = "auto";
          }
        }
      };

      // Use premium presets based on scene type
      if (animationConfig.category === 'hero') {
        return {
          ...baseConfig,
          start: "top 90%", // Earlier trigger for anticipation
          end: "bottom 10%",
          scrub: director.scrollSpeed === 'slow' ? 2 : 1.5, // Smoother for hero scenes
        };
      } else if (animationConfig.category === 'gallery') {
        return {
          ...baseConfig,
          start: "top bottom", // Start earlier for galleries
          end: "bottom top",
          scrub: scrollScrub || 1.2,
        };
      } else {
        return {
          ...baseConfig,
          start: "top 80%",
          end: "bottom 20%",
          scrub: (director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll) ? scrollScrub : false,
        };
      }
    };

    // Create main timeline with premium settings
    const tl = gsap.timeline({
      scrollTrigger: getScrollTriggerConfig(),
      defaults: {
        overwrite: "auto", // Prevent conflicts
      }
    });

    // Entry animation with refined values
    const entryAnimation = getEntryAnimation();
    const entryTarget = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotation: 0,
      rotationY: 0,
      filter: "blur(0px)",
      duration: animationConfig.entryDuration,
      delay: animationConfig.entryDelay,
      ease: getEasing(director.entryEasing),
      clearProps: "filter", // Clear filter after animation for performance
    };

    // Check for child elements to stagger
    const childElements = contentEl.querySelectorAll('h1, h2, h3, p, img, video, blockquote');
    
    if (childElements.length > 1 && (scene.type === 'text' || scene.type === 'gallery')) {
      // Stagger child elements for progressive reveals
      tl.fromTo(
        childElements,
        {
          ...entryAnimation,
          y: entryAnimation.y || 30, // Default slide-up for children
        },
        {
          ...entryTarget,
          stagger: {
            each: scene.type === 'gallery' ? 0.12 : 0.08, // Different stagger for galleries
            from: "start",
            ease: "power2.inOut"
          }
        }
      );
    } else {
      // Single element animation
      tl.fromTo(contentEl, entryAnimation, entryTarget);
    }

    // Premium scroll effects with refined values
    if (director.fadeOnScroll || director.scaleOnScroll || director.blurOnScroll) {
      const scrollEffectTl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneEl,
          start: "top 75%", // Adjusted for better timing
          end: "bottom 25%",
          scrub: scrollScrub || 1.5, // Smooth scrub for scroll effects
          onUpdate: (self) => {
            // Progressive effect based on scroll position
            const progress = self.progress;
            if (director.fadeOnScroll) {
              const opacity = 1 - (progress * 0.5); // Max 50% fade
              gsap.set(contentEl, { opacity: Math.max(opacity, 0.5) });
            }
          }
        }
      });

      // Add individual effects to timeline for better control
      if (director.scaleOnScroll) {
        scrollEffectTl.to(contentEl, {
          scale: 1.05, // Subtle scale, not too dramatic
          duration: 1,
          ease: "power1.inOut"
        }, 0);
      }

      if (director.blurOnScroll) {
        scrollEffectTl.to(contentEl, {
          filter: "blur(3px)", // Reduced blur for better readability
          duration: 1,
          ease: "power2.inOut"
        }, 0);
      }
    }

    // Premium parallax effect with optimized performance
    if (director.parallaxIntensity && director.parallaxIntensity > 0) {
      // Different parallax speeds for different element types
      const parallaxMultiplier = animationConfig.category === 'hero' ? 0.5 : 0.3;
      const yMovement = director.parallaxIntensity * 100 * parallaxMultiplier;
      
      gsap.to(contentEl, {
        scrollTrigger: {
          trigger: sceneEl,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2, // Smooth parallax scrolling
          invalidateOnRefresh: true, // Recalculate on resize
        },
        y: `${yMovement}%`,
        ease: "none", // Linear for parallax
      });

      // Add depth with subtle rotation for hero scenes
      if (animationConfig.category === 'hero' && director.parallaxIntensity > 0.5) {
        gsap.to(contentEl, {
          scrollTrigger: {
            trigger: sceneEl,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
          rotationY: director.parallaxIntensity * 5, // Subtle 3D rotation
          transformPerspective: 1200,
          ease: "none"
        });
      }
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