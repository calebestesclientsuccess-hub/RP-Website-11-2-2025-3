import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GearData {
  id: string;
  title: string;
  description: string;
  color: string;
  energyType: "community" | "competition" | "mixed";
}

const gearData: GearData[] = [
  {
    id: "talent",
    title: "Elite Talent",
    description: "A full-stack BDR, trained in our Impact Selling methodology, who operates as a strategic extension of your team.",
    color: "#9F8FFF",
    energyType: "community"
  },
  {
    id: "strategy",
    title: "Strategic Framework",
    description: "A dedicated GTM strategist who designs your playbook, manages execution, and optimizes performance weekly.",
    color: "#ef233c",
    energyType: "competition"
  },
  {
    id: "ai",
    title: "The Signal Factory",
    description: "Our proprietary AI and data engine that uncovers private buying signals, ensuring your team is always talking to the right people at the right time.",
    color: "#42349c",
    energyType: "mixed"
  },
  {
    id: "stack",
    title: "Tech Stack",
    description: "A complete, integrated technology stack for data, outreach, and analytics. We cover the licenses and the integration.",
    color: "#2e294e",
    energyType: "mixed"
  }
];

export function SentientBlueprint() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredGear, setHoveredGear] = useState<string | null>(null);
  const rotationTweensRef = useRef<Record<string, gsap.core.Tween>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    if (!mediaQuery.matches || !containerRef.current || !svgRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
          pin: false,
        }
      });

      tl.from("#blueprint-grid", {
        opacity: 0,
        duration: 0.15,
      })
      .from(".culture-particle", {
        opacity: 0,
        scale: 0,
        duration: 0.15,
        stagger: 0.02,
      }, "-=0.1")
      .from("#housing-outline", {
        strokeDashoffset: 1000,
        duration: 0.2,
      })
      .fromTo("#energy-flow-talent", {
        strokeDashoffset: 500,
      }, {
        strokeDashoffset: 0,
        duration: 0.25,
      })
      .to("#gear-talent-group", {
        opacity: 1,
        scale: 1,
        duration: 0.15,
      })
      .to("#gear-talent", {
        rotation: "+=45",
        transformOrigin: "50% 50%",
        duration: 0.15,
      }, "-=0.1")
      .fromTo("#energy-flow-strategy", {
        strokeDashoffset: 500,
      }, {
        strokeDashoffset: 0,
        duration: 0.25,
      })
      .to("#gear-strategy-group", {
        opacity: 1,
        scale: 1,
        duration: 0.15,
      })
      .to("#gear-strategy", {
        rotation: "-=45",
        transformOrigin: "50% 50%",
        duration: 0.15,
      }, "-=0.1")
      .fromTo("#energy-flow-ai", {
        strokeDashoffset: 500,
      }, {
        strokeDashoffset: 0,
        duration: 0.2,
      })
      .to("#gear-ai-group", {
        opacity: 1,
        scale: 1,
        duration: 0.15,
      })
      .to("#gear-ai", {
        rotation: "+=45",
        transformOrigin: "50% 50%",
        duration: 0.15,
      }, "-=0.1")
      .fromTo("#energy-flow-stack", {
        strokeDashoffset: 500,
      }, {
        strokeDashoffset: 0,
        duration: 0.2,
      })
      .to("#gear-stack-group", {
        opacity: 1,
        scale: 1,
        duration: 0.15,
      })
      .to("#gear-stack", {
        rotation: "-=45",
        transformOrigin: "50% 50%",
        duration: 0.15,
      }, "-=0.1")
      .call(startContinuousRotation);

      function startContinuousRotation() {
        if (Object.keys(rotationTweensRef.current).length > 0) return;
        
        rotationTweensRef.current.talent = gsap.to("#gear-talent", {
          rotation: "+=360",
          duration: 20,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
        
        rotationTweensRef.current.strategy = gsap.to("#gear-strategy", {
          rotation: "-=360",
          duration: 20,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });

        rotationTweensRef.current.ai = gsap.to("#gear-ai", {
          rotation: "+=360",
          duration: 15,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });

        rotationTweensRef.current.stack = gsap.to("#gear-stack", {
          rotation: "-=360",
          duration: 15,
          ease: "none",
          repeat: -1,
          transformOrigin: "50% 50%",
        });
      }

    }, containerRef);

    return () => {
      Object.values(rotationTweensRef.current).forEach(tween => tween.kill());
      rotationTweensRef.current = {};
      ctx.revert();
    };
  }, []);

  const handleGearHover = (gearId: string | null) => {
    if (!svgRef.current) return;
    
    setHoveredGear(gearId);

    gearData.forEach(gear => {
      const gearGroup = svgRef.current?.querySelector(`#gear-${gear.id}-group`);
      const gearElement = svgRef.current?.querySelector(`#gear-${gear.id}`);
      const rotationTween = rotationTweensRef.current[gear.id];
      
      if (!gearGroup || !gearElement) return;

      if (gearId === null) {
        gsap.to(gearGroup, { opacity: 1, scale: 1, duration: 0.3 });
        gsap.to(gearElement, { 
          filter: "drop-shadow(0 0 10px " + gear.color + ")",
          duration: 0.3 
        });
        if (rotationTween) {
          gsap.to(rotationTween, { timeScale: 1, duration: 0.3 });
        }
      } else if (gear.id === gearId) {
        gsap.to(gearGroup, { scale: 1.05, duration: 0.3 });
        gsap.to(gearElement, { 
          filter: "drop-shadow(0 0 30px " + gear.color + ")",
          duration: 0.3 
        });
        if (rotationTween) {
          gsap.to(rotationTween, { timeScale: 1, duration: 0.3 });
        }
      } else {
        gsap.to(gearGroup, { opacity: 0.5, duration: 0.3 });
        if (rotationTween) {
          gsap.to(rotationTween, { timeScale: 0.25, duration: 0.3 });
        }
      }
    });
  };

  return (
    <div ref={containerRef} className="relative py-16 min-h-[900px] overflow-visible" data-testid="sentient-blueprint">
      <div className="max-w-7xl mx-auto px-4">
        <svg
          ref={svgRef}
          viewBox="0 0 1200 900"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="blueprint-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9F8FFF" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <rect id="blueprint-grid" width="100%" height="100%" fill="url(#blueprint-grid-pattern)" />

          {[...Array(20)].map((_, i) => (
            <circle
              key={`particle-${i}`}
              className="culture-particle"
              cx={100 + (i * 50)}
              cy={100 + (Math.sin(i) * 200)}
              r="2"
              fill={i % 2 === 0 ? "#9F8FFF" : "#ef233c"}
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; ${Math.random() * 100 - 50},${Math.random() * 100 - 50}; 0,0`}
                dur={`${10 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          <rect
            id="housing-outline"
            x="300"
            y="200"
            width="600"
            height="400"
            fill="none"
            stroke="#9F8FFF"
            strokeWidth="2"
            strokeDasharray="1000"
            strokeDashoffset="0"
            opacity="0.4"
            rx="10"
          />

          <circle
            cx="600"
            cy="400"
            r="60"
            fill="rgba(239, 35, 60, 0.2)"
            stroke="#ef233c"
            strokeWidth="3"
          />
          <text x="600" y="390" textAnchor="middle" fill="#ef233c" fontSize="24" fontWeight="bold">20+</text>
          <text x="600" y="410" textAnchor="middle" fill="#fff" fontSize="14">Qualified</text>
          <text x="600" y="425" textAnchor="middle" fill="#fff" fontSize="14">Appointments</text>

          <path
            id="energy-flow-talent"
            d="M 300,100 Q 450,150 600,250"
            fill="none"
            stroke="#9F8FFF"
            strokeWidth="2"
            strokeDasharray="500"
            strokeDashoffset="500"
            filter="url(#glow)"
          />

          <g 
            id="gear-talent-group" 
            data-testid="gear-talent"
            opacity="0" 
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleGearHover('talent')}
            onMouseLeave={() => handleGearHover(null)}
          >
            <circle
              id="gear-talent"
              cx="600"
              cy="250"
              r="50"
              fill="rgba(159, 143, 255, 0.15)"
              stroke="#9F8FFF"
              strokeWidth="3"
              filter="drop-shadow(0 0 10px #9F8FFF)"
            />
            <path
              d="M 600,210 L 610,230 L 600,250 L 590,230 Z M 600,350 L 610,370 L 600,390 L 590,370 Z"
              fill="#9F8FFF"
              transform="rotate(0 600 250)"
            />
            <text x="600" y="255" textAnchor="middle" fill="#9F8FFF" fontSize="12" fontWeight="bold">ET</text>
          </g>

          <path
            id="energy-flow-strategy"
            d="M 900,100 Q 750,150 600,250"
            fill="none"
            stroke="#ef233c"
            strokeWidth="2"
            strokeDasharray="500"
            strokeDashoffset="500"
            filter="url(#glow)"
          />

          <g 
            id="gear-strategy-group" 
            data-testid="gear-strategy"
            opacity="0"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleGearHover('strategy')}
            onMouseLeave={() => handleGearHover(null)}
          >
            <circle
              id="gear-strategy"
              cx="750"
              cy="400"
              r="50"
              fill="rgba(239, 35, 60, 0.15)"
              stroke="#ef233c"
              strokeWidth="3"
              filter="drop-shadow(0 0 10px #ef233c)"
            />
            <path
              d="M 750,360 L 760,380 L 750,400 L 740,380 Z M 750,400 L 760,420 L 750,440 L 740,420 Z"
              fill="#ef233c"
            />
            <text x="750" y="405" textAnchor="middle" fill="#ef233c" fontSize="12" fontWeight="bold">SF</text>
          </g>

          <path
            id="energy-flow-ai"
            d="M 300,700 Q 450,650 600,550"
            fill="none"
            stroke="#42349c"
            strokeWidth="2"
            strokeDasharray="500"
            strokeDashoffset="500"
            filter="url(#glow)"
          />

          <g 
            id="gear-ai-group" 
            data-testid="gear-ai"
            opacity="0"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleGearHover('ai')}
            onMouseLeave={() => handleGearHover(null)}
          >
            <circle
              id="gear-ai"
              cx="600"
              cy="550"
              r="50"
              fill="rgba(66, 52, 156, 0.15)"
              stroke="#42349c"
              strokeWidth="3"
              filter="drop-shadow(0 0 10px #42349c)"
            />
            <path
              d="M 600,510 L 610,530 L 600,550 L 590,530 Z"
              fill="#42349c"
            />
            <text x="600" y="555" textAnchor="middle" fill="#42349c" fontSize="12" fontWeight="bold">AI</text>
          </g>

          <path
            id="energy-flow-stack"
            d="M 900,700 Q 750,650 600,550"
            fill="none"
            stroke="#2e294e"
            strokeWidth="2"
            strokeDasharray="500"
            strokeDashoffset="500"
            filter="url(#glow)"
          />

          <g 
            id="gear-stack-group" 
            data-testid="gear-stack"
            opacity="0"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => handleGearHover('stack')}
            onMouseLeave={() => handleGearHover(null)}
          >
            <circle
              id="gear-stack"
              cx="450"
              cy="400"
              r="50"
              fill="rgba(46, 41, 78, 0.15)"
              stroke="#2e294e"
              strokeWidth="3"
              filter="drop-shadow(0 0 10px #2e294e)"
            />
            <path
              d="M 450,360 L 460,380 L 450,400 L 440,380 Z"
              fill="#2e294e"
            />
            <text x="450" y="405" textAnchor="middle" fill="#2e294e" fontSize="12" fontWeight="bold">TS</text>
          </g>
        </svg>

        {hoveredGear && (
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 p-6 rounded-lg backdrop-blur-lg border pointer-events-none z-50"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              borderColor: gearData.find(g => g.id === hoveredGear)?.color + "50",
            }}
          >
            <h4 
              className="font-bold mb-3 text-lg"
              style={{ color: gearData.find(g => g.id === hoveredGear)?.color }}
            >
              {gearData.find(g => g.id === hoveredGear)?.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {gearData.find(g => g.id === hoveredGear)?.description}
            </p>
          </div>
        )}
      </div>

      <div className="md:hidden max-w-md mx-auto mt-8 space-y-6 px-4">
        {gearData.map((gear) => (
          <div key={gear.id} className="p-4 rounded-lg border" style={{ borderColor: gear.color + "50", backgroundColor: gear.color + "10" }}>
            <h4 className="font-bold mb-2" style={{ color: gear.color }}>{gear.title}</h4>
            <p className="text-sm text-muted-foreground">{gear.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
