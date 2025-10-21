import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const secondTextRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const firstText = firstTextRef.current;
    const secondText = secondTextRef.current;
    const arrow = arrowRef.current;

    if (!container || !firstText || !secondText || !arrow) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show both texts immediately without animation
      gsap.set(firstText, { opacity: 1, scale: 1 });
      gsap.set(secondText, { opacity: 1 });
      gsap.set(arrow, { opacity: 0 });
      return;
    }

    // Initial states
    gsap.set(secondText, { opacity: 0, y: 20 });
    gsap.set(arrow, { opacity: 0, y: -10 });
    gsap.set(firstText, { opacity: 1, scale: 1 });
    gsap.set(container, { backgroundColor: "rgba(0, 0, 0, 0)" });

    const ctx = gsap.context(() => {
      // Create scroll-triggered animation for first text only
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          markers: false,
          onEnter: () => {
            if (!hasTriggered) {
              setHasTriggered(true);
              // Start timer for second text and arrow animations
              startTimerAnimations();
            }
          },
        },
      });

      // Scroll-based animations
      scrollTl.to(container, {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        duration: 0.3,
        ease: "power2.in",
      }, 0)
      .to(firstText, {
        scale: 1.5,
        duration: 0.4,
        ease: "power2.inOut",
      }, 0);

      // Timer-based animations
      const startTimerAnimations = () => {
        // Wait 1.5 seconds then reveal "You need a system"
        gsap.to(secondText, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 1.5,
          ease: "power2.out",
        });

        // Show arrow after text animation with slight pause
        gsap.to(arrow, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 3.2, // 1.5s delay + 1.2s animation + 0.5s pause
          ease: "power2.out",
          onComplete: () => {
            // Start bounce animation
            gsap.to(arrow, {
              y: 10,
              duration: 0.6,
              ease: "power2.inOut",
              yoyo: true,
              repeat: -1,
            });
          },
        });
      };

      // Hide arrow when user scrolls
      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
        if (arrow && hasTriggered) {
          clearTimeout(scrollTimeout);
          gsap.to(arrow, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    });

    return () => ctx.revert();
  }, [hasTriggered]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
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
          style={{ transformStyle: 'preserve-3d' }}
        >
          You need a system
        </div>
      </div>
      
      {/* Bouncing arrow with subtle glow */}
      <div
        ref={arrowRef}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.2))',
          zIndex: 10,
        }}
        data-testid="arrow-scroll-indicator"
      >
        <ChevronDown 
          className="w-8 h-8 text-white opacity-80" 
          strokeWidth={1.5}
        />
      </div>
    </section>
  );
}