import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, TrendingUp, Shield, Award, CheckCircle2, XCircle } from "lucide-react";

export default function ResultsPage() {
  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      value: "3-5x",
      label: "Faster Ramp-to-Pipeline",
      description: "Our Pods are audit-to-active in 14 days, not 6-9 months.",
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      value: "20+",
      label: "Guaranteed SQOs / Mo",
      description: "We guarantee 20 B2B qualified appointments that meet your exact ICP & BANT criteria.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      value: "100%",
      label: "IP Ownership",
      description: "You keep every playbook, dataset, and learning. We build your asset, not ours.",
    },
  ];

  const caseStudies = [
    {
      id: "case-1",
      title: "CASE STUDY: How [Client X] Escaped the '$198,000 Mistake' and Built a $2M Pipeline Asset.",
      industry: "B2B SaaS",
      model: "Series A",
      problem: "[Client X] was stuck in the 'Hiring Drag.' They had hired and fired two internal SDRs in 9 months, burning over $150k with nothing to show for it.",
      solution: "Our GTM Audit revealed a system problem. We deployed a GTM Engine. For roughly the same annual cost as one of their failed hires, we deployed a full BDR Pod, the Signal Factory, and their 'Impact Selling OS'—all in 14 days.",
      results: [
        "20-25 BANT-qualified appointments every month.",
        "$2M in qualified pipeline in the first 60 days.",
        "An effective CPL of <$750, dropping to <$300 as the system scaled.",
      ],
    },
  ];

  const testimonials = [
    {
      quote: "The ROI is a no-brainer. We pay a flat fee and get 20+ guaranteed, qualified meetings a month. Our internal team could never get that, and they cost us more.",
      name: "[Name]",
      title: "CEO",
      company: "[Company]",
      rating: 5,
    },
    {
      quote: "We were about to hire a 'top-tier' agency. The GTM Audit showed us how that would have been a fatal 'Zero-IP Trap'. Revenue Party didn't just sell us a service; they saved us from a multi-six-figure mistake.",
      name: "[Name]",
      title: "CRO",
      company: "[Company]",
      rating: 5,
    },
  ];

  return (
    <>
      <SEO
        title="The Numbers Don't Lie. The Results Are Guaranteed. | Revenue Party"
        description="Revenue Party case studies: See guaranteed 20+ SQOs/SDR monthly floor, 80+ SQO ceiling, and 0% pipeline risk. Real outsourced SDR results from our GTM engine."
        keywords="Revenue Party case studies, outsourced SDR case study, GTM engine results, guaranteed sales appointments, SDR performance, sales system results"
        canonical="/results"
      />
      <Breadcrumbs items={[]} currentPage="Results & Case Studies" />

      <div className="min-h-screen">
        {/* Hero Module */}
        <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
          {/* Light grid dots pattern (light mode only) */}
          <div className="light-grid-dots" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-6 flex justify-center"
              >
                <Badge
                  className="badge-texture bg-primary text-white border-primary text-sm px-4 py-1.5"
                  data-testid="badge-hero-results"
                >
                  Proven Results
                </Badge>
              </motion.div>
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                data-testid="heading-hero"
              >
                The Numbers Don't Lie.{" "}
                <span className="gradient-text gradient-hero">The Results Speak.</span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                data-testid="text-hero-subheading"
              >
                We don't just solve your pipeline problem. We provide the antidote to the "Traps" that cause it.
              </motion.p>
            </div>
          </div>
        </section>

        {/* At-a-Glance "Proven Results" Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-proven-results">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-proven-results">
                Proven Results.<br />
                <span className="gradient-text gradient-hero">No Black Box.</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-proven-results-description">
                The GTM Engine model is built on transparency and provable performance.
              </p>
            </div>

            {/* Row 1: The Value & Reliability */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">The Value & Reliability</h3>
              <div className="grid md:grid-cols-3 gap-8" data-testid="grid-metrics-value">
                {/* Metric 4 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-4">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-4">
                      20+
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-4">
                      Meetings/Month
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-4">
                    A predictable pipeline averaging 1+ qualified meeting per day.
                  </p>
                </Card>

                {/* Metric 5 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-5">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-5">
                      55%
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-5">
                      Cost Savings
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-5">
                    Get a high-performance engine for 55% less than one $198k+ internal hire.
                  </p>
                </Card>

                {/* Metric 6 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-6">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-6">
                      Zero
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-6">
                      Pipeline Disruption
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-6">
                    Our 'Engine' model means you never start over. We manage performance so your pipeline never stops.
                  </p>
                </Card>
              </div>
            </div>

            {/* Row 2: The Performance */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-8">The Performance</h3>
              <div className="grid md:grid-cols-3 gap-8" data-testid="grid-metrics-performance">
                {/* Metric 1 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-1">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-1">
                      91%
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-1">
                      Quota Attainment
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-1">
                    A culture of performance where reps are managed to hit their numbers.
                  </p>
                </Card>

                {/* Metric 2 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-2">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-2">
                      63%
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-2">
                      Surpassed Quota
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-2">
                    We don't just meet goals; 63% of our team <em>surpassed</em> their quota last year.
                  </p>
                </Card>

                {/* Metric 3 */}
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm" data-testid="card-metric-3">
                  <div className="mb-4">
                    <div className="text-5xl font-bold gradient-text gradient-hero" data-testid="metric-value-3">
                      99.9%
                    </div>
                    <div className="text-lg font-semibold mt-2" data-testid="metric-label-3">
                      Performance Floor
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed" data-testid="metric-description-3">
                    Nearly every rep achieved over 85% of quota, eliminating the risk of a "zero."
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Case Studies Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-case-studies">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-case-studies">
                The Antidotes:<br />
                <span className="gradient-text gradient-hero">How We Fix the Traps</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-case-studies-description">
                Our clients come to us from one of two failed models. Here's how we build their solution.
              </p>
            </div>

            <div className="space-y-8 max-w-5xl mx-auto">
              <Accordion type="single" collapsible className="space-y-6">
                {caseStudies.map((study, index) => (
                  <AccordionItem
                    key={study.id}
                    value={study.id}
                    className="border-none"
                  >
                    <Card className="overflow-hidden" data-testid={`card-case-study-${index + 1}`}>
                      <AccordionTrigger className="px-8 py-6 hover:no-underline hover-elevate [&[data-state=open]]:pb-4">
                        <div className="flex flex-col items-start text-left space-y-4 flex-1 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" data-testid={`badge-industry-${index + 1}`}>
                              {study.industry}
                            </Badge>
                            <Badge variant="secondary" data-testid={`badge-model-${index + 1}`}>
                              {study.model}
                            </Badge>
                          </div>
                          <h3 className="text-2xl font-bold" data-testid={`heading-case-study-${index + 1}`}>
                            {study.title}
                          </h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-8">
                        <div className="space-y-6 pt-4">
                          {/* The Problem */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-bold text-lg mb-2">The Problem (The "Hiring Drag")</h4>
                                <p className="text-muted-foreground leading-relaxed" data-testid={`text-problem-${index + 1}`}>
                                  {study.problem}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* The Solution */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-bold text-lg mb-2">The Solution (The "GTM Engine" Antidote)</h4>
                                <p className="text-muted-foreground leading-relaxed" data-testid={`text-solution-${index + 1}`}>
                                  {study.solution}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* The Results */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Award className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                              <div>
                                <h4 className="font-bold text-lg mb-2">The Results (The Asset)</h4>
                                <ul className="space-y-2 text-muted-foreground leading-relaxed" data-testid={`list-results-${index + 1}`}>
                                  {study.results.map((result, resultIndex) => (
                                    <li key={resultIndex} className="flex items-start gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                                      <span>{result}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Testimonial Wall Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-testimonials">
                Don't Just Take<br />
                <span className="gradient-text gradient-hero">Our Word For It</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 hover-elevate transition-all h-full flex flex-col" data-testid={`card-testimonial-${index + 1}`}>
                    {/* Star Rating */}
                    <div className="flex gap-1 mb-6" data-testid={`stars-testimonial-${index + 1}`}>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-primary text-primary"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-muted-foreground leading-relaxed flex-1" data-testid={`quote-testimonial-${index + 1}`}>
                      "{testimonial.quote}"
                    </blockquote>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Primary CTA Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-cta">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-cta">
              Ready to Build Your Own<br />
              <span className="gradient-text gradient-hero">Revenue Asset?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-cta-description">
              Let's apply these same principles to your business. Schedule a free GTM Audit to get your custom blueprint. Stop renting activity and start building your engine.
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