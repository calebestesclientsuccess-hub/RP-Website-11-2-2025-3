import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Helmet } from "react-helmet-async";
import { Plus, Search, MoreVertical, Edit, Trash2, Star, StarOff } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ContentType = 'all' | 'blog' | 'video' | 'testimonial' | 'portfolio' | 'job';
type ContentStatus = 'all' | 'published' | 'draft' | 'scheduled';

interface ContentSummary {
  id: string;
  type: 'blog' | 'video' | 'testimonial' | 'portfolio' | 'job';
  title: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledFor: string | null;
  publishedAt: string | null;
  featured: boolean;
  thumbnailUrl: string | null;
  excerpt: string;
  author: string;
}

export default function ContentLibrary() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: content, isLoading } = useQuery<ContentSummary[]>({
    queryKey: ['/api/admin/content', { type: typeFilter, status: statusFilter, search: searchQuery }],
    queryFn: async ({ queryKey }) => {
      const [path, filters] = queryKey as [string, { type: string; status: string; search: string }];
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const paramsString = params.toString();
      const url = paramsString ? `${path}?${paramsString}` : path;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const endpoints: Record<string, string> = {
        blog: `/api/blog-posts/${id}`,
        video: `/api/video-posts/${id}`,
        testimonial: `/api/testimonials/${id}`,
        portfolio: `/api/projects/${id}`,
        job: `/api/job-postings/${id}`,
      };
      
      const res = await fetch(endpoints[type], {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Failed to delete content');
      return { type, id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      if (data.type === 'testimonial') {
        queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
        queryClient.invalidateQueries({ queryKey: ['/api/testimonials', data.id] });
      }
      if (data.type === 'portfolio') {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects', data.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/branding/projects'] });
      }
      toast({ title: "Content deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete content", variant: "destructive" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, type, featured }: { id: string; type: string; featured: boolean }) => {
      if (type !== 'testimonial') {
        throw new Error('Only testimonials support featured toggle');
      }
      
      const response = await apiRequest("PATCH", `/api/testimonials/${id}/featured`, { featured: !featured });
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials', data.id] });
      toast({ title: "Featured status updated" });
    },
  });

  const handleEdit = (item: ContentSummary) => {
    const routes: Record<string, string> = {
      blog: `/admin/blog-posts/${item.id}/edit`,
      video: `/admin/video-posts/${item.id}/edit`,
      testimonial: `/admin/testimonials/${item.id}/edit`,
      portfolio: `/admin/projects/${item.id}/edit`,
    };
    
    const route = routes[item.type];
    if (!route) {
      toast({ 
        title: "Coming soon", 
        description: `${item.type} editing interface is not yet available`,
        variant: "destructive"
      });
      return;
    }
    setLocation(route);
  };
  
  const canEdit = (type: string) => {
    return type === 'blog' || type === 'video' || type === 'testimonial' || type === 'portfolio';
  };

  const handleDelete = (item: ContentSummary) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteMutation.mutate({ id: item.id, type: item.type });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      blog: 'bg-blue-500/10 text-blue-500',
      video: 'bg-purple-500/10 text-purple-500',
      testimonial: 'bg-green-500/10 text-green-500',
      portfolio: 'bg-orange-500/10 text-orange-500',
      job: 'bg-cyan-500/10 text-cyan-500',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500';
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Content Library | Admin</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Content Library</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters and Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ContentType)}>
                      <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="blog">Blog Posts</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="testimonial">Testimonials</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="job">Jobs</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatus)}>
                      <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[250px]"
                        data-testid="input-search"
                      />
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button data-testid="button-add-content">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocation('/admin/blog-posts/new')}>
                        Blog Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/admin/video-posts/new')}>
                        Video Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/admin/testimonials/new')}>
                        Testimonial
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation('/admin/projects/new')}>
                        Portfolio Project
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        Job Posting (Coming Soon)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content Table */}
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading content...</div>
                ) : !content || content.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No content found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {content.map((item) => (
                        <TableRow key={`${item.type}-${item.id}`} data-testid={`row-content-${item.id}`}>
                          <TableCell>
                            {item.thumbnailUrl && (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.title}</span>
                              {item.featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            </div>
                            {item.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.excerpt}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getTypeColor(item.type)}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === 'published' ? 'default' :
                              item.status === 'scheduled' ? 'outline' :
                              'secondary'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.author}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.publishedAt
                              ? format(new Date(item.publishedAt), 'MMM d, yyyy')
                              : item.scheduledFor
                              ? `Scheduled: ${format(new Date(item.scheduledFor), 'MMM d, yyyy')}`
                              : 'Draft'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${item.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(item)}
                                  disabled={!canEdit(item.type)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit{!canEdit(item.type) && ' (Coming Soon)'}
                                </DropdownMenuItem>
                                {item.type === 'testimonial' && (
                                  <DropdownMenuItem
                                    onClick={() => toggleFeaturedMutation.mutate({
                                      id: item.id,
                                      type: item.type,
                                      featured: item.featured,
                                    })}
                                  >
                                    {item.featured ? (
                                      <>
                                        <StarOff className="h-4 w-4 mr-2" />
                                        Unfeature
                                      </>
                                    ) : (
                                      <>
                                        <Star className="h-4 w-4 mr-2" />
                                        Feature
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(item)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
