
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, VideoIcon, Quote, Upload, Check } from "lucide-react";
import { getPlaceholderType, type PlaceholderId } from "@shared/placeholder-config";

interface PlaceholderSlotProps {
  placeholderId: PlaceholderId;
  currentMapping?: string;
  onAssignAsset: (placeholderId: PlaceholderId) => void;
}

export function PlaceholderSlot({ placeholderId, currentMapping, onAssignAsset }: PlaceholderSlotProps) {
  const type = getPlaceholderType(placeholderId);
  
  const Icon = type === 'image' ? ImageIcon : type === 'video' ? VideoIcon : Quote;
  
  return (
    <Card className={`border-2 border-dashed ${currentMapping ? 'border-primary bg-primary/5' : 'border-primary/50 bg-muted/30'}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="w-12 h-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {placeholderId.replace('placeholder-', '').replace('-', ' ')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentMapping ? `Mapped to: ${currentMapping}` : `Assign your ${type} to this slot`}
        </p>
        <Button onClick={() => onAssignAsset(placeholderId)} variant={currentMapping ? "default" : "outline"}>
          {currentMapping ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Change {type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'Quote'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Choose {type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'Quote'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
