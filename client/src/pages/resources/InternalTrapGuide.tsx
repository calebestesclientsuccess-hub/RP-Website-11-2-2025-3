import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
import { HowToSchema } from "@/components/schemas/HowToSchema";
import { PillarHero } from "@/components/pillar/PillarHero";
import { ContentSection } from "@/components/pillar/ContentSection";
import { SocialProof } from "@/components/pillar/SocialProof";
import { CTASection } from "@/components/pillar/CTASection";
import { ClusterHub } from "@/components/pillar/ClusterHub";
import { SpokeLink } from "@/components/pillar/SpokeLink";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import type { RelatedArticle } from "@/components/article/RelatedArticles";
import type { FeaturedPromoData } from "@/components/article/FeaturedPromo";

const relatedArticles: RelatedArticle[] = [
  {
    title: "A 2025 Buyer's Guide to SDR Outsourcing",
    excerpt: "Looking for SDR outsourcing companies? Read this buyer's guide first. We expose the 3 'Black Box' traps to avoid.",
    path: "/resources/sdr-outsourcing-companies-guide"
  },
  {
    title: "The Definitive Guide to Sales as a Service",
    excerpt: "Sales as a Service is not outsourcing. It's the end of the 'Lone Wolf' model and the solution to the 'Headcount vs. Architecture' problem.",
    path: "/resources/guide-to-sales-as-a-service"
  },
  {
    title: "How to Hire Cold Callers (2026 Guide)",
    excerpt: "Discover the three proven paths to building a successful cold calling team in 2026 and which approach fits your value proposition.",
    path: "/resources/how-to-hire-cold-callers-guide"
  }
];

const featuredPromo: FeaturedPromoData = {
  type: "assessment",
  badge: "Free Assessment",
  title: "Get Your Revenue Blueprint",
  description: "Take our 5-minute assessment to discover which GTM architecture fits your current stage and unlock your personalized revenue blueprint.",
  ctaText: "Start Assessment",
  ctaUrl: "/pipeline-assessment"
};

export default function InternalTrapGuide() {
  return (
    <>
      <ReadingProgressBar />
      <SEO
        title="The Complete Guide to Building an SDR Team (And the 3 'Traps' That Cause 90% of Failure)"
        description="Hiring an SDR seems simple, but 90% of new programs fail. Avoid the $198,000 'Lone Wolf' Mistake with this complete guide to building a GTM architecture."
        keywords="how to build an sdr team, why sdr programs fail, cost of a bad sdr hire, sdr ramp time, sdr hiring guide, sales development rep"
        canonical="/resources/how-to-build-sdr-team-guide"
      />
      
      <ArticleSchema
        headline="The Complete Guide to Building an SDR Team (And the 3 'Traps' That Cause 90% of Failure)"
        description="Hiring an SDR seems simple, but 90% of new programs fail. Avoid the $198,000 'Lone Wolf' Mistake with this complete guide to building a GTM architecture."
        datePublished="2025-01-15"
        dateModified="2025-01-15"
      />
      
      <HowToSchema
        name="The Standard 4-Step Playbook for Hiring an SDR"
        description="A guide to the typical SDR hiring process and why it often fails"
        steps={[
          {
            name: "Write the 'Perfect' Job Description",
            text: "Hunt for the 'purple squirrel'—a mythical rep with 3-5 years of experience, a 'hunter' mentality, deep tech skills, and a 'CEO mindset'... all for a $65k salary."
          },
          {
            name: "Source & Interview 100+ Candidates",
            text: "Spend 3-6 months sifting through résumés, conducting interviews, and burning valuable executive time, all while your pipeline flatlines."
          },
          {
            name: "Hire the 'Lone Wolf' Rep",
            text: "Find someone who 'interviews well.' Hand them a laptop, a phone, and a 'good luck,' expecting them to be a self-contained revenue-generating machine."
          },
          {
            name: "Onboard Them (and wait... and wait...)",
            text: "Wait 3-6 months for them to 'ramp,' only to find they're struggling, burning out, or leaving."
          }
        ]}
        totalTime="P6M"
      />

      <ArticleLayout relatedArticles={relatedArticles} featuredPromo={featuredPromo}>
        <PillarHero
        badgeText="Complete Guide"
        title="The Complete Guide to Building an SDR Team (And the 3 'Traps' That Cause 90% of Failure)"
        subtitle="Hiring an SDR seems simple. But most new programs fail within 6 months. Here is a realistic guide to avoid the '$198,000 Mistake' and build a system that actually generates pipeline."
      />
      
      <ContentSection heading="The 'Standard' 4-Step Playbook for Hiring an SDR">
        <p className="text-lg mb-6">
          You're here because you need pipeline, and you've decided to build an internal team. The "standard" process everyone follows looks logical on the surface:
        </p>
        
        <div className="space-y-6 not-prose">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-3">Step 1: Write the "Perfect" Job Description</h3>
            <p className="text-muted-foreground">
              You hunt for the "purple squirrel"—a mythical rep with 3-5 years of experience, a "hunter" mentality, deep tech skills, and a "CEO mindset"... all for a $65k salary.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-3">Step 2: Source & Interview 100+ Candidates</h3>
            <p className="text-muted-foreground">
              You spend 3-6 months sifting through résumés, conducting interviews, and burning valuable executive time, all while your pipeline flatlines.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-3">Step 3: Hire the "Lone Wolf" Rep</h3>
            <p className="text-muted-foreground">
              You finally find someone who "interviews well." You hand them a laptop, a phone, and a "good luck," expecting them to be a self-contained revenue-generating machine.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-3">Step 4: Onboard Them (and wait... and wait...)</h3>
            <p className="text-muted-foreground">
              You wait 3-6 months for them to "ramp," only to find they're struggling, burning out, or leaving.
            </p>
          </Card>
        </div>
        
        <p className="text-lg mt-8 font-semibold">
          This process seems logical. But it's a minefield. It's the reason most founders are back at square one 6-9 months later, minus $198,000. It's not a "person" problem; it's an <strong>architecture</strong> problem.
        </p>
      </ContentSection>
      
      <ContentSection 
        heading="The 3 'Hidden Traps' That Define Your Real TCO (Total Cost of Ownership)" 
        background="muted"
      >
        <p className="text-lg mb-8">
          Before you post that job, you must understand the real costs. These are the three "traps" that turn a "$65k salary" into a "$198,000 Mistake." Each trap is a critical failure in your GTM <strong>architecture</strong>.
        </p>
        
        <div className="space-y-8 not-prose">
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-competition text-white border-competition">Trap 1</Badge>
              The "Ramp & Churn" Trap (The $198,000 Mistake)
            </h3>
            <p className="text-lg mb-4">
              You've budgeted for the salary, but not the 34% industry churn rate or the 6-9 month "Hiring Drag" and "Ramp Time." These hidden costs—recruiting fees, lost opportunity cost, management overhead, and severance—create a six-figure liability before your rep makes a single qualified call.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/198k-mistake"
                title="The $198,000 Mistake: Why You Can't Just Hire Cold Callers"
              />
              <SpokeLink 
                href="/blog/sdr-ramp-time"
                title="Why SDR Ramp Time Is Actually Architecture-Building Time"
              />
              <SpokeLink 
                href="/blog/sdr-churn-rate"
                title="The 34% SDR Churn Rate Isn't a Talent Problem—It's a System Problem"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-collaboration text-white border-collaboration">Trap 2</Badge>
              The "Lone Wolf Fallacy" (The Cost of No-System)
            </h3>
            <p className="text-lg mb-4">
              You aren't hiring a <em>person</em>; you're trying to hire a <em>system</em>. You're expecting one "Lone Wolf" rep to find data, build lists, write scripts, build a tech stack, diagnose problems, and manage themselves. You are setting them up to fail. No single human can be an expert in all five of those domains.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/hire-salesperson-guide"
                title="How to Hire a Salesperson Without Gambling $198,000"
              />
              <SpokeLink 
                href="/blog/sales-hiring-architecture"
                title="Why Sales Hiring Fails: The Architecture Before Headcount Framework"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-technology text-white border-technology">Trap 3</Badge>
              The "Management Tax" (The Cost of Your Time)
            </h3>
            <p className="text-lg mb-4">
              Who is training, coaching, and managing this rep? You? Your Head of Sales? That's 20-30% of their time—a six-figure executive's time—not spent on closing revenue. This "Management Tax" is the most invisible and expensive cost of all.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/management-tax"
                title="The Hidden 'Management Tax': What Your SDR Hire Really Costs You"
              />
              <SpokeLink 
                href="/blog/sdr-tech-stack-cost"
                title="The SDR Tech Stack Tax: $11k Per Rep You Didn't Budget For"
              />
            </div>
          </div>
        </div>
      </ContentSection>
      
      <ContentSection 
        heading="The Diagnosis: You Don't Have a 'Person' Problem, You Have an 'Architecture' Problem"
        subheading="These 'traps' are not your fault. They are symptoms of a broken model."
      >
        <p className="text-xl leading-relaxed">
          "The '$198k Mistake,' the 9-month 'Ramp Time,' the crushing 'Management Tax'—these are all symptoms of the same core disease: <strong>You are solving an architecture problem with an un-architected headcount solution.</strong>
        </p>
        <p className="text-xl leading-relaxed mt-6">
          No single <em>person</em> can fix a broken <em>system</em>. The only antidote is to change the model."
        </p>
      </ContentSection>
      
      <SocialProof
        heading="How TechCo Avoided the $198,000 Mistake"
        quote="We were 3 days away from posting a job for an internal SDR. We ran the numbers in the 'True Cost' calculator and realized we were walking right into the '$198k Mistake'—all 'Management Tax' and ramp time. Deploying the GTM Engine was a no-brainer. We had a full 4-person team and were booking qualified meetings in 14 days."
        author="Sarah Chen"
        role="VP of Sales"
        company="TechCo"
        ctaText="Read the TechCo Case Study"
        ctaHref="/results"
      />
      
      <CTASection
        heading="The Antidote: Deploy an 'Architecture,' Not a 'Person'"
        description="What if, for roughly the same annual cost as that one $198,000+ 'Lone Wolf' hire, you could deploy a complete, 4-person GTM Engine?"
        primaryCTA={{
          text: "Deploy Your Engine in 14 Days",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "The 1-Page 'True Cost of an SDR' Calculator",
          href: "/roi-calculator"
        }}
      />
      
        <ClusterHub
          heading="Explore the 'Internal Trap' Cluster"
          description="Go deeper into the analysis of the 'Lone Wolf' model."
          links={[
            {
              href: "/blog/198k-mistake",
              title: "The $198,000 Mistake: Why You Can't Just Hire Cold Callers"
            },
            {
              href: "/blog/management-tax",
              title: "The Hidden 'Management Tax': What Your SDR Hire Really Costs You"
            },
            {
              href: "/blog/sdr-churn-rate",
              title: "The 34% SDR Churn Rate Isn't a Talent Problem—It's a System Problem"
            },
            {
              href: "/blog/sdr-ramp-time",
              title: "Why SDR Ramp Time Is Actually Architecture-Building Time"
            },
            {
              href: "/blog/sales-hiring-architecture",
              title: "Why Sales Hiring Fails: The Architecture Before Headcount Framework"
            }
          ]}
        />
      </ArticleLayout>
    </>
  );
}
