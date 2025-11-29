import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { CaseStudyRenderer } from "@/components/branding/CaseStudyRenderer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  CaseStudySection,
  CaseStudyBlock,
  CaseStudyContent,
  CaseStudyTextBlock,
  CaseStudyCarouselBlock,
  caseStudyContentSchema,
} from "@shared/schema";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Plus, Trash2, GripVertical, Images, Save, Loader2 } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";

type Project = {
  id: string;
  title: string;
  slug: string;
  caseStudyContent?: CaseStudyContent | null;
};

export default function CaseStudyEditor() {
  const [, params] = useRoute<{ projectId: string }>("/admin/case-studies/:projectId");
  const [, navigate] = useLocation();
  const projectId = params?.projectId ?? "";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [sections, setSections] = useState<CaseStudySection[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ sectionId: string; blockId: string } | null>(null);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: [`/api/branding/projects/${projectId}`],
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    if (project) {
      setSections(project.caseStudyContent?.sections ?? []);
      setIsDirty(false);
    }
  }, [project]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const mutation = useMutation({
    mutationFn: async (payload: CaseStudyContent) => {
      const res = await apiRequest("PATCH", `/api/projects/${projectId}/content`, {
        content: payload,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Case Study saved",
        description: "The live site will reflect these changes immediately.",
      });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: [`/api/branding/projects/${projectId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSection = () => {
    const newSection: CaseStudySection = {
      id: nanoid(),
      title: "New Section",
      blocks: [],
    };
    setSections((prev) => [...prev, newSection]);
    setIsDirty(true);
  };

  const updateSection = (sectionId: string, updater: (section: CaseStudySection) => CaseStudySection) => {
    setSections((prev) => prev.map((section) => (section.id === sectionId ? updater(section) : section)));
    setIsDirty(true);
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    setIsDirty(true);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setSections((prev) => {
      const index = prev.findIndex((section) => section.id === sectionId);
      if (index === -1) return prev;
      const newOrder = [...prev];
      const targetIndex = direction === "up" ? Math.max(0, index - 1) : Math.min(prev.length - 1, index + 1);
      const [removed] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, removed);
      return newOrder;
    });
    setIsDirty(true);
  };

  const addBlock = (sectionId: string, type: CaseStudyBlock["type"]) => {
    const blockFactories: Record<CaseStudyBlock["type"], () => CaseStudyBlock> = {
      text: () => ({
        id: nanoid(),
        type: "text",
        content: "",
        format: "markdown",
        layout: "center",
      }),
      carousel: () => ({
        id: nanoid(),
        type: "carousel",
        items: [],
        aspectRatio: "video",
      }),
      "stat-grid": () => ({
        id: nanoid(),
        type: "stat-grid",
        stats: [{ label: "Metric", value: "Value" }],
      }),
    };

    updateSection(sectionId, (section) => ({
      ...section,
      blocks: [...section.blocks, blockFactories[type]()],
    }));
  };

  const updateBlock = (
    sectionId: string,
    blockId: string,
    updater: (block: CaseStudyBlock) => CaseStudyBlock,
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      blocks: section.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  };

  const removeBlock = (sectionId: string, blockId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      blocks: section.blocks.filter((block) => block.id !== blockId),
    }));
  };

  const moveBlock = (sectionId: string, blockId: string, direction: "up" | "down") => {
    updateSection(sectionId, (section) => {
      const index = section.blocks.findIndex((block) => block.id === blockId);
      if (index === -1) return section;
      const blocks = [...section.blocks];
      const target = direction === "up" ? Math.max(0, index - 1) : Math.min(blocks.length - 1, index + 1);
      const [removed] = blocks.splice(index, 1);
      blocks.splice(target, 0, removed);
      return { ...section, blocks };
    });
  };

  const handleSave = () => {
    const validation = caseStudyContentSchema.safeParse({ sections });
    if (!validation.success) {
      toast({
        title: "Cannot save",
        description: validation.error.issues.map((issue) => issue.message).join(", "),
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(validation.data);
  };

  const handleBackNavigation = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      return;
    }
    navigate("/admin/portfolio-builder");
  };

  const selectedContent: CaseStudyContent = useMemo(() => ({ sections }), [sections]);

  const handleMediaSelect = (media: { id: string; url: string; type: string }) => {
    if (!mediaTarget) return;

    updateBlock(mediaTarget.sectionId, mediaTarget.blockId, (block) => {
      if (block.type !== "carousel") return block;
      return {
        ...block,
        items: [
          ...block.items,
          {
            type: media.type === "video" ? "video" : "image",
            url: media.url,
            mediaId: media.id || undefined,
          },
        ],
      };
    });

    setMediaTarget(null);
  };

  const isSaving = mutation.isLoading;

  return (
    <ProtectedRoute>
      <Helmet>
        <title>Case Study Editor | Revenue Party Admin</title>
      </Helmet>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen bg-muted/20">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Project ID</p>
                <h1 className="text-2xl font-semibold">Case Study Editor</h1>
                <p className="text-xs text-muted-foreground">{projectId || "Select a project to begin"}</p>
              </div>
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Button variant="outline" size="sm" onClick={handleBackNavigation}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
                <Button onClick={handleSave} disabled={!projectId || isSaving || sections.length === 0}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Case Study
                </Button>
              </div>
            </header>

            <div className="flex-1 p-6">
              {isLoading ? (
                <div className="grid gap-6 lg:grid-cols-[40%_60%] h-full">
                  <div className="rounded-2xl border border-border bg-background animate-pulse" />
                  <div className="rounded-2xl border border-border bg-background animate-pulse" />
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[40%_60%] h-full">
                  <section className="flex flex-col rounded-2xl border border-border bg-background p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Sections</h2>
                        <p className="text-sm text-muted-foreground">Add content blocks and configure themes.</p>
                      </div>
                      <Button onClick={addSection}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Section
                      </Button>
                    </div>
                    <Separator />
                    {sections.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sections yet. Click “Add Section” to start.</p>
                    ) : (
                      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                        <div className="space-y-4">
                          {sections.map((section, index) => (
                            <SectionEditor
                              key={section.id}
                              section={section}
                              index={index}
                              total={sections.length}
                              onChange={(updater) => updateSection(section.id, updater)}
                              onRemove={() => removeSection(section.id)}
                              onMove={(direction) => moveSection(section.id, direction)}
                              onAddBlock={addBlock}
                              onUpdateBlock={updateBlock}
                              onRemoveBlock={removeBlock}
                              onMoveBlock={moveBlock}
                              onOpenMediaPicker={(blockId) => setMediaTarget({ sectionId: section.id, blockId })}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </section>

                  <section className="flex flex-col rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Live Preview</h2>
                        <p className="text-sm text-muted-foreground">Preview updates instantly on the right.</p>
                      </div>
                      {isDirty && <span className="text-xs text-primary">Unsaved changes</span>}
                    </div>
                    <Separator className="mb-4" />
                    <div className="flex-1 overflow-auto">
                      {sections.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          Add a section to see the preview.
                        </div>
                      ) : (
                        <CaseStudyRenderer content={selectedContent} />
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>

      <MediaPicker
        open={Boolean(mediaTarget)}
        onOpenChange={(open) => !open && setMediaTarget(null)}
        onSelect={handleMediaSelect}
        projectId={projectId}
        mediaType="all"
      />
    </ProtectedRoute>
  );
}

type SectionEditorProps = {
  section: CaseStudySection;
  index: number;
  total: number;
  onChange: (updater: (section: CaseStudySection) => CaseStudySection) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onAddBlock: (sectionId: string, type: CaseStudyBlock["type"]) => void;
  onUpdateBlock: (
    sectionId: string,
    blockId: string,
    updater: (block: CaseStudyBlock) => CaseStudyBlock,
  ) => void;
  onRemoveBlock: (sectionId: string, blockId: string) => void;
  onMoveBlock: (sectionId: string, blockId: string, direction: "up" | "down") => void;
  onOpenMediaPicker: (blockId: string) => void;
};

function SectionEditor({
  section,
  index,
  total,
  onChange,
  onRemove,
  onMove,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  onOpenMediaPicker,
}: SectionEditorProps) {
  const updateTheme = (field: "backgroundColor" | "textColor" | "primaryColor", value: string) => {
    onChange((current) => ({
      ...current,
      theme: {
        ...current.theme,
        [field]: value || undefined,
      },
    }));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GripVertical className="h-4 w-4" />
          Section {index + 1} of {total}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onMove("up")} disabled={index === 0}>
            ↑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
          >
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor={`section-title-${section.id}`}>Title</Label>
          <Input
            id={`section-title-${section.id}`}
            value={section.title}
            onChange={(e) =>
              onChange((current) => ({
                ...current,
                title: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Background</Label>
            <Input
              type="color"
              value={section.theme?.backgroundColor || "#000000"}
              onChange={(e) => updateTheme("backgroundColor", e.target.value)}
            />
          </div>
          <div>
            <Label>Text</Label>
            <Input
              type="color"
              value={section.theme?.textColor || "#ffffff"}
              onChange={(e) => updateTheme("textColor", e.target.value)}
            />
          </div>
          <div>
            <Label>Primary</Label>
            <Input
              type="color"
              value={section.theme?.primaryColor || "#ff0055"}
              onChange={(e) => updateTheme("primaryColor", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Blocks</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddBlock(section.id, "text")}>
              + Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddBlock(section.id, "carousel")}>
              + Carousel
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddBlock(section.id, "stat-grid")}>
              + Stat Grid
            </Button>
          </div>
        </div>

        {section.blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blocks yet.</p>
        ) : (
          <div className="space-y-3">
            {section.blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={idx}
                total={section.blocks.length}
                sectionId={section.id}
                onUpdate={onUpdateBlock}
                onRemove={onRemoveBlock}
                onMove={onMoveBlock}
                onOpenMediaPicker={onOpenMediaPicker}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type BlockEditorProps = {
  block: CaseStudyBlock;
  sectionId: string;
  index: number;
  total: number;
  onUpdate: (
    sectionId: string,
    blockId: string,
    updater: (block: CaseStudyBlock) => CaseStudyBlock,
  ) => void;
  onRemove: (sectionId: string, blockId: string) => void;
  onMove: (sectionId: string, blockId: string, direction: "up" | "down") => void;
  onOpenMediaPicker: (blockId: string) => void;
};

function BlockEditor({
  block,
  sectionId,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  onOpenMediaPicker,
}: BlockEditorProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const commonActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => onMove(sectionId, block.id, "up")} disabled={isFirst}>
        ↑
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onMove(sectionId, block.id, "down")} disabled={isLast}>
        ↓
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onRemove(sectionId, block.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );

  if (block.type === "text") {
    return (
      <div className="rounded-lg border border-border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Text Block</p>
          {commonActions}
        </div>
        <Label>Content</Label>
        <Textarea
          rows={5}
          value={block.content}
          onChange={(e) =>
            onUpdate(sectionId, block.id, (current) => ({
              ...current,
              content: e.target.value,
            }))
          }
        />
        <Label>Layout</Label>
        <select
          className="text-sm border border-border rounded-md px-2 py-1"
          value={block.layout}
          onChange={(e) =>
            onUpdate(sectionId, block.id, (current) => ({
              ...current,
              layout: e.target.value as CaseStudyTextBlock["layout"],
            }))
          }
        >
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="full">Full width</option>
        </select>
      </div>
    );
  }

  if (block.type === "carousel") {
    return (
      <div className="rounded-lg border border-border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Carousel Block</p>
          {commonActions}
        </div>
        <div className="flex items-center gap-3">
          <Label>Aspect Ratio</Label>
          <select
            className="text-sm border border-border rounded-md px-2 py-1"
            value={block.aspectRatio}
            onChange={(e) =>
              onUpdate(sectionId, block.id, (current) => ({
                ...current,
                aspectRatio: e.target.value as CaseStudyCarouselBlock["aspectRatio"],
              }))
            }
          >
            <option value="video">Video (16:9)</option>
            <option value="wide">Wide (4:3)</option>
            <option value="square">Square</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenMediaPicker(block.id)}
          >
            <Images className="mr-2 h-4 w-4" />
            Add Media
          </Button>
        </div>
        {block.items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No media yet.</p>
        ) : (
          <div className="space-y-2">
            {block.items.map((item, idx) => (
              <div key={idx} className="rounded border border-border/50 p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>
                    {item.type.toUpperCase()} – {item.url?.slice(0, 40)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onUpdate(sectionId, block.id, (current) => ({
                        ...current,
                        items: current.items.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Label>Caption</Label>
                <Input
                  value={item.caption || ""}
                  onChange={(e) =>
                    onUpdate(sectionId, block.id, (current) => {
                      const items = [...current.items];
                      items[idx] = { ...items[idx], caption: e.target.value };
                      return { ...current, items };
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Stat grid
  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Stat Grid Block</p>
        {commonActions}
      </div>
      {block.stats.map((stat, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label>Label</Label>
            <Input
              value={stat.label}
              onChange={(e) =>
                onUpdate(sectionId, block.id, (current) => {
                  const stats = [...current.stats];
                  stats[idx] = { ...stats[idx], label: e.target.value };
                  return { ...current, stats };
                })
              }
            />
          </div>
          <div>
            <Label>Value</Label>
            <Input
              value={stat.value}
              onChange={(e) =>
                onUpdate(sectionId, block.id, (current) => {
                  const stats = [...current.stats];
                  stats[idx] = { ...stats[idx], value: e.target.value };
                  return { ...current, stats };
                })
              }
            />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onUpdate(sectionId, block.id, (current) => ({
              ...current,
              stats: [...current.stats, { label: "Metric", value: "Value" }],
            }))
          }
        >
          + Add Stat
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={block.stats.length === 1}
          onClick={() =>
            onUpdate(sectionId, block.id, (current) => ({
              ...current,
              stats: current.stats.slice(0, -1),
            }))
          }
        >
          Remove Last
        </Button>
      </div>
    </div>
  );
}

