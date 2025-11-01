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
      gsap.set(text, { opacity: 0 });
      gsap.set(redText, { opacity: 1 });
      return;
    }

    // Set initial states explicitly
    gsap.set(redText, { opacity: 0 });
    gsap.set(text, { opacity: 1, fontSize: "3rem" }); // Start at 48px

    // Timeline for fontSize growth + crossfade effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top", // Animation starts when section top hits viewport top
        end: "bottom top", // Animation ends when section bottom hits viewport top (400vh scroll)
        scrub: 1.2, // Snappy but smooth
        invalidateOnRefresh: true,
      }
    });

    // Phase 1: Grow fontSize from 3rem to 12rem (natural wrapping from 1 line to 4-5 lines)
    // This takes 75% of the scroll distance
    tl.to(text, 
      {
        fontSize: "12rem", // 192px - will wrap to 4-5 lines
        opacity: 1,
        letterSpacing: "0.04em",
        ease: "power1.inOut",
        duration: 0.75,
      }
    )
    // Phase 2: Crossfade - white text fades out (75-90% of scroll)
    .to(text, {
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
    })
    // Red text fades in at normal H1 size - simultaneous with white fadeout
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
    // Phase 3: Hold the red text visible for remaining scroll (90-100%)
    .to(redText, {
      opacity: 1,
      duration: 0.10,
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
        {/* White text - fontSize animates from 3rem to 12rem, wrapping naturally */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            ref={textRef}
            className="font-bold text-center text-foreground leading-tight max-w-3xl"
            style={{ fontSize: "3rem" }}
            data-testid="text-scaling"
          >
            You need more than another salesperson
          </h1>
        </div>

        {/* Red finale text - stays at normal H1 size */}
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
