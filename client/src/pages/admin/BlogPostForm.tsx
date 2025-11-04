import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, InsertBlogPost } from "@shared/schema";
import { insertBlogPostSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useEffect } from "react";

const formSchema = insertBlogPostSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
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

export default function BlogPostForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/blog-posts/:id/edit");
  const isEdit = !!match;
  const postId = params?.id;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", postId],
    enabled: isEdit && !!postId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      featuredImage: "",
      videoUrl: "",
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
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        featuredImage: post.featuredImage || "",
        videoUrl: post.videoUrl || "",
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
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/blog-posts", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      setLocation("/admin/blog-posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertBlogPost>) => {
      const response = await apiRequest("PATCH", `/api/blog-posts/${postId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts", postId] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setLocation("/admin/blog-posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    const { status: statusField, ...rest } = data;

    const postData: Partial<InsertBlogPost> = {
      ...rest,
      published: statusField === "published",
      scheduledFor: statusField === "scheduled" ? rest.scheduledFor : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(postData);
    } else {
      createMutation.mutate(postData as InsertBlogPost);
    }
  };

  const handleCancel = () => {
    setLocation("/admin/blog-posts");
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

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Post" : "New Post"} | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter post title"
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
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="post-slug"
                              data-testid="input-slug"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Author name"
                              data-testid="input-author"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt *</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Brief summary of the post"
                              rows={3}
                              data-testid="input-excerpt"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content *</FormLabel>
                          <FormControl>
                            <div data-testid="editor-content">
                              <RichTextEditor
                                content={field.value}
                                onChange={field.onChange}
                                placeholder="Write your blog post content here..."
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="https://example.com/image.jpg"
                              data-testid="input-featured-image"
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
                          <FormLabel>Video URL (YouTube/Vimeo)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="https://youtube.com/watch?v=..."
                              data-testid="input-video-url"
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
                              {...field}
                              value={field.value || ""}
                              placeholder="e.g., Sales, Marketing, Strategy"
                              data-testid="input-category"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            data-testid="select-status"
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-status-trigger">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft" data-testid="option-draft">
                                Draft
                              </SelectItem>
                              <SelectItem value="scheduled" data-testid="option-scheduled">
                                Scheduled
                              </SelectItem>
                              <SelectItem value="published" data-testid="option-published">
                                Published
                              </SelectItem>
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
                            <FormLabel>Scheduled Publish Date *</FormLabel>
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
                                data-testid="input-scheduled-date"
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
                        data-testid="button-save"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEdit ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>{isEdit ? "Update Post" : "Create Post"}</>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                        data-testid="button-cancel"
                      >
                        Cancel
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
