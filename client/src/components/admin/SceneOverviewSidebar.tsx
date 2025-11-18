
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash } from "lucide-react";

interface Scene {
  id: string;
  type: string;
  order: number;
  content: {
    heading?: string;
    url?: string;
  };
  director: {
    backgroundColor?: string;
  };
}

interface SceneOverviewSidebarProps {
  scenes: Scene[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onEdit: (sceneId: string) => void;
  onDelete: (sceneId: string) => void;
}

export function SceneOverviewSidebar({ 
  scenes, 
  onReorder, 
  onEdit, 
  onDelete 
}: SceneOverviewSidebarProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-3">Scene Overview ({scenes.length})</h3>
      {scenes.map((scene, index) => (
        <Card 
          key={scene.id} 
          className="p-2 flex items-center gap-2 hover:border-primary cursor-move"
          draggable
          onDragStart={(e) => e.dataTransfer.setData('sceneIndex', index.toString())}
          onDrop={(e) => {
            const fromIndex = parseInt(e.dataTransfer.getData('sceneIndex'));
            onReorder(fromIndex, index);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          
          <div 
            className="w-12 h-12 rounded flex-shrink-0"
            style={{ 
              backgroundColor: scene.director?.backgroundColor || '#0a0a0a',
              backgroundImage: scene.content.url ? `url(${scene.content.url})` : undefined,
              backgroundSize: 'cover',
            }}
          />
          
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="text-xs mb-1">
              {scene.type}
            </Badge>
            <p className="text-xs truncate">
              {scene.content.heading || 'Untitled Scene'}
            </p>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => onEdit(scene.id)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(scene.id)}
            >
              <Trash className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
