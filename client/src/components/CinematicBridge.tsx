import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const secondTextRef = useRef<HTMLHeadingElement>(null);
  const word1Ref = useRef<HTMLSpanElement>(null);
  const word2Ref = useRef<HTMLSpanElement>(null);
  const word3Ref = useRef<HTMLSpanElement>(null);
  const word4Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const firstText = firstTextRef.current;
    const secondText = secondTextRef.current;
    const word1 = word1Ref.current;
    const word2 = word2Ref.current;
    const word3 = word3Ref.current;
    const word4 = word4Ref.current;

    if (!container || !firstText || !secondText || !word1 || !word2 || !word3 || !word4) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show both texts immediately without animation
      gsap.set(firstText, { opacity: 1, scale: 1 });
      gsap.set([word1, word2, word3, word4], { opacity: 1, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([word1, word2, word3, word4], { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(firstText, { opacity: 1, scale: 1 });
      gsap.set(container, { backgroundColor: "rgba(0, 0, 0, 0)" });

      // Create a timeline for the entire sequence - REDUCED scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=200%", // Reduced from 300% to 200% for smoother experience
          pin: true,
          scrub: 0.5, // Faster response to scroll
          anticipatePin: 1,
          markers: false,
        },
      });

      // Deeper background fade for dramatic effect
      tl.to(container, {
        backgroundColor: "rgba(0, 0, 0, 0.85)", // Increased from 0.6 to 0.85
        duration: 0.2,
        ease: "power2.in",
      }, 0);

      // Phase 1: Scale up first text (0% to 30% of scroll)
      tl.to(firstText, {
        scale: 1.5,
        duration: 0.3,
        ease: "power2.inOut",
      }, 0);

      // Phase 2: Staggered word reveal with progressive intensity (30% to 50% of scroll)
      tl.to([word1, word2, word3, word4], {
        opacity: 1,
        y: 0,
        scale: 1.2, // Reduced from 1.5 to prevent overlap
        duration: 0.05,
        ease: "back.out(2)",
        stagger: 0.03, // Quick stagger between words
      }, 0.3)
      // Add pulse effect right after words appear
      .to([word1, word2, word3, word4], {
        scale: 1.3, // Reduced from 1.7 to prevent overlap
        duration: 0.05,
        ease: "power2.out",
      }, 0.5)
      .to([word1, word2, word3, word4], {
        scale: 1.2, // Reduced from 1.5
        duration: 0.05,
        ease: "power2.in",
      }, 0.55);

      // Hold moment (50% to 60% of scroll)
      tl.to({}, { duration: 0.1 }); // Shorter pause

      // Phase 3: Explosive zoom-forward exit (60% to 100% of scroll)
      tl.to([firstText], {
        scale: 2.5, // Zoom forward
        opacity: 0,
        z: 500, // Move toward camera
        duration: 0.15,
        ease: "power3.in",
      }, 0.7)
      .to([word1, word2, word3, word4], {
        scale: 2.5, // Zoom forward
        opacity: 0,
        z: 500, // Move toward camera
        duration: 0.15,
        ease: "power3.in",
        stagger: 0.02,
      }, 0.72)
      .to(container, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        duration: 0.1,
        ease: "power2.out",
      }, "-=0.05");

      // Refresh ScrollTrigger to ensure proper initialization
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-1000"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      data-testid="section-cinematic-bridge"
    >
      <div className="text-center max-w-5xl mx-auto px-4">
        <h2
          ref={firstTextRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-16 leading-tight"
          style={{ transformStyle: 'preserve-3d' }}
        >
          You need more than another salesperson.
        </h2>
        <div
          ref={secondTextRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary leading-tight"
          style={{ transformStyle: 'preserve-3d', wordSpacing: '1.5rem' }}
        >
          <span ref={word1Ref} className="inline-block px-2 md:px-3 lg:px-4" style={{ transformOrigin: 'center' }}>You</span>
          <span ref={word2Ref} className="inline-block px-2 md:px-3 lg:px-4" style={{ transformOrigin: 'center' }}>need</span>
          <span ref={word3Ref} className="inline-block px-2 md:px-3 lg:px-4" style={{ transformOrigin: 'center' }}>a</span>
          <span ref={word4Ref} className="inline-block px-2 md:px-3 lg:px-4" style={{ transformOrigin: 'center' }}>system</span>
        </div>
      </div>
    </section>
  );
}