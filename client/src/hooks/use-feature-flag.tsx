import { useQuery } from '@tanstack/react-query';

interface FeatureFlagResponse {
  enabled: boolean;
}

interface UseFeatureFlagResult {
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to check if a feature flag is enabled
 * Prevents flash-of-content by ensuring we know the definitive state before rendering
 * 
 * @param flagKey - The feature flag key to check
 * @returns Object with isEnabled (true only if explicitly enabled), isLoading, isError, and error
 * 
 * Usage:
 * const { isEnabled, isLoading } = useFeatureFlag('revenue-architecture-playbook');
 * 
 * if (isLoading) return <Skeleton />;
 * if (!isEnabled) return null;
 * 
 * return <YourComponent />;
 */
export function useFeatureFlag(flagKey: string): UseFeatureFlagResult {
  const { data, isLoading, isError, error } = useQuery<FeatureFlagResponse>({
    queryKey: [`/api/public/feature-flags/${flagKey}`],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // Consider flag data fresh for 5 minutes
  });

  return {
    isEnabled: data?.enabled === true, // Explicitly true, not just truthy
    isLoading,
    isError,
    error: error as Error | null,
  };
}
