import { useState, useEffect, useRef } from "react";
import { Settings, Users, Zap, Lightbulb } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

interface GearProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  size?: "small" | "medium" | "large";
  rotationSpeed?: number;
}

function Gear({ title, description, icon, color, size = "medium", rotationSpeed = 20 }: GearProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: "w-20 h-20",
    medium: "w-32 h-32",
    large: "w-40 h-40",
  };

  const iconSizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} relative cursor-pointer`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`gear-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {/* Gear Circle */}
        <div
          className={`w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-300 motion-reduce:!animate-none`}
          style={{
            borderColor: color,
            backgroundColor: `${color}15`,
            boxShadow: isHovered ? `0 0 30px ${color}80` : `0 0 15px ${color}40`,
          }}
        >
          <div className={iconSizeClasses[size]} style={{ color }}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GearSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const gear1Ref = useRef<HTMLDivElement>(null);
  const gear2Ref = useRef<HTMLDivElement>(null);
  const gear3Ref = useRef<HTMLDivElement>(null);
  const gear4Ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const gears = [
    {
      title: "Elite Talent",
      description: "Top-tier BDRs and SDRs who know how to convert prospects into conversations",
      icon: <Users className="w-full h-full" />,
      color: "#ef233c",
    },
    {
      title: "Complete Tech Stack",
      description: "Fully integrated martech infrastructure that captures, tracks, and optimizes every interaction",
      icon: <Zap className="w-full h-full" />,
      color: "#2e294e",
    },
    {
      title: "Strategic Framework",
      description: "Proven playbooks and methodologies that turn conversations into qualified opportunities",
      icon: <Settings className="w-full h-full" />,
      color: "#9F8FFF",
    },
    {
      title: "AI-Powered by Humans",
      description: "Intelligence-augmented workflows that maximize efficiency without losing the human touch",
      icon: <Lightbulb className="w-full h-full" />,
      color: "#42349c",
    },
  ];

  useEffect(() => {
    // Only run on desktop (md breakpoint and above)
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    if (!mediaQuery.matches || !containerRef.current) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rotationStarted = false;
    let rotationTweens: gsap.core.Tween[] = [];

    const ctx = gsap.context(() => {
      // Create a timeline for the scroll animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "top 20%",
          scrub: 1,
          onLeave: () => {
            if (!rotationStarted) {
              rotationStarted = true;
              startFullOperation();
            }
          },
          onLeaveBack: () => {
            rotationStarted = false;
            stopFullOperation();
          },
        },
      });

      // Animate heading and subtitle first
      scrollTl.from(textRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.5,
      })

      // Then animate gears
      .from([gear1Ref.current, gear2Ref.current, gear3Ref.current, gear4Ref.current], {
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        stagger: 0.1,
      }, "-=0.3")

      // Animate center
      .from(centerRef.current, {
        scale: 0.8,
        opacity: 0.5,
        duration: 0.3,
      }, "-=0.2")

      // Activation glow for each gear
      .to(gear1Ref.current, {
        filter: "drop-shadow(0 0 20px #ef233c)",
        duration: 0.2,
      })
      .to(gear2Ref.current, {
        filter: "drop-shadow(0 0 20px #2e294e)",
        duration: 0.2,
      })
      .to(gear3Ref.current, {
        filter: "drop-shadow(0 0 20px #9F8FFF)",
        duration: 0.2,
      })
      .to(gear4Ref.current, {
        filter: "drop-shadow(0 0 20px #42349c)",
        duration: 0.2,
      })
      
      // Finally animate the stats
      .from(statsRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.5,
      }, "-=0.3");

      // Full Operation - Continuous rotation after scroll completes
      function startFullOperation() {
        if (prefersReducedMotion) return;
        
        rotationTweens.push(
          gsap.to([gear1Ref.current, gear3Ref.current], {
            rotation: "+=360",
            duration: 20,
            ease: "none",
            repeat: -1,
          })
        );
        rotationTweens.push(
          gsap.to([gear2Ref.current, gear4Ref.current], {
            rotation: "-=360",
            duration: 15,
            ease: "none",
            repeat: -1,
          })
        );
      }

      function stopFullOperation() {
        rotationTweens.forEach((tween) => {
          tween.kill();
        });
        rotationTweens = [];
        
        if (gear1Ref.current && gear2Ref.current && gear3Ref.current && gear4Ref.current) {
          gsap.to([gear1Ref.current, gear2Ref.current, gear3Ref.current, gear4Ref.current], {
            rotation: 0,
            duration: 0.3,
            onComplete: () => {
              gsap.set([gear1Ref.current, gear2Ref.current, gear3Ref.current, gear4Ref.current], {
                clearProps: "rotation,transform",
              });
            },
          });
        }
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-16" data-testid="gear-system">
      {/* Header Section */}
      <div ref={textRef} className="text-center mb-12 max-w-4xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          The Complete <span className="text-primary">GTM Machine</span>
        </h2>
        <p className="text-xl text-muted-foreground">
          Not just pieces. Not just tools. A complete system working together to generate qualified pipeline.
        </p>
      </div>

      {/* Main Gear System with Integrated Text - Desktop */}
      <div className="hidden md:block relative max-w-7xl mx-auto px-6 min-h-[700px]">
        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div 
            ref={centerRef}
            className="w-48 h-48 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center animate-glow-pulse motion-reduce:!animate-none"
          >
            <div className="text-center px-4">
              <p className="text-3xl font-bold text-primary">GTM</p>
              <p className="text-sm text-foreground font-medium">Engine</p>
            </div>
          </div>
        </div>

        {/* Top Gear with Text */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div ref={gear1Ref} data-testid="gear-wrapper-1">
            <Gear {...gears[0]} />
          </div>
          <div className="mt-4 text-center max-w-xs mx-auto">
            <h3 className="font-bold text-lg mb-2" style={{ color: gears[0].color }}>{gears[0].title}</h3>
            <p className="text-sm text-muted-foreground">{gears[0].description}</p>
          </div>
        </div>

        {/* Right Gear with Text */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          <div className="flex items-center gap-6">
            <div className="text-right max-w-xs">
              <h3 className="font-bold text-lg mb-2" style={{ color: gears[1].color }}>{gears[1].title}</h3>
              <p className="text-sm text-muted-foreground">{gears[1].description}</p>
            </div>
            <div ref={gear2Ref} data-testid="gear-wrapper-2">
              <Gear {...gears[1]} />
            </div>
          </div>
        </div>

        {/* Bottom Gear with Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="text-center max-w-xs mx-auto mb-4">
            <h3 className="font-bold text-lg mb-2" style={{ color: gears[2].color }}>{gears[2].title}</h3>
            <p className="text-sm text-muted-foreground">{gears[2].description}</p>
          </div>
          <div ref={gear3Ref} data-testid="gear-wrapper-3">
            <Gear {...gears[2]} />
          </div>
        </div>

        {/* Left Gear with Text */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <div className="flex items-center gap-6">
            <div ref={gear4Ref} data-testid="gear-wrapper-4">
              <Gear {...gears[3]} />
            </div>
            <div className="max-w-xs">
              <h3 className="font-bold text-lg mb-2" style={{ color: gears[3].color }}>{gears[3].title}</h3>
              <p className="text-sm text-muted-foreground">{gears[3].description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-6">
        {/* Central Hub for Mobile */}
        <div className="flex justify-center mb-8">
          <div 
            ref={centerRef}
            className="w-40 h-40 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center animate-glow-pulse motion-reduce:!animate-none"
          >
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-primary">GTM</p>
              <p className="text-sm text-foreground font-medium">Engine</p>
            </div>
          </div>
        </div>

        {/* Gears with Text for Mobile */}
        <div className="space-y-8">
          {gears.map((gear, index) => (
            <div 
              key={gear.title} 
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-3">
                <Gear {...gear} size="small" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2" style={{ color: gear.color }}>{gear.title}</h3>
                <p className="text-sm text-muted-foreground">{gear.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="mt-16 text-center px-6">
        <div className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-5xl md:text-6xl font-bold text-primary">20+</div>
            <div className="text-left">
              <div className="text-xl font-bold">Qualified Appointments</div>
              <div className="text-muted-foreground">Every month, like clockwork</div>
            </div>
          </div>
          <p className="text-muted-foreground">
            That's what happens when all four components work together seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
