import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  Plus, 
  Edit, 
  Share2, 
  Trash2, 
  Clock, 
  Folder,
  AlertCircle,
  X
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface RecentProject {
  id: string;
  name: string;
  lastAccessed: string; // ISO timestamp
  previewImage?: string; // First scene image
  brandArchetype?: string;
  client?: string;
  slug?: string;
}

interface RecentProjectsProps {
  className?: string;
  maxProjects?: number;
  onProjectSelect?: (project: RecentProject) => void;
}

export function RecentProjects({ 
  className, 
  maxProjects = 9,
  onProjectSelect 
}: RecentProjectsProps) {
  const [, setLocation] = useLocation();
  const [recentProjects, setRecentProjects] = useLocalStorage<RecentProject[]>(
    "recentProjects",
    []
  );
  const [deleteTarget, setDeleteTarget] = useState<RecentProject | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle project navigation
  const handleEditProject = (project: RecentProject) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    } else {
      // Update last accessed time
      updateProjectAccess(project.id);
      // Navigate to portfolio builder
      setLocation(`/admin/portfolio-builder?projectId=${project.id}`);
    }
  };

  // Update project access time
  const updateProjectAccess = (projectId: string) => {
    setRecentProjects(prev => {
      const updated = prev.map(p => 
        p.id === projectId 
          ? { ...p, lastAccessed: new Date().toISOString() }
          : p
      );
      // Sort by last accessed (newest first)
      return updated.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
    });
  };

  // Handle project deletion
  const handleDeleteProject = (project: RecentProject) => {
    setRecentProjects(prev => prev.filter(p => p.id !== project.id));
    setDeleteTarget(null);
  };

  // Handle share project
  const handleShareProject = (project: RecentProject) => {
    const shareUrl = `${window.location.origin}/branding/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    // You could add a toast here to confirm copy
  };

  // Clear all projects
  const handleClearAll = () => {
    setRecentProjects([]);
    setShowClearConfirm(false);
  };

  // Create new project
  const handleCreateNew = () => {
    setLocation("/admin/portfolio-wizard");
  };

  // Format the last accessed time
  const formatLastAccessed = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  // Get gradient for brand archetype
  const getArchetypeGradient = (archetype?: string) => {
    const gradients: Record<string, string> = {
      creator: "from-purple-500 to-pink-500",
      sage: "from-blue-600 to-cyan-500",
      hero: "from-red-500 to-orange-500",
      outlaw: "from-gray-900 to-gray-700",
      magician: "from-purple-600 to-indigo-600",
      innocent: "from-blue-400 to-green-400",
      explorer: "from-green-500 to-teal-500",
      ruler: "from-amber-600 to-yellow-500",
      caregiver: "from-pink-400 to-rose-400",
      everyman: "from-gray-500 to-gray-400",
      jester: "from-yellow-400 to-orange-400",
      lover: "from-rose-500 to-pink-500",
    };
    return gradients[archetype || ""] || "from-gray-400 to-gray-500";
  };

  // Limit projects to maxProjects
  const displayProjects = recentProjects.slice(0, maxProjects);

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          {recentProjects.length > 0 && (
            <Badge className="ml-2">{recentProjects.length}</Badge>
          )}
        </div>
        
        {recentProjects.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {recentProjects.length === 0 ? (
        // Empty state
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recent projects</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Create your first portfolio to get started. Your recent projects will appear here.
            </p>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-dashed hover:border-primary"
            onClick={handleCreateNew}
          >
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Create New Portfolio</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start from scratch
              </p>
            </CardContent>
          </Card>

          {/* Project Cards */}
          {displayProjects.map((project) => (
            <Card 
              key={project.id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
              onClick={() => handleEditProject(project)}
            >
              <CardContent className="p-0">
                {/* Preview Thumbnail or Gradient */}
                <div className={cn(
                  "h-32 w-full bg-gradient-to-br flex items-center justify-center relative",
                  getArchetypeGradient(project.brandArchetype)
                )}>
                  {project.previewImage ? (
                    <img 
                      src={project.previewImage} 
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white/90 font-bold text-2xl">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Quick Actions - Show on hover */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProject(project);
                      }}
                      data-testid={`button-share-${project.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project);
                      }}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Project Info */}
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1" title={project.name}>
                    {project.name}
                  </h3>
                  {project.client && (
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {project.client}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatLastAccessed(project.lastAccessed)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from recent projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deleteTarget?.name}" from your recent projects list. 
              The project itself will not be deleted and can still be accessed from the portfolio builder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteProject(deleteTarget)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all recent projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your recent projects list. Your projects will still exist 
              and can be accessed from the portfolio builder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export utility functions for use in other components
export function addRecentProject(project: Omit<RecentProject, 'lastAccessed'>) {
  const stored = localStorage.getItem('recentProjects');
  const projects: RecentProject[] = stored ? JSON.parse(stored) : [];
  
  // Add new project with timestamp
  const newProject: RecentProject = {
    ...project,
    lastAccessed: new Date().toISOString()
  };
  
  // Remove existing entry if present
  const filtered = projects.filter(p => p.id !== project.id);
  
  // Add to beginning and limit to 9 projects
  const updated = [newProject, ...filtered].slice(0, 9);
  
  localStorage.setItem('recentProjects', JSON.stringify(updated));
}

export function updateRecentProjectAccess(projectId: string, updates?: Partial<RecentProject>) {
  const stored = localStorage.getItem('recentProjects');
  const projects: RecentProject[] = stored ? JSON.parse(stored) : [];
  
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex !== -1) {
    // Update existing project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      lastAccessed: new Date().toISOString()
    };
    
    // Move to front
    const [project] = projects.splice(projectIndex, 1);
    projects.unshift(project);
  }
  
  localStorage.setItem('recentProjects', JSON.stringify(projects));
}