import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, ChevronDown, Check, Palette, Type } from "lucide-react";
import { BRAND_ARCHETYPES, SAMPLE_CONTENT, BUSINESS_TYPES } from "@/lib/brandArchetypes";
import { cn } from "@/lib/utils";
import { StreamingProgress } from "@/components/StreamingProgress";
import { addRecentProject } from "@/components/RecentProjects";
import { MobileOverlay } from "@/components/MobileOverlay";

export default function PortfolioWizard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [content, setContent] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [addSampleImages, setAddSampleImages] = useState(true);
  const [businessType, setBusinessType] = useState("personal");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (content.length < 50) {
      newErrors.content = "Please provide at least 50 characters of content";
    }
    
    if (!selectedArchetype) {
      newErrors.archetype = "Please select a brand archetype";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fill sample content
  const handleUseSampleContent = () => {
    setContent(SAMPLE_CONTENT);
    toast({
      title: "Sample content loaded",
      description: "Feel free to edit the content to make it your own",
    });
  };

  // Handle form submission with streaming
  const handleGenerate = async () => {
    if (!validateForm()) {
      toast({
        title: "Please complete all required fields",
        description: "Check the form for validation errors",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const archetype = BRAND_ARCHETYPES[selectedArchetype];
      
      const requestData = {
        content,
        brandArchetype: {
          id: selectedArchetype,
          name: archetype.name,
          colors: archetype.colors,
          fonts: archetype.fonts,
        },
        businessType,
        addSampleImages,
        mode: "wizard", // Indicate this is from the simplified wizard
        streaming: true, // Request streaming updates
      };

      // Start the generation request
      const response = await apiRequest("POST", "/api/portfolio/generate", requestData);
      
      if (response.ok) {
        const result = await response.json();
        
        // Track the new project in localStorage
        if (result.projectId) {
          const archetype = BRAND_ARCHETYPES[selectedArchetype];
          addRecentProject({
            id: result.projectId,
            name: result.projectTitle || content.substring(0, 50),
            client: result.projectClient,
            brandArchetype: selectedArchetype,
            slug: result.projectSlug
          });
        }
        
        // The StreamingProgress component will handle completion
        // Store the projectId for redirect after progress completes
        setTimeout(() => {
          setLocation(`/admin/portfolio-builder?projectId=${result.projectId}`);
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate portfolio" }));
        throw new Error(errorData.error || "Failed to generate portfolio");
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again or contact support";
      setGenerationError(errorMessage);
    }
  };

  // Handle completion from StreamingProgress
  const handleGenerationComplete = () => {
    // Progress animation complete, navigation will happen from the delayed redirect
    setIsGenerating(false);
  };

  // Handle retry from StreamingProgress
  const handleRetry = () => {
    setGenerationError(null);
    handleGenerate();
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <>
      <MobileOverlay 
        includeTablets={false}
        customMessage="The Portfolio Wizard's AI generation and brand customization features work best on desktop. Continue on mobile or switch to desktop for the full experience."
      />
      {/* Streaming Progress Overlay */}
      {isGenerating && (
        <StreamingProgress
          onComplete={handleGenerationComplete}
          onError={(error) => {
            console.error("Generation error:", error);
            setGenerationError(error.message);
          }}
          isError={!!generationError}
          errorMessage={generationError || undefined}
          onRetry={handleRetry}
        />
      )}

      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
          <Helmet>
            <title>Create Portfolio | Revenue Party</title>
          </Helmet>
          
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-bold">Create Your Portfolio</h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col lg:flex-row">
              {/* Left Panel - Content Input */}
              <div className="flex-1 p-6 lg:p-8 border-r border-border overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="w-8 h-8 text-primary" />
                      Tell Your Story
                    </h2>
                    <p className="text-muted-foreground">
                      Paste your essay, notes, or any content. Our AI will transform it into a stunning portfolio.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value);
                          if (errors.content) {
                            setErrors((prev) => ({ ...prev, content: "" }));
                          }
                        }}
                        placeholder="Start with something like: 'I'm a product designer who...' or paste your existing bio, case studies, project descriptions, achievements, or any content that tells your professional story..."
                        className={cn(
                          "min-h-[400px] text-base p-4 resize-none",
                          errors.content && "border-destructive"
                        )}
                        data-testid="textarea-content"
                      />
                      
                      <div className="absolute bottom-3 right-3 flex items-center gap-4">
                        <span className={cn(
                          "text-sm",
                          content.length < 50 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {content.length} characters
                        </span>
                      </div>
                    </div>
                    
                    {errors.content && (
                      <p className="text-sm text-destructive">{errors.content}</p>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleUseSampleContent}
                      className="w-full sm:w-auto"
                      data-testid="button-sample-content"
                    >
                      Use Example Content
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel - Brand Selection */}
              <div className="flex-1 lg:max-w-xl p-6 lg:p-8 overflow-y-auto bg-muted/30">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      <Palette className="w-8 h-8 text-primary" />
                      Choose Your Vibe
                    </h2>
                    <p className="text-muted-foreground">
                      Select a brand archetype that matches your style and personality.
                    </p>
                    {errors.archetype && (
                      <p className="text-sm text-destructive mt-2">{errors.archetype}</p>
                    )}
                  </div>

                  {/* Brand Archetype Cards */}
                  <div className="grid gap-4">
                    {Object.values(BRAND_ARCHETYPES).map((archetype) => (
                      <Card
                        key={archetype.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden",
                          selectedArchetype === archetype.id && "ring-2 ring-primary"
                        )}
                        onClick={() => {
                          setSelectedArchetype(archetype.id);
                          if (errors.archetype) {
                            setErrors((prev) => ({ ...prev, archetype: "" }));
                          }
                        }}
                        data-testid={`card-archetype-${archetype.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{archetype.preview.icon}</span>
                                <h3 className="font-semibold text-lg">{archetype.name}</h3>
                                {selectedArchetype === archetype.id && (
                                  <Check className="w-5 h-5 text-primary ml-auto" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {archetype.description}
                              </p>
                              
                              {/* Color Palette Preview */}
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex gap-1">
                                  <div 
                                    className="w-8 h-8 rounded-full border"
                                    style={{ backgroundColor: archetype.colors.primary }}
                                    title="Primary"
                                  />
                                  <div 
                                    className="w-8 h-8 rounded-full border"
                                    style={{ backgroundColor: archetype.colors.secondary }}
                                    title="Secondary"
                                  />
                                  <div 
                                    className="w-8 h-8 rounded-full border"
                                    style={{ backgroundColor: archetype.colors.accent }}
                                    title="Accent"
                                  />
                                </div>
                              </div>
                              
                              {/* Font Preview */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Type className="w-3 h-3" />
                                <span style={{ fontFamily: archetype.fonts.heading }}>
                                  {archetype.fonts.heading.split(',')[0]}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Gradient accent */}
                          <div 
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ 
                              background: archetype.preview.gradient,
                              mixBlendMode: 'overlay'
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Advanced Options */}
                  <div className="mt-6">
                    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          data-testid="button-advanced-options"
                        >
                          <span>Advanced Options</span>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            advancedOpen && "rotate-180"
                          )} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Card className="mt-4">
                          <CardContent className="p-4 space-y-4">
                            {/* Add Sample Images Toggle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="sample-images">Add Sample Images</Label>
                                <p className="text-sm text-muted-foreground">
                                  Automatically include relevant stock images
                                </p>
                              </div>
                              <Switch
                                id="sample-images"
                                checked={addSampleImages}
                                onCheckedChange={setAddSampleImages}
                                data-testid="switch-sample-images"
                              />
                            </div>

                            {/* Business Type Selector */}
                            <div className="space-y-2">
                              <Label htmlFor="business-type">Business Type</Label>
                              <Select value={businessType} onValueChange={setBusinessType}>
                                <SelectTrigger id="business-type" data-testid="select-business-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {BUSINESS_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t bg-background p-4">
              <div className="max-w-7xl mx-auto flex justify-center">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="min-w-[200px] h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover-elevate active-elevate-2"
                  data-testid="button-generate-portfolio"
                >
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Portfolio
                  </>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </>
  );
}