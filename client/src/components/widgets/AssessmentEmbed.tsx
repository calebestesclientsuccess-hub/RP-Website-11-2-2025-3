import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfigurableAssessment } from "@/components/ConfigurableAssessment";
import { cn } from "@/lib/utils";
import { widgetVariants } from "@/lib/widgetVariants";
import type { AssessmentConfig } from "@shared/schema";

interface AssessmentEmbedProps {
  assessmentId: string;
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
}

export function AssessmentEmbed({ assessmentId, className, theme, size }: AssessmentEmbedProps) {
  const { data: config, isLoading, error } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/${assessmentId}`],
  });

  // Loading state with skeleton
  if (isLoading) {
    return (
      <Card className={cn(widgetVariants({ theme, size }), className)} data-testid="card-assessment-embed-loading">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" data-testid="skeleton-title" />
          <Skeleton className="h-4 w-full mt-2" data-testid="skeleton-description" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-3" data-testid="skeleton-answer-1" />
          <Skeleton className="h-12 w-full mb-3" data-testid="skeleton-answer-2" />
          <Skeleton className="h-12 w-full" data-testid="skeleton-answer-3" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn(widgetVariants({ theme, size }), className)} data-testid="card-assessment-embed-error">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground" data-testid="text-error-message">
            Failed to load assessment. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state (assessment not found)
  if (!config) {
    return (
      <Card className={cn(widgetVariants({ theme, size }), className)} data-testid="card-assessment-embed-not-found">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground" data-testid="text-not-found-message">
            Assessment not found
          </p>
        </CardContent>
      </Card>
    );
  }

  // Unpublished state
  if (!config.published) {
    return (
      <Card className={cn(widgetVariants({ theme, size }), className)} data-testid="card-assessment-embed-unpublished">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground" data-testid="text-unpublished-message">
            This assessment is not published
          </p>
        </CardContent>
      </Card>
    );
  }

  // Valid, published assessment
  // Shows title/description then renders ConfigurableAssessment
  // Note: Not wrapping in Card to avoid nested Cards (ConfigurableAssessment has its own Card)
  return (
    <div className={className} data-testid="container-assessment-embed">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2" data-testid="text-assessment-title">
          {config.title}
        </h2>
        {config.description && (
          <p className="text-lg text-muted-foreground" data-testid="text-assessment-description">
            {config.description}
          </p>
        )}
      </div>
      <ConfigurableAssessment configSlug={config.slug} mode="inline" />
    </div>
  );
}
