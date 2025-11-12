import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import type { Campaign } from "@shared/schema";
import { filterCampaigns } from "./filterCampaigns";

/**
 * Default tenant ID - will be replaced with actual tenant resolution in multi-tenant implementation
 * For now, this matches the server-side DEFAULT_TENANT_ID
 */
const DEFAULT_TENANT_ID = "tnt_revenueparty_default";

/**
 * Get the current tenant ID
 * In the future, this will extract from:
 * - Subdomain (acme.revenueparty.com → "acme")
 * - JWT token
 * - Request context
 * 
 * For now, returns the default tenant ID
 */
export function getTenantId(): string {
  // TODO: Extract from subdomain or auth context when multi-tenancy is enabled
  return DEFAULT_TENANT_ID;
}

/**
 * Get the React Query cache key for campaigns
 * Keyed by tenantId to enable multi-tenant support
 */
export function getCampaignsCacheKey(tenantId: string = DEFAULT_TENANT_ID): [string, string] {
  return ["/api/public/campaigns", tenantId];
}

interface UseCampaignsOptions {
  zone?: string;
  pageNames?: string[];
  displayAs?: "inline" | "popup";
  enabled?: boolean;
}

/**
 * Custom hook to fetch and filter campaigns from the application-level cache
 * 
 * This hook provides access to the global campaign cache that's prefetched at app startup.
 * It filters campaigns client-side based on zone, page, and display type.
 * 
 * Benefits:
 * - Eliminates redundant API calls (10+ requests → 1 request)
 * - Tenant-aware caching for future multi-tenancy
 * - Client-side filtering for instant updates
 * 
 * @param options.zone - Target zone to filter by (e.g., "hero", "sidebar")
 * @param options.pageNames - Array of page names to match (e.g., ["home", "all-blog-posts"])
 * @param options.displayAs - Display type filter ("inline" or "popup")
 * @param options.enabled - Whether to enable the query (default: true)
 */
export function useCampaigns({
  zone,
  pageNames,
  displayAs,
  enabled = true,
}: UseCampaignsOptions = {}) {
  const tenantId = getTenantId();
  const queryKey = getCampaignsCacheKey(tenantId);

  // Fetch ALL campaigns for this tenant (shared cache)
  const { data: allCampaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/public/campaigns", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Filter campaigns client-side using shared filtering logic
  // This ensures WidgetZone skeleton and useCampaigns use identical filtering
  const filteredCampaigns = allCampaigns ? filterCampaigns(allCampaigns, {
    zone,
    pageNames,
    displayAs,
  }) : [];

  return {
    campaigns: filteredCampaigns || [],
    allCampaigns: allCampaigns || [],
    isLoading,
    error,
  };
}

/**
 * Component to prefetch campaigns at application bootstrap
 * 
 * This component ensures campaigns are loaded into the React Query cache
 * before any WidgetZone or PopupEngine components try to access them.
 * 
 * Place this component near the root of your app (in App.tsx) to enable
 * the global campaign cache.
 */
export function CampaignBootstrap({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const tenantId = getTenantId();
  const queryKey = getCampaignsCacheKey(tenantId);

  useEffect(() => {
    // Prefetch campaigns on mount if not already in cache
    queryClient.ensureQueryData({
      queryKey,
      queryFn: async () => {
        const response = await fetch("/api/public/campaigns", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to prefetch campaigns");
        }
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient, tenantId]);

  return children;
}

/**
 * Invalidate the campaigns cache
 * 
 * Call this function after creating, updating, or deleting a campaign
 * to ensure the cache is refreshed.
 * 
 * @param queryClient - React Query client instance
 * @param tenantId - Optional tenant ID (defaults to current tenant)
 */
export async function invalidateCampaignsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string = DEFAULT_TENANT_ID
) {
  const queryKey = getCampaignsCacheKey(tenantId);
  await queryClient.invalidateQueries({ queryKey });
}
