import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Target, Zap, Users } from "lucide-react";

export default function FullStackSalespersonPage() {
  const skills = [
    {
      title: "Research & Targeting",
      description: "Deep account research, ICP alignment, and strategic account selection",
      icon: <Target className="w-8 h-8" />,
    },
    {
      title: "Multi-Channel Execution",
      description: "Email sequencing, LinkedIn outreach, phone prospecting—all coordinated",
      icon: <Zap className="w-8 h-8" />,
    },
    {
      title: "Qualification Mastery",
      description: "BANT framework expertise with consultative discovery skills",
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: "Strategic Thinking",
      description: "Not just executing tasks—understanding the why behind the work",
      icon: <CheckCircle className="w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            The Full-Stack Salesperson
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            Forget "smile and dial." The modern BDR is a complete GTM operator—researcher, 
            strategist, technologist, and closer, all in one.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-8 text-center">The Problem with Traditional BDRs</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-destructive">❌ Single-Channel Specialists</h3>
              <p className="text-muted-foreground">
                Most BDRs are trained to execute one playbook on one channel. 
                They can't adapt when buyers shift communication preferences.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-destructive">❌ Tactic Executors</h3>
              <p className="text-muted-foreground">
                Traditional hiring produces reps who follow scripts without understanding strategy. 
                They can't think critically or adjust to market feedback.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Full-Stack Approach</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {skills.map((skill, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-primary">{skill.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                    <p className="text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">The Revenue Party Difference</h3>
            <p className="text-foreground mb-6">
              Every BDR on our team is trained in our proprietary Impact Selling methodology. 
              They don't just book meetings—they build pipeline that converts.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>US-based professionals with 3+ years of enterprise sales experience</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Continuous coaching from fractional GTM strategists</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Performance-driven culture with weekly optimization sprints</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Stop Hiring. Start Winning.</h2>
          <p className="text-muted-foreground mb-8">
            Get a Full-Stack BDR deployed in your business within 2 weeks—no hiring, no training, no ramp time.
          </p>
          <Button size="lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
