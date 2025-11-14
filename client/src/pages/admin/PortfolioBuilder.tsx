import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X, Sparkles, Loader2, Edit, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DirectorConfigForm } from "@/components/DirectorConfigForm";
import { DEFAULT_DIRECTOR_CONFIG } from "@shared/schema";
import { useForm } from "react-hook-form";

interface SceneBuilder {
  id: string;
  sceneType: "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen";
  aiPrompt: string; // Natural language description for this scene
  content: {
    heading?: string;
    body?: string;
    url?: string;
    media?: string;
    quote?: string;
    author?: string;
    role?: string;
    images?: string;
    mediaType?: "image" | "video";
  };
  director: any;
}

export default function PortfolioBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isNewProject, setIsNewProject] = useState(true);

  // New project metadata
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");

  // Scene builders array
  const [scenes, setScenes] = useState<SceneBuilder[]>([]);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [isSceneDialogOpen, setIsSceneDialogOpen] = useState(false);

  // Portfolio-level AI orchestration prompt
  const [portfolioAiPrompt, setPortfolioAiPrompt] = useState("");

  // Scene form state
  const form = useForm({
    defaultValues: {
      sceneType: "text" as const,
      aiPrompt: "",
      heading: "",
      body: "",
      url: "",
      media: "",
      quote: "",
      author: "",
      role: "",
      images: "",
      mediaType: "image" as const,
      director: DEFAULT_DIRECTOR_CONFIG,
    },
  });

  const sceneType = form.watch("sceneType");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Fetch all projects for selection
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/branding/projects"],
  });

  // Add or update scene
  const handleSaveScene = () => {
    const formData = form.getValues();

    if (!formData.aiPrompt.trim()) {
      toast({ title: "Error", description: "Please provide an AI prompt for this scene", variant: "destructive" });
      return;
    }

    const sceneBuilder: SceneBuilder = {
      id: editingSceneId || `scene-${Date.now()}`,
      sceneType: formData.sceneType,
      aiPrompt: formData.aiPrompt,
      content: {
        heading: formData.heading,
        body: formData.body,
        url: formData.url,
        media: formData.media,
        quote: formData.quote,
        author: formData.author,
        role: formData.role,
        images: formData.images,
        mediaType: formData.mediaType,
      },
      director: formData.director,
    };

    if (editingSceneId) {
      setScenes(scenes.map(s => s.id === editingSceneId ? sceneBuilder : s));
      toast({ title: "Scene updated" });
    } else {
      setScenes([...scenes, sceneBuilder]);
      toast({ title: "Scene added" });
    }

    setIsSceneDialogOpen(false);
    setEditingSceneId(null);
    form.reset({
      sceneType: "text",
      aiPrompt: "",
      director: DEFAULT_DIRECTOR_CONFIG,
    });
  };

  const handleEditScene = (scene: SceneBuilder) => {
    setEditingSceneId(scene.id);
    form.reset({
      sceneType: scene.sceneType,
      aiPrompt: scene.aiPrompt,
      heading: scene.content.heading || "",
      body: scene.content.body || "",
      url: scene.content.url || "",
      media: scene.content.media || "",
      quote: scene.content.quote || "",
      author: scene.content.author || "",
      role: scene.content.role || "",
      images: scene.content.images || "",
      mediaType: scene.content.mediaType || "image",
      director: scene.director || DEFAULT_DIRECTOR_CONFIG,
    });
    setIsSceneDialogOpen(true);
  };

  const handleDeleteScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
    toast({ title: "Scene removed" });
  };

  const handleMoveScene = (id: string, direction: "up" | "down") => {
    const index = scenes.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;

    const newScenes = [...scenes];
    [newScenes[index], newScenes[newIndex]] = [newScenes[newIndex], newScenes[index]];
    setScenes(newScenes);
  };

  // Generate portfolio with AI
  const handleGeneratePortfolio = async () => {
    // Validation
    if (isNewProject) {
      if (!newProjectTitle.trim()) {
        toast({ title: "Error", description: "Please enter a project title", variant: "destructive" });
        return;
      }
      if (!newProjectSlug.trim()) {
        toast({ title: "Error", description: "Please enter a project slug", variant: "destructive" });
        return;
      }
      if (!newProjectClient.trim()) {
        toast({ title: "Error", description: "Please enter a client name", variant: "destructive" });
        return;
      }
    } else if (!selectedProjectId || selectedProjectId.trim() === "") {
      toast({ title: "Error", description: "Please select a project", variant: "destructive" });
      return;
    }

    if (scenes.length === 0) {
      toast({ title: "Error", description: "Please add at least one scene", variant: "destructive" });
      return;
    }

    if (!portfolioAiPrompt.trim()) {
      toast({ title: "Error", description: "Please provide portfolio-level AI orchestration guidance", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const requestPayload = {
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
        scenes: scenes,
        portfolioAiPrompt: portfolioAiPrompt,
      };

      console.log('[Portfolio Builder] Generating with scene-by-scene config:', requestPayload);

      const response = await apiRequest("POST", "/api/portfolio/generate-enhanced", requestPayload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Generation failed");
      }

      const result = await response.json();
      console.log('[Portfolio Builder] Generation successful:', result);

      toast({
        title: "Success!",
        description: `Generated ${result.scenesCreated} scenes successfully`,
      });

      // Navigate to project edit page
      if (result.projectId) {
        setLocation(`/admin/projects/${result.projectId}/edit`);
      }
    } catch (error) {
      console.error('[Portfolio Builder] Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate scenes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Portfolio Builder | Admin</title>
      </Helmet>

      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-2xl font-bold">AI Portfolio Builder (Enhanced)</h1>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Project Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>1. Select Project</CardTitle>
                    <CardDescription>
                      Create a new project or add scenes to an existing one
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant={isNewProject ? "default" : "outline"}
                        onClick={() => setIsNewProject(true)}
                        data-testid="button-new-project"
                      >
                        New Project
                      </Button>
                      <Button
                        variant={!isNewProject ? "default" : "outline"}
                        onClick={() => setIsNewProject(false)}
                        data-testid="button-existing-project"
                      >
                        Existing Project
                      </Button>
                    </div>

                    {isNewProject ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="project-title">Project Title *</Label>
                          <Input
                            id="project-title"
                            value={newProjectTitle}
                            onChange={(e) => setNewProjectTitle(e.target.value)}
                            placeholder="Enter project title..."
                            data-testid="input-project-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-slug">Slug *</Label>
                          <Input
                            id="project-slug"
                            value={newProjectSlug}
                            onChange={(e) => setNewProjectSlug(e.target.value)}
                            placeholder="project-slug"
                            data-testid="input-project-slug"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-client">Client Name *</Label>
                          <Input
                            id="project-client"
                            value={newProjectClient}
                            onChange={(e) => setNewProjectClient(e.target.value)}
                            placeholder="Enter client name..."
                            data-testid="input-project-client"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Select Project</Label>
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                          <SelectTrigger data-testid="select-project">
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Scene Builder */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>2. Build Scenes</CardTitle>
                        <CardDescription>
                          Add scenes one-by-one with AI guidance for each
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingSceneId(null);
                          form.reset({
                            sceneType: "text",
                            aiPrompt: "",
                            director: DEFAULT_DIRECTOR_CONFIG,
                          });
                          setIsSceneDialogOpen(true);
                        }}
                        data-testid="button-add-scene"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Scene
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {scenes.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No scenes yet. Click "Add Scene" to get started.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {scenes.map((scene, index) => (
                          <Card key={scene.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">Scene {index + 1}</span>
                                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                                    {scene.sceneType}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  <strong>AI Prompt:</strong> {scene.aiPrompt}
                                </div>
                                {scene.content.heading && (
                                  <div className="text-xs text-muted-foreground">
                                    Heading: {scene.content.heading}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleMoveScene(scene.id, "up")}
                                  disabled={index === 0}
                                  data-testid={`button-move-up-${scene.id}`}
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleMoveScene(scene.id, "down")}
                                  disabled={index === scenes.length - 1}
                                  data-testid={`button-move-down-${scene.id}`}
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditScene(scene)}
                                  data-testid={`button-edit-${scene.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteScene(scene.id)}
                                  data-testid={`button-delete-${scene.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio-Level AI Orchestration */}
                <Card>
                  <CardHeader>
                    <CardTitle>3. Portfolio Orchestration</CardTitle>
                    <CardDescription>
                      Describe how the scenes should flow together (pacing, transitions, overall mood)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={portfolioAiPrompt}
                      onChange={(e) => setPortfolioAiPrompt(e.target.value)}
                      placeholder="Example: Create a cinematic journey that builds anticipation. Start slow and dramatic, accelerate through the middle sections, then end with high energy. Use smooth dissolve transitions between scenes and maintain dark, moody backgrounds throughout."
                      rows={4}
                      data-testid="textarea-portfolio-ai-prompt"
                    />
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Card>
                  <CardHeader>
                    <CardTitle>4. Generate Portfolio</CardTitle>
                    <CardDescription>
                      AI will enhance each scene and orchestrate the overall flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGeneratePortfolio}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full"
                      data-testid="button-generate-portfolio"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Portfolio...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Portfolio with AI
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Scene Editor Dialog */}
      <Dialog open={isSceneDialogOpen} onOpenChange={setIsSceneDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSceneId ? "Edit Scene" : "Add Scene"}</DialogTitle>
            <DialogDescription>
              Configure scene details and provide AI guidance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Scene Type */}
            <div className="space-y-2">
              <Label>Scene Type</Label>
              <Select
                value={form.watch("sceneType")}
                onValueChange={(value) => form.setValue("sceneType", value as any)}
              >
                <SelectTrigger data-testid="select-scene-type">
                  <SelectValue />
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

            {/* AI Prompt for this scene */}
            <div className="space-y-2">
              <Label>AI Prompt for This Scene *</Label>
              <Textarea
                value={form.watch("aiPrompt")}
                onChange={(e) => form.setValue("aiPrompt", e.target.value)}
                placeholder="Example: Create a bold hero section with dramatic entrance. Use large typography, dark gradient background, and emphasize the revolutionary nature of the product."
                rows={3}
                data-testid="textarea-scene-ai-prompt"
              />
            </div>

            {/* Content Fields */}
            <Card className="p-4 space-y-4">
              <h4 className="font-medium">Content (Optional - AI will enhance)</h4>

              {sceneType === "text" && (
                <>
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input
                      value={form.watch("heading")}
                      onChange={(e) => form.setValue("heading", e.target.value)}
                      placeholder="Optional: provide base heading"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body Text</Label>
                    <Textarea
                      value={form.watch("body")}
                      onChange={(e) => form.setValue("body", e.target.value)}
                      placeholder="Optional: provide base content"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {sceneType === "image" && (
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={form.watch("url")}
                    onChange={(e) => form.setValue("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {sceneType === "quote" && (
                <>
                  <div className="space-y-2">
                    <Label>Quote</Label>
                    <Textarea
                      value={form.watch("quote")}
                      onChange={(e) => form.setValue("quote", e.target.value)}
                      placeholder="The quote text..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input
                      value={form.watch("author")}
                      onChange={(e) => form.setValue("author", e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                </>
              )}
            </Card>

            {/* Director Config */}
            <Card className="p-4">
              <DirectorConfigForm form={form} sceneType={sceneType} />
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSaveScene} data-testid="button-save-scene">
                {editingSceneId ? "Update Scene" : "Add Scene"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSceneDialogOpen(false);
                  setEditingSceneId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}