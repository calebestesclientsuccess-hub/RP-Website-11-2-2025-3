import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaticGradientBg } from "@/components/StaticGradientBg";
import { WidgetZone } from "@/components/WidgetZone";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Users, 
  Trophy, 
  Target, 
  Sparkles, 
  Shield, 
  Brain,
  ArrowRight,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export default function About() {
  const comparisonData = [
    {
      feature: "Time to First Meeting",
      revParty: { value: "2-3 Weeks", isGood: true },
      agency: { value: "1-2 Months", isGood: false },
      traditional: { value: "3-6 Months", isGood: false },
    },
    {
      feature: "All-In First Year Cost",
      revParty: { value: "$150-180k", isGood: true },
      agency: { value: "$90-120k", isGood: false },
      traditional: { value: "~$198,000", isGood: false },
    },
    {
      feature: "Required Management Time",
      revParty: { value: "2 hours/week", isGood: true },
      agency: { value: "5 hours/week", isGood: false },
      traditional: { value: "20+ hours/week", isGood: false },
    },
    {
      feature: "Tech & Data Stack",
      revParty: { value: "Included & Managed", isGood: true },
      agency: { value: "Basic Tools Only", isGood: false },
      traditional: { value: "You Source & Pay", isGood: false },
    },
    {
      feature: "Strategic Playbook",
      revParty: { value: "Built & Optimized For You", isGood: true },
      agency: { value: "Generic Templates", isGood: false },
      traditional: { value: "You Build from Scratch", isGood: false },
    },
    {
      feature: "Risk of Failure",
      revParty: { value: "Performance Guaranteed", isGood: true },
      agency: { value: "Black Box Risk", isGood: false },
      traditional: { value: "~33% Total Failure", isGood: false },
    },
    {
      feature: "IP Ownership",
      revParty: { value: "100% Yours Forever", isGood: true },
      agency: { value: "Zero IP Transfer", isGood: false },
      traditional: { value: "Lost When They Leave", isGood: false },
    },
    {
      feature: "Outcome",
      revParty: { value: "Scalable GTM Asset", isGood: true },
      agency: { value: "Temporary Activity", isGood: false },
      traditional: { value: "Single Point of Failure", isGood: false },
    },
  ];

  const architects = [
    {
      name: "Caleb Estes",
      title: "Visionary Architect",
      icon: <Target className="w-8 h-8 text-primary" />,
      description: "Designer of Impact Selling OS and GTM strategy",
      specialty: "Strategic Framework & Methodology",
    },
    {
      name: "Muneeb Awan",
      title: "Talent Architect",
      icon: <Users className="w-8 h-8 text-primary" />,
      description: "Builder of Elite Talent pod, antidote to human toll of burnout",
      specialty: "Pod Structure & Performance Culture",
    },
    {
      name: "Danyal Darvesh",
      title: "AI Architect",
      icon: <Brain className="w-8 h-8 text-primary" />,
      description: "Engineer of Signal Factory, solver of Tech Stack Tax",
      specialty: "AI Systems & Technology Integration",
    },
    {
      name: "Mariya Tamkeen",
      title: "Brand Guardian",
      icon: <Shield className="w-8 h-8 text-primary" />,
      description: "Protector of Brand Physics, guardian against TAM Poisoning",
      specialty: "Brand Safety & Market Positioning",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Why Revenue Party - Community + Competition = Culture"
        description="Our culture is your competitive advantage. Elite BDRs in collaborative pods with transparent competition drive exceptional results. Build, operate, transfer model with 100% IP ownership."
        keywords="Why Revenue Party, Revenue Party vs Belkins, sales pod culture, build-operate-transfer sales, elite BDR pods, GTM culture"
        canonical="/why-us"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        <StaticGradientBg />

        {/* Light grid dots pattern (light mode only) */}
        <div className="light-grid-dots" />

        <div className="sun-rays-container">
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
                data-testid="heading-hero"
              >
                Community + Competition ={" "}
                <span className="gradient-text gradient-hero">Culture.</span>
              </h1>
              <p 
                className="text-xl md:text-2xl leading-relaxed"
                data-testid="text-hero-subheading"
              >
                Our culture is our product. It's the 'Why' behind our Elite Talent and the reason our GTM Engines win.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Widget Zone */}
      <WidgetZone zone="zone-1" className="my-8" />

      {/* Module 1: Our Culture is Your Asset */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-culture-asset">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-culture">
              This is the 'Why' Behind<br />
              <span className="gradient-text gradient-hero">Our Elite Talent</span>
            </h2>
            <p className="text-xl leading-relaxed" data-testid="text-culture-intro">
              You're not just hiring a BDR; you're investing in an asset forged by a system of excellence. Competitors sell you a 'dedicated' rep operating in a silo like a Lone Wolf. They burn out (34% churn) and quit.
            </p>
          </div>

          {/* Community Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 md:p-12 light-depth hover-elevate transition-all" data-testid="card-community">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4">
                      Community: Our Pods Operate, Learn, and Win Together
                    </h3>
                    <p className="text-lg leading-relaxed mb-6">
                      BDRs operate in pods, not silos. Collective learning is your asset.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 ml-0 md:ml-22">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Problem-Solving Velocity</h4>
                        <p className="leading-relaxed">
                          When a rep hits an objection, they don't 'go it alone.' They bring it to the pod, and 10+ elite operators swarm it. Problem solved in minutes, not weeks.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Collective Intelligence</h4>
                        <p className="leading-relaxed">
                          Every breakthrough, every winning script, every strategic insight becomes pod knowledge—amplifying performance across your entire operation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Competition Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 md:p-12 light-depth hover-elevate transition-all" data-testid="card-competition">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4">
                      Competition: Radical Transparency Drives Elite Performance
                    </h3>
                    <p className="text-lg leading-relaxed mb-6">
                      Teams compete with radical transparency. Internal drive ensures you get our A-game every day—not a rep 'quiet quitting'.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 ml-0 md:ml-22">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Performance Visibility</h4>
                        <p className="leading-relaxed">
                          Every metric is visible to the entire pod. No hiding, no sandbagging. Elite performers rise, and everyone elevates to match.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Internal Motivation</h4>
                        <p className="leading-relaxed">
                          Competition breeds excellence. Your BDR isn't just working for you—they're competing to be the best in their cohort. That drive is your advantage.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Middle Widget Zone 1 */}
      <WidgetZone zone="zone-2" className="my-8" />

      {/* Module 2: Build, Operate, Transfer Model */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-bot-model">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-bot">
                Don't Just Outsource.<br />
                <span className="gradient-text gradient-hero">Build Your Future Department.</span>
              </h2>
              <p className="text-xl leading-relaxed mb-8">
                We are not a typical agency. We are a strategic partner that builds, operates, and transfers a complete sales asset to you. You can run it in-house whenever you're ready. The IP, playbooks, and processes are 100% yours.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Build</h4>
                    <p className="leading-relaxed">
                      We architect your complete GTM system from the ground up—strategy, talent, technology, and processes designed specifically for your business.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Operate</h4>
                    <p className="leading-relaxed">
                      We run your revenue engine with our elite talent and proven systems, delivering guaranteed results while documenting every strategic decision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Transfer</h4>
                    <p className="leading-relaxed">
                      When you're ready to bring it in-house, you get 100% of the IP, playbooks, and learnings. You've built a permanent asset, not rented temporary capacity.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 light-depth hover-elevate transition-all bg-primary/5 border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-8 h-8 text-primary" />
                    <h3 className="text-2xl font-bold">Your Permanent Assets</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        <strong className="text-foreground">Impact Selling OS:</strong> Your proprietary strategic framework and methodology
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        <strong className="text-foreground">Proven Playbooks:</strong> Battle-tested scripts, sequences, and workflows optimized for your market
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        <strong className="text-foreground">Performance Data:</strong> Complete analytics and insights on what works in your specific GTM motion
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        <strong className="text-foreground">Hiring Blueprint:</strong> Exact criteria and process to replicate elite talent when scaling in-house
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p>
                        <strong className="text-foreground">Tech Stack Architecture:</strong> Documented integrations and configurations ready for handoff
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Module 3: Meet The Architects */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-architects">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-architects">
              The Four Architects<br />
              <span className="gradient-text gradient-hero">Who Build Your Engine</span>
            </h2>
            <p className="text-xl leading-relaxed">
              Your success is engineered by a dedicated team of specialists, each mastering a critical dimension of your GTM system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {architects.map((architect, index) => (
              <motion.div
                key={architect.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className="p-8 hover-elevate transition-all h-full" 
                  data-testid={`card-architect-${architect.name.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {architect.icon}
                    </div>
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold mb-2">{architect.name}</h3>
                        <Badge variant="secondary" className="mb-3">
                          {architect.title}
                        </Badge>
                        <p className="text-sm italic">
                          {architect.specialty}
                        </p>
                      </div>
                      <p className="leading-relaxed">
                        {architect.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Middle Widget Zone 2 */}
      <WidgetZone zone="zone-3" className="my-8" />

      {/* Widget Zone 7 */}
      <WidgetZone zone="zone-7" className="my-8" />

      {/* Module 4: Risk Comparison Table */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-comparison">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-comparison">
              The Math of<br />
              <span className="gradient-text gradient-hero">Smarter Investment</span>
            </h2>
            <p className="text-xl leading-relaxed">
              See how Revenue Party's Build-Operate-Transfer model compares to traditional hiring and commodity agencies.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-4">
                  <h3 className="font-bold text-lg text-muted-foreground">Feature</h3>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-lg text-primary">Revenue Party</h3>
                </div>
                <div className="p-4 bg-card rounded-lg border border-card-border">
                  <h3 className="font-bold text-lg">Lead Gen Agency</h3>
                </div>
                <div className="p-4 bg-card rounded-lg border border-card-border">
                  <h3 className="font-bold text-lg">Traditional Hire</h3>
                </div>
              </div>

              {/* Table Rows */}
              {comparisonData.map((row, index) => (
                <motion.div
                  key={row.feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="grid grid-cols-4 gap-4 mb-3"
                  data-testid={`comparison-row-${index}`}
                >
                  <div className="p-4 bg-card/50 rounded-lg flex items-center">
                    <p className="font-semibold">{row.feature}</p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-2">
                    {row.revParty.isGood ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <p className="text-foreground font-medium">{row.revParty.value}</p>
                  </div>

                  <div className="p-4 bg-card rounded-lg border border-card-border flex items-center gap-2">
                    {row.agency.isGood ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <p className="text-muted-foreground">{row.agency.value}</p>
                  </div>

                  <div className="p-4 bg-card rounded-lg border border-card-border flex items-center gap-2">
                    {row.traditional.isGood ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <p className="text-muted-foreground">{row.traditional.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile-friendly version */}
          <div className="md:hidden space-y-6">
            {comparisonData.map((row, index) => (
              <Card key={row.feature} className="p-6" data-testid={`comparison-mobile-${index}`}>
                <h4 className="font-bold text-lg mb-4">{row.feature}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="font-medium text-sm">Revenue Party</span>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{row.revParty.value}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-card-border">
                    <span className="font-medium text-sm text-muted-foreground">Agency</span>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{row.agency.value}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-card-border">
                    <span className="font-medium text-sm text-muted-foreground">Traditional</span>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{row.traditional.value}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Widget Zone */}
      <WidgetZone zone="zone-4" className="my-8" />

      {/* Widget Zone 8 */}
      <WidgetZone zone="zone-8" className="my-8" />

      {/* Primary CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-cta">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-cta">
              Ready to Build<br />
              <span className="gradient-text gradient-hero">With The Best?</span>
            </h2>
            <p className="text-xl leading-relaxed mb-8">
              Our culture is your competitive advantage. Schedule a GTM Audit to meet the Architects and see how we'll build your revenue engine.
            </p>

            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg" 
              data-testid="button-cta-schedule"
              asChild
            >
              <Link href="/audit">
                Schedule My GTM Audit <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}