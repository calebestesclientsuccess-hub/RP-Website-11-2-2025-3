import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Zap, FileText, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import podVideo from "@assets/Maintain_the_geometric_202510201050_1760987688804.mp4";

gsap.registerPlugin(ScrollTrigger);

export default function FullyLoadedBDRPage() {
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const videoSection = videoSectionRef.current;
    const video = videoRef.current;
    const text = textRef.current;
    
    if (!videoSection || !video || !text) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setTextVisible(true);
      return;
    }

    const ctx = gsap.context(() => {
      // Create scroll trigger for video playback
      ScrollTrigger.create({
        trigger: videoSection,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          video.play().catch((error) => {
            console.log("Video playback failed:", error);
          });
        },
        onLeave: () => {
          video.pause();
        },
        onEnterBack: () => {
          video.play().catch((error) => {
            console.log("Video playback failed:", error);
          });
        },
        onLeaveBack: () => {
          video.pause();
          video.currentTime = 0;
        }
      });

      // Track video progress
      const handleTimeUpdate = () => {
        if (video.duration) {
          const progress = (video.currentTime / video.duration) * 100;
          setVideoProgress(progress);
          
          // Fade in text when video is more than 50% complete
          if (progress > 50 && !textVisible) {
            setTextVisible(true);
            gsap.fromTo(text, 
              { opacity: 0, y: 20 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 1.5, 
                ease: "power2.out" 
              }
            );
          }
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }, videoSection);

    return () => ctx.revert();
  }, [textVisible]);

  const components = [
    {
      icon: <Settings className="w-12 h-12" />,
      title: "1x Full-Stack BDR",
      subtitle: "The Elite Operator",
      description: "A dedicated, US-based BDR trained in our advanced Impact Selling methodology. They operate not as a rep, but as a GTM strategist, managing the full execution of your playbook.",
      colorClass: "text-primary",
      badgeVariant: "default" as const,
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Fractional GTM Strategist",
      subtitle: "The GTM Brain",
      description: "A senior GTM leader who serves as your strategic counsel. They lead the weekly performance sprints, analyze data, and ensure your engine is constantly being optimized for better results.",
      colorClass: "text-community",
      badgeVariant: "community" as const,
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Integrated Sales & AI Stack",
      subtitle: "The Tech Stack",
      description: "We provide and manage the complete, enterprise-grade technology stack, including sales engagement platforms, data enrichment tools, and our proprietary AI Signal Factory. No integration headaches, no extra license fees.",
      colorClass: "text-indigo",
      badgeVariant: "indigo" as const,
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "The GTM Playbook",
      subtitle: "The Strategic Framework",
      description: "We build and maintain your central GTM operating document—from ICP and messaging to objection handling and performance benchmarks. It's the living brain of your sales motion.",
      colorClass: "text-purple-dark",
      badgeVariant: "purple-dark" as const,
    },
  ];

  const outcomes = [
    "20+ Qualified Appointments Per Month: A consistent, predictable flow of meetings with your ideal buyers.",
    "A Complete GTM Playbook: A strategic asset you own, detailing the DNA of your sales motion.",
    "Freed-Up Leadership Time: Hundreds of hours of your executive and management time reclaimed from hiring, training, and managing.",
    "Actionable Market Intelligence: Weekly insights on what messaging resonates, which personas are engaging, and where your best opportunities lie.",
    "Scalable, De-risked Growth: A proven, repeatable system for generating pipeline, removing the gamble of individual hires.",
  ];

  const comparisonData = [
    {
      feature: "Time to First Meeting",
      traditional: "3-6 Months",
      revparty: "2-3 Weeks",
    },
    {
      feature: "All-In First Year Cost",
      traditional: "~$198,000 (salary, tax, tech, management)",
      revparty: "Contact for Pricing",
    },
    {
      feature: "Required Mgmt. Time",
      traditional: "~20 hours/week",
      revparty: "2 hours/week (Strategic Review)",
    },
    {
      feature: "Tech & Data Stack",
      traditional: "You Source, Integrate & Pay",
      revparty: "Included & Managed",
    },
    {
      feature: "Strategic Playbook",
      traditional: "You Build from Scratch",
      revparty: "Built & Optimized For You",
    },
    {
      feature: "Risk of Failure",
      traditional: "~33% Chance of Total Failure",
      revparty: "Performance-Driven Model",
    },
    {
      feature: "Outcome",
      traditional: "Hope is the Strategy",
      revparty: "Predictable System Output",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            The End of the <span className="text-primary">Sales Hire.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            The Fully Loaded BDR Pod is a complete Go-to-Market engine, delivered as a service. It's the strategic operator, the AI-powered tech stack, the GTM playbook, and the performance analytics—all integrated into a single, turnkey system designed to generate a predictable pipeline.
          </p>
        </div>
      </section>

      {/* Video Section - The Fully Loaded BDR Pod */}
      <section 
        ref={videoSectionRef}
        className="relative py-20 px-4 md:px-6 lg:px-8 min-h-screen flex items-center justify-center bg-black"
        data-testid="section-pod-video"
      >
        <div className="relative w-full max-w-7xl mx-auto">
          {/* Video Container */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={podVideo}
              muted
              loop
              playsInline
              preload="metadata"
              data-testid="video-pod"
            >
              Your browser does not support the video tag.
            </video>
            
            {/* Overlay gradient for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            
            {/* Text overlay that fades in */}
            <div 
              ref={textRef}
              className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16"
              style={{ opacity: textVisible ? 1 : 0 }}
              data-testid="text-pod-overlay"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                The Fully Loaded <span className="text-primary">BDR Pod:</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
                A complete Go-to-Market engine that combines elite operators, AI-powered technology, 
                and strategic playbooks into a single, performance-driven system designed to generate 
                predictable pipeline at scale.
              </p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4">
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${videoProgress}%` }}
                data-testid="progress-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Complete GTM Machine */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Complete <span className="text-primary">GTM Machine</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Not just pieces. Not just tools. A complete system working together to generate qualified pipeline.
            </p>
            <p className="text-base text-muted-foreground">
              The Fully Loaded BDR Pod integrates four essential components into a single, turnkey engine—each one amplifying the others to deliver predictable, scalable results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {components.map((component, index) => (
              <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`card-component-${index}`}>
                <div className={`mb-4 ${component.colorClass}`}>
                  {component.icon}
                </div>
                <Badge variant={component.badgeVariant} className="mb-2">{component.subtitle}</Badge>
                <h3 className="text-xl font-bold mb-3">{component.title}</h3>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Outputs That <span className="text-primary">Matter.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              This isn't just about activity. It's about delivering the tangible, revenue-centric outcomes that define market leadership.
            </p>
          </div>

          <Card className="p-8">
            <ul className="space-y-4">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex gap-3" data-testid={`outcome-${index}`}>
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Math of a <span className="text-primary">Smarter Investment.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how deploying a complete system compares to the true, all-in cost of a traditional in-house BDR hire.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" data-testid="comparison-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-left py-4 px-4 font-bold">Traditional In-House Hire</th>
                  <th className="text-left py-4 px-4 font-bold text-primary">The Fully Loaded BDR Pod</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-border hover-elevate" data-testid={`comparison-row-${index}`}>
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.traditional}</td>
                    <td className="py-4 px-4 text-primary font-medium">{row.revparty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Deploy a <span className="text-primary">System?</span>
          </h2>
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
