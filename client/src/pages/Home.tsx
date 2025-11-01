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
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import VideoSchema from "@/components/VideoSchema";
import SoftwareApplicationSchema from "@/components/SoftwareApplicationSchema";
import { Calendar, PiggyBank, UserX, ArrowRight, Check, X, Users, Target, Zap, TrendingUp } from "lucide-react";
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
  
  const problems = [
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "The Hiring Drag",
      description: "Wasting 3-6 months recruiting and ramping single-threaded reps instead of deploying a complete, revenue-ready system on day one.",
    },
    {
      icon: <PiggyBank className="w-12 h-12" />,
      title: "The Management Tax",
      description: "Losing over $100k of your leadership's time to train, manage, and build a playbook for one BDR, instead of leveraging a system that's already built.",
    },
    {
      icon: <UserX className="w-12 h-12" />,
      title: "The Lone Wolf Fallacy",
      description: "Betting your growth on the heroics of an individual, knowing that 1 in 3 new BDR hires will fail completely within the first year.",
    },
  ];

  const solutionPowers = [
    {
      title: "Elite Talent",
      description: "A full-stack BDR, trained in our Impact Selling methodology, who operates as a strategic extension of your team.",
    },
    {
      title: "Tech Stack",
      description: "A complete, integrated technology stack for data, outreach, and analytics. We cover the licenses and the integration.",
    },
    {
      title: "Strategic Framework",
      description: "A dedicated GTM strategist who designs your playbook, manages execution, and optimizes performance weekly.",
    },
    {
      title: "The Signal Factory",
      description: "Our proprietary AI and data engine that uncovers private buying signals, ensuring your team is always talking to the right people at the right time.",
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

  const comparisonData = [
    {
      feature: "Time to First Meeting",
      revParty: "2-3 Weeks",
      agency: "1-2 Months",
      inHouse: "3-6 Months",
    },
    {
      feature: "All-In First Year Cost",
      revParty: "Strategic Investment",
      agency: "$90-120k",
      inHouse: "~$198,000",
    },
    {
      feature: "Required Mgmt. Time",
      revParty: "2 hours/week",
      agency: "5 hours/week",
      inHouse: "20+ hours/week",
    },
    {
      feature: "Tech & Data Stack",
      revParty: "Included & Managed",
      agency: "Basic Tools Only",
      inHouse: "You Source & Pay",
    },
    {
      feature: "Strategic Playbook",
      revParty: "Built & Optimized For You",
      agency: "Generic Templates",
      inHouse: "You Build from Scratch",
    },
    {
      feature: "Risk of Failure",
      revParty: "Performance Guaranteed",
      agency: "Black Box Risk",
      inHouse: "~33% Total Failure",
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
        title="Your Next Sales Hire Shouldn't Be a Person. It Should Be a Revenue Generation System. | Revenue Party"
        description="Adding salespeople is a linear game. We deploy a complete Go-to-Market system, arming elite talent with the AI, tech, and strategy required to multiply your pipeline. Get 20+ qualified appointments monthly."
        keywords="GTM system, revenue generation system, sales development, BDR pod, pipeline growth, sales as a service"
        canonical="/"
      />
      <ServiceSchema />
      <LocalBusinessSchema />
      <SoftwareApplicationSchema />
      <VideoSchema 
        name="Your Fullstack Sales Unit - Revenue Party GTM System"
        description="Watch how Revenue Party's GTM Engine deploys elite BDR talent with AI-powered systems to deliver 20+ qualified appointments monthly."
        thumbnailUrl="https://revenueparty.com/video-thumbnail.jpg"
        uploadDate="2024-10-01"
        duration="PT2M"
        contentUrl={`https://revenueparty.com${podVideo}`}
      />
      
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
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  data-testid="heading-hero"
                >
                  Your Next Sales Hire Shouldn't Be a Person.{" "}
                  <span className="text-primary">It Should Be a Revenue Generation System.</span>
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  data-testid="text-hero-subheading"
                >
                  Adding salespeople is a linear game. We deploy a complete Go-to-Market system, arming elite talent with the AI, tech, and strategy required to multiply your pipeline.
                </motion.p>
                
                {/* Animated text that appears after 3 seconds */}
                <motion.p 
                  className="text-2xl font-semibold text-primary"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 3, ease: "easeOut" }}
                  data-testid="text-hero-promise"
                >
                  20 qualified appointments. With the right people. Every single month.
                </motion.p>
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg" 
                  data-testid="button-hero-schedule"
                  asChild
                >
                  <Link href="/audit">Schedule My GTM Audit</Link>
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

      {/* Problem Section - Linear Growth is a Death Sentence */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-problem">
              Linear Growth is a <span className="text-primary">Death Sentence.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-problem-description">
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
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Bridge Statement */}
      <CinematicBridge />

      {/* Solution Section - The Fully Loaded BDR Pod */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8" data-testid="section-fullstack-sales-unit">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-solution">
              The Fully Loaded BDR Pod:{" "}
              <span className="text-primary">A Complete Engine, Not Just a Person.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-solution-description">
              Stop gambling on hires. Start deploying a system. We've engineered the complete GTM engine your business needs to generate a predictable pipeline. It's a turnkey system of elite talent, intelligent technology, and a proven strategic framework, ready for activation.
            </p>
          </div>

          {/* Interactive Orbital Powers */}
          <OrbitalPowers videoSrc={podVideo} videoRef={videoRef} />

          {/* Interactive Diagram - 4 Powers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {solutionPowers.map((power, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 hover-elevate transition-all h-full group" data-testid={`card-power-${index}`}>
                  <h3 className="text-xl font-bold mb-3 text-primary">{power.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{power.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
              data-testid="button-explore-pod"
              asChild
            >
              <Link href="/gtm-engine">
                Explore the BDR Pod <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The Proof Section - Don't Guess. Model Your Growth. */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-proof">
              Don't Guess. <span className="text-primary">Model Your Growth.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-proof-description">
              Effective strategy isn't built on hope. It's built on math. Use the calculator below to see the direct financial impact that a systematic approach to pipeline generation can have on your business. This isn't just a sales tool; it's the blueprint for your revenue engine.
            </p>
          </div>

          {/* Results Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-faster">
              <AnimatedCounter 
                value="3-5x" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-semibold mb-2">Faster Time-to-Market</h3>
              <p className="text-sm text-muted-foreground">vs. traditional hiring</p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-savings">
              <AnimatedCounter 
                value="$104k" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-semibold mb-2">Cost Savings</h3>
              <p className="text-sm text-muted-foreground">year-one total cost</p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-playbook">
              <AnimatedCounter 
                value="100%" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-semibold mb-2">Playbook Ownership</h3>
              <p className="text-sm text-muted-foreground">your IP, your asset</p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-risk">
              <AnimatedCounter 
                value="0%" 
                className="text-6xl font-bold text-primary mb-4" 
                duration={1.5}
              />
              <h3 className="text-xl font-semibold mb-2">Hiring Risk</h3>
              <p className="text-sm text-muted-foreground">performance guaranteed</p>
            </Card>
          </div>

          {/* CTA for Calculator */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              data-testid="button-roi-calculator"
              asChild
            >
              <Link href="/roi-calculator">Open ROI Calculator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Our Blueprint for Predictable Pipeline */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-how-it-works">
              Our Blueprint for <span className="text-primary">Predictable Pipeline.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-how-it-works-description">
              We don't just add headcount; we deploy a complete operational blueprint. Our process is designed for speed, precision, and relentless optimization, ensuring your GTM engine is running at peak performance from day one.
            </p>
          </div>

          <div className="space-y-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="p-8 hover-elevate transition-all" data-testid={`card-process-step-${index}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{step.number}</span>
                      </div>
                    </div>
                    <div className="flex-grow space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                        <Badge variant="secondary" className="w-fit">{step.duration}</Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete GTM Machine Timeline */}
      <GTMTimeline />

      {/* Comparison Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-comparison">
              System vs. Silo:{" "}
              <span className="text-primary">The Math of a Smarter Investment.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-comparison-description">
              See how deploying a complete system compares to the true, all-in cost of alternatives.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left p-4 font-bold text-lg">Feature</th>
                  <th className="text-center p-4">
                    <div className="space-y-2">
                      <Badge variant="default" className="text-base px-4 py-2">RevParty Pod</Badge>
                      <div className="text-sm text-primary font-semibold">Recommended</div>
                    </div>
                  </th>
                  <th className="text-center p-4">
                    <div className="text-muted-foreground">Lead Gen Agency</div>
                  </th>
                  <th className="text-center p-4">
                    <div className="text-muted-foreground">Traditional Hire</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-card/50 transition-colors">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="text-center p-4">
                      <span className="font-semibold text-primary">{row.revParty}</span>
                    </td>
                    <td className="text-center p-4 text-muted-foreground">{row.agency}</td>
                    <td className="text-center p-4 text-muted-foreground">{row.inHouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="heading-final-cta">
            The Blueprint is Clear.{" "}
            <span className="text-primary">The Engine is Built.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-final-cta-description">
            You've seen the model and the process. The potential for systematic, predictable growth is locked inside your business. The next step is to design the key. A GTM Leverage Audit validates the strategy and initiates the activation of your dedicated pipeline engine.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-10 py-7 shadow-lg"
            data-testid="button-final-schedule"
            asChild
          >
            <Link href="/audit">Schedule My GTM Audit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}