import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Code,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Layout,
  Loader2,
  MessageSquare,
  Sparkles,
  Undo2,
  Video,
  ChevronLeft,
} from "lucide-react";
import type {
  BlogPost,
  BlogPostSummary,
  Campaign,
  InsertBlogPost,
  InsertProject,
  InsertVideoPost,
  Project,
  VideoPost,
} from "@shared/schema";

const LOCAL_STORAGE_KEY = "unified-creator-state-v1";

type ContentType = "blog" | "video" | "gallery" | "section" | "page" | null;
type StepId = "type" | "context" | "seo" | "media" | "prompt" | "describe";

interface StepConfig {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MediaLibraryAsset {
  id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mediaType: "image" | "video";
  label?: string;
  tags?: string[];
}

interface SelectedMediaItem {
  id: string;
  url: string;
  mediaType: "image" | "video";
  alt: string;
  title: string;
  tags?: string[];
}

interface CreationContext {
  campaignId?: string;
  campaignName?: string;
  categories: string[];
  audienceNote: string;
}

interface CreationState {
  type: ContentType;
  subType: string;
  seo: {
    title: string;
    slug: string;
    description: string;
    keywords: string;
  };
  media: SelectedMediaItem[];
  promptChain: string;
  description: string;
  context: CreationContext;
}

interface HandoffOutcome {
  redirectUrl?: string;
  message: string;
}

const PROMPT_OPTIONS = [
  { value: "default", label: "Default Standard Chain" },
  { value: "creative", label: "Creative / Storytelling" },
  { value: "technical", label: "Technical / Documentation" },
  { value: "marketing", label: "High-Conversion Marketing" },
];

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features" },
  { value: "testimonials", label: "Testimonials" },
  { value: "cta", label: "CTA" },
  { value: "faq", label: "FAQ" },
  { value: "form", label: "Form" },
  { value: "gallery", label: "Gallery" },
];

const STEPS: StepConfig[] = [
  { id: "type", label: "Content Type", icon: Layout },
  { id: "context", label: "Context", icon: ClipboardList },
  { id: "seo", label: "SEO & URL", icon: Globe },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "prompt", label: "Prompt Chain", icon: Sparkles },
  { id: "describe", label: "Description", icon: FileText },
];

const INITIAL_STATE: CreationState = {
  type: null,
  subType: "",
  seo: {
    title: "",
    slug: "",
    description: "",
    keywords: "",
  },
  media: [],
  promptChain: "default",
  description: "",
  context: {
    campaignId: undefined,
    campaignName: undefined,
    categories: [],
    audienceNote: "",
  },
};

function UnifiedCreator() {
  const [persistedState, setPersistedState] = useLocalStorage<CreationState>(
    LOCAL_STORAGE_KEY,
    INITIAL_STATE
  );
  const state = useMemo(() => normalizeState(persistedState), [persistedState]);
  const [currentStep, setCurrentStep] = useState<StepId>("type");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const applyState = (updater: (prev: CreationState) => CreationState) => {
    setPersistedState((prev) => updater(normalizeState(prev)));
  };

  const setSlice = <K extends keyof CreationState>(key: K, value: CreationState[K]) => {
    applyState((prev) => ({ ...prev, [key]: value }));
  };

  const updateSeo = (field: keyof CreationState["seo"], value: string) => {
    applyState((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
  };

  const updateContext = (updates: Partial<CreationState["context"]>) => {
    applyState((prev) => ({ ...prev, context: { ...prev.context, ...updates } }));
  };

  const shouldLoadContextData =
    currentStep === "context" || !!state.context.campaignId || state.context.categories.length > 0;

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: shouldLoadContextData,
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPostSummary[]>({
    queryKey: ["/api/blog-posts", { publishedOnly: "false" }],
    enabled: shouldLoadContextData,
  });

  const { data: videoPosts = [], isLoading: videoLoading } = useQuery<VideoPost[]>({
    queryKey: ["/api/video-posts", { publishedOnly: "false" }],
    enabled: shouldLoadContextData,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: shouldLoadContextData,
  });

  const { data: mediaAssets = [], isLoading: mediaLoading } = useQuery<MediaLibraryAsset[]>({
    queryKey: ["/api/media-library"],
  });

  const campaignsById = useMemo(() => {
    const map = new Map<string, Campaign>();
    campaigns?.forEach((campaign) => map.set(campaign.id, campaign));
    return map;
  }, [campaigns]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    blogPosts?.forEach((post) => post?.category && categories.add(post.category));
    videoPosts?.forEach((post) => post?.category && categories.add(post.category));
    projects?.forEach((project) => project?.categories?.forEach((category) => category && categories.add(category)));
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [blogPosts, videoPosts, projects]);

  const handleCategoryToggle = (category: string) => {
    const normalized = category.trim();
    if (!normalized) return;
    updateContext({
      categories: state.context.categories.includes(normalized)
        ? state.context.categories.filter((value) => value !== normalized)
        : [...state.context.categories, normalized],
    });
  };

  const handleAddCategory = () => {
    if (!categoryDraft.trim()) return;
    handleCategoryToggle(categoryDraft.trim());
    setCategoryDraft("");
  };

  const handleMediaRemove = (id: string) => {
    applyState((prev) => ({ ...prev, media: prev.media.filter((asset) => asset.id !== id) }));
  };

  const handleMediaAttach = (assets: MediaLibraryAsset[]) => {
    if (!assets.length) return;
    applyState((prev) => {
      const map = new Map(prev.media.map((asset) => [asset.id, asset] as const));
      assets.forEach((asset) => {
        map.set(asset.id, {
          id: asset.id,
          url: asset.cloudinaryUrl,
          mediaType: asset.mediaType,
          alt: asset.label || asset.tags?.join(", ") || asset.cloudinaryPublicId,
          title: asset.label || asset.cloudinaryPublicId,
          tags: asset.tags,
        });
      });
      return { ...prev, media: Array.from(map.values()) };
    });
  };

  const handleAltChange = (id: string, value: string) => {
    applyState((prev) => ({
      ...prev,
      media: prev.media.map((asset) => (asset.id === id ? { ...asset, alt: value } : asset)),
    }));
  };

  const createDraftMutation = useMutation<HandoffOutcome, Error, CreationState>({
    mutationFn: async (currentState) => {
      if (!currentState.type) {
        throw new Error("Choose what you want to build first.");
      }

      if (currentState.type === "blog") {
        const payload = buildBlogDraftPayload(currentState);
        const response = await apiRequest("POST", "/api/blog-posts", payload);
        const post: BlogPost = await response.json();
        return {
          redirectUrl: `/admin/blog-posts/${post.id}/edit`,
          message: "Blog draft created. Opening editor…",
        };
      }

      if (currentState.type === "video") {
        const payload = buildVideoDraftPayload(currentState);
        const response = await apiRequest("POST", "/api/video-posts", payload);
        const post: VideoPost = await response.json();
        return {
          redirectUrl: `/admin/video-posts/${post.id}/edit`,
          message: "Video draft created. Opening editor…",
        };
      }

      if (currentState.type === "page" || currentState.type === "gallery") {
        const payload = buildProjectPayload(currentState);
        const response = await apiRequest("POST", "/api/projects", payload);
        const project: Project = await response.json();
        return {
          redirectUrl: `/admin/portfolio-builder?projectId=${project.id}`,
          message: "Project scaffolded in the Portfolio Builder.",
        };
      }

      if (currentState.type === "section") {
        const snippet = buildSectionSnippet(currentState);
        await copyText(snippet);
        return { message: "Section snippet copied to clipboard." };
      }

      throw new Error("Unsupported content type.");
    },
    onSuccess: (result) => {
      toast({ title: "All set", description: result.message });
      if (result.redirectUrl) {
        setLocation(result.redirectUrl);
      } else {
        setIsPreviewMode(false);
      }
    },
    onError: (error) => {
      toast({ title: "Unable to hand off", description: error.message, variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    const validation = validateBeforeHandoff(state);
    if (validation) {
      toast({ title: "One more thing", description: validation.message, variant: "destructive" });
      setCurrentStep(validation.step);
      setIsPreviewMode(false);
      return;
    }
    createDraftMutation.mutate(state);
  };

  const handleReset = () => {
    setPersistedState(INITIAL_STATE);
    setCurrentStep("type");
    setIsPreviewMode(false);
    toast({ title: "Cleared", description: "Starting fresh draft." });
  };

  const selectedCampaign = state.context.campaignId
    ? campaignsById.get(state.context.campaignId)
    : null;

  const activeStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const progressPercent = ((activeStepIndex + 1) / STEPS.length) * 100;

  const renderTypeStep = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[
        { id: "blog", label: "Blog Post", icon: FileText, desc: "Articles, news, playbooks" },
        { id: "video", label: "Video Post", icon: Video, desc: "Video content with transcript" },
        { id: "gallery", label: "Video Gallery", icon: ImageIcon, desc: "Curated video reels" },
        { id: "section", label: "Website Section", icon: Layout, desc: "Testimonials, CTAs, etc." },
        { id: "page", label: "Full Web Page", icon: Globe, desc: "Landing pages & microsites" },
      ].map((entry) => (
        <Card
          key={entry.id}
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            state.type === entry.id && "border-primary bg-primary/5 ring-1 ring-primary"
          )}
          onClick={() => {
            setSlice("type", entry.id as ContentType);
            if (entry.id !== "section") {
              setSlice("subType", "");
            }
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <entry.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{entry.label}</CardTitle>
            </div>
            <CardDescription>{entry.desc}</CardDescription>
          </CardHeader>
        </Card>
      ))}

      {state.type === "section" && (
        <div className="col-span-full rounded-lg border bg-muted/40 p-4">
          <Label className="mb-2 block">Section style</Label>
          <Select value={state.subType} onValueChange={(value) => setSlice("subType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderContextStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign</CardTitle>
          <CardDescription>Attach this asset to an existing growth campaign.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={state.context.campaignId || "none"}
            onValueChange={(value) =>
              value === "none"
                ? updateContext({ campaignId: undefined, campaignName: undefined })
                : updateContext({ campaignId: value, campaignName: campaignsById.get(value)?.campaignName })
            }
            disabled={campaignsLoading && shouldLoadContextData}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No campaign</SelectItem>
              {campaigns?.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.campaignName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCampaign && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedCampaign.campaignName} ({selectedCampaign.contentType})
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Tag this asset for search and reporting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {state.context.categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
            {state.context.categories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-2">
                {category}
                <button className="text-xs" onClick={() => handleCategoryToggle(category)}>
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              placeholder="Add custom tag"
              onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), handleAddCategory())}
            />
            <Button type="button" onClick={handleAddCategory}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <Button
                key={category}
                variant={state.context.categories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience & Guardrails</CardTitle>
          <CardDescription>Share who this is for or what to avoid.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={state.context.audienceNote}
            onChange={(event) => updateContext({ audienceNote: event.target.value })}
            placeholder="Enterprise CMOs, prefer conversational tone, avoid jargon…"
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderSeoStep = () => (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Title / Headline</Label>
          <Input
            value={state.seo.title}
            onChange={(event) => {
              updateSeo("title", event.target.value);
              if (!state.seo.slug) {
                updateSeo("slug", slugify(event.target.value));
              }
            }}
            placeholder="e.g. The 2025 GTM Playbook"
          />
        </div>
        <div className="space-y-2">
          <Label>URL Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">/</span>
            <Input
              value={state.seo.slug}
              onChange={(event) => updateSeo("slug", slugify(event.target.value))}
              placeholder="gtm-playbook"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Meta Description</Label>
          <Textarea
            className="h-24"
            value={state.seo.description}
            onChange={(event) => updateSeo("description", event.target.value)}
            placeholder="Short teaser copy for search and social previews"
          />
        </div>
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Input
            value={state.seo.keywords}
            onChange={(event) => updateSeo("keywords", event.target.value)}
            placeholder="sales, pipeline, outbound"
          />
        </div>
      </div>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => setIsMediaDialogOpen(true)}>
          <ImageIcon className="mr-2 h-4 w-4" /> Select from Media Library
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.open("/admin/media-library", "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Open full library
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Need a new asset? Upload it in the Media Library and it will appear here instantly.
      </p>

      {state.media.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground">
          No assets attached yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {state.media.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
                <div className="h-24 w-32 overflow-hidden rounded border">
                  {asset.mediaType === "image" ? (
                    <img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" />
                  ) : (
                    <video src={asset.url} className="h-full w-full object-cover" controls />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Alt Text</Label>
                  <Input
                    value={asset.alt}
                    onChange={(event) => handleAltChange(asset.id, event.target.value)}
                    placeholder="Describe this asset"
                  />
                  <p className="text-xs text-muted-foreground">{asset.title}</p>
                </div>
                <Button variant="ghost" onClick={() => handleMediaRemove(asset.id)}>
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPromptStep = () => (
    <div className="max-w-2xl space-y-4">
      <Label>Prompt strategy</Label>
      <Select value={state.promptChain} onValueChange={(value) => setSlice("promptChain", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select strategy" />
        </SelectTrigger>
        <SelectContent>
          {PROMPT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        {PROMPT_OPTIONS.find((option) => option.value === state.promptChain)?.label ||
          "Choose how the assistant should think."}
      </div>
    </div>
  );

  const renderDescribeStep = () => (
    <div className="space-y-4">
      <Label className="text-lg">What are we building?</Label>
      <CardDescription>
        Share the brief, differentiators, and any raw notes. The richer the context, the better the first
        pass.
      </CardDescription>
      <Textarea
        className="min-h-[320px]"
        placeholder="e.g. We need a landing page for the new RevOps assessment, targeting CROs…"
        value={state.description}
        onChange={(event) => setSlice("description", event.target.value)}
      />
      <p className={cn("text-right text-sm", state.description.length < 50 && "text-destructive")}
      >
        {state.description.length} characters
      </p>
    </div>
  );

  const renderPreview = () => {
    const summary = [
      { label: "Content Type", value: state.type ? state.type.toUpperCase() : "Not selected" },
      {
        label: "Campaign",
        value: selectedCampaign ? selectedCampaign.campaignName : "Not assigned",
      },
      {
        label: "Categories",
        value: state.context.categories.length ? state.context.categories.join(", ") : "Not tagged",
      },
      {
        label: "Prompt Chain",
        value: PROMPT_OPTIONS.find((option) => option.value === state.promptChain)?.label || "Default",
      },
    ];

    return (
      <div className="flex h-full gap-4">
        <Card className="flex h-full w-full max-w-sm flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="space-y-3 text-sm">
              {summary.map((item) => (
                <div key={item.label}>
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
              <div>
                <p className="text-muted-foreground">Media Assets</p>
                <p className="font-medium">
                  {state.media.length ? `${state.media.length} linked` : "No assets"}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  copyText(JSON.stringify(state, null, 2));
                  toast({ title: "Copied config JSON" });
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy JSON
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={createDraftMutation.isPending}>
                {createDraftMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Handing off…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate & Handoff
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Configuration Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] p-4">
              <pre className="rounded bg-muted p-4 text-xs">
                {JSON.stringify(state, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isPreviewMode) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsPreviewMode(false)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Config
            </Button>
            <h1 className="text-xl font-semibold">Review & Handoff</h1>
          </div>
          <Badge variant="outline">Autosaves locally</Badge>
        </header>
        <main className="flex-1 overflow-auto p-6">{renderPreview()}</main>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col bg-background">
          <Helmet>
            <title>Unified Content Creator | Revenue Party</title>
          </Helmet>

          <header className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">Unified Creator</h1>
                <p className="text-sm text-muted-foreground">Describe, configure, and hand off in one flow.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleReset}>
                <Undo2 className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(true)}
                disabled={!state.type || !state.description.trim()}
              >
                <Code className="mr-2 h-4 w-4" /> Review & Generate
              </Button>
            </div>
          </header>

          <main className="flex flex-1 overflow-hidden">
            <aside className="hidden w-64 border-r bg-muted/20 p-4 md:block">
              <div className="space-y-2">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    {step.label}
                  </button>
                ))}
              </div>
            </aside>

            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-4xl p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Step {activeStepIndex + 1} of {STEPS.length}
                      </p>
                      <h2 className="text-2xl font-semibold">
                        {STEPS.find((step) => step.id === currentStep)?.label}
                      </h2>
                    </div>
                    <Badge variant="secondary">Autosaved</Badge>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="min-h-[420px]">
                  {currentStep === "type" && renderTypeStep()}
                  {currentStep === "context" && renderContextStep()}
                  {currentStep === "seo" && renderSeoStep()}
                  {currentStep === "media" && renderMediaStep()}
                  {currentStep === "prompt" && renderPromptStep()}
                  {currentStep === "describe" && renderDescribeStep()}
                </div>

                <div className="mt-10 flex items-center justify-between border-t pt-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const idx = STEPS.findIndex((step) => step.id === currentStep);
                      if (idx > 0) {
                        setCurrentStep(STEPS[idx - 1].id);
                      }
                    }}
                    disabled={currentStep === STEPS[0].id}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      const idx = STEPS.findIndex((step) => step.id === currentStep);
                      if (idx < STEPS.length - 1) {
                        setCurrentStep(STEPS[idx + 1].id);
                      } else {
                        setIsPreviewMode(true);
                      }
                    }}
                  >
                    {currentStep === STEPS[STEPS.length - 1].id ? (
                      <>
                        Review & Generate <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next Step <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
      <MediaPickerDialog
        open={isMediaDialogOpen}
        onOpenChange={setIsMediaDialogOpen}
        assets={mediaAssets}
        isLoading={mediaLoading}
        initiallySelected={state.media.map((asset) => asset.id)}
        onConfirm={handleMediaAttach}
      />
    </SidebarProvider>
  );
}

export default UnifiedCreator;

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: MediaLibraryAsset[];
  isLoading: boolean;
  initiallySelected: string[];
  onConfirm: (assets: MediaLibraryAsset[]) => void;
}

function MediaPickerDialog({
  open,
  onOpenChange,
  assets,
  isLoading,
  initiallySelected,
  onConfirm,
}: MediaPickerDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initiallySelected));
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    if (open) {
      setSelectedIds(new Set(initiallySelected));
    }
  }, [open, initiallySelected]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filter !== "all" && asset.mediaType !== filter) {
        return false;
      }
      if (!search.trim()) return true;
      const needle = search.toLowerCase();
      return (
        asset.cloudinaryPublicId.toLowerCase().includes(needle) ||
        asset.label?.toLowerCase().includes(needle) ||
        asset.tags?.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [assets, filter, search]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const attach = () => {
    const selected = assets.filter((asset) => selectedIds.has(asset.id));
    onConfirm(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select assets</DialogTitle>
          <DialogDescription>Pick images or videos from the global library.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search label, tags, file name…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "image" | "video")}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant="secondary">{selectedIds.size} selected</Badge>
          </div>
          <div className="rounded-lg border p-4">
            {isLoading ? (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading media…
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                No assets match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredAssets.map((asset) => (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => toggle(asset.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      selectedIds.has(asset.id) ? "border-primary" : "border-muted"
                    )}
                  >
                    {asset.mediaType === "image" ? (
                      <img
                        src={asset.cloudinaryUrl}
                        alt={asset.label || asset.cloudinaryPublicId}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={asset.cloudinaryUrl}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {selectedIds.has(asset.id) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={attach} disabled={selectedIds.size === 0}>
            Attach {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
