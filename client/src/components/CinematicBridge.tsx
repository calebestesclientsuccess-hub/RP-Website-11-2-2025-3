import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import FlipBurnAnimation from './FlipBurnAnimation';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);
  const [showFlipBurn, setShowFlipBurn] = useState(false);
  const [hideFirstText, setHideFirstText] = useState(false);

  const handleAnimationComplete = () => {
    console.log('Flip & Burn animation complete, showing arrow');
    const arrow = arrowRef.current;
    const vignette = vignetteRef.current;
    const spotlight = spotlightRef.current;
    
    if (!arrow || !vignette || !spotlight) return;

    // Ease back theatre-mode
    gsap.to(vignette, {
      opacity: 0.2,
      duration: 1,
      ease: "power2.out",
    });
    gsap.to(spotlight, {
      opacity: 0.15,
      scale: 1,
      duration: 1,
      ease: "power2.out",
    });

    // Show arrow with bounce
    arrow.style.opacity = '0';
    arrow.style.display = 'block';
    arrow.style.visibility = 'visible';
    
    gsap.to(arrow, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
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

  useEffect(() => {
    const container = containerRef.current;
    const firstText = firstTextRef.current;
    const arrow = arrowRef.current;
    const vignette = vignetteRef.current;
    const spotlight = spotlightRef.current;

    if (!container || !firstText || !arrow || !vignette || !spotlight) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show simplified version without animations
      setHideFirstText(true);
      setShowFlipBurn(true);
      gsap.set(arrow, { opacity: 1, y: 0 });
      return;
    }

    // Initial states
    gsap.set(arrow, { opacity: 0, y: -10 });
    gsap.set(firstText, { opacity: 1 });
    gsap.set(container, { backgroundColor: "rgba(0, 0, 0, 0)" });
    gsap.set(vignette, { opacity: 0 });
    gsap.set(spotlight, { opacity: 0, scale: 1.5 });

    const ctx = gsap.context(() => {
      // Create scroll-triggered animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          markers: false,
          onUpdate: (self) => {
            // Trigger Flip & Burn animation at 60% scroll progress
            if (self.progress >= 0.6 && !hasTriggeredRef.current) {
              hasTriggeredRef.current = true;
              console.log('Triggering Flip & Burn animation at scroll progress:', self.progress);
              
              // Peak theatre-mode intensity during animation
              gsap.to(vignette, {
                opacity: 0.5,
                duration: 0.5,
                ease: "power2.inOut",
              });
              gsap.to(spotlight, {
                opacity: 0.4,
                scale: 0.8,
                duration: 0.5,
                ease: "power2.inOut",
              });
              
              // Show the Flip & Burn animation
              setShowFlipBurn(true);
              
              // Hide first text after a brief moment
              setTimeout(() => {
                setHideFirstText(true);
              }, 300);
            }
          },
        },
      });

      // Progressive theatre-mode with scroll
      scrollTl
        .to(vignette, {
          opacity: 0.15,
          duration: 0.3,
          ease: "power2.in",
        }, 0)
        .to(spotlight, {
          opacity: 0.1,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.in",
        }, 0)
        // Subtle scale on first text as we approach trigger point
        .to(firstText, {
          scale: 1.05,
          duration: 0.5,
          ease: "power2.inOut",
        }, 0.2);

      // Hide arrow when user scrolls
      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
        if (arrow && hasTriggeredRef.current) {
          clearTimeout(scrollTimeout);
          gsap.to(arrow, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      data-testid="section-cinematic-bridge"
    >
      {/* Theatre-mode vignette effect */}
      <div
        ref={vignetteRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%)',
          zIndex: 2,
        }}
      />
      
      {/* Theatre-mode spotlight effect */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          zIndex: 3,
        }}
      />

      <div className="text-center max-w-5xl mx-auto px-4 relative z-10">
        {/* Initial text that will be burned */}
        <h2
          ref={firstTextRef}
          className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-16 leading-tight transition-opacity duration-300"
          style={{ 
            transformStyle: 'preserve-3d',
            opacity: hideFirstText ? 0 : 1,
            display: hideFirstText ? 'none' : 'block'
          }}
        >
          You need more than another salesperson.
        </h2>
        
        {/* Flip & Burn animation container */}
        {showFlipBurn && (
          <FlipBurnAnimation 
            onComplete={handleAnimationComplete}
          />
        )}
      </div>
      
      {/* Minimalist red bouncing arrow */}
      <div
        ref={arrowRef}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))',
          zIndex: 9999,
          opacity: 0,
          width: '60px',
          height: '60px',
        }}
        data-testid="red-arrow"
      >
        <ChevronDown 
          className="w-12 h-12 text-primary" 
          strokeWidth={2}
        />
      </div>
    </section>
  );
}