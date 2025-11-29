import React from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { FileText, Video, Settings, LogOut, LayoutDashboard, ClipboardList, Megaphone, Flag, Library, Sparkles, Upload, Bookmark, Wand2, Palette, PlusCircle, ListChecks, Database, Layers } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "CRM Workspace",
        url: "/admin/crm/workspace",
        icon: Database,
      },
    ]
  },
  {
    label: "Creation",
    items: [
      {
        title: "Create New...",
        url: "/admin/create",
        icon: PlusCircle,
      },
      {
        title: "Create Portfolio",
        url: "/admin/create-portfolio",
        icon: Layers,
      },
      {
        title: "Portfolio Wizard",
        url: "/admin/portfolio-wizard",
        icon: Wand2,
      },
      {
        title: "AI Portfolio Builder",
        url: "/admin/portfolio-builder",
        icon: Palette,
      },
    ]
  },
  {
    label: "Content",
    items: [
      {
        title: "Content Library",
        url: "/admin/content",
        icon: Library,
      },
      {
        title: "Blog Posts",
        url: "/admin/blog-posts",
        icon: FileText,
      },
      {
        title: "Video Posts",
        url: "/admin/video-posts",
        icon: Video,
      },
      {
        title: "Media Library",
        url: "/admin/media-library",
        icon: Upload,
      },
      {
        title: "Template Library",
        url: "/admin/template-library",
        icon: Bookmark,
      },
    ]
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Campaigns",
        url: "/admin/campaigns",
        icon: Megaphone,
      },
      {
        title: "Assessments",
        url: "/admin/assessments",
        icon: ClipboardList,
      },
    ]
  },
  {
    label: "Settings",
    items: [
      {
        title: "Default AI Prompts",
        url: "/admin/ai-prompt-settings",
        icon: Sparkles,
      },
      {
        title: "Feature Flags",
        url: "/admin/feature-flags",
        icon: Flag,
      },
      {
        title: "Widget Settings",
        url: "/admin/widget-config",
        icon: Settings,
      },
      {
        title: "CRM Fields",
        url: "/admin/crm/fields",
        icon: ListChecks,
      },
    ]
  }
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold" data-testid="text-cms-title">CMS Dashboard</h2>
        {user && (
          <p className="text-sm text-muted-foreground" data-testid="text-username">
            {user.username}
          </p>
        )}
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

