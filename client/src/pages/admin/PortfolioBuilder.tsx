import { useState, useEffect, useCallback, useRef } from "react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, X, Sparkles, Loader2, Code2, ChevronDown, Eye, EyeOff, Maximize, Share2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { ChatInterface, type ChatMessage } from "@/components/ChatInterface";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useMobile } from "@/hooks/use-mobile";
import { LivePreviewPanel } from "@/components/admin/LivePreviewPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareModal } from "@/components/ShareModal";
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
} from "@/components/ui/sheet";

export default function PortfolioBuilderChatFirst() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Dev Mode state (saved in localStorage)
  const [devMode, setDevMode] = useLocalStorage<boolean>("portfolio-builder-dev-mode", false);
  const [showPreview, setShowPreview] = useState(!isMobile); // Hide preview on mobile by default
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isNewProject, setIsNewProject] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [brandColorPrimary, setBrandColorPrimary] = useState("#000000");
  const [brandColorSecondary, setBrandColorSecondary] = useState("#333333");
  const [brandColorTertiary, setBrandColorTertiary] = useState("#666666");
  
  // AI Chat state with enhanced typing
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [currentSceneJson, setCurrentSceneJson] = useState<string>("");
  const [generatedScenes, setGeneratedScenes] = useState<any>(null);
  const [previewScenes, setPreviewScenes] = useState<any>(null);
  const messageCounter = useRef(0);
  
  // Data fetching
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: existingProjectScenes, isLoading: isLoadingScenes } = useQuery<any[]>({
    queryKey: ["/api/projects", selectedProjectId, "scenes", { hydrate: true }],
    enabled: !isNewProject && !!selectedProjectId,
    staleTime: 5 * 60 * 1000,
  });
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };
  
  // Generate message ID
  const generateMessageId = () => {
    messageCounter.current += 1;
    return `msg-${Date.now()}-${messageCounter.current}`;
  };
  
  // Load existing scenes when project is selected
  useEffect(() => {
    if (existingProjectScenes && existingProjectScenes.length > 0) {
      const scenesJson = JSON.stringify(
        existingProjectScenes.map((scene: any) => scene.sceneConfig),
        null,
        2
      );
      setCurrentSceneJson(scenesJson);
      setPreviewScenes(existingProjectScenes.map((scene: any) => scene.sceneConfig));
    }
  }, [existingProjectScenes]);
  
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
        setCurrentSceneJson(JSON.stringify(result.scenes, null, 2));
        setPreviewScenes(result.scenes);
      }
      
      // Mark user message as sent
      setConversationHistory(prev => 
        prev.map(msg => 
          msg.id === context?.userMsgId
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
      
      toast({
        title: "Success",
        description: `Generated ${result.scenes?.length || 0} scenes`,
      });
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
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
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
      toast({ 
        title: "Saving...",
        description: "Saving scenes to database"
      });
      
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
      toast({ 
        title: "Success",
        description: "Scenes saved to database"
      });
      
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
      
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save scenes",
        variant: "destructive",
      });
    }
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
  
  // Handle saving scenes
  const handleSaveScenes = useCallback(() => {
    if (generatedScenes) {
      saveScenesMutation.mutate(generatedScenes);
    }
  }, [generatedScenes, saveScenesMutation]);
  
  // Debounced scene JSON editing
  const handleSceneJsonChange = useCallback((value: string) => {
    setCurrentSceneJson(value);
    
    // Parse and update preview with debouncing
    const timeoutId = setTimeout(() => {
      try {
        const parsed = JSON.parse(value);
        setPreviewScenes(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (e) {
        // Invalid JSON, don't update preview
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <ProtectedRoute>
      <MobileOverlay 
        includeTablets={false}
        customMessage="The Portfolio Builder's AI features and preview panel work best on desktop. You can continue on mobile, but we recommend desktop for the optimal creative experience."
      />
      <Helmet>
        <title>Portfolio Builder | Admin</title>
      </Helmet>
      
      <SidebarProvider style={style as React.CSSProperties}>
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
                {/* Share Button - Primary Action */}
                {selectedProjectId && !isNewProject && (
                  <Button
                    variant="default"
                    onClick={() => setShareModalOpen(true)}
                    data-testid="button-share-portfolio"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Share</span>
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
                  {/* Project Setup - Collapsible */}
                  <Collapsible defaultOpen={!selectedProjectId && isNewProject}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="w-4 h-4" />
                          <span className="font-medium">
                            {isNewProject ? 'New Project Setup' : (selectedProjectId ? `Project: ${projects?.find(p => p.id.toString() === selectedProjectId)?.title}` : 'Select Project')}
                          </span>
                        </div>
                        {(isNewProject ? (newProjectTitle && newProjectSlug && newProjectClient) : selectedProjectId) && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Ready</span>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 bg-muted/20 border-b">
                        <div className="flex gap-2 mb-3">
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
                          <Button
                            variant={!isNewProject ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsNewProject(false)}
                          >
                            Existing Project
                          </Button>
                        </div>
                        
                        {isNewProject ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                placeholder="Project Title *"
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                              />
                              <Input
                                placeholder="Slug *"
                                value={newProjectSlug}
                                onChange={(e) => setNewProjectSlug(e.target.value)}
                              />
                              <Input
                                placeholder="Client Name *"
                                value={newProjectClient}
                                onChange={(e) => setNewProjectClient(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={brandColorPrimary}
                                onChange={(e) => setBrandColorPrimary(e.target.value)}
                                className="w-16"
                              />
                              <Input
                                type="color"
                                value={brandColorSecondary}
                                onChange={(e) => setBrandColorSecondary(e.target.value)}
                                className="w-16"
                              />
                              <Input
                                type="color"
                                value={brandColorTertiary}
                                onChange={(e) => setBrandColorTertiary(e.target.value)}
                                className="w-16"
                              />
                              <span className="text-sm text-muted-foreground self-center">Brand Colors</span>
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
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {/* Main Chat Interface with Optimistic Updates */}
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface
                      conversationHistory={conversationHistory}
                      onSendMessage={handleSendMessage}
                      onRetryMessage={handleRetryMessage}
                      isProcessing={generatePortfolioMutation.isPending}
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
                  <div className="w-[30%] border-r flex flex-col">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Scene JSON Editor</h3>
                      <p className="text-sm text-muted-foreground">Direct JSON editing for power users</p>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      <Textarea
                        value={currentSceneJson}
                        onChange={(e) => handleSceneJsonChange(e.target.value)}
                        className="h-full font-mono text-xs resize-none"
                        placeholder="Scene JSON will appear here..."
                      />
                    </div>
                    <div className="p-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(currentSceneJson);
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            const formatted = JSON.stringify(JSON.parse(currentSceneJson), null, 2);
                            setCurrentSceneJson(formatted);
                            toast({ title: "JSON formatted" });
                          } catch {
                            toast({ title: "Invalid JSON", variant: "destructive" });
                          }
                        }}
                      >
                        Format
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Preview Panel with Optimistic Updates */}
                {!isMobile && showPreview && (
                  <div className="w-[30%] flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-medium">Live Preview</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuickAction("fullscreen")}
                        data-testid="fullscreen-preview"
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <LivePreviewPanel
                        projectId={selectedProjectId}
                        scenes={previewScenes || generatedScenes || []}
                        enabled={true}
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
                          projectId={selectedProjectId}
                          scenes={previewScenes || generatedScenes || []}
                          enabled={true}
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
      
      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        projectId={selectedProjectId}
        projectTitle={projects?.find(p => p.id.toString() === selectedProjectId)?.title || "Portfolio"}
      />
    </ProtectedRoute>
  );
}