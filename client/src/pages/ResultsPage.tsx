import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, TrendingUp, Shield, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";

export default function ResultsPage() {
  // Fetch testimonials from API (same as Home page carousel)
  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });

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
              <div className="max-w-4xl mx-auto text-center mb-12">
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



        {/* Testimonial Wall Module */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-testimonials">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-testimonials">
                Don't Just Take<br />
                <span className="gradient-text gradient-hero">Our Word For It</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {testimonials.slice(0, 4).map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.15,
                    ease: [0.21, 0.45, 0.27, 0.9]
                  }}
                >
                  <Card className="p-10 hover-elevate transition-all h-full flex flex-col backdrop-blur-sm bg-background/80" data-testid={`card-testimonial-${index + 1}`}>
                    {/* Star Rating */}
                    <motion.div 
                      className="flex gap-1 mb-8" 
                      data-testid={`stars-testimonial-${index + 1}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
                    >
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-primary text-primary"
                        />
                      ))}
                    </motion.div>

                    {/* Quote */}
                    <motion.blockquote 
                      className="text-lg text-muted-foreground leading-relaxed flex-1 mb-8" 
                      data-testid={`quote-testimonial-${index + 1}`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    >
                      "{testimonial.quote}"
                    </blockquote >

                    {/* Author Info */}
                    <motion.div 
                      className="border-t border-border/50 pt-6"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
                    >
                      <p className="font-bold text-xl mb-1" data-testid={`name-testimonial-${index + 1}`}>
                        {testimonial.name}
                      </p>
                      <p className="text-base text-muted-foreground mb-1" data-testid={`title-testimonial-${index + 1}`}>
                        {testimonial.title}
                      </p>
                      <p className="text-base font-semibold gradient-text gradient-hero" data-testid={`company-testimonial-${index + 1}`}>
                        {testimonial.company}
                      </p>
                    </motion.div>
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