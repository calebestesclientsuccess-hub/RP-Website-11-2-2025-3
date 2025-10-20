import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Zap, FileText, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import podVideo from "@assets/Maintain_the_geometric_202510201050_1760987688804.mp4";
import charactersImage from "@assets/Gemini_Generated_Image_ue7uheue7uheue7u_1761002669954.png";

gsap.registerPlugin(ScrollTrigger);

export default function FullyLoadedBDRPage() {
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const charactersSectionRef = useRef<HTMLDivElement>(null);
  const charactersTextRef = useRef<HTMLDivElement>(null);
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

  // Animation for character section
  useEffect(() => {
    const charactersSection = charactersSectionRef.current;
    const charactersText = charactersTextRef.current;
    
    if (!charactersSection || !charactersText) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Create timeline for character section animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: charactersSection,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        }
      });

      // Animate text elements
      tl.fromTo(".hero-text-top", 
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(".hero-text-bottom", 
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(".character-image", 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(".particle-effect", 
        { opacity: 0, scale: 0.8, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" },
        "-=0.8"
      );
    }, charactersSection);

    return () => ctx.revert();
  }, []);

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

      {/* Character Illustration Section */}
      <section 
        ref={charactersSectionRef}
        className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
        data-testid="section-characters"
      >
        <div ref={charactersTextRef} className="max-w-7xl mx-auto">
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            
            {/* Left side text - "Fully Loaded" */}
            <div className="hero-text-top text-center lg:text-right lg:flex-1 order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
                <span className="block text-foreground">Fully</span>
                <span className="block text-foreground mt-2">Loaded</span>
              </h2>
            </div>
            
            {/* Center - Character Illustration */}
            <div className="character-image relative order-1 lg:order-2 w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <div className="relative">
                <img 
                  src={charactersImage} 
                  alt="Elite BDR Team - Back to Back"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  data-testid="image-characters"
                />
                {/* Animated particle overlay effect */}
                <div className="particle-effect absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-community rounded-full animate-pulse animation-delay-200" />
                  <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo rounded-full animate-pulse animation-delay-400" />
                  <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-purple-dark rounded-full animate-pulse animation-delay-600" />
                </div>
              </div>
            </div>
            
            {/* Right side text - "BDR Pod" */}
            <div className="hero-text-bottom text-center lg:text-left lg:flex-1 order-3">
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold">
                <span className="block text-primary">BDR</span>
                <span className="block text-primary mt-2">Pod</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                Elite operators armed with AI-powered precision, 
                shooting for predictable pipeline at scale.
              </p>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center mt-12 md:mt-16">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Where human expertise meets artificial intelligence to create 
              <span className="text-foreground font-semibold"> unstoppable revenue growth</span>.
            </p>
          </div>
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

      {/* What's Included */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need to Scale. <span className="text-primary">Nothing You Don't.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We've engineered the solution to the thousands of details that stall growth. Your pod is a complete ecosystem, pre-built and optimized for peak performance.
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
