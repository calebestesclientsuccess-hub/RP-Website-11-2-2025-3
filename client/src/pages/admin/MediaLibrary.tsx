import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Image, Video, Trash2, Tag, X } from "lucide-react";
import type { Project } from "@shared/schema";

interface MediaAsset {
  id: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  mediaType: "image" | "video";
  label?: string;
  tags: string[];
  createdAt: string;
  projectId?: string;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [customTags, setCustomTags] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const style = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/branding/projects"],
  });

  const { data: mediaAssets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["/api/media-library", selectedProjectId],
    queryFn: async () => {
      const url = selectedProjectId
        ? `/api/media-library?projectId=${selectedProjectId}`
        : "/api/media-library";
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Add project_id if selected
      if (selectedProjectId) {
        formData.append('project_id', selectedProjectId);
      }

      const response = await fetch("/api/media-library/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Media uploaded successfully" });
      setSelectedLabel("");
      setCustomTags("");
      setSelectedProjectId("");
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
    },
    onError: (error: Error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/media-library/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      toast({ title: "Media deleted successfully" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('[MediaLibrary] No files selected');
      return;
    }

    console.log('[MediaLibrary] Files selected:', files.length);
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        console.log('[MediaLibrary] Uploading file:', file.name, file.type, file.size);

        const formData = new FormData();
        formData.append("file", file);
        if (selectedLabel) {
          formData.append("label", selectedLabel);
        }
        if (customTags) {
          formData.append("tags", customTags);
        }
        if (selectedProjectId) {
          formData.append("projectId", selectedProjectId);
        }

        await uploadMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('[MediaLibrary] Upload error:', error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const filterByType = (type: "image" | "video") => {
    return mediaAssets.filter(asset => asset.mediaType === type);
  };

  const filterByLabel = (label: string) => {
    return mediaAssets.filter(asset => asset.label === label);
  };

  const filteredMedia = mediaAssets.filter(asset => {
    const matchesSearch = asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === "all") {
      return matchesSearch;
    }
    return matchesSearch && asset.mediaType === filter;
  });


  return (
    <ProtectedRoute>
      <Helmet>
        <title>Media Library | Admin</title>
      </Helmet>

      <SidebarProvider style={style}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Media Library</h1>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Filter by Portfolio:</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All media" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All media</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProjectId && selectedProjectId !== "all" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedProjectId("all")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project">Link to Project (optional)</Label>
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger id="project">
                          <SelectValue placeholder="Select a project..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None (Global Asset)</SelectItem>
                          {projects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Link this asset to a specific project for easy access in the Portfolio Builder
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="label">Label (optional)</Label>
                      <Input
                        id="label"
                        value={selectedLabel}
                        onChange={(e) => setSelectedLabel(e.target.value)}
                        placeholder="e.g., logo, hero-image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
                      <Input
                        id="tags"
                        value={customTags}
                        onChange={(e) => setCustomTags(e.target.value)}
                        placeholder="e.g., branding, marketing"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Files</Label>
                      <Input
                        data-testid="input-file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Supported: JPG, PNG, GIF, WebP, MP4, WebM
                      </p>
                    </div>

                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading to Cloudinary...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Media Grid Controls */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      placeholder="Search media..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="image">Images</TabsTrigger>
                        <TabsTrigger value="video">Videos</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  {/* Project Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: {filteredMedia.length} assets</span>
                    {projects.map((project: any) => {
                      const projectAssets = mediaAssets.filter((m: any) => m.projectId === project.id);
                      if (projectAssets.length === 0) return null;
                      return (
                        <Badge key={project.id} variant="outline">
                          {project.title}: {projectAssets.length}
                        </Badge>
                      );
                    })}
                  </div>
                </div>


                {/* Media Grid */}
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All ({mediaAssets.length})</TabsTrigger>
                    <TabsTrigger value="images">Images ({filterByType("image").length})</TabsTrigger>
                    <TabsTrigger value="videos">Videos ({filterByType("video").length})</TabsTrigger>
                    <TabsTrigger value="logos">Logos ({filterByLabel("logo").length})</TabsTrigger>
                    <TabsTrigger value="primary">Primary ({filterByLabel("primary-image").length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    <MediaGrid assets={filteredMedia} onDelete={(id) => deleteMutation.mutate(id)} projects={projects} />
                  </TabsContent>

                  <TabsContent value="images" className="mt-6">
                    <MediaGrid assets={filterByType("image").filter(asset => asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) || (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))} onDelete={(id) => deleteMutation.mutate(id)} projects={projects} />
                  </TabsContent>

                  <TabsContent value="videos" className="mt-6">
                    <MediaGrid assets={filterByType("video").filter(asset => asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) || (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))} onDelete={(id) => deleteMutation.mutate(id)} projects={projects} />
                  </TabsContent>

                  <TabsContent value="logos" className="mt-6">
                    <MediaGrid assets={filterByLabel("logo").filter(asset => asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) || (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))} onDelete={(id) => deleteMutation.mutate(id)} projects={projects} />
                  </TabsContent>

                  <TabsContent value="primary" className="mt-6">
                    <MediaGrid assets={filterByLabel("primary-image").filter(asset => asset.cloudinaryPublicId.toLowerCase().includes(searchQuery.toLowerCase()) || (asset.label && asset.label.toLowerCase().includes(searchQuery.toLowerCase())) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))} onDelete={(id) => deleteMutation.mutate(id)} projects={projects} />
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function MediaGrid({ assets, onDelete, projects }: { assets: MediaAsset[]; onDelete: (id: string) => void; projects: Project[] }) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No media assets found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <Card key={asset.id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative group">
            {asset.mediaType === "image" ? (
              <img src={asset.cloudinaryUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <video src={asset.cloudinaryUrl} className="w-full h-full object-cover" controls/>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(asset.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm truncate">{asset.label || "Untitled"}</p>
                <p className="text-xs text-muted-foreground">{asset.cloudinaryPublicId}</p>
                {asset.projectId && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {projects.find((p: any) => p.id === asset.projectId)?.title || `Project #${asset.projectId}`}
                  </Badge>
                )}
              </div>
              <Badge variant={asset.mediaType === "image" ? "default" : "secondary"}>
                {asset.mediaType}
              </Badge>
            </div>
            {asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {asset.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}