import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function ComparisonPage() {
  const comparisonData = [
    {
      category: "Time to First Meeting",
      traditional: "3-6 Months",
      traditionalBad: true,
      agency: "4-8 Weeks",
      agencyBad: false,
      revparty: "2-3 Weeks",
      revpartyGood: true,
    },
    {
      category: "All-In First Year Cost",
      traditional: "~$198,000",
      traditionalBad: true,
      agency: "$120,000+",
      agencyBad: false,
      revparty: "Contact for Pricing",
      revpartyGood: true,
    },
    {
      category: "Required Management Time",
      traditional: "~20 hours/week",
      traditionalBad: true,
      agency: "~5 hours/week",
      agencyBad: false,
      revparty: "2 hours/week",
      revpartyGood: true,
    },
    {
      category: "Tech & Data Stack",
      traditional: "You Source, Integrate & Pay",
      traditionalBad: true,
      agency: "Partial (You Still Pay)",
      agencyBad: false,
      revparty: "Included & Managed",
      revpartyGood: true,
    },
    {
      category: "Strategic Playbook",
      traditional: "You Build from Scratch",
      traditionalBad: true,
      agency: "Agency Keeps It",
      agencyBad: true,
      revparty: "Built & Yours to Keep",
      revpartyGood: true,
    },
    {
      category: "Dedicated Resource",
      traditional: "Yes (If They Don't Quit)",
      traditionalBad: false,
      agency: "Shared Pool",
      agencyBad: true,
      revparty: "Yes, Dedicated BDR",
      revpartyGood: true,
    },
    {
      category: "Performance Guarantee",
      traditional: "None",
      traditionalBad: true,
      agency: "Volume Promises",
      agencyBad: false,
      revparty: "Qualified Meeting SLA",
      revpartyGood: true,
    },
    {
      category: "Market Intelligence",
      traditional: "Limited to Your Hire",
      traditionalBad: false,
      agency: "Siloed Reports",
      agencyBad: false,
      revparty: "AI-Powered Insights",
      revpartyGood: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            The Real Comparison
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            Traditional hire? Lead gen agency? Or a complete GTM system? 
            Here's what you're actually choosing between.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-bold text-foreground">Category</th>
                  <th className="text-center p-4 font-bold text-muted-foreground">Traditional Hire</th>
                  <th className="text-center p-4 font-bold text-muted-foreground">Lead Gen Agency</th>
                  <th className="text-center p-4 font-bold text-primary">Revenue Party</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-border hover-elevate transition-all">
                    <td className="p-4 font-semibold text-foreground">{row.category}</td>
                    <td className={`p-4 text-center ${row.traditionalBad ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {row.traditional}
                    </td>
                    <td className={`p-4 text-center ${row.agencyBad ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {row.agency}
                    </td>
                    <td className="p-4 text-center font-semibold text-primary">
                      {row.revparty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Breakdown Cards */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Breaking Down the Options</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Traditional Hire */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">Traditional Hire</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated to your company</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Full control over activities</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">3-6 month ramp time</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">$198k+ all-in cost</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">No strategic support</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Tech stack on you</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Best for: Companies with deep pockets and 6+ months to spare
              </p>
            </Card>

            {/* Lead Gen Agency */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">Lead Gen Agency</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Faster to launch</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Some tech included</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Shared resources (not dedicated)</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">They keep the playbook</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Volume over quality</span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Lock-in contracts</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Best for: Companies okay with generic outreach at scale
              </p>
            </Card>

            {/* Revenue Party */}
            <Card className="p-8 border-primary/50">
              <h3 className="text-2xl font-bold mb-4 text-primary">Revenue Party</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Dedicated Full-Stack BDR</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">2-3 week launch time</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Complete tech stack included</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">You own the playbook</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">Fractional GTM strategist</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold">AI-powered insights</span>
                </div>
              </div>
              <p className="text-sm text-primary font-semibold">
                Best for: GTM leaders who want results yesterday
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Stop Comparing. Start Building Pipeline.</h2>
          <p className="text-muted-foreground mb-8">
            See exactly how Revenue Party stacks up for your specific business with a custom ROI analysis.
          </p>
          <Button size="lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
