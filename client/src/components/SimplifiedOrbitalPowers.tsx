import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Settings, Users, Wrench, Trophy, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react";
import { gsap } from 'gsap';
import { prefersReducedMotion } from "@/lib/animationConfig";
import { cn } from "@/lib/utils";


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
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" style={{ color: '#5E4DB8' }} />,
    color: "text-violet-blue",
    glowColor: "rgba(94, 77, 184, 0.4)",
    bgColor: "94, 77, 184",
    angle: 0,
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
    id: "gtm-strategist",
    title: "GTM Strategist",
    icon: <Target className="w-6 h-6" style={{ color: '#ef233c' }} />,
    color: "text-primary",
    glowColor: "rgba(239, 35, 60, 0.4)",
    bgColor: "239, 35, 60",
    angle: 60,
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
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-6 h-6" style={{ color: '#D25A28' }} />,
    color: "text-burnt-orange",
    glowColor: "rgba(210, 90, 40, 0.4)",
    bgColor: "210, 90, 40",
    angle: 120,
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
    id: "coach",
    title: "Elite Coach",
    icon: <Users className="w-6 h-6" style={{ color: '#9F8FFF' }} />,
    color: "text-community",
    glowColor: "rgba(159, 143, 255, 0.4)",
    bgColor: "159, 143, 255",
    angle: 180,
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
    id: "tools",
    title: "Tech Stack",
    icon: <Wrench className="w-6 h-6" style={{ color: '#4CAF50' }} />,
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
    icon: <Trophy className="w-6 h-6" style={{ color: '#C41E58' }} />,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [initialPulse, setInitialPulse] = useState(true);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hoveredPower, setHoveredPower] = useState<string | null>(null);
  const [currentPower, setCurrentPower] = useState<string | null>(null);
  const [playbackMode, setPlaybackMode] = useState<'rotating' | 'decelerating' | 'autoTour' | 'manual'>('rotating');
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [prePulseActive, setPrePulseActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Orbital rotation animation - slow, cinematic rotation during video
  useEffect(() => {
    if (prefersReducedMotion()) return;
    
    // Only start rotation once video has started playing
    if (!hasPlayed) return;

    const rotationObj = { value: orbitRotation };

    // Much slower rotation: 120 seconds per full rotation (0.5 RPM)
    // This creates a gentle, sophisticated movement
    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: orbitRotation + 360,
      duration: 120,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        setOrbitRotation(rotationObj.value % 360);
      }
    });

    return () => {
      orbitAnimationRef.current?.kill();
    };
  }, [hasPlayed]);

  // Handle video end and start deceleration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setVideoEnded(true);
      setPlaybackMode('decelerating');

      if (prefersReducedMotion()) {
        // Skip deceleration, go straight to auto-tour
        setPlaybackMode('autoTour');
        return;
      }

      // Kill the continuous rotation
      if (orbitAnimationRef.current) {
        orbitAnimationRef.current.kill();
      }

      // Calculate the nearest power position to land on
      const currentRotation = orbitRotation % 360;
      const powerAngles = powers.map(p => p.angle);
      const nearestPowerAngle = powerAngles.reduce((prev, curr) => {
        return Math.abs(curr - currentRotation) < Math.abs(prev - currentRotation) ? curr : prev;
      });
      const nearestPowerIndex = powers.findIndex(p => p.angle === nearestPowerAngle);

      // Decelerate to the nearest position over 1.5 seconds with smooth easing
      let targetRotation = nearestPowerAngle;

      // Calculate clockwise-only rotation (never counter-clockwise)
      let rotationDiff = targetRotation - currentRotation;
      if (rotationDiff < 0) rotationDiff += 360; // Always move clockwise

      gsap.to({ value: 0 }, {
        value: 1,
        duration: 1.5,
        ease: "power3.out", // Smooth but quicker deceleration
        onUpdate: function() {
          const progress = this.progress();
          const easedProgress = gsap.parseEase("power3.out")(progress);
          const newRotation = (currentRotation + rotationDiff * easedProgress) % 360;
          setOrbitRotation(newRotation < 0 ? newRotation + 360 : newRotation);
        },
        onComplete: () => {
          setOrbitRotation(nearestPowerAngle);
          setSelectedIndex(nearestPowerIndex);

          // Wait 1 second before starting auto-tour
          setTimeout(() => {
            setPlaybackMode('autoTour');
          }, 1000);
        }
      });
    };

    video.addEventListener('ended', handleVideoEnd);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [videoRef, orbitRotation]);

  // Auto-tour system - rotate through powers with smooth transitions
  useEffect(() => {
    if (playbackMode !== 'autoTour') {
      // Clear any existing interval
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
        tourIntervalRef.current = null;
      }
      setIsAnimating(false);
      setPrePulseActive(false);
      return;
    }

    if (prefersReducedMotion()) return;

    const PRE_PULSE_DURATION = 1000; // Match CSS animation duration
    const ROTATION_DURATION = 2000;
    const PAUSE_DURATION = 4000;
    const TOTAL_CYCLE = PRE_PULSE_DURATION + ROTATION_DURATION + PAUSE_DURATION;

    const performTransition = (currentIndex: number) => {
      setIsAnimating(true);
      
      const nextIndex = (currentIndex + 1) % powers.length;
      const currentAngle = powers[currentIndex].angle;
      const targetAngle = powers[nextIndex].angle;

      // Calculate clockwise-only rotation
      let angleDiff = targetAngle - currentAngle;
      if (angleDiff < 0) angleDiff += 360; // Always move clockwise (positive direction)

      // Start pre-pulse
      setPrePulseActive(true);

      // Create single smooth animation timeline
      const timeline = gsap.timeline({
        onComplete: () => {
          // Update state synchronously
          setOrbitRotation(targetAngle);
          setSelectedIndex(nextIndex);
          setPrePulseActive(false);
          setIsAnimating(false);
        }
      });

      // Wait for pre-pulse to complete
      timeline.to({}, { duration: PRE_PULSE_DURATION / 1000 });

      // Then smoothly rotate with cinematic easing
      timeline.to(
        { value: 0 },
        {
          value: 1,
          duration: ROTATION_DURATION / 1000,
          ease: "power2.inOut",
          onUpdate: function() {
            const progress = this.progress();
            const newRotation = (currentAngle + angleDiff * progress) % 360;
            setOrbitRotation(newRotation < 0 ? newRotation + 360 : newRotation);
          }
        }
      );
    };

    // Track the current index in closure
    let currentTourIndex = selectedIndex;
    
    const runTransition = () => {
      performTransition(currentTourIndex);
      currentTourIndex = (currentTourIndex + 1) % powers.length;
    };

    // Initial transition after initial pause (matches subsequent cycles)
    const initialTimeout = setTimeout(runTransition, PAUSE_DURATION);

    // Then continue with interval - full cycle time
    tourIntervalRef.current = setInterval(runTransition, TOTAL_CYCLE);

    return () => {
      clearTimeout(initialTimeout);
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
        tourIntervalRef.current = null;
      }
      gsap.killTweensOf({});
      setIsAnimating(false);
      setPrePulseActive(false);
    };
  }, [playbackMode]);

  // Manual play handler for when autoplay is blocked
  const handleManualPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play()
      .then(() => {
        setHasPlayed(true);
        setShowPlayButton(false);
        setTimeout(() => setShowInfoBox(true), 1000);
        setTimeout(() => setInitialPulse(false), 3000);
      })
      .catch((error) => {
        console.error('Manual play failed:', error);
      });
  };

  // Video play and initial animations
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Handle video errors
    const handleError = () => {
      console.error('Video load error:', video.error);
      setVideoError(true);
      setShowPlayButton(false);
    };

    video.addEventListener('error', handleError);

    const attemptPlay = () => {
      // Check for video errors first
      if (video.error) {
        handleError();
        return;
      }

      // iOS Safari often only reaches readyState 2 (HAVE_CURRENT_DATA)
      if (video.readyState >= 2) {
        video.play()
          .then(() => {
            setHasPlayed(true);
            setShowPlayButton(false);
            setVideoError(false);
            setTimeout(() => setShowInfoBox(true), 1000);
            setTimeout(() => setInitialPulse(false), 3000);
          })
          .catch((error) => {
            console.log('Video autoplay prevented:', error);
            // Show play button for manual playback
            setShowPlayButton(true);
          });
      } else {
        // Wait for enough data to be loaded
        const playHandler = () => {
          if (video.error) {
            handleError();
            return;
          }

          video.play()
            .then(() => {
              setHasPlayed(true);
              setShowPlayButton(false);
              setVideoError(false);
              setTimeout(() => setShowInfoBox(true), 1000);
              setTimeout(() => setInitialPulse(false), 3000);
            })
            .catch((error) => {
              console.log('Video autoplay prevented:', error);
              setShowPlayButton(true);
            });
        };

        video.addEventListener('loadeddata', playHandler, { once: true });
        video.addEventListener('canplay', playHandler, { once: true });

        // Timeout fallback for error detection
        setTimeout(() => {
          if (video.readyState === 0 && video.networkState === 3) {
            handleError();
          }
        }, 3000);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayed && !videoError) {
            attemptPlay();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      video.removeEventListener('error', handleError);
      observer.disconnect();

      // Cleanup intervals
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
      }
    };
  }, [hasPlayed, videoError, videoRef]);

  // Background color morphing
  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;

    const selectedPower = powers[selectedIndex];

    gsap.to(sectionRef.current, {
      background: `radial-gradient(ellipse at top, rgba(${selectedPower.bgColor}, 0.05) 0%, transparent 60%)`,
      duration: 0.8,
      ease: "power2.out"
    });
  }, [selectedIndex]);

  const handlePrevious = () => {
    const newIndex = (selectedIndex - 1 + powers.length) % powers.length;
    setSelectedIndex(newIndex);
    setInitialPulse(false);
    setCurrentPower(powers[newIndex].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % powers.length;
    setSelectedIndex(newIndex);
    setInitialPulse(false);
    setCurrentPower(powers[newIndex].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const handleBadgeClick = (index: number) => {
    setSelectedIndex(index);
    setShowInfoBox(true);
    setInitialPulse(false);
    setCurrentPower(powers[index].id);

    // User interaction cancels auto-tour
    if (playbackMode === 'autoTour') {
      setPlaybackMode('manual');
    }
  };

  const selectedPower = powers[selectedIndex];

  // Dummy variable for videoEl as it's not directly used in the provided original snippet's HTML structure
  // In a real scenario, this would be the actual video element or its container.
  const videoEl = (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: 'min(90vw, 640px)',
        height: 'min(50vh, 360px)',
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
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-1">
            <span className="gradient-text gradient-hero">The Fullstack Sales Unit</span>
          </h2>
          <p className="text-2xl md:text-3xl italic max-w-3xl mx-auto mb-0">
            Elite Sales Talent, equipped and trained by RP Architects.
          </p>
        </div>

        {/* Main Container */}
        <div ref={containerRef} className="relative mx-auto -mt-6" style={{ maxWidth: '900px' }}>
          {/* Orbital Container */}
          <div className="relative mx-auto h-[500px] md:h-[600px] flex items-center justify-center">

            {/* Central Video */}
            <div className="relative z-20">
              {videoEl}
            </div>

            {/* Orbital Badges */}
            <div className="orbital-badges-container absolute inset-0 pointer-events-none">
              {powers.map((power, index) => {
                const radius = 320;
                const totalAngle = power.angle + orbitRotation;
                const angleRad = (totalAngle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius * 0.6;

                return (
                  <div
                    key={power.id}
                    ref={el => badgeRefs.current[index] = el}
                    className="absolute left-1/2 top-1/2 pointer-events-auto"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={() => handleBadgeClick(index)}
                      className="group cursor-pointer transition-all duration-300 hover:scale-110 relative"
                      data-testid={`power-badge-${power.id}`}
                      onMouseEnter={() => setHoveredPower(power.id)}
                      onMouseLeave={() => setHoveredPower(null)}
                    >
                      <div
                        className={cn(
                          `
                          relative rounded-full p-3 bg-background/90 backdrop-blur-sm
                          border-2 ${power.color} shadow-lg
                          group-hover:shadow-xl transition-all duration-300
                          ${index === selectedIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''}
                        `,
                        )}
                        style={{
                          boxShadow: index === selectedIndex
                            ? `0 0 30px ${power.glowColor}, 0 0 60px ${power.glowColor}`
                            : `0 0 20px ${power.glowColor}`,
                          animation: index === selectedIndex
                            ? prePulseActive
                              ? 'orbital-badge-pre-pulse 1s cubic-bezier(0.4, 0, 0.2, 1)'
                              : 'orbital-badge-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                            : 'none',
                          willChange: index === selectedIndex ? 'transform, filter' : 'auto',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden'
                        }}
                      >
                        {power.icon}
                      </div>

                      <div className={`
                        absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                        text-sm font-medium ${power.color}
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      `}>
                        {power.title}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          {showInfoBox && (
            <Card className="-mt-16 p-6 bg-background/95 backdrop-blur-sm border-2" data-testid="power-info-box">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${selectedPower.color}`}
                      style={{ backgroundColor: `${selectedPower.glowColor}20` }}
                    >
                      {selectedPower.icon}
                    </div>
                    <h3 className={`text-2xl font-bold ${selectedPower.color}`}>{selectedPower.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handlePrevious}
                      className="hover:scale-110 transition-transform"
                      data-testid="button-previous-power"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleNext}
                      className="hover:scale-110 transition-transform"
                      data-testid="button-next-power"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedPower.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">What It Is:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.whatItIs}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">The Value:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.value}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">In-House Cost:</h4>
                    <p className="text-sm text-muted-foreground">{selectedPower.content.inHouseCost}</p>
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