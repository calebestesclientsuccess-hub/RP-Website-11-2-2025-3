
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Link } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaPickerProps {
  projectId?: string;
  mediaType?: 'image' | 'video' | 'all';
  onSelect: (media: { id: string; url: string; type: string }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaPicker({ 
  projectId, 
  mediaType = 'all', 
  onSelect, 
  open, 
  onOpenChange 
}: MediaPickerProps) {
  const [manualUrl, setManualUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'url'>('library');

  // Fetch media from library
  const { data: mediaLibrary, isLoading } = useQuery({
    queryKey: projectId ? [`/api/projects/${projectId}/media`] : ['/api/media-library'],
    enabled: open,
  });

  const filteredMedia = mediaLibrary?.filter((item: any) => {
    if (mediaType === 'all') return true;
    return item.type === mediaType;
  }) || [];

  const handleLibrarySelect = (media: any) => {
    onSelect({
      id: media.id,
      url: media.cloudinaryUrl,
      type: media.type,
    });
    onOpenChange(false);
  };

  const handleManualUrl = () => {
    if (!manualUrl.trim()) return;
    
    onSelect({
      id: '', // No mediaId for manual URLs
      url: manualUrl,
      type: mediaType === 'video' ? 'video' : 'image',
    });
    setManualUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>
            Choose from your media library or enter a URL directly
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="url">Direct URL</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading media...</div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No media found. Upload media or switch to Direct URL.
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-3 gap-4">
                  {filteredMedia.map((media: any) => (
                    <button
                      key={media.id}
                      onClick={() => handleLibrarySelect(media)}
                      className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    >
                      {media.type === 'image' ? (
                        <img 
                          src={media.cloudinaryUrl} 
                          alt={media.altText || 'Media'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualUrl()}
                />
                <Button onClick={handleManualUrl} disabled={!manualUrl.trim()}>
                  <Link className="w-4 h-4 mr-2" />
                  Use URL
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a direct URL to an image or video hosted on Cloudinary or any other service.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
