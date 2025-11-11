import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Settings, Users, Wrench, Trophy, Play } from "lucide-react";
import { gsap } from 'gsap';
import { prefersReducedMotion } from "@/lib/animationConfig";

// Simple fade-in for info box
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
    icon: <Brain className="w-6 h-6" strokeWidth={2} style={{ stroke: "#5E4DB8" }} />,
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
    icon: <Target className="w-6 h-6" strokeWidth={2} style={{ stroke: "#ef233c" }} />,
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
    icon: <Settings className="w-6 h-6" strokeWidth={2} style={{ stroke: "#D25A28" }} />,
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
    icon: <Users className="w-6 h-6" strokeWidth={2} style={{ stroke: "#9F8FFF" }} />,
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
    icon: <Wrench className="w-6 h-6" strokeWidth={2} style={{ stroke: "#4CAF50" }} />,
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
  const [selectedIndex] = useState(2);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const orbitAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activePowerIndex, setActivePowerIndex] = useState(2); // Initialize with the same index as selectedIndex


  // Simple continuous rotation - starts when section is in view
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const rotationObj = { value: 0 };

    // Slow, steady 60-second rotation
    orbitAnimationRef.current = gsap.to(rotationObj, {
      value: 360,
      duration: 60,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        const currentRotation = rotationObj.value % 360;
        setOrbitRotation(currentRotation);
        
        // Calculate which power is closest to bottom (270° position)
        const targetAngle = 270;
        let closestIndex = 0;
        let smallestDiff = 360;
        
        powers.forEach((power, index) => {
          // Calculate the actual position of this icon after rotation
          const iconPosition = (power.angle + currentRotation) % 360;
          
          // Calculate the smallest angular difference to 270°
          let diff = Math.abs(iconPosition - targetAngle);
          if (diff > 180) diff = 360 - diff;
          
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestIndex = index;
          }
        });
        
        // Only update if the closest index has changed
        setActivePowerIndex(closestIndex);
      }
    });

    return () => {
      orbitAnimationRef.current?.kill();
    };
  }, []);





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

    video.addEventListener('error', handleError);

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
      observer.disconnect();
    };
  }, [hasPlayed, videoError, videoRef]);





  const selectedPower = powers[selectedIndex] || powers[0];

  // Dummy variable for videoEl as it's not directly used in the provided original snippet's HTML structure
  // In a real scenario, this would be the actual video element or its container.
  const videoEl = (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: window.innerWidth < 768 ? 'min(85vw, 320px)' : 'min(90vw, 640px)',
        height: window.innerWidth < 768 ? 'min(35vh, 200px)' : 'min(50vh, 360px)',
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
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-1">
            <span className="gradient-text gradient-hero">The Fullstack Sales Unit</span>
          </h2>
          <p className="text-2xl md:text-3xl italic max-w-3xl mx-auto mb-0">
            Elite Sales Talent, equipped and trained by RP Architects.
          </p>
        </div>

        {/* Main Container */}
        <div className="relative mx-auto -mt-6" style={{ maxWidth: '900px' }} data-testid="orbital-container">
          {/* Orbital Container - Adjusted height for mobile */}
          <div className="relative mx-auto h-[450px] md:h-[600px] flex items-center justify-center">

            {/* Central Video */}
            <div className="relative z-20">
              {videoEl}
            </div>

            {/* Orbital Badges - Static, no interactivity */}
            <div className="orbital-badges-container absolute inset-0 pointer-events-none">
              {powers.map((power, index) => {
                const isMobile = window.innerWidth < 768;
                const radius = isMobile ? 180 : 320;
                const totalAngle = power.angle + orbitRotation;
                const angleRad = (totalAngle * Math.PI) / 180;
                const x = Math.cos(angleRad) * radius;
                const yScale = isMobile ? 0.8 : 0.6;
                const y = Math.sin(angleRad) * radius * yScale;

                return (
                  <div
                    key={power.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      zIndex: 30
                    }}
                  >
                    <div
                      className="relative rounded-full p-3 bg-background/90 backdrop-blur-sm shadow-lg"
                      style={{
                        boxShadow: `0 0 20px ${power.glowColor}`
                      }}
                      data-testid={`power-badge-${power.id}`}
                    >
                      {power.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box with Cycling Arrows */}
          {showInfoBox && (
            <Card className="-mt-16 p-6 bg-background/95 backdrop-blur-sm border-2" data-testid="power-info-box">
              <div
                key={powers[activePowerIndex].id}
                className="space-y-4"
                style={{
                  animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${powers[activePowerIndex].color}`}
                    style={{ backgroundColor: `${powers[activePowerIndex].glowColor}20` }}
                  >
                    {powers[activePowerIndex].icon}
                  </div>
                  <h3 className={`text-2xl font-bold ${powers[activePowerIndex].color}`}>{powers[activePowerIndex].title}</h3>
                </div>

                <p className="text-muted-foreground">{powers[activePowerIndex].description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">What It Is:</h4>
                    <p className="text-sm text-muted-foreground">{powers[activePowerIndex].content.whatItIs}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">The Value:</h4>
                    <p className="text-sm text-muted-foreground">{powers[activePowerIndex].content.value}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">In-House Cost:</h4>
                    <p className="text-sm text-muted-foreground">{powers[activePowerIndex].content.inHouseCost}</p>
                  </div>
                </div>
              </div>

              {/* Previous arrow */}
              <button
                onClick={() => setActivePowerIndex((prev) => (prev === 0 ? powers.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/50 hover:bg-card/80 transition-colors z-10"
                aria-label="Previous power"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              {/* Next arrow */}
              <button
                onClick={() => setActivePowerIndex((prev) => (prev === powers.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/50 hover:bg-card/80 transition-colors z-10"
                aria-label="Next power"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  </>
  );
}