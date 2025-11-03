/**
 * Centralized Animation Configuration
 * Single source of truth for all animation timings and values
 * Simplified for maintainability and performance
 */

// Utility function to check for reduced motion preference
export const prefersReducedMotion = () => 
  typeof window !== 'undefined' && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const ANIMATION_CONFIG = {
  // Global settings
  global: {
    scrollTrigger: {
      markers: false, // Set to true for debugging
      anticipatePin: 1,
    }
  },

  // BuildAndRampTimeline configuration (GTM Engine page)
  timeline: {
    step: {
      duration: 0.6,
      initialOffset: 50, // pixels to slide up from
      stagger: 0.15,
      easing: "power2.out",
      scrollTrigger: {
        start: "top 85%",
        end: "bottom 20%",
      }
    },
    line: {
      duration: 0.4,
      stagger: 0.1,
      easing: "power2.inOut",
      scrollTrigger: {
        start: "top 85%",
        end: "bottom 20%",
      }
    },
    result: {
      duration: 0.8,
      delay: 0.3,
      initialOffset: 60,
      easing: "power3.out",
      scrollTrigger: {
        start: "top 75%",
        end: "bottom 20%",
      }
    }
  },
} as const;