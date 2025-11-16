
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Edit2, X, Plus, TestTube } from "lucide-react";
import type { PortfolioPrompt } from "@shared/schema";

interface PortfolioPromptsManagerProps {
  projectId: string;
}

const PROMPT_TYPES = [
  {
    key: 'artistic_director',
    name: 'Stage 1: Artistic Director',
    description: 'Initial generation - fills complete 37-control config',
    category: 'core'
  },
  {
    key: 'technical_director',
    name: 'Stage 2: Technical Director',
    description: 'Self-audit - identifies conflicts and issues',
    category: 'core'
  },
  {
    key: 'executive_producer',
    name: 'Stage 5: Executive Producer',
    description: 'Portfolio-level coherence validation',
    category: 'core'
  },
  {
    key: 'split_specialist',
    name: 'Stage 3.5.1: Split Scene Specialist',
    description: 'Refines split scene layouts and choreography',
    category: 'specialists'
  },
  {
    key: 'gallery_specialist',
    name: 'Stage 3.5.2: Gallery Scene Specialist',
    description: 'Refines gallery wave reveals and pacing',
    category: 'specialists'
  },
  {
    key: 'quote_specialist',
    name: 'Stage 3.5.3: Quote Scene Specialist',
    description: 'Refines contemplative quote scenes',
    category: 'specialists'
  },
  {
    key: 'fullscreen_specialist',
    name: 'Stage 3.5.4: Fullscreen Scene Specialist',
    description: 'Refines immersive fullscreen scenes',
    category: 'specialists'
  },
] as const;

export function PortfolioPromptsManager({ projectId }: PortfolioPromptsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [creatingType, setCreatingType] = useState<string | null>(null);

  const { data: prompts = [], isLoading } = useQuery<PortfolioPrompt[]>({
    queryKey: [`/api/projects/${projectId}/prompts`],
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { promptType: string; customPrompt: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/prompts`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/prompts`] });
      toast({ title: "Success", description: "Custom prompt created" });
      setCreatingType(null);
      setEditedContent("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PortfolioPrompt> }) => {
      const response = await apiRequest("PUT", `/api/portfolio-prompts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/prompts`] });
      toast({ title: "Success", description: "Prompt updated" });
      setEditingPrompt(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/portfolio-prompts/${id}/toggle`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/prompts`] });
      toast({ title: "Success", description: "Prompt toggled" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/portfolio-prompts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/prompts`] });
      toast({ title: "Success", description: "Prompt deleted" });
    },
  });

  const handleEdit = (prompt: PortfolioPrompt) => {
    setEditingPrompt(prompt.id);
    setEditedContent(prompt.customPrompt || "");
  };

  const handleSave = (prompt: PortfolioPrompt) => {
    updateMutation.mutate({
      id: prompt.id,
      data: {
        customPrompt: editedContent,
        version: prompt.version + 1,
      },
    });
  };

  const handleCreate = (promptType: string) => {
    if (!editedContent.trim()) {
      toast({ title: "Error", description: "Prompt cannot be empty", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      promptType,
      customPrompt: editedContent,
    });
  };

  const getPromptForType = (type: string) => {
    return prompts.find(p => p.promptType === type);
  };

  const corePrompts = PROMPT_TYPES.filter(t => t.category === 'core');
  const specialistPrompts = PROMPT_TYPES.filter(t => t.category === 'specialists');

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom AI Prompts</h3>
          <p className="text-sm text-muted-foreground">
            Override default system prompts for this portfolio
          </p>
        </div>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="core">Core Chain (3)</TabsTrigger>
          <TabsTrigger value="specialists">Scene Specialists (4)</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4 mt-4">
          {corePrompts.map((type) => {
            const prompt = getPromptForType(type.key);
            const isEditing = editingPrompt === prompt?.id;
            const isCreating = creatingType === type.key;

            return (
              <Card key={type.key}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{type.name}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {prompt && (
                        <>
                          <Badge variant={prompt.isActive ? "default" : "secondary"}>
                            v{prompt.version}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${prompt.id}`} className="text-sm">
                              Active
                            </Label>
                            <Switch
                              id={`active-${prompt.id}`}
                              checked={prompt.isActive}
                              onCheckedChange={() => toggleMutation.mutate(prompt.id)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!prompt && !isCreating && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground mb-4">
                        Using default system prompt
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreatingType(type.key)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Prompt
                      </Button>
                    </div>
                  )}

                  {(isCreating || (prompt && isEditing)) && (
                    <>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="font-mono text-sm min-h-[300px] resize-y"
                        placeholder="Enter custom system prompt..."
                      />
                      <div className="flex gap-2">
                        {isCreating ? (
                          <>
                            <Button onClick={() => handleCreate(type.key)} disabled={createMutation.isPending}>
                              {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Create
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCreatingType(null);
                                setEditedContent("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => handleSave(prompt!)} disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {prompt && !isEditing && (
                    <>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-xs whitespace-pre-wrap font-mono max-h-[150px] overflow-y-auto">
                          {prompt.customPrompt?.substring(0, 300)}...
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(prompt)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(prompt.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="specialists" className="space-y-4 mt-4">
          {specialistPrompts.map((type) => {
            const prompt = getPromptForType(type.key);
            const isEditing = editingPrompt === prompt?.id;
            const isCreating = creatingType === type.key;

            return (
              <Card key={type.key}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{type.name}</CardTitle>
                      <CardDescription>{type.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {prompt && (
                        <>
                          <Badge variant={prompt.isActive ? "default" : "secondary"}>
                            v{prompt.version}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${prompt.id}`} className="text-sm">
                              Active
                            </Label>
                            <Switch
                              id={`active-${prompt.id}`}
                              checked={prompt.isActive}
                              onCheckedChange={() => toggleMutation.mutate(prompt.id)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!prompt && !isCreating && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground mb-4">
                        Using default system prompt
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreatingType(type.key)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Prompt
                      </Button>
                    </div>
                  )}

                  {(isCreating || (prompt && isEditing)) && (
                    <>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="font-mono text-sm min-h-[300px] resize-y"
                        placeholder="Enter custom system prompt..."
                      />
                      <div className="flex gap-2">
                        {isCreating ? (
                          <>
                            <Button onClick={() => handleCreate(type.key)} disabled={createMutation.isPending}>
                              {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Create
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCreatingType(null);
                                setEditedContent("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => handleSave(prompt!)} disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {prompt && !isEditing && (
                    <>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-xs whitespace-pre-wrap font-mono max-h-[150px] overflow-y-auto">
                          {prompt.customPrompt?.substring(0, 300)}...
                        </pre>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(prompt)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(prompt.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
