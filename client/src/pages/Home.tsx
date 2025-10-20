import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiniCalculator } from "@/components/MiniCalculator";
import { GearSystem } from "@/components/GearSystem";
import { Calendar, PiggyBank, UserX, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";

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
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
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

      {/* Problem Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Linear Growth is a <span className="text-destructive">Death Sentence.</span>
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
            <Link href="/services">
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
