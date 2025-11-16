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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, X, Sparkles, Loader2, Edit, ArrowUp, ArrowDown, Trash2, ChevronDown } from "lucide-react";
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
import { Form } from "@/components/ui/form";

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
  // AI Conversation state
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [currentSceneJson, setCurrentSceneJson] = useState<string>("");
  const [proposedChanges, setProposedChanges] = useState<string>("");

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
  const [useAiDirector, setUseAiDirector] = useState(false); // Toggle for AI orchestration mode
  const [mode, setMode] = useState<"hybrid" | "cinematic">("hybrid"); // NEW: Mode selector

  // Cinematic mode: Section-based structure
  const [sections, setSections] = useState<Array<{
    id: string;
    sectionType: "hero" | "problem" | "solution" | "proof" | "testimonial" | "closing";
    sectionPrompt: string;
    assetIds: string[];
  }>>([]);

  // State for AI-generated scenes, including confidence score and factors
  const [generatedScenes, setGeneratedScenes] = useState<{
    scenes?: any[];
    confidenceScore?: number;
    confidenceFactors?: string[];
  } | null>(null);
  const [isSavingScenes, setIsSavingScenes] = useState(false);


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
    queryKey: ["/api/projects"],
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

  // Function to save generated scenes to the database
  const handleSaveGeneratedScenes = async () => {
    if (!generatedScenes || (Array.isArray(generatedScenes) ? generatedScenes.length : generatedScenes.scenes?.length) === 0) {
      toast({ title: "Error", description: "No scenes to save", variant: "destructive" });
      return;
    }

    setIsSavingScenes(true);
    try {
      const scenesToSave = Array.isArray(generatedScenes) ? generatedScenes : generatedScenes.scenes;
      const requestPayload = {
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
        scenes: scenesToSave,
      };

      console.log('[Portfolio Builder] Saving generated scenes:', requestPayload);

      // Assuming you have an endpoint like /api/portfolio/save-generated-scenes
      const response = await apiRequest("POST", "/api/portfolio/save-generated-scenes", requestPayload);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to save scenes");
      }

      const result = await response.json();
      console.log('[Portfolio Builder] Save successful:', result);

      toast({
        title: "Success!",
        description: `Saved ${scenesToSave?.length} scenes successfully`,
      });

      // Clear generated scenes after saving
      setGeneratedScenes(null);

      // Navigate to project edit page if projectId is returned
      if (result.projectId) {
        setLocation(`/admin/projects/${result.projectId}/edit`);
      }
    } catch (error) {
      console.error('[Portfolio Builder] Save error:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save scenes",
        variant: "destructive",
      });
    } finally {
      setIsSavingScenes(false);
    }
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

    if (!portfolioAiPrompt.trim()) {
      toast({ title: "Error", description: "Please provide portfolio-level AI orchestration guidance", variant: "destructive" });
      return;
    }

    // Hybrid mode validation (scenes required)
    if (scenes.length === 0) {
      toast({ title: "Error", description: "Please add at least one scene", variant: "destructive" });
      return;
    }

    setIsRefining(true); // Changed from setIsGenerating to setIsRefining
    try {
      const requestPayload = {
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
        scenes: scenes,
        portfolioAiPrompt: portfolioAiPrompt,
        // Pass conversation history for context
        conversationHistory: conversationHistory,
        // Pass current prompt for refinement
        currentPrompt: currentPrompt,
        // Pass currentSceneJson for section-based editing
        currentSceneJson: currentSceneJson,
        // Pass proposedChanges to Gemini
        proposedChanges: proposedChanges,
      };

      console.log('[Portfolio Builder] Generating with scene-by-scene config:', requestPayload);
      console.log('[Portfolio Builder] Scenes count:', scenes.length);
      console.log('[Portfolio Builder] Portfolio prompt:', portfolioAiPrompt);

      const response = await apiRequest("POST", "/api/portfolio/generate-enhanced", requestPayload);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Portfolio Builder] Server error:', errorData);
        throw new Error(errorData.details || errorData.error || "Generation failed");
      }

      const result = await response.json();
      console.log('[Portfolio Builder] Generation successful:', result);

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: currentPrompt || portfolioAiPrompt },
        { role: "assistant", content: result.explanation || `Generated ${result.scenes?.length || 0} scenes` }
      ]);

      // Store current scene JSON for reference
      setCurrentSceneJson(JSON.stringify(result.scenes, null, 2));

      setGeneratedScenes({
        scenes: result.scenes,
        confidenceScore: result.confidenceScore,
        confidenceFactors: result.confidenceFactors,
      });

      // Clear current prompt for next refinement
      setCurrentPrompt("");

      toast({
        title: "Success!",
        description: `Generated ${result.scenes?.length || 0} scenes with ${result.confidenceScore || 0}% confidence`,
      });

    } catch (error) {
      console.error('[Portfolio Builder] Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate scenes. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false); // Changed from setIsGenerating to setIsRefining
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

                {/* Hybrid Mode: Scene Builder */}
                {mode === "hybrid" && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>2. Build Scenes (Hybrid Mode)</CardTitle>
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
                )}

                {/* Cinematic Mode: Section Builder */}
                {mode === "cinematic" && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>2. Build Story Sections (Cinematic Mode)</CardTitle>
                          <CardDescription>
                            Define narrative sections with per-section prompts and assets
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => {
                            const newSection = {
                              id: `section-${Date.now()}`,
                              sectionType: "hero" as const,
                              sectionPrompt: "",
                              assetIds: [],
                            };
                            setSections([...sections, newSection]);
                          }}
                          data-testid="button-add-section"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Section
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {sections.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No sections yet. Click "Add Section" to define your story structure.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sections.map((section, index) => (
                            <Card key={section.id} className="p-4 border-2 border-primary/20">
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Label className="text-base font-semibold">
                                        Section {index + 1}
                                      </Label>
                                      <Select
                                        value={section.sectionType}
                                        onValueChange={(value) => {
                                          const updated = [...sections];
                                          updated[index].sectionType = value as any;
                                          setSections(updated);
                                        }}
                                      >
                                        <SelectTrigger className="w-48">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="hero">🎬 Hero</SelectItem>
                                          <SelectItem value="problem">⚠️ Problem</SelectItem>
                                          <SelectItem value="solution">✨ Solution</SelectItem>
                                          <SelectItem value="proof">📊 Proof</SelectItem>
                                          <SelectItem value="testimonial">💬 Testimonial</SelectItem>
                                          <SelectItem value="closing">🎯 Closing</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor={`section-prompt-${section.id}`}>
                                        Cinematic Direction for This Section
                                      </Label>
                                      <Textarea
                                        id={`section-prompt-${section.id}`}
                                        value={section.sectionPrompt}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[index].sectionPrompt = e.target.value;
                                          setSections(updated);
                                        }}
                                        placeholder="Example: Open with slow dramatic rise from darkness. Use the crisis imagery to build tension (fast cuts, red tones). Overlay bold typography that fades in word-by-word. End with a hard cut to black."
                                        rows={3}
                                        className="resize-none"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Assets to Use (comma-separated IDs or keywords)</Label>
                                      <Input
                                        value={section.assetIds.join(", ")}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[index].assetIds = e.target.value
                                            .split(",")
                                            .map(id => id.trim())
                                            .filter(Boolean);
                                          setSections(updated);
                                        }}
                                        placeholder="e.g., hero-image-1, video-intro, crisis-graph"
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        Reference assets from Content Library by ID or keyword
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        if (index === 0) return;
                                        const updated = [...sections];
                                        [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                                        setSections(updated);
                                      }}
                                      disabled={index === 0}
                                      data-testid={`button-move-section-up-${section.id}`}
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        if (index === sections.length - 1) return;
                                        const updated = [...sections];
                                        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                                        setSections(updated);
                                      }}
                                      disabled={index === sections.length - 1}
                                      data-testid={`button-move-section-down-${section.id}`}
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        setSections(sections.filter(s => s.id !== section.id));
                                        toast({ title: "Section removed" });
                                      }}
                                      data-testid={`button-delete-section-${section.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Portfolio-Level AI Orchestration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>3. AI Orchestration & Generation</CardTitle>
                        <CardDescription>
                          Configure AI behavior and generate your portfolio
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={mode === "hybrid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMode("hybrid")}
                          data-testid="toggle-hybrid-mode"
                        >
                          ✏️ Hybrid
                        </Button>
                        <Button
                          variant={mode === "cinematic" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMode("cinematic")}
                          data-testid="toggle-cinematic-mode"
                        >
                          🎬 Cinematic
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mode === "cinematic" ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            🎬 Cinematic Mode
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded">Film Director</span>
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Gemini becomes a film director. You define story sections (hero, problem, solution, etc.) with cinematic directions.
                            AI orchestrates the visual storytelling: camera movements, pacing, transitions, effects.
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Define sections above with narrative intent</div>
                            <div>• Provide per-section cinematic directions</div>
                            <div>• Reference assets from Content Library</div>
                            <div>• AI handles scene generation, timing, and choreography</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="global-cinematic-prompt">Global Cinematic Vision</Label>
                          <Textarea
                            id="global-cinematic-prompt"
                            value={portfolioAiPrompt}
                            onChange={(e) => setPortfolioAiPrompt(e.target.value)}
                            placeholder="Example: This portfolio tells a transformation story. Open with darkness and crisis (fast, tense). Transition to hope with slow confident movements. Build to proof with energetic reveals. Close contemplatively with a fade to black. Maintain high contrast, cinematic color grading throughout."
                            rows={6}
                            data-testid="textarea-portfolio-ai-prompt"
                          />
                          <p className="text-xs text-muted-foreground">
                            Overarching creative direction that guides all sections
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-secondary/50 rounded-lg border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            ✏️ Hybrid Mode
                            <span className="text-xs px-2 py-0.5 bg-secondary rounded">Manual + AI</span>
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            You manually build scenes above with full control over structure and content.
                            AI enhances each scene individually based on your per-scene prompts.
                          </p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Add scenes manually with scene-level AI prompts</div>
                            <div>• AI refines each scene's execution independently</div>
                            <div>• You control order, types, and content</div>
                            <div>• Global prompt provides overall aesthetic guidance</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="global-hybrid-prompt">Global Enhancement Guidance</Label>
                          <Textarea
                            id="global-hybrid-prompt"
                            value={portfolioAiPrompt}
                            onChange={(e) => setPortfolioAiPrompt(e.target.value)}
                            placeholder="Example: Create smooth transitions between scenes. Use crossfades for emotional moments, quick cuts for energy. Maintain a dark, cinematic aesthetic throughout."
                            rows={4}
                            data-testid="textarea-portfolio-ai-prompt"
                          />
                          <p className="text-xs text-muted-foreground">
                            Overall aesthetic and transition guidance for all scenes
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generate Button - Show when no conversation exists */}
                {conversationHistory.length === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {mode === "cinematic" ? "🎬 Generate Cinematic Portfolio" : "✨ Generate Enhanced Portfolio"}
                      </CardTitle>
                      <CardDescription>
                        AI will {mode === "cinematic" ? "orchestrate your story sections into scenes" : "enhance each scene and orchestrate the overall flow"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={handleGeneratePortfolio}
                        disabled={isRefining}
                        size="lg"
                        className="w-full"
                        data-testid="button-generate-portfolio"
                      >
                        {isRefining ? (
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
                )}

                {/* Conversational Refinement Interface - Only show after first generation */}
                {conversationHistory.length > 0 && (
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            💬 Refinement Conversation
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                              {conversationHistory.length / 2} iterations
                            </span>
                          </CardTitle>
                          <CardDescription>
                            Chat with Gemini to perfect your scenes. Reference specific scenes by number.
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConversationHistory([]);
                            setCurrentSceneJson("");
                            setGeneratedScenes(null);
                            setCurrentPrompt("");
                          }}
                        >
                          Start Over
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Conversation History */}
                      <div className="space-y-3 max-h-[500px] overflow-y-auto border rounded-lg p-4 bg-muted/30">
                        {conversationHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background border'
                              }`}
                            >
                              <div className="text-xs font-medium mb-1 opacity-70">
                                {msg.role === 'user' ? '👤 You' : '🤖 Gemini'}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ))}
                        {isRefining && (
                          <div className="flex justify-start">
                            <div className="bg-background border rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Gemini is thinking...
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Refinement Input */}
                      <div className="space-y-2">
                        <Label htmlFor="refinement-prompt">Continue the conversation:</Label>
                        <Textarea
                          id="refinement-prompt"
                          value={currentPrompt}
                          onChange={(e) => setCurrentPrompt(e.target.value)}
                          placeholder="Examples:&#10;• Make Scene 3 more dramatic with faster pacing&#10;• Add a fade transition between Scene 1 and 2&#10;• The hero section needs more impact"
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleGeneratePortfolio}
                            disabled={isRefining || !currentPrompt.trim()}
                            className="flex-1"
                          >
                            {isRefining ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Refining...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Refine Scenes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPrompt("")}
                            disabled={!currentPrompt.trim()}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <div className="text-xs text-muted-foreground w-full mb-1">Quick refinements:</div>
                        {[
                          "Make it more dramatic",
                          "Add smooth transitions",
                          "Increase pacing",
                          "More cinematic feel",
                          "Simplify the flow"
                        ].map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPrompt(suggestion)}
                            disabled={isRefining}
                            className="text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generated Scenes Display */}
                {generatedScenes && (Array.isArray(generatedScenes) ? generatedScenes.length : generatedScenes.scenes?.length) > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            📋 Generated Scenes
                            {conversationHistory.length > 2 && (
                              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 rounded">
                                Updated
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {conversationHistory.length > 2 
                              ? "Scenes refined based on your feedback" 
                              : "AI-generated scenes based on your prompts"}
                          </CardDescription>
                          {generatedScenes.confidenceScore !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">AI Confidence:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      generatedScenes.confidenceScore >= 85
                                        ? 'bg-green-500'
                                        : generatedScenes.confidenceScore >= 70
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${generatedScenes.confidenceScore}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${
                                  generatedScenes.confidenceScore >= 85
                                    ? 'text-green-600'
                                    : generatedScenes.confidenceScore >= 70
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {generatedScenes.confidenceScore}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveGeneratedScenes}
                            disabled={isSavingScenes}
                            data-testid="button-save-all-scenes"
                          >
                            {isSavingScenes ? "Saving..." : "Save All to Database"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setGeneratedScenes(null)}
                            data-testid="button-clear-scenes"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {generatedScenes.confidenceFactors && generatedScenes.confidenceFactors.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-between">
                                <span className="text-sm text-muted-foreground">
                                  View Confidence Details ({generatedScenes.confidenceFactors.length} factors)
                                </span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                                {generatedScenes.confidenceFactors.map((factor: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        
                        {currentSceneJson && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-between">
                                <span className="text-sm text-muted-foreground">
                                  View Complete Scene JSON
                                </span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-2">
                              <div className="rounded-lg border bg-muted/30 p-4">
                                <pre className="text-xs overflow-auto max-h-[400px] whitespace-pre-wrap">
                                  {currentSceneJson}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>

                      <div className="grid gap-4">
                        {(generatedScenes.scenes || generatedScenes).map((scene: any, index: number) => (
                          <Card key={index} className="p-4">
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
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
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

          <Form {...form}>
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
          </Form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}