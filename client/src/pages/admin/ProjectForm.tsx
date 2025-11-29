import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { zodResolver } from "@hookform/resolvers/zod";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertProjectSchema, type InsertProject, type Project } from "@shared/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Loader2, X, Plus } from "lucide-react";
import ProjectSceneEditor from "./ProjectSceneEditor";
import { Layer2SectionEditor } from "@/components/admin/Layer2SectionEditor";
import { Layer2Preview } from "@/components/admin/Layer2Preview";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface Layer2Section {
  id: string;
  heading: string;
  body: string;
  orderIndex: number;
  mediaType: "none" | "image" | "video" | "image-carousel" | "video-carousel" | "mixed-carousel";
  mediaConfig?: {
    mediaId?: string;
    url?: string;
    items?: Array<{
      mediaId?: string;
      url: string;
      type: "image" | "video";
      caption?: string;
    }>;
  };
}

const formSchema = insertProjectSchema.extend({
  // Only override required fields - let optional fields use backend preprocessors
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  modalMediaType: z.enum(["video", "carousel"]).default("video"),
  expansionLayout: z.enum(["vertical", "cinematic"]).default("vertical"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectForm() {
  const { id: projectId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Don't use const - this needs to be reactive to projectId changes
  const isEdit = !!projectId;

  // State for dynamic arrays
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  
  // State for Layer 2 sections
  const [layer2Sections, setLayer2Sections] = useState<Layer2Section[]>([]);
  const [layer2SectionsLoaded, setLayer2SectionsLoaded] = useState(false);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: isEdit,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      title: "",
      clientName: "" as any,
      thumbnailUrl: "" as any,
      categories: [],
      challengeText: "" as any,
      solutionText: "" as any,
      outcomeText: "" as any,
      modalMediaType: "video",
      modalMediaUrls: [],
      testimonialText: "" as any,
      testimonialAuthor: "" as any,
      expansionLayout: "vertical" as const,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && project) {
      const formData = {
        slug: project.slug,
        title: project.title,
        clientName: project.clientName || "",
        thumbnailUrl: project.thumbnailUrl || "",
        categories: project.categories || [],
        challengeText: project.challengeText || "",
        solutionText: project.solutionText || "",
        outcomeText: project.outcomeText || "",
        modalMediaType: (project.modalMediaType as "video" | "carousel") || "video",
        modalMediaUrls: project.modalMediaUrls || [],
        testimonialText: project.testimonialText || "",
        testimonialAuthor: project.testimonialAuthor || "",
        expansionLayout: (project.expansionLayout as "vertical" | "cinematic") || "vertical",
      };
      form.reset(formData);
      setCategories(project.categories || []);
      setMediaUrls(project.modalMediaUrls || []);
    }
  }, [project, isEdit, form]);

  // Initialize Layer 2 sections with default preset
  useEffect(() => {
    if (!isEdit && layer2Sections.length === 0) {
      // Default to 3-section classic preset for new projects
      setLayer2Sections([
        {
          id: `temp-${Date.now()}-0`,
          heading: "The Challenge",
          body: "",
          orderIndex: 0,
          mediaType: "none",
          mediaConfig: undefined,
        },
        {
          id: `temp-${Date.now()}-1`,
          heading: "Our Solution",
          body: "",
          orderIndex: 1,
          mediaType: "none",
          mediaConfig: undefined,
        },
        {
          id: `temp-${Date.now()}-2`,
          heading: "The Outcome",
          body: "",
          orderIndex: 2,
          mediaType: "none",
          mediaConfig: undefined,
        },
      ]);
      setLayer2SectionsLoaded(true);
    }
  }, [isEdit, layer2Sections.length]);

  // Fetch Layer 2 sections when editing
  useEffect(() => {
    if (isEdit && projectId && !layer2SectionsLoaded) {
      fetch(`/api/projects/${projectId}/layer2-sections`)
        .then((res) => res.json())
        .then((data) => {
          setLayer2Sections(data);
          setLayer2SectionsLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to load Layer 2 sections:", err);
          setLayer2SectionsLoaded(true); // Mark as loaded even on error
        });
    }
  }, [isEdit, projectId, layer2SectionsLoaded]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return await response.json();
    },
    onSuccess: async (data) => {
      // Save Layer 2 sections for new project
      if (layer2Sections.length > 0) {
        try {
          await saveLayer2Sections(data.id);
        } catch (error) {
          console.error("Failed to save Layer 2 sections:", error);
          toast({
            title: "Warning",
            description: "Project created but Layer 2 sections failed to save",
            variant: "destructive",
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully with Layer 2 sections.",
      });
      // Navigate to edit mode so user can add scenes
      setLocation(`/admin/projects/${data.id}/edit`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertProject>) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      // Also save Layer 2 sections if they've been modified
      if (layer2Sections.length > 0) {
        await saveLayer2Sections();
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      setLocation("/admin/content?type=portfolio");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Schema preprocessors handle blank → null
    // Arrays are already synced via form.setValue
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data as InsertProject);
    }
  };

  const handleCancel = () => {
    setLocation("/admin/content?type=portfolio");
  };

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const newCategories = [...categories, categoryInput.trim()];
      setCategories(newCategories);
      form.setValue('categories', newCategories as any);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    form.setValue('categories', newCategories as any);
  };

  const handleAddMediaUrl = () => {
    if (mediaUrlInput.trim()) {
      const newMediaUrls = [...mediaUrls, mediaUrlInput.trim()];
      setMediaUrls(newMediaUrls);
      form.setValue('modalMediaUrls', newMediaUrls as any);
      setMediaUrlInput("");
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    const newMediaUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(newMediaUrls);
    form.setValue('modalMediaUrls', newMediaUrls as any);
  };

  const saveLayer2Sections = async (targetProjectId?: string) => {
    const pid = targetProjectId || projectId;
    if (!pid) return;

    try {
      // Delete all existing sections and recreate (simplest approach)
      const existingSections = await fetch(`/api/projects/${pid}/layer2-sections`).then(r => r.json());
      
      for (const section of existingSections) {
        // Only delete if min 3 sections will remain or we're recreating all
        if (existingSections.length > 3 || layer2Sections.length >= 3) {
          await apiRequest("DELETE", `/api/projects/${pid}/layer2-sections/${section.id}`).catch(() => {});
        }
      }

      // Create new sections
      for (const section of layer2Sections) {
        const payload = {
          heading: section.heading,
          body: section.body,
          orderIndex: section.orderIndex,
          mediaType: section.mediaType,
          mediaConfig: section.mediaConfig,
        };

        await apiRequest("POST", `/api/projects/${pid}/layer2-sections`, payload);
      }
    } catch (error) {
      console.error("Failed to save Layer 2 sections:", error);
      throw error;
    }
  };

  if (isEdit && isLoading) {
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

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isFormDisabled = isPending || (isEdit && isLoading);

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Project" : "New Project"} | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Project" : "New Project"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Layer 2: Expansion Sections - PRIMARY EDITOR */}
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">Portfolio Editor</h2>

                      {/* Project Identity - Collapsible */}
                      <details className="mt-6 rounded-lg border bg-card" open>
                        <summary className="p-4 cursor-pointer font-medium flex items-center justify-between hover:bg-muted/50 rounded-t-lg">
                          <span>Project Identity</span>
                          <span className="text-xs text-muted-foreground">Title, Hero, Categories</span>
                        </summary>
                        <div className="p-4 pt-0 space-y-4 border-t">
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Project Title *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="TechFlow AI Platform" 
                                      data-testid="input-title"
                                      disabled={isFormDisabled}
                                      {...field} 
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
                                  <FormLabel>URL Slug *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="techflow-ai-platform" 
                                      data-testid="input-slug"
                                      disabled={isFormDisabled}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Lowercase letters, numbers, and hyphens only
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="clientName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Client Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="TechFlow Inc." 
                                      data-testid="input-clientName"
                                      disabled={isFormDisabled}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="thumbnailUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hero Media</FormLabel>
                                  <FormControl>
                                    <MediaPicker
                                      value={field.value ? [field.value] : []}
                                      onChange={(urls) => field.onChange(urls[0] || "")}
                                      mode="single"
                                      mediaTypeFilter="all"
                                      placeholder="Select hero image or video"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Categories */}
                          <div className="space-y-2">
                            <FormLabel>Categories</FormLabel>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add category tag"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                disabled={isFormDisabled}
                                data-testid="input-category"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddCategory}
                                disabled={isFormDisabled}
                                data-testid="button-add-category"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {categories.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {categories.map((category, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 px-3 py-1 bg-accent rounded-md"
                                    data-testid={`badge-category-${index}`}
                                  >
                                    <span className="text-sm">{category}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCategory(index)}
                                      disabled={isFormDisabled}
                                      className="hover:text-destructive"
                                      data-testid={`button-remove-category-${index}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </details>

                      {/* Expansion Style Selector */}
                      <div className="mt-6 p-4 rounded-lg border bg-card">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="font-medium">Expansion Style</h3>
                            <p className="text-sm text-muted-foreground">How this project opens when clicked</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => form.setValue("expansionLayout", "vertical")}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                form.watch("expansionLayout") === "vertical"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <svg className="w-6 h-4" viewBox="0 0 24 16">
                                <rect x="2" y="2" width="20" height="4" rx="1" fill="currentColor" opacity="0.3" />
                                <rect x="2" y="8" width="20" height="6" rx="1" fill="currentColor" opacity="0.6" />
                              </svg>
                              <span className="text-sm font-medium">Vertical</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => form.setValue("expansionLayout", "cinematic")}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                form.watch("expansionLayout") === "cinematic"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <svg className="w-6 h-4" viewBox="0 0 24 16">
                                <rect x="2" y="2" width="8" height="12" rx="1" fill="currentColor" opacity="0.2" />
                                <rect x="12" y="2" width="10" height="12" rx="1" fill="currentColor" opacity="0.6" />
                              </svg>
                              <span className="text-sm font-medium">Cinematic</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Vertical expands inline below the card. Cinematic opens a slide-over panel (desktop only).
                        </p>
                      </div>

                      {/* Content Sections Header */}
                      <div className="mt-8 mb-4">
                        <h3 className="text-lg font-semibold">Content Sections</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure 3-5 sections with flexible media options (images, videos, or carousels).
                        </p>
                      </div>
                    </div>
                    {layer2SectionsLoaded ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Editor */}
                        <div>
                          <Layer2SectionEditor
                            sections={layer2Sections}
                            onChange={setLayer2Sections}
                            projectId={projectId || 'temp'}
                          />
                        </div>

                        {/* Preview */}
                        <div>
                          <Layer2Preview 
                            sections={layer2Sections} 
                            expansionLayout={form.watch("expansionLayout")}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {/* Save button for Layer 2 changes */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => form.handleSubmit(onSubmit)()}
                        disabled={isPending}
                      >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Save All Changes" : "Create Project"}
                      </Button>
                    </div>
                  </div>

                  {/* Scrollytelling Scene Editor (Layer 3) - Only Available in Edit Mode */}
                  {isEdit && projectId && typeof projectId === 'string' && projectId !== 'undefined' && (
                    <div className="mt-12 border-t pt-8">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold">Layer 3: Scrollytelling Experience</h2>
                        <p className="text-muted-foreground mt-2">
                          This content appears when a visitor clicks "Experience the Full Story" from the expansion view (Layer 2). 
                          Create immersive scroll-driven scenes with animations and cinematic effects.
                        </p>
                      </div>
                      <ProjectSceneEditor projectId={projectId} />
                    </div>
                  )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
