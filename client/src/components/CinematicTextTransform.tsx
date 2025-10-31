import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CinematicTextTransformProps {
  triggerElement: HTMLElement | null;
}

export default function CinematicTextTransform({ triggerElement }: CinematicTextTransformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const oldTextRef = useRef<HTMLDivElement>(null);
  const newTextRef = useRef<HTMLDivElement>(null);
  const beatOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const oldText = oldTextRef.current;
    const newText = newTextRef.current;
    const beatOverlay = beatOverlayRef.current;
    
    if (!container || !oldText || !newText || !beatOverlay || !triggerElement) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      gsap.set(oldText, { opacity: 0 });
      gsap.set(newText, { opacity: 1 });
      return;
    }

    // Create the scroll-controlled timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // 1 second smoothing for silky motion
        markers: false,
      }
    });

    // PHASE 1: Dissolution (scroll 0.4 → 0.6)
    // Old text fades, blurs, and scales down
    tl.to(oldText, {
      opacity: 0,
      filter: 'blur(8px)',
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in"
    }, 0.4);

    // PHASE 2: The Beat (scroll 0.6 → 0.65)
    // Brief pulse/glow effect
    tl.fromTo(beatOverlay, {
      opacity: 0,
      scale: 0.8
    }, {
      opacity: 0.15,
      scale: 1,
      duration: 0.025,
      ease: "power2.out"
    }, 0.6)
    .to(beatOverlay, {
      opacity: 0,
      scale: 1.1,
      duration: 0.025,
      ease: "power2.in"
    }, 0.625);

    // PHASE 3: The Reveal (scroll 0.65 → 0.85)
    // New text fades in, unblurs, rises slightly
    tl.fromTo(newText, {
      opacity: 0,
      filter: 'blur(8px)',
      y: 20,
      scale: 1.05
    }, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    }, 0.65);

    return () => {
      tl.kill();
    };
  }, [triggerElement]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto"
      style={{ height: '200px' }} // Fixed height prevents layout shift
      data-testid="cinematic-text-transform"
    >
      {/* Old text that dissolves */}
      <div
        ref={oldTextRef}
        className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center text-foreground leading-tight px-4"
        data-testid="old-text"
      >
        You need more than another salesperson
      </div>
      
      {/* Beat pulse overlay */}
      <div
        ref={beatOverlayRef}
        className="absolute inset-0 rounded-full opacity-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
      
      {/* New text that reveals */}
      <div
        ref={newTextRef}
        className="absolute inset-0 flex items-center justify-center opacity-0 px-4"
        data-testid="new-text"
      >
        <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center leading-tight">
          <span className="text-foreground">You need a </span>
          <span className="text-primary font-extrabold">system</span>
        </div>
      </div>
    </div>
  );
}
