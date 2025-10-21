import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniCalculator } from "@/components/MiniCalculator";
import GTMTimeline from "@/components/GTMTimeline";
import { AnimatedGradientMesh } from "@/components/AnimatedGradientMesh";
import { Calendar, PiggyBank, UserX, ArrowRight, Check, Quote, Brain, Target, Headphones, Users, Wrench, Trophy } from "lucide-react";
import podVideo from "@assets/Change_the_background_202510200715_1761004160815.mp4";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { useEffect, useRef, useState } from "react";

// Realistic confetti particle class
class ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number = 0.15;
  drag: number = 0.98;
  opacity: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    // More varied initial velocities for realistic spread
    const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to 30 degrees
    const speed = Math.random() * 12 + 8;
    this.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    this.vy = Math.sin(angle) * speed - (Math.random() * 8 + 5);
    this.color = color;
    // Varied sizes for realism
    this.width = Math.random() * 8 + 4;
    this.height = Math.random() * 6 + 3;
    // Random rotation and spin
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    // Varied initial opacity
    this.opacity = Math.random() * 0.3 + 0.7;
  }

  update() {
    // Apply drag for realistic air resistance
    this.vx *= this.drag;
    this.vy *= this.drag;
    
    // Apply gravity
    this.vy += this.gravity;
    
    // Add slight horizontal drift (wind effect)
    this.vx += (Math.random() - 0.5) * 0.1;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Rotate
    this.rotation += this.rotationSpeed;
    
    // Fade out gradually
    this.opacity -= 0.008;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw rectangle confetti piece
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Add subtle shine/gradient for metallic effect
    const gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    ctx.restore();
  }
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const animationRef = useRef<number>();
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

  const podComponents = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Architect",
      color: "text-purple-dark"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "GTM Strategist",
      color: "text-primary"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Support",
      color: "text-community"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Coach",
      color: "text-indigo"
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Tools",
      color: "text-primary"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Community & Competition",
      color: "text-community"
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

  // Confetti animation
  useEffect(() => {
    if (!showConfetti) return;
    
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!leftCanvas || !rightCanvas) return;
    
    const leftCtx = leftCanvas.getContext('2d');
    const rightCtx = rightCanvas.getContext('2d');
    if (!leftCtx || !rightCtx) return;
    
    // Set canvas size
    leftCanvas.width = 200;
    leftCanvas.height = 400;
    rightCanvas.width = 200;
    rightCanvas.height = 400;
    
    const particles: ConfettiParticle[] = [];
    const colors = ['#ef233c', '#C0C0C0', '#FFD700', '#ef233c', '#C0C0C0']; // Red, Silver, Gold
    
    // Create initial particles
    for (let i = 0; i < 50; i++) {
      // Left side particles
      particles.push(new ConfettiParticle(
        leftCanvas.width / 2,
        leftCanvas.height / 2,
        colors[Math.floor(Math.random() * colors.length)]
      ));
      // Right side particles
      particles.push(new ConfettiParticle(
        rightCanvas.width / 2 + 1000, // Offset for right canvas
        rightCanvas.height / 2,
        colors[Math.floor(Math.random() * colors.length)]
      ));
    }
    
    const animate = () => {
      leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
      rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
      
      particles.forEach((particle) => {
        particle.update();
        if (particle.x < 1000) {
          particle.draw(leftCtx);
        } else {
          // Draw on right canvas with adjusted x position
          const originalX = particle.x;
          particle.x = particle.x - 1000;
          particle.draw(rightCtx);
          particle.x = originalX; // Restore original x for next frame
        }
      });
      
      // Remove dead particles
      const aliveParticles = particles.filter(p => p.opacity > 0);
      
      if (aliveParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setShowConfetti(false);
      }
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showConfetti]);

  // Handle video end
  const handleVideoEnd = () => {
    if (!hasPlayedOnce && videoRef.current) {
      setHasPlayedOnce(true);
      setShowConfetti(true);
      // Don't restart the video
      videoRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        {/* Animated gradient mesh background */}
        <AnimatedGradientMesh intensity="subtle" speed="slow" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="community" className="mb-4" data-testid="badge-culture">
                  Community + Competition = Culture
                </Badge>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  Your Next Sales Hire Shouldn't Be a Person.{" "}
                  <span className="text-primary">It Should Be a Revenue Generation System.</span>
                </h1>
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

            <div>
              <MiniCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Red Accent for Competition/Problems */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Linear Growth is a <span className="text-primary">Death Sentence.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Scaling your Go-to-Market one hire and one tool at a time is a trap. It burns capital, creates friction, and delivers diminishing returns. It's the high cost of low leverage. If you're serious about scaling, you can't afford these hidden leverage killers:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-problem-${index}`}>
                <div className="text-primary mb-6">{problem.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{problem.description}</p>
              </Card>
            ))}
          </div>

          {/* Bridge Statement - Problem to Solution */}
          <div className="text-center mt-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold italic text-primary">
              You don't need another salesperson.<br />
              <span className="text-foreground">You need leverage.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The Fully Loaded BDR Pod:
            </h2>
            <p className="text-2xl md:text-3xl font-semibold text-primary mb-8">
              More than one salesperson. A complete Revenue Engine.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Stop gambling on hires. Start deploying a system. We've engineered the complete GTM engine your business needs to generate a predictable pipeline. It's a turnkey system of elite talent, intelligent technology, and a proven strategic framework, ready for activation.
            </p>
          </div>

          {/* Pod Components Layout */}
          <div className="relative max-w-5xl mx-auto">
            {/* Central Pod with Video and Confetti */}
            <div className="flex items-center justify-center mb-16">
              <div className="relative">
                {/* Confetti Canvases */}
                <canvas
                  ref={leftCanvasRef}
                  className="absolute -left-48 top-0 z-30 pointer-events-none"
                  style={{ width: 200, height: 400 }}
                  data-testid="canvas-confetti-left"
                />
                <canvas
                  ref={rightCanvasRef}
                  className="absolute -right-48 top-0 z-30 pointer-events-none"
                  style={{ width: 200, height: 400 }}
                  data-testid="canvas-confetti-right"
                />
                
                {/* Container with Apple-style aesthetics */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                  {/* Apple-style border and background */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900" />
                  
                  {/* Video container with thin border */}
                  <div className="relative z-10 w-[calc(100%-16px)] h-[calc(100%-16px)] m-2 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-xl">
                    <video 
                      ref={videoRef}
                      src={podVideo}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnd}
                      data-testid="video-bdr-pod"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </div>

            {/* Pod Components Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {podComponents.map((component, index) => (
                <Card 
                  key={index} 
                  className="p-6 text-center hover-elevate transition-all"
                  data-testid={`card-pod-${index}`}
                >
                  <div className={`${component.color} mb-4 flex justify-center`}>
                    {component.icon}
                  </div>
                  <h3 className="font-bold text-lg">{component.title}</h3>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-explore-pod" asChild>
              <Link href="/solutions/fully-loaded-bdr-pod">
                Explore the BDR Pod <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
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
              <div className="text-6xl font-bold text-primary mb-4">3-5x</div>
              <h3 className="text-xl font-bold mb-4">Faster Time-to-Market</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Start getting qualified meetings in 2-3 weeks instead of 3-6 months
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-savings">
              <div className="text-6xl font-bold text-community mb-4">60%+</div>
              <h3 className="text-xl font-bold mb-4">Cost Savings</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Same output at a fraction of the cost when you factor in everything
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-ownership">
              <div className="text-6xl font-bold text-purple-dark mb-4">100%</div>
              <h3 className="text-xl font-bold mb-4">Playbook Ownership</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                You own your complete GTM playbook—a strategic asset you can scale
              </p>
            </Card>

            <Card className="p-8 text-center hover-elevate transition-all" data-testid="metric-risk">
              <div className="text-6xl font-bold text-primary mb-4">Zero</div>
              <h3 className="text-xl font-bold mb-4">Hiring Risk</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Performance-driven model means you only pay for results that matter
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-success-stories" asChild>
              <Link href="/results/success-stories">
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Traditional Hire? <br />
              Lead Gen Agency? <br />
              <span className="text-primary">Or a Complete GTM System?</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Not all sales solutions are created equal. Here's how a Fully Loaded BDR Pod stacks up against your alternatives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
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

            {/* Revenue Party */}
            <Card className="p-8 hover-elevate transition-all border-2 border-primary" data-testid="card-revparty">
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
              <Link href="/comparison">
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
              <Link href="/our-process">
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
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-final-schedule">
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
