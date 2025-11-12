import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { invalidateCampaignsCache } from "@/lib/campaignCache";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Campaign } from "@shared/schema";
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

export default function CampaignsList() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: async () => {
      // Invalidate both admin and public campaign caches with tenant awareness
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      await invalidateCampaignsCache(queryClient);
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (campaignToDelete) {
      deleteMutation.mutate(campaignToDelete.id);
    }
  };

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Campaigns | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Campaigns</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-campaigns-heading">Manage Campaigns</h2>
                    <p className="text-muted-foreground text-sm" data-testid="text-campaigns-description">
                      Create and configure content campaigns
                    </p>
                  </div>
                  <Link href="/admin/campaigns/new">
                    <Button data-testid="button-create-campaign">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center py-12" data-testid="loading-campaigns">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : campaigns && campaigns.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-campaign-name">Campaign Name</TableHead>
                          <TableHead data-testid="header-content-type">Content Type</TableHead>
                          <TableHead data-testid="header-display-as">Display As</TableHead>
                          <TableHead data-testid="header-target-zone">Target Zone</TableHead>
                          <TableHead data-testid="header-active-status">Active Status</TableHead>
                          <TableHead className="text-right" data-testid="header-actions">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaigns.map((campaign) => (
                          <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                            <TableCell className="font-medium" data-testid={`text-campaign-name-${campaign.id}`}>
                              {campaign.campaignName}
                            </TableCell>
                            <TableCell data-testid={`text-content-type-${campaign.id}`}>
                              {campaign.contentType}
                            </TableCell>
                            <TableCell data-testid={`text-display-as-${campaign.id}`}>
                              {campaign.displayAs}
                            </TableCell>
                            <TableCell data-testid={`text-target-zone-${campaign.id}`}>
                              {campaign.targetZone || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={campaign.isActive ? "default" : "outline"}
                                data-testid={`badge-active-status-${campaign.id}`}
                              >
                                {campaign.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    data-testid={`button-edit-${campaign.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteClick(campaign)}
                                  data-testid={`button-delete-${campaign.id}`}
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
                    <p className="text-muted-foreground mb-4">No campaigns yet</p>
                    <Link href="/admin/campaigns/new">
                      <Button data-testid="button-create-first">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Campaign
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign "{campaignToDelete?.campaignName}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover-elevate active-elevate-2"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
