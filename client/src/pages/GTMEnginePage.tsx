
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetZone } from "@/components/WidgetZone";
import { CostEquationCard } from "@/components/CostEquationCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HeroJourneyGrid } from "@/components/HeroJourneyGrid";
import { ArrowRight, Users, Brain, BookOpen, Target, Settings, Wrench } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useRef, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SimplifiedOrbitalPowers = lazy(() => import("@/components/SimplifiedOrbitalPowers").then(module => ({ default: module.SimplifiedOrbitalPowers })));

const podVideo = "/sdr-pod-video.mp4";

import { Helmet } from 'react-helmet-async';

export default function GTMEnginePage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "GTM Engine - Complete Revenue Generation System",
    "description": "Deploy elite SDR pods with AI-powered systems. Guaranteed 20+ qualified appointments monthly. Own the GTM Engine, not rent headcount.",
    "brand": {
      "@type": "Brand",
      "name": "Revenue Party"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "12500",
      "highPrice": "15000",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47"
    }
  };

  const costItems = [
    { amount: 50000, label: "The 3.1-Month \"Ramp Burn\"" },
    { amount: 27000, label: "The Crushing \"Management Tax\"" },
    { amount: 20000, label: "The Recruiting & Hiring Gamble" },
    { amount: 101000, label: "The \"Opportunity Cost\" of a failed territory" }
  ];

  const comparisonItems = [
    {
      oldWay: "Hire a single \"Lone Wolf\" SDR who operates in isolation",
      newWay: "Deploy a full \"Fullstack Sales Unit\" with multiple roles and systems"
    },
    {
      oldWay: "Hope they figure it out on their own with minimal support",
      newWay: "Benefit from proven playbooks, AI tools, and expert coaching"
    },
    {
      oldWay: "Wait 3-6 months for ramp, risking 34% turnover",
      newWay: "Get pipeline-productive operators in Week 2, with guaranteed continuity"
    },
    {
      oldWay: "Own zero IP when they leave - start from scratch",
      newWay: "Own 100% of the GTM playbook and Signal Factory forever"
    }
  ];

  const architectContributions = [
    {
      title: "GTM Architect Contribution",
      description: "Redesigned the entire ICP, messaging framework, and multi-channel strategy to align with the new market position.",
      icon: <Target className="w-6 h-6 text-primary" />
    },
    {
      title: "AI Architect Contribution",
      description: "Built a custom Signal Factory that identified high-intent prospects 3 weeks before they entered active buying cycles.",
      icon: <Brain className="w-6 h-6 text-signal-green" />
    },
    {
      title: "Elite Coach Contribution",
      description: "Trained the BDR pod on consultative selling techniques, increasing meeting-to-opp conversion by 2.8x.",
      icon: <Users className="w-6 h-6 text-purple-500" />
    },
    {
      title: "RevOps Contribution",
      description: "Optimized the entire tech stack and CRM workflows, reducing manual tasks by 15 hours/week per rep.",
      icon: <Settings className="w-6 h-6 text-red-500" />
    }
  ];

  return (
    <>
      <SEO
        title="The Fullstack Sales Unit - Your Complete GTM Engine | Revenue Party"
        description="It's more than a sales team. It's a complete revenue generation system. Build a permanent GTM asset, not rent headcount."
        keywords="GTM Engine, Fullstack Sales Unit, revenue generation system, sales asset, Impact Selling OS, Signal Factory, SDR pod"
        canonical="/gtm-engine"
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <Breadcrumbs items={[]} currentPage="The GTM Engine" />

      {/* Widget Zone 15 */}
      <WidgetZone zone="zone-15" className="my-8" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 flex justify-center"
            >
              <Badge
                className="badge-texture text-white text-sm px-4 py-1.5"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #0123B4 0%, #011A8F 90%)',
                  borderColor: '#0123B4'
                }}
                data-testid="badge-hero-engine"
              >
                The GTM Engine
              </Badge>
            </motion.div>
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              data-testid="heading-hero"
            >
              It's More than a Sales Team.{" "}
              <span className="gradient-text gradient-hero">It's a Complete Revenue Generation System.</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              data-testid="text-hero-subheading"
            >
              You don't have a headcount problem; you have an architecture problem. This is the blueprint for the GTM asset that scales.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Video Section with Background */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={{ height: '140%' }}>
          <div className="gradient-mesh-layer gradient-mesh-slow" style={{
            background: `
              radial-gradient(
                ellipse 800px 400px at 20% 30%,
                rgba(65, 105, 225, 0.35),
                transparent 50%
              ),
              radial-gradient(
                ellipse 600px 300px at 80% 70%,
                rgba(30, 144, 255, 0.35),
                transparent 50%
              ),
              radial-gradient(
                ellipse 700px 500px at 50% 50%,
                rgba(65, 105, 225, 0.25),
                transparent 60%
              )
            `,
            backgroundSize: '200% 200%'
          }} />
          <div className="gradient-mesh-layer-secondary gradient-mesh-medium-secondary" style={{
            background: `linear-gradient(
              135deg,
              rgba(65, 105, 225, 0.25) 0%,
              transparent 30%,
              transparent 70%,
              rgba(30, 144, 255, 0.25) 100%
            )`,
            backgroundSize: '300% 300%'
          }} />
        </div>
        <div className="light-grid-dots" style={{ height: '140%' }} />

        <div className="relative z-10">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
              <Skeleton className="h-96 w-full max-w-4xl rounded-lg" />
              <Skeleton className="h-8 w-64" />
            </div>
          }>
            <SimplifiedOrbitalPowers videoSrc={podVideo} videoRef={videoRef} />
          </Suspense>
        </div>
      </div>

      {/* Widget Zone 16 */}
      <WidgetZone zone="zone-16" className="my-8" />

      {/* Section 1: The Core Thesis */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-core-thesis">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center" data-testid="heading-core-thesis">
            You Are Building an Asset,<br />
            <span className="gradient-text gradient-hero">Not Renting a Service</span>
          </h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-xl font-semibold text-center mb-8">
              This is the fundamental difference.
            </p>
            <p>
              Commodity agencies sell temporary "appointments"—a service that builds no lasting value. They sell activity. When the contract ends, you are left with nothing.
            </p>
            <p>
              We do not sell appointments. We partner with you to build a permanent GTM capability. You are investing in a department—a compounding asset so powerful and so well-documented that you can one day operate it internally, if you wish.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: The Financial Reframe */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8" data-testid="section-financial-reframe">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-financial-reframe">
              A Better System.{" "}
              <span className="gradient-text gradient-hero">A Superior Financial Investment.</span>
            </h2>
            <p className="text-xl leading-relaxed mb-4">
              Let's do the math. This is an investment, not a cost.
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-6 text-center">
              Meet "The $198,000 Mistake".
            </h3>
            <p className="text-xl text-center mb-8 max-w-3xl mx-auto">
              That's the real first-year gamble on a single "Lone Wolf" hire. It's not just their salary. It's the sum of the architectural failures:
            </p>
            
            <CostEquationCard 
              items={costItems}
              total={198000}
              totalLabel='"Base Case" Cost of One Failed Hire'
            />
          </div>

          <div className="bg-primary/5 border-2 border-primary rounded-lg p-8 mb-8">
            <p className="text-lg leading-relaxed">
              Our Fullstack Sales Unit—which includes two Elite Operators plus the entire GTM architecture, leadership, and tech stack—costs less. It's not just a better, more predictable system; it's a superior financial investment.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">
              <strong>A Note on Our Numbers:</strong> We Show Our Work.
            </p>
          </div>
        </div>
      </section>

      {/* Widget Zone 17 */}
      <WidgetZone zone="zone-17" className="my-8" />

      {/* Section 3: The "Old Way" Deconstruction */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-old-way">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-old-way">
              The "Old Way" Is{" "}
              <span className="gradient-text gradient-hero">Architecturally Flawed</span>
            </h2>
          </div>

          <ComparisonTable 
            title="The Core Reframe"
            items={comparisonItems}
          />

          <div className="mt-12 text-center">
            <Card className="p-8 bg-destructive/5 border-2 border-destructive/30 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">The Zero-IP Trap</h3>
              <p className="text-lg leading-relaxed">
                When you hire traditional reps or use commodity agencies, you own nothing. The playbook, the data, the learnings—it all walks out the door when they leave. You're stuck in an endless loop of rebuilding from scratch.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: The Solution - Fullstack Sales Unit */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8" data-testid="section-solution">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-solution">
              The Solution:{" "}
              <span className="gradient-text gradient-hero">The "Fullstack Sales Unit"</span>
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto">
              This is not a team. This is a complete, self-contained revenue generation system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Column 1: Your Sales Team */}
            <Card className="p-8 light-depth hover-elevate transition-all">
              <div className="mb-6">
                <Users className="w-12 h-12 text-community mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your Sales Team</h3>
                <p className="text-sm text-muted-foreground">(The Engine)</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>2 Elite BDR Operators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>GTM Architect (Strategy)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>AI Architect (Systems)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Elite Coach (Training)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>RevOps Manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Brand Guardian (QA)</span>
                </li>
              </ul>
            </Card>

            {/* Column 2: Your GTM Playbook */}
            <Card className="p-8 light-depth hover-elevate transition-all">
              <div className="mb-6">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your GTM Playbook</h3>
                <p className="text-sm text-muted-foreground">(Asset #1)</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>ICP & Persona Framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Messaging Architecture</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Multi-Channel Campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Objection Handling Scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Impact Selling Methodology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>100% IP Ownership (Forever)</span>
                </li>
              </ul>
            </Card>

            {/* Column 3: Your Signal Factory */}
            <Card className="p-8 light-depth hover-elevate transition-all">
              <div className="mb-6">
                <Brain className="w-12 h-12 text-signal-green mb-4" />
                <h3 className="text-2xl font-bold mb-2">Your Signal Factory</h3>
                <p className="text-sm text-muted-foreground">(Asset #2)</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>AI-Powered Prospect Research</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Intent Data Signals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Automated Personalization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Full Tech Stack (15+ Tools)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Performance Analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Continuous Optimization</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 5: The Process */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-process">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-process">
              Our Process:{" "}
              <span className="gradient-text gradient-hero">How We Build Your Asset</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold text-primary mb-4">1</div>
              <h3 className="text-2xl font-bold mb-4">Architect</h3>
              <p className="leading-relaxed">
                We design your complete GTM strategy: ICP, messaging, multi-channel campaigns, and your proprietary playbook.
              </p>
            </Card>

            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold text-primary mb-4">2</div>
              <h3 className="text-2xl font-bold mb-4">Activate</h3>
              <p className="leading-relaxed">
                We deploy your elite BDR pod, configure the Signal Factory, and train your team on the Impact Selling methodology.
              </p>
            </Card>

            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold text-primary mb-4">3</div>
              <h3 className="text-2xl font-bold mb-4">Run & Iterate</h3>
              <p className="leading-relaxed">
                We execute campaigns, optimize based on data, and continuously refine your system for maximum performance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Widget Zone 18 */}
      <WidgetZone zone="zone-18" className="my-8" />

      {/* Section 6: The Proof (Case Study) */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8" data-testid="section-proof">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-proof">
              The Proof:{" "}
              <span className="gradient-text gradient-hero">A Real-World "Hero's Journey"</span>
            </h2>
          </div>

          <Card className="p-8 md:p-12 bg-primary/5 border-2 border-primary">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">The Pain:</h3>
                <p className="leading-relaxed">
                  A Series B SaaS company burning $40K/month on a BDR who delivered 3 meetings in 6 months. Pipeline was dead. Board was furious.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">The Diagnosis:</h3>
                <p className="leading-relaxed">
                  Classic "Lone Wolf Trap." No playbook, no coaching, no systems. Just hope and a generic tech stack.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">The Reframe:</h3>
                <p className="leading-relaxed">
                  We built a complete Fullstack Sales Unit. New ICP, new messaging, AI-powered Signal Factory, and an elite 2-person pod trained on Impact Selling.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">The Result:</h3>
                <p className="leading-relaxed font-semibold">
                  42 qualified opportunities in the first 90 days. $2.1M pipeline generated in 6 months. The system now runs internally with 100% IP ownership.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-bold mb-4 text-center">How the 4 Architects Contributed:</h4>
              <HeroJourneyGrid contributions={architectContributions} />
            </div>
          </Card>
        </div>
      </section>

      {/* Section 7: The Final Reframe */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-final-reframe">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8" data-testid="heading-final-reframe">
            You Stop Renting.{" "}
            <span className="gradient-text gradient-hero">You Start Owning.</span>
          </h2>
          <p className="text-xl leading-relaxed">
            This is not a service. This is an investment in a permanent, compounding GTM asset. One that you control, that you own, and that scales with your business.
          </p>
        </div>
      </section>

      {/* Widget Zone 19 */}
      <WidgetZone zone="zone-19" className="my-8" />

      {/* Section 8: The CTA */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden" data-testid="section-cta">
        <div className="absolute inset-0 pointer-events-none opacity-55">
          <div className="gradient-mesh-layer gradient-mesh-medium" style={{
            background: `
              radial-gradient(
                ellipse 800px 600px at 50% 50%,
                rgba(65, 105, 225, 0.32),
                transparent 70%
              ),
              radial-gradient(
                ellipse 600px 400px at 80% 80%,
                rgba(138, 43, 226, 0.25),
                transparent 60%
              )
            `,
            backgroundSize: '200% 200%'
          }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-cta">
            Ready to Build{" "}
            <span className="gradient-text gradient-hero">Your GTM Asset?</span>
          </h2>
          <p className="text-xl leading-relaxed mb-8" data-testid="text-cta-description">
            See the proof of what a guaranteed GTM Engine can deliver. Real results, real companies, real pipeline.
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
