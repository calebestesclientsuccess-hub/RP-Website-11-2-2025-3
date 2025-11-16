
import { Skeleton } from "@/components/ui/skeleton";

export function AssessmentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress bar */}
      <Skeleton className="h-2 w-full mb-8" />

      {/* Question */}
      <div className="mb-8">
        <Skeleton className="h-8 w-2/3 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Answer options */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Skeleton className="h-11 w-24" />
        <Skeleton className="h-11 w-24" />
      </div>
    </div>
  );
}
