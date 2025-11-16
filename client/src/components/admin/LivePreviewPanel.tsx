
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Maximize2, RefreshCw } from "lucide-react";
import { SceneRenderer } from "@/components/branding/SceneRenderer";

interface LivePreviewPanelProps {
  scenes: any[];
  enabled: boolean;
  onToggle: () => void;
}

export function LivePreviewPanel({ scenes, enabled, onToggle }: LivePreviewPanelProps) {
  const [previewScale, setPreviewScale] = useState(0.5);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  
  if (!enabled) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            Live preview is disabled
          </p>
          <Button onClick={onToggle} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Enable Preview
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Live Preview
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewScale(s => Math.max(0.25, s - 0.25))}
            >
              -
            </Button>
            <span className="text-xs px-2 py-1">{Math.round(previewScale * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewScale(s => Math.min(1, s + 0.25))}
            >
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scene Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scenes.map((scene, idx) => (
              <Button
                key={idx}
                variant={selectedSceneIndex === idx ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSceneIndex(idx)}
                className="flex-shrink-0"
              >
                Scene {idx + 1}
              </Button>
            ))}
          </div>
          
          {/* Preview Container */}
          <div 
            className="border rounded-lg overflow-hidden bg-black"
            style={{ 
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
              width: `${100 / previewScale}%`,
              height: '600px'
            }}
          >
            {scenes[selectedSceneIndex] && (
              <SceneRenderer 
                scene={scenes[selectedSceneIndex]} 
                index={selectedSceneIndex}
              />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Preview is experimental and may not reflect final animations
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
