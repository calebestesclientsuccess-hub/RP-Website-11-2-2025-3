import { useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedGradientMesh } from "@/components/AnimatedGradientMesh";
import { SEO } from "@/components/SEO";
import CinematicBridge from "@/components/CinematicBridge";
import { OrbitalPowers } from "@/components/OrbitalPowers";
import GTMTimeline from "@/components/GTMTimeline";
import { HeroROICalculator } from "@/components/HeroROICalculator";
import { Link } from "wouter";
import orbitalVideo from "@assets/Maintain_the_geometric_202510201050_1760987621907.mp4";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Revenue Party - Your GTM System, Not Just Another Hire"
        description="Deploy a complete GTM system with elite BDRs, AI tech, and proven strategy. Get 20+ qualified appointments monthly."
        canonical="/"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 py-20 md:px-6 lg:px-8 overflow-hidden">
        {/* Animated gradient mesh background */}
        <AnimatedGradientMesh intensity="medium" speed="slow" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Hero Text */}
            <div className="space-y-8">
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                  data-testid="heading-hero"
                >
                  Don't Hire a Rep.{" "}
                  <span className="gradient-text gradient-hero">Deploy a System.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-xl text-muted-foreground leading-relaxed"
                  data-testid="text-hero-subtitle"
                >
                  Your next sales hire shouldn't be a person. It should be a complete GTM engine—built, operated, and guaranteed by us. You own the asset.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 shadow-lg" 
                  data-testid="button-hero-schedule"
                  asChild
                >
                  <Link href="/gtm-audit">Schedule My GTM Audit</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6" 
                  data-testid="button-hero-see-how"
                  asChild
                >
                  <Link href="/gtm-engine">See How It Works</Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Column - ROI Calculator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center lg:justify-end"
            >
              <HeroROICalculator testIdSuffix="-hero" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cinematic Bridge */}
      <CinematicBridge />

      {/* Orbital Powers - Interactive Video Element */}
      <OrbitalPowers videoSrc={orbitalVideo} videoRef={videoRef} />

      {/* GTM Timeline */}
      <GTMTimeline />

      {/* Quick Results Section */}
      <section className="py-16 md:py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="heading-results">
            The Results Speak
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm"
              data-testid="stat-ramp"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">14 Days</div>
              <div className="text-base md:text-lg font-semibold mb-2">Pipeline Productive</div>
              <div className="text-sm text-muted-foreground">Not 6 months</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm"
              data-testid="stat-cost"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">60%+</div>
              <div className="text-base md:text-lg font-semibold mb-2">Cost Savings</div>
              <div className="text-sm text-muted-foreground">vs. internal hire</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-background/50 backdrop-blur-sm"
              data-testid="stat-meetings"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">20+</div>
              <div className="text-base md:text-lg font-semibold mb-2">Qualified Meetings</div>
              <div className="text-sm text-muted-foreground">Monthly guarantee</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold" data-testid="heading-final-cta">
            Ready to Build Your{" "}
            <span className="gradient-text gradient-hero">Revenue Engine</span>?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground">
            Let's audit your GTM architecture and design a system that scales
          </p>
          <Button
            size="lg"
            className="text-base md:text-lg px-8 md:px-10"
            data-testid="button-final-audit"
            asChild
          >
            <Link href="/gtm-audit">Schedule My GTM Audit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
