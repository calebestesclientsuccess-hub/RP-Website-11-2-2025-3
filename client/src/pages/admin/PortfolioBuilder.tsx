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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, Plus, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Content catalog types
interface TextAsset {
  id: string;
  type: "headline" | "paragraph" | "subheading";
  content: string;
}

interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

interface VideoAsset {
  id: string;
  url: string;
  caption?: string;
}

interface QuoteAsset {
  id: string;
  quote: string;
  author: string;
  role?: string;
}

interface ContentCatalog {
  texts: TextAsset[];
  images: ImageAsset[];
  videos: VideoAsset[];
  quotes: QuoteAsset[];
  directorNotes: string;
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

  // Content catalog state
  const [catalog, setCatalog] = useState<ContentCatalog>({
    texts: [],
    images: [],
    videos: [],
    quotes: [],
    directorNotes: "",
  });

  // Form inputs for adding new assets
  const [textInput, setTextInput] = useState({ type: "headline" as const, content: "" });
  const [imageInput, setImageInput] = useState({ url: "", alt: "", caption: "" });
  const [videoInput, setVideoInput] = useState({ url: "", caption: "" });
  const [quoteInput, setQuoteInput] = useState({ quote: "", author: "", role: "" });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Fetch all projects for selection
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/branding/projects"],
  });

  // Add text asset
  const handleAddText = () => {
    if (!textInput.content.trim()) {
      toast({ title: "Error", description: "Text content is required", variant: "destructive" });
      return;
    }
    const newText: TextAsset = {
      id: `text-${Date.now()}`,
      type: textInput.type,
      content: textInput.content.trim(),
    };
    setCatalog(prev => ({ ...prev, texts: [...prev.texts, newText] }));
    setTextInput({ type: "headline", content: "" });
    toast({ title: "Text added to catalog" });
  };

  // Add image asset
  const handleAddImage = () => {
    if (!imageInput.url || !imageInput.alt) {
      toast({ title: "Error", description: "Image URL and alt text are required", variant: "destructive" });
      return;
    }
    const newImage: ImageAsset = {
      id: `image-${Date.now()}`,
      url: imageInput.url,
      alt: imageInput.alt,
      caption: imageInput.caption || undefined,
    };
    setCatalog(prev => ({ ...prev, images: [...prev.images, newImage] }));
    setImageInput({ url: "", alt: "", caption: "" });
    toast({ title: "Image added to catalog" });
  };

  // Add video asset
  const handleAddVideo = () => {
    if (!videoInput.url) {
      toast({ title: "Error", description: "Video URL is required", variant: "destructive" });
      return;
    }
    const newVideo: VideoAsset = {
      id: `video-${Date.now()}`,
      url: videoInput.url,
      caption: videoInput.caption || undefined,
    };
    setCatalog(prev => ({ ...prev, videos: [...prev.videos, newVideo] }));
    setVideoInput({ url: "", caption: "" });
    toast({ title: "Video added to catalog" });
  };

  // Add quote asset
  const handleAddQuote = () => {
    if (!quoteInput.quote || !quoteInput.author) {
      toast({ title: "Error", description: "Quote and author are required", variant: "destructive" });
      return;
    }
    const newQuote: QuoteAsset = {
      id: `quote-${Date.now()}`,
      quote: quoteInput.quote,
      author: quoteInput.author,
      role: quoteInput.role || undefined,
    };
    setCatalog(prev => ({ ...prev, quotes: [...prev.quotes, newQuote] }));
    setQuoteInput({ quote: "", author: "", role: "" });
    toast({ title: "Quote added to catalog" });
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageInput(prev => ({ ...prev, url: data.url }));
      toast({ title: "Image uploaded successfully" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload video to Cloudinary (uses same image endpoint)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('image', file); // Backend uses same multer config

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setVideoInput(prev => ({ ...prev, url: data.url }));
      toast({ title: "Video uploaded successfully" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  // Remove asset from catalog
  const removeText = (id: string) => {
    setCatalog(prev => ({ ...prev, texts: prev.texts.filter(t => t.id !== id) }));
  };

  const removeImage = (id: string) => {
    setCatalog(prev => ({ ...prev, images: prev.images.filter(i => i.id !== id) }));
  };

  const removeVideo = (id: string) => {
    setCatalog(prev => ({ ...prev, videos: prev.videos.filter(v => v.id !== id) }));
  };

  const removeQuote = (id: string) => {
    setCatalog(prev => ({ ...prev, quotes: prev.quotes.filter(q => q.id !== id) }));
  };

  // Generate scenes with AI director
  const handleGenerateScenes = async () => {
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

    const totalAssets = catalog.texts.length + catalog.images.length + catalog.videos.length + catalog.quotes.length;
    if (totalAssets === 0) {
      toast({ title: "Error", description: "Please add at least one asset to the catalog", variant: "destructive" });
      return;
    }

    if (!catalog.directorNotes.trim()) {
      toast({ title: "Error", description: "Please provide director's notes", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/portfolio/generate-with-ai", {
        catalog,
        projectId: isNewProject ? null : selectedProjectId,
        newProjectTitle: isNewProject ? newProjectTitle : undefined,
        newProjectSlug: isNewProject ? newProjectSlug : undefined,
        newProjectClient: isNewProject ? newProjectClient : undefined,
      });

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: `Generated ${result.scenesCreated} scenes successfully`,
      });

      // Navigate to project edit page
      if (result.projectId) {
        setLocation(`/admin/projects/${result.projectId}/edit`);
      }
    } catch (error) {
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
                <h1 className="text-2xl font-bold">AI Portfolio Builder</h1>
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
                          <p className="text-xs text-muted-foreground">
                            URL-friendly identifier (e.g., "acme-rebrand")
                          </p>
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

                {/* Content Catalog */}
                <Card>
                  <CardHeader>
                    <CardTitle>2. Build Content Catalog</CardTitle>
                    <CardDescription>
                      Add all your content (text, images, videos, quotes). The AI will orchestrate how they appear.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="text" data-testid="tab-text">
                          Text ({catalog.texts.length})
                        </TabsTrigger>
                        <TabsTrigger value="images" data-testid="tab-images">
                          Images ({catalog.images.length})
                        </TabsTrigger>
                        <TabsTrigger value="videos" data-testid="tab-videos">
                          Videos ({catalog.videos.length})
                        </TabsTrigger>
                        <TabsTrigger value="quotes" data-testid="tab-quotes">
                          Quotes ({catalog.quotes.length})
                        </TabsTrigger>
                      </TabsList>

                      {/* Text Tab */}
                      <TabsContent value="text" className="space-y-4">
                        <div className="space-y-3">
                          <Label>Text Type</Label>
                          <Select
                            value={textInput.type}
                            onValueChange={(value) => setTextInput(prev => ({ ...prev, type: value as any }))}
                          >
                            <SelectTrigger data-testid="select-text-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="headline">Headline</SelectItem>
                              <SelectItem value="subheading">Subheading</SelectItem>
                              <SelectItem value="paragraph">Paragraph</SelectItem>
                            </SelectContent>
                          </Select>

                          <Label>Content</Label>
                          <Textarea
                            value={textInput.content}
                            onChange={(e) => setTextInput(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Enter your text content..."
                            rows={3}
                            data-testid="input-text-content"
                          />

                          <Button onClick={handleAddText} data-testid="button-add-text">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Text
                          </Button>
                        </div>

                        {/* Text Catalog Display */}
                        {catalog.texts.length > 0 && (
                          <div className="space-y-2 mt-6">
                            <Label>Text Catalog</Label>
                            {catalog.texts.map((text) => (
                              <div
                                key={text.id}
                                className="flex items-start justify-between p-3 bg-muted rounded-lg gap-3"
                                data-testid={`text-item-${text.id}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground mb-1">{text.type}</div>
                                  <div className="text-sm truncate">{text.content}</div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeText(text.id)}
                                  data-testid={`button-remove-text-${text.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Images Tab */}
                      <TabsContent value="images" className="space-y-4">
                        <div className="space-y-3">
                          <Label>Upload Image</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              data-testid="input-image-file"
                            />
                            {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>

                          {imageInput.url && (
                            <>
                              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                <img src={imageInput.url} alt="Preview" className="w-full h-full object-cover" />
                              </div>

                              <Label>Alt Text (Required)</Label>
                              <Input
                                value={imageInput.alt}
                                onChange={(e) => setImageInput(prev => ({ ...prev, alt: e.target.value }))}
                                placeholder="Describe the image..."
                                data-testid="input-image-alt"
                              />

                              <Label>Caption (Optional)</Label>
                              <Input
                                value={imageInput.caption}
                                onChange={(e) => setImageInput(prev => ({ ...prev, caption: e.target.value }))}
                                placeholder="Optional caption..."
                                data-testid="input-image-caption"
                              />

                              <Button onClick={handleAddImage} data-testid="button-add-image">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Image
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Image Catalog Display */}
                        {catalog.images.length > 0 && (
                          <div className="space-y-2 mt-6">
                            <Label>Image Catalog</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {catalog.images.map((image) => (
                                <div
                                  key={image.id}
                                  className="relative group rounded-lg overflow-hidden bg-muted"
                                  data-testid={`image-item-${image.id}`}
                                >
                                  <img src={image.url} alt={image.alt} className="w-full aspect-video object-cover" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => removeImage(image.id)}
                                      data-testid={`button-remove-image-${image.id}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="p-2 text-xs text-muted-foreground truncate">{image.alt}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Videos Tab */}
                      <TabsContent value="videos" className="space-y-4">
                        <div className="space-y-3">
                          <Label>Video URL or Upload</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              disabled={uploadingVideo}
                              data-testid="input-video-file"
                            />
                            {uploadingVideo && <Loader2 className="w-4 h-4 animate-spin" />}
                          </div>

                          <Label>Or enter URL directly</Label>
                          <Input
                            value={videoInput.url}
                            onChange={(e) => setVideoInput(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://..."
                            data-testid="input-video-url"
                          />

                          {videoInput.url && (
                            <>
                              <Label>Caption (Optional)</Label>
                              <Input
                                value={videoInput.caption}
                                onChange={(e) => setVideoInput(prev => ({ ...prev, caption: e.target.value }))}
                                placeholder="Optional caption..."
                                data-testid="input-video-caption"
                              />

                              <Button onClick={handleAddVideo} data-testid="button-add-video">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Video
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Video Catalog Display */}
                        {catalog.videos.length > 0 && (
                          <div className="space-y-2 mt-6">
                            <Label>Video Catalog</Label>
                            {catalog.videos.map((video) => (
                              <div
                                key={video.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                data-testid={`video-item-${video.id}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm truncate">{video.url}</div>
                                  {video.caption && <div className="text-xs text-muted-foreground mt-1">{video.caption}</div>}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeVideo(video.id)}
                                  data-testid={`button-remove-video-${video.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      {/* Quotes Tab */}
                      <TabsContent value="quotes" className="space-y-4">
                        <div className="space-y-3">
                          <Label>Quote</Label>
                          <Textarea
                            value={quoteInput.quote}
                            onChange={(e) => setQuoteInput(prev => ({ ...prev, quote: e.target.value }))}
                            placeholder="Enter the quote..."
                            rows={3}
                            data-testid="input-quote-text"
                          />

                          <Label>Author</Label>
                          <Input
                            value={quoteInput.author}
                            onChange={(e) => setQuoteInput(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Author name"
                            data-testid="input-quote-author"
                          />

                          <Label>Role (Optional)</Label>
                          <Input
                            value={quoteInput.role}
                            onChange={(e) => setQuoteInput(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="CEO, Designer, etc."
                            data-testid="input-quote-role"
                          />

                          <Button onClick={handleAddQuote} data-testid="button-add-quote">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Quote
                          </Button>
                        </div>

                        {/* Quote Catalog Display */}
                        {catalog.quotes.length > 0 && (
                          <div className="space-y-2 mt-6">
                            <Label>Quote Catalog</Label>
                            {catalog.quotes.map((quote) => (
                              <div
                                key={quote.id}
                                className="flex items-start justify-between p-4 bg-muted rounded-lg gap-3"
                                data-testid={`quote-item-${quote.id}`}
                              >
                                <div className="flex-1">
                                  <div className="text-sm italic mb-2">"{quote.quote}"</div>
                                  <div className="text-xs text-muted-foreground">
                                    — {quote.author}
                                    {quote.role && `, ${quote.role}`}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeQuote(quote.id)}
                                  data-testid={`button-remove-quote-${quote.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Director's Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>3. Director's Notes</CardTitle>
                    <CardDescription>
                      Describe the visual style, pacing, and mood you want (e.g., "Cinematic, slow reveal, build anticipation")
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={catalog.directorNotes}
                      onChange={(e) => setCatalog(prev => ({ ...prev, directorNotes: e.target.value }))}
                      placeholder="Fast-paced, energetic, tech-forward with smooth transitions..."
                      rows={4}
                      data-testid="input-director-notes"
                    />
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Card>
                  <CardHeader>
                    <CardTitle>4. Generate Portfolio</CardTitle>
                    <CardDescription>
                      AI will orchestrate your content into a compelling scrollytelling experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={handleGenerateScenes}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full"
                      data-testid="button-generate-portfolio"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Scenes...
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
    </ProtectedRoute>
  );
}
