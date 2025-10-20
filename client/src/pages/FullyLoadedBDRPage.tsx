import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Zap, FileText, Check } from "lucide-react";

export default function FullyLoadedBDRPage() {
  const components = [
    {
      icon: <Settings className="w-12 h-12" />,
      title: "1x Full-Stack BDR",
      subtitle: "The Elite Operator",
      description: "A dedicated, US-based BDR trained in our advanced Impact Selling methodology. They operate not as a rep, but as a GTM strategist, managing the full execution of your playbook.",
      colorClass: "text-primary",
      badgeVariant: "default" as const,
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Fractional GTM Strategist",
      subtitle: "The GTM Brain",
      description: "A senior GTM leader who serves as your strategic counsel. They lead the weekly performance sprints, analyze data, and ensure your engine is constantly being optimized for better results.",
      colorClass: "text-community",
      badgeVariant: "community" as const,
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Integrated Sales & AI Stack",
      subtitle: "The Tech Stack",
      description: "We provide and manage the complete, enterprise-grade technology stack, including sales engagement platforms, data enrichment tools, and our proprietary AI Signal Factory. No integration headaches, no extra license fees.",
      colorClass: "text-indigo",
      badgeVariant: "indigo" as const,
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "The GTM Playbook",
      subtitle: "The Strategic Framework",
      description: "We build and maintain your central GTM operating document—from ICP and messaging to objection handling and performance benchmarks. It's the living brain of your sales motion.",
      colorClass: "text-purple-dark",
      badgeVariant: "purple-dark" as const,
    },
  ];

  const outcomes = [
    "20+ Qualified Appointments Per Month: A consistent, predictable flow of meetings with your ideal buyers.",
    "A Complete GTM Playbook: A strategic asset you own, detailing the DNA of your sales motion.",
    "Freed-Up Leadership Time: Hundreds of hours of your executive and management time reclaimed from hiring, training, and managing.",
    "Actionable Market Intelligence: Weekly insights on what messaging resonates, which personas are engaging, and where your best opportunities lie.",
    "Scalable, De-risked Growth: A proven, repeatable system for generating pipeline, removing the gamble of individual hires.",
  ];

  const comparisonData = [
    {
      feature: "Time to First Meeting",
      traditional: "3-6 Months",
      revparty: "2-3 Weeks",
    },
    {
      feature: "All-In First Year Cost",
      traditional: "~$198,000 (salary, tax, tech, management)",
      revparty: "Contact for Pricing",
    },
    {
      feature: "Required Mgmt. Time",
      traditional: "~20 hours/week",
      revparty: "2 hours/week (Strategic Review)",
    },
    {
      feature: "Tech & Data Stack",
      traditional: "You Source, Integrate & Pay",
      revparty: "Included & Managed",
    },
    {
      feature: "Strategic Playbook",
      traditional: "You Build from Scratch",
      revparty: "Built & Optimized For You",
    },
    {
      feature: "Risk of Failure",
      traditional: "~33% Chance of Total Failure",
      revparty: "Performance-Driven Model",
    },
    {
      feature: "Outcome",
      traditional: "Hope is the Strategy",
      revparty: "Predictable System Output",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            The End of the <span className="text-primary">Sales Hire.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            The Fully Loaded BDR Pod is a complete Go-to-Market engine, delivered as a service. It's the strategic operator, the AI-powered tech stack, the GTM playbook, and the performance analytics—all integrated into a single, turnkey system designed to generate a predictable pipeline.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Everything You Need to Scale. <span className="text-primary">Nothing You Don't.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We've engineered the solution to the thousands of details that stall growth. Your pod is a complete ecosystem, pre-built and optimized for peak performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {components.map((component, index) => (
              <Card key={index} className="p-6 hover-elevate transition-all" data-testid={`card-component-${index}`}>
                <div className={`mb-4 ${component.colorClass}`}>
                  {component.icon}
                </div>
                <Badge variant={component.badgeVariant} className="mb-2">{component.subtitle}</Badge>
                <h3 className="text-xl font-bold mb-3">{component.title}</h3>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Outputs That <span className="text-primary">Matter.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              This isn't just about activity. It's about delivering the tangible, revenue-centric outcomes that define market leadership.
            </p>
          </div>

          <Card className="p-8">
            <ul className="space-y-4">
              {outcomes.map((outcome, index) => (
                <li key={index} className="flex gap-3" data-testid={`outcome-${index}`}>
                  <Check className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{outcome}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Math of a <span className="text-primary">Smarter Investment.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how deploying a complete system compares to the true, all-in cost of a traditional in-house BDR hire.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" data-testid="comparison-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-bold">Feature</th>
                  <th className="text-left py-4 px-4 font-bold">Traditional In-House Hire</th>
                  <th className="text-left py-4 px-4 font-bold text-primary">The Fully Loaded BDR Pod</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-border hover-elevate" data-testid={`comparison-row-${index}`}>
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.traditional}</td>
                    <td className="py-4 px-4 text-primary font-medium">{row.revparty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Deploy a <span className="text-primary">System?</span>
          </h2>
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
