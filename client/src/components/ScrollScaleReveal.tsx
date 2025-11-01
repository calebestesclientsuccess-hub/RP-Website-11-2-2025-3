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

    // Set initial states explicitly (fromTo handles fontSize)
    gsap.set(redText, { opacity: 0 });
    gsap.set(text, { opacity: 1 });

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

    // Phase 1: Grow fontSize to emphasized size (moderate growth for clean wrapping)
    // Duration 7 = 70% of total timeline
    tl.fromTo(text, 
      {
        fontSize: "clamp(2rem, 5vw, 3rem)", // Responsive starting size
        opacity: 1,
      },
      {
        fontSize: "clamp(6rem, 15vw, 10rem)", // Moderate max: 96px mobile → 160px desktop
        opacity: 1,
        letterSpacing: "0.02em",
        ease: "power2.inOut",
        duration: 7, // 70% of timeline
      }
    )
    // Phase 2: Crossfade - white fades out, red fades in simultaneously
    // Duration 2 = 20% of total timeline
    .to(text, {
      opacity: 0,
      ease: "power2.in",
      duration: 2, // 20% of timeline
    })
    .fromTo(redText, 
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: "power2.out",
        duration: 2, // 20% of timeline
      }, 
      "<" // Start at same time as white fadeout
    )
    // Phase 3: Hold red text visible
    // Duration 1 = 10% of total timeline
    .to(redText, {
      opacity: 1,
      duration: 1, // 10% of timeline
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
        {/* White text - fontSize animates with moderate growth for clean wrapping */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            ref={textRef}
            className="font-bold text-center text-foreground leading-tight max-w-4xl"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
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
