import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";

export default function ProblemPage() {
  return (
    <>
      <SEO 
        title="The Lone Wolf Trap - Why Traditional Sales Hiring Fails | Revenue Party"
        description="Stop the $198k hiring mistake. Traditional sales hiring and agency outsourcing both fail. Learn why system architecture beats headcount."
        keywords="sales hiring problems, BDR hiring costs, agency outsourcing, sales team building"
        canonical="/problem"
      />
      <Breadcrumbs items={[]} currentPage="The Problem" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-problem">
          The Problem ("The Lone Wolf Trap")
        </h1>
      </div>
    </>
  );
}
