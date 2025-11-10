import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaticGradientBg } from "@/components/StaticGradientBg";
import { SEO } from "@/components/SEO";
import { ServiceSchema } from "@/components/ServiceSchema";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import SoftwareApplicationSchema from "@/components/SoftwareApplicationSchema";
import { ArrowRight, Calculator, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Stop Hiring SDRs. Calculate Your Revenue Engine ROI | Revenue Party"
        description="See exactly how much you're losing with the traditional SDR model. Our calculator shows the real cost of hiring vs. deploying a complete Revenue Engine. Results in 60 seconds."
        keywords="SDR cost calculator, revenue engine ROI, sales hiring cost, GTM calculator"
        canonical="/"
      />
      <ServiceSchema />
      <LocalBusinessSchema />
      <SoftwareApplicationSchema />

      {/* Hero Section - Ultra Focused */}
      <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        <StaticGradientBg />
        <div className="light-grid-dots" />
        <div className="sun-rays-container">
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
          <div className="sun-ray"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-12">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
              <div className="mb-2">Your Next SDR Will Cost You</div>
              <div className="gradient-text gradient-hero">$198,000</div>
            </h1>
            <p className="text-2xl md:text-3xl leading-relaxed max-w-3xl mx-auto">
              Or you could deploy a complete Revenue Engine for <span className="font-bold text-primary">60% less.</span>
            </p>
          </motion.div>

          {/* Stats Proof Points */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold gradient-text gradient-hero">60%+</div>
                <div className="text-sm opacity-80">Cost Savings</div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold gradient-text gradient-hero">3-5x</div>
                <div className="text-sm opacity-80">Faster Ramp</div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold gradient-text gradient-hero">14 Days</div>
                <div className="text-sm opacity-80">To Pipeline</div>
              </div>
            </Card>
          </motion.div>

          {/* Single CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            <Button
              size="lg"
              className="text-2xl px-12 py-8 shadow-2xl btn-gradient-text hover:scale-105 transition-transform"
              asChild
            >
              <Link href="/roi-calculator">
                <Calculator className="w-6 h-6 mr-3" />
                Calculate Your True Cost
                <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
            </Button>

            <p className="text-sm opacity-70">
              Free • No signup required • Results in 60 seconds
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="pt-12 border-t border-border/30"
          >
            <p className="text-sm opacity-60 mb-4">Trusted by fast-growing B2B companies</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              <span className="text-lg font-semibold">YC-Backed Startups</span>
              <span className="text-lg font-semibold">Series A-C Companies</span>
              <span className="text-lg font-semibold">Growth-Stage SaaS</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}