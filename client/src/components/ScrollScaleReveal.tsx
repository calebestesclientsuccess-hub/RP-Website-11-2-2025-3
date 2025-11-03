import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_CONFIG, prefersReducedMotion } from "@/lib/animationConfig";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollScaleReveal: Dramatic scroll-triggered text transformation
 * 
 * Shows "You need more than another salesperson" which scales up and
 * crossfades to red "You need a system." message with pulsating effect.
 * 
 * Animation Phases:
 * 1. Growth (60%): Text scales from small to large
 * 2. Crossfade (20%): White fades out, red fades in
 * 3. Friction (20%): Holds with "stuck" feeling, pulsating
 * 
 * Triggers: Pinned when section reaches top of viewport
 * Duration: 4x viewport height of scroll
 * Dependencies: GSAP, ScrollTrigger
 */
export default function ScrollScaleReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const redTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    const redText = redTextRef.current;
    
    if (!container || !text || !redText) {
      return;
    }

    const config = ANIMATION_CONFIG.scrollScale;
    
    if (prefersReducedMotion()) {
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
        start: "top top",
        end: () => "+=" + (window.innerHeight * config.scrollDistanceMultiplier),
        scrub: config.scrub,
        pin: true,
        pinSpacing: true,
        anticipatePin: ANIMATION_CONFIG.global.scrollTrigger.anticipatePin,
        markers: ANIMATION_CONFIG.global.scrollTrigger.markers,
      }
    });

    // Phase 1: Growth - font size increases
    tl.fromTo(text, 
      {
        fontSize: config.fontSize.start,
        opacity: 1,
      },
      {
        fontSize: config.fontSize.end,
        opacity: 1,
        letterSpacing: config.letterSpacing,
        ease: config.easing.growth,
        duration: config.phases.growth,
      }
    )
    // Phase 2: Crossfade - white fades out, red fades in
    .to(text, {
      opacity: 0,
      ease: config.easing.crossfade,
      duration: config.phases.crossfade,
    })
    .fromTo(redText, 
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: config.easing.crossfade,
        duration: config.phases.crossfade,
      }, 
      "<"
    )
    // Phase 3: Friction hold - creates "stuck" feeling
    .to(redText, {
      opacity: 1,
      duration: config.phases.friction,
      ease: config.easing.friction,
    });

    // Create pulsating animation that triggers when red text is fully visible
    let pulseAnimation: gsap.core.Tween | null = null;
    
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: () => "+=" + (window.innerHeight * config.scrollDistanceMultiplier),
      scrub: false,
      onUpdate: (self) => {
        // Start pulsating after crossfade completes
        if (self.progress > config.pulse.triggerProgress && !pulseAnimation) {
          pulseAnimation = gsap.fromTo(redText, 
            {
              textShadow: config.pulse.shadows.initial,
              scale: config.pulse.scale.initial,
            },
            {
              textShadow: config.pulse.shadows.peak,
              scale: config.pulse.scale.peak,
              duration: config.pulse.duration,
              repeat: -1,
              yoyo: true,
              ease: config.pulse.easing,
            }
          );
        }
        // Stop pulsating if scrolled back up
        if (self.progress < config.pulse.triggerProgress && pulseAnimation) {
          pulseAnimation.kill();
          pulseAnimation = null;
          gsap.set(redText, {
            textShadow: config.pulse.shadows.initial,
            scale: config.pulse.scale.initial,
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
            style={{ fontSize: ANIMATION_CONFIG.scrollScale.fontSize.start }}
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
