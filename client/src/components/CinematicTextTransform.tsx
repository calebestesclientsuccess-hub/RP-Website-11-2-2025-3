import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_CONFIG, prefersReducedMotion } from '@/lib/animationConfig';

gsap.registerPlugin(ScrollTrigger);

interface CinematicTextTransformProps {
  triggerElement: HTMLElement | null;
}

/**
 * CinematicTextTransform: Scroll-triggered text fade transition
 * 
 * Transforms "salesperson" → "system" with blur + beat pulse effect
 * 
 * Animation Phases:
 * 1. Dissolution (40-60%): Old text blurs and fades out
 * 2. Beat (60-65%): Brief glow pulse between transitions
 * 3. Reveal (65-85%): New text fades in and unblurs
 * 
 * Triggers: Scroll position within parent CinematicBridge
 * Dependencies: GSAP, ScrollTrigger, requires triggerElement ref
 */
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

    const config = ANIMATION_CONFIG.cinematicText;
    
    if (prefersReducedMotion()) {
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
        scrub: config.scrub,
        markers: ANIMATION_CONFIG.global.scrollTrigger.markers,
      }
    });

    // PHASE 1: Dissolution
    tl.to(oldText, {
      opacity: config.dissolution.opacity,
      filter: `blur(${config.dissolution.blur})`,
      scale: config.dissolution.scale,
      duration: config.dissolution.duration,
      ease: config.dissolution.easing
    }, config.dissolution.start);

    // PHASE 2: The Beat pulse
    tl.fromTo(beatOverlay, {
      opacity: 0,
      scale: config.beat.fadeIn.scale - 0.2
    }, {
      opacity: config.beat.fadeIn.opacity,
      scale: config.beat.fadeIn.scale,
      duration: config.beat.fadeIn.duration,
      ease: config.beat.fadeIn.easing
    }, config.beat.fadeIn.start)
    .to(beatOverlay, {
      opacity: config.beat.fadeOut.opacity,
      scale: config.beat.fadeOut.scale,
      duration: config.beat.fadeOut.duration,
      ease: config.beat.fadeOut.easing
    }, config.beat.fadeOut.start);

    // PHASE 3: The Reveal
    tl.fromTo(newText, {
      opacity: 0,
      filter: `blur(${config.reveal.blur})`,
      y: config.reveal.yOffset,
      scale: config.reveal.scale
    }, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      duration: config.reveal.duration,
      ease: config.reveal.easing
    }, config.reveal.start);

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
