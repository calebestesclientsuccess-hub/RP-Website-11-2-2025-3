import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { WidgetConfig } from "@shared/schema";

const widgetConfigFormSchema = z.object({
  widgetType: z.enum(["calculator", "assessment"], {
    required_error: "Please select a widget type",
  }),
  enabled: z.boolean().default(true),
  position: z.string().default("bottom-right"),
});

type WidgetConfigFormData = z.infer<typeof widgetConfigFormSchema>;

export default function WidgetConfigPage() {
  const { toast } = useToast();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Fetch current widget config
  const { data: widgetConfig, isLoading } = useQuery<WidgetConfig>({
    queryKey: ["/api/widget-config"],
  });

  // Form setup
  const form = useForm<WidgetConfigFormData>({
    resolver: zodResolver(widgetConfigFormSchema),
    defaultValues: {
      widgetType: "calculator",
      enabled: true,
      position: "bottom-right",
    },
    values: widgetConfig ? {
      widgetType: widgetConfig.widgetType as "calculator" | "assessment",
      enabled: widgetConfig.enabled,
      position: widgetConfig.position,
    } : undefined,
  });

  // Update widget config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (data: WidgetConfigFormData) => {
      return await apiRequest("POST", "/api/widget-config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/widget-config"] });
      toast({
        title: "Success",
        description: "Widget configuration updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update widget configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WidgetConfigFormData) => {
    updateConfigMutation.mutate(data);
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Widget Settings | CMS</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Widget Settings</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="text-card-title">Floating Widget Configuration</CardTitle>
                    <CardDescription data-testid="text-card-description">
                      Choose which widget appears in the bottom-right corner of your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4" data-testid="loading-skeleton">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-20" />
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="widgetType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-widget-type">Widget Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                  value={field.value}
                                  data-testid="select-widget-type"
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="trigger-widget-type">
                                      <SelectValue placeholder="Select a widget type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="calculator" data-testid="option-calculator">
                                      ROI Calculator
                                    </SelectItem>
                                    <SelectItem value="assessment" data-testid="option-assessment">
                                      GTM Assessment
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription data-testid="description-widget-type">
                                  {field.value === "calculator" 
                                    ? "Display the ROI Calculator widget that helps visitors calculate their potential savings"
                                    : "Display the GTM Assessment widget that helps visitors evaluate their go-to-market readiness"}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {widgetConfig && (
                            <div className="p-4 bg-muted rounded-md" data-testid="current-config">
                              <h3 className="text-sm font-semibold mb-2">Current Configuration</h3>
                              <dl className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Widget Type:</dt>
                                  <dd className="font-medium" data-testid="text-current-widget-type">
                                    {widgetConfig.widgetType === "calculator" ? "ROI Calculator" : "GTM Assessment"}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Status:</dt>
                                  <dd className="font-medium" data-testid="text-current-status">
                                    {widgetConfig.enabled ? "Enabled" : "Disabled"}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-muted-foreground">Last Updated:</dt>
                                  <dd className="font-medium" data-testid="text-last-updated">
                                    {new Date(widgetConfig.updatedAt).toLocaleString()}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          )}

                          <Button 
                            type="submit" 
                            disabled={updateConfigMutation.isPending}
                            data-testid="button-save-config"
                          >
                            {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                          </Button>
                        </form>
                      </Form>
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
