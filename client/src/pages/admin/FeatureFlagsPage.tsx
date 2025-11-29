
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface FeatureFlagDefinitionResponse {
  id?: string;
  key: string;
  name: string;
  description?: string;
  scope: string;
  defaultEnabled: boolean;
  enabled: boolean;
}

interface CreateFlagPayload {
  flagKey: string;
  flagName?: string;
  description?: string;
  enabled?: boolean;
}

const initialFlagForm = {
  flagKey: "",
  flagName: "",
  description: "",
  enabled: false,
};

export default function FeatureFlagsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newFlag, setNewFlag] = useState(initialFlagForm);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: flags, isLoading } = useQuery<FeatureFlagDefinitionResponse[]>({
    queryKey: ["/api/feature-flags/definitions"],
  });

  const filteredFlags = useMemo(() => {
    if (!flags) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return flags;
    return flags.filter((flag) => {
      const haystack = `${flag.name} ${flag.key} ${flag.description ?? ""} ${flag.scope}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [flags, searchTerm]);

  const updateFlagMutation = useMutation({
    mutationFn: async ({ flagKey, enabled }: { flagKey: string; enabled: boolean }) => {
      return await apiRequest("PUT", `/api/feature-flags/${flagKey}`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags/definitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/feature-flags"] });
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

  const createFlagMutation = useMutation({
    mutationFn: async (payload: CreateFlagPayload) => {
      return await apiRequest("POST", "/api/feature-flags", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feature-flags/definitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/feature-flags"] });
      toast({
        title: "Feature flag created",
        description: "The flag has been added and is ready to toggle.",
      });
      setNewFlag(initialFlagForm);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create feature flag",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (flagKey: string, enabled: boolean) => {
    updateFlagMutation.mutate({ flagKey, enabled });
  };

  const handleCreateFlag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKey = newFlag.flagKey.trim();

    if (!trimmedKey) {
      toast({
        title: "Flag key is required",
        description: "Please provide a unique flag key.",
        variant: "destructive",
      });
      return;
    }

    createFlagMutation.mutate({
      flagKey: trimmedKey.toLowerCase(),
      flagName: newFlag.flagName.trim() || undefined,
      description: newFlag.description.trim() || undefined,
      enabled: newFlag.enabled,
    });
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
                  <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Toggle Site Features</CardTitle>
                      <CardDescription>
                        Enable or disable features across your site
                      </CardDescription>
                    </div>
                    <div className="w-full lg:w-80">
                      <Label htmlFor="flag-search" className="sr-only">
                        Search feature flags
                      </Label>
                      <Input
                        id="flag-search"
                        type="search"
                        placeholder="Search by name, key, or scope"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4" data-testid="loading-flags">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ) : flags && flags.length > 0 ? (
                      filteredFlags.length > 0 ? (
                        <div className="space-y-4">
                          {filteredFlags.map((flag) => (
                            <div
                              key={flag.id ?? flag.key}
                              className="flex flex-col gap-4 p-4 border rounded-lg md:flex-row md:items-center md:justify-between"
                              data-testid={`flag-${flag.key}`}
                            >
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-medium">{flag.name}</span>
                                  <Badge variant="outline">{flag.scope}</Badge>
                                  <Badge variant={flag.defaultEnabled ? "secondary" : "outline"}>
                                    Default: {flag.defaultEnabled ? "On" : "Off"}
                                  </Badge>
                                </div>
                                {flag.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {flag.description}
                                  </p>
                                )}
                                <p className="text-xs font-mono text-muted-foreground">
                                  {flag.key}
                                </p>
                              </div>
                              <Switch
                                id={flag.key}
                                checked={flag.enabled}
                                onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                                disabled={updateFlagMutation.isPending}
                                data-testid={`switch-${flag.key}`}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No feature flags match your search
                        </p>
                      )
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No feature flags configured yet
                      </p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Create Feature Flag</CardTitle>
                    <CardDescription>
                      Add experimental flags for previews or QA. Registry-managed flags still require code changes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleCreateFlag}>
                      <div className="space-y-2">
                        <Label htmlFor="flagKey">Flag Key</Label>
                        <Input
                          id="flagKey"
                          value={newFlag.flagKey}
                          onChange={(event) =>
                            setNewFlag((prev) => ({ ...prev, flagKey: event.target.value }))
                          }
                          placeholder="e.g. page-new-preview"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flagName">Display Name</Label>
                        <Input
                          id="flagName"
                          value={newFlag.flagName}
                          onChange={(event) =>
                            setNewFlag((prev) => ({ ...prev, flagName: event.target.value }))
                          }
                          placeholder="Marketing Preview Page"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flagDescription">Description</Label>
                        <Textarea
                          id="flagDescription"
                          value={newFlag.description}
                          onChange={(event) =>
                            setNewFlag((prev) => ({ ...prev, description: event.target.value }))
                          }
                          placeholder="Explain what this flag controls for your team."
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <Label htmlFor="flagEnabled">Start Enabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Choose the initial rollout state.
                          </p>
                        </div>
                        <Switch
                          id="flagEnabled"
                          checked={newFlag.enabled}
                          onCheckedChange={(checked) =>
                            setNewFlag((prev) => ({ ...prev, enabled: checked }))
                          }
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={createFlagMutation.isPending}
                        data-testid="button-create-flag"
                      >
                        {createFlagMutation.isPending ? "Creating..." : "Create Flag"}
                      </Button>
                    </form>
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
