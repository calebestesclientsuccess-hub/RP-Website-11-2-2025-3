import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Helmet } from "react-helmet-async";
import { Search, Bookmark, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SceneTemplate {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  previewImageUrl: string | null;
  sceneConfig: Record<string, any>;
  sourceProjectId: string | null;
  sourceSceneId: string | null;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  createdBy: string;
}

function TemplateCard({ template, onDelete, onPreview, onUse }: {
  template: SceneTemplate;
  onDelete: (id: string) => void;
  onPreview: (template: SceneTemplate) => void;
  onUse: (template: SceneTemplate) => void;
}) {
  const sceneType = template.sceneConfig?.type || 'unknown';
  
  return (
    <Card className="hover-elevate flex flex-col" data-testid={`card-template-${template.id}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2" data-testid="text-template-name">
            {template.name}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(template.id)}
            data-testid="button-delete-template"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {template.previewImageUrl && (
          <img
            src={template.previewImageUrl}
            alt={template.name}
            className="w-full h-40 object-cover rounded-md"
            data-testid="img-template-preview"
          />
        )}
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-template-description">
            {template.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {template.category && (
            <Badge variant="secondary" data-testid="badge-template-category">
              {template.category}
            </Badge>
          )}
          <Badge variant="outline" data-testid="badge-scene-type">
            {sceneType}
          </Badge>
        </div>
        
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs" data-testid={`badge-tag-${idx}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div data-testid="text-usage-count">
            Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
          </div>
          {template.lastUsedAt && (
            <div data-testid="text-last-used">
              Last used {format(new Date(template.lastUsedAt), 'MMM d, yyyy')}
            </div>
          )}
          <div data-testid="text-created-at">
            Created {format(new Date(template.createdAt), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="flex-1"
          data-testid="button-preview-template"
        >
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </Button>
        <Button
          size="sm"
          onClick={() => onUse(template)}
          className="flex-1"
          data-testid="button-use-template"
        >
          <Plus className="w-4 h-4 mr-1" />
          Use
        </Button>
      </CardFooter>
    </Card>
  );
}

function TemplatePreviewModal({ template, open, onOpenChange, onUse }: {
  template: SceneTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: SceneTemplate) => void;
}) {
  if (!template) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="dialog-template-preview">
        <DialogHeader>
          <DialogTitle data-testid="text-preview-title">{template.name}</DialogTitle>
          {template.description && (
            <DialogDescription data-testid="text-preview-description">
              {template.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {template.previewImageUrl && (
            <img
              src={template.previewImageUrl}
              alt={template.name}
              className="w-full rounded-md"
              data-testid="img-preview-full"
            />
          )}
          
          <div className="space-y-2">
            <h4 className="font-semibold">Scene Configuration</h4>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs" data-testid="text-scene-config">
              {JSON.stringify(template.sceneConfig, null, 2)}
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span>{' '}
              <span data-testid="text-preview-category">{template.category || 'None'}</span>
            </div>
            <div>
              <span className="font-medium">Scene Type:</span>{' '}
              <span data-testid="text-preview-scene-type">{template.sceneConfig?.type || 'unknown'}</span>
            </div>
            <div>
              <span className="font-medium">Usage Count:</span>{' '}
              <span data-testid="text-preview-usage">{template.usageCount}</span>
            </div>
            <div>
              <span className="font-medium">Created:</span>{' '}
              <span data-testid="text-preview-created">{format(new Date(template.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-preview">
            Close
          </Button>
          <Button onClick={() => {
            onUse(template);
            onOpenChange(false);
          }} data-testid="button-use-from-preview">
            <Plus className="w-4 h-4 mr-1" />
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplateLibrary() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<SceneTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: templates = [], isLoading } = useQuery<SceneTemplate[]>({
    queryKey: ['/api/scene-templates', { category: categoryFilter, search: searchQuery }],
    queryFn: async ({ queryKey }) => {
      const [path, filters] = queryKey as [string, { category: string; search: string }];
      
      // Use search endpoint if there's a search query
      if (filters.search && filters.search.trim()) {
        const res = await fetch(`/api/scene-templates/search?q=${encodeURIComponent(filters.search)}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to search templates');
        return res.json();
      }
      
      // Otherwise use the list endpoint with filters
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      
      const paramsString = params.toString();
      const url = paramsString ? `${path}?${paramsString}` : path;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/scene-templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scene-templates'] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = (template: SceneTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleUse = (template: SceneTemplate) => {
    toast({
      title: "Template selected",
      description: "Please select a project to add this template to.",
    });
    // TODO: Implement project selection and recycling logic
  };

  // Extract unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.filter(t => t.category).map(t => t.category!)))];

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <ProtectedRoute>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <Helmet>
              <title>Template Library | Revenue Party Admin</title>
            </Helmet>

            <header className="flex items-center justify-between p-4 border-b gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bookmark className="w-6 h-6" />
                  Template Library
                </h1>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-templates"
                      />
                    </div>
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Grid */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12" data-testid="text-no-templates">
                    <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || categoryFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first template from an existing scene'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onDelete={handleDelete}
                        onPreview={handlePreview}
                        onUse={handleUse}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUse={handleUse}
      />
    </ProtectedRoute>
  );
}
