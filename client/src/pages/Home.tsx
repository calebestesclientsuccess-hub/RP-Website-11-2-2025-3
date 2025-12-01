import { MagneticButton } from "@/components/ui/magnetic-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaticGradientBg } from "@/components/StaticGradientBg";
import { HeroROICalculator } from "@/components/HeroROICalculator";
import SimpleBridgeSection from "@/components/SimpleBridgeSection";
import { SEO } from "@/components/SEO";
import { ServiceSchema } from "@/components/ServiceSchema";
import { LocalBusinessSchema } from "@/components/schemas/LocalBusinessSchema";
import VideoSchema from "@/components/VideoSchema";
import SoftwareApplicationSchema from "@/components/SoftwareApplicationSchema";
import LeadMagnetHero from "@/components/LeadMagnetHero";
import EbookLeadMagnetSection from "@/components/EbookLeadMagnetSection";
import TestimonialCarousel from "@/components/widgets/TestimonialCarousel";
import { WidgetZone } from "@/components/WidgetZone";
import { ArrowRight, Users, Target, Zap, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming cn utility is available
import { InternalHireCostCalculator } from "@/components/InternalHireCostCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { InternalLinks } from "@/components/InternalLinks";
import { getRelatedLinks } from "@/lib/content-graph";
import { RecentProjects } from "@/components/RecentProjects";
import { MobileOverlay } from "@/components/MobileOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FeatureGate } from "@/components/FeatureGate";

// Lazy load GSAP-heavy animation component
const SimplifiedOrbitalPowers = lazy(() => import("@/components/SimplifiedOrbitalPowers").then(module => ({ default: module.SimplifiedOrbitalPowers })));

// Video is served from public directory
const podVideo = "/sdr-pod-video.mp4";

export default function Home() {
  console.log('🏠 Home component rendering...');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasPlayed, setHasPlayed] = useState(false);
  const scrollAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAwayStartRef = useRef<number | null>(null);
  const [allCardsExpanded, setAllCardsExpanded] = useState(false);

  const toggleAllCards = () => {
    setAllCardsExpanded(prev => !prev);
  };

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
      <section className="relative pt-32 pb-32 px-4 md:px-6 lg:px-8 overflow-hidden gradient-mesh-container">
        {/* Subtle gradient backdrop replacing animated constellation */}
        <StaticGradientBg className="opacity-80" />

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
                    className="badge-texture text-white border-community text-sm px-4 py-1.5"
                    style={{
                      backgroundImage: 'linear-gradient(180deg, hsl(258, 56%, 44%) 0%, hsl(251, 49%, 32%) 90%)'
                    }}
                    data-testid="badge-hero-culture"
                  >
                    Community + Competition = Culture
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  data-testid="heading-hero"
                >
                  <div className="mb-0">Your Next Sales Hire Shouldn't Be a Person</div>
                  <div className="gradient-text gradient-hero mt-0">It Should Be a Revenue Generation System</div>
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
                <MagneticButton>
                  <Button
                    variant="primary"
                    size="lg"
                    className="text-lg px-8 py-6 shadow-lg"
                    data-testid="button-hero-schedule"
                    asChild
                  >
                    <Link href="/audit">Schedule My GTM Audit</Link>
                  </Button>
                </MagneticButton>
                <MagneticButton strength={0.3}>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-6"
                    data-testid="button-hero-take-assessment"
                    asChild
                  >
                    <Link href="/assessment">Take Assessment</Link>
                  </Button>
                </MagneticButton>
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

      {/* Recent Projects Section */}
      <FeatureGate flagKey="section-recent-projects">
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <RecentProjects maxProjects={9} />
          </div>
        </section>
      </FeatureGate>

      {/* Unified dark canvas for bridge + solution section - the sun paints this */}
      <div className="relative bg-zinc-950">
        {/* Bridge Statement */}
        <SimpleBridgeSection />

        {/* Middle Widget Zone 1 */}
        <WidgetZone zone="zone-2" className="my-8" />

        {/* Unified Product Showcase - The Fullstack Sales Unit */}
        {/* Transparent background - illuminated by the System sun above */}
        <section className="relative py-32 px-4 md:px-6 lg:px-8" data-testid="section-solution">

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-solution">
              Don't Hire a Rep<br />
              <span className="gradient-text gradient-hero">Deploy an Engine</span>
            </h2>
          </div>

          {/* The 3 Core Components */}
          <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              className="flex"
            >
              {/* Card 1: Your Fully Loaded Sales Team */}
              <SpotlightCard
                role="button"
                tabIndex={0}
                aria-expanded={allCardsExpanded}
                aria-label="Expand or collapse Sales Team information"
                className={cn(
                  "group relative p-8 rounded-xl transition-all duration-500 ease-out flex flex-col w-full cursor-pointer",
                  "bg-card/50 backdrop-blur-sm",
                  "border border-rose-600/30",
                  "hover:border-rose-600/50 hover:bg-card/70 hover:shadow-lg hover:scale-[1.02]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2",
                  allCardsExpanded && "bg-card/70 border-rose-600/50"
                )}
                onClick={toggleAllCards}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAllCards();
                  }
                }}
                spotlightColor="rgba(225, 29, 72, 0.2)"
              >
                {/* Icon with coordinated glow */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-xl group-hover:bg-rose-600/30 transition-all duration-300 animate-pulse-subtle" />
                    <div className="relative bg-rose-600/10 p-4 rounded-full border border-rose-600/30 group-hover:border-rose-600/50 transition-all duration-300">
                      <Users className="w-8 h-8 text-rose-600 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
                {/* Heading - Centered */}
                <h3 className="text-2xl font-bold mb-3 text-rose-600 text-center">
                  Your Sales Team
                </h3>
                <p className="leading-relaxed italic text-sm font-semibold mb-4 opacity-80 text-center px-1">
                  A team of well equipped SDRs, not a single Lone Wolf rep.
                </p>
                {/* Fixed height container for consistent card heights */}
                <div className="flex-grow flex flex-col justify-end min-h-[120px]">
                  <div
                    className={cn(
                      "leading-relaxed transition-all duration-500 ease-out opacity-70 text-center",
                      allCardsExpanded ? 'max-h-[500px] mb-4' : 'max-h-[72px] overflow-hidden mb-0'
                    )}
                  >
                    <p className="relative">
                      Elite Sales Talent, equipped and trained by our Architects. The majority of our talent pipeline come with 5 - 15 years of experience at Y-Combinator companies. They're all extensively vetted for core skills, such as university level writing, reading, and arithmetic, and then taken through a rigorous set of sales interviews. Once selected most salespeople are trained by RP Architects for 4-6 weeks before being assigned to a campaign.
                      {!allCardsExpanded && (
                        <span className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 via-card/80 to-transparent pointer-events-none" />
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllCards();
                    }}
                    aria-label={allCardsExpanded ? 'Show less information' : 'Read more information'}
                    className="flex items-center justify-center gap-2 mt-auto pt-3 text-sm font-semibold text-rose-600 hover:text-rose-600/90 transition-all duration-300 hover:gap-3 group/btn touch-manipulation hover:bg-transparent p-0 h-auto"
                  >
                    <span className="relative">
                      {allCardsExpanded ? 'Show less' : 'Read more'}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-rose-600 group-hover/btn:w-full transition-all duration-300" />
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-all duration-500 ease-out group-hover/btn:scale-110",
                      allCardsExpanded && 'rotate-180'
                    )} />
                  </Button>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex"
            >
              {/* Card 2: Your Playbook */}
              <SpotlightCard
                role="button"
                tabIndex={0}
                aria-expanded={allCardsExpanded}
                aria-label="Expand or collapse Playbook information"
                className={cn(
                  "group relative p-8 rounded-xl transition-all duration-500 ease-out flex flex-col w-full cursor-pointer",
                  "bg-card/50 backdrop-blur-sm",
                  "border border-indigo-500/30",
                  "hover:border-indigo-500/50 hover:bg-card/70 hover:shadow-lg hover:scale-[1.02]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                  allCardsExpanded && "bg-card/70 border-indigo-500/50"
                )}
                onClick={toggleAllCards}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAllCards();
                  }
                }}
                spotlightColor="rgba(99, 102, 241, 0.2)"
              >
                {/* Icon with coordinated glow */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-300 animate-pulse-subtle" style={{ animationDelay: '0.2s' }} />
                    <div className="relative bg-indigo-500/10 p-4 rounded-full border border-indigo-500/30 group-hover:border-indigo-500/50 transition-all duration-300">
                      <Target className="w-8 h-8 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
                {/* Heading - Centered */}
                <h3 className="text-2xl font-bold mb-3 text-indigo-500 text-center">
                  Your Playbook
                </h3>
                <p className="leading-relaxed italic text-sm font-semibold mb-4 opacity-80 text-center px-1">
                  Our strategic framework, fully customized to your business.
                </p>
                {/* Fixed height container for consistent card heights */}
                <div className="flex-grow flex flex-col justify-end min-h-[120px]">
                  <div
                    className={cn(
                      "leading-relaxed transition-all duration-500 ease-out opacity-70 text-center",
                      allCardsExpanded ? 'max-h-[500px] mb-4' : 'max-h-[72px] overflow-hidden mb-0'
                    )}
                  >
                    <p className="relative">
                      Our salespeople study the playbook for days before they pick up the phone, but that's just the beginning. The playbook is continuously improved, and ultimately, you walk away with proof of product-market-fit -- with knowledge of exactly what value propositions, what scripts and collateral and emails will win new business. 100% your IP.
                      {!allCardsExpanded && (
                        <span className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 via-card/80 to-transparent pointer-events-none" />
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllCards();
                    }}
                    aria-label={allCardsExpanded ? 'Show less information' : 'Read more information'}
                    className="flex items-center justify-center gap-2 mt-auto pt-3 text-sm font-semibold text-indigo-500 hover:text-indigo-500/90 transition-all duration-300 hover:gap-3 group/btn touch-manipulation hover:bg-transparent p-0 h-auto"
                  >
                    <span className="relative">
                      {allCardsExpanded ? 'Show less' : 'Read more'}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-500 group-hover/btn:w-full transition-all duration-300" />
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-all duration-500 ease-out group-hover/btn:scale-110",
                      allCardsExpanded && 'rotate-180'
                    )} />
                  </Button>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex"
            >
              {/* Card 3: Your Signal Factory */}
              <SpotlightCard
                role="button"
                tabIndex={0}
                aria-expanded={allCardsExpanded}
                aria-label="Expand or collapse Signal Factory information"
                className={cn(
                  "group relative p-8 rounded-xl transition-all duration-500 ease-out flex flex-col w-full cursor-pointer",
                  "bg-card/50 backdrop-blur-sm",
                  "border border-emerald-500/30",
                  "hover:border-emerald-500/50 hover:bg-card/70 hover:shadow-lg hover:scale-[1.02]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  allCardsExpanded && "bg-card/70 border-emerald-500/50"
                )}
                onClick={toggleAllCards}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAllCards();
                  }
                }}
                spotlightColor="rgba(16, 185, 129, 0.2)"
              >
                {/* Icon with coordinated glow */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all duration-300 animate-pulse-subtle" style={{ animationDelay: '0.4s' }} />
                    <div className="relative bg-emerald-500/10 p-4 rounded-full border border-emerald-500/30 group-hover:border-emerald-500/50 transition-all duration-300">
                      <Zap className="w-8 h-8 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
                {/* Heading - Centered */}
                <h3 className="text-2xl font-bold mb-3 text-emerald-500 text-center">
                  Your Signal Factory
                </h3>
                <p className="leading-relaxed italic text-sm font-semibold mb-4 opacity-80 text-center px-1">
                  Our AI-Powered Engine, customized to fuel your business.
                </p>
                {/* Fixed height container for consistent card heights */}
                <div className="flex-grow flex flex-col justify-end min-h-[120px]">
                  <div
                    className={cn(
                      "leading-relaxed transition-all duration-500 ease-out opacity-70 text-center",
                      allCardsExpanded ? 'max-h-[500px] mb-4' : 'max-h-[72px] overflow-hidden mb-0'
                    )}
                  >
                    <p className="relative">
                      We combine Gemini with both code custom-written for you, and our proprietary AI and automation templates in Clay and N8N. Prompt Engineers then construct pipelines for contents, email, summaries, AI-powered automations and more. Like the Playbook, it begins as hypothesis. But once we see what works, we document it. This is also 100% your IP. You will own the blueprint, and we'll help you use it to build your own when you're ready.
                      {!allCardsExpanded && (
                        <span className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/50 via-card/80 to-transparent pointer-events-none" />
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllCards();
                    }}
                    aria-label={allCardsExpanded ? 'Show less information' : 'Read more information'}
                    className="flex items-center justify-center gap-2 mt-auto pt-3 text-sm font-semibold text-emerald-500 hover:text-emerald-500/90 transition-all duration-300 hover:gap-3 group/btn touch-manipulation hover:bg-transparent p-0 h-auto"
                  >
                    <span className="relative">
                      {allCardsExpanded ? 'Show less' : 'Read more'}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 group-hover/btn:w-full transition-all duration-300" />
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-all duration-500 ease-out group-hover/btn:scale-110",
                      allCardsExpanded && 'rotate-180'
                    )} />
                  </Button>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Video Showcase - Seamlessly Integrated */}
          <div className="mt-24">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[600px] gap-4" data-testid="loading-orbital-powers">
                  <Skeleton className="h-96 w-full max-w-4xl rounded-lg" />
                  <Skeleton className="h-8 w-64" />
                </div>
              }>
                <SimplifiedOrbitalPowers videoSrc={podVideo} videoRef={videoRef} />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
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
      </div>
      {/* End of unified dark canvas */}

      {/* Proof Module - "Social Proof" */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-background" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-proof">
              Proven Results<br />
              <span className="gradient-text gradient-hero">No Black Box</span>
            </h2>
            <p className="text-xl leading-relaxed" data-testid="text-proof-description">
              The GTM Engine model is built on transparency and provable performance.
            </p>
          </div>

          {/* Row 1: The Value & Reliability */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">The Value & Reliability</h3>
            <div className="grid md:grid-cols-3 gap-8" data-testid="grid-metrics-value">
              {/* Metric 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-4">
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
              </motion.div>

              {/* Metric 5 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-5">
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
              </motion.div>

              {/* Metric 6 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-6">
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
              </motion.div>
            </div>
          </div>

          {/* Row 2: The Performance */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">The Performance</h3>
            <div className="grid md:grid-cols-3 gap-8" data-testid="grid-metrics-performance">
              {/* Metric 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-1">
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
              </motion.div>

              {/* Metric 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-2">
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
              </motion.div>

              {/* Metric 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-8 text-center bg-background/50 backdrop-blur-sm h-full" data-testid="card-metric-3">
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
              </motion.div>
            </div>
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

      {/* E-Book Lead Magnet Section - Integrated $198K Mistake section */}
      <div style={{ backgroundColor: '#000000', width: '100%' }}>
        <section className="relative py-32 px-4 md:px-6 lg:px-8" style={{ backgroundColor: '#000000', position: 'relative' }}>
          <div className="max-w-7xl mx-auto">
            <EbookLeadMagnetSection slug="198k-mistake-ebook" />

            {/* Alternative Lead Magnet Section */}
            <div className="max-w-3xl mx-auto mt-20">
              <LeadMagnetHero />
            </div>
          </div>
        </section>
      </div>

      {/* Middle Widget Zone 2 */}
      <WidgetZone zone="zone-3" className="my-8" />

      {/* Widget Zone 5 */}
      <WidgetZone zone="zone-5" className="my-8" />

      {/* Tool Module - "Interactive ROI Calculator" */}
      <section className="py-32 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          {/* Internal Hire Cost Calculator Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center" data-testid="heading-internal-sdr-cost">
                <div className="mb-2">The True Cost of</div>
                <div className="gradient-text gradient-hero">1 Internal SDR</div>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-center">
                This is what you're actually paying for just one SDR hire.
              </p>
            </div>
            <InternalHireCostCalculator />

            {/* CTA for Full Calculator - Moved inside section */}
            <div className="text-center mt-16">
              <Button
                variant="primary"
                size="lg"
                className="shadow-lg text-lg px-8 py-6"
                data-testid="button-calculate-savings"
                asChild
              >
                <Link href="/roi-calculator">Calculate My Savings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Widget Zone */}
      <WidgetZone zone="zone-4" className="my-8" />

      {/* Widget Zone 6 */}
      <WidgetZone zone="zone-6" className="my-8" />

      {/* Internal Links Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <InternalLinks 
            links={getRelatedLinks('home')}
            title="Explore Your Next Steps"
          />
        </div>
      </section>

      {/* The GTM Engine Solution - New Section with Own Background */}
      <section className="relative py-32 px-4 md:px-6 lg:px-8 bg-background">
        {/* Distinct gradient background for this section */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(220, 38, 38, 0.08) 0%, transparent 100%)',
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Final CTA Module */}
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold" data-testid="heading-final-cta">
              The Blueprint is Clear<br />
              <span className="gradient-text gradient-hero">Schedule Your GTM Audit</span>
            </h2>
            <p className="text-xl leading-relaxed" data-testid="text-final-cta-description">
              Stop the hiring/firing cycle. Let's audit your GTM architecture and design a system that scales.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="text-lg px-10 py-7 shadow-lg"
              data-testid="button-final-schedule"
              asChild
            >
              <Link href="/audit">Schedule My GTM Audit</Link>
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
        </div>
      </section>
    </div>
  );
}