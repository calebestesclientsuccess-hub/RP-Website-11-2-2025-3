import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SeoIssue } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const issueTypeLabels: Record<string, string> = {
  missing_meta_description: "Missing Meta Description",
  short_title: "Title Too Short",
  missing_featured_image: "Missing Featured Image",
  canonical_mismatch: "Canonical URL Mismatch",
  duplicate_meta_title: "Duplicate Meta Title",
  duplicate_meta_description: "Duplicate Meta Description",
};

const severityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export default function SeoHealthPage() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery<SeoIssue[]>({
    queryKey: ["/api/seo/issues"],
  });
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const issues = data ?? [];

  const runScan = async () => {
    try {
      setIsRunningScan(true);
      await apiRequest("GET", "/api/seo/health-check");
      await refetch();
      toast({
        title: "Scan complete",
        description: "SEO issues have been refreshed.",
      });
    } catch (error: any) {
      toast({
        title: "Scan failed",
        description: error?.message || "Unable to run health check.",
        variant: "destructive",
      });
    } finally {
      setIsRunningScan(false);
    }
  };

  const resolveIssue = async (issueId: string) => {
    try {
      setResolvingId(issueId);
      await apiRequest("PATCH", `/api/seo/issues/${issueId}/resolve`);
      await refetch();
      toast({
        title: "Issue resolved",
        description: "Issue marked as resolved.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resolve issue",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setResolvingId(null);
    }
  };

  const handleFixWithAI = async (issue: SeoIssue) => {
    if (!issue.entityId) {
      toast({
        title: "Cannot auto-fix",
        description: "This issue is not linked to a content entity.",
        variant: "destructive",
      });
      return;
    }

    try {
      setFixingId(issue.id);
      const postResponse = await apiRequest("GET", `/api/blog-posts/by-id/${issue.entityId}`);
      const post = await postResponse.json();

      const aiResponse = await apiRequest("POST", "/api/ai/text", {
        brandVoice: "Revenue Party authoritative, data-driven, confident",
        topic: post.title,
        type: "seo-metadata",
        content: post.content,
      });
      const metadata = await aiResponse.json();

      await apiRequest("PUT", `/api/blog-posts/${issue.entityId}`, {
        metaTitle: metadata.metaTitle,
        metaDescription: metadata.metaDescription,
      });

      await apiRequest("PATCH", `/api/seo/issues/${issue.id}/resolve`);
      await refetch();

      toast({
        title: "Meta description updated",
        description: "AI generated metadata has been applied.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to auto-fix",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setFixingId(null);
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ProtectedRoute>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">SEO Health</h1>
                <p className="text-sm text-muted-foreground">
                  Track and resolve crawl-blocking issues before they hit production.
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => refetch()}
                  data-testid="button-refresh-issues"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  type="button"
                  onClick={runScan}
                  disabled={isRunningScan}
                  data-testid="button-run-scan"
                >
                  {isRunningScan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Run Scan
                    </>
                  )}
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading issues...
                </div>
              ) : (
                <div className="space-y-4">
                  {issues.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>All clear</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          No active SEO issues detected. Run another scan anytime.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {issues.map((issue) => (
                    <Card key={issue.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <span>{issueTypeLabels[issue.issueType] ?? issue.issueType}</span>
                            <Badge variant={severityVariants[issue.severity] || "default"}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge variant={issue.status === "open" ? "destructive" : "secondary"}>
                              {issue.status}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{issue.details}</p>
                        </div>
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline"
                        >
                          View page
                        </a>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-3">
                        {issue.issueType === "missing_meta_description" && issue.status === "open" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleFixWithAI(issue)}
                            disabled={fixingId === issue.id}
                            data-testid={`button-fix-${issue.id}`}
                          >
                            {fixingId === issue.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Applying fix...
                              </>
                            ) : (
                              "Fix with AI"
                            )}
                          </Button>
                        )}
                        {issue.status === "open" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveIssue(issue.id)}
                            disabled={resolvingId === issue.id}
                            data-testid={`button-resolve-${issue.id}`}
                          >
                            {resolvingId === issue.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resolving...
                              </>
                            ) : (
                              "Mark resolved"
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

