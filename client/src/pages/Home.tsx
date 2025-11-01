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
        title="Your Next Sales Hire Shouldn't Be a Person. It Should Be a System. | Revenue Party"
        description="Building a sales team is expensive. The 'Lone Wolf' model is a $198,000 liability. We build, operate, and guarantee your GTM Engine. You own the asset. 20+ guaranteed SQOs monthly."
        keywords="Revenue Generation System, GTM Engine, Fullstack Sales Unit, white-labeled sales, guaranteed sales appointments, BDR pod, sales system"
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
                  <span className="text-primary">It Should Be a System.</span>
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  data-testid="text-hero-subheading"
                >
                  Building a sales team is expensive. And the traditional 'Lone Wolf' model is a $198,000 liability you've been set up to hire. You don't need another salesperson. You need a reliable, risk-mitigating system that guarantees a result. We build, operate, and guarantee your GTM Engine. You own the asset.
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
                <Link href="/pricing">
                  <p className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <span className="font-semibold">See The Guarantee & Pricing →</span>
                  </p>
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroROICalculator />
            </div>
          </div>
        </div>
      </section>

      {/* $198k Liability Module - 4-Column Stat Block */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-liability">
              The $198,000 Liability{" "}
              <span className="text-primary">You've Been Set Up to Hire</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-liability-description">
              You're not wrong to feel frustrated. The 'Internal Hire' model is a trap—a financial 'Equation of an F-Level System' designed to fail. You are paying for four distinct, data-backed liabilities:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-liability-ramp">
                <h3 className="text-5xl font-bold text-primary mb-4">+$50,000</h3>
                <h4 className="text-2xl font-bold mb-4">Ramp Burn</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The cost of a <strong>3.1-month ramp</strong> which isn't 'training,' it's 'architecture-building' time you're forcing one person to do.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-liability-management">
                <h3 className="text-5xl font-bold text-primary mb-4">+$27,000</h3>
                <h4 className="text-2xl font-bold mb-4">Management Tax</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The hidden cost of <em>your</em> high-leverage time spent on low-leverage, 1:1 supervision for an unsupported rep.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-liability-recruiting">
                <h3 className="text-5xl font-bold text-primary mb-4">+$20,000</h3>
                <h4 className="text-2xl font-bold mb-4">Recruiting Fee</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The 'failure tax' you pay on a loop, thanks to the <strong>34% industry churn rate</strong> this broken system <em>creates</em>.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-liability-opportunity">
                <h3 className="text-5xl font-bold text-primary mb-4">+$101,000</h3>
                <h4 className="text-2xl font-bold mb-4">Opportunity Cost</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The invisible, catastrophic cost of the pipeline you <em>didn't</em> build while your territory was vacant or ramping.
                </p>
              </Card>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/problem">
              <Button variant="outline" size="lg" data-testid="button-expose-traps">
                Expose The Traps <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cinematic Bridge Statement */}
      <CinematicBridge />

      {/* Solution Section - The Fullstack Sales Unit */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8" data-testid="section-fullstack-sales-unit">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-solution">
              Don't Hire a Liability.{" "}
              <span className="text-primary">Deploy The Fullstack Sales Unit.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-solution-description">
              This is our product. It's not a 'service' you rent. It's a complete, 'build-operate-transfer' GTM asset you own. It is an engineered system of three core components, managed by our four Architects, to deliver one guaranteed outcome.
            </p>
          </div>

          {/* 4 Architects Module */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">
              A System of Elite Talent, <span className="text-primary">Guided by Four Architects</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0 }}
              >
                <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-architect-1">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Caleb Estes</h4>
                    <Badge variant="secondary" className="mb-4">Visionary Architect</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    The designer of your 'Impact Selling OS' and GTM strategy.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-architect-2">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Muneeb Awan</h4>
                    <Badge variant="secondary" className="mb-4">Talent Architect</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    The builder of your 'Elite Talent' pod and the antidote to the 'human toll' of burnout.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-architect-3">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Danyal Darvesh</h4>
                    <Badge variant="secondary" className="mb-4">AI Architect</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    The engineer of your 'Signal Factory' and the solver of the 'Tech Stack Tax'.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 hover-elevate transition-all h-full" data-testid="card-architect-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Mariya Tamkeen</h4>
                    <Badge variant="secondary" className="mb-4">Brand Guardian</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    The protector of your 'Brand Physics' and the guardian against 'TAM Poisoning'.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Interactive Orbital Powers */}
          <OrbitalPowers videoSrc={podVideo} videoRef={videoRef} />

          {/* CTA */}
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
              data-testid="button-build-gtm-engine"
              asChild
            >
              <Link href="/gtm-engine">
                Build Your GTM Engine <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Proof Module - Guaranteed Floor, Massive Ceiling */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-proof">
              Guaranteed Reliability. <span className="text-primary">Proven Upside.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-proof-description">
              Our model is built on reliability. We give you a guaranteed performance 'floor' while our systems work to create a massive 'ceiling'.
            </p>
          </div>

          {/* 3-Column Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <Card className="p-8 text-center hover-elevate transition-all h-full" data-testid="metric-floor">
                <div className="mb-6">
                  <Badge variant="secondary" className="mb-4">The Guarantee (The "Floor")</Badge>
                </div>
                <AnimatedCounter 
                  value="20+" 
                  className="text-7xl font-bold text-primary mb-4" 
                  duration={1.5}
                />
                <h3 className="text-xl font-semibold mb-3">Guaranteed SQOs</h3>
                <p className="text-sm text-muted-foreground">Per SDR per month, locked in at Month 5</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 text-center hover-elevate transition-all h-full" data-testid="metric-ceiling">
                <div className="mb-6">
                  <Badge variant="secondary" className="mb-4">The Upside (The "Ceiling")</Badge>
                </div>
                <AnimatedCounter 
                  value="80+" 
                  className="text-7xl font-bold text-primary mb-4" 
                  duration={1.5}
                />
                <h3 className="text-xl font-semibold mb-3">Sustained SQOs/Month</h3>
                <p className="text-sm text-muted-foreground">From single 2-SDR pod</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 text-center hover-elevate transition-all h-full" data-testid="metric-asset">
                <div className="mb-6">
                  <Badge variant="secondary" className="mb-4">The Asset (The "Safety Net")</Badge>
                </div>
                <AnimatedCounter 
                  value="100%" 
                  className="text-7xl font-bold text-primary mb-4" 
                  duration={1.5}
                />
                <h3 className="text-xl font-semibold mb-3">IP Ownership</h3>
                <p className="text-sm text-muted-foreground">If an operator leaves, the system remains. Your pipeline is safe.</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator Module */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-roi-calculator">
              See Why Our 2-SDR Pod{" "}
              <span className="text-primary">Costs Less Than a Single Risky Hire</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-6" data-testid="text-roi-calculator-description">
              A single internal hire costs over $198,000, creates a single point of failure, and <em>guarantees zero</em>.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-roi-calculator-value">
              Our recommended 2-SDR "Fullstack Sales Unit" ($15k/mo) costs 24% less, provides 2 operators, and <strong className="text-foreground">guarantees 40+ qualified meetings</strong> per month (after ramp). Stop guessing. Run the math.
            </p>
          </div>

          {/* Centered Calculator */}
          <div className="flex justify-center mb-12">
            <HeroROICalculator />
          </div>

          {/* CTA for Full Calculator */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              data-testid="button-full-roi-calculator"
              asChild
            >
              <Link href="/roi-calculator">Calculate Your Full ROI</Link>
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

      {/* Customer Reviews Module */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-customer-reviews">
              A System That <span className="text-primary">Just Works.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="testimonial-1">
                <div className="mb-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-lg text-foreground leading-relaxed mb-6 italic">
                  "The 2-SDR Pod is a no-brainer. We get 40+ guaranteed meetings a month for $15k. My last <em>single</em> internal hire cost me $16k a month all-in and produced 5 meetings. The math is undeniable."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Chief Revenue Officer</p>
                    <p className="text-sm text-muted-foreground">SaaS Company</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 hover-elevate transition-all h-full" data-testid="testimonial-2">
                <div className="mb-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 fill-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-lg text-foreground leading-relaxed mb-6 italic">
                  "The reliability is everything. We had an internal rep quit, and it nearly killed our quarter. With Revenue Party, our operator left for a new role, and they slotted in a new one. The 'system' kept working, and our pipeline <em>didn't even notice</em>. That peace of mind is the real ROI."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Head of Sales</p>
                    <p className="text-sm text-muted-foreground">Tech Startup</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/results">
              <Button variant="outline" size="lg" data-testid="button-case-studies">
                See All Case Studies <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="heading-final-cta">
            Stop Buying Risk.{" "}
            <span className="text-primary">Start Building Your Asset.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-final-cta-description">
            The blueprint is clear. Schedule your free GTM Audit to design your guaranteed revenue engine.
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