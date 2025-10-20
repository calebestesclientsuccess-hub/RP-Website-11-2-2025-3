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

      {/* How It Works Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold mb-12 text-center" data-testid="text-how-it-works">
            How the Engine Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-primary">Elite Talent</h3>
              <p className="text-muted-foreground mb-4">
                Your dedicated Full-Stack BDR doesn't just dial phones. They're trained in our proprietary 
                Impact Selling methodology, managing every aspect of your outbound motion from research to booking.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Deep ICP research and account selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Multi-channel sequencing (email, LinkedIn, phone)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Objection handling and qualification</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-indigo">Tech Stack</h3>
              <p className="text-muted-foreground mb-4">
                We provide and manage your entire sales tech infrastructure—no integration headaches, 
                no license sprawl, no technical debt. Just a fully operational system.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo">•</span>
                  <span>Sales engagement platform (outreach automation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo">•</span>
                  <span>Data enrichment and intent signals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-indigo">•</span>
                  <span>CRM integration and pipeline tracking</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-community">Strategic Framework</h3>
              <p className="text-muted-foreground mb-4">
                The GTM Playbook is your strategic operating system—a living document that captures 
                your ICP, messaging, objection handling, and performance benchmarks.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-community">•</span>
                  <span>Ideal customer profile definition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-community">•</span>
                  <span>Messaging frameworks and value propositions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-community">•</span>
                  <span>Performance metrics and optimization protocols</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-dark">Signal Factory</h3>
              <p className="text-muted-foreground mb-4">
                Our proprietary AI engine analyzes every interaction, call, and email to identify 
                what's working and surface high-value opportunities in real-time.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-purple-dark">•</span>
                  <span>Conversation intelligence and pattern detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-purple-dark">•</span>
                  <span>Buyer intent signal aggregation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-purple-dark">•</span>
                  <span>Automated lead scoring and prioritization</span>
                </li>
              </ul>
            </Card>
          </div>
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

          <Link href="/solutions/fully-loaded-bdr-pod">
            <Button size="lg" data-testid="button-learn-more">
              See the Full Solution
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
