import { SEO } from "@/components/SEO";

export default function FAQPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO 
        title="FAQ - Common Questions About GTM Systems | Revenue Party"
        description="Get answers about our GTM Engine, BDR pods, tech stack, and how we're different from traditional agencies."
        keywords="GTM FAQ, sales questions, BDR pod questions"
        canonical="/faq"
      />
      <h1 className="text-4xl font-bold" data-testid="heading-faq">
        FAQ
      </h1>
    </div>
  );
}
