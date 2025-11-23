function appendPrompt(existing: string, addition: string) {
  if (!existing) return addition.trim();
  return `${existing.trim()}\n${addition.trim()}`;
}

function buildPromptOptions(section: { featureType: string; label: string }) {
  switch (section.featureType) {
    case "hero":
      return [
        {
          label: "Dramatic hero",
          prompt: "Make the hero cinematic with bold typography, dynamic motion, and a confident CTA.",
        },
        {
          label: "Premium hero",
          prompt: "Give the hero an executive tone with restrained motion, sophisticated palette, and proof badges.",
        },
      ];
    case "social-proof":
      return [
        {
          label: "Case study focus",
          prompt: "Expand the proof section with narrative testimonials, metrics, and recognizable customer logos.",
        },
        {
          label: "Quote carousel",
          prompt: "Turn the proof section into a carousel of punchy quotes with author portraits and roles.",
        },
      ];
    case "cta":
      return [
        {
          label: "High urgency CTA",
          prompt: "Increase urgency in the CTA with limited-time language, social proof near the button, and microcopy.",
        },
      ];
    default:
      return [
        {
          label: "Polish section",
          prompt: `Refine the ${section.featureType} section for clarity, hierarchy, and on-brand motion details.`,
        },
      ];
  }
}
import { useState, useEffect, useCallback, useRef, useMemo, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus,
  X,
  Sparkles,
  Loader2,
  Code2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Maximize,
  Share2,
  Palette,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Undo2,
  Redo2,
  Copy,
  Wand2,
  Minimize2,
  CheckCircle2,
  LifeBuoy,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { ChatInterface, type ChatMessage } from "@/components/ChatInterface";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useKeyboardShortcuts, type KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useMobile } from "@/hooks/use-mobile";
import { LivePreviewPanel } from "@/components/admin/LivePreviewPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareModal } from "@/components/ShareModal";
import { GuidedTour, type GuidedTourStep } from "@/components/GuidedTour";
import { updateRecentProjectAccess, addRecentProject } from "@/components/RecentProjects";
import { MobileOverlay } from "@/components/MobileOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { diffScenes, type SceneDiff } from "@/lib/diffScenes";
import { useShortcutRegistry } from "@/context/ShortcutRegistryContext";

interface MediaAsset {
  id: string;
  cloudinaryUrl: string;
  mediaType: "image" | "video";
  label?: string;
  tags?: string[];
}

interface BrandFormState {
  logoUrl: string;
  componentLibrary: string;
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
  };
  assetPlan: Array<{ assetId: string; label?: string }>;
}

const DEFAULT_BRAND_COLORS = {
  primary: "#111827",
  secondary: "#F4F4F5",
  accent: "#F97316",
  neutral: "#FFFFFF",
};

const createDefaultBrandForm = (): BrandFormState => ({
  logoUrl: "",
  componentLibrary: "shadcn",
  colors: { ...DEFAULT_BRAND_COLORS },
  assetPlan: [],
});

const COMPONENT_LIBRARIES = [
  { value: "shadcn", label: "shadcn/ui" },
  { value: "tailwind", label: "Tailwind Blocks" },
  { value: "chakra", label: "Chakra UI" },
  { value: "custom", label: "Custom Library" },
];

const FEATURE_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "problem", label: "Problem / Trap" },
  { value: "solution", label: "Solution Showcase" },
  { value: "social-proof", label: "Testimonials / Proof" },
  { value: "cta", label: "Primary CTA" },
  { value: "ebook", label: "E-book Download" },
  { value: "assessment", label: "Assessment Invite" },
  { value: "custom", label: "Custom Section" },
];

const GLOBAL_PROMPT_SUGGESTIONS = [
  {
    id: "cinematic-hero",
    label: "Cinematic Hero",
    description: "Layer parallax, gradients, and dramatic CTA copy",
    prompt: "Make the hero cinematic with layered parallax, gradient overlays, and a dramatic CTA that feels urgent yet premium.",
  },
  {
    id: "proof-power",
    label: "Proof Boost",
    description: "Dial up testimonials, logos, and measurable outcomes",
    prompt: "Lean heavily into social proof — surface recognizable logos, punchy quotes, and measurable metrics in every section.",
  },
  {
    id: "premium-tone",
    label: "Premium Tone",
    description: "Shift copy toward executive, high-trust voice",
    prompt: "Elevate the tone to feel executive and trustworthy, emphasizing strategic outcomes over tactics, with polished transitions.",
  },
];

const CHAT_QUICK_ACTIONS = [
  {
    id: "bold",
    label: "Make it bolder",
    content: "Make the typography bolder and the motion more assertive across all scenes.",
  },
  {
    id: "lighter",
    label: "Lighten tone",
    content: "Lighten the tone, increase whitespace, and soften transitions for a calmer feel.",
  },
  {
    id: "speed",
    label: "Speed up",
    content: "Speed up transitions and tighten scene durations to feel more energetic.",
  },
];
const createSectionTemplate = (index: number) => ({
  sectionKey: `section-${index + 1}`,
  label: `Section ${index + 1}`,
  featureType: "custom",
  enablePerSectionPrompt: false,
  prompt: "",
});

const PIPELINE_STAGE_UI = [
  { key: "stage1_initial", label: "Stage 1 · Initial Generation" },
  { key: "stage2_self_audit", label: "Stage 2 · Self Audit" },
  { key: "stage3_improvements", label: "Stage 3 · Generate Improvements" },
  { key: "stage4_auto_fix", label: "Stage 4 · Auto-Fix" },
  { key: "stage5_regeneration", label: "Stage 5 · Final Regeneration" },
  { key: "stage6_validation", label: "Stage 6 · Final Validation" },
];

const STEP_TITLES = [
  "Project & Logo",
  "Brand Colors",
  "Component Library",
  "Assets",
  "Sections & Features",
  "Director Prompt",
  "Per-section Prompts",
];

const slugifyProjectTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

const DEFAULT_PROJECT_TITLE = "Untitled Launch";

const COLOR_PRESETS = [
  {
    name: "Cinematic Noir",
    colors: {
      primary: "#0F172A",
      secondary: "#1E293B",
      accent: "#F97316",
      neutral: "#F1F5F9",
    },
  },
  {
    name: "Rose Nebula",
    colors: {
      primary: "#170312",
      secondary: "#2A0A1B",
      accent: "#FF4D6D",
      neutral: "#FFE5EC",
    },
  },
  {
    name: "Aurora Lime",
    colors: {
      primary: "#0A192F",
      secondary: "#112240",
      accent: "#5EF38C",
      neutral: "#E2FFF4",
    },
  },
];

function BrandSetupPanel({
  brandForm,
  setBrandForm,
  mediaAssets,
  isUploading,
  assetFilter,
  onSelectAssetFilter,
  recommendedFeatures,
  onOpenAssetLibrary,
  onUploadAssets,
  logoUploading,
  onUploadLogo,
  onAssetToggle,
  onSave,
  saving,
  mediaAssetsLoading,
  projectTitle,
}: {
  brandForm: BrandFormState;
  setBrandForm: Dispatch<SetStateAction<BrandFormState>>;
  mediaAssets?: MediaAsset[];
  isUploading: boolean;
  assetFilter: string | null;
  onSelectAssetFilter: (filter: string | null) => void;
  recommendedFeatures: string[];
  onOpenAssetLibrary: () => void;
  logoUploading: boolean;
  onUploadAssets: (files: FileList) => void;
  onUploadLogo: (file: File) => void;
  onAssetToggle: (asset: MediaAsset) => void;
  onSave: () => void;
  saving: boolean;
  mediaAssetsLoading: boolean;
  projectTitle?: string;
}) {
  const assetUploadInputRef = useRef<HTMLInputElement | null>(null);
  const logoUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingAssets, setIsDraggingAssets] = useState(false);

  const colors = brandForm.colors || {};

  const handleColorChange = (key: keyof BrandFormState["colors"], value: string) => {
    setBrandForm(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleLogoUrlChange = (value: string) => {
    setBrandForm(prev => ({ ...prev, logoUrl: value }));
  };

  const handleLibraryChange = (value: string) => {
    setBrandForm(prev => ({ ...prev, componentLibrary: value }));
  };

  const handleUploadClick = () => {
    assetUploadInputRef.current?.click();
  };

  const selectedAssetIds = new Set((brandForm.assetPlan || []).map(asset => asset.assetId));
  const filteredAssets = (mediaAssets || []).filter(asset => {
    if (!assetFilter) return true;
    const normalized = assetFilter.toLowerCase();
    const label = asset.label?.toLowerCase() || "";
    const tags = (asset as any)?.tags?.map((tag: string) => tag.toLowerCase()) || [];
    return label.includes(normalized) || tags.includes(normalized);
  });
  const isRecommendedAsset = (asset: any) => {
    const tags: string[] = asset?.tags || [];
    if (!tags.length) return false;
    return recommendedFeatures.some(feature => tags.includes(feature));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingAssets(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDraggingAssets(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingAssets(false);
    if (event.dataTransfer.files?.length) {
      onUploadAssets(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Set the visual identity and approved assets for <span className="font-medium">{projectTitle || "this project"}</span>.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Identity
          </h3>
          <p className="text-sm text-muted-foreground">Logo, component library, and primary palette.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="logo-url">Logo URL</Label>
          <div className="flex flex-col gap-2">
            <Input
              id="logo-url"
              placeholder="https://cdn.revenueparty.com/logo.svg"
              value={brandForm.logoUrl}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                ref={logoUploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onUploadLogo(file);
                  }
                  if (event.target) event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoUploadInputRef.current?.click()}
                disabled={logoUploading}
              >
                {logoUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Logo
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload replaces the URL automatically.
              </p>
            </div>
          </div>
          {brandForm.logoUrl && (
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
              <img src={brandForm.logoUrl} alt="Brand logo preview" className="h-10 w-10 object-contain" />
              <span className="text-xs text-muted-foreground break-all">{brandForm.logoUrl}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Component Library</Label>
          <Select value={brandForm.componentLibrary} onValueChange={handleLibraryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose library" />
            </SelectTrigger>
            <SelectContent>
              {COMPONENT_LIBRARIES.map((library) => (
                <SelectItem key={library.value} value={library.value}>
                  {library.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Color System</Label>
          <div className="grid grid-cols-2 gap-4">
            {(["primary", "secondary", "accent", "neutral"] as Array<keyof BrandFormState["colors"]>).map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={colors?.[key] || DEFAULT_BRAND_COLORS[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-14 h-12 p-1"
                    aria-label={`${key} color`}
                  />
                  <div className="flex-1">
                    <p className="text-xs uppercase text-muted-foreground">{key}</p>
                    <Input
                      value={colors?.[key] || ""}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {COLOR_PRESETS.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Presets</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      setBrandForm((prev) => ({
                        ...prev,
                        colors: { ...preset.colors },
                      }))
                    }
                  >
                    <span className="flex h-4 w-4 rounded-full" style={{ background: preset.colors.accent }} />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Asset Library
            </h3>
            <p className="text-sm text-muted-foreground">Attach reference assets for the AI director.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onOpenAssetLibrary}>
              Manage Library
            </Button>
            <Input
              ref={assetUploadInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => {
                if (event.target.files?.length) {
                  onUploadAssets(event.target.files);
                  event.target.value = "";
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
        {recommendedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              variant={assetFilter ? "outline" : "default"}
              size="sm"
              onClick={() => onSelectAssetFilter(null)}
            >
              All
            </Button>
            {recommendedFeatures.map((feature) => (
              <Button
                key={feature}
                type="button"
                variant={assetFilter === feature ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectAssetFilter(feature)}
              >
                {feature.replace("-", " ")}
              </Button>
            ))}
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border ${isDraggingAssets ? "border-primary border-dashed bg-primary/5" : "border-muted"}`}
        >
          {mediaAssetsLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading assets...</div>
          ) : filteredAssets.length > 0 ? (
            <ScrollArea className="h-64 pr-2">
              <div className="grid grid-cols-2 gap-3 p-2">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAssetIds.has(asset.id);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => onAssetToggle(asset)}
                      className={`border rounded-lg overflow-hidden text-left transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                        isSelected ? "border-primary" : "border-muted"
                      }`}
                    >
                      <div className="aspect-video bg-muted relative">
                        {asset.mediaType === "video" ? (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                            Video Asset
                          </div>
                        ) : (
                          <img src={asset.cloudinaryUrl} alt={asset.label || asset.id} className="w-full h-full object-cover" />
                        )}
                        {isRecommendedAsset(asset) && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <p className="text-xs font-medium truncate">{asset.label || "Untitled asset"}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{asset.mediaType}</p>
                        {isSelected && <p className="text-[10px] text-primary mt-1">Selected</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isDraggingAssets
                ? "Release to upload assets"
                : "No assets match this filter. Drag & drop files here or use the upload button."}
            </div>
          )}
        </div>
      </section>

      <SheetFooter>
        <Button onClick={onSave} disabled={saving || !brandForm}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Save Brand & Assets
            </>
          )}
        </Button>
      </SheetFooter>
    </div>
  );
}

function StepCard({
  stepLabel,
  title,
  description,
  completed,
  actionSlot,
  children,
}: {
  stepLabel: string;
  title: string;
  description?: string;
  completed?: boolean;
  actionSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="shadow-none border">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{stepLabel}</p>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {actionSlot}
          {completed && <Badge variant="secondary">Done</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">{children}</CardContent>
    </Card>
  );
}

export default function PortfolioBuilderChatFirst() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { registerShortcuts, unregisterShortcuts } = useShortcutRegistry();
  const isMobile = useMobile();
  const toastWithMood = useCallback(
    (mood: "success" | "info" | "warning" | "error", title: string, description?: string) => {
      const prefix = {
        success: "✨",
        info: "💡",
        warning: "⚠️",
        error: "⛔️",
      } as const;
      toast({
        title: `${prefix[mood]} ${title}`,
        description,
        duration: mood === "error" ? 5500 : 3200,
      });
    },
    [toast]
  );
  
  // Dev Mode state (saved in localStorage)
  const [devMode, setDevMode] = useLocalStorage<boolean>("portfolio-builder-dev-mode", false);
  const [showPreview, setShowPreview] = useState(!isMobile); // Hide preview on mobile by default
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  
  // Project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isNewProject, setIsNewProject] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [autoCreatingProject, setAutoCreatingProject] = useState(false);
  const creatingProjectRef = useRef<Promise<string | null> | null>(null);
  const autoCreateTriggeredRef = useRef(false);
  const [brandColorPrimary, setBrandColorPrimary] = useState("#000000");
  const [brandColorSecondary, setBrandColorSecondary] = useState("#333333");
  const [brandColorTertiary, setBrandColorTertiary] = useState("#666666");
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [brandForm, setBrandForm] = useState<BrandFormState>(createDefaultBrandForm());
  const [brandFormDirty, setBrandFormDirty] = useState(false);
  const [isUploadingBrandAsset, setIsUploadingBrandAsset] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const brandAutoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBrandPayloadRef = useRef<BrandFormState | null>(null);
  const inlineLogoUploadRef = useRef<HTMLInputElement | null>(null);
  const inlineAssetUploadRef = useRef<HTMLInputElement | null>(null);
  const [sectionPlan, setSectionPlan] = useState<Array<{
    sectionKey: string;
    label: string;
    featureType: string;
    enablePerSectionPrompt?: boolean;
    prompt?: string;
  }>>([]);
  const [pipelinePrompt, setPipelinePrompt] = useState("");
  const [assetFilter, setAssetFilter] = useState<string | null>(null);
  const [autoRunPipeline, setAutoRunPipeline] = useState(true);
  const [isResumingPipeline, setIsResumingPipeline] = useState(false);
  const [stagePreviewVersion, setStagePreviewVersion] = useState<any | null>(null);
  const [pendingPipelineRunId, setPendingPipelineRunId] = useState<string | null>(null);
  const [inlineVersionDraft, setInlineVersionDraft] = useState<any | null>(null);
  const [lastAutoLoadedVersionId, setLastAutoLoadedVersionId] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState<string | null>(null);
  const [compareVersionB, setCompareVersionB] = useState<string | null>(null);
  const [compareDiffs, setCompareDiffs] = useState<SceneDiff[] | null>(null);
  const [shareVersion, setShareVersion] = useState<any | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef<{ entries: string[]; index: number }>({ entries: [""], index: 0 });
  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jsonEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const [jsonSearchTerm, setJsonSearchTerm] = useState("");
  const recommendedFeatures = useMemo(
    () => Array.from(new Set(sectionPlan.map((section) => section.featureType))).filter(Boolean) as string[],
    [sectionPlan]
  );

  // Data fetching
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: existingProjectScenes, isLoading: isLoadingScenes } = useQuery<any[]>({
    queryKey: ["/api/projects", selectedProjectId, "scenes", { hydrate: true }],
    enabled: !isNewProject && !!selectedProjectId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: journeyData, isFetching: isJourneyLoading, refetch: refetchJourney, error: journeyError } = useQuery({
    queryKey: ["project-journey", selectedProjectId],
    enabled: !!selectedProjectId && !isNewProject,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/projects/${selectedProjectId}/journey`);
      return response.json();
    },
  });

  const { data: mediaAssets, isFetching: isMediaLoading, refetch: refetchMediaAssets } = useQuery<MediaAsset[]>({
    queryKey: ["media-library", selectedProjectId],
    enabled: !!selectedProjectId && !isNewProject,
    queryFn: async () => {
      const url = selectedProjectId ? `/api/media-library?projectId=${selectedProjectId}` : "/api/media-library";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });
  const ensureProject = useCallback(
    async (options?: { title?: string; slugHint?: string; client?: string; colors?: any }) => {
      // If we already have a project ID and we're not in "new project" mode, just return it.
      if (selectedProjectId && !isNewProject) {
        return selectedProjectId;
      }
      
      // If we have a project ID but we think we're new, switch modes and return it.
      if (selectedProjectId && isNewProject) {
        setIsNewProject(false);
        return selectedProjectId;
      }
      
      // Prevent concurrent creations
      if (creatingProjectRef.current) {
        return creatingProjectRef.current;
      }

      const resolvedTitle =
        (options?.title || newProjectTitle || journeyData?.project?.title || DEFAULT_PROJECT_TITLE).trim() ||
        DEFAULT_PROJECT_TITLE;
        
      const baseSlug = slugifyProjectTitle(options?.slugHint || newProjectSlug || resolvedTitle);
      const slug = baseSlug || `${slugifyProjectTitle(resolvedTitle) || "launch"}-${Date.now().toString(36)}`;

      setAutoCreatingProject(true);

      const creationPromise = (async () => {
        try {
          const payload: any = {
            title: resolvedTitle,
            slug,
            clientName: options?.client || newProjectClient || null,
          };
          
          // Include colors if provided (from initial creation inputs)
          if (options?.colors) {
            payload.brandColors = options.colors;
          } else if (isNewProject) {
            // Fallback to state values if not passed explicitly
            payload.brandColors = {
              primary: brandColorPrimary,
              secondary: brandColorSecondary,
              accent: brandColorTertiary,
            };
          }

          const response = await apiRequest("POST", "/api/projects", payload);
          
          if (!response.ok) {
            throw new Error("Failed to create project");
          }
          
          const project = await response.json();
          
          // Update state safely
          setSelectedProjectId(project.id);
          setIsNewProject(false);
          setNewProjectSlug(project.slug);
          
          if (!newProjectTitle) {
            setNewProjectTitle(project.title);
          }
          
          toastWithMood("success", "Project ready", `“${project.title}” is now live.`);
          return project.id as string;
        } catch (error) {
          console.error("Project creation failed", error);
          toastWithMood(
            "error",
            "Couldn't start project",
            error instanceof Error ? error.message : "Unknown error"
          );
          return null;
        } finally {
          setAutoCreatingProject(false);
          creatingProjectRef.current = null;
        }
      })();

      creatingProjectRef.current = creationPromise;
      return creationPromise;
    },
    [
      // Remove unnecessary dependencies that might cause recreation loop
      // creatingProjectRef is a ref, so it's stable
      isNewProject,
      journeyData, // Depend on the whole object to be safe, but access props carefully
      newProjectClient,
      newProjectSlug,
      newProjectTitle,
      selectedProjectId,
      toastWithMood,
      brandColorPrimary,
      brandColorSecondary,
      brandColorTertiary
    ]
  );

  const scheduleBrandAutosave = useCallback(
    (payload: BrandFormState) => {
      pendingBrandPayloadRef.current = payload;
      setBrandFormDirty(true);
      if (brandAutoSaveTimeoutRef.current) {
        clearTimeout(brandAutoSaveTimeoutRef.current);
      }
      brandAutoSaveTimeoutRef.current = setTimeout(async () => {
        const projectId = await ensureProject();
        if (!projectId || !pendingBrandPayloadRef.current) {
          setBrandFormDirty(false);
          return;
        }
        try {
          const response = await apiRequest("POST", `/api/projects/${projectId}/brand`, pendingBrandPayloadRef.current);
          if (!response.ok) {
            throw new Error("Auto-save failed");
          }
        } catch (error) {
          console.error("Brand auto-save error", error);
          toastWithMood("error", "Auto-save failed", error instanceof Error ? error.message : "Unknown error");
        } finally {
          setBrandFormDirty(false);
          pendingBrandPayloadRef.current = null;
          if (brandAutoSaveTimeoutRef.current) {
            clearTimeout(brandAutoSaveTimeoutRef.current);
          }
          brandAutoSaveTimeoutRef.current = null;
        }
      }, 900);
    },
    [ensureProject, toastWithMood]
  );

  const setBrandFormWithAutosave = useCallback<Dispatch<SetStateAction<BrandFormState>>>(
    (updater) => {
      setBrandForm((prev) => {
        const next =
          typeof updater === "function" ? (updater as (prev: BrandFormState) => BrandFormState)(prev) : updater;
        scheduleBrandAutosave(next);
        return next;
      });
    },
    [scheduleBrandAutosave]
  );
  
  // AI Chat state with enhanced typing
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [currentSceneJson, setCurrentSceneJson] = useState<string>("");
  const [generatedScenes, setGeneratedScenes] = useState<any>(null);
  const [previewScenes, setPreviewScenes] = useState<any>(null);
  const messageCounter = useRef(0);
  const schedulePreviewUpdate = useCallback(
    (value: string, options?: { immediate?: boolean }) => {
      const run = () => {
        try {
          const parsed = JSON.parse(value);
          setPreviewScenes(Array.isArray(parsed) ? parsed : [parsed]);
          setJsonError(null);
        } catch (error) {
          setJsonError(error instanceof Error ? error.message : "Invalid JSON");
        }
      };
      if (options?.immediate) {
        if (previewDebounceRef.current) {
          clearTimeout(previewDebounceRef.current);
        }
        run();
      } else {
        if (previewDebounceRef.current) {
          clearTimeout(previewDebounceRef.current);
        }
        previewDebounceRef.current = setTimeout(run, 400);
      }
    },
    []
  );
  const resetJsonHistory = useCallback((value: string) => {
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
    }
    historyRef.current = { entries: [value], index: 0 };
    setHistoryIndex(0);
  }, []);
  const appendJsonHistory = useCallback(
    (value: string, options?: { immediate?: boolean }) => {
      const commit = () => {
        const truncated = historyRef.current.entries.slice(0, historyRef.current.index + 1);
        const last = truncated[truncated.length - 1];
        if (last === value) return;
        const nextEntries = [...truncated, value];
        historyRef.current = { entries: nextEntries, index: nextEntries.length - 1 };
        setHistoryIndex(nextEntries.length - 1);
      };
      if (options?.immediate) {
        if (historyDebounceRef.current) {
          clearTimeout(historyDebounceRef.current);
        }
        commit();
      } else {
        if (historyDebounceRef.current) {
          clearTimeout(historyDebounceRef.current);
        }
        historyDebounceRef.current = setTimeout(commit, 400);
      }
    },
    []
  );
  const applySceneJsonFromSource = useCallback(
    (value: string, options?: { resetHistory?: boolean; immediatePreview?: boolean }) => {
      setCurrentSceneJson(value);
      setJsonError(null);
      if (options?.immediatePreview !== false) {
        schedulePreviewUpdate(value, { immediate: true });
      }
      if (options?.resetHistory) {
        resetJsonHistory(value);
      } else {
        appendJsonHistory(value, { immediate: true });
      }
    },
    [appendJsonHistory, resetJsonHistory, schedulePreviewUpdate]
  );
  const focusJsonEditor = useCallback(() => {
    if (!devMode) {
      toastWithMood("warning", "Dev Mode required", "Enable Dev Mode to edit JSON directly.");
      return;
    }
    jsonEditorRef.current?.focus();
  }, [devMode, toastWithMood]);
  const togglePreviewPanel = useCallback(() => {
    setShowPreview((prev) => {
      const next = !prev;
      toastWithMood(next ? "info" : "warning", next ? "Preview docked" : "Preview hidden", next ? "Live preview is visible." : "Preview hidden to free up space.");
      return next;
    });
  }, [toastWithMood]);
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const latestPipelineRun = journeyData?.pipelineRuns?.[0];
  const recentVersions = journeyData?.versions || [];
  const latestVersion = recentVersions?.[0];
  const versionsById = useMemo(() => {
    const map: Record<string, any> = {};
    (recentVersions || []).forEach((version: any) => {
      map[version.id] = version;
    });
    return map;
  }, [recentVersions]);
  const tourSteps = useMemo<GuidedTourStep[]>(() => {
    const steps: GuidedTourStep[] = [
      {
        id: "brand",
        title: "Brand & asset setup",
        description: "Upload logos, palettes, and reference assets before prompting.",
        selector: '[data-tour-id="tour-brand-button"]',
      },
    ];
    if (!isNewProject && selectedProjectId) {
      steps.push(
        {
          id: "sections",
          title: "Section & feature planner",
          description: "Define the sections, feature types, and prompts the AI should honor.",
          selector: '[data-tour-id="tour-section-planner"]',
        },
        {
          id: "pipeline",
          title: "Staged prompt runner",
          description: "Send your brief through the six-stage refinement pipeline.",
          selector: '[data-tour-id="tour-staged-runner"]',
        }
      );
    }
    steps.push({
      id: "chat",
      title: "Chat & prompt assistant",
      description: "Iterate quickly with the assistant and quick prompts.",
      selector: '[data-tour-id="tour-chat-panel"]',
    });
    if (!isMobile) {
      steps.push({
        id: "preview",
        title: "Live preview",
        description: "Watch scenes update as the director iterates.",
        selector: '[data-tour-id="tour-preview-panel"]',
      });
    }
    if (devMode) {
      steps.push({
        id: "json",
        title: "Advanced JSON editor",
        description: "Power users can tweak raw scene JSON with undo/redo and validation.",
        selector: '[data-tour-id="tour-json-editor"]',
      });
    }
    return steps;
  }, [isNewProject, selectedProjectId, isMobile, devMode]);
  const projectReady = !!selectedProjectId && !isNewProject;
  const targetedSectionPromptCount = sectionPlan.filter(
    (section) => section.enablePerSectionPrompt && section.prompt?.trim()
  ).length;
  const hasNewerVersion = Boolean(
    latestVersion && lastAutoLoadedVersionId && latestVersion.id !== lastAutoLoadedVersionId
  );

  const handleOpenShareModal = useCallback(() => {
    if (!selectedProjectId || isNewProject) {
      toastWithMood("warning", "Save project first", "Share links require a saved project.");
      return;
    }
    setShareVersion(null);
    setShareModalOpen(true);
  }, [selectedProjectId, isNewProject, toastWithMood]);
  const handleOpenBrandSheet = useCallback(() => {
    if (!selectedProjectId || isNewProject) {
      toastWithMood("warning", "Save project first", "Brand settings attach to saved projects.");
      return;
    }
    setBrandSheetOpen(true);
  }, [selectedProjectId, isNewProject, toastWithMood]);
  const handleAutoRunToggle = useCallback((value: boolean) => {
    setAutoRunPipeline(value);
    toastWithMood(
      value ? "info" : "warning",
      value ? "Auto-run enabled" : "Auto-run paused",
      value ? "Stages 2-6 will advance automatically." : "Use Resume to continue the pipeline when ready."
    );
  }, [toastWithMood]);
  const handleStartTour = useCallback(() => {
    if (!tourSteps.length) {
      toastWithMood("info", "Tour unavailable", "Select a project to unlock the full walkthrough.");
      return;
    }
    setShowPreview(true);
    setTourStepIndex(0);
    setTourOpen(true);
    toastWithMood("info", "Guided tour ready", "Use Next/Previous or Skip anytime.");
  }, [tourSteps.length, toastWithMood]);
  const handleCloseTour = useCallback(() => {
    setTourOpen(false);
    toastWithMood("success", "Tour complete", "You're ready to keep building.");
  }, [toastWithMood]);
  useEffect(() => {
    if (tourOpen && !tourSteps.length) {
      setTourOpen(false);
      return;
    }
    if (tourOpen && tourStepIndex > tourSteps.length - 1 && tourSteps.length > 0) {
      setTourStepIndex(tourSteps.length - 1);
    }
  }, [tourOpen, tourSteps.length, tourStepIndex]);
  
  // Generate message ID
  const generateMessageId = () => {
    messageCounter.current += 1;
    return `msg-${Date.now()}-${messageCounter.current}`;
  };
  
  // Load existing scenes when project is selected
  useEffect(() => {
    if (existingProjectScenes && existingProjectScenes.length > 0) {
      const serialized = JSON.stringify(
        existingProjectScenes.map((scene: any) => scene.sceneConfig),
        null,
        2
      );
      setPreviewScenes(existingProjectScenes.map((scene: any) => scene.sceneConfig));
      applySceneJsonFromSource(serialized, { resetHistory: true, immediatePreview: false });
    }
  }, [existingProjectScenes, applySceneJsonFromSource]);

  useEffect(() => {
    if (journeyData?.project) {
      setBrandForm({
        logoUrl: journeyData.project.brandLogoUrl || "",
        componentLibrary: journeyData.project.componentLibrary || "shadcn",
        colors: {
          primary: journeyData.project.brandColors?.primary || DEFAULT_BRAND_COLORS.primary,
          secondary: journeyData.project.brandColors?.secondary || DEFAULT_BRAND_COLORS.secondary,
          accent: journeyData.project.brandColors?.accent || DEFAULT_BRAND_COLORS.accent,
          neutral: journeyData.project.brandColors?.neutral || DEFAULT_BRAND_COLORS.neutral,
        },
        assetPlan: journeyData.project.assetPlan || [],
      });
    }
  }, [journeyData]);

  useEffect(() => {
    // Prevent auto-creation if we already have a project, are currently creating one, or aren't in new project mode
    if (!isNewProject || selectedProjectId || autoCreatingProject || creatingProjectRef.current) {
      return;
    }
    
    // Require a minimum title length
    if (!newProjectTitle || newProjectTitle.trim().length < 3) {
      return;
    }
    
    // Debounce check
    if (autoCreateTriggeredRef.current) {
      return;
    }
    
    autoCreateTriggeredRef.current = true;
    
    // Small delay to prevent rapid typing from triggering creation
    const timer = setTimeout(() => {
      const colorsPayload = {
        primary: brandColorPrimary,
        secondary: brandColorSecondary,
        accent: brandColorTertiary,
      };
      ensureProject({ 
        title: newProjectTitle, 
        client: newProjectClient,
        colors: colorsPayload 
      }).catch(err => {
        console.error("Auto-create error:", err);
      }).finally(() => {
        autoCreateTriggeredRef.current = false;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoCreatingProject, ensureProject, isNewProject, newProjectClient, newProjectTitle, selectedProjectId]);

  useEffect(() => {
    if (!newProjectTitle) {
      return;
    }
    const nextSlug = slugifyProjectTitle(newProjectTitle);
    if (nextSlug && nextSlug !== newProjectSlug) {
      setNewProjectSlug(nextSlug);
    }
  }, [newProjectTitle, newProjectSlug]);

  useEffect(() => {
    if (!selectedProjectId || isNewProject) {
      setBrandForm(createDefaultBrandForm());
    }
  }, [selectedProjectId, isNewProject]);

  useEffect(() => {
    if (!selectedProjectId || isNewProject) {
      setBrandSheetOpen(false);
    }
  }, [selectedProjectId, isNewProject]);

  useEffect(() => {
    setAssetFilter(null);
  }, [selectedProjectId, isNewProject]);

  useEffect(() => {
    if (assetFilter && !recommendedFeatures.includes(assetFilter)) {
      setAssetFilter(null);
    }
  }, [assetFilter, recommendedFeatures]);

  useEffect(() => {
    return () => {
      if (historyDebounceRef.current) {
        clearTimeout(historyDebounceRef.current);
      }
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
      if (brandAutoSaveTimeoutRef.current) {
        clearTimeout(brandAutoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (journeyData?.sections && Array.isArray(journeyData.sections)) {
      setSectionPlan(
        journeyData.sections.map((section: any, index: number) => ({
          sectionKey: section.sectionKey || `section-${index + 1}`,
          label: section.label || section.sectionKey || `Section ${index + 1}`,
          featureType: section.featureType || "custom",
          enablePerSectionPrompt: !!section.enablePerSectionPrompt,
          prompt: section.prompt || "",
        }))
      );
    } else if (!selectedProjectId || isNewProject) {
      setSectionPlan([]);
    }
  }, [journeyData, selectedProjectId, isNewProject]);

  useEffect(() => {
    if (!selectedProjectId || isNewProject) return;
    if (latestPipelineRun?.status !== "running") return;
    const interval = setInterval(() => {
      refetchJourney();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedProjectId, isNewProject, latestPipelineRun?.status, refetchJourney]);
  
  // Portfolio generation mutation with optimistic updates
  const generatePortfolioMutation = useMutation({
    mutationFn: async ({ message, conversationHistory }: {
      message: string;
      conversationHistory: ChatMessage[];
    }) => {
      // Validate project setup
      if (isNewProject && (!newProjectTitle || !newProjectSlug || !newProjectClient)) {
        throw new Error("Please set up your project details first");
      }
      
      if (!isNewProject && !selectedProjectId) {
        throw new Error("Please select a project first");
      }
      
      // Parse current scenes for refinement
      let scenesForRefinement = undefined;
      if (currentSceneJson) {
        try {
          const parsed = JSON.parse(currentSceneJson);
          scenesForRefinement = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.error('Failed to parse current scenes:', e);
        }
      }
      
      // Call AI generation endpoint
      const response = await apiRequest("POST", "/api/portfolio/generate-enhanced", {
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
        scenes: scenesForRefinement,
        conversationHistory,
        currentPrompt: message,
        currentSceneJson,
        portfolioAiPrompt: message,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }
      
      return await response.json();
    },
    onMutate: async ({ message }) => {
      // Create optimistic updates
      const userMsgId = generateMessageId();
      const aiMsgId = generateMessageId();
      
      // Predict scene changes based on message content (simple heuristics)
      let predictedChanges = null;
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('color') || lowerMessage.includes('theme')) {
        // Color change detection
        if (lowerMessage.includes('dark')) {
          predictedChanges = { theme: 'dark', applying: 'color scheme' };
        } else if (lowerMessage.includes('light')) {
          predictedChanges = { theme: 'light', applying: 'color scheme' };
        } else if (lowerMessage.includes('blue')) {
          predictedChanges = { primaryColor: '#3B82F6', applying: 'blue color' };
        } else if (lowerMessage.includes('red')) {
          predictedChanges = { primaryColor: '#EF4444', applying: 'red color' };
        } else if (lowerMessage.includes('green')) {
          predictedChanges = { primaryColor: '#10B981', applying: 'green color' };
        }
      } else if (lowerMessage.includes('animation') || lowerMessage.includes('transition')) {
        predictedChanges = { animation: 'adjusting', applying: 'animation settings' };
      } else if (lowerMessage.includes('add scene') || lowerMessage.includes('new scene')) {
        predictedChanges = { addScene: true, applying: 'new scene' };
      }
      
      // Return context for potential rollback
      const previousHistory = [...conversationHistory];
      const previousScenes = previewScenes;
      
      // Apply optimistic scene changes to preview
      if (predictedChanges && previewScenes) {
        const optimisticScenes = [...previewScenes];
        
        // Apply predicted changes to scenes
        if (predictedChanges.primaryColor) {
          optimisticScenes.forEach(scene => {
            if (scene.styles) {
              scene.styles.primaryColor = predictedChanges.primaryColor;
            }
          });
        }
        
        if (predictedChanges.theme) {
          optimisticScenes.forEach(scene => {
            if (!scene.styles) scene.styles = {};
            scene.styles.theme = predictedChanges.theme;
          });
        }
        
        if (predictedChanges.addScene) {
          optimisticScenes.push({
            type: 'text',
            content: {
              headline: 'New Scene Loading...',
              subheadline: 'AI is creating your scene'
            },
            styles: {
              opacity: 0.5
            }
          });
        }
        
        setPreviewScenes(optimisticScenes);
      }
      
      return { 
        previousHistory,
        previousScenes,
        userMsgId,
        aiMsgId,
        predictedChanges
      };
    },
    onSuccess: (result, variables, context) => {
      // Update with real AI response
      const aiResponseMsg: ChatMessage = {
        id: context?.aiMsgId || generateMessageId(),
        role: "assistant",
        content: result.explanation || "Scenes generated successfully!",
        timestamp: Date.now(),
        status: 'ai-complete'
      };
      
      // Update conversation history with real response
      setConversationHistory(prev => {
        const filtered = prev.filter(m => m.id !== context?.aiMsgId);
        return [...filtered, aiResponseMsg];
      });
      
      // Update scenes with real generated content
      if (result.scenes) {
        setGeneratedScenes(result.scenes);
        setPreviewScenes(result.scenes);
        applySceneJsonFromSource(JSON.stringify(result.scenes, null, 2), { resetHistory: true });
      }
      
      // Mark user message as sent
      setConversationHistory(prev => 
        prev.map(msg => 
          msg.id === context?.userMsgId
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
      
      toastWithMood("success", "Scenes generated", `Created ${result.scenes?.length || 0} scenes for this run.`);
    },
    onError: (error, variables, context) => {
      console.error('Generation error:', error);
      
      // Rollback to previous state
      if (context) {
        setConversationHistory(context.previousHistory);
        setPreviewScenes(context.previousScenes);
      }
      
      // Add error message
      const errorMsg: ChatMessage = {
        id: context?.aiMsgId || generateMessageId(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
        timestamp: Date.now(),
        status: 'error'
      };
      
      setConversationHistory(prev => {
        const filtered = prev.filter(m => m.id !== context?.aiMsgId);
        return [...filtered, errorMsg];
      });
      
      // Mark user message as failed
      setConversationHistory(prev => 
        prev.map(msg => 
          msg.id === context?.userMsgId
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );
      
      toastWithMood("error", "Generation failed", error instanceof Error ? error.message : "Failed to process request");
    }
  });
  
  // Save scenes mutation with optimistic updates
  const saveScenesMutation = useMutation({
    mutationFn: async (scenes: any) => {
      const response = await apiRequest("POST", "/api/portfolio/save-generated-scenes", {
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
        scenes: Array.isArray(scenes) ? scenes : [scenes],
      });
      
      if (!response.ok) throw new Error("Failed to save scenes");
      return await response.json();
    },
    onMutate: async () => {
      // Show optimistic success state
      toastWithMood("info", "Saving scenes", "Persisting generated scenes to the database.");
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["/api/projects", selectedProjectId, "scenes"]
      });
      
      // Snapshot previous value
      const previousScenes = queryClient.getQueryData([
        "/api/projects",
        selectedProjectId,
        "scenes",
        { hydrate: true }
      ]);
      
      return { previousScenes };
    },
    onSuccess: (result) => {
      toastWithMood("success", "Scenes saved", "Latest scenes stored successfully.");
      
      if (result.projectId) {
        // Track the project in recent projects
        if (isNewProject) {
          addRecentProject({
            id: result.projectId,
            name: newProjectTitle || "Untitled Project",
            client: newProjectClient,
            slug: newProjectSlug
          });
        } else {
          updateRecentProjectAccess(result.projectId, {
            name: newProjectTitle || "Untitled Project"
          });
        }
        
        setSelectedProjectId(result.projectId);
        setIsNewProject(false);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["/api/projects"]
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", result.projectId, "scenes"]
        });
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousScenes) {
        queryClient.setQueryData(
          ["/api/projects", selectedProjectId, "scenes", { hydrate: true }],
          context.previousScenes
        );
      }
      
      toastWithMood("error", "Save failed", error instanceof Error ? error.message : "Failed to save scenes");
    }
  });

  const saveBrandMutation = useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: BrandFormState }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/brand`, payload);
      return response.json();
    },
    onSuccess: () => {
      toastWithMood("success", "Brand settings saved", "Journey context updated.");
      refetchJourney();
    },
    onError: (error: any) => {
      toastWithMood("error", "Failed to save brand settings", error instanceof Error ? error.message : "Unknown error");
    },
  });

  const saveSectionsMutation = useMutation({
    mutationFn: async ({ projectId, sectionsPayload }: { projectId: string; sectionsPayload: typeof sectionPlan }) => {
      const response = await apiRequest("PUT", `/api/projects/${projectId}/sections`, {
        sections: sectionsPayload.map((section, index) => ({
          ...section,
          orderIndex: index,
        })),
      });
      return response.json();
    },
    onSuccess: () => {
      toastWithMood("success", "Section plan saved", "AI prompting context updated.");
      refetchJourney();
    },
    onError: (error: any) => {
      toastWithMood("error", "Failed to save sections", error instanceof Error ? error.message : "Unknown error");
    },
  });

  const startPipelineMutation = useMutation({
    mutationFn: async ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: { prompt: string; autoContinue: boolean; sectionPrompts?: Array<{ sectionKey: string; prompt: string }> };
    }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/pipeline-runs`, payload);
      return response.json();
    },
    onSuccess: (data) => {
      toastWithMood("success", "Pipeline started", "Stage 1 is running now.");
      if (data?.pipelineRun?.id) {
        setPendingPipelineRunId(data.pipelineRun.id);
      }
      if (data?.version) {
        setInlineVersionDraft(data.version);
      }
      refetchJourney();
    },
    onError: (error: any) => {
      toastWithMood("error", "Failed to start pipeline", error instanceof Error ? error.message : "Unknown error");
    },
  });
  
  // Handle sending chat messages with optimistic updates
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    // Create user message
    const userMsgId = generateMessageId();
    const userMsg: ChatMessage = {
      id: userMsgId,
      tempId: userMsgId,
      role: "user",
      content: message,
      timestamp: Date.now(),
      status: 'sending'
    };
    
    // Create AI thinking message
    const aiMsgId = generateMessageId();
    const aiThinkingMsg: ChatMessage = {
      id: aiMsgId,
      tempId: aiMsgId,
      role: "assistant",
      content: "Analyzing your request...",
      timestamp: Date.now() + 1,
      status: 'ai-thinking'
    };
    
    // Add both messages optimistically
    const newHistory = [...conversationHistory, userMsg, aiThinkingMsg];
    setConversationHistory(newHistory);
    
    // Execute mutation
    generatePortfolioMutation.mutate({
      message,
      conversationHistory: newHistory
    });
  }, [conversationHistory, generatePortfolioMutation]);
  
  // Handle retrying failed messages
  const handleRetryMessage = useCallback((msg: ChatMessage) => {
    if (msg.role === 'user' && msg.content) {
      // Remove failed messages and retry
      setConversationHistory(prev => 
        prev.filter(m => m.id !== msg.id && !m.id.includes(msg.id))
      );
      handleSendMessage(msg.content);
    }
  }, [handleSendMessage]);
  
  // Handle quick actions
  const handleQuickAction = useCallback((action: string) => {
    if (action === "preview") {
      setShowPreview(!showPreview);
    } else if (action === "fullscreen") {
      // Open preview in new tab
      if (selectedProjectId) {
        window.open(`/branding/${selectedProjectId}`, '_blank');
      }
    }
  }, [showPreview, selectedProjectId]);

  const handleLogoUpload = useCallback(async (file: File) => {
    const projectId = await ensureProject({ title: newProjectTitle, client: newProjectClient });
    if (!projectId) {
      toastWithMood("error", "Project not ready", "Create or select a project to attach your logo.");
      return;
    }
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", `${journeyData?.project?.title || "project"}-logo`);
      formData.append("projectId", projectId);
      const response = await fetch("/api/media-library/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const asset = await response.json();
      setBrandFormWithAutosave((prev) => ({
        ...prev,
        logoUrl: asset.cloudinaryUrl || prev.logoUrl,
      }));
      toastWithMood("success", "Logo uploaded", "Preview updated automatically.");
      refetchMediaAssets();
    } catch (error) {
      console.error("Logo upload failed", error);
      toastWithMood("error", "Logo upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploadingLogo(false);
    }
  }, [ensureProject, journeyData?.project?.title, newProjectClient, newProjectTitle, refetchMediaAssets, setBrandFormWithAutosave, toastWithMood]);

  const handleBrandAssetUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;
    const projectId = await ensureProject({ title: newProjectTitle, client: newProjectClient });
    if (!projectId) {
      toastWithMood("error", "Project not ready", "Create or select a project before uploading assets.");
      return;
    }
    setIsUploadingBrandAsset(true);
    try {
      const uploads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        if (recommendedFeatures.length) {
          formData.append("tags", recommendedFeatures.join(","));
        }
        const response = await fetch("/api/media-library/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Upload failed");
        }
        return response.json();
      });
      const uploadedAssets = await Promise.all(uploads);
      if (uploadedAssets.length) {
        setBrandFormWithAutosave((prev) => {
          const existingIds = new Set(prev.assetPlan.map((item) => item.assetId));
          const mergedPlan = [
            ...prev.assetPlan,
            ...uploadedAssets
              .filter((asset) => !existingIds.has(asset.id))
              .map((asset) => ({
                assetId: asset.id,
                label: asset.label || asset.cloudinaryUrl || asset.id,
              })),
          ];
          return {
            ...prev,
            assetPlan: mergedPlan,
          };
        });
      }
      toastWithMood("success", "Assets uploaded", `${files.length} asset${files.length > 1 ? "s" : ""} added to the library.`);
      refetchMediaAssets();
    } catch (error) {
      toastWithMood("error", "Upload failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUploadingBrandAsset(false);
    }
  }, [ensureProject, newProjectClient, newProjectTitle, refetchMediaAssets, recommendedFeatures, setBrandFormWithAutosave, toastWithMood]);

  const toggleAssetSelection = useCallback((asset: MediaAsset) => {
    setBrandFormWithAutosave((prev) => {
      const exists = prev.assetPlan.some((item) => item.assetId === asset.id);
      if (exists) {
        return {
          ...prev,
          assetPlan: prev.assetPlan.filter((item) => item.assetId !== asset.id),
        };
      }
      return {
        ...prev,
        assetPlan: [
          ...prev.assetPlan,
          {
            assetId: asset.id,
            label: asset.label || asset.id,
          },
        ],
      };
    });
  }, [setBrandFormWithAutosave]);

  const moveSection = useCallback((index: number, direction: "up" | "down") => {
    setSectionPlan((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next.map((section, idx) => ({ ...section, orderIndex: idx }));
    });
  }, []);

  const sectionWarnings = useCallback((section: { label: string; featureType: string; enablePerSectionPrompt?: boolean; prompt?: string }) => {
    const warnings: string[] = [];
    if (!section.label?.trim()) warnings.push("Label missing");
    if (!section.featureType) warnings.push("Feature missing");
    if (section.enablePerSectionPrompt && !section.prompt?.trim()) warnings.push("Prompt missing");
    return warnings;
  }, []);

  const handleAppendPrompt = useCallback((prompt: string) => {
    setPipelinePrompt(prev => appendPrompt(prev, prompt));
    toastWithMood("info", "Prompt added", "Suggestion appended to pipeline input.");
  }, [toastWithMood]);

  const handleAppendSectionPrompt = useCallback((index: number, prompt: string) => {
    setSectionPlan(prev =>
      prev.map((section, i) =>
        i === index
          ? {
              ...section,
              prompt: appendPrompt(section.prompt || "", prompt),
            }
          : section
      )
    );
    toastWithMood("info", "Section prompt updated", "Suggestion added to section prompt.");
  }, [toastWithMood]);

  const chatSuggestedPrompts = useMemo(
    () => CHAT_QUICK_ACTIONS.map(action => action.content),
    []
  );

  const handleResumePipeline = useCallback(async () => {
    if (!selectedProjectId || !latestPipelineRun) return;
    setIsResumingPipeline(true);
    try {
      await apiRequest("POST", `/api/projects/${selectedProjectId}/pipeline-runs/${latestPipelineRun.id}/resume`);
      toastWithMood("success", "Pipeline resumed", "Background stages are running.");
      refetchJourney();
    } catch (error) {
      toastWithMood("error", "Failed to resume", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsResumingPipeline(false);
    }
  }, [selectedProjectId, latestPipelineRun, toastWithMood, refetchJourney]);

  const handleSaveBrand = useCallback(async () => {
    const projectId = await ensureProject({ title: newProjectTitle, client: newProjectClient });
    if (!projectId) {
      toastWithMood("error", "Project not ready", "Create or select a project before saving brand settings.");
      return;
    }
    saveBrandMutation.mutate({ projectId, payload: brandForm });
  }, [brandForm, ensureProject, newProjectClient, newProjectTitle, saveBrandMutation, toastWithMood]);

  const addSectionRow = useCallback(() => {
    setSectionPlan((prev) => [...prev, createSectionTemplate(prev.length)]);
  }, []);

  const removeSectionRow = useCallback((index: number) => {
    setSectionPlan((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateSectionField = useCallback(
    (index: number, field: "sectionKey" | "label" | "featureType" | "enablePerSectionPrompt" | "prompt", value: string | boolean) => {
      setSectionPlan((prev) =>
        prev.map((section, i) =>
          i === index
            ? {
                ...section,
                [field]: value,
              }
            : section
        )
      );
    },
    []
  );

  const handleSaveSections = useCallback(async () => {
    const projectId = await ensureProject({ title: newProjectTitle, client: newProjectClient });
    if (!projectId) {
      toastWithMood("error", "Project not ready", "You need a project before planning sections.");
      return;
    }
    saveSectionsMutation.mutate({ projectId, sectionsPayload: sectionPlan });
  }, [ensureProject, newProjectClient, newProjectTitle, toastWithMood, saveSectionsMutation, sectionPlan]);

  const handleStartPipeline = useCallback(async () => {
    if (!pipelinePrompt.trim()) {
      toastWithMood("warning", "Prompt required", "Describe what the director should build before running the pipeline.");
      return;
    }
    const projectId = await ensureProject({ title: newProjectTitle, client: newProjectClient });
    if (!projectId) {
      toastWithMood("error", "Project not ready", "Create or select a project before running the pipeline.");
      return;
    }
    const sectionPrompts = sectionPlan
      .filter((section) => section.enablePerSectionPrompt && section.prompt?.trim())
      .map((section) => ({
        sectionKey: section.sectionKey,
        prompt: section.prompt!.trim(),
      }));
    startPipelineMutation.mutate({
      projectId,
      payload: {
      prompt: pipelinePrompt.trim(),
      autoContinue: autoRunPipeline,
      sectionPrompts: sectionPrompts.length ? sectionPrompts : undefined,
      },
    });
  }, [
    ensureProject,
    newProjectClient,
    newProjectTitle,
    pipelinePrompt,
    sectionPlan,
    startPipelineMutation,
    toastWithMood,
    autoRunPipeline,
  ]);

  const handleLoadVersion = useCallback((version: any) => {
    if (!version?.scenesJson) return;
    setGeneratedScenes(version.scenesJson);
    setPreviewScenes(version.scenesJson);
    applySceneJsonFromSource(JSON.stringify(version.scenesJson, null, 2));
    setLastAutoLoadedVersionId(version.id);
    toastWithMood("info", `Loaded version v${version.versionNumber}`, version.stageKey ? `Source: ${version.stageKey}` : undefined);
  }, [applySceneJsonFromSource, toastWithMood]);

  useEffect(() => {
    if (!inlineVersionDraft) return;
    handleLoadVersion(inlineVersionDraft);
    setInlineVersionDraft(null);
  }, [inlineVersionDraft, handleLoadVersion]);

  useEffect(() => {
    if (!pendingPipelineRunId || !journeyData?.versions) return;
    const stage1Version = journeyData.versions.find(
      (version: any) => version.pipelineRunId === pendingPipelineRunId && version.stageKey === "stage1_initial"
    );
    if (stage1Version && stage1Version.id !== lastAutoLoadedVersionId) {
      handleLoadVersion(stage1Version);
      setPendingPipelineRunId(null);
    }
  }, [journeyData?.versions, pendingPipelineRunId, lastAutoLoadedVersionId, handleLoadVersion]);
  
  const handleEvaluateComparison = useCallback(() => {
    if (!compareVersionA || !compareVersionB) {
      setCompareDiffs(null);
      return;
    }
    if (compareVersionA === compareVersionB) {
      toastWithMood("warning", "Select different versions", "Please choose two different versions to compare.");
      return;
    }
    const versionAData = versionsById[compareVersionA];
    const versionBData = versionsById[compareVersionB];
    if (!versionAData || !versionBData) {
      toastWithMood("error", "Versions unavailable", "Unable to find version data for comparison.");
      return;
    }
    setCompareDiffs(diffScenes(versionAData.scenesJson, versionBData.scenesJson));
  }, [compareVersionA, compareVersionB, versionsById, toastWithMood]);

  useEffect(() => {
    if (compareVersionA && compareVersionB) {
      handleEvaluateComparison();
    } else {
      setCompareDiffs(null);
    }
  }, [compareVersionA, compareVersionB, handleEvaluateComparison]);

  // Handle saving scenes
  const handleSaveScenes = useCallback(() => {
    if (generatedScenes) {
      saveScenesMutation.mutate(generatedScenes);
    }
  }, [generatedScenes, saveScenesMutation]);
  
  const handleSceneJsonChange = useCallback((value: string) => {
    setCurrentSceneJson(value);
    schedulePreviewUpdate(value);
    appendJsonHistory(value);
  }, [appendJsonHistory, schedulePreviewUpdate]);
  const builderShortcuts = useMemo<KeyboardShortcut[]>(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "g",
        metaKey: true,
        shiftKey: true,
        description: "Start guided tour",
        action: handleStartTour,
        category: "Portfolio Builder",
      },
    ];
    if (!isMobile) {
      shortcuts.push({
        key: "p",
        metaKey: true,
        shiftKey: true,
        description: "Toggle live preview",
        action: togglePreviewPanel,
        category: "Portfolio Builder",
      });
    }
    if (!isNewProject && selectedProjectId) {
      shortcuts.push(
        {
          key: "Enter",
          metaKey: true,
          description: "Run pipeline",
          action: handleStartPipeline,
          category: "Portfolio Builder",
        },
        {
          key: "s",
          metaKey: true,
          shiftKey: true,
          description: "Save section plan",
          action: handleSaveSections,
          category: "Portfolio Builder",
        },
        {
          key: "e",
          metaKey: true,
          shiftKey: true,
          description: "Share portfolio",
          action: handleOpenShareModal,
          category: "Portfolio Builder",
        },
        {
          key: "b",
          metaKey: true,
          shiftKey: true,
          description: "Open brand setup",
          action: handleOpenBrandSheet,
          category: "Portfolio Builder",
        }
      );
      shortcuts.push({
        key: "r",
        metaKey: true,
        shiftKey: true,
        description: latestPipelineRun?.status === "paused" ? "Resume pipeline" : "Run pipeline",
        action: latestPipelineRun?.status === "paused" ? handleResumePipeline : handleStartPipeline,
        category: "Portfolio Builder",
      });
      if (generatedScenes) {
        shortcuts.push({
          key: "l",
          metaKey: true,
          shiftKey: true,
          description: "Save generated scenes",
          action: handleSaveScenes,
          category: "Portfolio Builder",
        });
      }
    }
    if (devMode) {
      shortcuts.push({
        key: "j",
        metaKey: true,
        shiftKey: true,
        description: "Focus JSON editor",
        action: focusJsonEditor,
        category: "Portfolio Builder",
      });
    }
    return shortcuts;
  }, [
    handleStartTour,
    isMobile,
    togglePreviewPanel,
    isNewProject,
    selectedProjectId,
    handleStartPipeline,
    handleSaveSections,
    handleOpenShareModal,
    handleOpenBrandSheet,
    latestPipelineRun?.status,
    handleResumePipeline,
    generatedScenes,
    handleSaveScenes,
    devMode,
    focusJsonEditor,
  ]);
  useKeyboardShortcuts(builderShortcuts, true);
  useEffect(() => {
    registerShortcuts("portfolio-builder", builderShortcuts);
    return () => unregisterShortcuts("portfolio-builder");
  }, [builderShortcuts, registerShortcuts, unregisterShortcuts]);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < (historyRef.current.entries.length - 1);
  const handleUndoJson = useCallback(() => {
    if (historyRef.current.index <= 0) return;
    const nextIndex = historyRef.current.index - 1;
    historyRef.current.index = nextIndex;
    setHistoryIndex(nextIndex);
    const value = historyRef.current.entries[nextIndex] ?? "";
    setCurrentSceneJson(value);
    schedulePreviewUpdate(value, { immediate: true });
    setJsonError(null);
  }, [schedulePreviewUpdate]);
  const handleRedoJson = useCallback(() => {
    if (historyRef.current.index >= historyRef.current.entries.length - 1) return;
    const nextIndex = historyRef.current.index + 1;
    historyRef.current.index = nextIndex;
    setHistoryIndex(nextIndex);
    const value = historyRef.current.entries[nextIndex] ?? "";
    setCurrentSceneJson(value);
    schedulePreviewUpdate(value, { immediate: true });
    setJsonError(null);
  }, [schedulePreviewUpdate]);
  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentSceneJson);
      toastWithMood("success", "JSON copied", "Scene JSON copied to clipboard.");
    } catch {
      toastWithMood("error", "Copy failed", "Select and copy manually.");
    }
  }, [currentSceneJson, toastWithMood]);
  const handleBeautifyJson = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(currentSceneJson), null, 2);
      setCurrentSceneJson(formatted);
      schedulePreviewUpdate(formatted, { immediate: true });
      appendJsonHistory(formatted, { immediate: true });
      toastWithMood("success", "Beautified JSON", "Formatting applied.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(message);
      toastWithMood("error", "Invalid JSON", message);
    }
  }, [currentSceneJson, schedulePreviewUpdate, appendJsonHistory, toastWithMood]);
  const handleMinifyJson = useCallback(() => {
    try {
      const minified = JSON.stringify(JSON.parse(currentSceneJson));
      setCurrentSceneJson(minified);
      schedulePreviewUpdate(minified, { immediate: true });
      appendJsonHistory(minified, { immediate: true });
      toastWithMood("success", "Minified JSON", "Whitespace removed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(message);
      toastWithMood("error", "Invalid JSON", message);
    }
  }, [currentSceneJson, schedulePreviewUpdate, appendJsonHistory, toastWithMood]);
  const handleValidateJson = useCallback(() => {
    try {
      JSON.parse(currentSceneJson);
      setJsonError(null);
      toastWithMood("success", "JSON is valid", "No syntax errors detected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      setJsonError(message);
      toastWithMood("error", "Invalid JSON", message);
    }
  }, [currentSceneJson, toastWithMood]);
  const searchMatchCount = useMemo(() => {
    if (!jsonSearchTerm) return 0;
    const regex = new RegExp(jsonSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = currentSceneJson.match(regex);
    return matches ? matches.length : 0;
  }, [jsonSearchTerm, currentSceneJson]);
  const handleFindNext = useCallback(() => {
    if (!jsonSearchTerm || !jsonEditorRef.current) return;
    const value = currentSceneJson;
    const start = jsonEditorRef.current.selectionEnd ?? 0;
    let index = value.indexOf(jsonSearchTerm, start);
    if (index === -1) {
      index = value.indexOf(jsonSearchTerm);
    }
    if (index === -1) return;
    jsonEditorRef.current.focus();
    jsonEditorRef.current.setSelectionRange(index, index + jsonSearchTerm.length);
  }, [jsonSearchTerm, currentSceneJson]);
  const handleFindPrevious = useCallback(() => {
    if (!jsonSearchTerm || !jsonEditorRef.current) return;
    const value = currentSceneJson;
    const start = jsonEditorRef.current.selectionStart ?? value.length;
    let index = value.lastIndexOf(jsonSearchTerm, start - jsonSearchTerm.length - 1);
    if (index === -1) {
      index = value.lastIndexOf(jsonSearchTerm);
    }
    if (index === -1) return;
    jsonEditorRef.current.focus();
    jsonEditorRef.current.setSelectionRange(index, index + jsonSearchTerm.length);
  }, [jsonSearchTerm, currentSceneJson]);
  
  return (
    <ProtectedRoute>
      <MobileOverlay 
        includeTablets={false}
        customMessage="The Portfolio Builder's AI features and preview panel work best on desktop. You can continue on mobile, but we recommend desktop for the optimal creative experience."
      />
      <Helmet>
        <title>Portfolio Builder | Admin</title>
      </Helmet>
      
      <SidebarProvider defaultOpen={false} style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-lg md:text-2xl font-bold">Portfolio Builder</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTour}
                  data-testid="button-guided-tour"
                >
                  <LifeBuoy className="w-4 h-4 mr-2" />
                  Tour
                </Button>
                {/* Share Button - Primary Action */}
                {selectedProjectId && !isNewProject && (
                  <Button
                    variant="default"
                    onClick={handleOpenShareModal}
                    data-testid="button-share-portfolio"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}

                {/* Brand & Asset Setup */}
                {selectedProjectId && !isNewProject ? (
                  <Sheet open={brandSheetOpen} onOpenChange={setBrandSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-brand-setup"
                        data-tour-id="tour-brand-button"
                        onClick={handleOpenBrandSheet}
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Brand & Assets</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Brand & Asset Setup</SheetTitle>
                        <SheetDescription>
                          Upload logos, align palettes, and curate reference assets before prompting the AI director.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-4">
                        {isJourneyLoading ? (
                          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                            Loading brand data...
                          </div>
                        ) : journeyError ? (
                          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                            {(journeyError as Error).message || "Unable to load brand configuration"}
                          </div>
                        ) : (
                          <BrandSetupPanel
                            brandForm={brandForm}
                            setBrandForm={setBrandFormWithAutosave}
                            mediaAssets={mediaAssets}
                            assetFilter={assetFilter}
                            onSelectAssetFilter={setAssetFilter}
                            recommendedFeatures={recommendedFeatures}
                            onOpenAssetLibrary={() => window.open("/admin/media-library", "_blank")}
                            isUploading={isUploadingBrandAsset}
                            onUploadAssets={handleBrandAssetUpload}
                            logoUploading={isUploadingLogo}
                            onUploadLogo={handleLogoUpload}
                            onAssetToggle={toggleAssetSelection}
                            onSave={handleSaveBrand}
                            saving={saveBrandMutation.isPending}
                            mediaAssetsLoading={isMediaLoading}
                            projectTitle={journeyData?.project?.title}
                          />
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-60"
                    title="Save your project to configure brand settings"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Brand & Assets</span>
                  </Button>
                )}
                
                {/* Dev Mode Toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
                        <Code2 className="w-4 h-4 text-muted-foreground" />
                        <span className="hidden sm:inline text-sm font-medium">Dev Mode</span>
                        <Switch
                          checked={devMode}
                          onCheckedChange={setDevMode}
                          data-testid="dev-mode-toggle"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle Dev Mode to show/hide JSON editor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Preview Toggle (Mobile) */}
                {isMobile && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPreview(!showPreview)}
                    data-testid="preview-toggle-mobile"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
              <div className={`h-full ${isMobile ? 'flex flex-col' : 'flex'}`}>
                {/* Chat Interface - Primary */}
                <div className={`
                  ${isMobile ? 'flex-1' : devMode ? 'w-[40%]' : 'w-[70%]'} 
                  ${!isMobile && (devMode || showPreview) ? 'border-r' : ''}
                  flex flex-col h-full
                `}>
                  {/* Linear Builder Steps */}
                  <div className={`border-b overflow-y-auto ${isMobile ? "" : "max-h-[60vh]"}`}>
                    <div className="space-y-4 p-4">
                      <StepCard
                        stepLabel="Start"
                        title="Project Workspace"
                        description="Name your build or jump into an existing portfolio."
                        completed={projectReady}
                      >
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={isNewProject ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setIsNewProject(true);
                              setSelectedProjectId("");
                            }}
                          >
                            New Project
                          </Button>
                          <Button variant={!isNewProject ? "default" : "outline"} size="sm" onClick={() => setIsNewProject(false)}>
                            Existing Project
                          </Button>
                          {autoCreatingProject && (
                            <Badge variant="secondary" className="animate-pulse">
                              Creating…
                            </Badge>
                          )}
                        </div>
                        {isNewProject ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                placeholder="Project Title *"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                              />
                              <Input placeholder="Slug *" value={newProjectSlug} onChange={(e) => setNewProjectSlug(e.target.value)} />
                              <Input
                                placeholder="Client Name *"
                                value={newProjectClient}
                                onChange={(e) => setNewProjectClient(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Primary</Label>
                                <Input
                                  type="color"
                                  value={brandColorPrimary}
                                  onChange={(e) => setBrandColorPrimary(e.target.value)}
                                  className="w-16 h-8 p-1"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Secondary</Label>
                                <Input
                                  type="color"
                                  value={brandColorSecondary}
                                  onChange={(e) => setBrandColorSecondary(e.target.value)}
                                  className="w-16 h-8 p-1"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Accent</Label>
                                <Input
                                  type="color"
                                  value={brandColorTertiary}
                                  onChange={(e) => setBrandColorTertiary(e.target.value)}
                                  className="w-16 h-8 p-1"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground self-center mt-4 ml-2">Brand swatches for quick naming + analytics.</span>
                            </div>
                          </div>
                        ) : (
                          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent>
                              {projects?.map((project) => (
                                <SelectItem key={project.id} value={project.id.toString()}>
                                  {project.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </StepCard>

                      <StepCard
                        stepLabel="Step 1"
                        title="Upload Logo"
                        description="Drop a logo or paste a URL. We'll auto-attach it to your project."
                        completed={Boolean(brandForm.logoUrl)}
                      >
                        <div className="space-y-3">
                          <Input
                            placeholder="https://cdn.yourbrand.com/logo.svg"
                            value={brandForm.logoUrl}
                            onChange={(e) =>
                              setBrandFormWithAutosave((prev) => ({
                                ...prev,
                                logoUrl: e.target.value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap gap-2">
                            <input
                              ref={inlineLogoUploadRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                  void handleLogoUpload(file);
                                }
                                if (event.target) {
                                  event.target.value = "";
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => inlineLogoUploadRef.current?.click()}
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Logo
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={handleOpenBrandSheet}
                              disabled={!projectReady}
                            >
                              Manage in Brand Sheet
                            </Button>
                      </div>
                          {brandForm.logoUrl && (
                            <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
                              <img src={brandForm.logoUrl} alt="Brand logo preview" className="h-12 w-12 object-contain" />
                              <span className="text-xs text-muted-foreground break-all">{brandForm.logoUrl}</span>
                            </div>
                          )}
                        </div>
                      </StepCard>

                      <StepCard
                        stepLabel="Step 2"
                        title="Brand Colors"
                        description="Pick the palette the AI will lean on for every component."
                        completed={
                          Boolean(brandForm.colors?.primary && brandForm.colors?.secondary && brandForm.colors?.accent)
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(["primary", "secondary", "accent", "neutral"] as Array<keyof BrandFormState["colors"]>).map(
                            (key) => (
                              <div key={key} className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground">{key}</Label>
                        <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={brandForm.colors?.[key] || DEFAULT_BRAND_COLORS[key]}
                                    onChange={(e) =>
                                      setBrandFormWithAutosave((prev) => ({
                                        ...prev,
                                        colors: {
                                          ...prev.colors,
                                          [key]: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-14 h-12 p-1"
                                  />
                                  <Input
                                    value={brandForm.colors?.[key] || ""}
                                    onChange={(e) =>
                                      setBrandFormWithAutosave((prev) => ({
                                        ...prev,
                                        colors: {
                                          ...prev.colors,
                                          [key]: e.target.value,
                                        },
                                      }))
                                    }
                                    placeholder="#000000"
                                  />
                        </div>
                      </div>
                            )
                          )}
                        </div>
                      </StepCard>

                      <StepCard
                        stepLabel="Step 3"
                        title="Component Library"
                        description="Tell the AI which UI kit to reference."
                        completed={Boolean(brandForm.componentLibrary)}
                      >
                        <Select
                          value={brandForm.componentLibrary}
                          onValueChange={(value) =>
                            setBrandFormWithAutosave((prev) => ({
                              ...prev,
                              componentLibrary: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a library" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPONENT_LIBRARIES.map((library) => (
                              <SelectItem key={library.value} value={library.value}>
                                {library.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </StepCard>

                      <StepCard
                        stepLabel="Step 4"
                        title="Upload Assets"
                        description="Hero shots, proof logos, ebooks—anything the director should see."
                        completed={brandForm.assetPlan.length > 0}
                      >
                        <input
                          ref={inlineAssetUploadRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(event) => {
                            if (event.target.files?.length) {
                              void handleBrandAssetUpload(event.target.files);
                              event.target.value = "";
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => inlineAssetUploadRef.current?.click()}
                            disabled={isUploadingBrandAsset}
                          >
                            {isUploadingBrandAsset ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Assets
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open("/admin/media-library", "_blank")}
                          >
                            Open Media Library
                          </Button>
                        </div>
                        {brandForm.assetPlan.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No reference assets yet.</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {brandForm.assetPlan.map((assetRef) => {
                              const preview = mediaAssets?.find((asset) => asset.id === assetRef.assetId);
                              return (
                                <div key={assetRef.assetId} className="relative rounded-md border overflow-hidden">
                                  {preview ? (
                                    preview.mediaType === "video" ? (
                                      <video src={preview.cloudinaryUrl} className="h-28 w-full object-cover" muted />
                                    ) : (
                                      <img src={preview.cloudinaryUrl} alt={assetRef.label} className="h-28 w-full object-cover" />
                                    )
                                  ) : (
                                    <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
                                      {assetRef.label || assetRef.assetId}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                      toggleAssetSelection(
                                        preview || {
                                          id: assetRef.assetId,
                                          cloudinaryUrl: "",
                                          mediaType: "image",
                                        }
                                      )
                                    }
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </StepCard>

                      <div data-tour-id="tour-section-planner">
                        <StepCard
                          stepLabel="Step 5"
                          title="Sections & Features"
                          description="Outline the structure before you prompt the director."
                          completed={sectionPlan.length > 0}
                          actionSlot={
                            sectionPlan.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveSections}
                                disabled={saveSectionsMutation.isPending}
                              >
                                {saveSectionsMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Save Plan
                                  </>
                                )}
                              </Button>
                            )
                          }
                        >
                        {sectionPlan.length === 0 ? (
                          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center">
                            No sections configured yet. Add the sections you want the AI director to produce.
                          </div>
                        ) : (
                          <div className="space-y-3">
                              {sectionPlan.map((section, index) => (
                            <Card key={`${section.sectionKey}-${index}`} className="border shadow-none">
                                <CardHeader className="space-y-2 py-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <CardTitle className="text-base flex items-center gap-2">
                                        Section {index + 1}
                                          {sectionWarnings(section).length === 0 && <Badge variant="secondary">Ready</Badge>}
                                      </CardTitle>
                                      <CardDescription>
                                          {FEATURE_TYPES.find((f) => f.value === section.featureType)?.label || "Custom"}
                                      </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveSection(index, "up")}
                                        disabled={index === 0}
                                        aria-label="Move section up"
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveSection(index, "down")}
                                        disabled={index === sectionPlan.length - 1}
                                        aria-label="Move section down"
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSectionRow(index)}
                                        aria-label="Remove section"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {sectionWarnings(section).length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {sectionWarnings(section).map((warning) => (
                                        <Badge key={warning} variant="destructive" className="flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          {warning}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label>Section Key</Label>
                                      <Input
                                        value={section.sectionKey}
                                        onChange={(e) => updateSectionField(index, "sectionKey", e.target.value)}
                                        placeholder="section-hero"
                                      />
                                    </div>
                                    <div>
                                      <Label>Label</Label>
                                      <Input
                                        value={section.label}
                                        onChange={(e) => updateSectionField(index, "label", e.target.value)}
                                        placeholder="Hero Intro"
                                      />
                                    </div>
                                  </div>
                                    <div>
                                      <Label>Feature Type</Label>
                                      <Select
                                        value={section.featureType}
                                        onValueChange={(value) => updateSectionField(index, "featureType", value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select feature" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {FEATURE_TYPES.map((feature) => (
                                            <SelectItem key={feature.value} value={feature.value}>
                                              {feature.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                </CardContent>
                                </Card>
                                  ))}
                                </div>
                              )}
                          <div className="flex flex-wrap gap-2 justify-between pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={addSectionRow}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Section
                          </Button>
                            <p className="text-xs text-muted-foreground">
                              Need help? Use the prompts below to fine-tune each section.
                            </p>
                        </div>
                        </StepCard>
                      </div>

                      <div data-tour-id="tour-staged-runner">
                        <StepCard
                          stepLabel="Step 6"
                          title="Director Brief & Pipeline"
                          description="Write the global prompt, then watch Stage 1 return JSON immediately."
                          completed={Boolean(latestPipelineRun && latestPipelineRun.status === "completed")}
                          actionSlot={
                            hasNewerVersion && latestVersion ? (
                              <Button variant="outline" size="sm" onClick={() => handleLoadVersion(latestVersion)}>
                                Load Latest
                              </Button>
                            ) : null
                          }
                        >
                    <Textarea
                      value={pipelinePrompt}
                      onChange={(e) => setPipelinePrompt(e.target.value)}
                      placeholder="Example: Build a cinematic GTM Engine landing page with a dramatic hero, proof carousel, and ebook CTA."
                      rows={3}
                      disabled={startPipelineMutation.isPending}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                              {targetedSectionPromptCount} targeted section prompt
                              {targetedSectionPromptCount === 1 ? "" : "s"} armed
                      </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {GLOBAL_PROMPT_SUGGESTIONS.map((suggestion) => (
                        <Button
                          key={suggestion.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleAppendPrompt(suggestion.prompt)}
                        >
                          <span>{suggestion.label}</span>
                        </Button>
                      ))}
                    </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                              <Switch checked={autoRunPipeline} onCheckedChange={handleAutoRunToggle} id="auto-run-switch" />
                          <label htmlFor="auto-run-switch" className="text-xs font-medium">
                            Auto-run background stages
                          </label>
                        </div>
                        {latestPipelineRun?.status === "paused" && (
                              <Button variant="secondary" size="sm" onClick={handleResumePipeline} disabled={isResumingPipeline}>
                            {isResumingPipeline ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Resuming...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Resume Pipeline
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPipelinePrompt("")}
                              disabled={!pipelinePrompt || startPipelineMutation.isPending}
                            >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleStartPipeline}
                          disabled={!pipelinePrompt.trim() || startPipelineMutation.isPending}
                        >
                          {startPipelineMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Run Pipeline
                            </>
                          )}
                        </Button>
                    </div>
                    <div className="space-y-2">
                      {PIPELINE_STAGE_UI.map((stage) => {
                        const stageState = latestPipelineRun?.stages?.find((s: any) => s.key === stage.key);
                        const status = stageState?.status || "pending";
                        const stageVersion = recentVersions.find((version: any) => version.stageKey === stage.key);
                        return (
                          <div key={stage.key} className="flex items-center gap-3 justify-between">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                status === "succeeded"
                                  ? "bg-emerald-500"
                                  : status === "running"
                                  ? "bg-blue-500 animate-pulse"
                                  : status === "failed"
                                  ? "bg-red-500"
                                  : "bg-muted-foreground/40"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{stage.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {status === "succeeded" && stageState?.completedAt
                                  ? `Completed ${new Date(stageState.completedAt).toLocaleTimeString()}`
                                  : status === "running"
                                  ? "In progress..."
                                  : status === "failed"
                                  ? stageState?.error || "Failed"
                                  : "Waiting"}
                              </p>
                            </div>
                            {stageVersion && (
                                    <Button variant="ghost" size="sm" onClick={() => setStagePreviewVersion(stageVersion)}>
                                View JSON
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {recentVersions.length > 0 && (
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Recent Versions</p>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={recentVersions.length < 2}
                            onClick={() => {
                              setCompareDialogOpen(true);
                              if (!compareVersionA && recentVersions[0]) {
                                setCompareVersionA(recentVersions[0].id);
                              }
                              if (!compareVersionB && recentVersions[1]) {
                                setCompareVersionB(recentVersions[1].id);
                              }
                            }}
                          >
                            Compare
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {recentVersions.map((version: any) => (
                            <div key={version.id} className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 justify-between text-left"
                                onClick={() => handleLoadVersion(version)}
                              >
                                <div>
                                  <span className="font-semibold mr-2">v{version.versionNumber}</span>
                                  <span className="text-xs uppercase text-muted-foreground">
                                    {version.stageKey?.replace(/_/g, " ") || "manual"}
                                  </span>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(version.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {typeof version.confidenceScore === "number" ? (
                                        <span className="text-xs text-emerald-600">{version.confidenceScore}% confidence</span>
                                ) : (
                                  <Badge variant="secondary" className="ml-2">
                                    {version.scenesJson?.length || 0} scenes
                                  </Badge>
                                )}
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0"
                                      onClick={() => {
                                        setShareVersion(version);
                                        setShareModalOpen(true);
                                      }}
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                        <TooltipContent>Share version v{version.versionNumber}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                        </StepCard>
                  </div>

                      <StepCard
                        stepLabel="Step 7"
                        title="Per-section Prompts"
                        description="Optional advanced instructions sent alongside your main brief."
                        completed={targetedSectionPromptCount > 0}
                      >
                        {sectionPlan.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Add sections first, then unlock per-section prompts.</p>
                        ) : (
                          <div className="space-y-3">
                            {sectionPlan.map((section, index) => {
                              const insightPrompts = buildPromptOptions(section);
                              return (
                                <div key={`${section.sectionKey}-prompt`} className="rounded-lg border p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">{section.label || section.sectionKey}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {FEATURE_TYPES.find((f) => f.value === section.featureType)?.label || "Custom"}
                                      </p>
                                    </div>
                                    <Switch
                                      checked={!!section.enablePerSectionPrompt}
                                      onCheckedChange={(checked) => updateSectionField(index, "enablePerSectionPrompt", checked)}
                                    />
                                  </div>
                                  {section.enablePerSectionPrompt && (
                                    <Textarea
                                      value={section.prompt || ""}
                                      onChange={(e) => updateSectionField(index, "prompt", e.target.value)}
                                      placeholder="Describe exactly what this section should accomplish..."
                                      rows={3}
                                    />
                                  )}
                                  {section.enablePerSectionPrompt && insightPrompts.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {insightPrompts.map((option) => (
                                        <Button
                                          key={option.label}
                                          type="button"
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => handleAppendSectionPrompt(index, option.prompt)}
                                          className="text-xs"
                                        >
                                          {option.label}
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          These prompts ride along with Stage 1 so Gemini can personalize each section’s tone.
                        </p>
                      </StepCard>
                    </div>
                  </div>
                  {/* Main Chat Interface with Optimistic Updates */}
                  <div className="flex-1 overflow-hidden" data-tour-id="tour-chat-panel">
                    <ChatInterface
                      conversationHistory={conversationHistory}
                      onSendMessage={handleSendMessage}
                      onRetryMessage={handleRetryMessage}
                      isProcessing={generatePortfolioMutation.isPending}
                      suggestedPrompts={chatSuggestedPrompts}
                      onQuickAction={handleQuickAction}
                      className="h-full border-0 rounded-none"
                      debugMode={false}
                      enableOptimistic={true}
                    />
                  </div>
                  
                  {/* Save Button (when scenes are generated) */}
                  {generatedScenes && (
                    <div className="p-4 border-t bg-muted/20">
                      <Button 
                        onClick={handleSaveScenes} 
                        className="w-full"
                        disabled={saveScenesMutation.isPending}
                      >
                        {saveScenesMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Save {Array.isArray(generatedScenes) ? generatedScenes.length : 1} Scenes to Database
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* JSON Editor - Only visible in Dev Mode */}
                {devMode && !isMobile && (
                  <div className="w-[30%] border-r flex flex-col" data-tour-id="tour-json-editor">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Scene JSON Editor</h3>
                      <p className="text-sm text-muted-foreground">Direct JSON editing for power users</p>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      <Textarea
                        ref={jsonEditorRef}
                        value={currentSceneJson}
                        onChange={(e) => handleSceneJsonChange(e.target.value)}
                        className={`h-full font-mono text-xs resize-none ${jsonError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        aria-invalid={!!jsonError}
                        placeholder="Scene JSON will appear here..."
                      />
                    </div>
                    <div className="p-4 border-t space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleUndoJson} disabled={!canUndo}>
                          <Undo2 className="w-4 h-4 mr-2" />
                          Undo
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRedoJson} disabled={!canRedo}>
                          <Redo2 className="w-4 h-4 mr-2" />
                          Redo
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCopyJson}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleBeautifyJson}>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Beautify
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleMinifyJson}>
                          <Minimize2 className="w-4 h-4 mr-2" />
                          Minify
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleValidateJson}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Validate
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          value={jsonSearchTerm}
                          onChange={(e) => setJsonSearchTerm(e.target.value)}
                          placeholder="Search JSON"
                          className="h-8 text-xs flex-1 min-w-[160px]"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleFindPrevious}
                          disabled={!jsonSearchTerm}
                          aria-label="Previous match"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleFindNext}
                          disabled={!jsonSearchTerm}
                          aria-label="Next match"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {jsonSearchTerm
                            ? `${searchMatchCount} match${searchMatchCount === 1 ? "" : "es"}`
                            : "Type to search"}
                        </span>
                      </div>
                      {jsonError && (
                        <p className="text-xs text-destructive flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          {jsonError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Preview Panel with Optimistic Updates */}
                {!isMobile && showPreview && (
                  <div className="w-[30%] flex flex-col" data-tour-id="tour-preview-panel">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-medium">Live Preview</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuickAction("fullscreen")}
                              data-testid="fullscreen-preview"
                            >
                              <Maximize className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Pop out to full screen</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <LivePreviewPanel
                        scenes={previewScenes || generatedScenes || []}
                        enabled={true}
                        onToggle={() => setShowPreview(false)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Mobile Preview Sheet */}
                {isMobile && showPreview && (
                  <Sheet open={showPreview} onOpenChange={setShowPreview}>
                    <SheetContent side="bottom" className="h-[60vh]">
                      <SheetHeader>
                        <SheetTitle>Preview</SheetTitle>
                        <SheetDescription>
                          See how your portfolio looks
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-4 h-full overflow-hidden">
                        <LivePreviewPanel
                          scenes={previewScenes || generatedScenes || []}
                          enabled={true}
                          onToggle={() => setShowPreview(false)}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
      
      <Dialog open={!!stagePreviewVersion} onOpenChange={(open) => !open && setStagePreviewVersion(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Stage Preview</DialogTitle>
            <DialogDescription>
              {stagePreviewVersion?.stageKey ? stagePreviewVersion.stageKey.replace(/_/g, " ") : "Version JSON"}
            </DialogDescription>
          </DialogHeader>
          {stagePreviewVersion?.scenesJson && (
            <div className="space-y-4">
              <div className="border rounded-lg">
                <LivePreviewPanel
                  scenes={stagePreviewVersion.scenesJson}
                  enabled={true}
                  onToggle={() => {}}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedScenes(stagePreviewVersion.scenesJson);
                    setPreviewScenes(stagePreviewVersion.scenesJson);
                    setStagePreviewVersion(null);
                    toastWithMood("success", "Preview updated", "Stage scenes loaded into the live preview.");
                  }}
                >
                  Load into Preview
                </Button>
                <Button
                  onClick={() => {
                    applySceneJsonFromSource(JSON.stringify(stagePreviewVersion.scenesJson, null, 2));
                    setStagePreviewVersion(null);
                    toastWithMood("info", "JSON loaded", "Stage JSON available in the editor.");
                  }}
                >
                  Load JSON
                </Button>
              </div>
            </div>
          )}
          <div className="max-h-[40vh] overflow-auto rounded-md bg-muted p-4 text-xs mt-4">
            <pre className="whitespace-pre-wrap">
{stagePreviewVersion ? JSON.stringify(stagePreviewVersion.scenesJson, null, 2) : ""}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={compareDialogOpen}
        onOpenChange={(open) => {
          setCompareDialogOpen(open);
          if (!open) {
            setCompareVersionA(null);
            setCompareVersionB(null);
            setCompareDiffs(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>Select two versions to inspect every change.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Version A</p>
              <Select value={compareVersionA ?? ""} onValueChange={(value) => setCompareVersionA(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {recentVersions.map((version: any) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.versionNumber} · {version.stageKey?.replace(/_/g, " ") || "manual"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {compareVersionA && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const version = versionsById[compareVersionA];
                      if (version) handleLoadVersion(version);
                    }}
                  >
                    Load in Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const version = versionsById[compareVersionA];
                      if (version) {
                        setShareVersion(version);
                        setShareModalOpen(true);
                      }
                    }}
                  >
                    Share
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Version B</p>
              <Select value={compareVersionB ?? ""} onValueChange={(value) => setCompareVersionB(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {recentVersions.map((version: any) => (
                    <SelectItem key={version.id} value={version.id}>
                      v{version.versionNumber} · {version.stageKey?.replace(/_/g, " ") || "manual"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {compareVersionB && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const version = versionsById[compareVersionB];
                      if (version) handleLoadVersion(version);
                    }}
                  >
                    Load in Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const version = versionsById[compareVersionB];
                      if (version) {
                        setShareVersion(version);
                        setShareModalOpen(true);
                      }
                    }}
                  >
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
          {compareVersionA && compareVersionB && compareDiffs && (
            <div className="space-y-3">
              {compareDiffs.length === 0 ? (
                <p className="text-sm text-muted-foreground border rounded-md p-4">
                  These versions are identical.
                </p>
              ) : (
                <ScrollArea className="max-h-[50vh] rounded-md border p-4">
                  <div className="space-y-4">
                    {compareDiffs.map((diff) => (
                      <div key={diff.sceneIndex} className="space-y-2 border-b pb-3 last:border-b-0">
                        <p className="text-sm font-semibold">Scene {diff.sceneIndex + 1}</p>
                        <div className="flex flex-wrap gap-2">
                          {diff.changedFields.length > 0 ? (
                            diff.changedFields.map((field) => (
                              <Badge key={field} variant="secondary">
                                {field}
                              </Badge>
                            ))
                          ) : diff.before && !diff.after ? (
                            <Badge variant="destructive">Removed</Badge>
                          ) : (
                            <Badge variant="default">Added</Badge>
                          )}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="rounded-md border bg-muted/40 p-3 text-xs">
                            <p className="font-semibold mb-1">Version A</p>
                            <pre className="whitespace-pre-wrap">
{diff.before ? JSON.stringify(diff.before, null, 2) : "—"}
                            </pre>
                          </div>
                          <div className="rounded-md border bg-muted/40 p-3 text-xs">
                            <p className="font-semibold mb-1">Version B</p>
                            <pre className="whitespace-pre-wrap">
{diff.after ? JSON.stringify(diff.after, null, 2) : "—"}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <GuidedTour
        open={tourOpen}
        steps={tourSteps}
        currentIndex={tourStepIndex}
        onStepChange={(index) => setTourStepIndex(Math.min(Math.max(index, 0), Math.max(tourSteps.length - 1, 0)))}
        onClose={handleCloseTour}
      />
      <ShareModal
        open={shareModalOpen}
        onOpenChange={(open) => {
          setShareModalOpen(open);
          if (!open) setShareVersion(null);
        }}
        projectId={selectedProjectId || ""}
        projectTitle={projects?.find(p => p.id.toString() === selectedProjectId)?.title || "Portfolio"}
        versionId={shareVersion?.id}
        versionLabel={shareVersion ? `v${shareVersion.versionNumber}` : undefined}
      />
    </ProtectedRoute>
  );
}