
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
import { Loader2, Upload, Image, Video, Trash2, Tag } from "lucide-react";

interface MediaAsset {
  id: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  mediaType: "image" | "video";
  label?: string;
  tags: string[];
  createdAt: string;
}

export default function MediaLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [customTags, setCustomTags] = useState<string>("");

  const style = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  const { data: mediaAssets = [], isLoading } = useQuery<MediaAsset[]>({
    queryKey: ["/api/media-library"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/media-library/upload", formData, {
        headers: {} // Let browser set Content-Type with boundary
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-library"] });
      toast({ title: "Media uploaded successfully" });
      setSelectedLabel("");
      setCustomTags("");
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
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("label", selectedLabel);
        formData.append("tags", customTags);

        await uploadMutation.mutateAsync(formData);
      }
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
                      <Label>Media Label (Optional)</Label>
                      <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select label..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="logo">Logo</SelectItem>
                          <SelectItem value="primary-image">Primary Image</SelectItem>
                          <SelectItem value="secondary-image">Secondary Image</SelectItem>
                          <SelectItem value="hero-image">Hero Image</SelectItem>
                          <SelectItem value="thumbnail">Thumbnail</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Tags (comma-separated)</Label>
                      <Input
                        placeholder="e.g., branding, homepage, feature"
                        value={customTags}
                        onChange={(e) => setCustomTags(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Files</Label>
                      <Input
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
                    <MediaGrid assets={mediaAssets} onDelete={(id) => deleteMutation.mutate(id)} />
                  </TabsContent>

                  <TabsContent value="images" className="mt-6">
                    <MediaGrid assets={filterByType("image")} onDelete={(id) => deleteMutation.mutate(id)} />
                  </TabsContent>

                  <TabsContent value="videos" className="mt-6">
                    <MediaGrid assets={filterByType("video")} onDelete={(id) => deleteMutation.mutate(id)} />
                  </TabsContent>

                  <TabsContent value="logos" className="mt-6">
                    <MediaGrid assets={filterByLabel("logo")} onDelete={(id) => deleteMutation.mutate(id)} />
                  </TabsContent>

                  <TabsContent value="primary" className="mt-6">
                    <MediaGrid assets={filterByLabel("primary-image")} onDelete={(id) => deleteMutation.mutate(id)} />
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

function MediaGrid({ assets, onDelete }: { assets: MediaAsset[]; onDelete: (id: string) => void }) {
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
              <video src={asset.cloudinaryUrl} className="w-full h-full object-cover" />
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
            <div className="flex items-center gap-2">
              {asset.mediaType === "image" ? (
                <Image className="w-4 h-4" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              <span className="text-xs font-medium truncate">{asset.cloudinaryPublicId}</span>
            </div>
            {asset.label && (
              <Badge variant="secondary" className="text-xs">
                {asset.label}
              </Badge>
            )}
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
