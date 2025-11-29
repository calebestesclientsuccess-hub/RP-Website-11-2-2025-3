import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Target,
  Building2,
  MessageSquareQuote,
  X,
  Plus,
  Rocket,
  Save,
  FileText,
  LayoutList,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StoryBeatCard, getBeatStatus } from "@/components/admin/StoryBeatCard";
import { ProofStrength } from "@/components/admin/ProofStrength";
import { PortfolioPreview, type PortfolioPreviewData } from "@/components/admin/PortfolioPreview";
import { PublishModal } from "@/components/admin/PublishModal";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ContentSectionCard, createDefaultSection, type SectionData, type MediaType } from "@/components/admin/ContentSectionCard";
import { StyleControls, type StyleOverrides, DEFAULT_STYLES } from "@/components/admin/StyleControls";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

const BODY_CHAR_LIMIT = 2000;

// Layout config schema
const layoutConfigSchema = z.object({
  mediaSize: z.enum(["standard", "immersive"]).optional(),
  mediaPosition: z.enum(["above", "below", "left", "right"]).optional(),
  textWidth: z.number().min(30).max(70).optional(),
  spacing: z.enum(["tight", "normal", "loose"]).optional(),
}).optional();

// Section data schema
const sectionSchema = z.object({
  heading: z.string(),
  body: z
    .string()
    .max(BODY_CHAR_LIMIT, `Body must be under ${BODY_CHAR_LIMIT} characters`),
  mediaType: z.enum(["none", "image", "video", "carousel"]),
  mediaUrls: z.array(z.string()),
  layoutConfig: layoutConfigSchema,
});

// Style overrides schema
const styleOverridesSchema = z.object({
  enabled: z.boolean(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
});

// Form schema
const portfolioSchema = z.object({
  // Layer 1: Headline (Grid display)
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  thumbnailUrl: z.string().min(1, "Hero media is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),

  // Client Logo (separate)
  clientName: z.string().min(1, "Client name is required"),
  clientLogoUrl: z.string().optional(),

  // 5 Content Sections (consistent structure)
  sections: z.array(sectionSchema).length(5),

  // Testimonial
  testimonialText: z.string().optional(),
  testimonialAuthor: z.string().optional(),

  // Style overrides
  styleOverrides: styleOverridesSchema,
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

const DRAFT_STORAGE_KEY = "portfolio-creator-draft-v2";

// Auto-generate slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// Default sections with suggested headings
const DEFAULT_SECTIONS: SectionData[] = [
  createDefaultSection(),
  createDefaultSection(),
  createDefaultSection(),
  createDefaultSection(),
  createDefaultSection(),
];

// Suggested headings and prompts for each section to guide users
const SECTION_SUGGESTIONS = [
  { title: "The Challenge", prompt: "What problem kept your client up at night?", placeholder: "The Challenge" },
  { title: "Our Approach", prompt: "How did you plan to solve it?", placeholder: "Our Approach" },
  { title: "The Solution", prompt: "What did you actually build?", placeholder: "The Solution" },
  { title: "The Impact", prompt: "What measurable results did you achieve?", placeholder: "The Impact" },
  { title: "Key Learnings", prompt: "What insights emerged from this work?", placeholder: "Key Learnings" },
];

export default function CreatePortfolio() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Track which section is currently open
  const [openSection, setOpenSection] = useState<string>("headline");
  const [categoryInput, setCategoryInput] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [slugStatusMessage, setSlugStatusMessage] = useState("");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Load draft from localStorage with deep merge for styleOverrides
  const loadDraft = useCallback((): Partial<PortfolioFormData> => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        // Deep merge styleOverrides to prevent partial data from causing crashes
        if (draft.styleOverrides) {
          draft.styleOverrides = {
            ...DEFAULT_STYLES,
            ...draft.styleOverrides,
            enabled: Boolean(draft.styleOverrides.enabled),
          };
        }
        return draft;
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
      // Clear corrupted draft data
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    return {};
  }, []);

  // Initialize form with react-hook-form
  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: "",
      slug: "",
      thumbnailUrl: "",
      categories: [],
      clientName: "",
      clientLogoUrl: "",
      sections: DEFAULT_SECTIONS,
      testimonialText: "",
      testimonialAuthor: "",
      styleOverrides: DEFAULT_STYLES,
      ...loadDraft(),
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const watchedSections = watchedValues.sections || [];
  const hasBodyTooLong = watchedSections.some(
    (section) => (section.body?.length || 0) > BODY_CHAR_LIMIT
  );
  const isSlugTaken = slugStatus === "taken";
  const isSlugChecking = slugStatus === "checking";
  const publishBlocked = hasBodyTooLong || isSlugTaken || isSlugChecking;

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(watchedValues));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch (e) {
        console.error("Failed to save draft:", e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedValues]);

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title) {
        const currentSlug = form.getValues("slug");
        // Only auto-generate if slug is empty or matches previous auto-generated value
        if (!currentSlug || currentSlug === slugify(form.getValues("title") || "")) {
          form.setValue("slug", slugify(value.title), { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Debounced slug availability check
  useEffect(() => {
    const slug = watchedValues.slug?.trim();

    if (!slug) {
      setSlugStatus("idle");
      setSlugStatusMessage("");
      return;
    }

    setSlugStatus("checking");
    setSlugStatusMessage("Checking availability…");

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/branding/projects/slug/${encodeURIComponent(slug)}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (res.status === 404) {
          setSlugStatus("available");
          setSlugStatusMessage("Slug is available");
          return;
        }

        if (res.ok) {
          setSlugStatus("taken");
          setSlugStatusMessage("Slug is already in use");
          return;
        }

        throw new Error(await res.text());
      } catch (error: any) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Slug availability check failed:", error);
        setSlugStatus("error");
        setSlugStatusMessage("Couldn't verify slug availability");
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [watchedValues.slug]);

  // Add category
  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const current = form.getValues("categories") || [];
      if (!current.includes(categoryInput.trim())) {
        form.setValue("categories", [...current, categoryInput.trim()], {
          shouldValidate: true,
        });
      }
      setCategoryInput("");
    }
  };

  // Remove category
  const handleRemoveCategory = (category: string) => {
    const current = form.getValues("categories") || [];
    form.setValue(
      "categories",
      current.filter((c) => c !== category),
      { shouldValidate: true }
    );
  };

  // Update a specific section
  const handleSectionChange = (index: number, data: SectionData) => {
    const sections = [...form.getValues("sections")];
    sections[index] = data;
    form.setValue("sections", sections, { shouldValidate: true });
  };

  const parseApiError = (error: Error) => {
    const match = error.message?.match(/^(\d+):\s*(.*)$/s);
    if (!match) {
      return { status: null, body: null };
    }

    const status = Number(match[1]);
    let body: unknown = match[2];
    try {
      body = JSON.parse(match[2]);
    } catch {
      // leave as string
    }

    return { status, body };
  };

  const formatValidationDetails = (details: unknown) => {
    if (!Array.isArray(details)) {
      return null;
    }

    const messages = details
      .map((detail) => {
        if (typeof detail === "string") return detail;
        if (detail && typeof detail === "object" && "message" in detail) {
          const message = (detail as { message?: string }).message;
          return message;
        }
        return null;
      })
      .filter((msg): msg is string => Boolean(msg));

    return messages.length ? messages.join(" ") : null;
  };

  // Create proof items for the strength indicator
  const proofItems = useMemo(() => {
    const data = watchedValues;
    const filledSections = data.sections?.filter(
      (s) => s.heading.trim() && s.body.trim()
    ).length || 0;

    return [
      {
        id: "title",
        label: "Project title is set",
        complete: Boolean(data.title?.trim()),
        required: true,
      },
      {
        id: "thumbnail",
        label: "Hero media captures attention",
        complete: Boolean(data.thumbnailUrl?.trim()),
        required: true,
      },
      {
        id: "categories",
        label: "Categories are tagged",
        complete: Boolean(data.categories && data.categories.length > 0),
        required: true,
      },
      {
        id: "client",
        label: "Client name is credited",
        complete: Boolean(data.clientName?.trim()),
        required: true,
      },
      {
        id: "clientLogo",
        label: "Client logo adds credibility",
        complete: Boolean(data.clientLogoUrl?.trim()),
        required: false,
      },
      {
        id: "sections",
        label: `Content sections (${filledSections}/5 complete)`,
        complete: filledSections >= 3,
        required: true,
      },
      {
        id: "testimonial",
        label: "A voice vouches for you",
        complete: Boolean(
          data.testimonialText?.trim() && data.testimonialAuthor?.trim()
        ),
        required: false,
      },
      {
        id: "sectionMedia",
        label: "Sections include media",
        complete: data.sections?.some((s) => s.mediaUrls.length > 0) || false,
        required: false,
      },
    ];
  }, [watchedValues]);

  // Preview data
  const previewData: PortfolioPreviewData = useMemo(
    () => ({
      title: watchedValues.title || "",
      clientName: watchedValues.clientName || "",
      thumbnailUrl: watchedValues.thumbnailUrl || "",
      categories: watchedValues.categories || [],
      challengeText: watchedValues.sections?.[0]?.body || "",
      solutionText: watchedValues.sections?.[1]?.body || "",
      outcomeText: watchedValues.sections?.[2]?.body || "",
      testimonialText: watchedValues.testimonialText,
      testimonialAuthor: watchedValues.testimonialAuthor,
      heroMediaUrl: watchedValues.sections?.[0]?.mediaUrls?.[0],
    }),
    [watchedValues]
  );

  // Helper to convert mediaUrls to mediaConfig format
  const buildMediaConfig = (section: SectionData) => {
    if (section.mediaType === "none" || section.mediaUrls.length === 0) {
      return {};
    }

    if (section.mediaType === "carousel") {
      // Carousel: use items array
      return {
        items: section.mediaUrls.map((url) => ({
          url,
          type: url.match(/\.(mp4|webm|mov|avi)(\?|$)/i) ? "video" as const : "image" as const,
        })),
      };
    }

    // Single image or video: use url field
    return {
      url: section.mediaUrls[0],
    };
  };

  // Helper to map mediaType to schema format
  const mapMediaType = (section: SectionData): "none" | "image" | "video" | "image-carousel" | "video-carousel" | "mixed-carousel" => {
    if (section.mediaType === "none" || section.mediaUrls.length === 0) return "none";
    if (section.mediaType === "image") return "image";
    if (section.mediaType === "video") return "video";
    if (section.mediaType === "carousel") {
      // Determine carousel type based on content
      const hasImages = section.mediaUrls.some((url) => !url.match(/\.(mp4|webm|mov|avi)(\?|$)/i));
      const hasVideos = section.mediaUrls.some((url) => url.match(/\.(mp4|webm|mov|avi)(\?|$)/i));
      if (hasImages && hasVideos) return "mixed-carousel";
      if (hasVideos) return "video-carousel";
      return "image-carousel";
    }
    return "none";
  };

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      // Determine if hero is video or image
      const isHeroVideo = data.thumbnailUrl?.match(/\.(mp4|webm|mov|avi)(\?|$)/i);
      
      // Step 1: Create the project (Layer 1)
      const projectPayload = {
        title: data.title,
        slug: data.slug,
        clientName: data.clientName,
        clientLogoUrl: data.clientLogoUrl || null,
        thumbnailUrl: data.thumbnailUrl || null,
        categories: data.categories,
        // Use first 3 sections for legacy compatibility
        challengeText: data.sections[0]?.body || "",
        solutionText: data.sections[1]?.body || "",
        outcomeText: data.sections[2]?.body || "",
        testimonialText: data.testimonialText || null,
        testimonialAuthor: data.testimonialAuthor || null,
        modalMediaType: "video",
        modalMediaUrls: [],
        // Hero media type and config
        heroMediaType: isHeroVideo ? "video" : "image",
        heroMediaConfig: isHeroVideo ? {
          videoUrl: data.thumbnailUrl,
          autoplay: true,
          loop: true,
          muted: true,
        } : {},
        // Brand colors (mapped from styleOverrides)
        brandColors: data.styleOverrides.enabled ? {
          primary: data.styleOverrides.primaryColor,
          secondary: data.styleOverrides.secondaryColor,
          accent: data.styleOverrides.accentColor,
        } : {},
      };

      const projectRes = await apiRequest("POST", "/api/projects", projectPayload);
      const project = await projectRes.json();

      // Step 2: Create Layer 2 sections with proper mediaConfig format
      const layer2Sections = data.sections
        .filter((s) => s.heading.trim() || s.body.trim())
        .map((section, index) => ({
          heading: section.heading || SECTION_SUGGESTIONS[index]?.title || `Section ${index + 1}`,
          body: section.body,
          orderIndex: index,
          mediaType: mapMediaType(section),
          mediaConfig: buildMediaConfig(section),
          // Per-section style config: global overrides + layout config
          styleConfig: {
            // Global style overrides (when enabled)
            ...(data.styleOverrides.enabled && {
              fontFamily: data.styleOverrides.headingFont || undefined,
              headingColor: data.styleOverrides.primaryColor || undefined,
            }),
            // Per-section layout config (always include if present)
            ...(section.layoutConfig && {
              mediaSize: section.layoutConfig.mediaSize,
              mediaPosition: section.layoutConfig.mediaPosition,
              textWidth: section.layoutConfig.textWidth,
              spacing: section.layoutConfig.spacing,
            }),
          },
        }));

      try {
        for (const section of layer2Sections) {
          await apiRequest(
            "POST",
            `/api/projects/${project.id}/layer2-sections`,
            section
          );
        }
      } catch (layer2Error) {
        // Rollback: Delete the project if Layer 2 sections fail
        console.error("Layer 2 creation failed, rolling back project:", layer2Error);
        try {
          await apiRequest("DELETE", `/api/projects/${project.id}`);
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
        throw new Error("Failed to create portfolio sections. Please try again.");
      }

      return project;
    },
    onSuccess: (project) => {
      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });

      toast({
        title: "Portfolio Published!",
        description: `"${project.title}" is now live in your showcase.`,
      });

      // Navigate to content library
      setLocation("/admin/content?type=portfolio");
    },
    onError: (error: Error) => {
      const { status, body } = parseApiError(error);

      if (status === 400 && body && typeof body === "object") {
        const readable = formatValidationDetails((body as any).details);
        toast({
          title: "Fix required fields",
          description: readable || (body as any).error || "Validation failed.",
          variant: "destructive",
        });
        return;
      }

      if (
        status === 500 &&
        typeof body === "string" &&
        body.includes("projects_slug_unique")
      ) {
        toast({
          title: "Slug already exists",
          description: "Pick a different slug before publishing.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Publish Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePublish = async () => {
    if (isSlugTaken) {
      toast({
        title: "Slug already in use",
        description: "Choose a different URL slug before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (isSlugChecking) {
      toast({
        title: "Checking slug availability",
        description: "Please wait a moment while we verify the slug.",
      });
      return;
    }

    if (hasBodyTooLong) {
      toast({
        title: "Story section too long",
        description: `Each section must be under ${BODY_CHAR_LIMIT} characters.`,
        variant: "destructive",
      });
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Incomplete Portfolio",
        description: "Please fill in all required fields before publishing.",
        variant: "destructive",
      });
      return;
    }

    const data = form.getValues();
    await publishMutation.mutateAsync(data);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    form.reset({
      title: "",
      slug: "",
      thumbnailUrl: "",
      categories: [],
      clientName: "",
      clientLogoUrl: "",
      sections: DEFAULT_SECTIONS,
      testimonialText: "",
      testimonialAuthor: "",
      styleOverrides: DEFAULT_STYLES,
    });
    setOpenSection("headline");
    toast({
      title: "Draft Cleared",
      description: "Starting fresh with a new portfolio.",
    });
  };

  // Toggle section open state
  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? "" : sectionId);
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Create Portfolio | Revenue Party</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold">Create Portfolio</h1>
                  <p className="text-sm text-muted-foreground">
                    Build your case study in 7 sections
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {draftSaved && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    Draft saved
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDraft}
                  className="text-muted-foreground"
                >
                  Clear Draft
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowPublishModal(true)}
                  className="gap-2"
                  disabled={publishBlocked}
                >
                  <Rocket className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </header>

            {/* Main content - Split screen */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,480px]">
              {/* Left: Form Canvas */}
              <div className="overflow-y-auto p-6 space-y-4">
                {/* Section 1: Headline (Layer 1) */}
                <StoryBeatCard
                  title="Headline"
                  prompt="What appears on the portfolio grid?"
                  status={getBeatStatus([
                    watchedValues.title,
                    watchedValues.thumbnailUrl,
                  ])}
                  isOpen={openSection === "headline"}
                  onToggle={() => toggleSection("headline")}
                  beatNumber={1}
                  icon={<Target className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="How we helped TechFlow 10x their pipeline"
                        {...form.register("title")}
                        className="mt-1.5"
                      />
                      {form.formState.errors.title && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px]">
                            <p className="text-xs">
                              Auto-generates from title until you edit it manually. 
                              Your changes are preserved.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm text-muted-foreground">/branding/</span>
                        <Input
                          id="slug"
                          placeholder="techflow-pipeline"
                          {...form.register("slug")}
                          className="flex-1"
                        />
                      </div>
                      {form.formState.errors.slug && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.slug.message}
                        </p>
                      )}
                      {slugStatus !== "idle" && slugStatus !== "error" && (
                        <p
                          className={cn(
                            "text-xs mt-1",
                            slugStatus === "taken"
                              ? "text-destructive"
                              : slugStatus === "available"
                              ? "text-emerald-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {slugStatusMessage}
                        </p>
                      )}
                      {slugStatus === "error" && (
                        <p className="text-xs text-amber-500 mt-1">
                          {slugStatusMessage}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Hero Media</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select an image or video from your Media Library
                      </p>
                      <MediaPicker
                        value={watchedValues.thumbnailUrl ? [watchedValues.thumbnailUrl] : []}
                        onChange={(urls) => form.setValue("thumbnailUrl", urls[0] || "", { shouldValidate: true })}
                        mode="single"
                        mediaTypeFilter="all"
                        placeholder="Select hero image or video"
                      />
                      {/* Video preview */}
                      {watchedValues.thumbnailUrl && watchedValues.thumbnailUrl.match(/\.(mp4|webm|mov|avi)(\?|$)/i) && (
                        <div className="mt-3 rounded-lg overflow-hidden border">
                          <video
                            src={watchedValues.thumbnailUrl}
                            className="w-full aspect-video object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                          <p className="text-xs text-muted-foreground p-2 bg-muted/50">
                            Video will autoplay muted in the portfolio grid
                          </p>
                        </div>
                      )}
                      {form.formState.errors.thumbnailUrl && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.thumbnailUrl.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Categories</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          placeholder="Add a category tag"
                          value={categoryInput}
                          onChange={(e) => setCategoryInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddCategory())
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAddCategory}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {watchedValues.categories &&
                        watchedValues.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {watchedValues.categories.map((cat) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="gap-1 pr-1"
                              >
                                {cat}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategory(cat)}
                                  className="hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      {form.formState.errors.categories && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.categories.message}
                        </p>
                      )}
                    </div>
                  </div>
                </StoryBeatCard>

                {/* Section 2: Client Logo (separate) */}
                <StoryBeatCard
                  title="Client Logo"
                  prompt="Who did you build this for?"
                  status={getBeatStatus([watchedValues.clientName])}
                  isOpen={openSection === "client"}
                  onToggle={() => toggleSection("client")}
                  beatNumber={2}
                  icon={<Building2 className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        placeholder="TechFlow Inc."
                        {...form.register("clientName")}
                        className="mt-1.5"
                      />
                      {form.formState.errors.clientName && (
                        <p className="text-xs text-destructive mt-1">
                          {form.formState.errors.clientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>
                        Client Logo{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select from your Media Library
                      </p>
                      <MediaPicker
                        value={watchedValues.clientLogoUrl ? [watchedValues.clientLogoUrl] : []}
                        onChange={(urls) => form.setValue("clientLogoUrl", urls[0] || "", { shouldValidate: true })}
                        mode="single"
                        mediaTypeFilter="image"
                        placeholder="Select client logo"
                      />
                    </div>
                  </div>
                </StoryBeatCard>

                {/* Sections 3-7: The Story (consistent structure) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      The Story
                    </span>
                    <span className="text-xs text-muted-foreground">
                      — 5 sections to tell your narrative
                    </span>
                  </div>

                  {watchedValues.sections?.map((section, index) => {
                    const sectionError =
                      form.formState.errors.sections?.[index];
                    const bodyError =
                      typeof sectionError?.body?.message === "string"
                        ? sectionError.body.message
                        : undefined;

                    return (
                      <ContentSectionCard
                        key={index}
                        sectionNumber={index + 1}
                        value={section}
                        onChange={(data) => handleSectionChange(index, data)}
                        isOpen={openSection === `section-${index}`}
                        onToggle={() => toggleSection(`section-${index}`)}
                        icon={<FileText className="w-5 h-5" />}
                        suggestedTitle={SECTION_SUGGESTIONS[index]?.title}
                        suggestedPrompt={SECTION_SUGGESTIONS[index]?.prompt}
                        headingPlaceholder={
                          SECTION_SUGGESTIONS[index]?.placeholder
                        }
                        bodyCharCount={section.body?.length || 0}
                        bodyCharLimit={BODY_CHAR_LIMIT}
                        bodyError={bodyError}
                      />
                    );
                  })}
                </div>

                {/* Section 8: The Voice (Testimonial) */}
                <StoryBeatCard
                  title="The Voice"
                  prompt="What would your client say to a skeptic?"
                  status={getBeatStatus(
                    [],
                    [
                      watchedValues.testimonialText,
                      watchedValues.testimonialAuthor,
                    ]
                  )}
                  isOpen={openSection === "voice"}
                  onToggle={() => toggleSection("voice")}
                  beatNumber={7}
                  icon={<MessageSquareQuote className="w-5 h-5" />}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="testimonialText">
                        Testimonial Quote{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional but powerful)
                        </span>
                      </Label>
                      <Textarea
                        id="testimonialText"
                        placeholder="Revenue Party transformed our entire approach to..."
                        {...form.register("testimonialText")}
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="testimonialAuthor">Author</Label>
                      <Input
                        id="testimonialAuthor"
                        placeholder="Sarah Chen, CEO of TechFlow"
                        {...form.register("testimonialAuthor")}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </StoryBeatCard>

                {/* Style Overrides */}
                <ErrorBoundary
                  fallback={
                    <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
                      Style controls unavailable.
                      <button onClick={handleClearDraft} className="underline ml-1">Clear draft</button>
                    </div>
                  }
                >
                  <StyleControls
                    value={{ ...DEFAULT_STYLES, ...(watchedValues.styleOverrides || {}) }}
                    onChange={(styles) => form.setValue("styleOverrides", styles, { shouldValidate: true })}
                  />
                </ErrorBoundary>

                {/* Bottom publish CTA */}
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setShowPublishModal(true)}
                    className="w-full gap-2"
                    disabled={publishBlocked}
                  >
                    <Rocket className="w-5 h-5" />
                    Review & Publish
                  </Button>
                  {publishBlocked && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {hasBodyTooLong
                        ? `Story sections must be under ${BODY_CHAR_LIMIT} characters.`
                        : isSlugTaken
                        ? "Slug is already taken."
                        : "Checking slug availability..."}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Preview & Strength */}
              <div className="hidden lg:flex flex-col border-l bg-muted/20 overflow-hidden">
                {/* Proof Strength */}
                <div className="p-4 border-b bg-background">
                  <ProofStrength items={proofItems} />
                </div>

                {/* Live Preview */}
                <div className="flex-1 overflow-hidden p-4">
                  <PortfolioPreview data={previewData} className="h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>

      {/* Publish Modal */}
      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        data={previewData}
        onPublish={handlePublish}
        isPublishing={publishMutation.isPending}
      />
    </ProtectedRoute>
  );
}
