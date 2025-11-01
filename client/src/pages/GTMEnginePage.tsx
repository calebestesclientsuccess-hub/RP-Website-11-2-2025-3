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
import BuildAndRampTimeline from "@/components/BuildAndRampTimeline";
import { Users, Brain, BookOpen, Shield, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function GTMEnginePage() {
  const impactSellingTenets = [
    {
      id: 'scene-partner',
      title: 'From Audience to Scene Partner',
      description: 'Kill sales pressure by reframing the "pitch"',
      details: 'We kill "sales pressure" by reframing the "pitch" as a collaborative "workshop" with a partner, not a performance for a judge. Your prospects become co-creators in the solution, not passive evaluators.',
    },
    {
      id: 'nouns-to-verbs',
      title: 'From Nouns to Verbs',
      description: 'Execute actions, not pitch features',
      details: 'Amateurs "pitch nouns" (features, our platform). Our Operators "execute verbs" (Diagnose, Reframe, Validate). This is an active, not passive, methodology that drives real engagement.',
    },
    {
      id: 'hierarchy',
      title: 'The Hierarchy of Intention',
      description: 'Strategic, not tactical',
      details: 'Our Operators are strategic, not tactical. Every move is purposeful and tied to the "Why" before the "What". This creates conversations that matter, not just activities that count.',
    },
  ];

  return (
    <>
      <SEO 
        title="The Fullstack Sales Unit - Your Complete GTM Engine | Revenue Party"
        description="Not a sales team. A complete, managed system of elite talent, proprietary strategic framework, and AI-powered tech stack. The architecture that guarantees 20+ SQOs monthly."
        keywords="GTM Engine, Fullstack Sales Unit, revenue generation system, allbound, sales as a service, Impact Selling OS, Signal Factory, BDR pod, guaranteed sales appointments"
        canonical="/gtm-engine"
      />
      <Breadcrumbs items={[]} currentPage="The GTM Engine" />
      
      {/* Hero Module */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              data-testid="heading-hero"
            >
              This Isn't a Sales Team.{" "}
              <span className="text-primary">It's The Fullstack Sales Unit.</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              data-testid="text-hero-subheading"
            >
              You don't have a headcount problem; you have an architecture problem. This is the blueprint for the architecture that guarantees results.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Module 1: The "Hardware" & "Software" of Your Asset */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-asset-components">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-asset-components">
              What Your <span className="text-primary">"Fullstack Sales Unit"</span> is Made Of
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-asset-description">
              A "Fullstack Sales Unit" is not a person; it's a complete, managed system of elite talent (Hardware), proprietary strategic framework (Software), and AI-powered tech stack (Infrastructure). This is what you <em>own</em>.
            </p>
          </div>

          {/* Component 1: Elite Talent */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 hover-elevate transition-all" data-testid="card-elite-talent">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#9F8FFF20',
                      border: '2px solid #9F8FFF',
                    }}
                  >
                    <Users className="w-10 h-10 text-community" />
                  </div>
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-4">Hardware: Component 1</Badge>
                  <h3 className="text-3xl font-bold mb-3">
                    Elite Talent{" "}
                    <span className="text-muted-foreground text-2xl">(The "Fully Loaded BDR Pod")</span>
                  </h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                    <p>
                      This is the antidote to the 'Lone Wolf Fallacy.' You don't get a single, isolated rep; you get a pod of trained operators.
                    </p>
                    <p>
                      This pod is built, trained, and forged by our <strong>Talent Architect, Muneeb Awan</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Dedicated white-labeled pod
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Elite training & coaching
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Zero management overhead
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Component 2: The Signal Factory */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 hover-elevate transition-all" data-testid="card-signal-factory">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#42349c20',
                      border: '2px solid #42349c',
                    }}
                  >
                    <Brain className="w-10 h-10 text-purple-dark" />
                  </div>
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-4">Infrastructure: Component 2</Badge>
                  <h3 className="text-3xl font-bold mb-3">
                    The Signal Factory{" "}
                    <span className="text-muted-foreground text-2xl">(The "AI-Powered Engine")</span>
                  </h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                    <p>
                      This is the antidote to the 'Black Box Problem.' We replace vanity 'activity' metrics with a transparent, AI-powered data engine that finds buyers before they're in-market.
                    </p>
                    <p>
                      This engine is engineered and maintained by our <strong>AI Architect, Danyal Darvesh</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      AI-powered signal detection
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete tech stack included
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Allbound methodology
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Component 3: Strategic Framework (Impact Selling OS) */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 hover-elevate transition-all" data-testid="card-impact-selling-os">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#ef233c20',
                      border: '2px solid #ef233c',
                    }}
                  >
                    <BookOpen className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-4">Software: Component 3</Badge>
                  <h3 className="text-3xl font-bold mb-3">
                    Strategic Framework{" "}
                    <span className="text-muted-foreground text-2xl">(The "Impact Selling OS")</span>
                  </h3>
                  <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                    <p>
                      This is the antidote to the 'Zero-IP Trap.' The GTM Engine is built on a strategic playbook that you <strong>100% own</strong>.
                    </p>
                    <p>
                      This framework is designed by our <strong>Visionary Architect, Caleb Estes</strong>, and protected by our <strong>Brand Guardian, Mariya Tamkeen</strong>.
                    </p>
                  </div>

                  {/* Core Tenets - Expandable Accordion */}
                  <div className="mt-6">
                    <h4 className="text-xl font-bold mb-4">Core Tenets of the "Impact Selling OS":</h4>
                    <Accordion type="single" collapsible className="w-full" data-testid="accordion-impact-tenets">
                      {impactSellingTenets.map((tenet) => (
                        <AccordionItem key={tenet.id} value={tenet.id} data-testid={`accordion-item-${tenet.id}`}>
                          <AccordionTrigger className="text-left" data-testid={`accordion-trigger-${tenet.id}`}>
                            <div>
                              <div className="font-bold text-lg">{tenet.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">{tenet.description}</div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent data-testid={`accordion-content-${tenet.id}`}>
                            <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary">
                              {tenet.details}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Module 2: The 4-Month "Build & Ramp" Process */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-build-ramp">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-build-ramp">
              The 4-Month <span className="text-primary">"Build & Ramp"</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-build-ramp-description">
              Our Transparent Path to Your Guaranteed Asset
            </p>
          </div>

          <BuildAndRampTimeline />

          <div className="text-center mt-12">
            <Card className="p-8 bg-primary/5 border-2 border-primary max-w-2xl mx-auto">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">The Guarantee</h3>
              <p className="text-lg text-muted-foreground">
                Starting <strong>Month 5</strong>, your GTM Engine delivers{" "}
                <span className="text-primary font-bold">20+ SQOs per SDR per month</span>, guaranteed. 
                Every month except December. Reliability you can bank on.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Module 3: The "Anti-Risk" Safety Net */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-anti-risk">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-anti-risk">
              The System is the Asset,{" "}
              <span className="text-primary">Not the Person.</span> This is Your Safety Net.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="p-8 bg-destructive/5 border-2 border-destructive/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">The Lone Wolf Risk</h3>
                    <Badge variant="destructive">34% Failure Rate</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  With a traditional "Lone Wolf" hire, if they quit (34% probability), your pipeline crashes to <strong>zero</strong> for 6-9 months while you recruit, hire, and ramp a replacement.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Single point of failure</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-destructive mt-1">✕</span>
                    <span>6-9 month recovery time</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-destructive mt-1">✕</span>
                    <span>Pipeline crashes to zero</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-destructive mt-1">✕</span>
                    <span>No documented playbook</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div>
              <Card className="p-8 bg-primary/5 border-2 border-primary">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">The GTM Engine Asset</h3>
                    <Badge variant="default">100% Protected</Badge>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our GTM Engine is an <strong>asset</strong>. The Impact Selling OS and Signal Factory are documented and owned by you. If an operator leaves, the system remains. We slot in a new Impact-certified SDR, and your pipeline is protected.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>System-based reliability</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Instant operator replacement</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>Pipeline continuity guaranteed</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span>100% IP ownership forever</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              This is the reliability you're investing in. Not just performance—<strong>guaranteed</strong> performance with zero single points of failure.
            </p>
          </div>
        </div>
      </section>

      {/* Primary CTA Module */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-cta">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-cta">
            See the Results{" "}
            <span className="text-primary">This Engine Produces</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8" data-testid="text-cta-description">
            The architecture is the "how." The results are the "why." See the proof of what a guaranteed GTM Engine can build.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-see-proof" asChild>
            <Link href="/results">
              See The Proof <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
