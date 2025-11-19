/**
 * Premium Animation Configuration
 * Optimized for fluid, professional scroll-based storytelling
 * All timings and curves carefully tuned for 60fps performance
 */

// Utility function to check for reduced motion preference
export const prefersReducedMotion = () => 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Premium easing curves for different animation types
export const PREMIUM_EASINGS = {
  // Dramatic entrances - use for hero sections and important reveals
  dramatic: "power3.out",
  dramaticIn: "power3.in",
  dramaticInOut: "power3.inOut",
  
  // Smooth transitions - general purpose
  smooth: "power2.inOut",
  smoothOut: "power2.out",
  smoothIn: "power2.in",
  
  // Snappy movements - CTAs and interactive elements
  snappy: "circ.out",
  snappyIn: "circ.in",
  snappyInOut: "circ.inOut",
  
  // Playful bounces - for personality and delight
  playful: "back.out(1.7)",
  playfulSubtle: "back.out(1.2)",
  playfulExaggerated: "back.out(2.5)",
  
  // Elastic effects - attention-grabbing
  elastic: "elastic.out(1, 0.5)",
  elasticSubtle: "elastic.out(1, 0.7)",
  elasticStrong: "elastic.out(1.2, 0.3)",
  
  // Natural physics
  natural: "power4.out",
  naturalIn: "power4.in",
  naturalInOut: "power4.inOut",
  
  // Custom curves
  custom: {
    silky: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    sharp: "cubic-bezier(0.4, 0, 0.2, 1)",
    material: "cubic-bezier(0.4, 0, 0.2, 1)",
  }
} as const;

// Optimized timing presets for different scene types
export const TIMING_PRESETS = {
  hero: {
    entryDuration: 2.4,      // Dramatic, cinematic entrance
    exitDuration: 1.6,       // Smooth exit
    entryDelay: 0.3,         // Small anticipation
    stagger: 0.15,           // For multi-element reveals
  },
  text: {
    entryDuration: 1.2,      // Quick but readable
    exitDuration: 0.8,       
    entryDelay: 0.1,
    stagger: 0.08,           // Word-by-word reveals
  },
  gallery: {
    entryDuration: 1.5,      // Smooth, elegant
    exitDuration: 1.0,
    entryDelay: 0.2,
    stagger: 0.12,           // Cascading effect
  },
  testimonial: {
    entryDuration: 1.8,      // Give weight to social proof
    exitDuration: 1.2,
    entryDelay: 0.25,
    stagger: 0.1,
  },
  stats: {
    entryDuration: 2.0,      // Time for number counting
    exitDuration: 1.0,
    entryDelay: 0.15,
    stagger: 0.15,           // Sequential reveal
  },
  cta: {
    entryDuration: 0.8,      // Quick, attention-grabbing
    exitDuration: 0.5,
    entryDelay: 0.05,
    stagger: 0.05,
  },
} as const;

// Premium ScrollTrigger configurations
export const SCROLL_PRESETS = {
  // Early trigger for anticipation
  anticipate: {
    start: "top bottom",     // Start when top hits bottom of viewport
    end: "bottom top",       // End when bottom hits top of viewport
    scrub: 1.5,             // Smooth, dampened scrolling
  },
  // Standard reveal
  standard: {
    start: "top 80%",
    end: "bottom 20%",
    scrub: 1,
  },
  // Delayed reveal for dramatic effect
  dramatic: {
    start: "top 60%",
    end: "bottom 40%",
    scrub: 2,               // Very smooth, cinematic
  },
  // Pinned sections
  pinned: {
    start: "top top",
    end: "+=100%",          // Pin for one viewport height
    pin: true,
    pinSpacing: false,
    scrub: 1,
  },
  // Parallax scrolling
  parallax: {
    start: "top bottom",
    end: "bottom top",
    scrub: true,            // Direct parallax
  },
} as const;

// Animation intensity scales for different devices/preferences
export const INTENSITY = {
  full: 1,          // Desktop with no motion preferences
  medium: 0.7,      // Tablet or subtle preference
  reduced: 0.3,     // Mobile or reduced motion
  none: 0,          // Complete disable for accessibility
} as const;

// Get appropriate intensity based on device/preferences
export const getIntensity = () => {
  if (prefersReducedMotion()) return INTENSITY.reduced;
  if (typeof window === 'undefined') return INTENSITY.full;
  
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;
  
  if (isMobile) return INTENSITY.reduced;
  if (isTablet) return INTENSITY.medium;
  return INTENSITY.full;
};

export const ANIMATION_CONFIG = {
  // Global settings
  global: {
    scrollTrigger: {
      markers: false,          // Set to true for debugging
      anticipatePin: 1,        // Prevent jump on pin
      fastScrollEnd: true,     // Better performance on fast scroll
      preventOverlaps: true,   // Prevent animation conflicts
      
      // Refresh on resize for responsive animations
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
    },
    
    // Default animation settings
    defaults: {
      ease: PREMIUM_EASINGS.smooth,
      duration: 1.2,
      overwrite: "auto",     // Prevent conflicts
    },
    
    // Performance optimizations
    performance: {
      lagSmoothing: 500,      // Smooth out lag spikes
      throttle: 16,           // Cap at 60fps
      force3D: true,          // GPU acceleration
      willChange: "transform", // Browser optimization hint
    }
  },

  // Scene-specific configurations
  scenes: {
    hero: {
      ...TIMING_PRESETS.hero,
      scrollTrigger: SCROLL_PRESETS.dramatic,
      easing: PREMIUM_EASINGS.dramatic,
      intensity: getIntensity(),
    },
    text: {
      ...TIMING_PRESETS.text,
      scrollTrigger: SCROLL_PRESETS.standard,
      easing: PREMIUM_EASINGS.smoothOut,
      intensity: getIntensity(),
    },
    gallery: {
      ...TIMING_PRESETS.gallery,
      scrollTrigger: SCROLL_PRESETS.anticipate,
      easing: PREMIUM_EASINGS.natural,
      intensity: getIntensity(),
    },
    testimonial: {
      ...TIMING_PRESETS.testimonial,
      scrollTrigger: SCROLL_PRESETS.standard,
      easing: PREMIUM_EASINGS.smooth,
      intensity: getIntensity(),
    },
    stats: {
      ...TIMING_PRESETS.stats,
      scrollTrigger: SCROLL_PRESETS.standard,
      easing: PREMIUM_EASINGS.snappy,
      intensity: getIntensity(),
    },
    cta: {
      ...TIMING_PRESETS.cta,
      scrollTrigger: SCROLL_PRESETS.standard,
      easing: PREMIUM_EASINGS.playfulSubtle,
      intensity: getIntensity(),
    }
  },

  // BuildAndRampTimeline configuration (GTM Engine page)
  timeline: {
    step: {
      duration: 0.6,
      initialOffset: 50,
      stagger: 0.15,
      easing: PREMIUM_EASINGS.smoothOut,
      scrollTrigger: {
        start: "top 85%",
        end: "bottom 20%",
        scrub: 1,
      }
    },
    line: {
      duration: 0.4,
      stagger: 0.1,
      easing: PREMIUM_EASINGS.smooth,
      scrollTrigger: {
        start: "top 85%",
        end: "bottom 20%",
        scrub: 1.5,
      }
    },
    result: {
      duration: 0.8,
      delay: 0.3,
      initialOffset: 60,
      easing: PREMIUM_EASINGS.dramatic,
      scrollTrigger: {
        start: "top 75%",
        end: "bottom 20%",
        scrub: 1,
      }
    }
  },
} as const;