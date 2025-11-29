import { useFeatureFlagContext } from "@/context/FeatureFlagContext";
import { getFeatureFlagDefinition } from "@shared/feature-flags";

interface UseFeatureFlagResult {
  isEnabled: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook to check if a feature flag is enabled
 * Pulls from the FeatureFlagProvider to prevent flash-of-content
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
  const { flags, isLoading, isError, error } = useFeatureFlagContext();
  const definition = getFeatureFlagDefinition(flagKey);
  const isEnabled = flags?.[flagKey] ?? definition?.defaultEnabled ?? false;

  return {
    isEnabled,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
