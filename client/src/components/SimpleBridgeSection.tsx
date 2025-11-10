import { ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * SimpleBridgeSection: Scroll-driven transition section
 * Three-stage reveal: arrow → "You need a system" → proceed to next section
 * Uses ScrollTrigger with toggleActions to prevent reversal
 */
export default function SimpleBridgeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const systemTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !arrowRef.current || !systemTextRef.current) return;

    const ctx = gsap.context(() => {
      // Initial states - hide arrow and system text
      gsap.set(arrowRef.current, { opacity: 0, y: -20 });
      gsap.set(systemTextRef.current, { opacity: 0, y: 30 });

      // Stage 1: Reveal the arrow after initial scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'top 40%',
        onEnter: () => {
          gsap.to(arrowRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        },
        // Once triggered, don't reverse
        toggleActions: 'play none none none'
      });

      // Stage 2: Reveal "You need a system" text
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 30%',
        end: 'top 10%',
        onEnter: () => {
          gsap.to(systemTextRef.current, {
            opacity: 1,
            y: 0,
            duration: 3,
            ease: 'power3.out'
          });
        },
        // Once triggered, don't reverse
        toggleActions: 'play none none none'
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-56 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-background/95"
    >
      <div className="max-w-5xl mx-auto text-center space-y-20">
        {/* The transformation message */}
        <div className="space-y-10">
          <p className="text-4xl md:text-5xl lg:text-6xl text-muted-foreground animate-fade-in">
            You need more than another salesperson
          </p>
          <h2 
            ref={systemTextRef}
            className="text-7xl md:text-8xl lg:text-9xl font-bold gradient-text gradient-hero"
          >
            You need a system
          </h2>
        </div>

        {/* Simple bouncing arrow - reveals on scroll */}
        <div ref={arrowRef} className="flex justify-center pt-16 animate-bounce">
          <ChevronDown className="w-14 h-14 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}