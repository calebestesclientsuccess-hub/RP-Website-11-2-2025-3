import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, DollarSign } from "lucide-react";

export default function ProblemPage() {

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
          {/* Light grid dots pattern (light mode only) */}
          <div className="light-grid-dots" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 flex justify-center"
            >
              <Badge 
                className="badge-texture bg-primary text-white border-primary text-sm px-4 py-1.5"
                data-testid="badge-hero-trap"
              >
                The Lone Wolf Trap
              </Badge>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              data-testid="heading-hero"
            >
              Stop Solving Systems Problems{" "}
              <span className="gradient-text gradient-hero">with Headcount Solutions.</span>
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

        {/* Introduction Module - "The False Dichotomy" */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center" data-testid="heading-false-dichotomy">
                The Two-Option Trap<br />
                <span className="gradient-text gradient-hero">That Guarantees Failure</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed" data-testid="text-false-dichotomy">
                <p>
                  B2B leaders are told they have two choices for building pipeline: hire internally or outsource to an agency.
                </p>
                <p>
                  What they aren't told is that both of these models are fundamentally broken. They are two paths to the same destination: a burned-out team, a non-existent pipeline, and a GTM strategy with zero long-term assets.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trap 1 Module - "The Internal Hire" */}
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
                Trap 1: The Internal Hire<br />
                <span className="gradient-text gradient-hero">(The '$198,000 Mistake')</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl" data-testid="text-trap-1-intro">
                You write the 'perfect' job description. You screen 100+ candidates. You hire a rep with a great resume. Six months later, you have no pipeline, the rep is burned out, and you're back at square one—minus $198,000.
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* The "Hiring Drag" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-hiring-drag">
                  The "Hiring Drag"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-hiring-drag">
                  The 3-6 month process of sourcing, interviewing, and onboarding that produces zero pipeline. By the time your rep is 'ramped,' they're already looking for their next job.
                </p>
              </motion.div>

              {/* The "Management Tax" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-management-tax">
                  The "Management Tax"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-management-tax">
                  The hidden cost of your time (or your sales leader's time) spent on 1:1s, training, and performance management instead of closing revenue. This 'tax' is invisible and it's killing your growth.
                </p>
              </motion.div>

              {/* The "Lone Wolf Fallacy" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-lone-wolf-fallacy">
                  The "Lone Wolf Fallacy"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-lone-wolf-fallacy">
                  The belief that one person, armed with a laptop and a phone, can successfully build a predictable pipeline. They operate in a silo, have no data, no system, and no support. They are set up to fail.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trap 2 Module - "The Outsourcing Agency" */}
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
                <span className="text-primary">(The 'Suicide Mission')</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl" data-testid="text-trap-2-intro">
                You're tired of the hiring drag, so you sign a 12-month contract with a 'leading' B2B appointment setting service. They promise you 10 meetings a month. What you get is a list of unqualified leads and a bill.
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* The "Black Box Problem" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-black-box">
                  The "Black Box Problem"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-black-box">
                  You have no idea how they're getting meetings. You don't know the messaging, you can't see the data, and you have no control. You're flying blind.
                </p>
              </motion.div>

              {/* The "Activity Mirage" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-activity-mirage">
                  The "Activity Mirage"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-activity-mirage">
                  They send you impressive dashboards showing 1,000s of 'activities.' But 'activity' is not 'progress.' These are vanity metrics designed to hide a total lack of qualified pipeline.
                </p>
              </motion.div>

              {/* The "Zero-IP Trap" */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="heading-zero-ip">
                  The "Zero-IP Trap"
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-zero-ip">
                  This is the most dangerous trap. After 12 months, you fire the agency. What do you have to show for it? Nothing. They leave and take 100% of the IP, the learnings, and the playbooks with them. You are left with zero assets.
                </p>
              </motion.div>
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
              <Card className="p-10 light-depth bg-primary/5 border-primary/20" data-testid="card-diagnosis">
                <div className="max-w-3xl mx-auto">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="heading-diagnosis">
                    The Diagnosis: You Don't Have a Person Problem.{" "}
                    <span className="text-primary">You Have an Architecture Problem.</span>
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed" data-testid="text-diagnosis">
                    <p>
                      The 'Lone Wolf' hire and the 'Black Box' agency are just symptoms. The disease is a broken GTM architecture.
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
              
              <Card className="p-8 light-depth hover-elevate transition-all" data-testid="card-testimonial">
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

        {/* Primary CTA Module */}
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
                Stop buying 'activity' and 'headcount.' It's time to build a permanent, scalable revenue generation system.
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-6 py-5" 
                  data-testid="button-read-manifesto"
                  asChild
                >
                  <Link href="/blog/manifesto-the-lone-wolf-trap">
                    Read the Manifesto: The Lone Wolf Trap
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-6 py-5" 
                  data-testid="button-view-sdr-guide"
                  asChild
                >
                  <Link href="/resources/how-to-build-sdr-team-guide">
                    Guide: How to Build an SDR Team
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
