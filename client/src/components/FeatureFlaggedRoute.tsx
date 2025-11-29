import { Route, type RouteProps } from "wouter";
import type { ComponentType, ReactNode } from "react";
import NotFound from "@/pages/not-found";
import { FeatureGate } from "./FeatureGate";

interface FeatureFlaggedRouteProps extends Omit<RouteProps, "component" | "children"> {
  flagKey: string;
  component?: ComponentType<any>;
  children?: ReactNode | ((params: Record<string, string>) => ReactNode);
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function FeatureFlaggedRoute({
  flagKey,
  component: Component,
  children,
  fallback,
  loadingFallback,
  ...routeProps
}: FeatureFlaggedRouteProps) {
  return (
    <Route {...routeProps}>
      {(params) => (
        <FeatureGate
          flagKey={flagKey}
          fallback={fallback ?? <NotFound />}
          loadingFallback={loadingFallback}
        >
          {Component
            ? <Component {...params} />
            : typeof children === "function"
              ? (children as (params: Record<string, string>) => ReactNode)(params)
              : children}
        </FeatureGate>
      )}
    </Route>
  );
}

