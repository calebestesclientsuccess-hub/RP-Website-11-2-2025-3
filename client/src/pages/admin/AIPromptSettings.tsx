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
import { Loader2, Save, Edit2, RotateCcw, TestTube, History, AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AiPromptTemplate } from "@shared/schema";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Helmet } from "react-helmet-async";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PromptVersion {
  version: number;
  systemPrompt: string;
  updatedAt: string;
  updatedBy: string | null;
}

interface PromptTemplate extends AiPromptTemplate {
  versions?: PromptVersion[];
}

export default function AIPromptSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState<{ promptId: string; version: number } | null>(null);
  const [testingPrompt, setTestingPrompt] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<string>("");

  const style = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  const { data: templates = [], isLoading, error } = useQuery<AiPromptTemplate[]>({
    queryKey: ["/api/ai-prompt-templates"],
    retry: 1,
  });

  // If there's an error loading templates, show error state
  if (error) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Error Loading Prompts | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">Default AI Prompts</h1>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                  <p className="text-destructive mb-4">Error loading prompt templates</p>
                  <Button onClick={() => window.location.reload()}>Reload Page</Button>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AiPromptTemplate> }) => {
      const response = await apiRequest("PUT", `/api/ai-prompt-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-prompt-templates"] });
      toast({ title: "Success", description: "Default prompt updated successfully" });
      setEditingPrompt(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const testPromptMutation = useMutation({
    mutationFn: async ({ promptId, testInput }: { promptId: string; testInput: string }) => {
      const response = await apiRequest("POST", `/api/ai-prompt-templates/${promptId}/test`, { testInput });
      return response.json();
    },
    onSuccess: (data) => {
      setTestResult(JSON.stringify(data, null, 2));
      toast({ title: "Success", description: "Prompt test completed" });
    },
    onError: (error: Error) => {
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
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

  const rollbackMutation = useMutation({
    mutationFn: async ({ promptId, version }: { promptId: string; version: number }) => {
      const response = await apiRequest("POST", `/api/ai-prompt-templates/${promptId}/rollback/${version}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-prompt-templates"] });
      toast({ title: "Success", description: "Prompt rolled back successfully" });
      setShowRollbackDialog(null);
    },
    onError: (error: Error) => {
      toast({ title: "Rollback Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleRollback = (promptId: string, version: number) => {
    setShowRollbackDialog({ promptId, version });
  };

  const confirmRollback = () => {
    if (!showRollbackDialog) return;
    rollbackMutation.mutate({ 
      promptId: showRollbackDialog.promptId, 
      version: showRollbackDialog.version 
    });
  };

  const handleTest = (template: AiPromptTemplate) => {
    setTestingPrompt(template.id);
    setTestInput("");
    setTestResult("");
  };

  const runTest = () => {
    if (!testingPrompt || !testInput.trim()) {
      toast({ title: "Error", description: "Please enter test input", variant: "destructive" });
      return;
    }
    testPromptMutation.mutate({ promptId: testingPrompt, testInput });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Loading Default Prompts | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">Default AI Prompts</h1>
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

  const corePrompts = templates.filter(t => 
    ['artistic_director', 'technical_director', 'executive_producer'].includes(t.promptKey)
  );

  const specialistPrompts = templates.filter(t => 
    t.promptKey.includes('specialist')
  );

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Default AI Prompts | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Default AI Prompts</h1>
                <p className="text-sm text-muted-foreground">
                  Manage system-wide prompts for AI-generated portfolios
                </p>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="container mx-auto max-w-6xl">
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    About Default Prompts
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    These prompts are used globally across all projects unless overridden by portfolio-specific custom prompts. 
                    Changes here will affect all future AI generations.
                  </p>
                </div>

                <Tabs defaultValue="core" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="core">Core Chain (3)</TabsTrigger>
                    <TabsTrigger value="specialists">Scene Specialists (4)</TabsTrigger>
                    <TabsTrigger value="all">All Prompts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="core" className="space-y-4 mt-4">
                    {corePrompts.map((template) => (
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
                        onShowHistory={() => setShowVersionHistory(template.id)}
                        onTest={handleTest}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="specialists" className="space-y-4 mt-4">
                    {specialistPrompts.map((template) => (
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
                        onShowHistory={() => setShowVersionHistory(template.id)}
                        onTest={handleTest}
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
                        onShowHistory={() => setShowVersionHistory(template.id)}
                        onTest={handleTest}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>

        {/* Version History Dialog */}
        {showVersionHistory && (
          <Dialog open={!!showVersionHistory} onOpenChange={() => setShowVersionHistory(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Version History</DialogTitle>
                <DialogDescription>
                  View and rollback to previous versions of this prompt
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Mock version history - would be fetched from API */}
                {[
                  { version: 3, timestamp: new Date().toISOString(), active: true },
                  { version: 2, timestamp: new Date(Date.now() - 86400000).toISOString(), active: false },
                  { version: 1, timestamp: new Date(Date.now() - 172800000).toISOString(), active: false },
                ].map((v) => (
                  <Card key={v.version}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Version {v.version}</CardTitle>
                          <CardDescription>
                            {new Date(v.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {v.active ? (
                            <Badge>Current</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRollback(showVersionHistory, v.version)}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Test Prompt Dialog */}
        {testingPrompt && (
          <Dialog open={!!testingPrompt} onOpenChange={() => setTestingPrompt(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Test Prompt</DialogTitle>
                <DialogDescription>
                  Test this prompt with sample input to validate its behavior
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Test Input</Label>
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test portfolio context or content catalog..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>
                <Button onClick={runTest} disabled={testPromptMutation.isPending}>
                  {testPromptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
                {testResult && (
                  <div>
                    <Label>Test Result</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                      {testResult}
                    </pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Rollback Confirmation Dialog */}
        <AlertDialog open={!!showRollbackDialog} onOpenChange={() => setShowRollbackDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to rollback to version {showRollbackDialog?.version}? 
                This will create a new version with the previous content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRollback}>
                Confirm Rollback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
  onShowHistory: () => void;
  onTest: (template: AiPromptTemplate) => void;
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
  onShowHistory,
  onTest,
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
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Inactive
                </Badge>
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
              <Button
                variant="outline"
                size="sm"
                onClick={onShowHistory}
              >
                <History className="w-4 h-4 mr-2" />
                Version History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(template)}
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Prompt
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}