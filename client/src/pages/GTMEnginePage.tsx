import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GearSystem } from "@/components/GearSystem";
import { Link } from "wouter";

export default function GTMEnginePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Culture Gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community/10 via-purple-dark/5 to-primary/10 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <Badge variant="community" className="mb-4">Integrated Revenue System</Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-community to-purple-dark bg-clip-text text-transparent" data-testid="text-hero-title">
            The GTM Engine
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
            Not a process. Not a platform. A complete, integrated revenue-generating system—
            engineered to deliver predictable pipeline while you focus on closing deals.
          </p>
        </div>
      </section>

      {/* Main Gear Visualization Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <GearSystem />
        </div>
      </section>


      {/* Output Guarantee Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-8" data-testid="text-output-guarantee">
            The Output: Predictable Pipeline
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            When all four gears turn in sync, you get what every GTM leader actually wants:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm uppercase text-muted-foreground">Qualified Meetings</div>
              <div className="text-xs text-muted-foreground mt-1">Per Month</div>
            </Card>
            <Card className="p-6">
              <div className="text-5xl font-bold text-community mb-2">2-3</div>
              <div className="text-sm uppercase text-muted-foreground">Weeks to Launch</div>
              <div className="text-xs text-muted-foreground mt-1">Not Months</div>
            </Card>
            <Card className="p-6">
              <div className="text-5xl font-bold text-purple-dark mb-2">100%</div>
              <div className="text-sm uppercase text-muted-foreground">Managed</div>
              <div className="text-xs text-muted-foreground mt-1">No Hiring Required</div>
            </Card>
          </div>

          <Button size="lg" data-testid="button-learn-more" asChild>
            <Link href="/solutions/fully-loaded-bdr-pod">
              See the Full Solution
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
