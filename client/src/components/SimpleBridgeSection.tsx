import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SimpleBridgeSection: THE REVELATION
 * 
 * A scroll-driven narrative that builds anticipation:
 * 1. "You need more than just another salesperson." — Types out, zooms, flies past
 * 2. "You need a system." — Settles with gravity, becomes a directional light source
 * 3. The red light floods downward as a "Red Carpet" illuminating the next section
 */
export default function SimpleBridgeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const whiteContainerRef = useRef<HTMLDivElement>(null);
  const redContainerRef = useRef<HTMLDivElement>(null);
  
  const whiteTextRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  
  // Per-word refs for "You need a system." - Main Text
  const word1Ref = useRef<HTMLSpanElement>(null);
  const word2Ref = useRef<HTMLSpanElement>(null);
  const word3Ref = useRef<HTMLSpanElement>(null);
  const word4Ref = useRef<HTMLSpanElement>(null);

  // Light system refs
  const conicFloodRef = useRef<HTMLDivElement>(null);
  const heatDistortionRef = useRef<HTMLDivElement>(null);
  const emberContainerRef = useRef<HTMLDivElement>(null);
  const pageIlluminationRef = useRef<HTMLDivElement>(null);

  // Embers
  // EMBER LAWS:
  // 1. All embers must fall - none can be static
  // 2. The word "system" is the heat source - embers emanate ONLY from it
  // 3. Use animation delay to distribute embers along fall path (not static positioning)
  const embers = useMemo(() => 
    Array.from({ length: 350 }, (_, i) => {
      // "system." is centered on the bottom line at 50%
      const systemLeft = 50;
      const systemSpread = 7;
      
      // Use prime-based chaos to break up visible patterns
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
      const p1 = primes[i % primes.length];
      const p2 = primes[(i + 5) % primes.length];
      const p3 = primes[(i + 11) % primes.length];
      
      // Horizontal: chaotic spread around "system"
      const left = systemLeft + (((i * p1 * 1.7) % 100) / 100 * systemSpread * 2) - systemSpread;
      
      // Vertical: ALL embers spawn near the text - animation handles distribution
      const spawnHeight = 4 + ((i * p2 * 0.43) % 5);
      
      // Varied durations (25-55s range for slow, graceful fall)
      const duration = 25 + ((i * p3) % 30);
      
      // KEY: Delay spans FULL duration - this distributes embers along entire fall path
      // Each ember starts at a different point in its animation cycle
      const delay = -((i * p1 * p2 * 0.017) % duration);
      
      return {
        id: i,
        left: left,
        startY: spawnHeight,
        delay: delay,
        duration: duration,
        size: 3 + ((i * p1) % 6),
        drift: (i % 2 === 0 ? 1 : -1) * (12 + ((i * p2) % 4) * 6),
        spread: (i % 2 === 0 ? 1 : -1) * (35 + ((i * p3) % 7) * 15),
        hasSparks: i % 3 === 0,
        crackleOffset: ((i * p1) % 10) * 0.15,
      };
    }), []
  );

  useEffect(() => {
    // Safety check - all required refs must exist
    if (!sectionRef.current || !whiteContainerRef.current || !redContainerRef.current ||
        !whiteTextRef.current || !line1Ref.current || !line2Ref.current || !line3Ref.current || 
        !word1Ref.current || !word2Ref.current || !word3Ref.current || !word4Ref.current ||
        !conicFloodRef.current ||
        !heatDistortionRef.current || !emberContainerRef.current || !pageIlluminationRef.current) {
      console.warn('SimpleBridgeSection: Missing refs, animation disabled');
      return;
    }

    const isMobile = window.innerWidth < 768;
    const scrollDistance = isMobile ? 910 : 1190; // 40% slower scroll animation

    // === SETUP: White text character spans ===
    const lines = [
      { ref: line1Ref, text: "You need more" },
      { ref: line2Ref, text: "than just" },
      { ref: line3Ref, text: "another salesperson." }
    ];

    lines.forEach(({ ref, text }) => {
      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.display = 'inline';
        return span;
      });
      
      if (ref.current) {
        ref.current.innerHTML = '';
        chars.forEach(span => ref.current?.appendChild(span));
      }
    });

    // Line 1 starts visible
    if (line1Ref.current) {
      Array.from(line1Ref.current.children).forEach((child: Element) => {
        (child as HTMLElement).style.opacity = '1';
      });
    }

    // Collect refs into arrays
    const wordRefs = [word1Ref.current, word2Ref.current, word3Ref.current, word4Ref.current];

    const ctx = gsap.context(() => {
      // === INITIAL STATES ===
      gsap.set(whiteContainerRef.current, { scale: 1, opacity: 1 });
      gsap.set(redContainerRef.current, { opacity: 1 });
      
      // Red text starts hidden
      wordRefs.forEach((word) => {
        gsap.set(word, { opacity: 0, scale: 0.7, y: 100 });
      });
      
      // Light layers start hidden
      gsap.set(conicFloodRef.current, { opacity: 0, scale: 0.5, filter: 'blur(20px)' });
      gsap.set(heatDistortionRef.current, { opacity: 0 });
      gsap.set(emberContainerRef.current, { opacity: 0 });
      gsap.set(pageIlluminationRef.current, { opacity: 0 });

      // === MASTER TIMELINE (Scroll-Driven) ===
      const masterTimeline = gsap.timeline();

      // --- PHASE 1: TYPING + ZOOM (0% → 30%) ---
      const line2Chars = Array.from(line2Ref.current?.children || []);
      const line3Chars = Array.from(line3Ref.current?.children || []);
      const totalChars = line2Chars.length + line3Chars.length;
      let charIndex = 0;

      // Type out line 2
      line2Chars.forEach((span) => {
        const startTime = (charIndex / totalChars) * 30;
        masterTimeline.to(span, { opacity: 1, duration: 0.1, ease: 'none' }, startTime);
        charIndex++;
      });

      // Type out line 3
      line3Chars.forEach((span) => {
        const startTime = (charIndex / totalChars) * 30;
        masterTimeline.to(span, { opacity: 1, duration: 0.1, ease: 'none' }, startTime);
        charIndex++;
      });

      // Zoom while typing
      masterTimeline.to(whiteContainerRef.current, {
        scale: isMobile ? 1.5 : 1.8,
        duration: 30,
        ease: 'power1.out'
      }, 0);

      // --- PHASE 2: FLY PAST (30% → 50%) ---
      masterTimeline.to(whiteContainerRef.current, {
        scale: 6,
        opacity: 0,
        duration: 20,
        ease: 'power2.in'
      }, 30);

      // --- PHASE 3: GRAVITATIONAL SETTLING (55% → 85%) ---
      const wordTimings = [
        { wordRef: word1Ref.current, start: 55, duration: 35 },
        { wordRef: word2Ref.current, start: 62, duration: 35 },
        { wordRef: word3Ref.current, start: 69, duration: 35 },
        { wordRef: word4Ref.current, start: 76, duration: 40 },
      ];

      wordTimings.forEach(({ wordRef, start, duration }) => {
        // Main glow layer
        masterTimeline.to(wordRef, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: duration,
          ease: 'back.out(1.7)'
        }, start);
      });

      // --- PHASE 3.5: HOLD & FOCUS (85% → 89%) ---
      // Let the words settle and hold the viewer's attention
      masterTimeline.to({}, { duration: 4 }, 85);

      // --- PHASE 4: RED GLOW IGNITION (89% → 93%) ---
      
      // Heat distortion
      masterTimeline.to(heatDistortionRef.current, {
        opacity: 1,
        duration: 6,
        ease: 'power2.out'
      }, 89);

      // Light cone bloom
      masterTimeline.to(conicFloodRef.current, {
        opacity: 0.6,
        scale: 1,
        filter: 'blur(40px)',
        duration: 10,
        ease: 'power3.out'
      }, 89);

      // Embers start falling
      masterTimeline.to(emberContainerRef.current, {
        opacity: 1,
        duration: 10,
        ease: 'power2.out'
      }, 91);

      // Text red glow intensifies
      const redGlow = `
        0 0 8px rgba(0, 0, 0, 0.9),
        0 0 2px #ff0000,
        0 0 10px #ff0000,
        0 0 30px #ff0000,
        0 0 60px #cc0000,
        0 0 100px #990000
      `;

      masterTimeline.to(wordRefs, {
        textShadow: redGlow,
        webkitTextStrokeColor: '#ff0000',
        duration: 10,
        ease: 'power2.out'
      }, 89);

      // Page illumination
      masterTimeline.to(pageIlluminationRef.current, {
        opacity: 0.5,
        duration: 10,
        ease: 'power2.out'
      }, 93);

      // === SCROLL TRIGGER ===
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${scrollDistance}vh`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        animation: masterTimeline
      });

    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // RED GLOW STYLE - Fire-filled Body, Red Stroke, Red Glow
  const standardGlow = {
    color: '#ff3300',
    WebkitTextStroke: '2px #ff0000',
    willChange: 'text-shadow, transform',
    transform: 'translateZ(0)',
    textShadow: `
      0 0 8px rgba(0, 0, 0, 0.9),
      0 0 2px #ff0000,
      0 0 10px #ff0000,
      0 0 30px #ff0000,
      0 0 60px #cc0000,
      0 0 100px #990000
    `
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 bg-zinc-950"
      style={{ overflow: 'visible', zIndex: 0 }}
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
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
      >
        <div className="max-w-2xl text-center">
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
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
      >
        <div className="relative">
          
          {/* Heat Distortion Zone */}
          <div 
            ref={heatDistortionRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '0%', transform: 'translate(-50%, -100%)',
              width: '150%', height: '120px',
              background: 'linear-gradient(to top, rgba(184, 13, 46, 0.05) 0%, transparent 100%)',
              filter: 'url(#heat-distortion)',
              zIndex: 1
            }}
          />

          {/* === ATMOSPHERIC LIGHT SYSTEM === */}
          
          {/* Layer 1: The Core (Intense Red Ignition) */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '150%', height: '150px',
              background: 'radial-gradient(circle at center, rgba(255, 0, 0, 0.6) 0%, rgba(255, 50, 50, 0.4) 20%, rgba(255, 80, 60, 0.3) 40%, rgba(184, 13, 46, 0.1) 60%, rgba(184, 13, 46, 0) 80%)',
              filter: 'blur(60px)',
              zIndex: -1
            }}
          />

          {/* Layer 2: The Haze (Volumetric Cone) - THE MAIN EVENT */}
          <div 
            ref={conicFloodRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, 0)',
              width: '150vw', height: '500vh',
              background: 'conic-gradient(from 120deg at 50% 0%, rgba(184, 13, 46, 0) 0deg, rgba(255, 50, 30, 0.04) 20deg, rgba(255, 80, 50, 0.12) 40deg, rgba(255, 100, 60, 0.18) 60deg, rgba(255, 80, 50, 0.12) 80deg, rgba(255, 50, 30, 0.04) 100deg, rgba(184, 13, 46, 0) 120deg)',
              filter: 'blur(80px)',
              mixBlendMode: 'screen', 
              zIndex: -4
            }}
          />

          {/* Layer 3: Atmospheric Scatter (Subtle room fill) */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '30%',
              transform: 'translate(-50%, -20%)',
              width: '650%', height: '500vh',
              background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(120, 9, 30, 0.16) 0%, rgba(100, 8, 25, 0.1) 25%, rgba(80, 6, 20, 0.06) 50%, rgba(45, 4, 12, 0.015) 75%, transparent 100%)',
              filter: 'blur(250px)',
              zIndex: -6
            }}
          />

          {/* Layer 7: Far Scatter */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '0%',
              transform: 'translate(-50%, 0)',
              width: '800%', height: '800vh',
              background: 'radial-gradient(ellipse 90% 90% at 50% 20%, rgba(90, 7, 23, 0.1) 0%, rgba(70, 5, 18, 0.06) 30%, rgba(40, 3, 10, 0.018) 60%, rgba(20, 2, 5, 0.005) 90%, transparent 100%)',
              filter: 'blur(300px)',
              zIndex: -7
            }}
          />

          {/* Layer 8: Ambient Base */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              width: '100vw', height: '500vh',
              background: 'rgba(20, 2, 5, 0.02)',
              zIndex: -8
            }}
          />

          {/* Embers */}
          <div 
            ref={emberContainerRef}
            className="absolute pointer-events-none"
            style={{
              left: '50%', 
              top: '50%', // Start at text level
              transform: 'translate(-50%, 0)',
              width: '200%', 
              height: '400vh',
              zIndex: 5
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

          {/* === TEXT LAYERS === */}
          <div className="relative">
            {/* Main Glow Layer (Transparent Body + Red Stroke + Red Shadow) */}
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-black leading-tight text-center max-w-4xl mx-auto relative z-20">
              <span 
                ref={word1Ref} 
                className="inline-block"
                style={{ ...standardGlow, marginRight: '0.25em' }}
              >
                You
              </span>
              <span 
                ref={word2Ref} 
                className="inline-block"
                style={{ ...standardGlow, marginRight: '0.25em' }}
              >
                need
              </span>
              <span 
                ref={word3Ref} 
                className="inline-block"
                style={{ ...standardGlow, marginRight: '0.25em' }}
              >
                a
              </span>
              <span 
                ref={word4Ref} 
                className="inline-block"
                style={{ ...standardGlow, textTransform: 'lowercase' }}
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
        
        /* Mini Spark Particles */
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

      {/* Global Page Illumination - Intensifies with text */}
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
