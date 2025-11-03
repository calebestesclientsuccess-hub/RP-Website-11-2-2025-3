import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, Shield, Calendar, RefreshCw, Target, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function PricingPage() {
  const pricingPlans = [
    {
      id: 'starter',
      name: 'The Starter',
      subtitle: '1 SDR',
      price: '$12,500',
      period: '/month',
      sqos: '20+',
      description: 'Ideal for targeted, high-ACV campaigns or your first "Build-Operate-Transfer" asset.',
      isMostPopular: false,
      features: [
        '1 Elite SDR',
        '20+ Guaranteed SQOs/mo (from Month 5)',
        'Full Impact Selling OS (100% IP Ownership)',
        'Complete Signal Factory Tech Stack',
        'GTM Leverage Audit & Strategy',
        '4-Month Build & Ramp',
        '90-Day Rolling Terms (after Month 4)',
      ],
    },
    {
      id: 'pod',
      name: 'The Pod',
      subtitle: '2 SDRs',
      price: '$15,000',
      period: '/month',
      sqos: '40+',
      description: 'Our recommended model. You get a second SDR for only $2,500 more, cutting your cost-per-SDR by 40% (to $7.5k/SDR) and your cost-per-meeting to $375. This is the "no-brainer" ROI.',
      isMostPopular: true,
      features: [
        '2 Elite SDRs',
        '40+ Guaranteed SQOs/mo (from Month 5)',
        '$375 cost-per-meeting at quota',
        'Full Impact Selling OS (100% IP Ownership)',
        'Complete Signal Factory Tech Stack',
        'GTM Leverage Audit & Strategy',
        '4-Month Build & Ramp',
        '90-Day Rolling Terms (after Month 4)',
      ],
    },
    {
      id: 'scaleup',
      name: 'The Scale-Up',
      subtitle: '3-9 SDRs',
      price: '$7,500',
      period: '/month per SDR',
      sqos: '60-180+',
      description: 'Build a custom pod to aggressively scale your pipeline with maximum cost-efficiency.',
      isMostPopular: false,
      features: [
        '3-9 Elite SDRs',
        '60-180+ Guaranteed SQOs/mo',
        'Maximum cost-efficiency at scale',
        'Full Impact Selling OS (100% IP Ownership)',
        'Complete Signal Factory Tech Stack',
        'GTM Leverage Audit & Strategy',
        '4-Month Build & Ramp',
        '90-Day Rolling Terms (after Month 4)',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      subtitle: '10+ SDRs',
      price: 'Custom',
      period: 'pricing',
      sqos: '200+',
      description: 'A fully white-labeled, custom-built sales department. Let\'s talk.',
      isMostPopular: false,
      features: [
        '10+ Elite SDRs',
        '200+ Guaranteed SQOs/mo',
        'Fully white-labeled department',
        'Custom Impact Selling OS (100% IP Ownership)',
        'Dedicated Signal Factory Infrastructure',
        'Custom GTM Strategy & Architecture',
        'Dedicated Account Team',
        'Flexible Terms',
      ],
    },
  ];

  const antiTrapTerms = [
    {
      icon: Calendar,
      title: '4-Month Initial Term',
      subtitle: 'Build & Ramp Engagement',
      description: 'We invest 4 months to build your "Impact Selling OS," activate your "Signal Factory," and ramp your pod to guaranteed quota. This is not a quick fix—it\'s a strategic asset build.',
    },
    {
      icon: Shield,
      title: 'The SQO Guarantee',
      subtitle: '20+ BANT-Qualified Meetings',
      description: '20+ BANT-qualified meetings per SDR from Month 5, excluding December. If we miss the guarantee, we work for free the following month. This is our skin in the game.',
    },
    {
      icon: RefreshCw,
      title: '90-Day Rolling Terms',
      subtitle: 'No 12-Month Lock-Ins',
      description: 'After the 4-month ramp, your engagement converts to quarterly rolling terms. No annual contracts. No 12-month traps. Just transparent, flexible partnership.',
    },
  ];

  const forYouReasons = [
    {
      icon: CheckCircle2,
      text: '$750 cost-per-meeting for a BANT-qualified, ICP-matched meeting is a no-brainer for your business model',
    },
    {
      icon: CheckCircle2,
      text: 'Your LTV supports strategic, consultative selling (not commodity transactional)',
    },
    {
      icon: CheckCircle2,
      text: 'You have a complex, hard-to-explain product or ICP that requires elite talent',
    },
    {
      icon: CheckCircle2,
      text: 'You want to build a permanent GTM asset with 100% IP ownership',
    },
  ];

  const notForYouReasons = [
    {
      icon: X,
      text: 'Your LTV is low and you need $50 commodity meetings from a high-volume call center',
    },
    {
      icon: X,
      text: 'You want to rent activity and dashboards instead of building an asset',
    },
    {
      icon: X,
      text: 'You need a transactional, low-touch sales motion',
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Predictable Pricing for a Guaranteed Asset | Revenue Party"
        description="Transparent, 'anti-trap' pricing for your GTM Engine. 20+ guaranteed SQOs per SDR monthly. No commissions, no long-term contracts, 100% IP ownership."
        keywords="GTM pricing, BDR pod cost, sales system pricing, transparent pricing, guaranteed sales appointments, cost per meeting"
        canonical="/pricing"
      />
      
      {/* Hero Module */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        {/* Light grid dots pattern (light mode only) */}
        <div className="light-grid-dots" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              data-testid="heading-hero"
            >
              Predictable Pricing for a{" "}
              <span className="gradient-text gradient-hero">Guaranteed Asset.</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              data-testid="text-hero-subheading"
            >
              We are proud of our price. It's an investment in a guaranteed asset, not a cost. Here is our transparent, "anti-trap" model.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Module 1: Pricing Cards */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-pricing-cards">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-pricing-cards">
              Choose Your<br />
              <span className="gradient-text gradient-hero">Guaranteed GTM Engine</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-pricing-description">
              All plans include the full "Fullstack Sales Unit": Elite Talent, the "Impact Selling OS" (100% IP Ownership), and the "Signal Factory" Tech Stack. All plans include the 20+ SQOs / SDR guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className={`relative p-8 h-full flex flex-col light-depth hover-elevate transition-all ${
                    plan.isMostPopular ? 'border-primary border-2' : ''
                  }`}
                  data-testid={`card-pricing-${plan.id}`}
                >
                  {plan.isMostPopular && (
                    <Badge 
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground"
                      data-testid="badge-most-popular"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      MOST POPULAR
                    </Badge>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1" data-testid={`heading-plan-${plan.id}`}>
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm" data-testid={`text-plan-subtitle-${plan.id}`}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" data-testid={`text-plan-price-${plan.id}`}>
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground" data-testid={`text-plan-period-${plan.id}`}>
                        {plan.period}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {plan.sqos} Guaranteed SQOs/mo
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6 flex-grow" data-testid={`text-plan-description-${plan.id}`}>
                    {plan.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2" data-testid={`feature-${plan.id}-${idx}`}>
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild
                    className="w-full"
                    variant={plan.isMostPopular ? "default" : "outline"}
                    data-testid={`button-select-${plan.id}`}
                  >
                    <Link href="/gtm-audit">
                      {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Not sure which plan is right for you?
            </p>
            <Button asChild variant="outline" data-testid="button-schedule-audit">
              <Link href="/gtm-audit">Schedule a Free GTM Audit</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Module 2: The "Anti-Trap" Terms */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-anti-trap-terms">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-anti-trap-terms">
              Our Terms: <span className="text-primary">100% Transparency</span>, 0% "Black Box"
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-anti-trap-description">
              Our terms are designed to build trust and mitigate your risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {antiTrapTerms.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover-elevate transition-all" data-testid={`card-term-${index}`}>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      border: '2px solid hsl(var(--primary))',
                    }}
                  >
                    <term.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" data-testid={`heading-term-${index}`}>
                    {term.title}
                  </h3>
                  <p className="text-sm text-primary font-semibold mb-4" data-testid={`subtitle-term-${index}`}>
                    {term.subtitle}
                  </p>
                  <p className="text-muted-foreground leading-relaxed" data-testid={`description-term-${index}`}>
                    {term.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: "Why We Are Proud of Our Price" */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-proud-of-price">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-proud-of-price">
              We Are a <span className="text-primary">Premium Investment</span> in Relevance
            </h2>
          </div>

          <Card className="p-8 md:p-12">
            <div className="space-y-6 text-lg leading-relaxed" data-testid="text-proud-of-price-content">
              <p>
                Cheap agencies fail. They're commodities that can't handle complex B2B ICPs or unique value propositions.
              </p>
              <p>
                Our price reflects our <strong>Architects</strong>, our <strong>Impact Selling OS</strong>, and our ability to deliver quality qualified meetings for difficult-to-explain products.
              </p>
              <p className="text-xl font-semibold text-primary">
                You're not buying dials; you're investing in relevance and a guarantee.
              </p>
              <p>
                When you choose Revenue Party, you're choosing:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong>Elite Talent</strong> forged by our Talent Architect, not commodity reps from a call center</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong>A Proprietary Methodology</strong> (Impact Selling OS) that you own 100%, not generic scripts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong>The Signal Factory</strong> AI-powered tech stack that finds buying signals before they're in-market</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span><strong>A Guarantee</strong> that protects your investment and ensures results</span>
                </li>
              </ul>
              <p className="pt-4 border-t">
                This is why we're proud of our price. It's not a cost. It's an investment in a permanent, scalable, guaranteed revenue asset.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Module 4: "Is a GTM Engine Right For You?" (The Qualifier) */}
      <section className="py-20 px-4 md:px-6 lg:px-8" data-testid="section-qualifier">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-qualifier">
              The <span className="text-primary">$750 Question</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-qualifier-intro">
              Our model is not for everyone. Here's how to know if it's right for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FOR YOU */}
            <Card className="p-8 border-2 border-primary/20 bg-primary/5">
              <div className="mb-6">
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  FOR YOU
                </Badge>
                <h3 className="text-2xl font-bold" data-testid="heading-for-you">
                  This Is a No-Brainer If:
                </h3>
              </div>
              <div className="space-y-4">
                {forYouReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3" data-testid={`reason-for-${idx}`}>
                    <reason.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{reason.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-semibold text-primary">
                  With our 2-SDR Pod, your effective guaranteed cost-per-meeting is $375. That's the cost of strategic, qualified pipeline.
                </p>
              </div>
            </Card>

            {/* NOT FOR YOU */}
            <Card className="p-8 border-2 border-destructive/20 bg-destructive/5">
              <div className="mb-6">
                <Badge className="mb-4 bg-destructive text-destructive-foreground">
                  <X className="w-4 h-4 mr-2" />
                  NOT FOR YOU
                </Badge>
                <h3 className="text-2xl font-bold" data-testid="heading-not-for-you">
                  We're Not the Right Fit If:
                </h3>
              </div>
              <div className="space-y-4">
                {notForYouReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-3" data-testid={`reason-not-${idx}`}>
                    <reason.icon className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{reason.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-semibold text-destructive">
                  We're a strategic partner, not a call center. If you need commodity volume at commodity prices, we're not your solution.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30" data-testid="section-final-cta">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-final-cta">
            Let's Build Your <span className="text-primary">Blueprint</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-final-cta-description">
            Stop choosing between bad options. Schedule a free GTM Audit with our Architects and let's design a system that wins.
          </p>
          <Button 
            asChild
            size="lg"
            className="text-lg px-8 py-6"
            data-testid="button-final-cta"
          >
            <Link href="/gtm-audit">Schedule My GTM Audit</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No-obligation consultation • Free GTM Leverage Audit • Custom blueprint
          </p>
        </div>
      </section>
    </div>
  );
}
