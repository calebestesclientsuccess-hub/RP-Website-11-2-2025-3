
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Download, GitCompare, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Version {
  id: string;
  timestamp: number;
  label: string;
  json: string;
  confidenceScore?: number;
  changeDescription: string;
}

interface VersionTimelineProps {
  versions: Version[];
  activeVersionId: string | null;
  onRestore: (versionId: string) => void;
  onCompare: (versionIds: [string, string]) => void;
  onExport: () => void;
}

export function VersionTimeline({ 
  versions, 
  activeVersionId, 
  onRestore, 
  onCompare,
  onExport 
}: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <History className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">No versions yet</p>
        <p className="text-xs mt-1">Versions are created automatically as you refine</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <History className="w-4 h-4" />
          Version History ({versions.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-7 text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Export All
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {versions.map((version, idx) => {
            const isActive = version.id === activeVersionId;
            const isLatest = idx === versions.length - 1;
            
            return (
              <div
                key={version.id}
                className={cn(
                  "relative pl-6 pb-4 border-l-2",
                  isActive ? "border-primary" : "border-border"
                )}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 -ml-[9px] w-4 h-4 rounded-full border-2",
                    isActive 
                      ? "bg-primary border-primary" 
                      : "bg-background border-border"
                  )}
                >
                  {isActive && <Check className="w-2 h-2 text-primary-foreground m-auto mt-0.5" />}
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
                  isActive ? "bg-primary/5 border-primary/20" : "bg-background"
                )}
                onClick={() => onRestore(version.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{version.label}</span>
                        {isLatest && (
                          <Badge variant="secondary" className="text-xs">Latest</Badge>
                        )}
                        {version.confidenceScore && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              version.confidenceScore >= 85 ? "border-green-500 text-green-600" :
                              version.confidenceScore >= 70 ? "border-yellow-500 text-yellow-600" :
                              "border-red-500 text-red-600"
                            )}
                          >
                            {version.confidenceScore}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {version.changeDescription}
                  </p>
                  
                  {!isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(version.id);
                      }}
                    >
                      Restore this version
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
