import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function ProblemPage() {
  return (
    <>
      <Breadcrumbs items={[]} currentPage="The Problem" />
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-bold" data-testid="heading-problem">
          The Problem ("The Lone Wolf Trap")
        </h1>
      </div>
    </>
  );
}
