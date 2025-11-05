import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@shared/schema";
import { format } from "date-fns";
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
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function getStatus(post: BlogPost): { label: string; variant: "default" | "secondary" | "outline" } {
  if (post.published) {
    return { label: "Published", variant: "default" };
  } else if (post.scheduledFor) {
    return { label: "Scheduled", variant: "secondary" };
  } else {
    return { label: "Draft", variant: "outline" };
  }
}

export default function BlogPostsList() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts?publishedOnly=false"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/blog-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts?publishedOnly=false"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
    }
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Blog Posts | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Blog Posts</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-posts-heading">Manage Blog Posts</h2>
                    <p className="text-muted-foreground text-sm" data-testid="text-posts-description">
                      Create, edit, and manage your blog posts
                    </p>
                  </div>
                  <Link href="/admin/blog-posts/new">
                    <Button data-testid="button-create-post">
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-12" data-testid="loading-posts">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : posts && posts.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-title">Title</TableHead>
                          <TableHead data-testid="header-status">Status</TableHead>
                          <TableHead data-testid="header-category">Category</TableHead>
                          <TableHead data-testid="header-scheduled">Scheduled For</TableHead>
                          <TableHead data-testid="header-published">Published At</TableHead>
                          <TableHead className="text-right" data-testid="header-actions">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => {
                          const status = getStatus(post);
                          return (
                            <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                              <TableCell className="font-medium" data-testid={`text-title-${post.id}`}>
                                {post.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant={status.variant} data-testid={`badge-status-${post.id}`}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell data-testid={`text-category-${post.id}`}>
                                {post.category || "-"}
                              </TableCell>
                              <TableCell data-testid={`text-scheduled-${post.id}`}>
                                {post.scheduledFor
                                  ? format(new Date(post.scheduledFor), "MMM d, yyyy HH:mm")
                                  : "-"}
                              </TableCell>
                              <TableCell data-testid={`text-published-${post.id}`}>
                                {post.publishedAt
                                  ? format(new Date(post.publishedAt), "MMM d, yyyy")
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Link href={`/admin/blog-posts/${post.id}/edit`}>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      data-testid={`button-edit-${post.id}`}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteClick(post)}
                                    data-testid={`button-delete-${post.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-md" data-testid="empty-state">
                    <p className="text-muted-foreground mb-4">No blog posts yet</p>
                    <Link href="/admin/blog-posts/new">
                      <Button data-testid="button-create-first-post">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first post
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-title">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-description">
              This action cannot be undone. This will permanently delete the blog post
              {postToDelete && ` "${postToDelete.title}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
