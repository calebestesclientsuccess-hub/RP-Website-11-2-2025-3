import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Headphones, Users, Wrench, Trophy, ArrowRight } from "lucide-react";
import gsap from "gsap";

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
    cta: "Explore AI Tools"
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
    cta: "Meet the Team"
  },
  {
    id: "support",
    title: "24/7 Support",
    icon: <Headphones className="w-6 h-6" />,
    color: "text-community",
    glowColor: "rgba(168, 85, 247, 0.4)",
    angle: 120,
    description: "Round-the-clock support ensuring your system runs without friction.",
    details: [
      "Real-time system monitoring",
      "Instant issue resolution",
      "Proactive optimization alerts"
    ],
    cta: "Learn More"
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
    cta: "See Coaching"
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
    cta: "View Stack"
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
    cta: "Join Community"
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
  const [expandedPower, setExpandedPower] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const isPausedRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [focusedPowerIndex, setFocusedPowerIndex] = useState<number>(-1);

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
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;
    
    const badges = orbitalRefs.current.filter(Boolean) as HTMLDivElement[];
    if (badges.length === 0) return;

    // Responsive orbit sizing
    const getOrbitSize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // Desktop: full orbit
        return { radiusX: 280, radiusY: 200 };
      } else if (width >= 768) {
        // Tablet: smaller orbit
        return { radiusX: 220, radiusY: 160 };
      } else {
        // Mobile: very small orbit or static
        return { radiusX: 150, radiusY: 110 };
      }
    };

    let { radiusX, radiusY } = getOrbitSize();
    const speed = 0.5; // degrees per frame at 60fps

    const animate = () => {
      if (!isPausedRef.current) {
        rotationRef.current += speed;
        if (rotationRef.current >= 360) {
          rotationRef.current -= 360;
        }
      }

      powers.forEach((power, index) => {
        const badge = badges[index];
        if (!badge) return;

        const angle = power.angle + rotationRef.current;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radiusX;
        const y = Math.sin(rad) * radiusY;

        badge.style.transform = `translate(${x}px, ${y}px)`;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Update orbit size on resize
    const handleResize = () => {
      const newSize = getOrbitSize();
      radiusX = newSize.radiusX;
      radiusY = newSize.radiusY;
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  useEffect(() => {
    if (hoveredPower) {
      isPausedRef.current = true;
    } else if (!expandedPower) {
      isPausedRef.current = false;
    }
  }, [hoveredPower, expandedPower]);

  const handlePowerHover = (powerId: string) => {
    setHoveredPower(powerId);
    setTimeout(() => {
      setExpandedPower(powerId);
    }, 300);
  };

  const handlePowerLeave = () => {
    setExpandedPower(null);
    setTimeout(() => {
      setHoveredPower(null);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePowerHover(powers[index].id);
    } else if (e.key === 'Escape') {
      handlePowerLeave();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % powers.length;
      setFocusedPowerIndex(nextIndex);
      orbitalRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + powers.length) % powers.length;
      setFocusedPowerIndex(prevIndex);
      orbitalRefs.current[prevIndex]?.focus();
    }
  };

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
    <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Central Video */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900" />
          <div className="relative z-10 w-[calc(100%-16px)] h-[calc(100%-16px)] m-2 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-xl pointer-events-auto">
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

      {/* Orbiting Powers */}
      <div className="absolute inset-0 flex items-center justify-center" role="region" aria-label="Interactive GTM System Powers">
        {powers.map((power, index) => (
          <div
            key={power.id}
            ref={el => orbitalRefs.current[index] = el}
            className="absolute focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            style={{ 
              zIndex: expandedPower === power.id ? 50 : 20,
              willChange: isVisible && !expandedPower ? 'transform' : 'auto'
            }}
            onMouseEnter={() => handlePowerHover(power.id)}
            onMouseLeave={handlePowerLeave}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="button"
            aria-label={`${power.title}: ${power.description}`}
            aria-expanded={expandedPower === power.id}
            data-testid={`orbital-power-${power.id}`}
          >
            <AnimatePresence mode="wait">
              {expandedPower === power.id ? (
                <motion.div
                  key="expanded"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: 0,
                    y: -100
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed top-20 right-4 md:top-24 md:right-8 z-50"
                >
                  <Card className="w-80 md:w-96 p-4 md:p-6 shadow-2xl backdrop-blur-lg bg-card/95 border-2" data-testid={`card-expanded-${power.id}`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div 
                        className={`${power.color} p-3 rounded-lg bg-background/50`}
                        style={{ boxShadow: `0 0 20px ${power.glowColor}` }}
                      >
                        {power.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{power.title}</h3>
                        <p className="text-sm text-muted-foreground">{power.description}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      {power.details.map((detail, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className={`${power.color} mt-1`}>•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full gap-2" 
                      variant="default"
                      data-testid={`button-cta-${power.id}`}
                    >
                      {power.cta} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="compact"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full 
                    backdrop-blur-md bg-background/80 
                    border-2 border-background/20
                    flex items-center justify-center
                    cursor-pointer transition-all
                    ${hoveredPower && hoveredPower !== power.id ? 'opacity-30 blur-sm' : 'opacity-100'}
                  `}
                  style={{ 
                    boxShadow: `0 0 30px ${power.glowColor}`,
                  }}
                  data-testid={`badge-compact-${power.id}`}
                >
                  <div className={power.color}>
                    {power.icon}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
