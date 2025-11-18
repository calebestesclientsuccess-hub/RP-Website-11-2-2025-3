
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, FileText, Sparkles } from "lucide-react";

type PromptType = 
  | "artistic_director"
  | "technical_director"
  | "executive_producer"
  | "split_specialist"
  | "gallery_specialist"
  | "quote_specialist"
  | "fullscreen_specialist";

interface PromptTemplate {
  id: string;
  projectId: string;
  promptType: PromptType;
  customPrompt: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
}

const PROMPT_TYPES: { value: PromptType; label: string; description: string }[] = [
  {
    value: "artistic_director",
    label: "Artistic Director",
    description: "Stage 1: High-level narrative strategy and emotional tone"
  },
  {
    value: "technical_director",
    label: "Technical Director",
    description: "Stage 2: Asset matching and technical validation"
  },
  {
    value: "executive_producer",
    label: "Executive Producer",
    description: "Stage 3: Portfolio-level coherence and flow"
  },
  {
    value: "split_specialist",
    label: "Split Scene Specialist",
    description: "Stage 4: Split scene refinement (text + media)"
  },
  {
    value: "gallery_specialist",
    label: "Gallery Scene Specialist",
    description: "Stage 4: Gallery scene refinement"
  },
  {
    value: "quote_specialist",
    label: "Quote Scene Specialist",
    description: "Stage 4: Quote scene refinement"
  },
  {
    value: "fullscreen_specialist",
    label: "Fullscreen Scene Specialist",
    description: "Stage 4: Fullscreen media scene refinement"
  }
];

export default function PortfolioPromptManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedPromptType, setSelectedPromptType] = useState<PromptType>("artistic_director");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch prompts for selected project
  const { data: prompts = [], isLoading: promptsLoading } = useQuery<PromptTemplate[]>({
    queryKey: [`/api/portfolio-prompts/${selectedProjectId}`],
    enabled: !!selectedProjectId,
  });

  // Get current prompt for selected type
  const currentPrompt = prompts.find(p => p.promptType === selectedPromptType);

  // Update form when prompt changes
  useEffect(() => {
    if (currentPrompt) {
      setCustomPrompt(currentPrompt.customPrompt || "");
      setIsActive(currentPrompt.isActive);
      setHasChanges(false);
    } else {
      setCustomPrompt("");
      setIsActive(false);
      setHasChanges(false);
    }
  }, [currentPrompt]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/portfolio-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: selectedProjectId,
          promptType: selectedPromptType,
          customPrompt: customPrompt.trim() || null,
          isActive,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to save prompt");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio-prompts/${selectedProjectId}`] });
      toast({
        title: "Prompt saved",
        description: "Custom prompt has been saved successfully",
      });
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const handleReset = () => {
    if (currentPrompt) {
      setCustomPrompt(currentPrompt.customPrompt || "");
      setIsActive(currentPrompt.isActive);
    } else {
      setCustomPrompt("");
      setIsActive(false);
    }
    setHasChanges(false);
  };

  const selectedPromptInfo = PROMPT_TYPES.find(p => p.value === selectedPromptType);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio AI Prompt Manager</h1>
        <p className="text-muted-foreground">
          Customize the AI prompts used in the 6-stage portfolio generation pipeline
        </p>
      </div>

      {/* Project Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose a portfolio project to customize its AI prompts</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={projectsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProjectId && (
        <>
          {/* Prompt Type Tabs */}
          <Tabs value={selectedPromptType} onValueChange={(v) => setSelectedPromptType(v as PromptType)}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
              {PROMPT_TYPES.map((type) => (
                <TabsTrigger key={type.value} value={type.value} className="text-xs">
                  {type.label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {PROMPT_TYPES.map((type) => (
              <TabsContent key={type.value} value={type.value}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {type.label}
                        </CardTitle>
                        <CardDescription>{type.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${type.value}`} className="text-sm">
                          Active
                        </Label>
                        <Switch
                          id={`active-${type.value}`}
                          checked={isActive}
                          onCheckedChange={(checked) => {
                            setIsActive(checked);
                            setHasChanges(true);
                          }}
                        />
                        {currentPrompt && (
                          <Badge variant={currentPrompt.isActive ? "default" : "secondary"}>
                            v{currentPrompt.version}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promptsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="custom-prompt" className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" />
                            Custom Prompt
                          </Label>
                          <Textarea
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => {
                              setCustomPrompt(e.target.value);
                              setHasChanges(true);
                            }}
                            placeholder={`Enter custom ${type.label} prompt... (leave empty to use default)`}
                            className="min-h-[300px] font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Leave empty to use the default system prompt. Custom prompts override the defaults.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSave}
                            disabled={!hasChanges || saveMutation.isPending}
                          >
                            {saveMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={!hasChanges}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>

                        {currentPrompt && (
                          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                            <p>Last updated: {new Date(currentPrompt.updatedAt).toLocaleString()}</p>
                            <p>Status: {currentPrompt.isActive ? "Active" : "Inactive"}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {!selectedProjectId && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Select a project to manage its AI prompts
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
