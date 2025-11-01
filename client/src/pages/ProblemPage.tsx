import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingDown, 
  UserX, 
  Clock, 
  AlertCircle, 
  XCircle,
  Activity,
  Eye,
  FileX,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function ProblemPage() {
  const costBreakdowns = [
    {
      icon: <Clock className="w-8 h-8" />,
      amount: "$50,000",
      title: "Ramp Burn",
      shortDesc: "3.1-month ramp time that produces zero revenue",
      detailedDesc: "The cost of a 3.1-month ramp (not the 6-9 months you've been told). This isn't 'training time'; it's 'architecture-building time' you're forcing one person to do. During this period, you're paying full salary and benefits while receiving zero pipeline contribution. The rep is essentially building your entire GTM system from scratch—something they're not equipped or experienced enough to do."
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      amount: "$27,000",
      title: "Management Tax",
      shortDesc: "Your high-leverage time spent on low-leverage work",
      detailedDesc: "The hidden cost of your (or your manager's) high-leverage time spent on low-leverage, 1:1 supervision for an unsupported rep. This includes weekly check-ins, coaching sessions, performance reviews, problem-solving, and constant hand-holding. You're spending 10-20 hours per week managing one person instead of focusing on strategic initiatives that could 10x your business."
    },
    {
      icon: <UserX className="w-8 h-8" />,
      amount: "$20,000",
      title: "Recruiting Fee",
      shortDesc: "The failure tax you pay on repeat",
      detailedDesc: "The 'failure tax' (20-25% of OTE) you pay on a loop, thanks to the 34% industry churn rate (The Bridge Group) that this broken system creates. When your SDR inevitably quits or gets fired, you're back to square one—and you have to pay another recruiting fee to start the cycle all over again. This isn't a one-time cost; it's a recurring liability."
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      amount: "$101,000",
      title: "Opportunity Cost",
      shortDesc: "The pipeline you didn't build while ramping",
      detailedDesc: "The invisible, catastrophic cost of the pipeline you didn't build while your territory was vacant or ramping. This is the most dangerous cost because it's completely hidden. While you're waiting 3-6 months for your new hire to ramp, your competitors are booking meetings, closing deals, and capturing market share. This lost opportunity compounds month after month and can set your growth trajectory back by an entire year."
    }
  ];

  const agencyTraps = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "The Activity Mirage",
      subtitle: "The 93% Failure",
      description: "You are sold a dashboard of 'dials' and 'emails'—pure 'Activity Theater' that produces $0 in real pipeline. The agency shows you impressive metrics: 500 calls made, 1,000 emails sent, 50 conversations logged. But when you ask about actual qualified meetings booked? Silence. This is why 93% of these agencies fail to deliver measurable results. They're optimizing for activity, not outcomes."
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "The Black Box Problem",
      subtitle: "The Intercept",
      description: "You have no idea how they're getting meetings (if they're getting any at all). You can't see the data, the messaging, or the strategy. This is the model used by commodity firms—they keep you in the dark so you can't replicate their process or hold them accountable. You're flying blind, hoping they're representing your brand well, with no way to verify or intervene when things go wrong."
    },
    {
      icon: <FileX className="w-8 h-8" />,
      title: "The Zero-IP Trap",
      subtitle: "The Catastrophe",
      description: "This is the most dangerous trap. After 12 months and $120k+ spent, you fire the agency. What do you have to show for it? Nothing. They leave and take 100% of the IP, the learnings, the playbooks, the contact data, and the market insights with them. You are left with zero assets, zero institutional knowledge, and zero competitive advantage. You didn't build your company; you built theirs. Now you're starting from scratch—again."
    }
  ];

  return (
    <>
      <SEO 
        title="Stop Solving Systems Problems with Headcount Solutions | Revenue Party"
        description="The Lone Wolf Trap: Why hiring SDRs and outsourcing to agencies both fail. The $198k internal hire vs $120k agency black box. Learn why you need a system, not another person."
        keywords="why sdr programs fail, problems with sales outsourcing, hire cold callers, cost of a bad sdr hire, sdr hiring problems, agency outsourcing failure, sales team building costs, lone wolf trap"
        canonical="/problem"
      />
      <Breadcrumbs items={[]} currentPage="The Problem" />
      
      <div className="min-h-screen">
        {/* Hero Module */}
        <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              data-testid="heading-hero"
            >
              Stop Solving Systems Problems{" "}
              <span className="text-primary">with Headcount Solutions.</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              data-testid="text-hero-subtitle"
            >
              You're stuck in the "Lone Wolf Trap." It's not your fault, and you're not alone.
            </motion.p>
          </div>
        </section>

        {/* Introduction - The False Dichotomy */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center" data-testid="heading-false-dichotomy">
                The Two-Liability Trap{" "}
                <span className="text-primary">That Guarantees Failure</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed" data-testid="text-false-dichotomy">
                <p>
                  B2B leaders are told they have two choices for building pipeline: <strong>hire internally</strong> or <strong>outsource to an agency</strong>.
                </p>
                <p>
                  What they aren't told is that both of these models are fundamentally broken. They are two paths to the same destination: a burned-out team, a non-existent pipeline, and a GTM strategy with zero long-term assets.
                </p>
                <p className="text-xl font-semibold text-foreground">
                  This is the False Dichotomy: a choice between a <span className="text-primary">$198,000 gamble</span> or a <span className="text-primary">$120,000 guaranteed loss</span>. Both are built on unmitigated risk.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trap 1 - The Internal Hire */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="heading-trap-1">
                Trap 1: The Internal Hire{" "}
                <span className="text-primary">(The '$198,000 Liability')</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl" data-testid="text-trap-1-intro">
                You hire a 'perfect' rep. Six months later, you have no pipeline, the rep is burned out (34% churn), and you're back at square one—minus $198,000. You didn't just fail to build an asset; you <em>created</em> a liability.
              </p>
            </motion.div>

            {/* Financial Equation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-financial-equation">
                The Financial Equation of an F-Level System
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed" data-testid="text-financial-equation">
                The $198k isn't an exaggeration; it's a calculation. It's the sum of four systemic failures you are forced to pay:
              </p>

              {/* Cost Breakdown Cards with Accordion */}
              <div className="grid md:grid-cols-2 gap-6">
                {costBreakdowns.map((cost, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover-elevate transition-all h-full" data-testid={`card-cost-${index}`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-primary">
                          {cost.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-primary mb-2">{cost.amount}</div>
                          <h4 className="text-xl font-bold mb-2">{cost.title}</h4>
                          <p className="text-sm text-muted-foreground mb-4">{cost.shortDesc}</p>
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible>
                        <AccordionItem value="details" className="border-none">
                          <AccordionTrigger 
                            className="text-sm font-semibold hover:no-underline py-2"
                            data-testid={`button-expand-cost-${index}`}
                          >
                            See Full Breakdown
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-cost-detail-${index}`}>
                              {cost.detailedDesc}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Lone Wolf Fallacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 bg-destructive/5 border-destructive/20" data-testid="card-lone-wolf-fallacy">
                <div className="flex items-start gap-4">
                  <XCircle className="w-12 h-12 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold mb-4" data-testid="heading-lone-wolf-fallacy">
                      The "Lone Wolf Fallacy"{" "}
                      <span className="text-destructive">(The Single Point of Failure)</span>
                    </h3>
                    <p className="text-lg leading-relaxed" data-testid="text-lone-wolf-fallacy">
                      The belief that one person can build a pipeline. When they get sick, have a bad week, or <strong>quit</strong> (34% probability), your entire pipeline crashes to zero. This is your single greatest point of failure. One person cannot be a system. One person is a liability waiting to happen.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Trap 2 - The Outsourcing Agency */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="heading-trap-2">
                Trap 2: The Outsourcing Agency{" "}
                <span className="text-primary">(The 'Zero-Asset' Trap)</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl" data-testid="text-trap-2-intro">
                You're tired of the $198k risk, so you sign a 12-month contract with a commodity 'b2b appointment setting service'. This is the 'Lone Wolf Suicide Mission'—you're outsourcing your most critical business function to a black box that guarantees nothing.
              </p>
            </motion.div>

            {/* Three Agency Traps */}
            <div className="space-y-8">
              {agencyTraps.map((trap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 hover-elevate transition-all" data-testid={`card-agency-trap-${index}`}>
                    <div className="flex items-start gap-6">
                      <div className="text-primary flex-shrink-0">
                        {trap.icon}
                      </div>
                      <div className="flex-1">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold mb-2" data-testid={`heading-agency-trap-${index}`}>
                            {trap.title}
                          </h3>
                          <Badge variant="destructive" data-testid={`badge-agency-trap-${index}`}>
                            {trap.subtitle}
                          </Badge>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed" data-testid={`text-agency-trap-${index}`}>
                          {trap.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Diagnosis Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Card className="p-10 bg-primary/5 border-primary/20" data-testid="card-diagnosis">
                <div className="max-w-3xl mx-auto">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="heading-diagnosis">
                    The Diagnosis: You Don't Have a Person Problem.{" "}
                    <span className="text-primary">You Have an Architecture Problem.</span>
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed" data-testid="text-diagnosis">
                    <p>
                      The 'Lone Wolf' hire (the $198k gamble) and the 'Black Box' agency (the $120k guaranteed loss) are just symptoms. The disease is a broken GTM <em>architecture</em>.
                    </p>
                    <p className="text-xl font-semibold text-foreground">
                      You cannot solve an architecture problem by hiring another person. You solve it by building a new system.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center" data-testid="heading-social-proof">
                You Are Not Alone{" "}
                <span className="text-primary">in This Trap</span>
              </h2>
              
              <Card className="p-8 hover-elevate transition-all" data-testid="card-testimonial">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">"</div>
                  <blockquote className="relative z-10 mb-6">
                    <p className="text-xl italic leading-relaxed mb-6" data-testid="text-testimonial-quote">
                      We were stuck in the hiring trap for 6 months. We burned $100k on two SDRs who produced nothing. Revenue Party diagnosed our <em>system</em> problem—our 'Single Point of Failure'—in one audit.
                    </p>
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold" data-testid="text-testimonial-author">Sarah Chen</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-testimonial-title">CEO, TechVenture Inc</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Primary CTA */}
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="heading-cta">
                See the Architecture{" "}
                <span className="text-primary">That Solves This</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto" data-testid="text-cta">
                Stop buying risk and renting activity. It's time to build a permanent, scalable, and guaranteed sales asset.
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg" 
                data-testid="button-cta-gtm-engine"
                asChild
              >
                <Link href="/gtm-engine">
                  See The GTM Engine <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
