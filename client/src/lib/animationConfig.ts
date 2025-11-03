/**
 * Centralized Animation Configuration
 * 
 * All animation timing values, easings, and constants in one place.
 * Organized by component for easy maintenance and discoverability.
 * 
 * To modify animation behavior, update values here rather than
 * searching through individual components.
 */

export const ANIMATION_CONFIG = {
  /**
   * ScrollScaleReveal: "You need a system" scaling text animation
   * Pinned scroll animation with 3 phases: growth, crossfade, friction hold
   */
  scrollScale: {
    // Viewport height multiplier for scroll distance (4x = long friction)
    scrollDistanceMultiplier: 4,
    
    // ScrollTrigger scrub smoothness (higher = smoother but more lag)
    scrub: 1,
    
    // Animation phases (total duration: 10, percentages below)
    phases: {
      growth: 6,      // 60% - Font size grows
      crossfade: 2,   // 20% - White fades out, red fades in
      friction: 2,    // 20% - Hold with friction (creates "stuck" feeling)
    },
    
    // Font sizes (responsive with clamp)
    fontSize: {
      start: "clamp(2rem, 5vw, 3rem)",
      end: "clamp(6rem, 15vw, 10rem)",
    },
    
    // Letter spacing during growth
    letterSpacing: "0.02em",
    
    // Easing functions
    easing: {
      growth: "power2.inOut",
      crossfade: "power2.inOut",
      friction: "none", // No easing = pure hold
    },
    
    // Pulsating red text effect
    pulse: {
      triggerProgress: 0.70, // Start when 70% through scroll
      shadows: {
        initial: "0 0 40px rgba(220, 38, 38, 0.3), 0 0 80px rgba(220, 38, 38, 0.15)",
        peak: "0 0 80px rgba(220, 38, 38, 0.9), 0 0 160px rgba(220, 38, 38, 0.6), 0 0 240px rgba(220, 38, 38, 0.4)",
      },
      scale: {
        initial: 1,
        peak: 1.08,
      },
      duration: 1.2,
      easing: "power2.inOut",
    },
  },

  /**
   * CinematicBridge: Theatre-mode vignette and spotlight effects
   * Scroll-triggered dramatic lighting with choreographed fade-in/out
   */
  cinematicBridge: {
    scrub: 1,
    
    // Vignette intensity progression (0-1 normalized scroll positions)
    vignette: {
      phases: [
        { start: 0.3, opacity: 0.15, duration: 0.3, easing: "power2.in" },
        { start: 0.6, opacity: 0.5, duration: 0.1, easing: "power2.inOut" },
        { start: 0.85, opacity: 0.2, duration: 0.15, easing: "power2.out" },
      ],
    },
    
    // Spotlight intensity and scale progression
    spotlight: {
      phases: [
        { start: 0.3, opacity: 0.1, scale: 1.2, duration: 0.3, easing: "power2.in" },
        { start: 0.6, opacity: 0.4, scale: 0.8, duration: 0.1, easing: "power2.inOut" },
        { start: 0.85, opacity: 0.15, scale: 1, duration: 0.15, easing: "power2.out" },
      ],
    },
    
    // Arrow bounce timing
    arrow: {
      start: 0.85,
      opacity: 1,
      yPosition: 0,
      bounce: {
        yOffset: 10,
        duration: 0.05,
        easing: "power2.inOut",
      },
    },
  },

  /**
   * CinematicTextTransform: "salesperson" → "system" text fade
   * Blur + fade transition with beat pulse effect
   */
  cinematicText: {
    scrub: 1,
    
    // Phase timing (0-1 normalized scroll positions)
    dissolution: {
      start: 0.4,
      duration: 0.2,
      opacity: 0,
      blur: "8px",
      scale: 0.95,
      easing: "power2.in",
    },
    
    // Brief glow pulse between transitions
    beat: {
      fadeIn: { start: 0.6, duration: 0.025, opacity: 0.15, scale: 1, easing: "power2.out" },
      fadeOut: { start: 0.625, duration: 0.025, opacity: 0, scale: 1.1, easing: "power2.in" },
    },
    
    // New text reveal
    reveal: {
      start: 0.65,
      duration: 0.2,
      yOffset: 20,
      blur: "8px",
      scale: 1.05,
      easing: "power2.out",
    },
  },

  /**
   * ParticleDisintegration: Canvas particle effects
   * Falling particles with leaf-like motion and gravity
   */
  particles: {
    // Grid density (lower = more particles)
    spacing: 4,
    
    // Particle physics
    gravity: 0.08,           // Gentle downward pull
    airResistance: {
      horizontal: 0.995,
      vertical: 0.998,
    },
    
    // Horizontal sway (leaf-like motion)
    sway: {
      frequency: 0.002,
      amplitude: 0.02,
    },
    
    // Particle properties
    size: {
      min: 2,
      max: 6,
    },
    
    // Lifespan in milliseconds
    lifespan: {
      min: 6000,
      max: 9000,
    },
    
    // Colors (HSL)
    color: {
      saturation: { min: 90, max: 100 },
      lightness: { min: 55, max: 70 },
    },
    
    // Glow effects
    shadowBlur: 15,
    coreSize: 0.5, // Multiplier of particle size
    
    // Glow on target element when particles approach
    targetGlow: {
      distance: 50,
      intensity: 20,
      opacityMultiplier: 0.5,
    },
  },

  /**
   * OrbitalPowers: Video with orbiting badge elements
   * Elliptical orbit using golden ratio proportions
   */
  orbital: {
    // Initial rotation speed (degrees per frame)
    initialSpeed: 0.5,
    
    // Slowdown physics
    decayRate: 0.96,      // Exponential decay multiplier
    minSpeed: 0.01,       // Speed threshold before stopping
    
    // Timing
    videoSlowdownOffset: 2.5, // Seconds before video end to start slowdown
    slowdownDuration: 2000,   // Milliseconds to slow down
    expansionDelay: 1000,     // Delay before showing labels after expansion
    fallbackTimeout: 5000,    // Activate interactive mode if video doesn't play
    
    // Golden ratio proportions for orbit sizing
    goldenRatio: 1.618,
    expansionFactor: 1.382,   // Smaller golden ratio for expansion
    
    // Responsive orbit radii (baseRadius in pixels)
    responsive: {
      desktop: { breakpoint: 1024, baseRadius: 280 },
      tablet: { breakpoint: 768, baseRadius: 220 },
      mobile: { breakpoint: 0, baseRadius: 160 },
    },
    
    // Expansion animation speed
    expansionSpeed: {
      horizontal: 3,
      vertical: 2.4, // 0.8 multiplier of horizontal
    },
    
    // Intersection observer threshold
    visibilityThreshold: 0.2,
  },

  /**
   * BuildAndRampTimeline: Vertical timeline with scroll reveals
   * Steps fade in and lines draw sequentially
   */
  timeline: {
    // Step fade-in animation
    step: {
      initialOffset: 50,      // Y offset in pixels
      duration: 0.8,
      easing: "power2.out",
      scrollTrigger: {
        start: "top 85%",
        end: "top 65%",
      },
    },
    
    // Connecting line animation
    line: {
      duration: 0.6,
      easing: "power2.inOut",
      scrollTrigger: {
        start: "center 75%",
        end: "center 55%",
      },
    },
  },

  /**
   * Global settings
   */
  global: {
    // Reduced motion fallback behavior
    // When prefers-reduced-motion is active, all animations show end state immediately
    respectReducedMotion: true,
    
    // GSAP ScrollTrigger defaults
    scrollTrigger: {
      anticipatePin: 1,
      markers: false, // Set to true for debugging
    },
  },
} as const;

/**
 * Helper to check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Type exports for TypeScript autocomplete
 */
export type AnimationConfig = typeof ANIMATION_CONFIG;
export type ScrollScaleConfig = typeof ANIMATION_CONFIG.scrollScale;
export type OrbitalConfig = typeof ANIMATION_CONFIG.orbital;
