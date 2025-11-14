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

const formSchema = insertProjectSchema.extend({
  // Only override required fields - let optional fields use backend preprocessors
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required"),
  modalMediaType: z.enum(["video", "carousel"]).default("video"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectForm() {
  const { id: projectId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEdit = !!projectId;

  // State for dynamic arrays
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUrlInput, setMediaUrlInput] = useState("");

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
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && project) {
      form.reset({
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
      });
      setCategories(project.categories || []);
      setMediaUrls(project.modalMediaUrls || []);
    }
  }, [project, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setLocation("/admin/content?type=portfolio");
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
      return response;
    },
    onSuccess: () => {
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
    // Include dynamic arrays in submission
    const submitData = {
      ...data,
      categories,
      modalMediaUrls: mediaUrls,
    };

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData as InsertProject);
    }
  };

  const handleCancel = () => {
    setLocation("/admin/content?type=portfolio");
  };

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      setCategories([...categories, categoryInput.trim()]);
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleAddMediaUrl = () => {
    if (mediaUrlInput.trim()) {
      setMediaUrls([...mediaUrls, mediaUrlInput.trim()]);
      setMediaUrlInput("");
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
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
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Basic Information</h2>
                      
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
                              <FormLabel>Thumbnail URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://example.com/thumbnail.jpg" 
                                  data-testid="input-thumbnailUrl"
                                  disabled={isFormDisabled}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Categories Array */}
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

                    {/* Content Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Project Content</h2>
                      
                      <FormField
                        control={form.control}
                        name="challengeText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Challenge</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the client's challenge..."
                                className="min-h-[100px]"
                                data-testid="textarea-challengeText"
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
                        name="solutionText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Solution</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your solution..."
                                className="min-h-[100px]"
                                data-testid="textarea-solutionText"
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
                        name="outcomeText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outcome</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the results achieved..."
                                className="min-h-[100px]"
                                data-testid="textarea-outcomeText"
                                disabled={isFormDisabled}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Media Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Media Assets</h2>
                      
                      <FormField
                        control={form.control}
                        name="modalMediaType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Media Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isFormDisabled}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-modalMediaType">
                                  <SelectValue placeholder="Select media type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="carousel">Image Carousel</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Media URLs Array */}
                      <div className="space-y-2">
                        <FormLabel>Media URLs</FormLabel>
                        <FormDescription>
                          Add Cloudinary URLs for videos or images
                        </FormDescription>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://res.cloudinary.com/..."
                            value={mediaUrlInput}
                            onChange={(e) => setMediaUrlInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMediaUrl())}
                            disabled={isFormDisabled}
                            data-testid="input-mediaUrl"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddMediaUrl}
                            disabled={isFormDisabled}
                            data-testid="button-add-mediaUrl"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {mediaUrls.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {mediaUrls.map((url, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-accent rounded-md"
                                data-testid={`item-mediaUrl-${index}`}
                              >
                                <span className="text-sm flex-1 truncate">{url}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMediaUrl(index)}
                                  disabled={isFormDisabled}
                                  className="hover:text-destructive"
                                  data-testid={`button-remove-mediaUrl-${index}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Testimonial Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Client Testimonial (Optional)</h2>
                      
                      <FormField
                        control={form.control}
                        name="testimonialText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial Quote</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Client testimonial..."
                                className="min-h-[80px]"
                                data-testid="textarea-testimonialText"
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
                        name="testimonialAuthor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Testimonial Author</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe, CEO"
                                data-testid="input-testimonialAuthor"
                                disabled={isFormDisabled}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-end pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isPending}
                        data-testid="button-submit"
                      >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update Project" : "Create Project"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
