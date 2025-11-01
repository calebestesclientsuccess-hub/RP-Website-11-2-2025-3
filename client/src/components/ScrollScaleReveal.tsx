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

    // Set initial states explicitly
    gsap.set(redText, { opacity: 0 });
    gsap.set(text, { opacity: 1, scale: 1 });

    // Timeline for the extended scaling and crossfade effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top", // Animation starts when section top hits viewport top
        end: "bottom top", // Animation ends when section bottom hits viewport top (400vh scroll)
        scrub: 1.2, // Snappy but smooth
        invalidateOnRefresh: true,
      }
    });

    // Progressive scaling: 1x → 4x (wraps to multiple lines, then overfills)
    // This takes 70% of the scroll distance
    tl.fromTo(text, 
      {
        scale: 1,
        opacity: 1,
        letterSpacing: "normal",
      },
      {
        scale: 4,
        opacity: 1,
        letterSpacing: "0.08em",
        ease: "power1.inOut",
        duration: 0.70,
      }
    )
    // Final fadeout of white text as it overfills (70-85% of scroll)
    .to(text, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
    })
    // Red text fades in at fixed H1 size (no scaling) - simultaneous with white fadeout
    .fromTo(redText,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.15,
        ease: "power2.out",
      },
      "<" // Start at the same time as previous tween
    )
    // Hold the red text visible for remaining scroll (85-100%)
    .to(redText, {
      opacity: 1,
      duration: 0.15,
    });

    return () => {
      // Kill only this timeline and its associated ScrollTrigger
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[400vh] flex items-center justify-center overflow-hidden bg-background"
      data-testid="section-scroll-scale-reveal"
    >
      <div className="sticky top-1/2 -translate-y-1/2 w-full px-4 md:px-6 lg:px-8">
        {/* White scaling text - wraps to multiple lines as it scales */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            ref={textRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-foreground px-4 leading-tight max-w-5xl"
            data-testid="text-scaling"
          >
            You need more than another salesperson
          </h1>
        </div>

        {/* Red finale text - stays at H1 size, no scaling */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            ref={redTextRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary px-4 leading-tight"
            style={{
              textShadow: "0 0 40px rgba(220, 38, 38, 0.3), 0 0 80px rgba(220, 38, 38, 0.15)",
            }}
            data-testid="text-red-finale"
          >
            You need a system.
          </h1>
        </div>
      </div>
    </section>
  );
}
