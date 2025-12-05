import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, Play } from "lucide-react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from "@/lib/animationConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoSchema from "@/components/VideoSchema";

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.warn('Failed to register GSAP ScrollTrigger:', e);
  }
}

// Simple fade-in for info box and pulse animation
const simpleKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
`;

interface Power {
  id: string;
  title: string;
  icon: JSX.Element;
  color: string;
  glowColor: string;
  bgColor: string;
  angle: number;
  description: string;
  details: string[];
  content: {
    whatItIs: string;
    value: string;
    inHouseCost: string;
  };
}

const powers: Power[] = [
  {
    id: "gtm-architect",
    title: "GTM Architect",
    icon: <Target className="w-6 h-6" strokeWidth={2} style={{ stroke: "#0EA5E9" }} />,
    color: "text-sky-500",
    glowColor: "rgba(14, 165, 233, 0.5)",
    bgColor: "14, 165, 233",
    angle: 0,
    description: "Expert architects who design and refine your entire revenue playbook.",
    details: [
      "ICP & persona development",
      "Messaging & positioning strategy",
      "Multi-channel campaign design"
    ],
    content: {
      whatItIs: "6-12 Months Faster to Product-Market Fit",
      value: "What You Get:\n\n→ ICP & persona development\n→ Messaging & positioning strategy\n→ Multi-channel campaign design\n→ 40% increased pipeline velocity\n→ 10+ years B2B SaaS expertise",
      inHouseCost: "What You Don't Pay:\n\n✗ No $250K/yr VP of Marketing\n✗ No $150K/yr Strategy Consultant\n\nSenior GTM expertise included"
    }
  },
  {
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" strokeWidth={2} style={{ stroke: "#14B8A6" }} />,
    color: "text-teal-500",
    glowColor: "rgba(20, 184, 166, 0.5)",
    bgColor: "20, 184, 166",
    angle: 60,
    description: "Intelligent systems that research, personalize, and optimize at scale.",
    details: [
      "AI-powered prospect research",
      "Automated personalization engine",
      "Message optimization & A/B testing"
    ],
    content: {
      whatItIs: "3x Higher Response Rates + 15 Hours Saved Weekly",
      value: "What You Get:\n\n→ AI-powered prospect research\n→ Automated message personalization\n→ Campaign optimization & A/B testing\n→ Hyper-personalization at scale\n→ Machine learning algorithms",
      inHouseCost: "What You Don't Pay:\n\n✗ No $180K/yr AI Engineer\n✗ No $50K/yr tools & infrastructure\n\nFully managed AI systems included"
    }
  },
  {
    id: "coach",
    title: "Elite Coach",
    icon: <Users className="w-6 h-6" strokeWidth={2} style={{ stroke: "#818CF8" }} />,
    color: "text-indigo-400",
    glowColor: "rgba(129, 140, 248, 0.5)",
    bgColor: "129, 140, 248",
    angle: 120,
    description: "World-class coaching that elevates your BDRs to top 1% performance.",
    details: [
      "Daily skill development",
      "Real-time call coaching",
      "Performance analytics & feedback"
    ],
    content: {
      whatItIs: "3 Weeks Ramp Time (Not 3 Months)",
      value: "What You Get:\n\n→ Daily 1:1 and group coaching\n→ Real-time call feedback\n→ Top 1% BDR training methods\n→ 2.5x meeting conversion rates\n→ Salesforce, MongoDB, Snowflake alumni",
      inHouseCost: "What You Don't Pay:\n\n✗ No $175K/yr Sales Enablement Manager\n✗ No $60K/yr training programs\n\nElite coaching included"
    }
  },
  {
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-6 h-6" strokeWidth={2} style={{ stroke: "#C084FC" }} />,
    color: "text-purple-400",
    glowColor: "rgba(192, 132, 252, 0.5)",
    bgColor: "192, 132, 252",
    angle: 180,
    description: "Full revenue operations management ensuring seamless system performance.",
    details: [
      "CRM & tool optimization",
      "Data hygiene & reporting",
      "Process automation & workflows"
    ],
    content: {
      whatItIs: "20+ Hours Saved Weekly + 99% Data Accuracy",
      value: "What You Get:\n\n→ CRM optimization & hygiene\n→ Process automation & workflows\n→ Real-time performance dashboards\n→ Data orchestration across systems\n→ Complete GTM system management",
      inHouseCost: "What You Don't Pay:\n\n✗ No $140K/yr RevOps Manager\n✗ No $30K/yr tools & integrations\n\nComplete RevOps included"
    }
  },
  {
    id: "tools",
    title: "Tech Stack",
    icon: <Wrench className="w-6 h-6" strokeWidth={2} style={{ stroke: "#EC4899" }} />,
    color: "text-pink-500",
    glowColor: "rgba(236, 72, 153, 0.5)",
    bgColor: "236, 72, 153",
    angle: 240,
    description: "Best-in-class tools integrated and optimized for maximum efficiency.",
    details: [
      "Multi-channel outreach platform",
      "Intent data & enrichment",
      "Advanced analytics dashboard"
    ],
    content: {
      whatItIs: "$200,000+ Annual Savings",
      value: "15+ Enterprise Tools Pre-Integrated:\n\n→ Outreach • ZoomInfo • 6sense\n→ Gong • Custom Automation\n→ Intent Data & Enrichment\n→ Advanced Analytics Dashboard\n\n✓ All optimized and ready on Day 1",
      inHouseCost: "What You Don't Pay:\n\n✗ No $120K/yr tool licenses\n✗ No $50K implementation cost\n✗ No $30K/yr maintenance\n✗ No 3-month setup timeline\n\nEverything included in your pod"
    }
  },
  {
    id: "community",
    title: "Community & Competition",
    icon: <Trophy className="w-6 h-6" strokeWidth={2} style={{ stroke: "#F43F5E" }} />,
    color: "text-rose-500",
    glowColor: "rgba(244, 63, 94, 0.5)",
    bgColor: "244, 63, 94",
    angle: 300,
    description: "A culture of collaboration and healthy competition that drives results.",
    details: [
      "Peer learning & knowledge sharing",
      "Gamified performance tracking",
      "Team challenges & rewards"
    ],
    content: {
      whatItIs: "35% Higher Performance + 50% Less Turnover",
      value: "What You Get:\n\n→ 500+ elite BDRs sharing tactics\n→ Proven templates & strategies\n→ Gamified monthly competitions\n→ Peer learning network\n→ Team challenges & rewards",
      inHouseCost: "What You Don't Pay:\n\n✗ No $100K/yr Community Manager\n✗ No $50K/yr platform & rewards\n\nCulture & community included"
    }
  }
];

interface SimplifiedOrbitalPowersProps {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * SimplifiedOrbitalPowers: Interactive orbital badges with engagement features
 * Optimized for performance with memoization and reduced calculations
 */
export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [orbitRotation, setOrbitRotation] = useState(270);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activePowerIndex, setActivePowerIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false); // State to track video loading
  const [motionReady, setMotionReady] = useState(false);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  // Memoize responsive values to prevent recalculation on every render
  const layoutConfig = useMemo(() => ({
    radius: isMobile ? 180 : 320,
    yScale: isMobile ? 0.8 : 0.6,
    videoWidth: isMobile ? 'min(90vw, 400px)' : 'min(85vw, 680px)',
    videoHeight: isMobile ? 'min(50vw, 225px)' : 'min(48vw, 382px)',
    iconSize: 24,
    padding: isMobile ? 8 : 10,
    gap: isMobile ? 8 : 12,
    finalY: isMobile ? 200 : 260
  }), [isMobile]);

  // Allow a first paint before kicking off GSAP-heavy work
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        const idleId = (window as any).requestIdleCallback(() => setMotionReady(true), { timeout: 200 });
        return () => (window as any).cancelIdleCallback?.(idleId);
      }
      const timeoutId = window.setTimeout(() => setMotionReady(true), 120);
      return () => clearTimeout(timeoutId);
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Start rotation animation when section comes into view
  const startInitialRotation = useCallback(() => {
    if (prefersReducedMotion()) {
      setAnimationComplete(true);
      return;
    }

    // Single check: kill existing or skip if active
    const current = orbitAnimationRef.current;
    if (current) {
      if (current.isActive()) return;
      current.kill();
    }

    // Always start from 270 degrees (fixed starting position)
    const rotationObj = { value: 270 };
    let lastUpdateTime = 0;
    const updateInterval = 1000 / 15; // 15fps throttle for Safari compatibility

    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: 630, // 360 degrees rotation (270 -> 630)
      duration: 4, // Shorter duration
      ease: "power1.inOut",
      onUpdate: () => {
        // Throttle state updates to 15fps for Safari compatibility
        const now = Date.now();
        if (now - lastUpdateTime >= updateInterval) {
          setOrbitRotation(rotationObj.value);
          lastUpdateTime = now;
        }
      },
      onComplete: () => {
        setOrbitRotation(630); // Ensure final state is set
        setAnimationComplete(true);
      }
    });
  }, []); // No dependencies - callback should never recreate during animation

  // Start rotation when scrolled into view - single initialization
  useEffect(() => {
    // Only trigger animation when scrolled into view
    if (!motionReady || !hasScrolledIntoView) return;

    if (prefersReducedMotion()) {
      setAnimationComplete(true);
      return;
    }

    // Use a flag to prevent double initialization
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initAnimation = () => {
      if (!mounted) return;

      // Only start if not already running
      if (!orbitAnimationRef.current || !orbitAnimationRef.current.isActive()) {
        startInitialRotation();
      }
    };

    // Small delay to ensure smooth transition
    timeoutId = setTimeout(initAnimation, 100);

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (orbitAnimationRef.current) {
        orbitAnimationRef.current.kill();
        orbitAnimationRef.current = null;
      }
    };
  }, [hasScrolledIntoView, motionReady]);

  // Utility to clear all auto-advance timers
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
      autoAdvanceIntervalRef.current = null;
    }
  }, []);

  // Navigate between powers
  const handleNavigate = useCallback((direction: 'next' | 'prev') => {
    setUserInteracted(true);
    clearAutoAdvance();

    setActivePowerIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % powers.length
        : (prev - 1 + powers.length) % powers.length
    );
  }, [clearAutoAdvance]);

  // Manual play handler
  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => {
        setHasPlayed(true);
        setShowPlayButton(false);
      })
      .catch((error) => {
        console.error('Manual play failed:', error);
      });
  };

  // Effect for ScrollTrigger animation on icons - stable initialization
  useEffect(() => {
    if (!motionReady || prefersReducedMotion()) {
      return;
    }

    // Only run once when animation completes (icons are in final position)
    if (!animationComplete) {
      return;
    }

    const icons = sectionRef.current?.querySelectorAll('.orbital-badges-container > div');
    if (!icons || icons.length === 0) {
      return;
    }

    // Safari requires substantial time (1s+) for DOM paint after animation completes
    // Use aggressive multi-stage refresh to ensure ScrollTrigger gets accurate positions
    const delayedInit = gsap.delayedCall(1.0, () => {
      const ctx = gsap.context(() => {
        // Set initial states
        gsap.set(icons, {
          opacity: 0,
          scale: 0.8,
        });

        // Animate icons on scroll
        icons.forEach((icon, index) => {
          gsap.to(icon, {
            scrollTrigger: {
              trigger: '.orbital-container',
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
          });
        });

        // Safari-specific: Triple refresh with staggered RAF for complete paint stability
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        });
      }, sectionRef);

      return ctx;
    });

    return () => {
      delayedInit.kill();
    };
  }, [animationComplete, motionReady]); // Only re-run if animation completion state changes


  // Video playback management
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleError = () => {
      console.error('Video load error:', video.error);
      setVideoError(true);
      setShowPlayButton(false);
    };

    const handleVideoEnded = () => {
      if (userInteracted) return;

      autoAdvanceTimerRef.current = setTimeout(() => {
        setActivePowerIndex((prev) => (prev + 1) % powers.length);

        autoAdvanceIntervalRef.current = setInterval(() => {
          setActivePowerIndex((prev) => (prev + 1) % powers.length);
        }, 10000);
      }, 6000);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleVideoEnded);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger scroll state for animation (only once)
            setHasScrolledIntoView(true);

            // Handle video playback
            if (!hasPlayed && !videoError) {
              video.play()
                .then(() => {
                  setHasPlayed(true);
                  setShowPlayButton(false);
                })
                .catch((error) => {
                  console.log('Video autoplay prevented:', error);
                  setShowPlayButton(true);
                });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleVideoEnded);
      clearAutoAdvance();
      observer.disconnect();
    };
  }, [hasPlayed, videoError, videoRef, userInteracted, clearAutoAdvance]);

  // Effect to handle video loading and ScrollTrigger refresh
  useEffect(() => {
    if (!videoRef?.current) return;

    const video = videoRef.current;
    const handleLoadedData = () => {
      setVideoLoaded(true);
      // Refresh ScrollTrigger after video loads to recalculate positions
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);

    // Check if already loaded
    if (video.readyState >= 2) {
      setVideoLoaded(true);
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      }
    }

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [videoRef]);

  const selectedPower = powers[activePowerIndex] || powers[0];

  // Memoize badge position calculations
  const badgePositions = useMemo(() => {
    if (animationComplete) return [];

    const { radius, yScale, iconSize, padding, gap, finalY } = layoutConfig;
    const iconWidth = iconSize + (padding * 2);
    const totalWidth = (iconWidth + gap) * powers.length - gap;
    const startX = -totalWidth / 2;

    // Adjusted transition range for 360 degree rotation (ending at 630)
    // Fanning out starts earlier to complete by 630
    const transitionEnd = 630;
    const transitionStart = 390; // 630 - 240 (maintaining same fan-out duration/arc proportion)
    
    const transitionRange = transitionEnd - transitionStart;
    const rawProgress = Math.max(0, Math.min(1, (orbitRotation - transitionStart) / transitionRange));
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);

    return powers.map((power, index) => {
      const totalAngle = power.angle + orbitRotation;
      const angleRad = (totalAngle * Math.PI) / 180;
      const x = Math.cos(angleRad) * radius;
      const y = Math.sin(angleRad) * radius * yScale;

      const finalX = startX + (iconWidth + gap) * index + iconWidth / 2;

      return {
        id: power.id,
        x: x + (finalX - x) * progress,
        y: y + (finalY - y) * progress,
        opacity: 1 - (progress * 0.4)
      };
    });
  }, [orbitRotation, animationComplete, layoutConfig]);

  const videoEl = (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: layoutConfig.videoWidth,
        height: layoutConfig.videoHeight,
        boxShadow: `
          0 0 0 2px rgba(192, 192, 192, 0.3),
          0 0 40px rgba(${selectedPower.bgColor}, 0.3),
          0 0 80px rgba(${selectedPower.bgColor}, 0.2),
          0 0 120px rgba(${selectedPower.bgColor}, 0.15),
          0 0 160px rgba(${selectedPower.bgColor}, 0.1)
        `
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-black"
        muted
        playsInline
        preload="metadata"
        poster="/og-image.png"
        controls={false}
        data-testid="orbital-video"
      >
        <source src="/sdr-pod-video.webm" type="video/webm" />
        <source src={videoSrc} type="video/mp4" />
      </video>

      {showPlayButton && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Button
            size="lg"
            onClick={handleManualPlay}
            className="rounded-full w-20 h-20 shadow-2xl"
            data-testid="button-play-video"
          >
            <Play className="w-10 h-10" />
          </Button>
        </div>
      )}

      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">📹</div>
            <p className="text-white font-semibold">Video Unavailable</p>
            <p className="text-white/70 text-sm max-w-xs">
              The video could not be loaded. Please check back later or contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{simpleKeyframes}</style>
      <VideoSchema
        name="Your Fullstack Sales Unit - GTM Engine in Action"
        description="Watch how Revenue Party's GTM Engine combines elite BDR pods with AI-powered systems to deliver guaranteed qualified appointments."
        thumbnailUrl="https://revenueparty.com/apple-touch-icon.png"
        uploadDate="2024-10-01"
        duration="PT2M"
        contentUrl={`https://revenueparty.com${videoSrc}`}
      />
      <div
        ref={sectionRef}
        className="transition-all duration-700"
        data-testid="section-orbital-powers"
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative mx-auto" style={{ maxWidth: '900px' }} data-testid="orbital-container">
            <div className="relative mx-auto h-[360px] md:h-[460px] flex items-center justify-center">

              {/* ISSUE #7 FIX: Simplified click handler */}
              <div
                className="relative z-20 cursor-pointer"
                onClick={() => handleNavigate('next')}
                data-testid="clickable-video"
                title="Click to see next power"
              >
                {videoEl}
              </div>

              {/* Orbital Badges - Only render during animation */}
              {!animationComplete && (
                <div className="orbital-badges-container absolute inset-0 pointer-events-none">
                  {badgePositions.map((position) => {
                    const power = powers.find(p => p.id === position.id)!;

                    return (
                      <div
                        key={power.id}
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate3d(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px), 0)`,
                          opacity: position.opacity,
                          zIndex: 30,
                          willChange: 'transform, opacity',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden'
                        }}
                        data-testid={`power-badge-${power.id}`}
                      >
                        <div
                          className="relative rounded-full p-3 bg-background/90 backdrop-blur-sm shadow-lg"
                          style={{
                            boxShadow: `0 0 20px ${power.glowColor}`,
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)'
                          }}
                        >
                          {power.icon}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Horizontal Icon Row */}
            <div
              className="flex flex-col items-center mb-8 transition-opacity duration-700 ease-in"
              style={{
                opacity: animationComplete ? 1 : 0,
                pointerEvents: animationComplete ? 'auto' : 'none'
              }}
            >
              <div className="flex justify-center items-center gap-2 md:gap-3 px-4"
                style={{ maxWidth: layoutConfig.videoWidth }}>
                {powers.map((power, index) => {
                  const isActive = index === activePowerIndex;
                  return (
                    <button
                      key={power.id}
                      onClick={() => {
                        setActivePowerIndex(index);
                        setUserInteracted(true);
                        clearAutoAdvance();
                      }}
                      className="relative rounded-full p-2 md:p-2.5 bg-background/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
                      style={{
                        boxShadow: isActive
                          ? `0 0 25px ${power.glowColor}, 0 0 12px ${power.glowColor}`
                          : `0 0 15px ${power.glowColor}`,
                        animation: isActive ? 'pulse-subtle 2s ease-in-out infinite' : 'none',
                        opacity: isActive ? 1 : 0.4,
                        transform: 'translate3d(0, 0, 0)',
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                      data-testid={`power-icon-${power.id}`}
                      aria-label={`Select ${power.title}`}
                    >
                      {power.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info Box - ISSUE #6: Removed unused showInfoBox state */}
            <Card
              className="mt-6 p-5 md:p-6 bg-background/95 backdrop-blur-sm border-2 relative overflow-hidden transition-shadow duration-500"
              data-testid="power-info-box"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(${powers[activePowerIndex].bgColor}, 0.3),
                  0 0 30px rgba(${powers[activePowerIndex].bgColor}, 0.25),
                  0 0 60px rgba(${powers[activePowerIndex].bgColor}, 0.15),
                  0 0 100px rgba(${powers[activePowerIndex].bgColor}, 0.1),
                  0 0 140px rgba(${powers[activePowerIndex].bgColor}, 0.05)
                `
              }}
            >
              {/* Giant Background Icon Watermark - Dominant */}
              <div 
                className="absolute -right-20 -bottom-20 opacity-[0.12] pointer-events-none [&_svg]:w-[420px] [&_svg]:h-[420px] md:[&_svg]:w-[520px] md:[&_svg]:h-[520px]"
                style={{ color: `rgb(${powers[activePowerIndex].bgColor})` }}
              >
                {powers[activePowerIndex].icon}
              </div>

              <div
                key={powers[activePowerIndex].id}
                className="relative z-10"
                style={{
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                {/* Centered Header */}
                <div className="text-center mb-6">
                  <h3 className={`text-3xl md:text-4xl lg:text-5xl font-black ${powers[activePowerIndex].color} mb-2`}>
                    {powers[activePowerIndex].title}
                  </h3>
                  <p className="text-muted-foreground text-lg">{powers[activePowerIndex].description}</p>
                </div>

                {/* Headline Stat - Centered & Prominent */}
                <div className={`text-center text-2xl md:text-3xl font-black ${powers[activePowerIndex].color} py-4 mb-4 border-y border-muted-foreground/20`}>
                  {powers[activePowerIndex].content.whatItIs}
                </div>

                {/* Two Column Layout for Value Props */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* What You Get */}
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{powers[activePowerIndex].content.value}</p>
                  </div>
                  
                  {/* What You Don't Pay */}
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{powers[activePowerIndex].content.inHouseCost}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}