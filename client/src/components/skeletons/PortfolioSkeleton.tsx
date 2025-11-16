
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Skeleton className="h-12 w-64 mb-8 mx-auto" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
