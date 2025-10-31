import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import CinematicTextTransform from './CinematicTextTransform';

gsap.registerPlugin(ScrollTrigger);

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

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
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
          scrub: 1,
          anticipatePin: 1,
          markers: false,
        },
      });

      // Theatre-mode effects progress with scroll
      // Build intensity from 0.3 → 0.6, peak at 0.6-0.7, ease back 0.85-1.0
      scrollTl
        // Vignette builds
        .to(vignette, {
          opacity: 0.15,
          duration: 0.3,
          ease: "power2.in",
        }, 0.3)
        .to(vignette, {
          opacity: 0.5,
          duration: 0.1,
          ease: "power2.inOut",
        }, 0.6)
        .to(vignette, {
          opacity: 0.2,
          duration: 0.15,
          ease: "power2.out",
        }, 0.85)
        
        // Spotlight builds
        .to(spotlight, {
          opacity: 0.1,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.in",
        }, 0.3)
        .to(spotlight, {
          opacity: 0.4,
          scale: 0.8,
          duration: 0.1,
          ease: "power2.inOut",
        }, 0.6)
        .to(spotlight, {
          opacity: 0.15,
          scale: 1,
          duration: 0.15,
          ease: "power2.out",
        }, 0.85)
        
        // Arrow appears and bounces at 0.85-1.0
        .to(arrow, {
          opacity: 1,
          y: 0,
          duration: 0.1,
          ease: "power2.out",
        }, 0.85)
        .to(arrow, {
          y: 10,
          duration: 0.05,
          ease: "power2.inOut",
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
