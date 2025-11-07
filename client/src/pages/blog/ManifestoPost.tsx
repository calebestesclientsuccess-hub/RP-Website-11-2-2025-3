import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function ManifestoPost() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Our Manifesto: The 'Lone Wolf Trap' & The 'Architecture vs. Headcount' Revolution"
        description="For decades, GTM models have been broken. Read our manifesto on the 'Lone Wolf Trap' and why 'Architecture vs. Headcount' is the only solution."
        keywords="the lone wolf trap, architecture vs headcount, why sales models fail, gtm revolution, sales system vs headcount"
        canonical="/blog/manifesto-the-lone-wolf-trap"
      />
      
      <ArticleSchema
        headline="Our Manifesto: The 'Lone Wolf Trap' & The 'Architecture vs. Headcount' Revolution"
        description="For decades, GTM models have been broken. Read our manifesto on the 'Lone Wolf Trap' and why 'Architecture vs. Headcount' is the only solution."
        datePublished="2025-01-15"
        dateModified="2025-01-15"
        articleType="BlogPosting"
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Badge 
            className="badge-texture bg-competition text-white border-competition text-sm px-4 py-1.5 mb-6"
            data-testid="badge-manifesto"
          >
            Our Manifesto
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="heading-manifesto">
            Our Manifesto: The "Lone Wolf Trap" & The "Architecture vs. Headcount" Revolution
          </h1>
        </div>
      </section>
      
      {/* Introduction */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <p className="text-xl leading-relaxed">
            You're here because you have a pipeline problem. You're looking for a "person" (a Lone Wolf) to solve it, but your <em>real</em> problem is <strong>architecture</strong>.
          </p>
          <p className="text-xl leading-relaxed">
            For decades, founders have been forced to choose between two bad options that are really just two sides of the same broken, "headcount-first" coin. We call this "The Lone Wolf Trap."
          </p>
          <p className="text-xl leading-relaxed font-semibold">
            This is our manifesto against that model.
          </p>
        </div>
      </section>
      
      <hr className="my-12 max-w-4xl mx-auto border-border" />
      
      {/* First Trap: Internal Hire */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight" data-testid="heading-trap-1">
            THE FIRST TRAP: THE "INTERNAL HIRE" ($198,000 MISTAKE)
          </h2>
          
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-lg leading-relaxed">
              This is the "Internal Trap," where you try to solve a systems problem with a single "Lone Wolf" hire.
            </p>
            
            <p className="text-lg leading-relaxed">
              You write the job description. You hunt for the "purple squirrel" (a $65k rep who can also write strategy, build a tech stack, and manage themselves). You spend 6 months hiring and 6 more months "ramping," only to see them churn out.
            </p>
            
            <p className="text-lg leading-relaxed font-semibold">
              This is the "$198,000 Mistake."
            </p>
            
            <p className="text-lg leading-relaxed">
              It's not the rep's fault. They were set up to fail. You didn't hire a person; you tried to hire a <em>system</em>. You expected one "Lone Wolf" to be an expert in five different domains.
            </p>
            
            <p className="text-lg leading-relaxed font-semibold">
              This model is a gamble, not an investment.
            </p>
          </div>
          
          {/* Contextual Link & Funnel */}
          <div className="mt-8 p-6 border-l-4 border-competition bg-card rounded-r-md">
            <p className="text-base mb-4">
              This trap is so common, we built a complete guide to deconstruct it. If you are currently trying to build an internal team:
            </p>
            <Button 
              variant="default" 
              className="gap-2"
              asChild
              data-testid="button-internal-trap-guide"
            >
              <Link href="/resources/how-to-build-sdr-team-guide">
                <a>
                  See our complete "How to Build an SDR Team" guide to avoid this trap
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <hr className="my-12 max-w-4xl mx-auto border-border" />
      
      {/* Second Trap: Outsourcing */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight" data-testid="heading-trap-2">
            THE SECOND TRAP: THE "OUTSOURCING" SUICIDE MISSION
          </h2>
          
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-lg leading-relaxed">
              This is the "Agency Trap," where you rent a commodity "headcount solution."
            </p>
            
            <p className="text-lg leading-relaxed">
              You sign a 12-month contract with a "Black Box" agency. They promise "meetings" but deliver "activity." You have zero visibility into their process and zero control. You are <em>renting</em> their reps, and all the "Sales IP"—the learnings, the scripts, the data—stays with <em>them</em>.
            </p>
            
            <p className="text-lg leading-relaxed font-semibold">
              When you inevitably leave, you walk away with <em>nothing</em>. You are back at square one, only poorer and more cynical. This is the "Zero-IP" trap, and it's a suicide mission.
            </p>
          </div>
          
          {/* Contextual Link & Funnel */}
          <div className="mt-8 p-6 border-l-4 border-collaboration bg-card rounded-r-md">
            <p className="text-base mb-4">
              This model is a "trap" by design. We've published a buyer's guide to expose it. If you are currently evaluating agencies:
            </p>
            <Button 
              variant="default" 
              className="gap-2"
              asChild
              data-testid="button-agency-trap-guide"
            >
              <Link href="/resources/sdr-outsourcing-companies-guide">
                <a>
                  See our "2025 Buyer's Guide to SDR Outsourcing" to get the 10 questions that expose this model
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <hr className="my-12 max-w-4xl mx-auto border-border" />
      
      {/* The Diagnosis */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight" data-testid="heading-diagnosis">
            THE DIAGNOSIS: ARCHITECTURE vs. HEADCOUNT
          </h2>
          
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-xl leading-relaxed font-semibold">
              Both "traps" are symptoms of the same disease: <strong>You are solving an architecture problem with an un-architected headcount solution.</strong>
            </p>
            
            <p className="text-lg leading-relaxed mt-6">
              A "Lone Wolf" hire <em>is not</em> an architecture.
            </p>
            <p className="text-lg leading-relaxed">
              A "Black Box" agency <em>is not</em> an architecture.
            </p>
            
            <p className="text-xl leading-relaxed mt-6 font-semibold">
              You don't have a <em>person</em> problem. You have a <em>system</em> problem.
            </p>
          </div>
        </div>
      </section>
      
      <hr className="my-12 max-w-4xl mx-auto border-border" />
      
      {/* The Solution */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-tight" data-testid="heading-solution">
            THE SOLUTION: THE "ARCHITECTURE" MODEL
          </h2>
          
          <div className="prose prose-lg dark:prose-invert">
            <p className="text-xl leading-relaxed font-semibold">
              The only antidote is to stop buying "headcount" and start deploying an "architecture."
            </p>
            
            <p className="text-xl leading-relaxed mt-6">
              This is the new category: <strong>Sales as a Service.</strong>
            </p>
            
            <p className="text-lg leading-relaxed mt-6">
              It's not "outsourcing." It is an architecture-first model where you deploy a complete, AI-enabled GTM Revenue Engine as a managed service.
            </p>
            
            <ul className="space-y-3 mt-6">
              <li className="text-lg">
                You don't get one "Lone Wolf" rep. You get a 4-person <strong>GTM Pod</strong> (Strategist, Architect, Coach, Operator).
              </li>
              <li className="text-lg">
                You don't get a "Black Box." You get a 100% transparent <strong>"Signal Factory"</strong> and <strong>"Impact OS"</strong> that you own.
              </li>
              <li className="text-lg">
                You don't "rent" a service. You <strong>build an asset.</strong>
              </li>
            </ul>
            
            <p className="text-xl leading-relaxed mt-8 font-semibold">
              This is the end of the "Lone Wolf" model. This is the new standard for GTM.
            </p>
          </div>
          
          {/* Contextual Link & Funnel */}
          <div className="mt-8 p-6 border-l-4 border-technology bg-card rounded-r-md">
            <p className="text-base mb-4">
              We have written the definitive guide to this new model.
            </p>
            <Button 
              variant="default" 
              className="gap-2"
              asChild
              data-testid="button-saas-guide"
            >
              <Link href="/resources/guide-to-sales-as-a-service">
                <a>
                  See the "Definitive Guide to Sales as a Service" to explore the full architecture
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="heading-final-cta">
            Ready to Break Free from the Lone Wolf Trap?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Deploy a complete GTM architecture in 14 days.
          </p>
          <Button 
            size="lg" 
            className="gap-2"
            asChild
            data-testid="button-deploy-engine"
          >
            <Link href="/contact">
              <a>
                Deploy Your GTM Engine
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
