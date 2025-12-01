import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, Download, Upload, Play, CheckCircle2, AlertCircle, Loader2, Sparkles, Flag, FileText, Layers, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface SeedScript {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  icon: any;
  category: "critical" | "content" | "config";
  estimatedTime: string;
}

const SEED_SCRIPTS: SeedScript[] = [
  {
    id: "ai-prompts",
    name: "AI Prompt Templates",
    description: "Restore default AI director prompts (7 templates). Critical for portfolio generation.",
    endpoint: "/api/admin/seed/ai-prompts",
    icon: Sparkles,
    category: "critical",
    estimatedTime: "< 5 seconds",
  },
  {
    id: "configs",
    name: "System Configurations",
    description: "Feature flags, widget configs, and testimonials. Essential system defaults.",
    endpoint: "/api/admin/seed/configs",
    icon: Flag,
    category: "config",
    estimatedTime: "< 10 seconds",
  },
  {
    id: "blogs",
    name: "Blog Posts",
    description: "Restore production blog content (3 featured articles).",
    endpoint: "/api/admin/seed/blogs",
    icon: FileText,
    category: "content",
    estimatedTime: "< 5 seconds",
  },
  {
    id: "all",
    name: "Master Seed (All)",
    description: "Run all seed scripts in sequence. Recommended for fresh deployments.",
    endpoint: "/api/admin/seed/master",
    icon: Database,
    category: "critical",
    estimatedTime: "< 30 seconds",
  },
];

export default function DataManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runSeed = async (script: SeedScript) => {
    setRunning(prev => new Set(prev).add(script.id));
    setErrors(prev => {
      const next = { ...prev };
      delete next[script.id];
      return next;
    });
    
    try {
      const response = await fetch(script.endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      setResults(prev => ({ 
        ...prev, 
        [script.id]: { 
          ...result, 
          timestamp: new Date().toISOString() 
        } 
      }));
      
      toast({
        title: "✅ Seed Complete",
        description: `${script.name} seeded successfully`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      setErrors(prev => ({ ...prev, [script.id]: errorMessage }));
      
      toast({
        title: "❌ Seed Failed",
        description: `${script.name}: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setRunning(prev => {
        const next = new Set(prev);
        next.delete(script.id);
        return next;
      });
    }
  };

  const runAllSeeds = async () => {
    const masterScript = SEED_SCRIPTS.find(s => s.id === "all");
    if (masterScript) {
      await runSeed(masterScript);
    }
  };

  const exportData = async () => {
    toast({
      title: "Export Starting",
      description: "Preparing data export...",
    });

    try {
      const response = await fetch("/api/admin/export", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Export Complete",
        description: "Data exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "❌ Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatResult = (result: any) => {
    if (!result) return null;

    const parts: string[] = [];
    
    if (result.created !== undefined) parts.push(`${result.created} created`);
    if (result.updated !== undefined) parts.push(`${result.updated} updated`);
    if (result.skipped !== undefined) parts.push(`${result.skipped} skipped`);
    
    // Handle nested results (from master seed)
    if (result.flags) parts.push(`${result.flags.created + result.flags.updated} flags`);
    if (result.widgets) parts.push(`${result.widgets.created + result.widgets.updated} widgets`);
    if (result.testimonials) parts.push(`${result.testimonials.created} testimonials`);
    if (result.aiPrompts) parts.push(`${result.aiPrompts.created + result.aiPrompts.updated} AI prompts`);
    if (result.blogs) parts.push(`${result.blogs.created + result.blogs.updated} blogs`);
    
    return parts.join(" • ");
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage system data, run seed scripts, and create backups
        </p>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Production Environment</AlertTitle>
        <AlertDescription>
          These tools modify your database. Always create a backup before running seed scripts.
          Logged in as: <strong>{user?.username}</strong>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common data management operations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            variant="default" 
            onClick={runAllSeeds}
            disabled={running.size > 0}
          >
            {running.has("all") ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Seeds
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          <Button variant="outline" disabled>
            <Upload className="w-4 h-4 mr-2" />
            Import Backup
            <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seed Scripts</h2>
        
        {SEED_SCRIPTS.map((script) => {
          const isRunning = running.has(script.id);
          const result = results[script.id];
          const error = errors[script.id];
          
          return (
            <Card key={script.id} className={error ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <script.icon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{script.name}</CardTitle>
                      <CardDescription className="mt-1">{script.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>⏱️ {script.estimatedTime}</span>
                        <Badge 
                          variant={script.category === "critical" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {script.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => runSeed(script)}
                    disabled={isRunning || running.size > 0}
                    className="ml-4"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Run Seed
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {(result || error) && (
                <CardContent>
                  {error ? (
                    <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Error:</strong> {error}
                      </div>
                    </div>
                  ) : result ? (
                    <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">Last run successful</div>
                        <div className="text-xs opacity-80 mt-1">
                          {new Date(result.timestamp).toLocaleString()} • {formatResult(result)}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Seed Scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Seed scripts</strong> populate your database with default data and configurations.
            They are idempotent, meaning you can run them multiple times safely.
          </p>
          <p>
            <strong>Critical seeds</strong> restore essential system functionality (AI prompts, core configs).
            <br />
            <strong>Content seeds</strong> restore blog posts and portfolio projects.
            <br />
            <strong>Config seeds</strong> restore feature flags and UI settings.
          </p>
          <p>
            Use the <strong>Master Seed (All)</strong> button for fresh Vercel deployments to restore
            all your production configurations at once.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

