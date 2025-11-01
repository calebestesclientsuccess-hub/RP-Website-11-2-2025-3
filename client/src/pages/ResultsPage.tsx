import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ResultsPage() {
  return (
    <>
      <Breadcrumbs items={[]} currentPage="Results & Case Studies" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-results">
          Results & Case Studies ("The Proof")
        </h1>
      </div>
    </>
  );
}
