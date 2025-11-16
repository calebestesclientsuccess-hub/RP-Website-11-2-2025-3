import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw, Edit2, Eye } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AiPromptTemplate } from "@shared/schema";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Helmet } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";


export default function AIPromptSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const style = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  const { data: templates = [], isLoading } = useQuery<AiPromptTemplate[]>({
    queryKey: ["/api/ai-prompt-templates"],
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AiPromptTemplate> }) => {
      const response = await apiRequest("PUT", `/api/ai-prompt-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-prompt-templates"] });
      toast({ title: "Success", description: "Prompt template updated successfully" });
      setEditingPrompt(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (template: AiPromptTemplate) => {
    setEditingPrompt(template.id);
    setEditedContent(template.systemPrompt);
  };

  const handleSave = (template: AiPromptTemplate) => {
    updatePromptMutation.mutate({
      id: template.id,
      data: {
        systemPrompt: editedContent,
        version: template.version + 1,
      },
    });
  };

  const handleCancel = () => {
    setEditingPrompt(null);
    setEditedContent("");
  };

  const handleToggleActive = (template: AiPromptTemplate) => {
    updatePromptMutation.mutate({
      id: template.id,
      data: { isActive: !template.isActive },
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Loading Prompt Settings | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">AI Prompt Settings</h1>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Helmet>
        <title>AI Prompt Settings | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">AI Prompt Settings</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="container mx-auto max-w-6xl">
                <div className="mb-8">
                  <p className="text-muted-foreground">
                    Manage system prompts used for AI-generated portfolios
                  </p>
                </div>
                <ErrorBoundary>
                  <Tabs defaultValue="core" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="core">Core Chain (4)</TabsTrigger>
                      <TabsTrigger value="specialists">Scene Specialists (4)</TabsTrigger>
                      <TabsTrigger value="all">All Prompts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="core" className="space-y-4 mt-4">
                      {templates
                        .filter((t) =>
                          ['artistic_director', 'technical_director', 'executive_producer'].includes(t.promptKey)
                        )
                        .map((template) => (
                          <PromptCard
                            key={template.id}
                            template={template}
                            isEditing={editingPrompt === template.id}
                            editedContent={editedContent}
                            onEdit={handleEdit}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onToggleActive={handleToggleActive}
                            onContentChange={setEditedContent}
                            isSaving={updatePromptMutation.isPending}
                          />
                        ))}
                    </TabsContent>

                    <TabsContent value="specialists" className="space-y-4 mt-4">
                      {templates
                        .filter((t) => t.promptKey.includes('specialist'))
                        .map((template) => (
                          <PromptCard
                            key={template.id}
                            template={template}
                            isEditing={editingPrompt === template.id}
                            editedContent={editedContent}
                            onEdit={handleEdit}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onToggleActive={handleToggleActive}
                            onContentChange={setEditedContent}
                            isSaving={updatePromptMutation.isPending}
                          />
                        ))}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4 mt-4">
                      {templates.map((template) => (
                        <PromptCard
                          key={template.id}
                          template={template}
                          isEditing={editingPrompt === template.id}
                          editedContent={editedContent}
                          onEdit={handleEdit}
                          onSave={handleSave}
                          onCancel={handleCancel}
                          onToggleActive={handleToggleActive}
                          onContentChange={setEditedContent}
                          isSaving={updatePromptMutation.isPending}
                        />
                      ))}
                    </TabsContent>
                  </Tabs>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

interface PromptCardProps {
  template: AiPromptTemplate;
  isEditing: boolean;
  editedContent: string;
  onEdit: (template: AiPromptTemplate) => void;
  onSave: (template: AiPromptTemplate) => void;
  onCancel: () => void;
  onToggleActive: (template: AiPromptTemplate) => void;
  onContentChange: (content: string) => void;
  isSaving: boolean;
}

function PromptCard({
  template,
  isEditing,
  editedContent,
  onEdit,
  onSave,
  onCancel,
  onToggleActive,
  onContentChange,
  isSaving,
}: PromptCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{template.promptName}</CardTitle>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                v{template.version}
              </Badge>
              {!template.isActive && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
            <CardDescription>{template.promptDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`active-${template.id}`} className="text-sm">
                Active
              </Label>
              <Switch
                id={`active-${template.id}`}
                checked={template.isActive}
                onCheckedChange={() => onToggleActive(template)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                value={editedContent}
                onChange={(e) => onContentChange(e.target.value)}
                className="font-mono text-sm min-h-[400px] resize-y"
                placeholder="Enter system prompt..."
              />
              <p className="text-xs text-muted-foreground">
                {editedContent.length} characters
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onSave(template)}
                disabled={isSaving}
              >
                {isSaving ? (
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
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs whitespace-pre-wrap font-mono max-h-[200px] overflow-y-auto">
                {template.systemPrompt.substring(0, 500)}...
              </pre>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(template)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Prompt
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}