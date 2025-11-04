import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
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
import { ArticleWidget } from "@/components/article/ArticleWidget";
import { SimpleCalculator } from "@/components/article/SimpleCalculator";

const relatedArticles: RelatedArticle[] = [
  {
    title: "The Complete Guide to Building an SDR Team",
    excerpt: "Avoid the $198,000 'Lone Wolf' mistake with this complete guide to building a GTM architecture that actually works.",
    path: "/resources/how-to-build-sdr-team-guide",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop"
  },
  {
    title: "The Definitive Guide to Sales as a Service",
    excerpt: "Sales as a Service is not outsourcing. It's the end of the 'Lone Wolf' model and the solution to the 'Headcount vs. Architecture' problem.",
    path: "/resources/guide-to-sales-as-a-service",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=450&fit=crop"
  },
  {
    title: "How to Hire Cold Callers (2026 Guide)",
    excerpt: "Discover the three proven paths to building a successful cold calling team in 2026 and which approach fits your value proposition.",
    path: "/resources/how-to-hire-cold-callers-guide",
    imageUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=450&fit=crop"
  }
];

const featuredPromo: FeaturedPromoData = {
  type: "assessment",
  badge: "Free Assessment",
  title: "Get Your Revenue Blueprint",
  description: "Take our 5-minute assessment to discover which GTM architecture fits your current stage and unlock your personalized revenue blueprint.",
  ctaText: "Start Assessment",
  ctaUrl: "/pipeline-assessment",
  imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop"
};

export default function AgencyTrapGuide() {
  return (
    <>
      <ReadingProgressBar />
      <SEO
        title="A 2025 Buyer's Guide to SDR Outsourcing (And the 3 'Traps' to Avoid)"
        description="Looking for SDR outsourcing companies? Read this 2025 buyer's guide first. We review the top 'Standard Model' agencies and expose the 3 'Black Box' traps to avoid."
        keywords="sdr outsourcing companies, b2b appointment setting services, outsourced bdr, belkins vs cience, sdr agency, sales outsourcing"
        canonical="/resources/sdr-outsourcing-companies-guide"
      />
      
      <ArticleSchema
        headline="A 2025 Buyer's Guide to SDR Outsourcing (And the 3 'Traps' to Avoid)"
        description="Looking for SDR outsourcing companies? Read this 2025 buyer's guide first. We review the top 'Standard Model' agencies and expose the 3 'Black Box' traps to avoid."
        datePublished="2025-01-15"
        dateModified="2025-01-15"
      />

      <ArticleLayout 
        relatedArticles={relatedArticles} 
        featuredPromo={featuredPromo}
        heroImageUrl="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1600&h=600&fit=crop"
        heroImageAlt="Team collaboration in modern office"
      >
        <PillarHero
        badgeText="Buyer's Guide 2025"
        title="A 2025 Buyer's Guide to SDR Outsourcing (And the 3 'Traps' to Avoid)"
        subtitle="Choosing an outsourced SDR partner is a high-stakes decision. We've reviewed the top companies and the 'Standard Model' they use, exposing the three hidden traps you must ask about before you sign a contract."
      />
      
      <ContentSection heading="Top 5 'Standard Model' SDR Outsourcing Companies">
        <p className="text-lg mb-6">
          You need pipeline, and you're ready to hire an external partner. The companies below are the most popular options in the "Standard Model" of outsourcing. This model focuses on hiring reps to execute outbound activity (calls, emails) on your behalf.
        </p>
        
        <div className="space-y-6 not-prose">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">1. Belkins</h3>
            <p className="text-muted-foreground">
              A well-known leader in B2B appointment setting, Belkins is recognized for its large team and focus on manually researched, high-quality leads. They are a classic example of the "Standard Model."
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">2. CIENCE</h3>
            <p className="text-muted-foreground">
              One of the largest players in the space, CIENCE offers a multi-channel outbound "SDR-as-a-Service" model. They are known for their ability to scale outbound teams quickly for clients.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">3. Martal Group</h3>
            <p className="text-muted-foreground">
              Martal focuses on providing "on-demand" sales teams, often with a focus on specific verticals like tech, IoT, and SaaS. Their model is built on providing experienced, dedicated reps.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">4. SalesAR</h3>
            <p className="text-muted-foreground">
              Another provider in the appointment-setting space, SalesAR focuses heavily on data accuracy and lead generation as a precursor to their outbound SDR services.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">5. memory</h3>
            <p className="text-muted-foreground">
              A popular European-based agency, memory (formerly Leadable) offers a "pay-per-meeting" model, which is attractive to companies looking to de-risk their investment in outbound.
            </p>
          </Card>
        </div>
        
        <p className="text-lg mt-8 font-semibold">
          These providers are skilled at the "Standard Model." But this model is riddled with hidden costs. Before you evaluate them, you must use the right buyer's checklist to expose the three "traps" built into their systems.
        </p>
      </ContentSection>
      
      <ContentSection 
        heading="The 3-Trap Buyer's Checklist (How to Evaluate Providers)" 
        background="muted"
      >
        <p className="text-lg mb-8">
          These are the "gotcha" questions. Use them to expose the hidden traps in the "Standard Model" that cost you control, create friction, and lock you into a bad relationship.
        </p>
        
        <div className="space-y-8 not-prose">
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-competition text-white border-competition">Trap 1</Badge>
              The "Black Box Problem" (The Cost of No-Control)
            </h3>
            <p className="text-lg mb-4">
              In the "Standard Model," you give the agency your criteria and they "deliver" meetings. But you have zero visibility into the <em>process</em>, the <em>data</em>, or the <em>system</em>. It's a "Black Box," and you are 100% dependent on them.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/black-box-questions"
                title="3 'Black Box' Questions You Must Ask a B2B Appointment Setting Service"
              />
              <SpokeLink 
                href="/blog/belkins-vs-cience"
                title="Belkins vs. CIENCE vs. Revenue Party: A 2025 Comparison"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-collaboration text-white border-collaboration">Trap 2</Badge>
              The "Activity Mirage" (The Cost of Vanity Metrics)
            </h3>
            <p className="text-lg mb-4">
              "Standard Model" providers justify their retainers with "activity." They'll send you reports showing "1,000 emails sent" or "500 dials made." But "activity" is not "progress." These are vanity metrics that hide a lack of real pipeline <em>progress</em>.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/activity-vs-progress"
                title="'Activity' vs. 'Progress': 5 SDR Vanity Metrics to Ignore"
              />
              <SpokeLink 
                href="/blog/qualified-appointments"
                title="What Are 'Qualified' Appointments? A BANT vs. SQL Framework"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Badge className="badge-texture bg-technology text-white border-technology">Trap 3</Badge>
              The "Zero-IP Trap" (The Cost of Renting)
            </h3>
            <p className="text-lg mb-4">
              This is the most dangerous trap. When you work with a "Standard Model" agency, you are <em>renting</em> their process. All the "sales IP" they discover... <em>they</em> keep it. When you decide to leave, you walk away with <em>nothing</em>.
            </p>
            <div className="grid gap-3 mt-4">
              <SpokeLink 
                href="/blog/sales-ip"
                title="What is 'Sales IP' and Why Don't Most Outsourced SDR Agencies Let You Keep It?"
              />
              <SpokeLink 
                href="/blog/fire-sales-agency"
                title="What Happens When You Fire a Sales Agency? (The 'Zero-IP' Exit)"
              />
            </div>
          </div>
        </div>
      </ContentSection>
      
      <ContentSection 
        heading="The Diagnosis: You Don't Have a 'Service' Problem, You Have an 'Architecture' Problem"
        subheading="These 'traps' are not your fault. They are symptoms of a broken model."
      >
        <p className="text-xl leading-relaxed">
          "The 'Black Box,' the 'Activity Mirage,' the 'Zero-IP' trap—these are all symptoms of the same core disease: <strong>You are solving an architecture problem with a commodity headcount solution.</strong>
        </p>
        <p className="text-xl leading-relaxed mt-6">
          Renting a 'service' will never build you an 'asset.' The only antidote is to change the model."
        </p>
      </ContentSection>
      
      <ArticleWidget title="Interactive Calculator: Pipeline Requirements">
        <p className="text-sm text-muted-foreground mb-6">
          Calculate how many sales and opportunities you need to hit your revenue targets. This demonstrates how interactive widgets, calculators, and charts can be seamlessly embedded in articles.
        </p>
        <SimpleCalculator />
      </ArticleWidget>
      
      <SocialProof
        heading="How GrowthCorp Escaped the 'Black Box' Trap"
        quote="Our last agency was a 'black box.' We got a weekly report of 'activity' but had zero visibility, zero control, and zero IP. When we left, we had to start from scratch. The 'Sales as a Service' model is the opposite. We have 100% transparency. We own the playbook. The GTM Engine is our asset, not a rental."
        author="Michael Rodriguez"
        role="CRO"
        company="GrowthCorp"
        ctaText="See How We Compare to the 'Standard Model'"
        ctaHref="/gtm-engine"
      />
      
      <CTASection
        heading="The Antidote: The 'Architecture' Model (Sales as a Service)"
        description="What if you didn't have to rent a 'Black Box'? What if you could own a transparent GTM Engine?"
        primaryCTA={{
          text: "Build Your Asset, Not a 'Black Box'",
          href: "/contact"
        }}
        secondaryCTA={{
          text: "The 10-Question 'Agency Trap' Buyer's Checklist",
          href: "/assessment"
        }}
      />
      
        <ClusterHub
          heading="Explore the 'Agency Trap' Cluster"
          description="Go deeper into the analysis of the 'Standard Model.'"
          links={[
            {
              href: "/blog/black-box-questions",
              title: "3 'Black Box' Questions You Must Ask a B2B Appointment Setting Service"
            },
            {
              href: "/blog/activity-vs-progress",
              title: "'Activity' vs. 'Progress': 5 SDR Vanity Metrics to Ignore"
            },
            {
              href: "/blog/sales-ip",
              title: "What is 'Sales IP' and Why Don't Most Outsourced SDR Agencies Let You Keep It?"
            },
            {
              href: "/blog/fire-sales-agency",
              title: "What Happens When You Fire a Sales Agency? (The 'Zero-IP' Exit)"
            },
            {
              href: "/blog/belkins-vs-cience",
              title: "Belkins vs. CIENCE vs. Revenue Party: A 2025 Comparison"
            }
          ]}
        />
      </ArticleLayout>
    </>
  );
}
