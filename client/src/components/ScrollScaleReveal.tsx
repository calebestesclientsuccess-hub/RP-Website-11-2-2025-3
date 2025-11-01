import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollScaleReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const redTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    const redText = redTextRef.current;
    
    if (!container || !text || !redText) {
      console.log("ScrollScaleReveal: Missing refs", { container, text, redText });
      return;
    }
    console.log("ScrollScaleReveal: Initializing animation");

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
        start: "top top", // Pin when section reaches top
        end: () => "+=" + (window.innerHeight * 4), // 4x viewport height for friction
        scrub: 1, // Smooth scrubbing
        pin: true, // Pin the container
        pinSpacing: true,
        anticipatePin: 1,
        markers: false, // Set to true to debug trigger points
        onUpdate: (self) => {
          console.log(`ScrollScaleReveal progress: ${self.progress.toFixed(2)}`);
        },
      }
    });

    // Phase 1: Grow fontSize to emphasized size (moderate growth for clean wrapping)
    // Duration 6 = 60% of timeline
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
        duration: 6, // 60% of timeline
      }
    )
    // Phase 2: Crossfade - white completely fades out, red completely fades in
    // Duration 2 = 20% of timeline
    .to(text, {
      opacity: 0,
      ease: "power2.inOut",
      duration: 2, // 20% of timeline
    })
    .fromTo(redText, 
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: "power2.inOut",
        duration: 2, // 20% of timeline
      }, 
      "<" // Start at same time as white fadeout
    )
    // Phase 3: Hold with friction - force user to stay with the message
    // Duration 2 = 20% of timeline (creates the "stuck" feeling)
    .to(redText, {
      opacity: 1, // Keep it visible
      duration: 2, // Hold for 20% of scroll
      ease: "none", // No easing, just hold
    });

    // Create pulsating animation that triggers when red text is fully visible
    let pulseAnimation: gsap.core.Tween | null = null;
    
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: () => "+=" + (window.innerHeight * 4),
      scrub: false,
      onUpdate: (self) => {
        // Start pulsating when we're past 70% (after crossfade completes)
        if (self.progress > 0.70 && !pulseAnimation) {
          pulseAnimation = gsap.fromTo(redText, 
            {
              textShadow: "0 0 40px rgba(220, 38, 38, 0.3), 0 0 80px rgba(220, 38, 38, 0.15)",
              scale: 1,
            },
            {
              textShadow: "0 0 80px rgba(220, 38, 38, 0.9), 0 0 160px rgba(220, 38, 38, 0.6), 0 0 240px rgba(220, 38, 38, 0.4)",
              scale: 1.08,
              duration: 1.2,
              repeat: -1,
              yoyo: true,
              ease: "power2.inOut",
            }
          );
        }
        // Stop pulsating if scrolled back up
        if (self.progress < 0.70 && pulseAnimation) {
          pulseAnimation.kill();
          pulseAnimation = null;
          gsap.set(redText, {
            textShadow: "0 0 40px rgba(220, 38, 38, 0.3), 0 0 80px rgba(220, 38, 38, 0.15)",
            scale: 1,
          });
        }
      },
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
      data-testid="section-scroll-scale-reveal"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
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
