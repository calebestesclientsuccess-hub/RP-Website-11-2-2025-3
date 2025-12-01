import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Plus, Edit2, Trash2, FileText, Image, Upload, Loader2, ExternalLink, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

interface Ebook {
  id: string;
  slug: string;
  h1Text: string;
  h2Text?: string;
  bodyText?: string;
  pdfUrl: string;
  pdfPublicId?: string;
  previewImageUrl?: string;
  previewImagePublicId?: string;
  imageSize?: "small" | "medium" | "large" | "xlarge" | "full";
  imageOrientation?: "portrait" | "landscape";
  imageStyle?: "shadow" | "minimal" | "elevated" | "glow" | "tilted";
  ctaButtonText?: string;
  successMessage?: string;
  calendlyLink?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EbookFormData {
  slug: string;
  h1Text: string;
  h2Text: string;
  bodyText: string;
  pdfUrl: string;
  pdfPublicId: string;
  previewImageUrl: string;
  previewImagePublicId: string;
  imageSize: "small" | "medium" | "large" | "xlarge" | "full";
  imageOrientation: "portrait" | "landscape";
  imageStyle: "shadow" | "minimal" | "elevated" | "glow" | "tilted";
  ctaButtonText: string;
  successMessage: string;
  calendlyLink: string;
  isEnabled: boolean;
}

const initialFormData: EbookFormData = {
  slug: "",
  h1Text: "",
  h2Text: "",
  bodyText: "",
  pdfUrl: "",
  pdfPublicId: "",
  previewImageUrl: "",
  previewImagePublicId: "",
  imageSize: "medium",
  imageOrientation: "portrait",
  imageStyle: "shadow",
  ctaButtonText: "Get Free Access",
  successMessage: "Check your email for your free e-book!",
  calendlyLink: "",
  isEnabled: false,
};

export default function EbookLeadMagnets() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [formData, setFormData] = useState<EbookFormData>(initialFormData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Fetch all ebooks
  const { data: ebooks, isLoading } = useQuery<Ebook[]>({
    queryKey: ["/api/admin/ebooks"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: EbookFormData) => {
      return await apiRequest("POST", "/api/admin/ebooks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      toast({
        title: "E-book created",
        description: "The e-book has been created successfully.",
      });
      setDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create e-book",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EbookFormData> }) => {
      return await apiRequest("PUT", `/api/admin/ebooks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      toast({
        title: "E-book updated",
        description: "The e-book has been updated successfully.",
      });
      setDialogOpen(false);
      setEditingEbook(null);
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update e-book",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/ebooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ebooks"] });
      toast({
        title: "E-book deleted",
        description: "The e-book has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete e-book",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setFormData({
      slug: ebook.slug,
      h1Text: ebook.h1Text,
      h2Text: ebook.h2Text || "",
      bodyText: ebook.bodyText || "",
      pdfUrl: ebook.pdfUrl,
      pdfPublicId: ebook.pdfPublicId || "",
      previewImageUrl: ebook.previewImageUrl || "",
      previewImagePublicId: ebook.previewImagePublicId || "",
      imageSize: ebook.imageSize || "medium",
      imageOrientation: ebook.imageOrientation || "portrait",
      imageStyle: ebook.imageStyle || "shadow",
      ctaButtonText: ebook.ctaButtonText || "Get Free Access",
      successMessage: ebook.successMessage || "Check your email for your free e-book!",
      calendlyLink: ebook.calendlyLink || "",
      isEnabled: ebook.isEnabled,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.slug || !formData.h1Text || !formData.pdfUrl) {
      toast({
        title: "Required fields missing",
        description: "Please fill in slug, H1 text, and upload a PDF.",
        variant: "destructive",
      });
      return;
    }

    if (editingEbook) {
      updateMutation.mutate({ id: editingEbook.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (file: File, type: 'pdf' | 'image') => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    if (type === 'pdf') {
      setUploadingPdf(true);
    } else {
      setUploadingImage(true);
    }

    try {
      const response = await fetch("/api/media-library/upload", {
        method: "POST",
        body: formDataObj,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const uploadedMedia = await response.json();

      if (type === 'pdf') {
        setFormData((prev) => ({
          ...prev,
          pdfUrl: uploadedMedia.cloudinaryUrl,
          pdfPublicId: uploadedMedia.cloudinaryPublicId || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          previewImageUrl: uploadedMedia.cloudinaryUrl,
          previewImagePublicId: uploadedMedia.cloudinaryPublicId || "",
        }));
      }

      toast({
        title: "Upload successful",
        description: `${type === 'pdf' ? 'PDF' : 'Image'} uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      if (type === 'pdf') {
        setUploadingPdf(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  const handleNewEbook = () => {
    setEditingEbook(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>E-Book Lead Magnets | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between gap-4 p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-page-title">
                    E-Book Lead Magnets
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage downloadable e-books with lead capture forms
                  </p>
                </div>
              </div>
              <Button onClick={handleNewEbook}>
                <Plus className="w-4 h-4 mr-2" />
                Create E-Book
              </Button>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-6xl mx-auto">
                {isLoading ? (
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading e-books...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : ebooks && ebooks.length > 0 ? (
                  <div className="grid gap-4">
                    {ebooks.map((ebook) => (
                      <Card key={ebook.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            {ebook.previewImageUrl && (
                              <img
                                src={ebook.previewImageUrl}
                                alt={ebook.h1Text}
                                className="w-32 h-40 object-cover rounded-lg shadow-md"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">{ebook.h1Text}</h3>
                                    <Badge variant={ebook.isEnabled ? "default" : "secondary"}>
                                      {ebook.isEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground font-mono mb-2">
                                    Slug: {ebook.slug}
                                  </p>
                                  {ebook.h2Text && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {ebook.h2Text}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(ebook)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(ebook.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {ebook.bodyText && (
                                <p className="text-sm mb-3 line-clamp-2">{ebook.bodyText}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {ebook.pdfUrl && (
                                  <Badge variant="outline">
                                    <FileText className="w-3 h-3 mr-1" />
                                    PDF Attached
                                  </Badge>
                                )}
                                {ebook.calendlyLink && (
                                  <Badge variant="outline">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Calendly Link
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  CTA: {ebook.ctaButtonText}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No e-books yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first e-book lead magnet to start capturing leads
                      </p>
                      <Button onClick={handleNewEbook}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First E-Book
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEbook ? "Edit E-Book" : "Create New E-Book"}
            </DialogTitle>
            <DialogDescription>
              {editingEbook
                ? "Update the e-book details below"
                : "Fill in the details to create a new e-book lead magnet"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview" disabled={!formData.previewImageUrl}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit">
              <form onSubmit={handleSubmit} className="space-y-4" id="ebook-form">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="198k-mistake-ebook"
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (lowercase, numbers, hyphens only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="h1Text">H1 Headline *</Label>
              <Input
                id="h1Text"
                value={formData.h1Text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, h1Text: e.target.value }))
                }
                placeholder="The $198,000 Mistake You Don't Have to Make"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="h2Text">H2 Subheadline</Label>
              <Input
                id="h2Text"
                value={formData.h2Text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, h2Text: e.target.value }))
                }
                placeholder="Optional subheadline"
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyText">Body Text</Label>
              <Textarea
                id="bodyText"
                value={formData.bodyText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bodyText: e.target.value }))
                }
                placeholder="Describe what readers will learn..."
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF File *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'pdf');
                    }}
                    disabled={uploadingPdf}
                    className="flex-1"
                  />
                  {uploadingPdf && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {formData.pdfUrl && (
                  <p className="text-xs text-green-600">✓ PDF uploaded</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Preview Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {formData.previewImageUrl && (
                  <img
                    src={formData.previewImageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            {/* Image Styling Controls */}
            {formData.previewImageUrl && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold text-sm">Image Presentation</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageSize">Size</Label>
                    <Select
                      value={formData.imageSize}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, imageSize: value }))
                      }
                    >
                      <SelectTrigger id="imageSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (384px)</SelectItem>
                        <SelectItem value="medium">Medium (512px)</SelectItem>
                        <SelectItem value="large">Large (672px)</SelectItem>
                        <SelectItem value="xlarge">X-Large (896px)</SelectItem>
                        <SelectItem value="full">Full Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageOrientation">Orientation</Label>
                    <Select
                      value={formData.imageOrientation}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, imageOrientation: value }))
                      }
                    >
                      <SelectTrigger id="imageOrientation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageStyle">Style</Label>
                    <Select
                      value={formData.imageStyle}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, imageStyle: value }))
                      }
                    >
                      <SelectTrigger id="imageStyle">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shadow">Shadow (Default)</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="elevated">Elevated</SelectItem>
                        <SelectItem value="glow">Glow</SelectItem>
                        <SelectItem value="tilted">Tilted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Preview the final look below after saving
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                <Input
                  id="ctaButtonText"
                  value={formData.ctaButtonText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ctaButtonText: e.target.value }))
                  }
                  placeholder="Get Free Access"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="successMessage">Success Message</Label>
                <Input
                  id="successMessage"
                  value={formData.successMessage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, successMessage: e.target.value }))
                  }
                  placeholder="Check your email!"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendlyLink">Calendly Link (Optional)</Label>
              <Input
                id="calendlyLink"
                type="url"
                value={formData.calendlyLink}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, calendlyLink: e.target.value }))
                }
                placeholder="https://calendly.com/your-link"
              />
              <p className="text-xs text-muted-foreground">
                Show a "Book a Call" button after download
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="isEnabled">Enable E-Book</Label>
                <p className="text-xs text-muted-foreground">
                  Make this e-book available on your site
                </p>
              </div>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isEnabled: checked }))
                }
              />
            </div>

              </form>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {formData.previewImageUrl ? (
                <div className="p-6 bg-background rounded-lg border">
                  <div className="mb-4">
                    <Badge variant="secondary">Live Preview</Badge>
                  </div>
                  <EbookPreviewComponent formData={formData} />
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a preview image to see the preview</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingEbook(null);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="ebook-form"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingEbook
                ? "Update E-Book"
                : "Create E-Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the e-book. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  deleteMutation.mutate(deletingId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}

// Helper function to get image styling classes
function getImageStyling(size: string, orientation: string, style: string) {
  // Size classes
  const sizeClasses = {
    small: 'max-w-sm md:max-w-sm',
    medium: 'max-w-md md:max-w-md lg:max-w-lg',
    large: 'max-w-lg md:max-w-xl lg:max-w-2xl',
    xlarge: 'max-w-md md:max-w-2xl lg:max-w-4xl',
    full: 'w-full'
  };

  // Style wrapper and image classes
  const styleClasses = {
    shadow: {
      wrapper: 'relative',
      image: 'relative rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.6)]',
      decoration: <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-xl transform rotate-6 -z-10"></div>
    },
    minimal: {
      wrapper: 'relative',
      image: 'rounded-xl border-2 border-border/30',
      decoration: null
    },
    elevated: {
      wrapper: 'relative',
      image: 'relative rounded-xl shadow-2xl',
      decoration: <div className="absolute inset-0 bg-black/20 blur-2xl rounded-xl transform translate-y-8 -z-10"></div>
    },
    glow: {
      wrapper: 'relative',
      image: 'relative rounded-xl shadow-2xl ring-1 ring-white/10',
      decoration: <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-xl -z-10"></div>
    },
    tilted: {
      wrapper: 'relative',
      image: 'rounded-xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500',
      decoration: null
    }
  };

  return {
    sizeClass: sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium,
    styleClass: styleClasses[style as keyof typeof styleClasses] || styleClasses.shadow
  };
}

// Preview component
function EbookPreviewComponent({ formData }: { formData: EbookFormData }) {
  const { sizeClass, styleClass } = getImageStyling(
    formData.imageSize,
    formData.imageOrientation,
    formData.imageStyle
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Content Side */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {formData.h1Text || "Your E-Book Title"}
          </h1>
          {formData.h2Text && (
            <h2 className="text-xl md:text-2xl text-muted-foreground">
              {formData.h2Text}
            </h2>
          )}
          {formData.bodyText && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {formData.bodyText}
            </p>
          )}
        </div>

        {/* Mini form preview */}
        <div className="space-y-4 max-w-md">
          <div className="space-y-2 opacity-60 pointer-events-none">
            <Input placeholder="Your full name" disabled />
            <Input placeholder="you@company.com" disabled />
            <Input placeholder="e.g., CEO, VP Sales" disabled />
            <div className="grid grid-cols-3 gap-2">
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="+1" />
                </SelectTrigger>
              </Select>
              <Input placeholder="555-123-4567" disabled className="col-span-2" />
            </div>
            <Button className="w-full" disabled>
              {formData.ctaButtonText || "Get Free Access"}
            </Button>
          </div>
        </div>
      </div>

      {/* Image Side */}
      <div className="flex justify-center items-center">
        <div className={sizeClass}>
          <div className={styleClass.wrapper}>
            {styleClass.decoration}
            <img
              src={formData.previewImageUrl}
              alt="E-Book Preview"
              className={styleClass.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

