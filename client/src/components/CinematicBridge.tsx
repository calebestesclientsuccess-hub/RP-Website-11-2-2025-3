import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { ANIMATION_CONFIG, prefersReducedMotion } from '@/lib/animationConfig';
import CinematicTextTransform from './CinematicTextTransform';

gsap.registerPlugin(ScrollTrigger);

/**
 * CinematicBridge: Theatre-mode scroll transition
 * 
 * Creates dramatic scroll-triggered vignette and spotlight effects
 * with choreographed text transformation (via CinematicTextTransform).
 * 
 * Animation Phases:
 * 1. Build (30-60%): Vignette and spotlight intensity increase
 * 2. Peak (60-70%): Maximum dramatic effect
 * 3. Ease (85-100%): Effects fade, arrow appears and bounces
 * 
 * Triggers: Pinned scroll section
 * Duration: Full viewport height
 * Dependencies: GSAP, ScrollTrigger, CinematicTextTransform
 */
export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure container is mounted before passing ref to child
  useEffect(() => {
    if (containerRef.current) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const arrow = arrowRef.current;
    const vignette = vignetteRef.current;
    const spotlight = spotlightRef.current;

    if (!container || !arrow || !vignette || !spotlight) return;

    const config = ANIMATION_CONFIG.cinematicBridge;

    if (prefersReducedMotion()) {
      // Show simplified version without animations
      gsap.set(arrow, { opacity: 1, y: 0 });
      return;
    }

    // Initial states
    gsap.set(arrow, { opacity: 0, y: -10 });
    gsap.set(vignette, { opacity: 0 });
    gsap.set(spotlight, { opacity: 0, scale: 1.5 });

    const ctx = gsap.context(() => {
      // Create scroll-triggered theatre-mode timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          pin: true,
          scrub: config.scrub,
          anticipatePin: ANIMATION_CONFIG.global.scrollTrigger.anticipatePin,
          markers: ANIMATION_CONFIG.global.scrollTrigger.markers,
        },
      });

      // Theatre-mode effects progress with scroll
      scrollTl
        // Vignette builds
        .to(vignette, {
          opacity: config.vignette.phases[0].opacity,
          duration: config.vignette.phases[0].duration,
          ease: config.vignette.phases[0].easing,
        }, config.vignette.phases[0].start)
        .to(vignette, {
          opacity: config.vignette.phases[1].opacity,
          duration: config.vignette.phases[1].duration,
          ease: config.vignette.phases[1].easing,
        }, config.vignette.phases[1].start)
        .to(vignette, {
          opacity: config.vignette.phases[2].opacity,
          duration: config.vignette.phases[2].duration,
          ease: config.vignette.phases[2].easing,
        }, config.vignette.phases[2].start)
        
        // Spotlight builds
        .to(spotlight, {
          opacity: config.spotlight.phases[0].opacity,
          scale: config.spotlight.phases[0].scale,
          duration: config.spotlight.phases[0].duration,
          ease: config.spotlight.phases[0].easing,
        }, config.spotlight.phases[0].start)
        .to(spotlight, {
          opacity: config.spotlight.phases[1].opacity,
          scale: config.spotlight.phases[1].scale,
          duration: config.spotlight.phases[1].duration,
          ease: config.spotlight.phases[1].easing,
        }, config.spotlight.phases[1].start)
        .to(spotlight, {
          opacity: config.spotlight.phases[2].opacity,
          scale: config.spotlight.phases[2].scale,
          duration: config.spotlight.phases[2].duration,
          ease: config.spotlight.phases[2].easing,
        }, config.spotlight.phases[2].start)
        
        // Arrow appears and bounces
        .to(arrow, {
          opacity: config.arrow.opacity,
          y: config.arrow.yPosition,
          duration: 0.1,
          ease: "power2.out",
        }, config.arrow.start)
        .to(arrow, {
          y: config.arrow.bounce.yOffset,
          duration: config.arrow.bounce.duration,
          ease: config.arrow.bounce.easing,
          yoyo: true,
          repeat: 1,
        }, 0.9);

    });

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      data-testid="section-cinematic-bridge"
    >
      {/* Theatre-mode vignette effect */}
      <div
        ref={vignetteRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%)',
          zIndex: 2,
        }}
      />
      
      {/* Theatre-mode spotlight effect */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          zIndex: 3,
        }}
      />

      <div className="text-center max-w-5xl mx-auto px-4 relative z-10">
        {/* Cinematic text transform - scroll controlled - handles both old and new text */}
        {isMounted && containerRef.current && (
          <CinematicTextTransform 
            triggerElement={containerRef.current}
          />
        )}
      </div>
      
      {/* Minimalist red bouncing arrow - scroll controlled */}
      <div
        ref={arrowRef}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))',
          zIndex: 9999,
          opacity: 0,
          width: '60px',
          height: '60px',
        }}
        data-testid="red-arrow"
      >
        <ChevronDown 
          className="w-12 h-12 text-primary" 
          strokeWidth={2}
        />
      </div>
    </section>
  );
}
