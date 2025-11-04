import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VideoPost, InsertVideoPost } from "@shared/schema";
import { insertVideoPostSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = insertVideoPostSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  videoUrl: z.string().min(1, "Video URL is required"),
  thumbnailUrl: z.string().min(1, "Thumbnail URL is required"),
  author: z.string().min(1, "Author is required"),
  status: z.enum(["draft", "scheduled", "published"]),
});

type FormValues = z.infer<typeof formSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function VideoPostForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/video-posts/:id/edit");
  const isEdit = !!match;
  const postId = params?.id;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: post, isLoading } = useQuery<VideoPost>({
    queryKey: ["/api/video-posts", postId],
    enabled: isEdit && !!postId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      platform: "",
      duration: "",
      author: "",
      category: "",
      scheduledFor: undefined,
      published: false,
      status: "draft",
    },
  });

  useEffect(() => {
    if (post && isEdit) {
      const status = post.published
        ? "published"
        : post.scheduledFor
        ? "scheduled"
        : "draft";

      form.reset({
        title: post.title,
        slug: post.slug,
        description: post.description,
        videoUrl: post.videoUrl,
        thumbnailUrl: post.thumbnailUrl || "",
        platform: post.platform || "",
        duration: post.duration || "",
        author: post.author,
        category: post.category || "",
        scheduledFor: post.scheduledFor || undefined,
        published: post.published,
        status,
      });
    }
  }, [post, isEdit, form]);

  const title = form.watch("title");
  const status = form.watch("status");

  useEffect(() => {
    if (title && !isEdit) {
      const newSlug = slugify(title);
      form.setValue("slug", newSlug);
    }
  }, [title, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertVideoPost) => {
      const response = await apiRequest("POST", "/api/video-posts", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-posts"] });
      toast({
        title: "Success",
        description: "Video post created successfully",
      });
      setLocation("/admin/video-posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create video post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertVideoPost>) => {
      const response = await apiRequest("PATCH", `/api/video-posts/${postId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/video-posts", postId] });
      toast({
        title: "Success",
        description: "Video post updated successfully",
      });
      setLocation("/admin/video-posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update video post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    const { status: statusField, ...rest } = data;

    const postData: Partial<InsertVideoPost> = {
      ...rest,
      published: statusField === "published",
      scheduledFor: statusField === "scheduled" ? rest.scheduledFor : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(postData);
    } else {
      createMutation.mutate(postData as InsertVideoPost);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Video Post" : "New Video Post"} | Admin Dashboard</title>
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
                onClick={() => setLocation("/admin/video-posts")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Video Post" : "New Video Post"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                {isLoading && isEdit ? (
                  <div className="flex justify-center items-center py-12" data-testid="loading-form">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
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
                                placeholder="Enter video title"
                                {...field}
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
                                placeholder="video-slug"
                                {...field}
                                data-testid="input-slug"
                              />
                            </FormControl>
                            <FormDescription>
                              URL-friendly version of the title
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
                                placeholder="Enter video description"
                                rows={5}
                                {...field}
                                data-testid="input-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                {...field}
                                data-testid="input-video-url"
                              />
                            </FormControl>
                            <FormDescription>
                              YouTube or Vimeo URL
                            </FormDescription>
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
                                {...field}
                                data-testid="input-thumbnail-url"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Platform</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-platform">
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="YouTube" data-testid="option-youtube">YouTube</SelectItem>
                                  <SelectItem value="Vimeo" data-testid="option-vimeo">Vimeo</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="MM:SS"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-duration"
                                />
                              </FormControl>
                              <FormDescription>Format: MM:SS</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="author"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Author</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Author name"
                                  {...field}
                                  data-testid="input-author"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Category"
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-category"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft" data-testid="option-draft">Draft</SelectItem>
                                <SelectItem value="scheduled" data-testid="option-scheduled">Scheduled</SelectItem>
                                <SelectItem value="published" data-testid="option-published">Published</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {status === "scheduled" && (
                        <FormField
                          control={form.control}
                          name="scheduledFor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scheduled Publish Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  {...field}
                                  value={
                                    field.value
                                      ? new Date(field.value).toISOString().slice(0, 16)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value ? new Date(value) : undefined);
                                  }}
                                  data-testid="input-scheduled-for"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={isPending}
                          data-testid="button-submit"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {isEdit ? "Updating..." : "Creating..."}
                            </>
                          ) : (
                            <>{isEdit ? "Update Video Post" : "Create Video Post"}</>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLocation("/admin/video-posts")}
                          disabled={isPending}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
