import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface FeatureFlagContextValue {
  flags: Record<string, boolean>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

async function fetchFeatureFlags(): Promise<Record<string, boolean>> {
  const response = await fetch("/api/public/feature-flags", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load feature flags");
  }

  return await response.json();
}

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/public/feature-flags"],
    queryFn: fetchFeatureFlags,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags: data ?? {},
      isLoading,
      isError,
      error: (error as Error) ?? null,
      refetch,
    }),
    [data, isLoading, isError, error, refetch],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlagContext(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlagContext must be used within a FeatureFlagProvider");
  }
  return context;
}

