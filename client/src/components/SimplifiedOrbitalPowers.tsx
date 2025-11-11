import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Settings, Users, Wrench, Trophy, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react";
import { gsap } from 'gsap';
import { prefersReducedMotion } from "@/lib/animationConfig";
import { cn } from "@/lib/utils";

// Simple CSS keyframes - just fade-in and glow for prominent icon
const glowKeyframes = `
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

@keyframes prominentGlow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.5),
      0 0 40px rgba(255, 255, 255, 0.3),
      0 0 60px rgba(255, 255, 255, 0.15);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(255, 255, 255, 0.7),
      0 0 60px rgba(255, 255, 255, 0.4),
      0 0 90px rgba(255, 255, 255, 0.2);
  }
}

.prominent-glow {
  animation: prominentGlow 2s ease-in-out infinite;
  position: relative;
  z-index: 50;
  transform: scale(1.15);
  filter: brightness(1.2);
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
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" style={{ color: '#4F46E5' }} />,
    color: "text-system-primary",
    glowColor: "rgba(79, 70, 229, 0.4)",
    bgColor: "79, 70, 229",
    angle: 0,
    description: "AI-powered lead research and personalization at scale.",
    details: [
      "Automated prospect intelligence",
      "Personalized messaging generation",
      "Real-time market insights"
    ],
    content: {
      whatItIs: "Advanced AI system that researches prospects, analyzes company data, and generates personalized outreach messages tailored to each decision-maker.",
      value: "Reduces research time from 20 min/lead to 30 seconds. Increases response rates by 3x through hyper-personalization.",
      inHouseCost: "$180,000/yr (AI/ML Engineer) + $50,000/yr (data & API costs)"
    }
  },
  {
    id: "bdr",
    title: "Elite BDR",
    icon: <Target className="w-6 h-6" style={{ color: '#FF6B35' }} />,
    color: "text-signal-orange",
    glowColor: "rgba(255, 107, 53, 0.4)",
    bgColor: "255, 107, 53",
    angle: 60,
    description: "Top 1% trained BDRs who deliver consistent pipeline.",
    details: [
      "Rigorously vetted & trained",
      "Proven track record",
      "Dedicated to your success"
    ],
    content: {
      whatItIs: "Handpicked sales development representatives from the top 1% of applicants, trained in modern outbound methodologies and equipped with proven playbooks.",
      value: "Generates 20-30 qualified meetings per month per BDR. 45% meeting show rate vs industry average of 25%.",
      inHouseCost: "$85,000/yr (salary + benefits) + $25,000/yr (onboarding & training)"
    }
  },
  {
    id: "operations",
    title: "RevOps Engine",
    icon: <Settings className="w-6 h-6" style={{ color: '#00B4D8' }} />,
    color: "text-signal-blue",
    glowColor: "rgba(0, 180, 216, 0.4)",
    bgColor: "0, 180, 216",
    angle: 120,
    description: "Complete revenue operations infrastructure managed for you.",
    details: [
      "CRM optimization & hygiene",
      "Data enrichment & routing",
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
 * SimplifiedOrbitalPowers: Clean auto-rotating badges with 5-second pauses
 * - Icons rotate clockwise to bottom-center (prominent position)
 * - 5-second rest at each position
 * - 0.8s smooth transitions
 * - Prominent icon gets glow effect
 * - Manual controls work anytime
 */
import VideoSchema from "@/components/VideoSchema";

export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Core state - simplified
  const [selectedIndex, setSelectedIndex] = useState(2); // Start with RevOps
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [hoveredPower, setHoveredPower] = useState<string | null>(null);
  
  // Video state
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Animation refs
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rotationTweenRef = useRef<gsap.core.Tween | null>(null);
  const isTransitioningRef = useRef(false);
  
  // Responsive position: 270° = bottom-center (6 o'clock)
  const prominentPosition = 270;
  
  /**
   * Calculate which icon is currently at the prominent bottom-center position
   */
  const getProminentIconIndex = useCallback(() => {
    const positions = powers.map((power, idx) => {
      const iconAngle = (power.angle - orbitRotation + 360) % 360;
      const delta = Math.abs(iconAngle - prominentPosition);
      const wrappedDelta = Math.min(delta, 360 - delta);
      return { idx, delta: wrappedDelta };
    });
    
    const closest = positions.reduce((min, curr) => 
      curr.delta < min.delta ? curr : min
    );
    
    return closest.idx;
  }, [orbitRotation]);
  
  /**
   * Smooth clockwise rotation to bring target icon to prominent position
   */
  const rotateToIndex = useCallback((targetIndex: number, duration: number = 0.8) => {
    // Kill any existing rotation
    if (rotationTweenRef.current) {
      rotationTweenRef.current.kill();
    }
    
    isTransitioningRef.current = true;
    
    const targetPowerAngle = powers[targetIndex].angle;
    let targetRotation = prominentPosition - targetPowerAngle;
    
    // Normalize to 0-360
    while (targetRotation < 0) targetRotation += 360;
    while (targetRotation >= 360) targetRotation -= 360;
    
    // Calculate clockwise-only delta
    const currentRotation = orbitRotation;
    let clockwiseDelta = targetRotation - currentRotation;
    if (clockwiseDelta < 0) clockwiseDelta += 360;
    
    // Smooth GSAP transition
    rotationTweenRef.current = gsap.to({ value: 0 }, {
      value: 1,
      duration: duration,
      ease: "power2.out",
      onUpdate: function() {
        const progress = this.progress();
        const newRotation = (currentRotation + clockwiseDelta * progress) % 360;
        setOrbitRotation(newRotation);
      },
      onComplete: () => {
        setSelectedIndex(targetIndex);
        isTransitioningRef.current = false;
      }
    });
  }, [orbitRotation]);
  
  /**
   * Auto-advance to next icon every 5 seconds - runs on mount only
   */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    
    // Start 5-second auto-advance (always advance, even during transitions)
    autoAdvanceTimerRef.current = setInterval(() => {
      setSelectedIndex(prev => (prev + 1) % powers.length);
    }, 5000);
    
    return () => {
      // Cleanup on unmount
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only
  
  /**
   * When selectedIndex changes, rotate to that position
   */
  useEffect(() => {
    rotateToIndex(selectedIndex, 0.8);
  }, [selectedIndex, rotateToIndex]);
  
  /**
   * Manual controls - pause auto-advance and move to target
   */
  const handlePrevious = useCallback(() => {
    // Clear existing interval and any pending restart
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    const newIndex = (selectedIndex - 1 + powers.length) % powers.length;
    setSelectedIndex(newIndex);
    
    // Schedule restart after 5 seconds
    restartTimeoutRef.current = setTimeout(() => {
      if (!prefersReducedMotion()) {
        autoAdvanceTimerRef.current = setInterval(() => {
          setSelectedIndex(prev => (prev + 1) % powers.length);
        }, 5000);
      }
    }, 5000);
  }, [selectedIndex]);
  
  const handleNext = useCallback(() => {
    // Clear existing interval and any pending restart
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    const newIndex = (selectedIndex + 1) % powers.length;
    setSelectedIndex(newIndex);
    
    // Schedule restart after 5 seconds
    restartTimeoutRef.current = setTimeout(() => {
      if (!prefersReducedMotion()) {
        autoAdvanceTimerRef.current = setInterval(() => {
          setSelectedIndex(prev => (prev + 1) % powers.length);
        }, 5000);
      }
    }, 5000);
  }, [selectedIndex]);
  
  const handleBadgeClick = useCallback((index: number) => {
    // Clear existing interval and any pending restart
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    setSelectedIndex(index);
    
    // Schedule restart after 5 seconds
    restartTimeoutRef.current = setTimeout(() => {
      if (!prefersReducedMotion()) {
        autoAdvanceTimerRef.current = setInterval(() => {
          setSelectedIndex(prev => (prev + 1) % powers.length);
        }, 5000);
      }
    }, 5000);
  }, []);
  
  /**
   * Video playback handling
   */
  const handlePlayClick = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.play()
        .then(() => {
          setHasPlayed(true);
          setShowPlayButton(false);
          setVideoError(false);
        })
        .catch((error) => {
          console.error('Video playback failed:', error);
          setVideoError(true);
        });
    }
  }, [videoRef]);
  
  // Try autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video && !hasPlayed) {
      video.play()
        .then(() => {
          setHasPlayed(true);
          setShowPlayButton(false);
          setVideoError(false);
        })
        .catch(() => {
          setShowPlayButton(true);
        });
    }
  }, [videoRef, hasPlayed]);
  
  // Get currently prominent icon for glow effect
  const prominentIconIndex = getProminentIconIndex();
  
  return (
    <>
      <style>{glowKeyframes}</style>
      <VideoSchema
        name="Platform Overview"
        description="Discover how our platform combines AI, elite talent, and infrastructure to drive results"
        thumbnailUrl={videoSrc}
        contentUrl={videoSrc}
        uploadDate="2024-01-15"
        duration="PT2M30S"
      />
      
      <section
        ref={sectionRef}
        className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden py-16 md:py-24"
        data-testid="section-orbital-powers"
      >
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            data-testid="video-background"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Play button overlay */}
          {showPlayButton && !hasPlayed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={handlePlayClick}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md"
                data-testid="button-play-video"
              >
                <Play className="w-6 h-6 mr-2" />
                Play Video
              </Button>
            </div>
          )}
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left: Orbital Badges */}
            <div className="flex flex-col items-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                The Complete Platform
              </h2>
              
              <div
                ref={containerRef}
                className="relative w-full max-w-md aspect-square"
                data-testid="container-orbital"
              >
                {/* Center Logo */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-system-primary to-accent flex items-center justify-center shadow-2xl">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                {/* Orbital Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative w-full h-full rounded-full border-2 border-white/20"
                    style={{
                      transform: `rotate(${orbitRotation}deg)`,
                      transition: 'none' // GSAP handles animation
                    }}
                  >
                    {powers.map((power, index) => {
                      const isProminent = index === prominentIconIndex;
                      const iconAngle = power.angle;
                      const radius = 50; // Percentage
                      
                      const x = 50 + radius * Math.cos((iconAngle - 90) * Math.PI / 180);
                      const y = 50 + radius * Math.sin((iconAngle - 90) * Math.PI / 180);
                      
                      return (
                        <div
                          key={power.id}
                          ref={el => badgeRefs.current[index] = el}
                          className={cn(
                            "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
                            isProminent && "prominent-glow"
                          )}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            backgroundColor: `rgba(${power.bgColor}, ${isProminent ? 0.95 : 0.7})`,
                            transform: `rotate(${-orbitRotation}deg)`, // Counter-rotate to keep icons upright
                          }}
                          onClick={() => handleBadgeClick(index)}
                          onMouseEnter={() => setHoveredPower(power.id)}
                          onMouseLeave={() => setHoveredPower(null)}
                          data-testid={`badge-${power.id}`}
                        >
                          <div className="relative z-10">
                            {power.icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Navigation Controls */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handlePrevious}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white"
                    data-testid="button-previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleNext}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 text-white"
                    data-testid="button-next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right: Info Box */}
            <div className="flex flex-col gap-6">
              {showInfoBox && (
                <Card
                  className="bg-white/10 backdrop-blur-md border-white/20 p-6 md:p-8 text-white"
                  style={{
                    animation: "fadeIn 0.5s ease-out"
                  }}
                  data-testid="card-info-box"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `rgba(${powers[selectedIndex].bgColor}, 0.9)`
                      }}
                    >
                      {powers[selectedIndex].icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2" data-testid="text-power-title">
                        {powers[selectedIndex].title}
                      </h3>
                      <p className="text-white/80" data-testid="text-power-description">
                        {powers[selectedIndex].description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 uppercase mb-2">
                        What It Is
                      </h4>
                      <p className="text-white/90" data-testid="text-what-it-is">
                        {powers[selectedIndex].content.whatItIs}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 uppercase mb-2">
                        Value Delivered
                      </h4>
                      <p className="text-white/90" data-testid="text-value">
                        {powers[selectedIndex].content.value}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 uppercase mb-2">
                        In-House Cost
                      </h4>
                      <p className="text-white/90" data-testid="text-cost">
                        {powers[selectedIndex].content.inHouseCost}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {powers[selectedIndex].details.map((detail, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30"
                        data-testid={`badge-detail-${idx}`}
                      >
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
