import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GTMTimeline from "@/components/GTMTimeline";
import { AnimatedGradientMesh } from "@/components/AnimatedGradientMesh";
import { OrbitalPowers } from "@/components/OrbitalPowers";
import { HeroROICalculator } from "@/components/HeroROICalculator";
import CinematicBridge from "@/components/CinematicBridge";
import { SEO } from "@/components/SEO";
import { ServiceSchema } from "@/components/ServiceSchema";
import { Calendar, PiggyBank, UserX, ArrowRight, Check, Quote } from "lucide-react";
// Video is served from public directory
const podVideo = "/bdr-pod-video.mp4";
import spaceBackground from "@assets/space-background.png";
import orbitalSpaceBackground from "@assets/orbital-space-bg.png";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const scrollAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAwayStartRef = useRef<number | null>(null);
  
  // Debug video path
  useEffect(() => {
    console.log("Video path being used:", podVideo);
  }, []);

  const problems = [
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "The Hiring Drag",
      description: "Wasting 3-6 months recruiting, hiring, and ramping a single-threaded rep instead of deploying a complete, revenue-ready system on day one.",
    },
    {
      icon: <PiggyBank className="w-12 h-12" />,
      title: "The Management Tax",
      description: "Losing over $104,000 of your leadership's time to train, manage, and build a playbook for one BDR, instead of leveraging a system that's already built to perform.",
    },
    {
      icon: <UserX className="w-12 h-12" />,
      title: "The Lone Wolf Fallacy",
      description: "Betting your growth on the heroics of an individual, knowing that 1 in 3 new BDR hires will fail completely within the first year, forcing you to start the painful cycle all over again.",
    },
  ];

  const processSteps = [
    {
      number: "01",
      title: "GTM Leverage Audit & System Design",
      duration: "Week 1",
      description: "We conduct a deep discovery of your Ideal Customer Profile, value proposition, and current GTM motion. We then architect a bespoke playbook—your messaging, targeting, and strategic framework for market domination.",
    },
    {
      number: "02",
      title: "Pod Activation & Deployment",
      duration: "Week 2",
      description: "We activate your Fully Loaded BDR Pod. Your dedicated talent is onboarded, the tech stack is integrated, and the Signal Factory begins enriching data. We launch the first campaigns and begin generating market feedback.",
    },
    {
      number: "03",
      title: "Performance, Optimization & Scale",
      duration: "Ongoing",
      description: "Through weekly strategy sessions, we analyze performance data, refine messaging, and optimize targeting. Your GTM engine doesn't just run; it learns and improves, becoming more efficient and effective every single week.",
    },
  ];

  // Handle video playback and scroll behavior
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setHasPlayed(true);
    };

    // Intersection Observer to detect when video leaves/enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Video has left the viewport - start tracking time
            scrollAwayStartRef.current = Date.now();
          } else {
            // Video has entered the viewport
            if (scrollAwayStartRef.current) {
              const timeAway = Date.now() - scrollAwayStartRef.current;
              // If user was away for 6+ seconds, reset hasPlayed
              if (timeAway >= 6000) {
                setHasPlayed(false);
              }
              scrollAwayStartRef.current = null;
            }

            // Play video if it hasn't played yet
            if (!hasPlayed && video.paused) {
              video.play().catch(() => {
                // Handle autoplay restrictions
              });
            }
          }
        });
      },
      {
        threshold: 0.5, // Video is considered visible when 50% is in view
      }
    );

    observer.observe(video);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      observer.disconnect();
      video.removeEventListener('ended', handleVideoEnd);
      if (scrollAwayTimerRef.current) {
        clearTimeout(scrollAwayTimerRef.current);
      }
    };
  }, [hasPlayed]);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Revenue Party - GTM Systems That Multiply Your Pipeline"
        description="Deploy a complete GTM system with elite BDRs, AI tech, and proven strategy. Get 20+ qualified appointments monthly. Escape the $198k hiring mistake."
        keywords="GTM system, sales development, BDR pod, revenue generation, pipeline growth"
        canonical="/"
      />
      <ServiceSchema />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        {/* Animated gradient mesh background */}
        <AnimatedGradientMesh intensity="subtle" speed="slow" />
        
        {/* Sun rays animation (light mode only) */}
        <div className="sun-rays-container">
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="community" className="mb-4" data-testid="badge-culture">
                  Community + Competition = Culture
                </Badge>
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  Your Next Sales Hire Shouldn't Be a Person.{" "}
                  <span className="text-primary">It Should Be a Revenue Generation System.</span>
                </motion.h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Adding salespeople is a linear game. We deploy a complete Go-to-Market system, arming elite talent with the AI, tech, and strategy required to multiply your pipeline.
                </p>
              </div>

              <div className="space-y-4">
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-hero-schedule">
                  Schedule My GTM Audit
                </Button>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">What's a GTM Audit?</span> In 60 minutes, we'll build a complete blueprint to scale your pipeline—a plan you can execute with or without us.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroROICalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Red Accent for Competition/Problems */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Building a Sales Team <span className="text-primary">is expensive.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Scaling your Go-to-Market one hire and one tool at a time is a trap. It burns capital, creates friction, and delivers diminishing returns. It's the high cost of low leverage. If you're serious about scaling, you can't afford these hidden leverage killers:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <Card className="p-8 hover-elevate transition-all h-full" data-testid={`card-problem-${index}`}>
                  <div className="text-primary mb-6">{problem.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">{problem.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Cinematic Bridge Statement */}
      <CinematicBridge />

      {/* Solution Section */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8" data-testid="section-fullstack-sales-unit">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              Your Fullstack Sales Unit
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              starring two BDRs, dedicated to finding, and selling your customers.
            </p>
          </div>

          {/* Interactive Orbital Powers */}
          <OrbitalPowers videoSrc={podVideo} videoRef={videoRef} />

          {/* Subtle Learn More button - right aligned, delayed fade */}
          <motion.div 
            className="flex justify-end mt-12 max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <Button 
              size="sm" 
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-learn-more"
              asChild
            >
              <Link href="/gtm-engine">
                Learn More <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Complete GTM Machine Timeline */}
      <GTMTimeline />

      {/* Success Stories / Results Preview Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="community" className="mb-4">Proven Results</Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The Numbers Don't Lie. <span className="text-primary">The Results Speak.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              When you deploy a complete GTM system instead of just hiring another rep, here's what actually happens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-faster">
              <AnimatedCounter 
                value="3-5x" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-bold mb-4">Faster Time-to-Market</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Start getting qualified meetings in 2-3 weeks instead of 3-6 months
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-savings">
              <AnimatedCounter 
                value="60%+" 
                className="text-6xl font-bold text-community mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-bold mb-4">Cost Savings</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Same output at a fraction of the cost when you factor in everything
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-ownership">
              <AnimatedCounter 
                value="100%" 
                className="text-6xl font-bold text-purple-dark mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-bold mb-4">Playbook Ownership</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                You own your complete GTM playbook—a strategic asset you can scale
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-risk">
              <AnimatedCounter 
                value="Zero" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-bold mb-4">Hiring Risk</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Performance-driven model means you only pay for results that matter
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-success-stories" asChild>
              <Link href="/results">
                Read Success Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Comparison Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-4">Competitive Edge</Badge>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="block">Lead Gen Agency?</span>
              <span className="block tracking-wide mb-4">Traditional Hire?</span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary">
                Or a Complete<br />GTM System?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Not all sales solutions are created equal. Here's how Your Fullstack Sales Unit stacks up against your alternatives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Lead Gen Agency */}
            <Card className="p-8 hover-elevate transition-all" data-testid="card-agency">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Lead Gen Agency</h3>
                <p className="text-4xl font-bold text-muted-foreground mb-2">$120k+</p>
                <p className="text-sm text-muted-foreground">Annual Cost</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">~</span>
                  <span>4-8 weeks to first meeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Shared resource pool (not dedicated)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>Agency keeps the playbook</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">~</span>
                  <span>Volume promises, not quality</span>
                </li>
              </ul>
            </Card>

            {/* Traditional Hire */}
            <Card className="p-8 hover-elevate transition-all" data-testid="card-traditional">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Traditional Hire</h3>
                <p className="text-4xl font-bold text-destructive mb-2">~$198k</p>
                <p className="text-sm text-muted-foreground">First Year Cost</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>3-6 months to first meeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>20 hours/week management required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>You build playbook from scratch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">✗</span>
                  <span>No performance guarantee</span>
                </li>
              </ul>
            </Card>

            {/* Revenue Party */}
            <Card className="p-8 hover-elevate transition-all border-2 border-primary animated-border-glow" data-testid="card-revparty">
              <div className="text-center mb-6">
                <Badge variant="default" className="mb-3">Recommended</Badge>
                <h3 className="text-2xl font-bold mb-2">Revenue Party Pod</h3>
                <p className="text-4xl font-bold text-primary mb-2">ROI+</p>
                <p className="text-sm text-muted-foreground">Contact for Pricing</p>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1" />
                  <span className="font-medium">2-3 weeks to first meeting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1" />
                  <span className="font-medium">2 hours/week management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1" />
                  <span className="font-medium">Custom playbook you own</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-1" />
                  <span className="font-medium">20+ qualified meetings/month SLA</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-full-comparison" asChild>
              <Link href="/blog">
                See Full Comparison <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30 overflow-hidden gradient-mesh-container">
        {/* Animated gradient mesh with medium intensity for process section */}
        <AnimatedGradientMesh intensity="medium" speed="slow" className="opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our Blueprint for <span className="text-primary">Predictable Pipeline.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We don't just add headcount; we deploy a complete operational blueprint. Our process is designed for speed, precision, and relentless optimization, ensuring your GTM engine is running at peak performance from day one.
            </p>
          </div>

          <div className="space-y-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-step-${index}`}>
                <div className="grid md:grid-cols-[auto,1fr] gap-8 items-start">
                  <div className="text-7xl font-bold text-primary/20 font-mono">
                    {step.number}
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                      <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-learn-process" asChild>
              <Link href="/gtm-engine">
                Learn About Our Process <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        {/* Vibrant gradient mesh for CTA section */}
        <AnimatedGradientMesh intensity="vibrant" speed="medium" className="opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            The Blueprint is Clear. <span className="text-primary">The Engine is Built.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10">
            You've seen the model and the process. The potential for systematic, predictable growth is locked inside your business. The next step is to design the key. A GTM Leverage Audit validates the strategy and initiates the activation of your dedicated pipeline engine.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg animate-gentle-pulse" data-testid="button-final-schedule">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}

function TestimonialsSection() {
  const { data: testimonials, isLoading, isError } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials?featured=true"],
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              Unable to load testimonials at this time. Please try again later.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-community/10 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="community" className="mb-4">Community Wins</Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Real Results. <span className="text-primary">Real Revenue.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Don't take our word for it. Here's what GTM leaders are saying about their Fully Loaded BDR Pod.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="p-8 hover-elevate transition-all bg-gradient-to-br from-community/5 to-transparent" data-testid={`card-testimonial-${index}`}>
              <div className="space-y-5">
                <Quote className="w-12 h-12 text-community/40" />
                <p className="text-lg text-foreground leading-relaxed italic" data-testid={`text-quote-${index}`}>
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-community/20">
                  <p className="text-lg font-bold mb-1" data-testid={`text-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-base text-muted-foreground mb-1" data-testid={`text-title-${index}`}>
                    {testimonial.title}
                  </p>
                  <p className="text-base text-community font-semibold" data-testid={`text-company-${index}`}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
