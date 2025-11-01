import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";

export default function ResultsPage() {
  return (
    <>
      <SEO 
        title="Results & Case Studies - Proven GTM Success Stories | Revenue Party"
        description="See how companies escaped the hiring trap and built $2M pipeline assets in 60 days with our GTM Engine."
        keywords="GTM results, case studies, sales success, pipeline growth, ROI"
        canonical="/results"
      />
      <Breadcrumbs items={[]} currentPage="Results & Case Studies" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-results">
          Results & Case Studies ("The Proof")
        </h1>
      </div>
    </>
  );
}
