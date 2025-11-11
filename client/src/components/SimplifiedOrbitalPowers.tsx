import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, Play } from "lucide-react";
import { gsap } from 'gsap';
import { prefersReducedMotion } from "@/lib/animationConfig";

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
 */
import VideoSchema from "@/components/VideoSchema";

export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [orbitRotation, setOrbitRotation] = useState(270); // Start with Brain at bottom (270°)
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activePowerIndex, setActivePowerIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start rotation animation when section comes into view
  const startInitialRotation = () => {
    if (prefersReducedMotion()) {
      setAnimationComplete(true);
      return;
    }

    if (orbitAnimationRef.current) {
      orbitAnimationRef.current.kill();
    }

    const rotationObj = { value: 0 };

    // Two full rotations (720°), with smooth cinematic easing
    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: 720,
      duration: 9,
      ease: "power1.inOut", // Smoother, more cinematic easing
      onUpdate: () => {
        setOrbitRotation(rotationObj.value);
      },
      onComplete: () => {
        setAnimationComplete(true);
      }
    });
  };

  // Start rotation on mount/scroll into view
  useEffect(() => {
    if (prefersReducedMotion()) {
      setAnimationComplete(true);
      return;
    }
    
    const timeout = setTimeout(() => {
      startInitialRotation();
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (orbitAnimationRef.current) {
        orbitAnimationRef.current.kill();
      }
    };
  }, []);

  // Navigate to next/previous power
  const handleNavigate = (direction: 'next' | 'prev') => {
    setUserInteracted(true);
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    const newIndex = direction === 'next' 
      ? (activePowerIndex + 1) % powers.length
      : (activePowerIndex - 1 + powers.length) % powers.length;
    setActivePowerIndex(newIndex);
  };





  // Manual play handler for when autoplay is blocked
  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => {
        setHasPlayed(true);
        setShowPlayButton(false);
        setTimeout(() => setShowInfoBox(true), 500);
      })
      .catch((error) => {
        console.error('Manual play failed:', error);
      });
  };

  // Simple video play on scroll
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleError = () => {
      console.error('Video load error:', video.error);
      setVideoError(true);
      setShowPlayButton(false);
    };

    const handleVideoEnded = () => {
      if (!userInteracted) {
        // Wait 6 seconds after video ends, then start auto-advancing every 5 seconds
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNavigate('next');
          
          // Set up recurring auto-advance every 5 seconds
          const intervalId = setInterval(() => {
            if (!userInteracted) {
              setActivePowerIndex((prev) => (prev + 1) % powers.length);
            } else {
              clearInterval(intervalId);
            }
          }, 5000);
        }, 6000);
      }
    };

    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleVideoEnded);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayed && !videoError) {
            video.play()
              .then(() => {
                setHasPlayed(true);
                setShowPlayButton(false);
                setTimeout(() => setShowInfoBox(true), 500);
              })
              .catch((error) => {
                console.log('Video autoplay prevented:', error);
                setShowPlayButton(true);
              });
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
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      observer.disconnect();
    };
  }, [hasPlayed, videoError, videoRef, userInteracted]);





  const selectedPower = powers[activePowerIndex] || powers[0];

  // Dummy variable for videoEl as it's not directly used in the provided original snippet's HTML structure
  // In a real scenario, this would be the actual video element or its container.
  const videoEl = (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: window.innerWidth < 768 ? 'min(90vw, 400px)' : 'min(85vw, 680px)',
        height: window.innerWidth < 768 ? 'min(50vw, 225px)' : 'min(48vw, 382px)',
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

      {/* Play button overlay for when autoplay is blocked */}
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

      {/* Error message when video can't load */}
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
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="gradient-text gradient-hero">The Fullstack Sales Unit</span>
          </h2>
          <p className="text-xl md:text-2xl italic max-w-3xl mx-auto text-muted-foreground">
            Elite Sales Talent, equipped and trained by RP Architects.
          </p>
        </div>

        {/* Main Container - Unified Section */}
        <div className="relative mx-auto" style={{ maxWidth: '900px' }} data-testid="orbital-container">
          {/* Orbital Container - Compact height */}
          <div className="relative mx-auto h-[380px] md:h-[480px] flex items-center justify-center">

            {/* Central Video - click to advance */}
            <div 
              className="relative z-20 cursor-pointer" 
              onClick={() => handleNavigate('next')}
              data-testid="clickable-video"
              title="Click to see next power"
            >
              {videoEl}
            </div>

            {/* Orbital Badges - Rotate during animation, then transition to horizontal row */}
            <div className="orbital-badges-container absolute inset-0 pointer-events-none">
              {powers.map((power, index) => {
                const isMobile = window.innerWidth < 768;
                const radius = isMobile ? 180 : 320;
                const totalAngle = power.angle + orbitRotation;
                const angleRad = (totalAngle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                const yScale = isMobile ? 0.8 : 0.6;
                const y = Math.sin(angleRad) * radius * yScale;
                
                // Calculate final horizontal row position
                const iconWidth = isMobile ? 40 : 44;
                const gap = isMobile ? 8 : 12;
                const totalWidth = (iconWidth + gap) * powers.length - gap;
                const startX = -totalWidth / 2;
                const finalX = startX + (iconWidth + gap) * index + iconWidth / 2;
                const finalY = isMobile ? 200 : 260;
                
                // Cinematic transition: starts at 480° (2/3 through), completes at 720°
                // This gives more time for the transition and makes it smoother
                const transitionStart = 480;
                const transitionEnd = 720;
                const transitionRange = transitionEnd - transitionStart;
                const rawProgress = Math.max(0, Math.min(1, (orbitRotation - transitionStart) / transitionRange));
                
                // Apply easing to the progress for smoother transition
                const progress = animationComplete ? 1 : rawProgress * rawProgress * (3 - 2 * rawProgress); // smoothstep easing
                
                const currentX = x + (finalX - x) * progress;
                const currentY = y + (finalY - y) * progress;
                const opacity = animationComplete ? 0 : 1 - (progress * 0.4);
                
                return (
                  <div
                    key={power.id}
                    className="absolute left-1/2 top-1/2 transition-all duration-700 ease-out"
                    style={{
                      transform: `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`,
                      opacity,
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
          </div>

          {/* Navigation Arrows - Between video and icons */}
          {animationComplete && (
            <div className="flex justify-center items-center gap-6 mt-2 mb-4 z-30 relative">
              <button
                onClick={() => handleNavigate('prev')}
                className="group p-2.5 rounded-full bg-background/90 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-110"
                style={{
                  borderColor: selectedPower.glowColor,
                  boxShadow: `0 0 20px ${selectedPower.glowColor}, 0 0 10px ${selectedPower.glowColor}`
                }}
                aria-label="Previous power"
                data-testid="nav-arrow-prev"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ stroke: selectedPower.color.replace('text-', '') }}
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              <button
                onClick={() => handleNavigate('next')}
                className="group p-2.5 rounded-full bg-background/90 backdrop-blur-sm border-2 transition-all duration-300 hover:scale-110"
                style={{
                  borderColor: selectedPower.glowColor,
                  boxShadow: `0 0 20px ${selectedPower.glowColor}, 0 0 10px ${selectedPower.glowColor}`
                }}
                aria-label="Next power"
                data-testid="nav-arrow-next"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ stroke: selectedPower.color.replace('text-', '') }}
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}

          {/* Horizontal Icon Row - fades in as orbital icons transition out */}
          <div 
            className="flex flex-col items-center mb-4 transition-opacity duration-700 ease-in"
            style={{ 
              opacity: animationComplete ? 1 : 0,
              pointerEvents: animationComplete ? 'auto' : 'none'
            }}
          >
            <div className="flex justify-center items-center gap-2 md:gap-3 px-4" 
                style={{ 
                  maxWidth: window.innerWidth < 768 ? 'min(90vw, 400px)' : 'min(85vw, 680px)' 
                }}>
                {powers.map((power, index) => {
                  const isActive = index === activePowerIndex;
                  return (
                    <button
                      key={power.id}
                      onClick={() => {
                        setUserInteracted(true);
                        if (autoAdvanceTimerRef.current) {
                          clearTimeout(autoAdvanceTimerRef.current);
                          autoAdvanceTimerRef.current = null;
                        }
                        setActivePowerIndex(index);
                      }}
                      className="relative rounded-full p-2 md:p-2.5 bg-background/90 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
                      style={{
                        boxShadow: isActive 
                          ? `0 0 25px ${power.glowColor}, 0 0 12px ${power.glowColor}` 
                          : `0 0 15px ${power.glowColor}`,
                        animation: isActive ? 'pulse-subtle 2s ease-in-out infinite' : 'none'
                      }}
                      data-testid={`power-icon-${power.id}`}
                    >
                      {power.icon}
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Info Box with Cycling Arrows */}
          {showInfoBox && (
            <Card className="mt-4 p-5 md:p-6 bg-background/95 backdrop-blur-sm border-2" data-testid="power-info-box"
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
          )}

          
        </div>
      </div>
    </div>
  </>
  );
}