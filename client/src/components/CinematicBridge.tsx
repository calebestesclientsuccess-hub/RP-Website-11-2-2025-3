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
      gsap.set(secondText, { opacity: 0, y: 60, scale: 0.8 });
      gsap.set(firstText, { opacity: 1, scale: 1 });
      gsap.set(container, { backgroundColor: "rgba(0, 0, 0, 0)" });

      // Create a timeline for the entire sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=300%", // Animation spans 3x viewport height for cinematic feel
          pin: true,
          scrub: 1, // Smoother scrubbing
          anticipatePin: 1,
          markers: false, // Debug markers disabled
        },
      });

      // Add subtle background fade for depth
      tl.to(container, {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        duration: 0.15,
        ease: "power2.in",
      }, 0);

      // Phase 1: Scale up first text elegantly (0% to 35% of scroll)
      tl.to(firstText, {
        scale: 1.6,
        duration: 0.35,
        ease: "power3.inOut",
      }, 0);

      // Phase 2: Fade in and scale up second text (35% to 50% of scroll)
      tl.to(secondText, {
        opacity: 1,
        y: 0,
        scale: 1.6,
        duration: 0.15,
        ease: "back.out(1.7)",
      }, 0.35);

      // Hold both texts visible (50% to 70% of scroll)
      tl.to({}, { duration: 0.2 }); // Empty tween to create a dramatic pause

      // Phase 3: Scale down and fade out everything (70% to 100% of scroll)
      tl.to([firstText, secondText], {
        scale: 0.5,
        opacity: 0,
        y: -100,
        duration: 0.3,
        ease: "power3.in",
        stagger: 0.05,
      })
      .to(container, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        duration: 0.15,
        ease: "power2.out",
      }, "-=0.15");

      // Refresh ScrollTrigger to ensure proper initialization
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-1000"
      data-testid="section-cinematic-bridge"
    >
      <div className="text-center max-w-5xl mx-auto px-4">
        <h2
          ref={firstTextRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-16 leading-tight"
        >
          You need more than another salesperson.
        </h2>
        <h2
          ref={secondTextRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary leading-tight"
        >
          You need a system
        </h2>
      </div>
    </section>
  );
}