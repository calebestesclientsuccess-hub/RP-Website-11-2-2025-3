import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

export default function ProjectSceneEditor({ projectId }: SceneEditorProps) {
  const { toast } = useToast();
  const [editingScene, setEditingScene] = useState<ProjectScene | null>(null);
  const [sceneJson, setSceneJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const validateJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.type) {
        setJsonError("Scene must have a 'type' property");
        return false;
      }
      if (!parsed.content) {
        setJsonError("Scene must have a 'content' property");
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

  const handleSave = () => {
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
      const formatted = JSON.stringify(JSON.parse(scene.sceneConfig), null, 2);
      setSceneJson(formatted);
      validateJson(formatted);
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
            Manage JSON scenes for the /branding/:slug scrollytelling page
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingScene(null);
                setSceneJson("");
                setJsonError(null);
              }}
              data-testid="button-add-scene"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Scene
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingScene ? "Edit Scene" : "Add New Scene"}</DialogTitle>
              <DialogDescription>
                Create or edit a scene using JSON. Use templates or write custom configuration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                  placeholder='{"type": "text", "content": {...}}'
                  className="font-mono text-sm min-h-[400px]"
                  data-testid="textarea-scene-json"
                />
                {jsonError && (
                  <p className="text-sm text-destructive mt-2">{jsonError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
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
            </div>
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
