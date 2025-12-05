/**
 * DesktopBridge - Cinematic Scroll-Driven Experience
 * 
 * Philosophy: Full GSAP animation with scroll hijacking
 * Complex character-by-character typing, zoom effects, embers
 * 
 * NO isMobile checks - this component assumes desktop always
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { generateEmbers } from './shared/particles';
import { STANDARD_GLOW_STYLE, RED_GLOW_SHADOW } from './shared/constants';

gsap.registerPlugin(ScrollTrigger);

export default function DesktopBridge() {
  // Section and container refs
  const sectionRef = useRef<HTMLElement>(null);
  const whiteContainerRef = useRef<HTMLDivElement>(null);
  const redContainerRef = useRef<HTMLDivElement>(null);
  
  // White text refs (character animation)
  const whiteTextRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  
  // Red text refs (word-by-word)
  const word1Ref = useRef<HTMLSpanElement>(null);
  const word2Ref = useRef<HTMLSpanElement>(null);
  const word3Ref = useRef<HTMLSpanElement>(null);
  const word4Ref = useRef<HTMLSpanElement>(null);

  // Atmospheric effect refs
  const conicFloodRef = useRef<HTMLDivElement>(null);
  const heatDistortionRef = useRef<HTMLDivElement>(null);
  const emberContainerRef = useRef<HTMLDivElement>(null);
  const pageIlluminationRef = useRef<HTMLDivElement>(null);

  // Safari detection - reduce embers for better performance
  const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Desktop uses 350 embers on Chrome, 250 on Safari for smooth performance
  const embers = useMemo(() => generateEmbers(isSafari ? 250 : 350), [isSafari]);

  const [animationsReady, setAnimationsReady] = useState(false);

  // Initialize animations after idle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | undefined;

    const rafId = requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        const idleId = (window as any).requestIdleCallback(
          () => setAnimationsReady(true), 
          { timeout: 200 }
        );
        cleanup = () => (window as any).cancelIdleCallback?.(idleId);
      } else {
        const timeoutId = window.setTimeout(() => setAnimationsReady(true), 120);
        cleanup = () => clearTimeout(timeoutId);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  // Defensive visibility: Populate text if animations fail to load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!line1Ref.current || !line2Ref.current || !line3Ref.current) return;
    
    // Populate white text as fallback
    if (line1Ref.current.innerHTML === "") {
      line1Ref.current.textContent = 'You need more';
    }
    if (line2Ref.current.innerHTML === "") {
      line2Ref.current.textContent = 'than just';
    }
    if (line3Ref.current.innerHTML === "") {
      line3Ref.current.textContent = 'another salesperson.';
    }
    
    // Make sure white container is visible
    if (whiteContainerRef.current) {
      whiteContainerRef.current.style.opacity = '1';
    }
    // Note: Do NOT force redContainer visible - it would overlap
  }, [animationsReady]);

  // Main animation effect
  useEffect(() => {
    if (!animationsReady) return;

    // Check all refs are present
    if (
      !sectionRef.current ||
      !whiteContainerRef.current ||
      !redContainerRef.current ||
      !whiteTextRef.current ||
      !line1Ref.current ||
      !line2Ref.current ||
      !line3Ref.current ||
      !word1Ref.current ||
      !word2Ref.current ||
      !word3Ref.current ||
      !word4Ref.current ||
      !conicFloodRef.current ||
      !heatDistortionRef.current ||
      !emberContainerRef.current ||
      !pageIlluminationRef.current
    ) {
      console.warn('[DesktopBridge] Missing refs, animation disabled');
      return;
    }

    const lines = [
      { ref: line1Ref, text: 'You need more' },
      { ref: line2Ref, text: 'than just' },
      { ref: line3Ref, text: 'another salesperson.' },
    ];

    const wordRefs = [word1Ref.current, word2Ref.current, word3Ref.current, word4Ref.current];

    // Populate character spans for typing effect
    const setWhiteTextContent = (mode: 'characters' | 'static') => {
      lines.forEach(({ ref, text }) => {
        if (!ref.current) return;
        ref.current.innerHTML = '';

        if (mode === 'characters') {
          text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.opacity = '0';
            span.style.display = 'inline';
            ref.current?.appendChild(span);
          });
        } else {
          ref.current.textContent = text;
          (ref.current as HTMLElement).style.opacity = '1';
        }
      });
    };

    // Reveal line 1 immediately (it's already visible on load)
    const revealLine1Immediately = () => {
      if (!line1Ref.current) return;
      Array.from(line1Ref.current.children).forEach((child: Element) => {
        (child as HTMLElement).style.opacity = '1';
      });
    };

    // Setup GSAP context
    const ctx = gsap.context(() => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Simple static fallback
        setWhiteTextContent('static');
        gsap.set(whiteContainerRef.current, { opacity: 1 });
        gsap.set(redContainerRef.current, { opacity: 1 });
        gsap.set(wordRefs, { opacity: 1, y: 0, scale: 1 });
        gsap.set(
          [conicFloodRef.current, heatDistortionRef.current, emberContainerRef.current, pageIlluminationRef.current],
          { opacity: 0.25 }
        );
        return;
      }

      // Full desktop timeline
      setWhiteTextContent('characters');
      revealLine1Immediately();

      gsap.set(whiteContainerRef.current, { scale: 1, opacity: 1 });
      gsap.set(redContainerRef.current, { opacity: 0 }); // Hidden initially
      gsap.set(wordRefs, { opacity: 0, scale: 0.7, y: 100 });
      gsap.set(conicFloodRef.current, { opacity: 0, scale: 0.5, filter: 'blur(20px)' });
      gsap.set(heatDistortionRef.current, { opacity: 0 });
      gsap.set(emberContainerRef.current, { opacity: 0 });
      gsap.set(pageIlluminationRef.current, { opacity: 0 });

      const masterTimeline = gsap.timeline();
      
      // Animate line 2 & 3 characters
      const line2Chars = Array.from(line2Ref.current?.children || []);
      const line3Chars = Array.from(line3Ref.current?.children || []);
      const totalChars = line2Chars.length + line3Chars.length;
      let charIndex = 0;

      line2Chars.forEach((span) => {
        const startTime = (charIndex / totalChars) * 30;
        masterTimeline.to(span, { opacity: 1, duration: 0.1, ease: 'none' }, startTime);
        charIndex++;
      });

      line3Chars.forEach((span) => {
        const startTime = (charIndex / totalChars) * 30;
        masterTimeline.to(span, { opacity: 1, duration: 0.1, ease: 'none' }, startTime);
        charIndex++;
      });

      // Zoom white text
      const baseZoom = window.innerWidth < 1024 ? 1.6 : 1.8;
      masterTimeline.to(whiteContainerRef.current, {
        scale: baseZoom,
        duration: 30,
        ease: 'power1.out',
      }, 0);

      // Fade out white text
      masterTimeline.to(whiteContainerRef.current, {
        scale: 6,
        opacity: 0,
        duration: 20,
        ease: 'power2.in',
      }, 30);

      // Reveal red container
      masterTimeline.to(redContainerRef.current, {
        opacity: 1,
        duration: 10,
        ease: 'power2.in',
      }, 45);

      // Animate red words
      const wordTimings = [
        { wordRef: word1Ref.current, start: 55, duration: 35 },
        { wordRef: word2Ref.current, start: 62, duration: 35 },
        { wordRef: word3Ref.current, start: 69, duration: 35 },
        { wordRef: word4Ref.current, start: 76, duration: 40 },
      ];

      wordTimings.forEach(({ wordRef, start, duration }) => {
        masterTimeline.to(wordRef, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration,
          ease: 'back.out(1.7)',
        }, start);
      });

      masterTimeline.to({}, { duration: 4 }, 85);

      // Atmospheric effects
      masterTimeline.to(heatDistortionRef.current, {
        opacity: 1,
        duration: 6,
        ease: 'power2.out',
      }, 89);

      masterTimeline.to(conicFloodRef.current, {
        opacity: 0.6,
        scale: 1,
        filter: 'blur(40px)',
        duration: 10,
        ease: 'power3.out',
      }, 89);

      masterTimeline.to(emberContainerRef.current, {
        opacity: 1,
        duration: 10,
        ease: 'power2.out',
      }, 91);

      masterTimeline.to(wordRefs, {
        textShadow: RED_GLOW_SHADOW,
        webkitTextStrokeColor: '#ff0000',
        duration: 10,
        ease: 'power2.out',
      }, 89);

      masterTimeline.to(pageIlluminationRef.current, {
        opacity: 0.5,
        duration: 10,
        ease: 'power2.out',
      }, 93);

      // Attach to scroll
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=600vh', // Reduced from 1190vh for better pacing and Safari performance
        pin: true,
        pinSpacing: true,
        scrub: isSafari ? 1 : 0.5, // Slower scrub on Safari for smoother rendering
        animation: masterTimeline,
      });
    }, sectionRef);

    // Refresh ScrollTrigger after setup
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationsReady, embers]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 bg-zinc-950"
      style={{ overflow: 'visible', zIndex: 0 }}
      data-testid="desktop-bridge"
    >
      {/* Grain Dithering */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          zIndex: 50,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Heat Distortion SVG Filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="heat-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015 0.03" 
              numOctaves="3" 
              seed="1"
            >
              <animate 
                attributeName="baseFrequency" 
                values="0.015 0.03;0.02 0.04;0.015 0.03" 
                dur="4s" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* White Text: "You need more than just another salesperson." */}
      <div 
        ref={whiteContainerRef}
        className="flex items-center justify-center z-10 transition-opacity duration-300 absolute inset-0 pointer-events-none"
        style={{ opacity: 1 }}
      >
        <div className="max-w-2xl text-center px-6">
          <p 
            ref={whiteTextRef}
            className="text-xl md:text-2xl lg:text-3xl text-white font-semibold leading-relaxed"
          >
            <span ref={line1Ref}></span><br />
            <span ref={line2Ref}></span><br />
            <span ref={line3Ref}></span>
          </p>
        </div>
      </div>

      {/* Red Text Container: "You need a system." */}
      <div 
        ref={redContainerRef}
        className="flex flex-col items-center justify-center z-20 transition-opacity duration-300 absolute inset-0 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="relative">
          
          {/* Heat Distortion Zone */}
          <div 
            ref={heatDistortionRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', 
              top: '0%', 
              transform: 'translate(-50%, -100%)',
              width: '150%',
              height: '120px',
              background: 'linear-gradient(to top, rgba(184, 13, 46, 0.05) 0%, transparent 100%)',
              filter: 'url(#heat-distortion)',
              zIndex: 1
            }}
          />

          {/* Atmospheric Light System */}
          
          {/* Layer 1: Core */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '150%',
              height: '150px',
              background: 'radial-gradient(circle at center, rgba(255, 0, 0, 0.6) 0%, rgba(255, 50, 50, 0.4) 20%, rgba(255, 80, 60, 0.3) 40%, rgba(184, 13, 46, 0.1) 60%, rgba(184, 13, 46, 0) 80%)',
              filter: 'blur(60px)',
              zIndex: -1,
              position: 'absolute'
            }}
          />

          {/* Layer 2: Conic Flood */}
          <div 
            ref={conicFloodRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, 0)',
              width: '150vw',
              height: '500vh',
              background: 'conic-gradient(from 120deg at 50% 0%, rgba(184, 13, 46, 0) 0deg, rgba(255, 50, 30, 0.04) 20deg, rgba(255, 80, 50, 0.12) 40deg, rgba(255, 100, 60, 0.18) 60deg, rgba(255, 80, 50, 0.12) 80deg, rgba(255, 50, 30, 0.04) 100deg, rgba(184, 13, 46, 0) 120deg)',
              filter: 'blur(80px)',
              mixBlendMode: 'screen', 
              zIndex: -4,
              position: 'absolute'
            }}
          />

          {/* Layer 3: Atmospheric Scatter */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '30%',
              transform: 'translate(-50%, -20%)',
              width: '650%',
              height: '500vh',
              background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(120, 9, 30, 0.16) 0%, rgba(100, 8, 25, 0.1) 25%, rgba(80, 6, 20, 0.06) 50%, rgba(45, 4, 12, 0.015) 75%, transparent 100%)',
              filter: 'blur(250px)',
              zIndex: -6,
              position: 'absolute'
            }}
          />

          {/* Layer 4: Far Scatter */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '0%',
              transform: 'translate(-50%, 0)',
              width: '800%',
              height: '800vh',
              background: 'radial-gradient(ellipse 90% 90% at 50% 20%, rgba(90, 7, 23, 0.1) 0%, rgba(70, 5, 18, 0.06) 30%, rgba(40, 3, 10, 0.018) 60%, rgba(20, 2, 5, 0.005) 90%, transparent 100%)',
              filter: 'blur(300px)',
              zIndex: -7,
              position: 'absolute'
            }}
          />

          {/* Layer 5: Ambient Base */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '100vw', height: '500vh',
              background: 'rgba(20, 2, 5, 0.02)',
              zIndex: -8,
              position: 'absolute'
            }}
          />

          {/* Embers */}
          <div 
            ref={emberContainerRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', 
              top: '50%',
              transform: 'translate(-50%, 0)',
              width: '200%', 
              height: '400vh',
              zIndex: 5,
              position: 'absolute'
            }}
          >
            {embers.map((ember) => (
              <div
                key={ember.id}
                className={`absolute rounded-full ember-particle ${ember.hasSparks ? 'ember-spark ember-crackle' : ''}`}
                style={{
                  left: `${ember.left}%`,
                  top: `${ember.startY}vh`,
                  width: `${ember.size}px`,
                  height: `${ember.size}px`,
                  background: `radial-gradient(circle, rgba(255, 150, 50, 1) 0%, rgba(184, 13, 46, 0.8) 50%, transparent 100%)`,
                  filter: 'blur(1px)',
                  willChange: 'transform',
                  transform: 'translate3d(0,0,0)',
                  '--drift': `${ember.drift}px`,
                  '--spread': `${ember.spread}px`,
                  '--crackle-offset': `${ember.crackleOffset}s`,
                  animationDuration: `${ember.duration}s`,
                  animationDelay: `${ember.delay}s`,
                } as React.CSSProperties}
              >
                {ember.hasSparks && (
                  <>
                    <div className="mini-spark mini-spark-1" />
                    <div className="mini-spark mini-spark-2" />
                    <div className="mini-spark mini-spark-3" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Red Text */}
          <div className="relative">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-black leading-tight text-center max-w-4xl mx-auto relative z-20">
              <span 
                ref={word1Ref} 
                className="inline-block"
                style={{ ...STANDARD_GLOW_STYLE, marginRight: '0.25em' }}
              >
                You
              </span>
              <span 
                ref={word2Ref} 
                className="inline-block"
                style={{ ...STANDARD_GLOW_STYLE, marginRight: '0.25em' }}
              >
                need
              </span>
              <span 
                ref={word3Ref} 
                className="inline-block"
                style={{ ...STANDARD_GLOW_STYLE, marginRight: '0.25em' }}
              >
                a
              </span>
              <span 
                ref={word4Ref} 
                className="inline-block"
                style={{ ...STANDARD_GLOW_STYLE, textTransform: 'lowercase' }}
              >
                system.
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Ember Animation CSS */}
      <style>{`
        .ember-particle {
          animation: ember-fall ease-out infinite;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .ember-spark {
          animation: ember-fall ease-out infinite, 
                      spark-flicker 0.15s ease-in-out infinite alternate;
        }
        
        .ember-crackle {
          animation: ember-fall ease-out infinite, 
                      spark-flicker 0.15s ease-in-out infinite alternate,
                      crackle-jitter 0.3s ease-in-out infinite;
          animation-delay: 0s, var(--crackle-offset, 0s), var(--crackle-offset, 0s);
        }
        
        @keyframes ember-fall {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          30% {
            transform: translateY(120vh) translateX(calc(var(--drift, 15px) * 0.3 + var(--spread, 20px) * 0.2));
            opacity: 0.9;
          }
          60% {
            transform: translateY(240vh) translateX(calc(var(--drift, 15px) * 0.6 + var(--spread, 20px) * 0.6));
            opacity: 0.7;
          }
          100% {
            transform: translateY(400vh) translateX(calc(var(--drift, 15px) + var(--spread, 20px)));
            opacity: 0;
          }
        }
        
        @keyframes spark-flicker {
          0% {
            filter: blur(1px) brightness(1) saturate(1);
            box-shadow: 0 0 2px rgba(255, 100, 30, 0.6);
          }
          50% {
            filter: blur(1.5px) brightness(1.4) saturate(1.3);
            box-shadow: 0 0 6px rgba(255, 150, 50, 0.9), 0 0 3px rgba(255, 200, 100, 0.7);
          }
          100% {
            filter: blur(1px) brightness(0.9) saturate(0.8);
            box-shadow: 0 0 1px rgba(255, 80, 20, 0.4);
          }
        }
        
        @keyframes crackle-jitter {
          0%, 100% { 
            transform: translateY(var(--fall-y, 0)) translateX(var(--fall-x, 0)) rotate(0deg) scale(1);
          }
          25% { 
            transform: translateY(var(--fall-y, 0)) translateX(var(--fall-x, 0)) rotate(-5deg) scale(1.1);
          }
          50% { 
            transform: translateY(var(--fall-y, 0)) translateX(var(--fall-x, 0)) rotate(3deg) scale(0.95);
          }
          75% { 
            transform: translateY(var(--fall-y, 0)) translateX(var(--fall-x, 0)) rotate(-2deg) scale(1.05);
          }
        }
        
        .mini-spark {
          position: absolute;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, rgba(255, 200, 100, 1) 0%, rgba(255, 150, 50, 0.8) 50%, transparent 100%);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
        }
        
        .mini-spark-1 {
          animation: mini-spark-burst-1 1.2s ease-out infinite;
          animation-delay: 0s;
        }
        
        .mini-spark-2 {
          animation: mini-spark-burst-2 1.4s ease-out infinite;
          animation-delay: 0.3s;
        }
        
        .mini-spark-3 {
          animation: mini-spark-burst-3 1.1s ease-out infinite;
          animation-delay: 0.6s;
        }
        
        @keyframes mini-spark-burst-1 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(-15px, 25px) scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes mini-spark-burst-2 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(18px, 30px) scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes mini-spark-burst-3 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(-8px, -20px) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>

      {/* Global Page Illumination */}
      <div
        ref={pageIlluminationRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 0, 0, 0.15) 0%, rgba(255, 0, 0, 0.05) 40%, transparent 70%)',
          opacity: 0,
          zIndex: -10,
          mixBlendMode: 'screen'
        }}
      />
    </section>
  );
}

