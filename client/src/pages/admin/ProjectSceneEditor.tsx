import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { DirectorConfigForm } from "@/components/DirectorConfigForm";
import { DEFAULT_DIRECTOR_CONFIG } from "@shared/schema";

interface ProjectScene {
  id: string;
  projectId: string;
  sceneConfig: string;
  createdAt: string;
}

interface SceneEditorProps {
  projectId: string;
}

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
        "https://images.unsplash.com/photo-1551434678-e076c223a692",
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
  heading: z.string().optional(),
  body: z.string().optional(),
  url: z.string().optional(),
  media: z.string().optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
  role: z.string().optional(),
  images: z.string().optional(), // Comma-separated URLs
  mediaType: z.enum(["image", "video"]).optional(),
  // Director config
  director: z.any().optional(),
});

export default function ProjectSceneEditor({ projectId }: SceneEditorProps) {
  const { toast } = useToast();
  const [editingScene, setEditingScene] = useState<ProjectScene | null>(null);
  const [sceneJson, setSceneJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");

  const form = useForm<z.infer<typeof quickModeSchema>>({
    resolver: zodResolver(quickModeSchema),
    defaultValues: {
      type: "text",
      heading: "",
      body: "",
      url: "",
      media: "",
      quote: "",
      author: "",
      role: "",
      images: "",
      mediaType: "image",
      director: DEFAULT_DIRECTOR_CONFIG,
    },
  });

  const sceneType = form.watch("type") as "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen";

  const { data: scenes = [], isLoading } = useQuery<ProjectScene[]>({
    queryKey: ["/api/projects", projectId, "scenes"],
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (sceneConfig: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/scenes`, {
        sceneConfig,
      });
      return response;
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
    onError: () => {
      toast({ title: "Failed to create scene", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ sceneId, sceneConfig }: { sceneId: string; sceneConfig: string }) => {
      const response = await apiRequest("PATCH", `/api/projects/${projectId}/scenes/${sceneId}`, {
        sceneConfig,
      });
      return response;
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

  const buildSceneConfigFromForm = (data: z.infer<typeof quickModeSchema>) => {
    const content: any = {};

    // Build content based on scene type
    switch (data.type) {
      case "text":
        content.heading = data.heading;
        content.body = data.body;
        break;
      case "image":
        content.url = data.url;
        break;
      case "video":
        content.url = data.url;
        break;
      case "split":
        content.media = data.media;
        content.heading = data.heading;
        content.body = data.body;
        break;
      case "gallery":
        content.images = data.images?.split(",").map(url => url.trim()).filter(Boolean) || [];
        break;
      case "quote":
        content.quote = data.quote;
        if (data.author) content.author = data.author;
        if (data.role) content.role = data.role;
        break;
      case "fullscreen":
        content.media = data.media;
        content.mediaType = data.mediaType;
        break;
    }

    const sceneConfig: any = {
      type: data.type,
      content,
    };

    // Add director config if present
    if (data.director && Object.keys(data.director).length > 0) {
      sceneConfig.director = data.director;
    }

    return JSON.stringify(sceneConfig);
  };

  const handleQuickModeSave = () => {
    form.handleSubmit((data) => {
      const sceneConfig = buildSceneConfigFromForm(data);
      
      if (editingScene) {
        updateMutation.mutate({ sceneId: editingScene.id, sceneConfig });
      } else {
        createMutation.mutate(sceneConfig);
      }
    })();
  };

  const handleAdvancedSave = () => {
    if (!validateJson(sceneJson)) return;

    if (editingScene) {
      updateMutation.mutate({ sceneId: editingScene.id, sceneConfig: sceneJson });
    } else {
      createMutation.mutate(sceneJson);
    }
  };

  const handleEdit = (scene: ProjectScene) => {
    setEditingScene(scene);
    try {
      const parsed = JSON.parse(scene.sceneConfig);
      const formatted = JSON.stringify(parsed, null, 2);
      setSceneJson(formatted);
      validateJson(formatted);
      
      // Populate form for Quick Mode
      form.setValue("type", parsed.type);
      
      if (parsed.content) {
        if (parsed.content.heading) form.setValue("heading", parsed.content.heading);
        if (parsed.content.body) form.setValue("body", parsed.content.body);
        if (parsed.content.url) form.setValue("url", parsed.content.url);
        if (parsed.content.media) form.setValue("media", parsed.content.media);
        if (parsed.content.quote) form.setValue("quote", parsed.content.quote);
        if (parsed.content.author) form.setValue("author", parsed.content.author);
        if (parsed.content.role) form.setValue("role", parsed.content.role);
        if (parsed.content.images) form.setValue("images", parsed.content.images.join(", "));
        if (parsed.content.mediaType) form.setValue("mediaType", parsed.content.mediaType);
      }

      if (parsed.director) {
        form.setValue("director", parsed.director);
      }
    } catch {
      setSceneJson(scene.sceneConfig);
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
    setSceneJson(scene.sceneConfig);
    validateJson(scene.sceneConfig);
    setIsDialogOpen(true);
  };

  const getSceneType = (sceneConfig: string): string => {
    try {
      const parsed = JSON.parse(sceneConfig);
      return parsed.type || "unknown";
    } catch {
      return "invalid";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scrollytelling Scenes</h3>
          <p className="text-sm text-muted-foreground">
            Manage scenes for the /branding/:slug scrollytelling page
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingScene(null);
                form.reset({
                  type: "text",
                  director: DEFAULT_DIRECTOR_CONFIG,
                });
                setSceneJson("");
                setJsonError(null);
                setActiveTab("quick");
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
                Configure your scene using the form-based Quick Mode or edit raw JSON in Advanced mode.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2" data-testid="tabs-scene-editor">
                <TabsTrigger value="quick" data-testid="tab-quick-mode">Quick Mode</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced-json">Advanced JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-6 mt-6">
                <Form {...form}>
                  <div className="space-y-6">
                    {/* Scene Type Selector */}
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

                    {/* Content Fields (vary by scene type) */}
                    <Card className="p-4 space-y-4">
                      <h4 className="font-medium">Content</h4>
                      
                      {sceneType === "text" && (
                        <>
                          <FormField
                            control={form.control}
                            name="heading"
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
                            name="body"
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
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." data-testid="input-image-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {sceneType === "video" && (
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="https://..." data-testid="input-video-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {sceneType === "split" && (
                        <>
                          <FormField
                            control={form.control}
                            name="media"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." data-testid="input-split-media" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="heading"
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
                            name="body"
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
                        </>
                      )}

                      {sceneType === "gallery" && (
                        <FormField
                          control={form.control}
                          name="images"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URLs (comma-separated)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="https://image1.jpg, https://image2.jpg" className="min-h-[100px]" data-testid="textarea-gallery-images" />
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
                            name="quote"
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
                            name="author"
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
                            name="role"
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
                            name="media"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://..." data-testid="input-fullscreen-media" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="mediaType"
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
                        </>
                      )}
                    </Card>

                    {/* Director Configuration */}
                    <Card className="p-4">
                      <DirectorConfigForm form={form} sceneType={sceneType} />
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleQuickModeSave}
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
                    {scene.sceneConfig}
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
    </div>
  );
}
