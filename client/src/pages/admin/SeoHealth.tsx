import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCcw, ShieldAlert, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SeoIssue, InsertBlogPost } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { runTextGenerationJob } from "@/lib/ai-text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

type DashboardIssue = SeoIssue & {
  resolvedByName?: string | null;
};

const AUTO_FIX_ISSUES = [
  "missing_meta_description",
  "duplicate_meta_description",
  "duplicate_meta_title",
] as const;

const severityRank: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const ensureDistinctValue = (
  candidate: string | undefined | null,
  currentValue: string | undefined | null,
  limit: number,
  context: string,
) => {
  const nextValue = (candidate || "").trim();
  if (!nextValue) return null;
  const current = (currentValue || "").trim();
  if (!current || nextValue.toLowerCase() !== current.toLowerCase()) {
    return nextValue;
  }
  const uniqueContext = context.split(/\s+/).slice(0, 5).join(" ");
  const alt = `${nextValue} | ${uniqueContext}`.trim();
  return alt.length > limit ? alt.slice(0, limit) : alt;
};

export default function SeoHealthPage() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery<DashboardIssue[]>({
    queryKey: ["/api/seo/issues"],
  });
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [ignoringId, setIgnoringId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("high");
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved" | "ignored" | "all">("open");

  const issues = data ?? [];

  const filteredIssues = issues.filter((issue) => {
    const severityMatch = severityFilter === "all" || issue.severity === severityFilter;
    const statusMatch = statusFilter === "all" || issue.status === statusFilter;
    return severityMatch && statusMatch;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === "open") return -1;
      if (b.status === "open") return 1;
    }
    const severityDiff = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

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

  const ignoreIssue = async (issueId: string) => {
    try {
      setIgnoringId(issueId);
      await apiRequest("PATCH", `/api/seo/issues/${issueId}/ignore`);
      await refetch();
      toast({
        title: "Issue ignored",
        description: "Marked as false positive.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to ignore issue",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIgnoringId(null);
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

  const handleFixWithAI = async (issue: DashboardIssue) => {
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

      const metadata = await runTextGenerationJob({
        brandVoice: "Revenue Party authoritative, data-driven, confident",
        topic: post.title,
        type: "seo-metadata",
        content: post.content,
      });

      const updates: Partial<InsertBlogPost> = {};

      if (issue.issueType === "duplicate_meta_title" && metadata.metaTitle) {
        updates.metaTitle =
          ensureDistinctValue(metadata.metaTitle, post.metaTitle, 60, post.title) || metadata.metaTitle;
      }

      if (
        (issue.issueType === "missing_meta_description" ||
          issue.issueType === "duplicate_meta_description") &&
        metadata.metaDescription
      ) {
        updates.metaDescription =
          ensureDistinctValue(metadata.metaDescription, post.metaDescription, 160, post.excerpt) ||
          metadata.metaDescription;
      }

      if (Object.keys(updates).length === 0) {
        throw new Error("Could not generate a unique fix for this issue.");
      }

      await apiRequest("PUT", `/api/blog-posts/${issue.entityId}`, updates);

      await apiRequest("PATCH", `/api/seo/issues/${issue.id}/resolve`);
      await refetch();

      toast({
        title: "Metadata updated",
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
                  <Card>
                    <CardHeader className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        <span>Filter issues</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">Severity</Label>
                          <Select
                            value={severityFilter}
                            onValueChange={(value) => setSeverityFilter(value as typeof severityFilter)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-muted-foreground">Status</Label>
                          <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="ignored">Ignored</SelectItem>
                              <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {sortedIssues.length === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>All clear</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {issues.length === 0
                            ? "No SEO issues detected. Run another scan anytime."
                            : "No issues match the current filters."}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {sortedIssues.map((issue) => (
                    <Card key={issue.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <span>{issueTypeLabels[issue.issueType] ?? issue.issueType}</span>
                            <Badge variant={severityVariants[issue.severity] || "default"}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={
                                issue.status === "open"
                                  ? "destructive"
                                  : issue.status === "ignored"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
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
                      <CardContent className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-3">
                          {AUTO_FIX_ISSUES.includes(issue.issueType as (typeof AUTO_FIX_ISSUES)[number]) &&
                            issue.status === "open" && (
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
                            <>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => ignoreIssue(issue.id)}
                                disabled={ignoringId === issue.id}
                                data-testid={`button-ignore-${issue.id}`}
                              >
                                {ignoringId === issue.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Ignoring...
                                  </>
                                ) : (
                                  "Ignore issue"
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                        {issue.status !== "open" && (
                          <p className="text-xs text-muted-foreground">
                            {issue.status === "ignored" ? "Ignored" : "Resolved"}{" "}
                            {issue.resolvedByName ? `by ${issue.resolvedByName}` : "by system"}
                            {issue.resolvedAt ? ` on ${new Date(issue.resolvedAt).toLocaleString()}` : ""}
                          </p>
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

