import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Calculator, Trophy, TrendingUp, Users } from "lucide-react";

export default function ResultsPage() {
  const metrics = [
    {
      number: "20+",
      label: "Qualified Meetings",
      sublabel: "Per Month, Per Pod",
      icon: <Users className="w-12 h-12" />,
    },
    {
      number: "2-3",
      label: "Weeks to Launch",
      sublabel: "Not 3-6 Months",
      icon: <TrendingUp className="w-12 h-12" />,
    },
    {
      number: "3.2x",
      label: "Average ROI",
      sublabel: "vs. In-House Hire",
      icon: <Trophy className="w-12 h-12" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            Real Results, Not Promises
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            We don't just talk about pipeline generation. We deliver it—consistently, 
            predictably, and at a fraction of the cost of building in-house.
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">By the Numbers</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-8 text-center hover-elevate transition-all">
                <div className="flex justify-center mb-4 text-primary">
                  {metric.icon}
                </div>
                <div className="text-5xl font-bold mb-2 text-primary">{metric.number}</div>
                <div className="text-lg font-semibold mb-1">{metric.label}</div>
                <div className="text-sm text-muted-foreground">{metric.sublabel}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">What You Get</h2>
          
          <div className="space-y-6 mb-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">Predictable Pipeline</h3>
              <p className="text-muted-foreground mb-4">
                No more feast-or-famine months. Our BDR Pods deliver a steady stream of 
                qualified appointments with your ideal buyers—every single month.
              </p>
              <div className="flex items-center gap-4 text-sm text-foreground">
                <span className="px-3 py-1 bg-primary/10 rounded-md">20+ meetings/month</span>
                <span className="px-3 py-1 bg-primary/10 rounded-md">Qualified to your criteria</span>
                <span className="px-3 py-1 bg-primary/10 rounded-md">Calendar-ready</span>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">A Strategic Asset: Your GTM Playbook</h3>
              <p className="text-muted-foreground mb-4">
                We don't just execute. We document everything—ICP definition, messaging frameworks, 
                objection handling, and performance benchmarks. You own the playbook.
              </p>
              <div className="flex items-center gap-4 text-sm text-foreground">
                <span className="px-3 py-1 bg-purple/10 rounded-md">Living document</span>
                <span className="px-3 py-1 bg-purple/10 rounded-md">Continuously optimized</span>
                <span className="px-3 py-1 bg-purple/10 rounded-md">100% yours</span>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">Market Intelligence</h3>
              <p className="text-muted-foreground mb-4">
                Every call, every email, every interaction generates data. We turn that into 
                actionable insights: what messaging works, which personas engage, where opportunities hide.
              </p>
              <div className="flex items-center gap-4 text-sm text-foreground">
                <span className="px-3 py-1 bg-purple-dark/10 rounded-md">Weekly insights reports</span>
                <span className="px-3 py-1 bg-purple-dark/10 rounded-md">Competitive intel</span>
                <span className="px-3 py-1 bg-purple-dark/10 rounded-md">Buyer trends</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Grid */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Explore the Results</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/results/roi-calculator">
              <Card className="p-8 hover-elevate cursor-pointer transition-all h-full">
                <div className="flex items-start gap-4">
                  <Calculator className="w-12 h-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">ROI Calculator</h3>
                    <p className="text-muted-foreground mb-4">
                      See exactly how much a Revenue Party BDR Pod can save you compared to 
                      hiring in-house. Real numbers, no fluff.
                    </p>
                    <Button variant="outline" data-testid="button-roi-calculator">
                      Calculate Your ROI →
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/results/success-stories">
              <Card className="p-8 hover-elevate cursor-pointer transition-all h-full">
                <div className="flex items-start gap-4">
                  <Trophy className="w-12 h-12 text-purple flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Success Stories</h3>
                    <p className="text-muted-foreground mb-4">
                      Real results from real companies. See how GTM leaders are using Revenue Party 
                      to scale their outbound without scaling headcount.
                    </p>
                    <Button variant="outline" data-testid="button-success-stories">
                      Read Case Studies →
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to See Results Like These?</h2>
          <p className="text-muted-foreground mb-8">
            Schedule a GTM Audit and we'll show you exactly how we can generate predictable pipeline for your business.
          </p>
          <Button size="lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
