import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, ChevronLeft, ChevronRight } from "lucide-react";

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

interface SimplifiedOrbitalPowersProps {
  videoSrc: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * SimplifiedOrbitalPowers: Clean orbital badges around video
 * Simplified version with just the core interaction
 */
export function SimplifiedOrbitalPowers({ videoSrc, videoRef }: SimplifiedOrbitalPowersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Simple intersection observer to trigger video play once
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayed) {
            videoRef.current?.play().catch(console.error);
            setHasPlayed(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasPlayed, videoRef]);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + powers.length) % powers.length);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % powers.length);
  };

  const selectedPower = powers[selectedIndex];

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 bg-background" data-testid="section-orbital-powers">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            Your Fullstack Sales Unit
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Not just BDRs. A complete system engineered to deliver predictable revenue.
          </p>
        </div>

        {/* Main Container */}
        <div ref={containerRef} className="relative mx-auto" style={{ maxWidth: '900px' }}>
          {/* Orbital Container */}
          <div className="relative mx-auto h-[600px] md:h-[700px] flex items-center justify-center">
            
            {/* Central Video */}
            <div className="relative z-20">
              <div 
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: 'min(90vw, 640px)',
                  height: 'min(50vh, 360px)',
                  boxShadow: `
                    0 0 0 2px rgba(192, 192, 192, 0.3),
                    0 0 40px rgba(59, 130, 246, 0.3),
                    0 0 80px rgba(168, 85, 247, 0.2),
                    0 0 120px rgba(236, 72, 153, 0.15),
                    0 0 160px rgba(249, 115, 22, 0.1)
                  `
                }}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain bg-black"
                  src={videoSrc}
                  muted
                  playsInline
                  controls={false}
                  data-testid="orbital-video"
                />
              </div>
            </div>

            {/* Static Orbital Badges */}
            <div className="absolute inset-0 pointer-events-none">
              {powers.map((power, index) => {
                const radius = 320;
                const angleRad = (power.angle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius * 0.6; // Elliptical orbit
                
                return (
                  <div
                    key={power.id}
                    className="absolute left-1/2 top-1/2 pointer-events-auto"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedIndex(index);
                        setShowInfoBox(true);
                      }}
                      className="group cursor-pointer transition-all duration-300 hover:scale-110"
                      data-testid={`power-badge-${power.id}`}
                    >
                      <div 
                        className={`
                          relative rounded-full p-3 bg-background/90 backdrop-blur-sm
                          border-2 ${power.color} shadow-lg
                          group-hover:shadow-xl transition-all duration-300
                        `}
                        style={{
                          boxShadow: `0 0 20px ${power.glowColor}`
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
            <Card className="mt-4 p-6 bg-background/95 backdrop-blur-sm border-2" data-testid="power-info-box">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`p-2 rounded-full ${selectedPower.color}`}
                      style={{ backgroundColor: `${selectedPower.glowColor}20` }}
                    >
                      {selectedPower.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{selectedPower.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={handlePrevious}
                      data-testid="button-previous-power"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={handleNext}
                      data-testid="button-next-power"
                    >
                      <ChevronRight className="h-4 w-4" />
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

                <Button variant="default" className="w-full" data-testid={`button-cta-${selectedPower.id}`}>
                  {selectedPower.cta}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}