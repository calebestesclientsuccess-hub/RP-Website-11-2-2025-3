import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const secondTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const firstText = firstTextRef.current;
    const secondText = secondTextRef.current;

    if (!container || !firstText || !secondText) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show both texts immediately without animation
      gsap.set(firstText, { opacity: 1, scale: 1 });
      gsap.set(secondText, { opacity: 1, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(secondText, { opacity: 0, y: 20 });
      gsap.set(firstText, { opacity: 1, scale: 1 });

      // Create a timeline for the entire sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 50%",
          end: "+=300%", // Animation spans 3x viewport height for cinematic feel
          pin: true,
          scrub: 1.5, // Smooth scrubbing
          anticipatePin: 1,
          // markers: true, // Uncomment for debugging
        },
      });

      // Phase 1: Scale up first text (0% to 40% of scroll)
      tl.to(firstText, {
        scale: 2.5,
        duration: 0.4,
        ease: "power2.inOut",
      });

      // Phase 2: Fade in second text while first text holds (40% to 60% of scroll)
      tl.to(secondText, {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
      });

      // Hold both texts visible (60% to 80% of scroll)
      tl.to({}, { duration: 0.2 }); // Empty tween to create a pause

      // Phase 3: Scale down both texts together and fade out (80% to 100% of scroll)
      tl.to([firstText, secondText], {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.2,
        ease: "power2.in",
        stagger: 0.05,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      data-testid="section-cinematic-bridge"
    >
      <div className="text-center max-w-5xl mx-auto px-4">
        <h2
          ref={firstTextRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight"
        >
          You need more than another salesperson.
        </h2>
        <h2
          ref={secondTextRef}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight"
        >
          You need a system
        </h2>
      </div>
    </section>
  );
}