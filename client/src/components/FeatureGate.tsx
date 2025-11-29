import type { ReactNode } from "react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

interface FeatureGateProps {
  flagKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function FeatureGate({
  flagKey,
  children,
  fallback = null,
  loadingFallback = null,
}: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureFlag(flagKey);

  if (isLoading) {
    return loadingFallback ?? null;
  }

  if (!isEnabled) {
    return fallback ?? null;
  }

  return <>{children}</>;
}

