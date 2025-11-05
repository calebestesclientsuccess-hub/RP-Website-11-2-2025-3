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
import type { AssessmentConfig } from "@shared/schema";
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

export default function AssessmentConfigsList() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<AssessmentConfig | null>(null);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: configs, isLoading } = useQuery<AssessmentConfig[]>({
    queryKey: ["/api/assessment-configs"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/assessment-configs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-configs"] });
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
      setDeleteDialogOpen(false);
      setConfigToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assessment",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (config: AssessmentConfig) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      deleteMutation.mutate(configToDelete.id);
    }
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Assessments | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Assessments</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-assessments-heading">Manage Assessments</h2>
                    <p className="text-muted-foreground text-sm" data-testid="text-assessments-description">
                      Create and configure assessment tools
                    </p>
                  </div>
                  <Link href="/admin/assessments/new">
                    <Button data-testid="button-create-assessment">
                      <Plus className="w-4 h-4 mr-2" />
                      New Assessment
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-12" data-testid="loading-assessments">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : configs && configs.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-title">Title</TableHead>
                          <TableHead data-testid="header-slug">Slug</TableHead>
                          <TableHead data-testid="header-status">Status</TableHead>
                          <TableHead data-testid="header-scoring">Scoring Method</TableHead>
                          <TableHead data-testid="header-created">Created</TableHead>
                          <TableHead className="text-right" data-testid="header-actions">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {configs.map((config) => (
                          <TableRow key={config.id} data-testid={`row-assessment-${config.id}`}>
                            <TableCell className="font-medium" data-testid={`text-title-${config.id}`}>
                              {config.title}
                            </TableCell>
                            <TableCell data-testid={`text-slug-${config.id}`}>
                              {config.slug}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={config.published ? "default" : "outline"}
                                data-testid={`badge-status-${config.id}`}
                              >
                                {config.published ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell data-testid={`text-scoring-${config.id}`}>
                              {config.scoringMethod}
                            </TableCell>
                            <TableCell data-testid={`text-created-${config.id}`}>
                              {format(new Date(config.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/assessments/${config.id}/edit`}>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    data-testid={`button-edit-${config.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteClick(config)}
                                  data-testid={`button-delete-${config.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-md" data-testid="empty-state">
                    <p className="text-muted-foreground mb-4">No assessments yet</p>
                    <Link href="/admin/assessments/new">
                      <Button data-testid="button-create-first">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Assessment
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{configToDelete?.title}"? This will also delete all associated questions, answers, and result buckets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
