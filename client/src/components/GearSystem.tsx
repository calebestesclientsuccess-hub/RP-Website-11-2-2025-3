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

        {/* Glassmorphic Popup on Hover */}
        {isHovered && (
          <div
            className="absolute z-50 w-64 p-4 rounded-lg backdrop-blur-lg border pointer-events-none"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: `${color}50`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -120%)",
            }}
            data-testid={`popup-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <h4 className="font-bold mb-2" style={{ color }}>{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
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

  const gears = [
    {
      title: "Elite Talent",
      description: "A full-stack BDR, trained in our Impact Selling methodology, who operates as a strategic extension of your team.",
      icon: <Users className="w-full h-full" />,
      color: "#ef233c",
      ref: gear1Ref,
    },
    {
      title: "Tech Stack",
      description: "A complete, integrated technology stack for data, outreach, and analytics. We cover the licenses and the integration.",
      icon: <Zap className="w-full h-full" />,
      color: "#2e294e",
      ref: gear2Ref,
    },
    {
      title: "Strategic Framework",
      description: "A dedicated GTM strategist who designs your playbook, manages execution, and optimizes performance weekly.",
      icon: <Settings className="w-full h-full" />,
      color: "#9F8FFF",
      ref: gear3Ref,
    },
    {
      title: "The Signal Factory",
      description: "Our proprietary AI and data engine that uncovers private buying signals, ensuring your team is always talking to the right people at the right time.",
      icon: <Lightbulb className="w-full h-full" />,
      color: "#42349c",
      ref: gear4Ref,
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

    const ctx = gsap.context(() => {
      // Create a timeline for the scroll animation (Scenes 1-5)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "top 20%",
          scrub: 1,
          onLeave: () => {
            // Scene 6 starts when scroll animation completes (user scrolls past)
            if (!rotationStarted) {
              rotationStarted = true;
              startFullOperation();
            }
          },
          onLeaveBack: () => {
            // Reset if user scrolls back up before completion
            rotationStarted = false;
          },
        },
      });

      // Scene 1: Assembly - Gears fade in and move to position
      scrollTl.from([gear1Ref.current, gear2Ref.current, gear3Ref.current, gear4Ref.current], {
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        stagger: 0.1,
      })

      // Scene 2: Ignition - Center pulses
      .from(centerRef.current, {
        scale: 0.8,
        opacity: 0.5,
        duration: 0.3,
      }, "-=0.2")

      // Scene 3-5: Activation - Each gear activates with glow
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
      });

      // Scene 6: Full Operation - Continuous rotation after scroll completes
      function startFullOperation() {
        if (prefersReducedMotion) return; // Extra safety check
        
        gsap.to([gear1Ref.current, gear3Ref.current], {
          rotation: "+=360",
          duration: 20,
          ease: "none",
          repeat: -1,
        });
        gsap.to([gear2Ref.current, gear4Ref.current], {
          rotation: "-=360",
          duration: 15,
          ease: "none",
          repeat: -1,
        });
      }
    }, containerRef);

    return () => {
      ctx.revert(); // Cleanup GSAP context
    };
  }, []);

  return (
    <div ref={containerRef} className="relative py-16 min-h-[600px]" data-testid="gear-system">
      {/* Center Circle */}
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* Central Hub */}
          <div 
            ref={centerRef}
            className="w-48 h-48 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center animate-glow-pulse motion-reduce:!animate-none"
          >
            <div className="text-center px-4">
              <p className="text-xl font-bold text-primary">20+</p>
              <p className="text-sm text-foreground font-medium">Qualified</p>
              <p className="text-sm text-foreground font-medium">Appointments</p>
              <p className="text-xs text-muted-foreground mt-1">/ Month</p>
            </div>
          </div>

          {/* Orbiting Gears - Desktop Layout */}
          <div className="hidden md:block">
            {/* Top */}
            <div ref={gear1Ref} className="absolute -top-20 left-1/2 -translate-x-1/2">
              <Gear {...gears[0]} />
            </div>
            {/* Right */}
            <div ref={gear2Ref} className="absolute top-1/2 -right-40 -translate-y-1/2">
              <Gear {...gears[1]} />
            </div>
            {/* Bottom */}
            <div ref={gear3Ref} className="absolute -bottom-20 left-1/2 -translate-x-1/2">
              <Gear {...gears[2]} />
            </div>
            {/* Left */}
            <div ref={gear4Ref} className="absolute top-1/2 -left-40 -translate-y-1/2">
              <Gear {...gears[3]} />
            </div>
          </div>

          {/* Mobile Stack Layout - Simple fade-in animation */}
          <div className="md:hidden absolute top-full mt-8 left-1/2 -translate-x-1/2 w-full max-w-xs space-y-6">
            {gears.map((gear, index) => (
              <div 
                key={gear.title} 
                className="flex justify-center animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Gear {...gear} size="medium" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
