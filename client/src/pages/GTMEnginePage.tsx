import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";

export default function GTMEnginePage() {
  return (
    <>
      <SEO 
        title="The GTM Engine - Complete Revenue Generation System | Revenue Party"
        description="Elite talent, strategic framework, and AI-powered systems in one package. Your complete GTM engine deployed in 2 weeks."
        keywords="GTM engine, revenue system, sales infrastructure, BDR pod, AI sales"
        canonical="/gtm-engine"
      />
      <Breadcrumbs items={[]} currentPage="The GTM Engine" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-gtm-engine">
          The GTM Engine
        </h1>
      </div>
    </>
  );
}
