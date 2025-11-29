import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Copy, Sparkles, Loader2 as LoaderIcon, Loader2, Bookmark } from "lucide-react";
import { DirectorConfigForm } from "@/components/DirectorConfigForm";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { DEFAULT_DIRECTOR_CONFIG, type ProjectScene } from "@shared/schema";
import { PortfolioPromptsManager } from "@/components/admin/PortfolioPromptsManager";

// Extract SceneConfig type from ProjectScene
type SceneConfig = ProjectScene['sceneConfig'];

const SCENE_TEMPLATES = {
  text: {
    type: "text",
    content: {
      heading: "Section Heading",
      body: "Your text content goes here. This section supports rich narrative content.",
    },
  },
  image: {
    type: "image",
    content: {
      url: "https://images.unsplash.com/photo-1557683316-973673baf926",
      caption: "Image caption describing the visual",
    },
  },
  video: {
    type: "video",
    content: {
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  },
  split: {
    type: "split",
    content: {
      media: "https://images.unsplash.com/photo-1557683316-973673baf926",
      heading: "Split Section Heading",
      body: "Content displayed alongside the media. Great for storytelling.",
      layout: "media-left",
    },
  },
  gallery: {
    type: "gallery",
    content: {
      images: [
        "https://images.unsplash.com/photo-1557683316-973673baf926",
        "https://images.unsplash.com/photo-1557683316-973673baf926",
      ],
    },
  },
  quote: {
    type: "quote",
    content: {
      quote: "This project transformed our business completely.",
      author: "Jane Doe",
      role: "CEO, TechCorp",
    },
  },
  fullscreen: {
    type: "fullscreen",
    content: {
      media: "https://images.unsplash.com/photo-1557683316-973673baf926",
      mediaType: "image",
      overlay: {
        heading: "Impactful Heading",
        body: "Overlay text on full-screen media",
      },
    },
  },
};

// Quick Mode form schema for basic scene content
const quickModeSchema = z.object({
  type: z.enum(["text", "image", "video", "split", "gallery", "quote", "fullscreen"]),
  // Content fields vary by type, so we use a flexible object
  content: z.object({
    heading: z.string().optional(),
    body: z.string().optional(),
    url: z.string().optional(),
    media: z.string().optional(),
    caption: z.string().optional(),
    quote: z.string().optional(),
    author: z.string().optional(),
    role: z.string().optional(),
    images: z.array(z.object({ url: z.string(), alt: z.string().optional(), caption: z.string().optional(), mediaId: z.string().optional() })).optional(),
    mediaType: z.enum(["image", "video"]).optional(),
    layout: z.enum(["media-left", "media-right"]).optional(),
    overlay: z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
    }).optional(),
    // Media Library references
    mediaId: z.string().optional(),
    mediaMediaId: z.string().optional(),
  }),
  // Director config
  director: z.any().optional(),
});

interface ProjectSceneEditorProps {
  projectId?: string; // Optional prop for embedded usage (e.g. in ProjectForm)
}

export default function ProjectSceneEditor({ projectId: propProjectId }: ProjectSceneEditorProps = {}) {
  const { toast } = useToast();
  const [, params] = useRoute("/admin/portfolio/:slug");
  const slug = params?.slug;
  
  // Fetch project by slug only if we don't have a projectId prop
  const { data: project, isLoading: isLoadingProject, error: projectError } = useQuery({
    queryKey: [`/api/projects/slug/${slug}`],
    enabled: !!slug && !propProjectId, // Only fetch if we have slug but no projectId prop
  });
  
  // Use prop projectId if provided, otherwise use fetched project ID
  const projectId = propProjectId || project?.id;
  const id = projectId;
  
  // Show loading state while project is being fetched (only for standalone mode)
  if (!propProjectId && isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-project">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }
  
  // Show error state if project not found (only for standalone mode)
  if (!propProjectId && (projectError || (!isLoadingProject && !project))) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="error-project">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The project with slug "{slug}" could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild data-testid="button-back-to-projects">
              <a href="/admin/projects">Back to Projects</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If no projectId available (neither prop nor fetched), show error
  if (!projectId) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="error-no-project">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Project Selected</CardTitle>
            <CardDescription>
              Please select a project to edit scenes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const [editingScene, setEditingScene] = useState<ProjectScene | null>(null);
  const [sceneJson, setSceneJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "prompts" | "scenes" | "ai" | "advanced">("details");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerField, setMediaPickerField] = useState<'url' | 'images' | 'media'>('url');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Save Template state
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [sceneToSave, setSceneToSave] = useState<ProjectScene | null>(null);


  // AI Generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSceneType, setAiSceneType] = useState<string>("");
  const [aiGeneratedJson, setAiGeneratedJson] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof quickModeSchema>>({
    resolver: zodResolver(quickModeSchema),
    defaultValues: {
      type: "text",
      content: {
        heading: "",
        body: "",
        url: "",
        media: "",
        caption: "",
        quote: "",
        author: "",
        role: "",
        images: [],
        mediaType: "image",
        overlay: { heading: "", body: "" }
      },
      director: DEFAULT_DIRECTOR_CONFIG,
    },
  });

  const sceneType = form.watch("type");
  const contentType = form.watch("content");

  const { data: scenes = [], isLoading } = useQuery<ProjectScene[]>({
    queryKey: ["/api/projects", projectId, "scenes"],
    enabled: !!projectId,
  });

  const createMutation = useMutation<ProjectScene, Error, SceneConfig>({
    mutationFn: async (sceneConfig) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/scenes`, {
        sceneConfig,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(JSON.stringify(errorData));
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "scenes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({ title: "Scene created successfully" });
      setIsDialogOpen(false);
      form.reset();
      setSceneJson("");
      setJsonError(null);
    },
    onError: (error) => {
      console.error("Scene creation error:", error.message);
      try {
        const errorData = JSON.parse(error.message);
        toast({
          title: "Failed to create scene",
          description: errorData.details || errorData.error || "Unknown validation error",
          variant: "destructive"
        });
      } catch {
        toast({ title: "Failed to create scene", variant: "destructive" });
      }
    },
  });

  const updateMutation = useMutation<ProjectScene, Error, { sceneId: string; sceneConfig: SceneConfig }>({
    mutationFn: async ({ sceneId, sceneConfig }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/scenes/${sceneId}`, {
        sceneConfig,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "scenes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({ title: "Scene updated successfully" });
      setIsDialogOpen(false);
      setEditingScene(null);
      form.reset();
      setSceneJson("");
      setJsonError(null);
    },
    onError: () => {
      toast({ title: "Failed to update scene", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sceneId: string) => {
      const response = await apiRequest("DELETE", `/api/projects/${projectId}/scenes/${sceneId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "scenes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/branding/projects"] });
      toast({ title: "Scene deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete scene", variant: "destructive" });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async ({
      sceneId,
      name,
      description,
      category,
      tags,
    }: {
      sceneId: string;
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
    }) => {
      const response = await apiRequest("POST", `/api/project-scenes/${sceneId}/save-as-template`, {
        name,
        description,
        category,
        tags,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-templates'] });
      toast({ title: "Scene saved as template successfully" });
      setSaveTemplateOpen(false);
      setSceneToSave(null);
    },
    onError: () => {
      toast({ title: "Failed to save scene as template", variant: "destructive" });
    },
  });

  const ALLOWED_SCENE_TYPES = ["text", "image", "video", "split", "gallery", "quote", "fullscreen"];

  const validateJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);

      if (!parsed.type) {
        setJsonError("Scene must have a 'type' property");
        return false;
      }

      if (!ALLOWED_SCENE_TYPES.includes(parsed.type)) {
        setJsonError(`Scene type must be one of: ${ALLOWED_SCENE_TYPES.join(", ")}`);
        return false;
      }

      if (!parsed.content) {
        setJsonError("Scene must have a 'content' property");
        return false;
      }

      if (typeof parsed.content !== "object" || parsed.content === null) {
        setJsonError("Scene 'content' must be an object");
        return false;
      }

      if (Object.keys(parsed.content).length === 0) {
        setJsonError("Scene 'content' must contain at least one property");
        return false;
      }

      setJsonError(null);
      return true;
    } catch (e) {
      setJsonError("Invalid JSON syntax");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setSceneJson(value);
    if (value.trim()) {
      validateJson(value);
    } else {
      setJsonError(null);
    }
  };

  const handleTemplateSelect = (template: string) => {
    const templateConfig = SCENE_TEMPLATES[template as keyof typeof SCENE_TEMPLATES];
    if (templateConfig) {
      const formatted = JSON.stringify(templateConfig, null, 2);
      setSceneJson(formatted);
      validateJson(formatted);
    }
  };

  const buildSceneConfigFromForm = (data: z.infer<typeof quickModeSchema>): SceneConfig => {
    const sceneConfig: SceneConfig = {
      type: data.type,
      content: {},
    };

    // Map form content to sceneConfig.content
    if (data.content.heading !== undefined) sceneConfig.content.heading = data.content.heading;
    if (data.content.body !== undefined) sceneConfig.content.body = data.content.body;
    if (data.content.url !== undefined) sceneConfig.content.url = data.content.url;
    if (data.content.media !== undefined) sceneConfig.content.media = data.content.media;
    if (data.content.caption !== undefined) sceneConfig.content.caption = data.content.caption;
    if (data.content.quote !== undefined) sceneConfig.content.quote = data.content.quote;
    if (data.content.author !== undefined) sceneConfig.content.author = data.content.author;
    if (data.content.role !== undefined) sceneConfig.content.role = data.content.role;
    
    // CRITICAL FIX: Preserve gallery images with ALL fields including mediaId
    if (data.content.images !== undefined && Array.isArray(data.content.images)) {
      sceneConfig.content.images = data.content.images.map(img => ({
        url: img.url,
        alt: img.alt || '',
        caption: img.caption || '',
        ...(img.mediaId && { mediaId: img.mediaId }) // Preserve mediaId if present
      }));
    }
    
    if (data.content.mediaType !== undefined) sceneConfig.content.mediaType = data.content.mediaType;
    if (data.content.layout !== undefined) sceneConfig.content.layout = data.content.layout;
    if (data.content.overlay !== undefined) sceneConfig.content.overlay = data.content.overlay;

    // CRITICAL FIX: Include mediaId references from form
    if (data.content.mediaId !== undefined) sceneConfig.content.mediaId = data.content.mediaId;
    if (data.content.mediaMediaId !== undefined) sceneConfig.content.mediaMediaId = data.content.mediaMediaId;

    // Add director config if present
    if (data.director && Object.keys(data.director).length > 0) {
      sceneConfig.director = data.director;
    }

    console.log('[Scene Save] Built config with mediaId references:', {
      hasContentMediaId: !!sceneConfig.content.mediaId,
      hasMediaMediaId: !!sceneConfig.content.mediaMediaId,
      galleryImagesWithMediaId: sceneConfig.content.images?.filter(img => img.mediaId).length || 0
    });

    return sceneConfig;
  };


  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    if (mediaPickerField === 'url') {
      form.setValue('content.url', media.url);
      if (media.id) {
        form.setValue('content.mediaId', media.id);
      }
    } else if (mediaPickerField === 'media') {
      // For split/fullscreen scenes
      form.setValue('content.media', media.url);
      if (media.id) {
        form.setValue('content.mediaMediaId', media.id);
      }
    } else if (mediaPickerField === 'images') {
      const currentImages = form.getValues('content.images') || [];
      form.setValue('content.images', [
        ...currentImages,
        { 
          url: media.url, 
          alt: media.type === 'image' ? `Gallery image from Media Library` : `Gallery video`,
          caption: '', 
          mediaId: media.id || undefined // Ensure mediaId is preserved
        }
      ]);
      toast({ 
        title: "Media added to gallery", 
        description: "Linked to Media Library" 
      });
    }
    setMediaPickerOpen(false);
  };

  const handleSaveScene = () => {
    const formData = form.getValues();
    const sceneConfig = buildSceneConfigFromForm(formData);

    if (editingScene) {
      updateMutation.mutate({ sceneId: editingScene.id, sceneConfig });
    } else {
      createMutation.mutate(sceneConfig);
    }
  };

  const handleAdvancedSave = () => {
    if (!validateJson(sceneJson)) return;

    const parsedConfig = JSON.parse(sceneJson); // Parse JSON from editor
    if (editingScene) {
      updateMutation.mutate({ sceneId: editingScene.id, sceneConfig: parsedConfig });
    } else {
      createMutation.mutate(parsedConfig);
    }
  };

  const handleEdit = (scene: ProjectScene) => {
    setEditingScene(scene);
    const formatted = JSON.stringify(scene.sceneConfig, null, 2);
    setSceneJson(formatted);
    validateJson(formatted);

    // Populate form for Quick Mode
    const config = scene.sceneConfig as any; // Type assertion for easier access

    // Safely populate form values
    form.setValue("type", config.type || "text");

    // Populate content fields based on the actual content object
    const content = config.content || {};
    form.setValue("content.heading", content.heading);
    form.setValue("content.body", content.body);
    form.setValue("content.url", content.url);
    form.setValue("content.media", content.media);
    form.setValue("content.caption", content.caption);
    form.setValue("content.quote", content.quote);
    form.setValue("content.author", content.author);
    form.setValue("content.role", content.role);
    form.setValue("content.images", content.images || []); // Ensure images is an array
    form.setValue("content.mediaType", content.mediaType);
    form.setValue("content.layout", content.layout);
    form.setValue("content.overlay", content.overlay || { heading: "", body: "" });


    if (config.director) {
      form.setValue("director", config.director);
    } else {
      form.setValue("director", DEFAULT_DIRECTOR_CONFIG); // Reset to default if not present
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (sceneId: string) => {
    if (confirm("Are you sure you want to delete this scene?")) {
      deleteMutation.mutate(sceneId);
    }
  };

  const handleDuplicate = (scene: ProjectScene) => {
    setEditingScene(null);
    const formatted = JSON.stringify(scene.sceneConfig, null, 2);
    setSceneJson(formatted);
    validateJson(formatted);
    // Reset form to default values before populating with duplicated scene data
    form.reset({
      type: "text",
      content: {
        heading: "",
        body: "",
        url: "",
        media: "",
        caption: "",
        quote: "",
        author: "",
        role: "",
        images: [],
        mediaType: "image",
        overlay: { heading: "", body: "" }
      },
      director: DEFAULT_DIRECTOR_CONFIG,
    });
    // Populate form with duplicated scene data
    const config = scene.sceneConfig as any;
    form.setValue("type", config.type || "text");
    const content = config.content || {};
    form.setValue("content.heading", content.heading);
    form.setValue("content.body", content.body);
    form.setValue("content.url", content.url);
    form.setValue("content.media", content.media);
    form.setValue("content.caption", content.caption);
    form.setValue("content.quote", content.quote);
    form.setValue("content.author", content.author);
    form.setValue("content.role", content.role);
    form.setValue("content.images", content.images || []);
    form.setValue("content.mediaType", content.mediaType);
    form.setValue("content.layout", content.layout);
    form.setValue("content.overlay", content.overlay || { heading: "", body: "" });

    if (config.director) {
      form.setValue("director", config.director);
    } else {
      form.setValue("director", DEFAULT_DIRECTOR_CONFIG);
    }
    setIsDialogOpen(true);
  };

  const handleSaveAsTemplate = (scene: ProjectScene) => {
    setSceneToSave(scene);
    setSaveTemplateOpen(true);
  };

  const getSceneType = (sceneConfig: SceneConfig | undefined): string => {
    return sceneConfig?.type || "unknown";
  };

  // Normalize AI-generated scene types to valid database types
  const normalizeSceneType = (aiType: string): string => {
    const typeMap: Record<string, string> = {
      'hero': 'text',
      'testimonial': 'quote',
      'stats': 'text',
      'timeline': 'text',
      'section': 'text',
    };
    return typeMap[aiType.toLowerCase()] || aiType;
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Please enter a scene description", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setAiGeneratedJson("");

    try {
      const response = await apiRequest("POST", "/api/scenes/generate-with-ai", {
        prompt: aiPrompt,
        projectId: projectId,
        sceneType: (aiSceneType && aiSceneType !== "auto") ? aiSceneType : undefined,
      });

      const data = await response.json();
      const normalizedType = normalizeSceneType(data.sceneType || "text");

      const content: any = {};
      if (data.headline) content.heading = data.headline;
      if (data.bodyText) content.body = data.bodyText;
      if (data.subheadline) content.subheading = data.subheadline; // Assuming this maps to body if body is missing
      if (data.mediaUrl) content.url = data.mediaUrl;
      if (data.mediaType) content.mediaType = data.mediaType;
      if (data.caption) content.caption = data.caption; // For image scenes

      // MEDIA LIBRARY INTEGRATION: Extract mediaId from assetIds array
      if (data.assetIds && Array.isArray(data.assetIds) && data.assetIds.length > 0) {
        const mediaId = data.assetIds[0]; // Use first asset ID
        
        // Map to correct field based on scene type
        if (normalizedType === 'image' || normalizedType === 'video') {
          content.mediaId = mediaId;
          console.log(`[AI Generation] Mapped Media Library asset ${mediaId} to content.mediaId`);
        } else if (normalizedType === 'split' || normalizedType === 'fullscreen') {
          content.mediaMediaId = mediaId;
          console.log(`[AI Generation] Mapped Media Library asset ${mediaId} to content.mediaMediaId`);
        }
      }

      // Ensure required fields for text scenes (heading + body both required)
      if (normalizedType === "text") {
        if (!content.heading) content.heading = "Untitled Scene";
        if (!content.body) {
          content.body = content.subheading || "Add your scene content here.";
        }
      }

      const clampDuration = (value: number | undefined, max: number): number | undefined => {
        if (value === undefined) return undefined;
        const seconds = value >= 50 ? value / 1000 : value; // Detect milliseconds
        return Math.min(Math.max(seconds, 0.1), max);
      };

      const sceneConfig: SceneConfig = {
        type: normalizedType,
        content,
        director: {
          ...DEFAULT_DIRECTOR_CONFIG,
          ...(data.backgroundColor && { backgroundColor: data.backgroundColor }),
          ...(data.textColor && { textColor: data.textColor }),
          ...(data.fadeInDuration && { entryDuration: clampDuration(data.fadeInDuration, 5) }),
          ...(data.fadeOutDuration && { exitDuration: clampDuration(data.fadeOutDuration, 5) }),
          ...(data.parallaxSpeed && { parallaxIntensity: Math.min(Math.max(data.parallaxSpeed, 0), 1) }),
          ...(data.duration && { animationDuration: clampDuration(data.duration, 10) }),
          ...(data.delayBeforeEntry && { entryDelay: clampDuration(data.delayBeforeEntry, 5) }),
        },
      };

      setAiGeneratedJson(JSON.stringify(sceneConfig, null, 2));
      toast({ title: "Scene generated successfully!" });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Failed to generate scene",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAiScene = () => {
    if (!aiGeneratedJson) {
      toast({ title: "No AI-generated scene to apply", variant: "destructive" });
      return;
    }

    try {
      const parsed = JSON.parse(aiGeneratedJson);
      setSceneJson(aiGeneratedJson);
      setActiveTab("advanced");
      toast({ title: "AI scene applied to Advanced JSON editor" });
    } catch (error) {
      toast({ title: "Failed to apply scene", variant: "destructive" });
    }
  };

  const handleAiSave = () => {
    if (!aiGeneratedJson) {
      toast({ title: "No AI-generated scene to save", variant: "destructive" });
      return;
    }

    try {
      const parsedConfig = JSON.parse(aiGeneratedJson);
      if (editingScene) {
        updateMutation.mutate({ sceneId: editingScene.id, sceneConfig: parsedConfig });
      } else {
        createMutation.mutate(parsedConfig);
      }
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The AI-generated JSON is not valid. Please fix it before saving.",
        variant: "destructive"
      });
    }
  };

  // Function to handle opening the media picker
  const openMediaPicker = (field: 'url' | 'images' | 'media') => {
    setMediaPickerField(field);
    setMediaPickerOpen(true);
  };

  // Quick upload handler
  const handleQuickUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      const response = await fetch('/api/media-library/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedMedia = await response.json();

      // Auto-select the uploaded media
      handleMediaSelect({
        id: uploadedMedia.id,
        url: uploadedMedia.cloudinaryUrl,
        type: uploadedMedia.mediaType,
      });

      toast({ title: 'Media uploaded and selected!' });
      setUploadModalOpen(false);
    } catch (error) {
      toast({ 
        title: 'Upload failed', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setUploadingFile(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scene Editor</h3>
          <p className="text-sm text-muted-foreground">
            Configure your project scenes and multimedia content.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingScene(null);
                form.reset({
                  type: "text",
                  content: {
                    heading: "",
                    body: "",
                    url: "",
                    media: "",
                    caption: "",
                    quote: "",
                    author: "",
                    role: "",
                    images: [],
                    mediaType: "image",
                    overlay: { heading: "", body: "" }
                  },
                  director: DEFAULT_DIRECTOR_CONFIG,
                });
                setSceneJson("");
                setJsonError(null);
                setActiveTab("details"); // Reset to details tab
              }}
              data-testid="button-add-scene"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Scene
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingScene ? "Edit Scene" : "Add New Scene"}</DialogTitle>
              <DialogDescription>
                Configure your scene using the form-based Quick Mode, edit raw JSON in Advanced mode, or generate with AI.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4" data-testid="tabs-scene-editor">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
                <TabsTrigger value="scenes">Quick Mode</TabsTrigger>
                <TabsTrigger value="ai">AI Generation</TabsTrigger>
                <TabsTrigger value="advanced">Advanced JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Basic information about the project.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Project Details Form - Coming Soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prompts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom AI Prompts</CardTitle>
                    <CardDescription>
                      Override default system prompts for AI-powered scene generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PortfolioPromptsManager projectId={projectId} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scenes" className="space-y-6 mt-6">
                <Form {...form}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scene Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-scene-type-quick">
                                <SelectValue placeholder="Select scene type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text Section</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="split">Split Layout</SelectItem>
                              <SelectItem value="gallery">Gallery</SelectItem>
                              <SelectItem value="quote">Quote/Testimonial</SelectItem>
                              <SelectItem value="fullscreen">Fullscreen Media</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Card className="p-4 space-y-4">
                      <h4 className="font-medium">Content</h4>

                      {sceneType === "text" && (
                        <>
                          <FormField
                            control={form.control}
                            name="content.heading"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heading</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Section Heading" data-testid="input-heading" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.body"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Body Text</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Your text content..." className="min-h-[100px]" data-testid="textarea-body" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {sceneType === "image" && (
                        <>
                          <FormField
                            control={form.control}
                            name="content.url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => openMediaPicker('url')}
                                      title="Choose from Media Library"
                                    >
                                      <Sparkles className="w-4 h-4 mr-1" />
                                      Library
                                    </Button>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => setUploadModalOpen(true)}
                                      title="Upload New Media"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Upload
                                    </Button>
                                  </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {form.watch('content.mediaId') ? (
                                    <span className="text-green-600">✓ Linked to Media Library</span>
                                  ) : (
                                    <span>Paste URL or choose from library</span>
                                  )}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.caption"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Caption</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Image caption" data-testid="input-image-caption" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {sceneType === "video" && (
                        <FormField
                          control={form.control}
                          name="content.url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL</FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-2">
                                  <Input {...field} placeholder="https://..." data-testid="input-video-url" />
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => openMediaPicker('url')}
                                    title="Choose from Media Library"
                                  >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Library
                                  </Button>
                                </div>
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                {form.watch('content.mediaId') ? (
                                  <span className="text-green-600">✓ Linked to Media Library</span>
                                ) : (
                                  <span>Paste URL or choose from library</span>
                                )}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {sceneType === "split" && (
                        <>
                          <FormField
                            control={form.control}
                            name="content.media"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media URL</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input {...field} placeholder="https://..." data-testid="input-split-media" />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => {
                                        setMediaPickerField('media');
                                        setMediaPickerOpen(true);
                                      }}
                                      title="Choose from Media Library"
                                    >
                                      <Sparkles className="w-4 h-4 mr-1" />
                                      Library
                                    </Button>
                                  </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {form.watch('content.mediaMediaId') ? (
                                    <span className="text-green-600">✓ Linked to Media Library</span>
                                  ) : (
                                    <span>Paste URL or choose from library</span>
                                  )}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.heading"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heading</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Split Section Heading" data-testid="input-split-heading" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.body"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Body Text</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Content alongside media..." className="min-h-[100px]" data-testid="textarea-split-body" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="content.layout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Layout</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-split-layout">
                                      <SelectValue placeholder="Select layout" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="media-left">Media Left</SelectItem>
                                    <SelectItem value="media-right">Media Right</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {sceneType === "gallery" && (
                        <FormField
                          control={form.control}
                          name="content.images"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Images</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  {field.value?.map((image, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                      {image.url && (
                                        <img 
                                          src={image.url} 
                                          alt={image.alt || `Gallery image ${index + 1}`}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      )}
                                      <div className="flex-1 space-y-1">
                                        <Input 
                                          value={image.url} 
                                          readOnly 
                                          placeholder="Image URL"
                                          className="text-xs"
                                        />
                                        <div className="flex items-center gap-2">
                                          {image.mediaId ? (
                                            <Badge variant="default" className="text-xs">
                                              ✓ Media Library
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs">
                                              Direct URL
                                            </Badge>
                                          )}
                                          <Input
                                            placeholder="Alt text (optional)"
                                            value={image.alt || ''}
                                            onChange={(e) => {
                                              const newImages = [...field.value];
                                              newImages[index] = { ...image, alt: e.target.value };
                                              field.onChange(newImages);
                                            }}
                                            className="text-xs"
                                          />
                                        </div>
                                      </div>
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                          const newImages = [...field.value];
                                          newImages.splice(index, 1);
                                          field.onChange(newImages);
                                        }}
                                        title="Remove image"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button type="button" variant="outline" onClick={() => openMediaPicker('images')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add from Media Library
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {sceneType === "quote" && (
                        <>
                          <FormField
                            control={form.control}
                            name="content.quote"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quote</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="This project transformed our business..." className="min-h-[100px]" data-testid="textarea-quote" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Author (optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Jane Doe" data-testid="input-quote-author" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role (optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="CEO, TechCorp" data-testid="input-quote-role" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {sceneType === "fullscreen" && (
                        <>
                          <FormField
                            control={form.control}
                            name="content.media"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media URL</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input {...field} placeholder="https://..." data-testid="input-fullscreen-media" />
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => {
                                        setMediaPickerField('media');
                                        setMediaPickerOpen(true);
                                      }}
                                      title="Choose from Media Library"
                                    >
                                      <Sparkles className="w-4 h-4 mr-1" />
                                      Library
                                    </Button>
                                  </div>
                                </FormControl>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {form.watch('content.mediaMediaId') ? (
                                    <span className="text-green-600">✓ Linked to Media Library</span>
                                  ) : (
                                    <span>Paste URL or choose from library</span>
                                  )}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="content.mediaType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-fullscreen-media-type">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           {form.watch('content.mediaType') === 'image' && (
                              <FormField
                                control={form.control}
                                name="content.overlay.heading"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Overlay Heading</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Impactful Heading" data-testid="input-fullscreen-overlay-heading" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                           {form.watch('content.mediaType') === 'image' && (
                              <FormField
                                control={form.control}
                                name="content.overlay.body"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Overlay Body</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} placeholder="Overlay text on full-screen media" className="min-h-[100px]" data-testid="textarea-fullscreen-overlay-body" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                        </>
                      )}
                    </Card>

                    <Card className="p-4">
                      <DirectorConfigForm form={form} sceneType={sceneType} />
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveScene}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        data-testid="button-save-quick-mode"
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? "Saving..."
                          : editingScene
                          ? "Update Scene"
                          : "Create Scene"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingScene(null);
                          form.reset();
                          setSceneJson("");
                          setJsonError(null);
                        }}
                        data-testid="button-cancel-quick-mode"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Describe Your Scene</label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Example: Create a hero section for a SaaS product launch with bold typography, dark gradient background, and modern aesthetic. Include a powerful headline about revolutionizing sales teams."
                      className="min-h-[120px]"
                      data-testid="textarea-ai-prompt"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Describe what you want - be specific about mood, content, colors, and style.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Scene Type (Optional)</label>
                    <Select value={aiSceneType || "auto"} onValueChange={setAiSceneType}>
                      <SelectTrigger data-testid="select-ai-scene-type">
                        <SelectValue placeholder="Auto-detect from description..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="text">Text Section</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="split">Split Layout</SelectItem>
                        <SelectItem value="hero">Hero Section</SelectItem>
                        <SelectItem value="quote">Quote/Testimonial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAiGenerate}
                    disabled={!aiPrompt.trim() || isGenerating}
                    className="w-full"
                    data-testid="button-generate-ai-scene"
                  >
                    {isGenerating ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Scene with AI
                      </>
                    )}
                  </Button>

                  {aiGeneratedJson && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generated Scene Configuration</label>
                        <Badge variant="secondary">Preview</Badge>
                      </div>
                      <Textarea
                        value={aiGeneratedJson}
                        onChange={(e) => setAiGeneratedJson(e.target.value)}
                        className="font-mono text-sm min-h-[300px]"
                        data-testid="textarea-ai-generated-json"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleApplyAiScene}
                          variant="default"
                          data-testid="button-apply-ai-scene"
                        >
                          Apply to Advanced JSON
                        </Button>
                        <Button
                          onClick={handleAiSave}
                          disabled={createMutation.isPending || updateMutation.isPending}
                          variant="outline"
                          data-testid="button-save-ai-scene-direct"
                        >
                          {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : "Save Scene Directly"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Scene Template</label>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger data-testid="select-template">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Section</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="split">Split Layout</SelectItem>
                      <SelectItem value="gallery">Gallery</SelectItem>
                      <SelectItem value="quote">Quote/Testimonial</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Scene Configuration (JSON)</label>
                  <Textarea
                    value={sceneJson}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='{"type": "text", "content": {...}, "director": {...}}'
                    className="font-mono text-sm min-h-[400px]"
                    data-testid="textarea-scene-json"
                  />
                  {jsonError && (
                    <p className="text-sm text-destructive mt-2">{jsonError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAdvancedSave}
                    disabled={!sceneJson || !!jsonError || createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-scene"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingScene
                      ? "Update Scene"
                      : "Create Scene"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingScene(null);
                      setSceneJson("");
                      setJsonError(null);
                    }}
                    data-testid="button-cancel-scene"
                  >
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Media Picker Dialog */}
      <Dialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>
              Choose an asset from your media library. 
              {projectId && <span className="text-xs"> (Filtered to this project)</span>}
            </DialogDescription>
          </DialogHeader>
          <MediaPicker 
            onSelect={handleMediaSelect} 
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            projectId={projectId}
            mediaType={mediaPickerField === 'url' || mediaPickerField === 'media' ? 'all' : 'image'}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Upload Dialog */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload a new image or video and it will be automatically linked to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleQuickUpload(file);
                }
              }}
              disabled={uploadingFile}
            />
            {uploadingFile && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-project-editor">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          <TabsTrigger value="scenes">Scenes</TabsTrigger>
          <TabsTrigger value="ai">AI Generation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about the project.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Project Details Form - Coming Soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom AI Prompts</CardTitle>
              <CardDescription>
                Override default system prompts for AI-powered scene generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioPromptsManager projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenes" className="space-y-6 mt-6">
          {isLoading ? (
            <Card className="p-8 text-center text-muted-foreground">Loading scenes...</Card>
          ) : scenes.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No scenes yet. Add your first scene to create the scrollytelling experience.
            </Card>
          ) : (
            <div className="space-y-2">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Scene {index + 1}</span>
                        <Badge variant="secondary">{getSceneType(scene.sceneConfig)}</Badge>
                      </div>
                      <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto max-h-20">
                        {JSON.stringify(scene.sceneConfig, null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(scene)}
                        data-testid={`button-edit-scene-${scene.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDuplicate(scene)}
                        data-testid={`button-duplicate-scene-${scene.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveAsTemplate(scene)}
                        data-testid={`button-save-template-${scene.id}`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(scene.id)}
                        data-testid={`button-delete-scene-${scene.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent data-testid="dialog-save-template">
          <DialogHeader>
            <DialogTitle>Save Scene as Template</DialogTitle>
            <DialogDescription>
              Save this scene configuration as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="template-name" className="text-sm font-medium">
                Template Name *
              </label>
              <Input
                id="template-name"
                placeholder="e.g., Hero with CTA"
                data-testid="input-template-name"
              />
            </div>
            <div>
              <label htmlFor="template-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is used for..."
                data-testid="input-template-description"
              />
            </div>
            <div>
              <label htmlFor="template-category" className="text-sm font-medium">
                Category
              </label>
              <Input
                id="template-category"
                placeholder="e.g., Hero, Testimonial, Stats"
                data-testid="input-template-category"
              />
            </div>
            <div>
              <label htmlFor="template-tags" className="text-sm font-medium">
                Tags (comma-separated)
              </label>
              <Input
                id="template-tags"
                placeholder="e.g., hero, cta, dark-theme"
                data-testid="input-template-tags"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSaveTemplateOpen(false);
                setSceneToSave(null);
              }}
              data-testid="button-cancel-save-template"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const name = (document.getElementById('template-name') as HTMLInputElement)?.value;
                const description = (document.getElementById('template-description') as HTMLTextAreaElement)?.value;
                const category = (document.getElementById('template-category') as HTMLInputElement)?.value;
                const tagsInput = (document.getElementById('template-tags') as HTMLInputElement)?.value;
                const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
                
                if (!name || !name.trim()) {
                  toast({ title: "Template name is required", variant: "destructive" });
                  return;
                }
                
                if (sceneToSave) {
                  saveTemplateMutation.mutate({
                    sceneId: sceneToSave.id,
                    name: name.trim(),
                    description: description?.trim() || undefined,
                    category: category?.trim() || undefined,
                    tags: tags.length > 0 ? tags : undefined,
                  });
                }
              }}
              disabled={saveTemplateMutation.isPending}
              data-testid="button-confirm-save-template"
            >
              {saveTemplateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}