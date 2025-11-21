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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { Loader2, Link as LinkIcon, Lightbulb, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, InsertBlogPost } from "@shared/schema";
import { insertBlogPostSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useEffect, useState } from "react";

const preprocessEmptyString = <T,>(schema: z.ZodType<T>) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, schema);

const formSchema = insertBlogPostSchema.extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  metaTitle: preprocessEmptyString(
    z.string().max(60, "Meta title must be under 60 characters").optional()
  ),
  metaDescription: preprocessEmptyString(
    z
      .string()
      .min(50, "Meta description should be at least 50 characters")
      .max(160, "Meta description must be under 160 characters")
      .optional()
  ),
  canonicalUrl: preprocessEmptyString(z.string().url("Enter a valid URL").optional()),
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

const InternalLinkSuggestions = ({
  postId,
  onInsertLink,
}: {
  postId: string | undefined;
  onInsertLink: (link: { anchorText: string; targetSlug: string }) => void;
}) => {
  const [suggestions, setSuggestions] = useState<
    Array<{ anchorText: string; targetSlug: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("GET", `/api/blog-posts/${postId}/suggested-links`);
        setSuggestions(response.data);
      } catch (error) {
        console.error("Failed to fetch link suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [postId]);

  return (
    <div className="p-4 border rounded-md bg-secondary/50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Link Suggestions</h3>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="space-y-3">
          {suggestions.map((link, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                {link.anchorText}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInsertLink(link)}
                className="ml-2"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                Insert
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No suggestions found.</p>
      )}
    </div>
  );
};

export default function BlogPostForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/blog-posts/:id/edit");
  const isEdit = !!match;
  const postId = params?.id;
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts/by-id", postId],
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
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
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
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        canonicalUrl: post.canonicalUrl || "",
        scheduledFor: post.scheduledFor || undefined,
        published: post.published,
        status,
      });
    }
  }, [post, isEdit, form]);

  const title = form.watch("title");
  const status = form.watch("status");
  const content = form.watch("content");

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
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts?publishedOnly=false"] });
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
      const response = await apiRequest("PUT", `/api/blog-posts/${postId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts?publishedOnly=false"] });
      queryClient.removeQueries({ queryKey: ["/api/blog-posts/by-id", postId] });
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

  const handleGenerateSeo = async () => {
    const body = form.getValues("content");
    if (!body || body.trim().length === 0) {
      toast({
        title: "Content required",
        description: "Add content before generating SEO copy.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSeo(true);
    try {
      const aiResponse = await apiRequest("POST", "/api/ai/text", {
        brandVoice: "Revenue Party authoritative, data-driven, confident",
        topic: form.getValues("title") || "Revenue Party GTM Playbook",
        type: "seo-metadata",
        content: body,
      });
      const metadata = await aiResponse.json();
      if (metadata.slug) {
        form.setValue("slug", slugify(metadata.slug), { shouldDirty: true });
      }
      if (metadata.metaTitle) {
        form.setValue("metaTitle", metadata.metaTitle, { shouldDirty: true });
      }
      if (metadata.metaDescription) {
        form.setValue("metaDescription", metadata.metaDescription, { shouldDirty: true });
      }
      toast({
        title: "SEO suggestions ready",
        description: "Slug and metadata updated with AI recommendations.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate SEO copy",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    const { status: statusField, ...rest } = data;
    const metaTitle = rest.metaTitle?.trim();
    const metaDescription = rest.metaDescription?.trim();
    const canonicalUrl = rest.canonicalUrl?.trim();

    const postData: Partial<InsertBlogPost> = {
      ...rest,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      canonicalUrl: canonicalUrl || undefined,
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

                    <div className="rounded-lg border p-4 space-y-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-base font-semibold">SEO Metadata</h3>
                          <p className="text-sm text-muted-foreground">
                            Provide a compelling SERP snippet or let AI generate one for you.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleGenerateSeo}
                          disabled={isGeneratingSeo}
                          data-testid="button-generate-seo"
                        >
                          {isGeneratingSeo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate SEO
                            </>
                          )}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="GTM Engine: Deploy Elite Pods in 45 Days"
                                data-testid="input-meta-title"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(field.value?.length ?? 0)}/60 characters
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value || ""}
                                rows={3}
                                placeholder="Build a GTM engine that multiplies pipeline 3-5x in 90 days..."
                                data-testid="textarea-meta-description"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(field.value?.length ?? 0)}/160 characters
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="canonicalUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canonical URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="https://revenueparty.com/blog/gtm-engine"
                                data-testid="input-canonical-url"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Leave blank to use the live URL automatically.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-2">
                                <RichTextEditor
                                  content={field.value}
                                  onChange={field.onChange}
                                  placeholder="Write your blog post content here..."
                                />
                              </div>
                              <div className="col-span-1">
                                <InternalLinkSuggestions
                                  postId={postId}
                                  onInsertLink={(link) => {
                                    field.onChange(
                                      content + `\n\n[${link.anchorText}](/blog/${link.targetSlug})`
                                    );
                                  }}
                                />
                              </div>
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