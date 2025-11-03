import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

interface PowerContent {
  whatItIs: string;
  value: string;
  inHouseCost: string;
}

interface Power {
  id: string;
  title: string;
  icon: JSX.Element;
  color: string;
  glowColor: string;
  angle: number;
  description: string;
  details: string[];
  cta: string;
  link?: string;
  content: PowerContent;
}

const powers: Power[] = [
  {
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-6 h-6" />,
    color: "text-purple-dark",
    glowColor: "rgba(139, 92, 246, 0.4)",
    angle: 0,
    description: "Intelligent systems that research, personalize, and optimize at scale.",
    details: [
      "AI-powered prospect research",
      "Automated personalization engine",
      "Message optimization & A/B testing"
    ],
    cta: "Explore AI Tools",
    content: {
      whatItIs: "An advanced AI-powered system that automates prospect research, message personalization, and campaign optimization using machine learning algorithms.",
      value: "Increases response rates by 3x through hyper-personalization at scale, saving 15+ hours per week on manual research and writing.",
      inHouseCost: "$180,000/yr (AI engineer) + $50,000/yr (tools & infrastructure)"
    }
  },
  {
    id: "gtm-strategist",
    title: "GTM Strategist",
    icon: <Target className="w-6 h-6" />,
    color: "text-primary",
    glowColor: "rgba(239, 68, 68, 0.4)",
    angle: 60,
    description: "Expert strategists who design and refine your entire revenue playbook.",
    details: [
      "ICP & persona development",
      "Messaging & positioning strategy",
      "Multi-channel campaign design"
    ],
    cta: "Meet the Team",
    content: {
      whatItIs: "Senior GTM experts with 10+ years experience designing and executing revenue strategies for B2B SaaS companies from Series A to IPO.",
      value: "Reduces time to product-market fit by 6-12 months. Increases pipeline velocity by 40% through proven frameworks.",
      inHouseCost: "$250,000/yr (VP of Marketing) + $150,000/yr (Strategy Consultant)"
    }
  },
  {
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-6 h-6" />,
    color: "text-community",
    glowColor: "rgba(168, 85, 247, 0.4)",
    angle: 120,
    description: "Full revenue operations management ensuring seamless system performance.",
    details: [
      "CRM & tool optimization",
      "Data hygiene & reporting",
      "Process automation & workflows"
    ],
    cta: "Learn More",
    content: {
      whatItIs: "Complete revenue operations management including CRM optimization, data orchestration, and process automation across all GTM systems.",
      value: "Eliminates 20+ hours/week of manual tasks, improves data accuracy to 99%, and provides real-time performance visibility.",
      inHouseCost: "$140,000/yr (RevOps Manager) + $30,000/yr (tools & integrations)"
    }
  },
  {
    id: "coach",
    title: "Elite Coach",
    icon: <Users className="w-6 h-6" />,
    color: "text-community",
    glowColor: "rgba(168, 85, 247, 0.4)",
    angle: 180,
    description: "World-class coaching that elevates your BDRs to top 1% performance.",
    details: [
      "Daily skill development",
      "Real-time call coaching",
      "Performance analytics & feedback"
    ],
    cta: "See Coaching",
    content: {
      whatItIs: "Elite sales coaches who've trained top 1% BDRs at companies like Salesforce, MongoDB, and Snowflake, providing daily 1:1 and group coaching.",
      value: "Accelerates ramp time from 3 months to 3 weeks. Increases meeting conversion rates by 2.5x through proven methodologies.",
      inHouseCost: "$175,000/yr (Sales Enablement Manager) + $60,000/yr (training programs)"
    }
  },
  {
    id: "tools",
    title: "Tech Stack",
    icon: <Wrench className="w-6 h-6" />,
    color: "text-primary",
    glowColor: "rgba(239, 68, 68, 0.4)",
    angle: 240,
    description: "Best-in-class tools integrated and optimized for maximum efficiency.",
    details: [
      "Multi-channel outreach platform",
      "Intent data & enrichment",
      "Advanced analytics dashboard"
    ],
    cta: "View Stack",
    content: {
      whatItIs: "Pre-integrated stack of 15+ enterprise tools including Outreach, ZoomInfo, 6sense, Gong, and custom automation platforms.",
      value: "Saves $200,000+ in annual tool costs through volume licensing. Eliminates 3-month implementation timeline.",
      inHouseCost: "$120,000/yr (tools) + $50,000 (implementation) + $30,000/yr (maintenance)"
    }
  },
  {
    id: "community",
    title: "Community & Competition",
    icon: <Trophy className="w-6 h-6" />,
    color: "text-community",
    glowColor: "rgba(168, 85, 247, 0.4)",
    angle: 300,
    description: "A culture of collaboration and healthy competition that drives results.",
    details: [
      "Peer learning & knowledge sharing",
      "Gamified performance tracking",
      "Team challenges & rewards"
    ],
    cta: "Join Community",
    content: {
      whatItIs: "Private community of 500+ elite BDRs sharing tactics, templates, and strategies with gamified challenges and monthly competitions.",
      value: "Increases team performance by 35% through peer learning. Reduces turnover by 50% through engagement and culture.",
      inHouseCost: "$100,000/yr (Community Manager) + $50,000/yr (platform & rewards)"
    }
  }
];

interface OrbitalPowersProps {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function OrbitalPowers({ videoSrc, videoRef }: OrbitalPowersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredPower, setHoveredPower] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const isPausedRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationStopped, setAnimationStopped] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const speedRef = useRef(0.5); // Starting speed
  const slowdownRef = useRef(false);
  const videoDurationRef = useRef<number>(0);
  const radiusRef = useRef({ x: 280, y: 200 });
  
  // Cycling state management
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [cyclingEnabled, setCyclingEnabled] = useState(false);
  const targetRotationRef = useRef(0);
  const isRotatingRef = useRef(false); // Controls button disabled state during rotation
  const forceInteractiveRef = useRef(false); // Fallback for when video fails
  const [hasInteracted, setHasInteracted] = useState(false); // Track if user has interacted

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = mediaQuery.matches;
    setPrefersReducedMotion(isReduced);
    
    // If reduced motion, show interactive state immediately
    if (isReduced) {
      speedRef.current = 0;
      setAnimationStopped(true);
      setIsExpanded(true);
      setShowLabels(true);
      forceInteractiveRef.current = true;
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        speedRef.current = 0;
        setAnimationStopped(true);
        setIsExpanded(true);
        setShowLabels(true);
        forceInteractiveRef.current = true;
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for video metadata and handle timing
  useEffect(() => {
    if (!videoRef) return;  // Guard clause to check if videoRef exists
    const video = videoRef.current;
    
    // Fallback timer if video doesn't play
    const fallbackTimer = setTimeout(() => {
      if (!forceInteractiveRef.current && speedRef.current > 0) {
        forceInteractiveRef.current = true;
        slowdownRef.current = true;
        
        setTimeout(() => {
          speedRef.current = 0;
          setAnimationStopped(true);
          setIsExpanded(true);
          
          setTimeout(() => {
            setShowLabels(true);
          }, 1000);
        }, 2000);
      }
    }, 5000); // 5 second fallback
    
    if (!video) return () => clearTimeout(fallbackTimer);

    const handleLoadedMetadata = () => {
      videoDurationRef.current = video.duration;
      
      // Calculate when to start slowdown (2.5 seconds before end)
      const slowdownTime = Math.max(0, (video.duration - 2.5) * 1000); // Convert to milliseconds
      
      // Start the slowdown timer
      const slowdownTimer = setTimeout(() => {
        slowdownRef.current = true;
        
        // After 2 seconds of slowdown, stop completely and expand
        setTimeout(() => {
          speedRef.current = 0;
          setAnimationStopped(true);
          setIsExpanded(true);
          
          // After expansion animation (1 second), show labels
          setTimeout(() => {
            setShowLabels(true);
          }, 1000);
        }, 2000);
      }, slowdownTime);
      
      clearTimeout(fallbackTimer);
      return () => clearTimeout(slowdownTimer);
    };

    const handleVideoPlay = () => {
      // Reset animation state when video restarts (but not if force interactive)
      if (!forceInteractiveRef.current) {
        speedRef.current = 0.5;
        slowdownRef.current = false;
        setAnimationStopped(false);
        setIsExpanded(false);
        setShowLabels(false);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handleVideoPlay);
    
    // If metadata is already loaded
    if (video.duration && !isNaN(video.duration)) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handleVideoPlay);
      clearTimeout(fallbackTimer);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;
    
    const badges = orbitalRefs.current.filter(Boolean) as HTMLDivElement[];
    if (badges.length === 0) return;

    // Responsive orbit sizing - using golden ratio (1.618)
    const getOrbitSize = () => {
      const width = window.innerWidth;
      const goldenRatio = 1.618;
      
      if (width >= 1024) {
        // Desktop: golden ratio proportions
        const baseRadius = 280;
        return { radiusX: Math.round(baseRadius * goldenRatio), radiusY: baseRadius }; // 453x280
      } else if (width >= 768) {
        // Tablet: scaled golden ratio
        const baseRadius = 220;
        return { radiusX: Math.round(baseRadius * goldenRatio), radiusY: baseRadius }; // 356x220
      } else {
        // Mobile: compact golden ratio
        const baseRadius = 160;
        return { radiusX: Math.round(baseRadius * goldenRatio), radiusY: baseRadius }; // 259x160
      }
    };

    let { radiusX, radiusY } = getOrbitSize();
    radiusRef.current = { x: radiusX, y: radiusY };
    
    // Target radius for expansion - also using golden ratio
    const expansionFactor = 1.382; // Smaller golden ratio increment
    const targetRadiusX = Math.round(radiusX * expansionFactor);
    const targetRadiusY = Math.round(radiusY * expansionFactor);

    const animate = () => {
      // Gradually slow down when triggered
      if (slowdownRef.current && speedRef.current > 0.01) {
        speedRef.current *= 0.96; // Exponential decay
        if (speedRef.current < 0.01) {
          speedRef.current = 0; // Stop completely
        }
      }

      // Handle expansion animation
      if (isExpanded && radiusRef.current.x < targetRadiusX) {
        const expansionSpeed = 3;
        radiusRef.current.x = Math.min(radiusRef.current.x + expansionSpeed, targetRadiusX);
        radiusRef.current.y = Math.min(radiusRef.current.y + expansionSpeed * 0.8, targetRadiusY);
      }

      if (!isPausedRef.current && speedRef.current > 0) {
        rotationRef.current += speedRef.current;
        if (rotationRef.current >= 360) {
          rotationRef.current -= 360;
        }
      }

      powers.forEach((power, index) => {
        const badge = badges[index];
        if (!badge) return;

        const angle = power.angle + rotationRef.current;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radiusRef.current.x;
        const y = Math.sin(rad) * radiusRef.current.y;

        badge.style.transform = `translate(${x}px, ${y}px)`;
      });

      if (speedRef.current > 0 || !showLabels || (isExpanded && radiusRef.current.x < targetRadiusX)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Update orbit size on resize
    const handleResize = () => {
      const newSize = getOrbitSize();
      radiusRef.current = { x: newSize.radiusX, y: newSize.radiusY };
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, showLabels, isExpanded]);

  // Simple hover effect for badges
  const handlePowerHover = (powerId: string) => {
    setHoveredPower(powerId);
  };

  const handlePowerLeave = () => {
    setHoveredPower(null);
  };

  // Enable cycling after labels are shown
  useEffect(() => {
    if (showLabels) {
      const timer = setTimeout(() => {
        setCyclingEnabled(true);
        setShowInfoBox(true);
        isRotatingRef.current = false; // Ensure buttons are enabled
      }, 300); // Faster response
      return () => clearTimeout(timer);
    }
  }, [showLabels]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!cyclingEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        cyclePower('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        cyclePower('right');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cyclingEnabled, selectedIndex]);

  // Cycling functions
  const cyclePower = (direction: 'left' | 'right') => {
    if (!cyclingEnabled || isRotatingRef.current) return;
    
    setHasInteracted(true); // Mark that user has interacted
    
    const newIndex = direction === 'left' 
      ? (selectedIndex - 1 + powers.length) % powers.length
      : (selectedIndex + 1) % powers.length;
    
    setSelectedIndex(newIndex);
    
    // Calculate rotation to bring selected power to 3 o'clock position
    const selectedPower = powers[newIndex];
    const targetAngle = 360 - selectedPower.angle; // Reverse rotation to bring to 0° (3 o'clock)
    targetRotationRef.current = targetAngle;
    isRotatingRef.current = true;
  };

  const handleBadgeClick = (clickedIndex: number) => {
    if (!cyclingEnabled || isRotatingRef.current || clickedIndex === selectedIndex) return;
    
    setHasInteracted(true); // Mark interaction
    
    // Calculate shortest path to clicked badge
    const distance = clickedIndex - selectedIndex;
    const stepsClockwise = (distance + powers.length) % powers.length;
    const stepsCounterclockwise = powers.length - stepsClockwise;
    
    // Choose shortest path
    if (stepsClockwise <= stepsCounterclockwise) {
      // Cycle clockwise
      for (let i = 0; i < stepsClockwise; i++) {
        setTimeout(() => cyclePower('right'), i * 200);
      }
    } else {
      // Cycle counterclockwise
      for (let i = 0; i < stepsCounterclockwise; i++) {
        setTimeout(() => cyclePower('left'), i * 200);
      }
    }
  };

  // Smooth rotation animation for cycling
  useEffect(() => {
    if (!isRotatingRef.current) return;
    
    const animate = () => {
      const diff = targetRotationRef.current - rotationRef.current;
      const normalizedDiff = ((diff % 360) + 540) % 360 - 180;
      
      if (Math.abs(normalizedDiff) > 0.5) {
        rotationRef.current += normalizedDiff * 0.15; // Smooth interpolation
        
        // Update badge positions
        const badges = orbitalRefs.current.filter(Boolean) as HTMLDivElement[];
        powers.forEach((power, index) => {
          const badge = badges[index];
          if (!badge) return;
          
          const angle = power.angle + rotationRef.current;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radiusRef.current.x;
          const y = Math.sin(rad) * radiusRef.current.y;
          
          badge.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        requestAnimationFrame(animate);
      } else {
        rotationRef.current = targetRotationRef.current;
        isRotatingRef.current = false;
      }
    };
    
    requestAnimationFrame(animate);
  }, [selectedIndex]);

  // Reduced motion: show static grid instead of orbital animation
  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} className="relative w-full">
        {/* Video */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900" />
            <div className="relative z-10 w-[calc(100%-16px)] h-[calc(100%-16px)] m-2 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-xl">
              <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                data-testid="video-bdr-pod"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Static Grid of Powers */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto" role="region" aria-label="GTM System Powers">
          {powers.map((power) => (
            <Card key={power.id} className="p-6 text-center hover-elevate" data-testid={`card-power-${power.id}`}>
              <div 
                className={`${power.color} mb-4 flex justify-center`}
                style={{ filter: `drop-shadow(0 0 10px ${power.glowColor})` }}
              >
                {power.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{power.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{power.description}</p>
              <Button size="sm" variant="outline" className="w-full" data-testid={`button-cta-${power.id}`}>
                {power.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative h-[600px] md:h-[700px] lg:h-[900px] flex items-center justify-center overflow-visible">
        {/* Central Video - Maximized with Futuristic Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-[28rem] h-[28rem] md:w-[40rem] md:h-[40rem] lg:w-[56rem] lg:h-[56rem] p-4">
            <div 
              className="relative z-10 w-full h-full pointer-events-auto rounded-sm"
              style={{
                border: '2px solid #b8b8b8',
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.05), rgba(232, 232, 232, 0.02))',
                boxShadow: `
                  0 0 40px rgba(59, 130, 246, 0.5),
                  0 0 60px rgba(139, 92, 246, 0.4),
                  0 0 80px rgba(236, 72, 153, 0.3),
                  0 0 100px rgba(99, 102, 241, 0.25),
                  inset 0 1px 2px rgba(255, 255, 255, 0.2),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.3)
                `
              }}
            >
              <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-contain rounded-sm"
                muted
                playsInline
                preload="none"
                data-testid="video-bdr-pod"
                onError={(e) => console.error("Video error:", e)}
                onCanPlay={() => console.log("Video can play:", videoSrc)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Orbiting Powers */}
        <div className="absolute inset-0 flex items-center justify-center" role="region" aria-label="Interactive GTM System Powers">
        {powers.map((power, index) => (
          <div
            key={power.id}
            ref={el => orbitalRefs.current[index] = el}
            className="absolute focus:outline-none"
            style={{ 
              zIndex: 20,
              willChange: isVisible && speedRef.current > 0 ? 'transform' : 'auto'
            }}
            onMouseEnter={() => handlePowerHover(power.id)}
            onMouseLeave={handlePowerLeave}
            data-testid={`orbital-power-${power.id}`}
          >
            <AnimatePresence mode="wait">
              {showLabels && animationStopped ? (
                // Show labels after expansion completes
                <motion.div
                  key="label"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: selectedIndex === index ? 1.1 : 1,
                    opacity: 1
                  }}
                  whileHover={{ scale: selectedIndex === index ? 1.15 : 1.05 }}
                  transition={{ 
                    delay: index * 0.1, // Staggered appearance
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20 
                  }}
                  className={`
                    px-4 py-3 rounded-xl
                    backdrop-blur-md 
                    ${selectedIndex === index ? 'bg-background' : 'bg-background/95'}
                    ${selectedIndex === index ? 'border-4' : 'border-2'} 
                    ${selectedIndex === index ? 'border-primary/50' : 'border-background/30'}
                    flex items-center gap-3
                    transition-all cursor-pointer
                    ${hoveredPower === power.id ? 'shadow-2xl' : 'shadow-lg'}
                  `}
                  style={{ 
                    boxShadow: selectedIndex === index 
                      ? `0 0 120px ${power.glowColor}, 0 0 60px ${power.glowColor}` 
                      : hoveredPower === power.id 
                        ? `0 0 80px ${power.glowColor}, 0 0 40px ${power.glowColor}` 
                        : `0 0 60px ${power.glowColor}, 0 0 30px ${power.glowColor}`,
                  }}
                  onClick={() => handleBadgeClick(index)}
                  data-testid={`label-${power.id}`}
                  role="button"
                  aria-pressed={selectedIndex === index}
                  aria-label={`${power.title} - ${selectedIndex === index ? 'Selected' : 'Click to select'}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBadgeClick(index);
                    }
                  }}
                >
                  <div className={`${power.color} flex-shrink-0 scale-125`}>
                    {power.icon}
                  </div>
                  <span className="font-bold text-base whitespace-nowrap">{power.title}</span>
                </motion.div>
              ) : (
                // Badge during orbital animation (with expansion effect)
                <motion.div
                  key="compact"
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isExpanded ? 1.3 : 1,
                  }}
                  whileHover={{ scale: isExpanded ? 1.35 : 1.1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20 
                  }}
                  className={`
                    ${isExpanded ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'} 
                    rounded-full 
                    backdrop-blur-md bg-background/80 
                    border-2 border-background/20
                    flex items-center justify-center
                    cursor-pointer transition-all
                    ${hoveredPower && hoveredPower !== power.id ? 'opacity-30 blur-sm' : 'opacity-100'}
                  `}
                  style={{ 
                    boxShadow: isExpanded 
                      ? `0 0 60px ${power.glowColor}, 0 0 30px ${power.glowColor}` 
                      : `0 0 30px ${power.glowColor}`,
                  }}
                  onClick={() => cyclingEnabled && handleBadgeClick(index)}
                  data-testid={`badge-compact-${power.id}`}
                >
                  <div className={`${power.color} ${isExpanded ? 'scale-125' : ''}`}>
                    {power.icon}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        </div>



        {/* Info Box for Selected Power - Positioned to avoid overlaps */}
        <AnimatePresence>
          {showInfoBox && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, zIndex: 45 }}
              exit={{ opacity: 0, x: 50, zIndex: 45 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block max-w-md"
              style={{ 
                position: 'absolute',
                zIndex: 45,
                right: '2rem',
                top: 'calc(50% - 60px)', // Adjusted to account for navigation
                transform: 'translateY(-50%)'
              }}
            >
              <div className="relative backdrop-blur-xl bg-background/95 rounded-2xl border border-primary/20 p-8 shadow-2xl" style={{ zIndex: 45 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Power Title with Icon */}
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className={`${powers[selectedIndex].color} scale-150`}
                        style={{ filter: `drop-shadow(0 0 20px ${powers[selectedIndex].glowColor})` }}
                      >
                        {powers[selectedIndex].icon}
                      </div>
                      <h3 className="text-2xl font-bold">{powers[selectedIndex].title}</h3>
                    </div>

                    {/* What It Is */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">What It Is</h4>
                      <p className="text-sm leading-relaxed">{powers[selectedIndex].content.whatItIs}</p>
                    </div>

                    {/* Value */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Value</h4>
                      <p className="text-sm leading-relaxed">{powers[selectedIndex].content.value}</p>
                    </div>

                    {/* In-House Cost */}
                    <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">If You Built It In-House</h4>
                      <p className="text-lg font-bold text-primary">{powers[selectedIndex].content.inHouseCost}</p>
                    </div>

                    {/* Navigation Arrows in Info Box */}
                    <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-border/50">
                      <button
                        onClick={() => cyclePower('left')}
                        disabled={!cyclingEnabled}
                        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-primary/30 hover:bg-background hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-prev-power"
                        aria-label="Previous Power"
                      >
                        <ChevronLeft className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Previous</span>
                      </button>

                      <div className="flex gap-1.5">
                        {powers.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              index === selectedIndex 
                                ? 'w-8 bg-primary' 
                                : 'w-1.5 bg-primary/30'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => cyclePower('right')}
                        disabled={!cyclingEnabled}
                        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 border border-primary/30 hover:bg-background hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-next-power"
                        aria-label="Next Power"
                      >
                        <span className="text-sm font-medium">Next</span>
                        <ChevronRight className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Info Box - Below Navigation Controls */}
      <AnimatePresence>
        {showInfoBox && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mt-24 px-4 lg:hidden"
          >
            <div className="backdrop-blur-xl bg-background/95 rounded-2xl border border-primary/20 p-6 shadow-2xl max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Power Title with Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className={`${powers[selectedIndex].color} scale-125`}
                      style={{ filter: `drop-shadow(0 0 15px ${powers[selectedIndex].glowColor})` }}
                    >
                      {powers[selectedIndex].icon}
                    </div>
                    <h3 className="text-xl font-bold">{powers[selectedIndex].title}</h3>
                  </div>

                  {/* What It Is */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">What It Is</h4>
                    <p className="text-xs leading-relaxed">{powers[selectedIndex].content.whatItIs}</p>
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">Value</h4>
                    <p className="text-xs leading-relaxed">{powers[selectedIndex].content.value}</p>
                  </div>

                  {/* In-House Cost */}
                  <div className="p-3 rounded-lg bg-background/50 border border-primary/20">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">If You Built It In-House</h4>
                    <p className="text-sm font-bold text-primary">{powers[selectedIndex].content.inHouseCost}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
