
import { FAQSchema } from '../components/schemas/FAQSchema';

import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { WidgetZone } from "@/components/WidgetZone";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is the guarantee, exactly?",
      answer: "From Month 5 on, we guarantee 20+ qualified 'shown' appointments per SDR, per month (excluding December). For the 2-SDR Pod, that's 40+ total meetings. These meetings will meet the specific ICP and BANT criteria we agree upon in your GTM Audit. If we miss this quota, we work for free until we hit it."
    },
    {
      question: "Why the 4-month initial term?",
      answer: "Because we are building a permanent system, not just renting a person. Months 1-4 are the 'Build & Ramp' (Audit, Build, Test, Optimize). This process is what enables us to give you the guarantee from Month 5 onwards. Cheap agencies skip this, which is why they fail (a 93% failure rate)."
    },
    {
      question: "Why is the 2-SDR Pod ($15k) only $2.5k more than the 1-SDR ($12.5k)?",
      answer: "It's our 'no-brainer' offer. We want you to succeed, and the 'Pod' model (Community + Competition) is our most effective. We discount the second SDR to make it the obvious choice, as it drops your effective cost-per-SDR (to $7.5k/SDR) and your cost-per-meeting to $375. It's the highest ROI on the site."
    },
    {
      question: "What happens if my SDR leaves? This is my biggest fear.",
      answer: "Nothing. Your pipeline is safe. This is the core of our value. With an internal 'Lone Wolf' hire, your pipeline crashes for 6-9 months (The '$198k Liability'). With us, the 'asset' (the 'Impact Selling OS' and 'Signal Factory') remains. We slot in a new, pre-trained 'Impact' certified operator, and they are productive almost immediately. You are investing in a resilient system, not a fragile person."
    },
    {
      question: "Can I take this in-house later?",
      answer: "Yes. We are a white-labeled 'build-operate-transfer' partner. We want you to own this asset. When you're ready, we'll help you hire and train your own team to run the proven, guaranteed system we built for you."
    },
    {
      question: "What does 'owning the playbook' actually mean?",
      answer: "It means the 'Impact Selling OS'—all messaging, objection handling, personas, and playbooks—is built for you, in a shared document, and is 100% your IP forever. This is the 'brain' of your sales engine. You can take it and leave at any time (after your term), and you will not be a victim of the 'Zero-IP Trap'."
    },
    {
      question: "How is this different from Belkins, Upwork, or a traditional agency?",
      answer: "It's the difference between renting a liability and building an asset. Upwork / Internal Hire is a risk. You pay $198k+ for a person who has a 34% chance of failing, guarantees 0, and creates a single point of failure. Belkins / Agencies are a trap. They are a 'Black Box' that rents you 'activity' with no guarantee and no IP. You build their asset, not yours. Revenue Party is a guaranteed asset. You are buying a resilient system, 100% IP ownership, and a guaranteed 20+ SQOs/SDR for a fixed price."
    },
    {
      question: "What's not included?",
      answer: "We are a strategic GTM Engine, not a commodity service. We do not do: Closing: Our BDR Pods are elite opportunity-generators. Your team handles the close. Inbound Marketing: We are not a content/SEO agency (though our 'Signal Factory' uses your inbound leads). One-Off 'Projects': We do not do '1-month call-down' projects. We are building a permanent, scalable revenue system, not a temporary 'activity' boost."
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="FAQ - Frequently Asked Questions | Revenue Party"
        description="Clear answers about our GTM Engine guarantee, pricing, asset ownership, and how we're different from Belkins, Upwork, and traditional agencies."
        keywords="Revenue Party FAQ, Belkins vs Revenue Party, what is a signal factory, GTM engine questions, owning the playbook"
        canonical="/faq"
      />
      <FAQSchema faqs={faqs} />

      {/* Widget Zone 20 */}
      <WidgetZone zone="zone-20" className="my-8" />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Module */}
        <div className="text-center mb-16" data-testid="section-hero">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-faq">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Clear answers. No "Black Box" responses.
          </p>
        </div>

        {/* Section 1: The Guarantee & Pricing */}
        <section className="mb-12" data-testid="section-guarantee-pricing">
          <h2 className="text-3xl font-bold mb-6" data-testid="heading-section-1">
            Section 1: The Guarantee & Pricing
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1" data-testid="accordion-item-guarantee">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-guarantee">
                Q: What is the guarantee, exactly?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-guarantee">
                From Month 5 on, we guarantee <strong>20+</strong> qualified 'shown' appointments <em>per SDR</em>, per month (excluding December). For the 2-SDR Pod, that's <strong>40+</strong> total meetings. These meetings will meet the specific ICP and BANT criteria we agree upon in your GTM Audit. <strong>If we miss this quota, we work for free until we hit it.</strong>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2" data-testid="accordion-item-4-month-term">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-4-month-term">
                Q: Why the 4-month initial term?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-4-month-term">
                Because we are building a <em>permanent system</em>, not just renting a person. Months 1-4 are the 'Build & Ramp' (Audit, Build, Test, Optimize). This process is what <em>enables</em> us to give you the guarantee from Month 5 onwards. Cheap agencies skip this, which is why they fail (a 93% failure rate).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3" data-testid="accordion-item-2-sdr-pricing">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-2-sdr-pricing">
                Q: Why is the 2-SDR Pod ($15k) only $2.5k more than the 1-SDR ($12.5k)?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-2-sdr-pricing">
                It's our 'no-brainer' offer. We want you to succeed, and the 'Pod' model (Community + Competition) is our most effective. We discount the second SDR to make it the obvious choice, as it drops your effective cost-per-SDR (to $7.5k/SDR) and your cost-per-meeting to <strong>$375</strong>. It's the highest ROI on the site.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Widget Zone 21 */}
        <WidgetZone zone="zone-21" className="my-8" />

        {/* Section 2: The Asset, Risk & IP */}
        <section className="mb-12" data-testid="section-asset-risk">
          <h2 className="text-3xl font-bold mb-6" data-testid="heading-section-2">
            Section 2: The Asset, Risk & IP
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q4" data-testid="accordion-item-sdr-leaves">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-sdr-leaves">
                Q: What happens if my SDR leaves? This is my biggest fear.
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-sdr-leaves">
                <strong>Nothing.</strong> Your pipeline is safe. This is the core of our value. With an internal 'Lone Wolf' hire, your pipeline crashes for 6-9 months (The '$198k Liability'). With us, the 'asset' (the 'Impact Selling OS' and 'Signal Factory') remains. We slot in a new, pre-trained 'Impact' certified operator, and they are productive almost immediately. You are investing in a resilient <em>system</em>, not a fragile <em>person</em>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q5" data-testid="accordion-item-in-house">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-in-house">
                Q: Can I take this in-house later?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-in-house">
                <strong>Yes.</strong> We are a white-labeled "build-operate-transfer" partner. We <em>want</em> you to own this asset. When you're ready, we'll help you hire and train your own team to run the <em>proven, guaranteed system we built for you</em>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q6" data-testid="accordion-item-owning-playbook">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-owning-playbook">
                Q: What does "owning the playbook" actually mean?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-owning-playbook">
                It means the 'Impact Selling OS'—all messaging, objection handling, personas, and playbooks—is built for you, in a shared document, and is <strong>100% your IP forever</strong>. This is the 'brain' of your sales engine. You can take it and leave at any time (after your term), and you will not be a victim of the 'Zero-IP Trap'.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Widget Zone 22 */}
        <WidgetZone zone="zone-22" className="my-8" />

        {/* Section 3: The Competition */}
        <section className="mb-12" data-testid="section-competition">
          <h2 className="text-3xl font-bold mb-6" data-testid="heading-section-3">
            Section 3: The Competition
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q7" data-testid="accordion-item-vs-competitors">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-vs-competitors">
                Q: How is this different from Belkins, Upwork, or a traditional agency?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-vs-competitors">
                <p className="mb-3">It's the difference between renting a liability and building an asset.</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Upwork / Internal Hire</strong> is a <strong>risk</strong>. You pay $198k+ for a <em>person</em> who has a 34% chance of failing, guarantees 0, and creates a single point of failure.</li>
                  <li><strong>Belkins / Agencies</strong> are a <strong>trap</strong>. They are a 'Black Box' that rents you 'activity' with no guarantee and no IP. You build <em>their</em> asset, not yours.</li>
                  <li><strong>Revenue Party</strong> is a <strong>guaranteed asset</strong>. You are buying a resilient <em>system</em>, 100% IP ownership, and a <em>guaranteed</em> 20+ SQOs/SDR for a fixed price.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q8" data-testid="accordion-item-not-included">
              <AccordionTrigger className="text-left text-lg" data-testid="accordion-trigger-not-included">
                Q: What's not included?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground" data-testid="accordion-content-not-included">
                <p className="mb-3">We are a strategic GTM Engine, not a commodity service. We do <em>not</em> do:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Closing:</strong> Our BDR Pods are elite opportunity-generators. Your team handles the close.</li>
                  <li><strong>Inbound Marketing:</strong> We are not a content/SEO agency (though our 'Signal Factory' <em>uses</em> your inbound leads).</li>
                  <li><strong>One-Off 'Projects':</strong> We do not do '1-month call-down' projects. We are building a permanent, scalable revenue system, not a temporary 'activity' boost.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Widget Zone 23 */}
        <WidgetZone zone="zone-23" className="my-8" />

        {/* Primary CTA Module */}
        <section className="text-center mt-16 py-12 px-6 rounded-lg bg-card border" data-testid="section-cta">
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-cta">
            Have More Questions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
            The best way to get your specific questions answered is in a GTM Audit. Spend 30 minutes with an Architect to get a transparent, no-obligation blueprint for your business.
          </p>
          <Link href="/audit">
            <Button size="lg" data-testid="button-schedule-audit">
              Schedule My GTM Audit
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
