import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaticGradientBg } from "@/components/StaticGradientBg";
import { HeroROICalculator } from "@/components/HeroROICalculator";
import SimpleBridgeSection from "@/components/SimpleBridgeSection";
import { SimplifiedOrbitalPowers } from "@/components/SimplifiedOrbitalPowers";
import { SEO } from "@/components/SEO";
import { ServiceSchema } from "@/components/ServiceSchema";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import VideoSchema from "@/components/VideoSchema";
import SoftwareApplicationSchema from "@/components/SoftwareApplicationSchema";
import LeadMagnetHero from "@/components/LeadMagnetHero";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { WidgetZone } from "@/components/WidgetZone";
import { ArrowRight, Users, Target, Zap, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Video is served from public directory
const podVideo = "/bdr-pod-video.mp4";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const scrollAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAwayStartRef = useRef<number | null>(null);

  // Auto-scroll page down slightly on initial load
  useEffect(() => {
    window.scrollTo({ top: 60, behavior: 'instant' });
  }, []);

  // Handle video playback and scroll behavior
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setHasPlayed(true);
    };

    // Intersection Observer to detect when video leaves/enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Video has left the viewport - start tracking time
            scrollAwayStartRef.current = Date.now();
          } else {
            // Video has entered the viewport
            if (scrollAwayStartRef.current) {
              const timeAway = Date.now() - scrollAwayStartRef.current;
              // If user was away for 6+ seconds, reset hasPlayed
              if (timeAway >= 6000) {
                setHasPlayed(false);
              }
              scrollAwayStartRef.current = null;
            }

            // Play video if it hasn't played yet
            if (!hasPlayed && video.paused) {
              video.play().catch(() => {
                // Handle autoplay restrictions
              });
            }
          }
        });
      },
      {
        threshold: 0.3, // Video is considered visible - lowered for mobile
      }
    );

    observer.observe(video);
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      observer.disconnect();
      video.removeEventListener('ended', handleVideoEnd);
      if (scrollAwayTimerRef.current) {
        clearTimeout(scrollAwayTimerRef.current);
      }
    };
  }, [hasPlayed]);

  return (
    <div className="min-h-screen">
      <SEO 
        title="GTM Engine: Deploy Elite BDR Pods | Revenue Party"
        description="Stop hiring lone wolf SDRs. Deploy a complete GTM Engine with elite BDR pods, AI-powered Signal Factory, and guaranteed 20+ qualified appointments monthly. Own the system, not rent headcount."
        keywords="Revenue Generation System, GTM Engine, Fullstack Sales Unit, white-labeled sales, guaranteed sales appointments, BDR pod, sales system"
        canonical="/"
      />
      <ServiceSchema />
      <LocalBusinessSchema />
      <SoftwareApplicationSchema />
      <VideoSchema 
        name="Your Fullstack Sales Unit - Revenue Party GTM System"
        description="Watch how Revenue Party's GTM Engine deploys elite BDR talent with AI-powered systems to deliver 20+ qualified appointments monthly."
        thumbnailUrl="https://revenueparty.com/apple-touch-icon.png"
        uploadDate="2024-10-01"
        duration="PT2M"
        contentUrl={`https://revenueparty.com${podVideo}`}
      />

      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-4 md:px-6 lg:px-8 overflow-hidden" style={{ minHeight: '175vh', paddingBottom: '40vh' }}>
        <StaticGradientBg />

        {/* Light grid dots pattern (light mode only) */}
        <div className="light-grid-dots" />

        {/* Sun rays animation (light mode only) */}
        <div className="sun-rays-container">
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="-mb-2"
                >
                  <Badge 
                    className="badge-texture bg-community text-white border-community text-sm px-4 py-1.5"
                    data-testid="badge-hero-culture"
                  >
                    Community + Competition = Culture
                  </Badge>
                </motion.div>
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  data-testid="heading-hero"
                >
                  Your Next Sales Hire Shouldn't Be a Person.{" "}
                  <span className="gradient-text gradient-hero">It Should Be a Revenue Generation System.</span>
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  data-testid="text-hero-body"
                >
                  We build self-sustaining <Link href="/gtm-engine" className="hover:underline">GTM Engines</Link> that deliver 3-5x the pipeline at 60%+ of the cost of a <Link href="/problem" className="hover:underline">traditional internal hire</Link>. This isn't an SDR. It's your entire revenue architecture.
                </motion.p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg btn-gradient-text" 
                  data-testid="button-hero-schedule"
                  asChild
                >
                  <Link href="/gtm-audit">Schedule My GTM Audit</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="secondary-cta text-lg px-8 py-6" 
                  data-testid="button-hero-take-assessment"
                  asChild
                >
                  <Link href="/assessment">Take Assessment</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroROICalculator testIdSuffix="-hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Top Widget Zone */}
      <WidgetZone zone="zone-1" className="my-8" />

      {/* Problem Module - "The Trap" */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-trap">
              The $198,000 Mistake<br />
              <span className="gradient-text gradient-hero">You Don't Have to Make</span>
            </h2>
            <div className="space-y-4">
              <p className="text-xl leading-relaxed" data-testid="text-trap-description">
                Founders are forced to choose between two bad options: the slow, expensive '$198,000 Mistake' of a failed internal hire, or the 'Outsourcing Suicide Mission' that gives you zero IP and zero control.
              </p>
              <p className="text-xl leading-relaxed" data-testid="text-trap-disease">
                Both are symptoms of the same disease: solving a system problem with a headcount solution.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/problem">
              <Button variant="outline" size="lg" data-testid="button-expose-traps">
                Expose The Traps <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Lead Magnet Section */}
          <div className="max-w-3xl mx-auto mt-16">
            <LeadMagnetHero />
          </div>
        </div>
      </section>

      {/* Bridge Statement */}
      <SimpleBridgeSection />

      {/* Middle Widget Zone 1 */}
      <WidgetZone zone="zone-2" className="my-8" />

      {/* Solution Module - "The System" */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8" data-testid="section-solution">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-solution">
              Don't Hire a Rep.<br />
              <span className="gradient-text gradient-hero">Deploy an Engine.</span>
            </h2>
          </div>

          {/* 3 Core Components */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <Card className="p-8 light-trickle-top light-depth hover-elevate transition-all h-full" data-testid="card-component-talent">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Elite Talent <span>(The "Fully Loaded BDR Pod")</span></h3>
                <p className="leading-relaxed">
                  A dedicated, managed, and battle-tested team of BDRs, not a single 'Lone Wolf' rep.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 light-trickle-corner light-depth hover-elevate transition-all h-full" data-testid="card-component-framework">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Strategic Framework <span>(The "Impact Selling OS")</span></h3>
                <p className="leading-relaxed">
                  The operating system and strategic playbook that makes talent effective. You own 100% of the IP.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 light-trickle-radial light-depth hover-elevate transition-all h-full" data-testid="card-component-signal">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">The Signal Factory <span>(Your AI-Powered Engine)</span></h3>
                <p className="leading-relaxed">
                  The AI-powered tech stack that finds and qualifies buyers before they're 'in-market'.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2"
              data-testid="button-build-gtm-engine"
              asChild
            >
              <Link href="/gtm-engine">
                Build Your GTM Engine <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Your Fullstack Sales Unit - The Product Reveal */}
      <SimplifiedOrbitalPowers videoSrc={podVideo} videoRef={videoRef} />

      {/* Proof Module - "Social Proof" */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-proof">
              Proven Results.<br />
              <span className="gradient-text gradient-hero">No Black Box.</span>
            </h2>
            <p className="text-xl leading-relaxed" data-testid="text-proof-description">
              The GTM Engine model is built on transparency and performance.
            </p>
          </div>

          {/* 3-Column Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
            >
              <Card className="p-8 text-center light-depth hover-elevate transition-all h-full" data-testid="metric-ramp">
                <h3 className="text-6xl font-bold gradient-text gradient-hero mb-4">3-5x</h3>
                <h4 className="text-2xl font-bold mb-3">Faster Ramp</h4>
                <p>Pipeline productive in 14 days, not 6 months.</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8 text-center light-depth hover-elevate transition-all h-full" data-testid="metric-savings">
                <h3 className="text-6xl font-bold gradient-text gradient-hero mb-4">60%+</h3>
                <h4 className="text-2xl font-bold mb-3">Cost Savings</h4>
                <p>vs. the $198k+ total cost of a failed internal hire.</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 text-center light-depth hover-elevate transition-all h-full" data-testid="metric-pipeline">
                <h3 className="text-6xl font-bold gradient-text gradient-hero mb-4">$2M</h3>
                <h4 className="text-2xl font-bold mb-3">Pipeline Asset</h4>
                <p>Teaser from 'Antidote' case study.</p>
              </Card>
            </motion.div>
          </div>

          {/* Testimonial Carousel */}
          <div className="mb-16">
            <TestimonialCarousel />
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/results">
              <Button variant="outline" size="lg" data-testid="button-see-proof">
                See The Proof <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Middle Widget Zone 2 */}
      <WidgetZone zone="zone-3" className="my-8" />

      {/* Widget Zone 5 */}
      <WidgetZone zone="zone-5" className="my-8" />

      {/* Tool Module - "Interactive ROI Calculator" */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-roi-calculator">
              Stop Guessing.<br />
              <span className="gradient-text gradient-hero">Calculate Your True ROI.</span>
            </h2>
            <p className="text-xl leading-relaxed" data-testid="text-roi-calculator-description">
              A single internal hire costs over $198,000 when you factor in salary, benefits, management tax, and hiring drag. Use our calculator to see the true cost of the 'Lone Wolf' model compared to deploying a GTM Engine.
            </p>
          </div>

          {/* Centered Calculator */}
          <div className="flex justify-center mb-12">
            <HeroROICalculator testIdSuffix="-bottom" />
          </div>

          {/* CTA for Full Calculator */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              data-testid="button-calculate-savings"
              asChild
            >
              <Link href="/roi-calculator">Calculate My Savings</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom Widget Zone */}
      <WidgetZone zone="zone-4" className="my-8" />

      {/* Widget Zone 6 */}
      <WidgetZone zone="zone-6" className="my-8" />

      {/* Final CTA Module */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="heading-final-cta">
            The Blueprint is Clear.<br />
            <span className="gradient-text gradient-hero">Schedule Your GTM Audit.</span>
          </h2>
          <p className="text-xl leading-relaxed" data-testid="text-final-cta-description">
            Stop the hiring/firing cycle. Let's audit your GTM architecture and design a system that scales.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-10 py-7 shadow-lg btn-gradient-text"
            data-testid="button-final-schedule"
            asChild
          >
            <Link href="/gtm-audit">Schedule My GTM Audit</Link>
          </Button>

          {/* Secondary CTA / Lead Magnet Module */}
          <div className="pt-12 border-t border-border/50">
            <h3 className="text-2xl font-bold mb-4" data-testid="heading-secondary-cta">
              Not ready for an audit?
            </h3>
            <p className="text-lg mb-6" data-testid="text-secondary-cta-description">
              Take our 3-minute GTM Readiness Assessment to diagnose your current system's bottlenecks.
            </p>
            <Link href="/assessment">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                data-testid="button-assessment"
              >
                Assess My GTM Readiness <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}