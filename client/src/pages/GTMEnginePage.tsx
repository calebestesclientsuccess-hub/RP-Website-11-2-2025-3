import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function GTMEnginePage() {
  return (
    <>
      <Breadcrumbs items={[]} currentPage="The GTM Engine" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-gtm-engine">
          The GTM Engine
        </h1>
      </div>
    </>
  );
}
