import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Info } from "lucide-react";

export default function AdminDashboard() {
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await fetch("/api/auth/has-users");
        const data = await response.json();
        setHasUsers(data.hasUsers);
        if (!data.hasUsers) {
          setTimeout(() => {
            setLocation("/admin/register");
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking for users:", error);
      }
    };
    checkUsers();
  }, [setLocation]);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (hasUsers === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Alert className="max-w-md" data-testid="alert-no-users">
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <p>
              No admin account detected. You'll be redirected to create your first admin account in a moment...
            </p>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/admin/register")}
              data-testid="button-setup-now"
            >
              Set Up Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Admin Dashboard | CMS</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">Dashboard</h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Blog Posts</h3>
                    <p className="text-muted-foreground text-sm">
                      Create and manage blog posts with rich text editing
                    </p>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Video Posts</h3>
                    <p className="text-muted-foreground text-sm">
                      Add and manage video content for your site
                    </p>
                  </div>
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Widget Settings</h3>
                    <p className="text-muted-foreground text-sm">
                      Configure the bottom-right floating widget
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
