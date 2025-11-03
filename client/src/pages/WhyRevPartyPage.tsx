import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Users, Zap, Shield, Target, CheckCircle2, XCircle } from "lucide-react";

export default function WhyRevPartyPage() {
  const beliefs = [
    {
      title: "Own the Asset.",
      subtitle: "(Anti-Zero-IP Trap)",
      description: "We believe our clients must own 100% of the IP, playbooks, and data. We are building your asset, not renting you ours.",
    },
    {
      title: "Systems > Headcount.",
      subtitle: "(Anti-Lone Wolf)",
      description: "We believe the 'Lone Wolf' model is fundamentally broken. Only a complete system of talent, strategy, and tech can create a predictable pipeline.",
    },
    {
      title: "Transparency is the Antidote.",
      subtitle: "(Anti-Black Box)",
      description: "We believe 'Black Box' agencies and 'Activity Mirages' are toxic. We operate with 100% transparency.",
    },
    {
      title: "Impact > Activity.",
      subtitle: "",
      description: "We believe in \"executing verbs,\" not \"pitching nouns.\" We are strategic partners, not tactical commodities.",
    },
  ];

  const architects = [
    {
      name: "Caleb Estes",
      role: "Visionary Architect",
      description: "The designer of the 'Impact Selling OS' and your GTM strategy.",
    },
    {
      name: "Muneeb Awan",
      role: "Talent Architect",
      description: "The builder of our 'Elite Talent' pods.",
    },
    {
      name: "Danyal Darvesh",
      role: "AI Architect",
      description: "The engineer of the 'Signal Factory'.",
    },
    {
      name: "Mariya Tamkeen",
      role: "Brand Guardian",
      description: "The protector of your brand and the 'Impact Selling OS'.",
    },
  ];

  const comparisonData = [
    {
      feature: "Model",
      revenueparty: "Full BDR Pod + System",
      internalHire: "Single Rep in a Silo",
      agency: "Shared, \"Commodity\" Callers",
    },
    {
      feature: "Annual Cost",
      revenueparty: "Predictable flat fee (e.g., $180,000/yr)",
      internalHire: "$198,000+ (incl. total cost, drag, tax)",
      agency: "Varies (but 0 ROI)",
    },
    {
      feature: "Guaranteed Results",
      revenueparty: "Yes (20+ SQOs/mo)",
      internalHire: "None",
      agency: "No (Only \"Activity Mirages\")",
    },
    {
      feature: "IP / Asset Ownership",
      revenueparty: "100% You Own It",
      internalHire: "You own it... if they build it (they won't)",
      agency: "ZERO. They Own It.",
    },
    {
      feature: "Ramp Time",
      revenueparty: "14 Days",
      internalHire: "6-9 Months",
      agency: "30+ Days",
    },
    {
      feature: "Core Risk",
      revenueparty: "None (Performance Guarantee)",
      internalHire: "High (\"$198,000 Mistake\")",
      agency: "Fatal (\"Zero-IP Trap\")",
    },
  ];

  return (
    <>
      <SEO 
        title="Community + Competition = Culture | Why Revenue Party"
        description="Why Revenue Party vs agency or internal hire? Our culture is our product. Elite talent, proven manifesto, transparent comparison, and dedicated architects. See why leaders choose Revenue Party."
        keywords="Why Revenue Party, Revenue Party vs agency, sales pod culture, Revenue Party architects, Revenue Party manifesto, community competition culture"
        canonical="/why-revenue-party"
      />
      <Breadcrumbs items={[]} currentPage="Why Revenue Party" />
      
      <div className="min-h-screen">
        {/* Hero Module */}
        <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
          {/* Light grid dots pattern (light mode only) */}
          <div className="light-grid-dots" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                data-testid="heading-hero"
              >
                <span className="gradient-text gradient-hero">Community + Competition</span> = Culture.
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                data-testid="text-hero-subheading"
              >
                Our culture is our product. It's the "Why" behind our Elite Talent and the reason our GTM Engines win.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Module 1: Our Culture is Your Asset */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-culture">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center" data-testid="heading-culture">
                This is the "Why" Behind{" "}
                <span className="text-primary">Our Elite Talent</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed" data-testid="text-culture-intro">
                <p>
                  You're not just hiring a BDR; you're investing in an asset. An asset that is forged, sharpened, and scaled by a system of excellence.
                </p>
                <p>
                  Our competitors sell you a 'dedicated' rep. That rep operates in a silo, just like a 'Lone Wolf' internal hire. They burn out, get lonely, and quit.
                </p>
                <p>
                  Our GTM Engines are built on a completely different human model.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Community Sub-section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8 h-full hover-elevate transition-all" data-testid="card-community">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#9F8FFF20',
                          border: '2px solid #9F8FFF',
                        }}
                      >
                        <Users className="w-8 h-8 text-community" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4">
                        Community: Our Pods Operate, Learn, and Win Together
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Our BDRs operate in pods, not silos. This collective learning is your asset.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold mb-1">Problem-Solving Velocity:</p>
                        <p className="text-muted-foreground leading-relaxed">
                          When your rep hits an objection, they don't 'go it alone.' They bring it to the pod, and 10+ elite operators swarm it. The problem is solved in minutes, not weeks.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold mb-1">Faster Ramp:</p>
                        <p className="text-muted-foreground leading-relaxed">
                          This collective intelligence means your pod ramps faster, masters your playbook faster, and builds your pipeline faster.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Competition Sub-section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="p-8 h-full hover-elevate transition-all" data-testid="card-competition">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#FFB84620',
                          border: '2px solid #FFB846',
                        }}
                      >
                        <Zap className="w-8 h-8 text-competition" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4">
                        Competition: Radical Transparency Drives Elite Performance
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Our teams compete with radical transparency. All playbooks, all results, and all metrics are open to the entire organization.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold mb-1">No "Quiet Quitting":</p>
                        <p className="text-muted-foreground leading-relaxed">
                          This internal drive for excellence ensures you get our A-game, every single day. There is no 'coasting' or 'quiet quitting' in our culture.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold mb-1">Best Idea Wins:</p>
                        <p className="text-muted-foreground leading-relaxed">
                          Competition ensures the best-performing playbooks are identified, scaled, and deployed to all client GTM Engines, including yours.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Module 2: The Revenue Party Manifesto */}
        <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-manifesto">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-manifesto">
                The <span className="text-primary">Revenue Party Manifesto</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-manifesto-description">
                Our beliefs are the foundation of our architecture.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {beliefs.map((belief, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover-elevate transition-all h-full" data-testid={`card-belief-${index + 1}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          Belief {index + 1}: {belief.title}
                        </h3>
                        {belief.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">{belief.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {belief.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Module 3: The Competitive Edge */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-comparison">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-comparison">
                The Competitive Edge:{" "}
                <span className="text-primary">A Clear Comparison</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-comparison-description">
                See exactly how a GTM Engine stacks up against the broken models.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-bold" data-testid="heading-feature">Feature</th>
                    <th className="text-left p-4 font-bold bg-primary/10" data-testid="heading-revenue-party">
                      Revenue Party<br />(GTM Engine)
                    </th>
                    <th className="text-left p-4 font-bold" data-testid="heading-internal-hire">
                      The Internal Hire<br />("Lone Wolf")
                    </th>
                    <th className="text-left p-4 font-bold" data-testid="heading-agency">
                      The Outsourcing Agency<br />("Black Box")
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b" data-testid={`row-comparison-${index + 1}`}>
                      <td className="p-4 font-bold">{row.feature}</td>
                      <td className="p-4 bg-primary/5">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{row.revenueparty}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{row.internalHire}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{row.agency}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Module 4: Meet the Architects */}
        <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-architects">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-architects">
                Meet the <span className="text-primary">Architects</span> Behind Your Engine
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-architects-description">
                Your GTM Engine is designed and guided by a team of dedicated architects, not a faceless account manager.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {architects.map((architect, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover-elevate transition-all h-full text-center" data-testid={`card-architect-${index + 1}`}>
                    <div className="mb-4">
                      <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                        <Target className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{architect.name}</h3>
                      <Badge variant="secondary" className="mb-4">
                        {architect.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {architect.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-social-proof">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="heading-social-proof">
              Why Leaders Choose{" "}
              <span className="text-primary">Revenue Party</span>
            </h2>
            <Card className="p-8 md:p-12" data-testid="card-testimonial">
              <blockquote className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6 italic">
                "We chose Revenue Party over a traditional agency because we wanted to build a long-term asset, not just rent a service. The 'Zero-IP Trap' was our biggest fear, and Revenue Party provided the antidote."
              </blockquote>
              <div className="border-t pt-6">
                <div className="font-bold text-lg">[Name]</div>
                <div className="text-muted-foreground">[Title], [Company]</div>
              </div>
            </Card>
          </div>
        </section>

        {/* Primary CTA Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-cta">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-cta">
              Get Your <span className="text-primary">GTM Audit</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-cta-description">
              Stop choosing between bad options. Schedule an audit with our Architects and let's design a system that wins.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-cta-schedule" asChild>
              <Link href="/gtm-audit">Schedule My GTM Audit</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
