import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, Play } from "lucide-react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from "@/lib/animationConfig";
import { useIsMobile } from "@/hooks/use-mobile";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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
    id: "gtm-strategist",
    title: "GTM Strategist",
    icon: <Target className="w-6 h-6" strokeWidth={2} style={{ stroke: "#ef233c" }} />,
    color: "text-primary",
    glowColor: "rgba(239, 35, 60, 0.4)",
    bgColor: "239, 35, 60",
    angle: 0,
    description: "Expert strategists who design and refine your entire revenue playbook.",
    details: [
      "ICP & persona development",
      "Messaging & positioning strategy",
      "Multi-channel campaign design"
    ],
    content: {
      whatItIs: "Senior GTM experts with 10+ years experience designing and executing revenue strategies for B2B SaaS companies from Series A to IPO.",
      value: "Reduces time to product-market fit by 6-12 months. Increases pipeline velocity by 40% through proven frameworks.",
      inHouseCost: "$250,000/yr (VP of Marketing) + $150,000/yr (Strategy Consultant)"
    }
  },
  {
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" strokeWidth={2} style={{ stroke: "hsl(125 57% 49%)" }} />,
    color: "text-signal-green",
    glowColor: "rgba(76, 175, 80, 0.4)",
    bgColor: "76, 175, 80",
    angle: 60,
    description: "Intelligent systems that research, personalize, and optimize at scale.",
    details: [
      "AI-powered prospect research",
      "Automated personalization engine",
      "Message optimization & A/B testing"
    ],
    content: {
      whatItIs: "An advanced AI-powered system that automates prospect research, message personalization, and campaign optimization using machine learning algorithms.",
      value: "Increases response rates by 3x through hyper-personalization at scale, saving 15+ hours per week on manual research and writing.",
      inHouseCost: "$180,000/yr (AI engineer) + $50,000/yr (tools & infrastructure)"
    }
  },
  {
    id: "coach",
    title: "Elite Coach",
    icon: <Users className="w-6 h-6" strokeWidth={2} style={{ stroke: "#9F8FFF" }} />,
    color: "text-community",
    glowColor: "rgba(159, 143, 255, 0.4)",
    bgColor: "159, 143, 255",
    angle: 120,
    description: "World-class coaching that elevates your BDRs to top 1% performance.",
    details: [
      "Daily skill development",
      "Real-time call coaching",
      "Performance analytics & feedback"
    ],
    content: {
      whatItIs: "Elite sales coaches who've trained top 1% BDRs at companies like Salesforce, MongoDB, and Snowflake, providing daily 1:1 and group coaching.",
      value: "Accelerates ramp time from 3 months to 3 weeks. Increases meeting conversion rates by 2.5x through proven methodologies.",
      inHouseCost: "$175,000/yr (Sales Enablement Manager) + $60,000/yr (training programs)"
    }
  },
  {
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-6 h-6" strokeWidth={2} style={{ stroke: "#D25A28" }} />,
    color: "text-burnt-orange",
    glowColor: "rgba(210, 90, 40, 0.4)",
    bgColor: "210, 90, 40",
    angle: 180,
    description: "Full revenue operations management ensuring seamless system performance.",
    details: [
      "CRM & tool optimization",
      "Data hygiene & reporting",
      "Process automation & workflows"
    ],
    content: {
      whatItIs: "Complete revenue operations management including CRM optimization, data orchestration, and process automation across all GTM systems.",
      value: "Eliminates 20+ hours/week of manual tasks, improves data accuracy to 99%, and provides real-time performance visibility.",
      inHouseCost: "$140,000/yr (RevOps Manager) + $30,000/yr (tools & integrations)"
    }
  },
  {
    id: "tools",
    title: "Tech Stack",
    icon: <Wrench className="w-6 h-6" strokeWidth={2} style={{ stroke: "hsl(125 57% 49%)" }} />,
    color: "text-signal-green",
    glowColor: "rgba(76, 175, 80, 0.4)",
    bgColor: "76, 175, 80",
    angle: 240,
    description: "Best-in-class tools integrated and optimized for maximum efficiency.",
    details: [
      "Multi-channel outreach platform",
      "Intent data & enrichment",
      "Advanced analytics dashboard"
    ],
    content: {
      whatItIs: "Pre-integrated stack of 15+ enterprise tools including Outreach, ZoomInfo, 6sense, Gong, and custom automation platforms.",
      value: "Saves $200,000+ in annual tool costs through volume licensing. Eliminates 3-month implementation timeline.",
      inHouseCost: "$120,000/yr (tools) + $50,000 (implementation) + $30,000/yr (maintenance)"
    }
  },
  {
    id: "community",
    title: "Community & Competition",
    icon: <Trophy className="w-6 h-6" strokeWidth={2} style={{ stroke: "#C41E58" }} />,
    color: "text-magenta-rose",
    glowColor: "rgba(196, 30, 88, 0.4)",
    bgColor: "196, 30, 88",
    angle: 300,
    description: "A culture of collaboration and healthy competition that drives results.",
    details: [
      "Peer learning & knowledge sharing",
      "Gamified performance tracking",
      "Team challenges & rewards"
    ],
    content: {
      whatItIs: "Private community of 500+ elite BDRs sharing tactics, templates, and strategies with gamified challenges and monthly competitions.",
      value: "Increases team performance by 35% through peer learning. Reduces turnover by 50% through engagement and culture.",
      inHouseCost: "$100,000/yr (Community Manager) + $50,000/yr (platform & rewards)"
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
import VideoSchema from "@/components/VideoSchema";
import { useMemo, useCallback } from "react";

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

    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: 720,
      duration: 9,
      ease: "power1.inOut",
      onUpdate: () => {
        setOrbitRotation(rotationObj.value);
      },
      onComplete: () => {
        setAnimationComplete(true);
      }
    });
  }, []); // No dependencies - callback should never recreate during animation

  // Start rotation when scrolled into view - single initialization
  useEffect(() => {
    // Only trigger animation when scrolled into view
    if (!hasScrolledIntoView) return;

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
  }, [hasScrolledIntoView]);

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
    if (prefersReducedMotion()) {
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

    // Single initialization - no polling, no race conditions
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
    }, sectionRef);

    // Refresh after a frame to ensure layout is complete
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [animationComplete]); // Only re-run if animation completion state changes


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

    const transitionStart = 480;
    const transitionEnd = 720;
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
        className="w-full h-full object-contain bg-black"
        muted
        playsInline
        preload="auto"
        controls={false}
        data-testid="orbital-video"
      >
        <source src="/bdr-pod-video.webm" type="video/webm" />
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
          <div className="text-center mb-8">
            <h2 className="text-5xl md:text-6xl font-bold mb-2">
              <span className="gradient-text gradient-hero">The Fullstack Sales Unit</span>
            </h2>
            <p className="text-xl md:text-2xl italic max-w-3xl mx-auto text-muted-foreground">
              Elite Sales Talent, equipped and trained by RP Architects.
            </p>
          </div>

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
                        className="absolute left-1/2 top-1/2 transition-all duration-700 ease-out"
                        style={{
                          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                          opacity: position.opacity,
                          zIndex: 30
                        }}
                        data-testid={`power-badge-${power.id}`}
                      >
                        <div
                          className="relative rounded-full p-3 bg-background/90 backdrop-blur-sm shadow-lg"
                          style={{
                            boxShadow: `0 0 20px ${power.glowColor}`
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
                        opacity: isActive ? 1 : 0.4
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
              className="mt-6 p-5 md:p-6 bg-background/95 backdrop-blur-sm border-2"
              data-testid="power-info-box"
              style={{
                boxShadow: `0 0 0 1px ${powers[activePowerIndex].glowColor}40, 0 4px 20px rgba(0,0,0,0.1)`
              }}
            >
              <div
                key={powers[activePowerIndex].id}
                className="space-y-3"
                style={{
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className={`p-2 rounded-full ${powers[activePowerIndex].color}`}
                    style={{ backgroundColor: `${powers[activePowerIndex].glowColor}20` }}
                  >
                    {powers[activePowerIndex].icon}
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold ${powers[activePowerIndex].color}`}>
                    {powers[activePowerIndex].title}
                  </h3>
                </div>

                <p className="text-muted-foreground leading-relaxed">{powers[activePowerIndex].description}</p>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <h4 className="font-semibold mb-1.5 text-sm">What It Is:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{powers[activePowerIndex].content.whatItIs}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1.5 text-sm">The Value:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{powers[activePowerIndex].content.value}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1.5 text-sm">In-House Cost:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{powers[activePowerIndex].content.inHouseCost}</p>
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