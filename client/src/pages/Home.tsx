import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniCalculator } from "@/components/MiniCalculator";
import { GearSystem } from "@/components/GearSystem";
import { Calendar, PiggyBank, UserX, ArrowRight, Check, Quote } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";

export default function Home() {
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

  return (
    <div className="min-h-screen">
      {/* Hero Section - Culture Gradient Background */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community/5 via-background to-primary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="community" className="mb-4" data-testid="badge-culture">
                  Community + Competition = Culture
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  Your Next Sales Hire Shouldn't Be a Person.{" "}
                  <span className="text-primary">It Should Be a Revenue Generation System.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Adding salespeople is a linear game. We deploy a complete Go-to-Market system, arming elite talent with the AI, tech, and strategy required to multiply your pipeline.
                </p>
                <p className="text-2xl font-bold text-primary animate-fade-up" data-testid="text-appointments">
                  20 qualified appointments. With the right people. Every single month.
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Linear Growth is a <span className="text-primary">Death Sentence.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Scaling your Go-to-Market one hire and one tool at a time is a trap. It burns capital, creates friction, and delivers diminishing returns. It's the high cost of low leverage. If you're serious about scaling, you can't afford these hidden leverage killers:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-problem-${index}`}>
                <div className="text-primary mb-4">{problem.icon}</div>
                <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Fully Loaded BDR Pod:{" "}
              <span className="text-primary">A Complete Engine, Not Just a Person.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stop gambling on hires. Start deploying a system. We've engineered the complete GTM engine your business needs to generate a predictable pipeline. It's a turnkey system of elite talent, intelligent technology, and a proven strategic framework, ready for activation.
            </p>
          </div>

          <GearSystem />

          <div className="text-center mt-16">
            <Link href="/solutions/fully-loaded-bdr-pod">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-explore-pod">
                Explore the BDR Pod <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Our Blueprint for <span className="text-primary">Predictable Pipeline.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We don't just add headcount; we deploy a complete operational blueprint. Our process is designed for speed, precision, and relentless optimization, ensuring your GTM engine is running at peak performance from day one.
            </p>
          </div>

          <div className="space-y-8">
            {processSteps.map((step, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-step-${index}`}>
                <div className="grid md:grid-cols-[auto,1fr] gap-6 items-start">
                  <div className="text-6xl font-bold text-primary/20 font-mono">
                    {step.number}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/our-process">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-learn-process">
                Learn About Our Process <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Traditional Hire? Lead Gen Agency?{" "}
              <span className="text-primary">Or a Complete GTM System?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
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
            <Link href="/comparison">
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-full-comparison">
                See Full Comparison <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            The Blueprint is Clear. <span className="text-primary">The Engine is Built.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Real Results. <span className="text-primary">Real Revenue.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Don't take our word for it. Here's what GTM leaders are saying about their Fully Loaded BDR Pod.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="p-6 hover-elevate transition-all bg-gradient-to-br from-community/5 to-transparent" data-testid={`card-testimonial-${index}`}>
              <div className="space-y-4">
                <Quote className="w-10 h-10 text-community/40" />
                <p className="text-foreground leading-relaxed italic" data-testid={`text-quote-${index}`}>
                  "{testimonial.quote}"
                </p>
                <div className="pt-4 border-t border-community/20">
                  <p className="font-bold" data-testid={`text-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid={`text-title-${index}`}>
                    {testimonial.title}
                  </p>
                  <p className="text-sm text-community font-medium" data-testid={`text-company-${index}`}>
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
