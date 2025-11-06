import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAssessmentConfigSchema, type AssessmentConfig } from "@shared/schema";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowBuilder } from "@/components/admin/FlowBuilder";
import { ResultBucketsManager } from "@/components/admin/ResultBucketsManager";
import { DecisionTreeVisualization } from "@/components/admin/DecisionTreeVisualization";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

const formSchema = insertAssessmentConfigSchema;

export default function AssessmentConfigForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/assessments/:id/edit");
  const isEdit = !!params?.id;
  const [openQuestionId, setOpenQuestionId] = useState<string | undefined>();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: config, isLoading: isLoadingConfig } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/${params?.id}`],
    enabled: isEdit && !!params?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      scoringMethod: "decision-tree",
      gateBehavior: "UNGATED",
      published: false,
    },
  });

  useEffect(() => {
    if (config && isEdit) {
      form.reset({
        title: config.title,
        slug: config.slug,
        description: config.description || "",
        scoringMethod: config.scoringMethod,
        gateBehavior: config.gateBehavior,
        published: config.published,
      });
    }
  }, [config, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/assessment-configs", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-configs"] });
      toast({
        title: "Success",
        description: "Assessment created successfully. Now add questions and answers!",
      });
      setLocation(`/admin/assessments/${data.id}/edit`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/assessment-configs/${params?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-configs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${params?.id}`] });
      toast({
        title: "Success",
        description: "Assessment updated successfully",
      });
      setLocation("/admin/assessments");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update assessment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingConfig) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Loading... | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">Loading...</h1>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="flex justify-center items-center py-12" data-testid="loading-form">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Assessment" : "New Assessment"} | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin/assessments")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Assessment" : "New Assessment"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              {isEdit ? (
                <div className="flex gap-6 max-w-7xl mx-auto">
                  {/* Left Column - 70% */}
                  <div className="flex-1 min-w-0" style={{ flex: "0 0 68%" }}>
                    <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic" data-testid="tab-basic">
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger value="flow-builder" data-testid="tab-flow-builder">
                        Flow Builder
                      </TabsTrigger>
                      <TabsTrigger value="results" data-testid="tab-results">
                        Results
                      </TabsTrigger>
                      <TabsTrigger value="submissions" data-testid="tab-submissions">
                        Submissions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="mt-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="GTM Assessment Tool"
                                    data-testid="input-title"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="gtm-assessment"
                                    data-testid="input-slug"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Used in the URL: /assessments/your-slug
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={field.value || ""}
                                    placeholder="Brief description of this assessment"
                                    data-testid="input-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="scoringMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Scoring Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-scoring-method">
                                      <SelectValue placeholder="Select scoring method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="decision-tree" data-testid="option-decision-tree">
                                      Decision Tree (rule-based)
                                    </SelectItem>
                                    <SelectItem value="points" data-testid="option-points">
                                      Points-based
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  How should the assessment calculate results?
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gateBehavior"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gate Behavior</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-gate-behavior">
                                      <SelectValue placeholder="Select gate behavior" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="UNGATED" data-testid="option-ungated">
                                      Ungated (No email required)
                                    </SelectItem>
                                    <SelectItem value="PRE_GATED" data-testid="option-pre-gated">
                                      Pre-Gated (Email before questions)
                                    </SelectItem>
                                    <SelectItem value="POST_GATED" data-testid="option-post-gated">
                                      Post-Gated (Email after questions)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Control when users provide their email: before starting the assessment, after completing it, or not at all
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="published"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Published</FormLabel>
                                  <FormDescription>
                                    Make this assessment available to the public
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-published"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-4">
                            <Button
                              type="submit"
                              disabled={isPending}
                              data-testid="button-submit"
                            >
                              {isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Update Assessment"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setLocation("/admin/assessments")}
                              disabled={isPending}
                              data-testid="button-cancel"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="flow-builder" className="mt-6">
                      <FlowBuilder 
                        assessmentId={params?.id!} 
                        scoringMethod={form.watch("scoringMethod") || config?.scoringMethod}
                        openQuestionId={openQuestionId}
                        onOpenQuestion={setOpenQuestionId}
                      />
                    </TabsContent>

                    <TabsContent value="results" className="mt-6">
                      <ResultBucketsManager 
                        assessmentId={params?.id!} 
                        scoringMethod={form.watch("scoringMethod") || config?.scoringMethod}
                      />
                    </TabsContent>

                    <TabsContent value="submissions" className="mt-6">
                      <SubmissionsTable assessmentId={params?.id!} />
                    </TabsContent>
                  </Tabs>
                  </div>

                  {/* Right Column - 30% - Decision Tree Visualization */}
                  <div className="hidden lg:block" style={{ flex: "0 0 30%" }}>
                    <div className="sticky top-6">
                      {config && (
                        <DecisionTreeVisualization 
                          assessmentId={params?.id!} 
                          config={config}
                          onQuestionClick={setOpenQuestionId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="GTM Assessment Tool"
                                data-testid="input-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="gtm-assessment"
                                data-testid="input-slug"
                              />
                            </FormControl>
                            <FormDescription>
                              Used in the URL: /assessments/your-slug
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value || ""}
                                placeholder="Brief description of this assessment"
                                data-testid="input-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="scoringMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scoring Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-scoring-method">
                                  <SelectValue placeholder="Select scoring method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="decision-tree" data-testid="option-decision-tree">
                                  Decision Tree (rule-based)
                                </SelectItem>
                                <SelectItem value="points" data-testid="option-points">
                                  Points-based
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How should the assessment calculate results?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gateBehavior"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gate Behavior</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-gate-behavior">
                                  <SelectValue placeholder="Select gate behavior" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UNGATED" data-testid="option-ungated">
                                  Ungated (No email required)
                                </SelectItem>
                                <SelectItem value="PRE_GATED" data-testid="option-pre-gated">
                                  Pre-Gated (Email before questions)
                                </SelectItem>
                                <SelectItem value="POST_GATED" data-testid="option-post-gated">
                                  Post-Gated (Email after questions)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Control when users provide their email: before starting the assessment, after completing it, or not at all
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Published</FormLabel>
                              <FormDescription>
                                Make this assessment available to the public
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-published"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          disabled={isPending}
                          data-testid="button-submit"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Assessment"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLocation("/admin/assessments")}
                          disabled={isPending}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
