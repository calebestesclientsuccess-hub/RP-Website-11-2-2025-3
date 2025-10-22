import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import ParticleDisintegration from './ParticleDisintegration';

gsap.registerPlugin(ScrollTrigger);

export default function CinematicBridge() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLHeadingElement>(null);
  const secondTextRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [hideSystemText, setHideSystemText] = useState(false);

  const handleDisintegrationComplete = () => {
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

    // Show arrow after disintegration
    gsap.to(arrow, {
      opacity: 1,
      y: 0,
      duration: 0.6,
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

  useEffect(() => {
    const container = containerRef.current;
    const firstText = firstTextRef.current;
    const secondText = secondTextRef.current;
    const arrow = arrowRef.current;
    const vignette = vignetteRef.current;
    const spotlight = spotlightRef.current;

    if (!container || !firstText || !secondText || !arrow || !vignette || !spotlight) return;

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
    gsap.set(secondText, { opacity: 0, y: 20, scale: 0.8 });
    gsap.set(arrow, { opacity: 0, y: -10 });
    gsap.set(firstText, { opacity: 1 });
    gsap.set(container, { backgroundColor: "rgba(0, 0, 0, 0)" });
    gsap.set(vignette, { opacity: 0 });
    gsap.set(spotlight, { opacity: 0, scale: 1.5 });

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
          onUpdate: (self) => {
            // Trigger disintegration when scroll reaches the end
            if (self.progress >= 0.95 && !hasTriggeredRef.current) {
              hasTriggeredRef.current = true;
              
              // Small pause before disintegration starts
              setTimeout(() => {
                setIsDisintegrating(true);
                
                // Hide the actual text slightly after disintegration starts
                setTimeout(() => {
                  setHideSystemText(true);
                  
                  // Peak theatre-mode intensity during disintegration
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
                }, 200);
              }, 1000); // 1 second pause after scroll reaches end
            }
          },
        },
      });

      // Scroll-based animations with progressive theatre-mode
      scrollTl
      // Start with subtle vignette (10-15%)
      .to(vignette, {
        opacity: 0.15,
        duration: 0.2,
        ease: "power2.in",
      }, 0)
      .to(spotlight, {
        opacity: 0.1,
        scale: 1.2,
        duration: 0.2,
        ease: "power2.in",
      }, 0)
      // Intensify during text swap (30-40%)
      .to(vignette, {
        opacity: 0.4,
        duration: 0.3,
        ease: "power2.inOut",
      }, 0.2)
      .to(spotlight, {
        opacity: 0.3,
        scale: 1,
        duration: 0.3,
        ease: "power2.inOut",
      }, 0.2)
      // Fade out first text
      .to(firstText, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.inOut",
      }, 0.2)
      // Scale up second text
      .to(secondText, {
        opacity: 1,
        y: 0,
        scale: 1.2,
        duration: 0.5,
        ease: "power2.out",
      }, 0.3);

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

      // Cleanup
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
          style={{ 
            transformStyle: 'preserve-3d',
            opacity: hideSystemText ? 0 : 1,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          You need a system
        </div>
      </div>

      {/* Particle disintegration effect */}
      <ParticleDisintegration
        isActive={isDisintegrating}
        textElement={secondTextRef.current}
        onComplete={handleDisintegrationComplete}
        duration={1500}
      />
      
      {/* Minimalist red bouncing arrow */}
      <div
        ref={arrowRef}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.4))',
          zIndex: 20,
        }}
        data-testid="arrow-scroll-indicator"
      >
        <ChevronDown 
          className="w-10 h-10 text-primary" 
          strokeWidth={1}
        />
      </div>
    </section>
  );
}