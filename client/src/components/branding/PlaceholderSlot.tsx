
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, Upload } from "lucide-react";

interface PlaceholderSlotProps {
  placeholderId: string;
  type: 'image' | 'video';
  onAssignAsset: (placeholderId: string) => void;
}

export function PlaceholderSlot({ placeholderId, type, onAssignAsset }: PlaceholderSlotProps) {
  const Icon = type === 'image' ? ImageIcon : VideoIcon;
  
  return (
    <Card className="border-2 border-dashed border-primary/50 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="w-12 h-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          {placeholderId.replace('placeholder-', '').replace('-', ' ')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Assign your {type} to this slot
        </p>
        <Button onClick={() => onAssignAsset(placeholderId)} variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Choose {type === 'image' ? 'Image' : 'Video'}
        </Button>
      </CardContent>
    </Card>
  );
}
