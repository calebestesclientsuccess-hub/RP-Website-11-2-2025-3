
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeatureFlag } from "@shared/schema";

export default function FeatureFlagsPage() {
  const { toast } = useToast();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: flags, isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["/api/feature-flags"],
  });

  const updateFlagMutation = useMutation({
    mutationFn: async ({ flagKey, enabled }: { flagKey: string; enabled: boolean }) => {
      return await apiRequest("PUT", `/api/feature-flags/${flagKey}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      toast({
        title: "Success",
        description: "Feature flag updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feature flag",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (flagKey: string, enabled: boolean) => {
    updateFlagMutation.mutate({ flagKey, enabled });
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Feature Flags | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Feature Flags</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Toggle Site Features</CardTitle>
                    <CardDescription>
                      Enable or disable features across your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4" data-testid="loading-flags">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : flags && flags.length > 0 ? (
                      <div className="space-y-4">
                        {flags.map((flag) => (
                          <div
                            key={flag.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                            data-testid={`flag-${flag.flagKey}`}
                          >
                            <div className="space-y-0.5">
                              <Label
                                htmlFor={flag.flagKey}
                                className="text-base font-medium cursor-pointer"
                              >
                                {flag.flagName}
                              </Label>
                              {flag.description && (
                                <p className="text-sm text-muted-foreground">
                                  {flag.description}
                                </p>
                              )}
                            </div>
                            <Switch
                              id={flag.flagKey}
                              checked={flag.enabled}
                              onCheckedChange={(checked) => handleToggle(flag.flagKey, checked)}
                              disabled={updateFlagMutation.isPending}
                              data-testid={`switch-${flag.flagKey}`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No feature flags configured yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
