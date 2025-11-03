import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AnimatedGradientMesh } from "@/components/AnimatedGradientMesh";
import { SEO } from "@/components/SEO";
import CinematicBridge from "@/components/CinematicBridge";
import OrbitalPowers from "@/components/OrbitalPowers";
import GTMTimeline from "@/components/GTMTimeline";
import { HeroROICalculator } from "@/components/HeroROICalculator";
import { Brain, Target, Settings, Users, Wrench, Trophy, ArrowRight, X } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/image_1762158443107.png";

interface Power {
  id: string;
  title: string;
  icon: JSX.Element;
  color: string;
  glowColor: string;
  description: string;
  details: string[];
  value: string;
  position: {
    mobile: { top?: string; bottom?: string; left?: string; right?: string };
    desktop: { top?: string; bottom?: string; left?: string; right?: string };
  };
}

const powers: Power[] = [
  {
    id: "tech-stack",
    title: "Tech Stack",
    icon: <Wrench className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-primary",
    glowColor: "0 85% 42%",
    description: "Best-in-class tools integrated and optimized for maximum efficiency.",
    details: [
      "Multi-channel outreach platform",
      "Intent data & enrichment",
      "Advanced analytics dashboard",
      "Custom automation workflows"
    ],
    value: "Saves $200,000+ in annual tool costs through volume licensing.",
    position: {
      mobile: { top: "5%", left: "10%" },
      desktop: { top: "12%", left: "18%" }
    }
  },
  {
    id: "community",
    title: "Community & Competition",
    icon: <Trophy className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-community",
    glowColor: "252 80% 32%",
    description: "A culture of excellence where top performers push each other to succeed.",
    details: [
      "Daily team competitions",
      "Peer learning & mentorship",
      "Recognition & rewards",
      "Shared best practices"
    ],
    value: "Creates a high-performance culture that drives 2.5x better results.",
    position: {
      mobile: { top: "5%", right: "10%" },
      desktop: { top: "12%", right: "18%" }
    }
  },
  {
    id: "elite-coach",
    title: "Elite Coach",
    icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-community",
    glowColor: "252 80% 32%",
    description: "World-class coaching that elevates your BDRs to top 1% performance.",
    details: [
      "Daily skill development",
      "Real-time call coaching",
      "Performance analytics",
      "1:1 feedback sessions"
    ],
    value: "Accelerates ramp time from 3 months to 3 weeks.",
    position: {
      mobile: { top: "50%", left: "5%" },
      desktop: { top: "50%", left: "10%" }
    }
  },
  {
    id: "ai-architect",
    title: "AI Architect",
    icon: <Brain className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-primary",
    glowColor: "0 85% 42%",
    description: "Intelligent systems that research, personalize, and optimize at scale.",
    details: [
      "AI-powered prospect research",
      "Automated personalization",
      "Message optimization",
      "Predictive analytics"
    ],
    value: "Increases response rates by 3x through hyper-personalization.",
    position: {
      mobile: { top: "50%", right: "5%" },
      desktop: { top: "50%", right: "10%" }
    }
  },
  {
    id: "revops",
    title: "RevOps",
    icon: <Settings className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-community",
    glowColor: "252 80% 32%",
    description: "Full revenue operations management ensuring seamless system performance.",
    details: [
      "CRM & tool optimization",
      "Data hygiene & reporting",
      "Process automation",
      "System integration"
    ],
    value: "Eliminates 20+ hours/week of manual tasks.",
    position: {
      mobile: { bottom: "5%", left: "10%" },
      desktop: { bottom: "12%", left: "18%" }
    }
  },
  {
    id: "gtm-strategist",
    title: "GTM Strategist",
    icon: <Target className="w-4 h-4 md:w-5 md:h-5" />,
    color: "text-primary",
    glowColor: "0 85% 42%",
    description: "Expert strategists who design and refine your entire revenue playbook.",
    details: [
      "ICP & persona development",
      "Messaging & positioning",
      "Multi-channel campaigns",
      "Market intelligence"
    ],
    value: "Reduces time to product-market fit by 6-12 months.",
    position: {
      mobile: { bottom: "5%", right: "10%" },
      desktop: { bottom: "12%", right: "18%" }
    }
  }
];

export default function Home() {
  const [selectedPower, setSelectedPower] = useState<Power | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Revenue Party - Your GTM System, Not Just Another Hire"
        description="Deploy a complete GTM system with elite BDRs, AI tech, and proven strategy. Get 20+ qualified appointments monthly."
        canonical="/"
      />

      {/* Hero Section - Mobile First */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated gradient mesh background */}
        <AnimatedGradientMesh intensity="medium" speed="slow" />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          {/* Header Text - Mobile First */}
          <div className="text-center mb-8 md:mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 px-4"
              data-testid="heading-hero"
            >
              Don't Hire a Rep.{" "}
              <span className="gradient-text gradient-hero">Deploy a System.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-4"
              data-testid="text-hero-subtitle"
            >
              Explore the 6 powers of a complete GTM Engine
            </motion.p>
          </div>

          {/* Interactive Hero Image with Floating Badges */}
          <div className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-video">
            {/* Central Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute inset-0 md:inset-8 rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={heroImage}
                alt="Revenue Party GTM System"
                className="w-full h-full object-cover"
                data-testid="img-hero"
              />
            </motion.div>

            {/* Floating Power Badges */}
            {powers.map((power, index) => {
              const floatVariants = [
                { y: [0, -12, 0], x: [0, 3, 0], rotate: [0, 2, 0] },
                { y: [0, -8, 0], x: [0, -4, 0], rotate: [0, -1, 0] },
                { y: [0, -10, 0], x: [0, 2, 0], rotate: [0, 1.5, 0] },
                { y: [0, -9, 0], x: [0, -3, 0], rotate: [0, -2, 0] },
                { y: [0, -11, 0], x: [0, 4, 0], rotate: [0, 1, 0] },
                { y: [0, -7, 0], x: [0, -2, 0], rotate: [0, -1.5, 0] }
              ];
              
              const variant = floatVariants[index % floatVariants.length];
              
              return (
                <motion.button
                  key={power.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: variant.y,
                    x: variant.x,
                    rotate: variant.rotate
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.6 + index * 0.1 },
                    scale: { duration: 0.5, delay: 0.6 + index * 0.1 },
                    y: {
                      duration: 3 + index * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    },
                    x: {
                      duration: 4 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    },
                    rotate: {
                      duration: 5 + index * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.4
                    }
                  }}
                  className="absolute group -translate-x-1/2 -translate-y-1/2"
                  style={isDesktop ? power.position.desktop : power.position.mobile}
                  onClick={() => setSelectedPower(power)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPower(power);
                    }
                  }}
                  aria-label={`Learn more about ${power.title}`}
                  data-testid={`badge-${power.id}`}
                >
                  <div className="relative">
                    {/* Animated Glow effect */}
                    <motion.div 
                      className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-100"
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1.3, 1.6, 1.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                      style={{
                        background: `hsl(${power.glowColor} / 0.6)`
                      }}
                    />
                    
                    {/* Badge */}
                    <Badge
                      className={`relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold bg-background/95 backdrop-blur-md border-2 hover-elevate active-elevate-2 transition-all shadow-lg ${power.color}`}
                      style={{
                        borderColor: `hsl(${power.glowColor})`
                      }}
                    >
                      {power.icon}
                      <span className="whitespace-nowrap">{power.title}</span>
                    </Badge>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mt-12 md:mt-16 space-y-6"
          >
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Tap any badge to explore what makes this system work
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button
                size="lg"
                className="text-base md:text-lg px-6 md:px-8"
                data-testid="button-schedule-audit"
                asChild
              >
                <Link href="/gtm-audit">
                  Schedule GTM Audit <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-6 md:px-8"
                data-testid="button-see-how-it-works"
                asChild
              >
                <Link href="/gtm-engine">See How It Works</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cinematic Bridge */}
      <CinematicBridge />

      {/* Orbital Powers - Interactive Video Element */}
      <OrbitalPowers />

      {/* GTM Timeline */}
      <GTMTimeline />

      {/* ROI Calculator Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Do The Math
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              See how the RevParty Pod delivers exceptional ROI
            </p>
          </div>
          <div className="flex justify-center">
            <HeroROICalculator testIdSuffix="-home" />
          </div>
        </div>
      </section>

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

      {/* Power Detail Modal */}
      <AnimatePresence>
        {selectedPower && (
          <Dialog open={!!selectedPower} onOpenChange={() => setSelectedPower(null)}>
            <DialogContent className="max-w-lg" data-testid={`modal-${selectedPower.id}`}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  <div className={`${selectedPower.color}`}>
                    {selectedPower.icon}
                  </div>
                  {selectedPower.title}
                </DialogTitle>
                <DialogDescription className="text-base pt-4">
                  {selectedPower.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">What You Get:</h4>
                  <ul className="space-y-2">
                    {selectedPower.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className={`mt-1 ${selectedPower.color}`}>•</div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-card border">
                  <h4 className="font-semibold mb-2 text-foreground">The Value:</h4>
                  <p className="text-sm text-muted-foreground">{selectedPower.value}</p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setSelectedPower(null)}
                  data-testid="button-close-modal"
                >
                  Got it
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
