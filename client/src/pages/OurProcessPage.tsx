import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Rocket, TrendingUp, Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function OurProcessPage() {
  const processSteps = [
    {
      number: "01",
      title: "GTM Leverage Audit & System Design",
      duration: "Week 1",
      icon: <Search className="w-12 h-12" />,
      description: "We conduct a deep discovery of your Ideal Customer Profile, value proposition, and current GTM motion. We then architect a bespoke playbook—your messaging, targeting, and strategic framework for market domination.",
      deliverables: [
        "Comprehensive ICP analysis and targeting strategy",
        "Value proposition refinement and messaging framework",
        "Custom GTM playbook with strategic framework",
        "Tech stack integration plan and data enrichment strategy"
      ]
    },
    {
      number: "02",
      title: "Pod Activation & Deployment",
      duration: "Week 2",
      icon: <Rocket className="w-12 h-12" />,
      description: "We activate your Fully Loaded BDR Pod. Your dedicated talent is onboarded, the tech stack is integrated, and the Signal Factory begins enriching data. We launch the first campaigns and begin generating market feedback.",
      deliverables: [
        "Elite talent onboarding and playbook training",
        "Full tech stack integration (CRM, outreach, enrichment)",
        "Signal Factory activation with private buying signals",
        "First campaigns launched with initial market feedback"
      ]
    },
    {
      number: "03",
      title: "Performance, Optimization & Scale",
      duration: "Ongoing",
      icon: <TrendingUp className="w-12 h-12" />,
      description: "Through weekly strategy sessions, we analyze performance data, refine messaging, and optimize targeting. Your GTM engine doesn't just run; it learns and improves, becoming more efficient and effective every single week.",
      deliverables: [
        "Weekly performance analysis and strategy sessions",
        "Continuous messaging and targeting optimization",
        "Data-driven playbook refinement and iteration",
        "Monthly performance reports with actionable insights"
      ]
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-community/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="default" className="mb-6" data-testid="badge-process">
            Our Proven Process
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our Blueprint for <span className="text-primary">Predictable Pipeline.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We don't just add headcount; we deploy a complete operational blueprint. Our process is designed for speed, precision, and relentless optimization, ensuring your GTM engine is running at peak performance from day one.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {processSteps.map((step, index) => (
            <div key={index} data-testid={`process-step-${index}`}>
              <Card className="p-8 md:p-12 hover-elevate transition-all">
                <div className="grid lg:grid-cols-[auto,1fr] gap-8 items-start">
                  {/* Step Number & Icon */}
                  <div className="flex flex-col items-center lg:items-start gap-4">
                    <div className="text-7xl md:text-8xl font-bold text-primary/20 font-mono">
                      {step.number}
                    </div>
                    <div className="text-primary">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold">{step.title}</h2>
                        <Badge variant="community" data-testid={`badge-duration-${index}`}>
                          {step.duration}
                        </Badge>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Key Deliverables:</h3>
                      <ul className="space-y-2">
                        {step.deliverables.map((deliverable, delivIndex) => (
                          <li key={delivIndex} className="flex items-start gap-3" data-testid={`deliverable-${index}-${delivIndex}`}>
                            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{deliverable}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Connector Arrow (except for last item) */}
              {index < processSteps.length - 1 && (
                <div className="flex justify-center py-6">
                  <div className="text-primary">
                    <ArrowRight className="w-8 h-8 rotate-90" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Results Guarantee */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Results? <span className="text-primary">Predictable and Repeatable.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Within 30 days of activation, you'll have a fully operational GTM engine generating qualified appointments. By month three, your pipeline engine is optimized, your playbook is refined, and your revenue trajectory is predictable. This isn't magic—it's a system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center" data-testid="metric-appointments">
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Qualified Appointments<br />per Month</div>
            </Card>
            <Card className="p-6 text-center" data-testid="metric-activation">
              <div className="text-4xl font-bold text-primary mb-2">2 Weeks</div>
              <div className="text-sm text-muted-foreground">To Full Pod<br />Activation</div>
            </Card>
            <Card className="p-6 text-center" data-testid="metric-optimization">
              <div className="text-4xl font-bold text-primary mb-2">Weekly</div>
              <div className="text-sm text-muted-foreground">Strategy & Optimization<br />Sessions</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Deploy Your <span className="text-primary">Revenue Generation System?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Schedule a GTM Leverage Audit and we'll build the complete blueprint to scale your pipeline—a plan you can execute with or without us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" data-testid="button-schedule-audit">
              Schedule My GTM Audit
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 gap-2" data-testid="button-calculator" asChild>
              <Link href="/results/roi-calculator">
                Calculate Your ROI <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
