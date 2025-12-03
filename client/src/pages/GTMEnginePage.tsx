import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WidgetZone } from "@/components/WidgetZone";
import { InternalLinks } from "@/components/InternalLinks";
import { getRelatedLinks } from "@/lib/content-graph";
import { CostEquationCard } from "@/components/CostEquationCard";
import { ComparisonTable } from "@/components/ComparisonTable";
import { ArrowRight, Users, Brain, BookOpen, AlertCircle, Sparkles, TrendingUp, Search, Target, Award, Cpu, UserCheck } from "lucide-react";
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

      {/* Global background gradient container - Apple TV smooth transitions */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Layer 1: Subtle blue-purple gradient from top */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/3 to-transparent" style={{ height: '40vh' }} />
        
        {/* Layer 2: Middle purple-cyan blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/4 to-transparent" style={{ top: '30vh', height: '40vh' }} />
        
        {/* Layer 3: Bottom indigo-green gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/3 to-green-500/5" style={{ top: '60vh' }} />
      </div>

      <Breadcrumbs items={[]} currentPage="The GTM Engine" />

      {/* Widget Zone 15 */}
      <WidgetZone zone="zone-15" className="my-8" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6 flex justify-center"
            >
              <Badge
                className="badge-texture text-white text-sm px-4 py-1.5"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #4169E1 0%, #2E5FD9 90%)',
                  borderColor: '#5B8EF5',
                  boxShadow: '0 0 20px rgba(65, 105, 225, 0.5)'
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
              It's More than a Sales Team<br />
              <span className="gradient-text gradient-hero">It's a Complete Revenue Generation System</span>
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

      {/* Video Section - The Fullstack Sales Unit Visualization */}
      <section className="relative -mt-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
              <Skeleton className="h-96 w-full max-w-4xl rounded-lg" />
              <Skeleton className="h-8 w-64" />
            </div>
          }>
            <SimplifiedOrbitalPowers videoSrc={podVideo} videoRef={videoRef} />
          </Suspense>
        </div>
      </section>

      {/* Widget Zone 16 */}
      <WidgetZone zone="zone-16" className="my-8" />

      {/* Section 1: The Core Thesis */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-core-thesis">
        {/* Subtle blue tint overlay */}
        <div className="absolute inset-0 bg-blue-500/3 pointer-events-none" />
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

      {/* Widget Zone 17 */}
      <WidgetZone zone="zone-17" className="my-8" />

      {/* Section 2: The Two-Way Comparison */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-comparison">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-comparison">
              Two Paths.<br />
              <span className="gradient-text gradient-hero">One Builds Value. One Doesn't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Rent a Service (Red/Bad) */}
            <Card className="p-8 bg-destructive/5 border-2 border-destructive/30">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-destructive mb-4">Rent a Service</h3>
                <p className="text-lg leading-relaxed mb-6">
                  The traditional approach—whether hiring "Lone Wolf" reps or using commodity agencies. Both leave you with nothing.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1 text-xl">×</span>
                  <div>
                    <p className="font-semibold mb-1">High-Risk Internal Hires</p>
                    <p className="text-sm leading-relaxed">Single "Lone Wolf" SDRs operating in isolation. 3-6 month ramp time. 34% turnover risk. When they leave, you start from scratch.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1 text-xl">×</span>
                  <div>
                    <p className="font-semibold mb-1">The Zero-IP Trap</p>
                    <p className="text-sm leading-relaxed">Commodity agencies that "rent" you appointments. No playbook ownership. No data. No learnings. When the contract ends, you own nothing.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1 text-xl">×</span>
                  <div>
                    <p className="font-semibold mb-1">Endless Loop of Rebuilding</p>
                    <p className="text-sm leading-relaxed">Hope they figure it out. Wait months for results. Watch them leave. Repeat. You're stuck renting capability, never building it.</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* Build & Own an Asset (Blue/Good) */}
            <Card className="p-8 bg-blue-600/5 border-2 border-blue-600/30" style={{ borderColor: 'rgba(65, 105, 225, 0.5)', backgroundColor: 'rgba(65, 105, 225, 0.08)' }}>
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-4" style={{ color: '#4169E1' }}>Build & Own an Asset</h3>
                <p className="text-lg leading-relaxed mb-6">
                  We partner with you to build a permanent GTM capability. One day, when you're ready, you can run it internally.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl" style={{ color: '#5B8EF5' }}>✓</span>
                  <div>
                    <p className="font-semibold mb-1">Full "Fullstack Sales Unit"</p>
                    <p className="text-sm leading-relaxed">Multiple roles and systems working together. Elite operators productive in Week 2. Guaranteed continuity—no turnover risk.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl" style={{ color: '#5B8EF5' }}>✓</span>
                  <div>
                    <p className="font-semibold mb-1">100% IP Ownership Forever</p>
                    <p className="text-sm leading-relaxed">You own the GTM playbook, the Signal Factory, the messaging, the data. We build it for you, but it's yours to keep.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-xl" style={{ color: '#5B8EF5' }}>✓</span>
                  <div>
                    <p className="font-semibold mb-1">Proven Playbooks & Expert Coaching</p>
                    <p className="text-sm leading-relaxed">AI tools, proven methodology, ongoing optimization. This is a compounding asset that gets stronger over time.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: The Solution - Fullstack Sales Unit */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8" data-testid="section-solution">
        {/* Soft purple ambient glow */}
        <div className="absolute inset-0 bg-purple-500/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-solution">
              The Solution:<br />
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
        {/* Subtle cyan background tint */}
        <div className="absolute inset-0 bg-cyan-500/3 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-process">
              Our Process:<br />
              <span className="gradient-text gradient-hero">How We Build Your Asset</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold mb-4" style={{ color: '#4169E1' }}>1</div>
              <h3 className="text-2xl font-bold mb-4">Architect</h3>
              <p className="leading-relaxed">
                We design your complete GTM strategy: ICP, messaging, multi-channel campaigns, and your proprietary playbook.
              </p>
            </Card>

            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold mb-4" style={{ color: '#3B7FE8' }}>2</div>
              <h3 className="text-2xl font-bold mb-4">Activate</h3>
              <p className="leading-relaxed">
                We deploy your elite BDR pod, configure the Signal Factory, and train your team on the Impact Selling methodology.
              </p>
            </Card>

            <Card className="p-8 text-center light-depth hover-elevate transition-all">
              <div className="text-6xl font-bold mb-4" style={{ color: '#5B8EF5' }}>3</div>
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
      <section className="relative py-24 px-4 md:px-6 lg:px-8 overflow-hidden" data-testid="section-proof">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-sm font-semibold">
                Case Study
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8" data-testid="heading-proof">
              The Proof:<br />
              <span className="gradient-text gradient-hero">A Real-World Hero's Journey</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent">
                From 0-3 Sales to 15/Day
              </p>
              <p className="text-xl text-muted-foreground">
                How We Fixed a "Too Good to Be True" Offer
              </p>
            </div>
          </div>

          {/* Main Story Container */}
          <div className="max-w-6xl mx-auto space-y-12">
            {/* The Journey Flow */}
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-amber-500 via-orange-500 to-emerald-500 transform -translate-x-1/2" />

              {/* Step 1: The Pain */}
              <div className="relative mb-16">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="md:w-5/12">
                    <Card className="p-8 rounded-3xl bg-gradient-to-br from-red-600/12 to-red-700/6 border-red-600/35 backdrop-blur-xl shadow-inner hover:shadow-2xl hover:shadow-red-600/25 transition-all duration-500 ease-out hover:scale-[1.02]">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-red-600/25 border-2 border-red-600 flex items-center justify-center text-red-500 font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-red-400">The Pain</h3>
                          <p className="leading-relaxed text-lg">
                            A B2B compliance client had a <span className="font-bold text-red-400">10-SDR team making 300+ calls per day</span> and failing, booking only <span className="font-bold">0-3 sales</span>. They were burning cash and their high-cost "Lone Wolf" team was on the verge of collapse.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="hidden md:block md:w-2/12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-600 border-4 border-background flex items-center justify-center relative z-10 shadow-xl shadow-red-600/35">
                      <AlertCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="md:w-5/12" />
                </div>
              </div>

              {/* Step 2: The Diagnosis */}
              <div className="relative mb-16">
                <div className="md:flex md:items-center md:justify-between md:flex-row-reverse">
                  <div className="md:w-5/12">
                    <Card className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/12 to-amber-600/6 border-amber-500/35 backdrop-blur-xl shadow-inner hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 ease-out hover:scale-[1.02]">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-amber-500/25 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-bold text-lg shadow-lg">
                          2
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-4 text-amber-400">The Diagnosis</h3>
                          <p className="leading-relaxed text-lg">
                            Our GTM Architects listened to the calls. The #1 killer wasn't the reps; it was the <span className="font-bold text-amber-400">architecture</span>. Their core offer—<span className="italic">"For $300 I'll save you $7500 in fines"</span>—sounded "too good to be true". It was a massive price-value disconnect that triggered skepticism and caused prospects to disengage.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="hidden md:block md:w-2/12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500 border-4 border-background flex items-center justify-center relative z-10 shadow-xl shadow-amber-500/35">
                      <Search className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="md:w-5/12" />
                </div>
              </div>

              {/* Step 3: The Reframe */}
              <div className="relative mb-16">
                <div className="md:flex md:items-start md:justify-between">
                  <div className="md:w-full">
                    <Card className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-orange-500/12 to-orange-600/8 border-orange-500/35 backdrop-blur-xl shadow-inner hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 ease-out hover:scale-[1.02]">
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 border-4 border-background mb-6 shadow-xl shadow-orange-500/45">
                          <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 gradient-text gradient-hero">The Reframe</h3>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                          The "Fullstack" Solution: We didn't just "train" the reps. We re-engineered the <span className="font-semibold text-foreground">entire GTM asset</span>.
                        </p>
                      </div>

                      {/* Four Pillars Grid */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Strategic Architecture */}
                        <Card className="group p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent border-blue-400/40 hover:border-blue-400/60 backdrop-blur-xl shadow-inner transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                              <Target className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="font-bold mb-3 text-xl bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                                Strategic Architecture
                              </h4>
                              <p className="leading-relaxed text-base">
                                Orchestrated the new motion, fixing the value equation by flipping from a weak "value" offer to a powerful <span className="font-semibold text-blue-400">"problem-led" approach using Loss Aversion</span>. Price was raised from $300 to $750 to make the value believable against the $7,500 federal fine.
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Brand & Authority */}
                        <Card className="group p-8 rounded-3xl bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent border-purple-400/40 hover:border-purple-400/60 backdrop-blur-xl shadow-inner transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/30">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="font-bold mb-3 text-xl bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                                Brand & Authority
                              </h4>
                              <p className="leading-relaxed text-base">
                                Solved the trust problem by producing an <span className="font-semibold text-purple-400">"authority" asset</span>—an educational video starring an actress ("Ms. Samantha") positioned as the company's leading compliance expert. This created "Textbook Authority Bias".
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* AI-Powered Messaging */}
                        <Card className="group p-8 rounded-3xl bg-gradient-to-br from-cyan-600/20 via-cyan-500/10 to-transparent border-cyan-400/40 hover:border-cyan-400/60 backdrop-blur-xl shadow-inner transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                              <Cpu className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="font-bold mb-3 text-xl bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                                AI-Powered Messaging
                              </h4>
                              <p className="leading-relaxed text-base">
                                Engineered new cold call scripts for the playbook. Reps were trained <span className="font-semibold text-cyan-400">not to sell, but to reference "Ms. Samantha's video"</span>. This instantly transferred the video's authority to the SDR, "warming the call".
                              </p>
                            </div>
                          </div>
                        </Card>

                        {/* Talent Optimization */}
                        <Card className="group p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 via-indigo-500/10 to-transparent border-indigo-400/40 hover:border-indigo-400/60 backdrop-blur-xl shadow-inner transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <UserCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="font-bold mb-3 text-xl bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                                Talent Optimization
                              </h4>
                              <p className="leading-relaxed text-base">
                                Realized the client didn't need "hunters"; they needed <span className="font-semibold text-indigo-400">"trust builders"</span>. Helped them staff the team with former CSMs and Account Managers, who excelled at building instant rapport for a fast, obvious sale.
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Step 4: The Result */}
              <div className="relative">
                <div className="md:flex md:items-center md:justify-center">
                  <div className="md:w-10/12">
                    <Card className="p-10 md:p-14 rounded-3xl bg-gradient-to-br from-emerald-500/18 via-emerald-600/10 to-green-600/6 border-emerald-500/40 backdrop-blur-xl shadow-inner hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 ease-out hover:scale-[1.02] text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 border-4 border-background mb-8 shadow-xl shadow-emerald-500/45">
                        <TrendingUp className="w-12 h-12 text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-6 text-emerald-400">The Result</h3>
                      <div className="max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl leading-relaxed font-semibold mb-6">
                          Within <span className="text-emerald-400">3 weeks</span> of launching the new, integrated playbook, the 10-SDR team's daily sales jumped from <span className="text-red-400 line-through">0-3</span> to <span className="text-emerald-400 text-3xl font-bold">5-15 sales per day</span>.
                        </p>
                        <div className="inline-block px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">
                          <p className="text-lg font-bold text-emerald-300">
                            Transformed a failing "Lone Wolf" team into a predictable, engineered profit center.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            Ready to Build<br />
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

      {/* Internal Links Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <InternalLinks
            links={getRelatedLinks('gtmEngine')}
            title="Your Next Steps"
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-4xl mx-auto text-center space-y-8">
        </div>
      </section>
    </>
  );
}