import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollScaleReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const redTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    const redText = redTextRef.current;
    
    if (!container || !text || !redText) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show final state immediately
      gsap.set(text, { opacity: 0, scale: 1 });
      gsap.set(redText, { opacity: 1, scale: 1 });
      return;
    }

    // Timeline for the scaling and crossfade effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2, // Snappy but smooth
        invalidateOnRefresh: true,
      }
    });

    // Progressive scaling with letter spacing expansion
    tl.fromTo(text, 
      {
        scale: 1,
        opacity: 1,
        letterSpacing: "normal",
      },
      {
        scale: 8,
        opacity: 1,
        letterSpacing: "0.2em",
        ease: "power2.inOut",
        duration: 0.6,
      }
    )
    // Fade out the white text
    .to(text, {
      opacity: 0,
      duration: 0.15,
    }, "-=0.1")
    // Crossfade to red text at normal size
    .fromTo(redText,
      {
        opacity: 0,
        scale: 1.2,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      },
      "-=0.1"
    );

    return () => {
      // Kill only this timeline and its associated ScrollTrigger
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[200vh] flex items-center justify-center overflow-hidden bg-background"
      data-testid="section-scroll-scale-reveal"
    >
      <div className="sticky top-1/2 -translate-y-1/2 w-full px-4 md:px-6 lg:px-8">
        {/* White scaling text */}
        <div 
          ref={textRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground whitespace-nowrap"
            data-testid="text-scaling"
          >
            You need more than another salesperson
          </h2>
        </div>

        {/* Red finale text */}
        <div 
          ref={redTextRef}
          className="absolute inset-0 flex items-center justify-center opacity-0"
        >
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary"
            style={{
              textShadow: "0 0 40px rgba(220, 38, 38, 0.3), 0 0 80px rgba(220, 38, 38, 0.15)",
            }}
            data-testid="text-red-finale"
          >
            You need a system.
          </h2>
        </div>
      </div>
    </section>
  );
}
