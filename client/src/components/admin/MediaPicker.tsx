
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Link, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface MediaAsset {
  id: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mediaType: 'image' | 'video';
  label?: string;
  tags: string[];
}

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

  // Fetch media from library with proper endpoint
  const { data: mediaLibrary = [], isLoading, isError } = useQuery<MediaAsset[]>({
    queryKey: ['/api/media-library', projectId],
    queryFn: async () => {
      const url = projectId 
        ? `/api/media-library?projectId=${projectId}`
        : '/api/media-library';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch media');
      return response.json();
    },
    enabled: open,
  });

  // Filter by media type
  const filteredMedia = mediaLibrary.filter((item) => {
    if (mediaType === 'all') return true;
    return item.mediaType === mediaType;
  });

  const handleLibrarySelect = (media: MediaAsset) => {
    onSelect({
      id: media.id,
      url: media.cloudinaryUrl,
      type: media.mediaType,
    });
    onOpenChange(false);
  };

  const handleManualUrl = () => {
    if (!manualUrl.trim()) return;
    
    // Detect type from URL if not specified
    const isVideoUrl = manualUrl.includes('.mp4') || 
                       manualUrl.includes('.webm') || 
                       manualUrl.includes('/video/');
    
    onSelect({
      id: '', // No mediaId for manual URLs
      url: manualUrl,
      type: mediaType === 'all' 
        ? (isVideoUrl ? 'video' : 'image')
        : mediaType,
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
            {projectId && " (filtered by current project)"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              Media Library ({filteredMedia.length})
            </TabsTrigger>
            <TabsTrigger value="url">Direct URL</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading media...
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                Failed to load media library. Please try again.
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No media found.</p>
                <p className="text-sm">Upload media in the Media Library or switch to Direct URL.</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-3 gap-4">
                  {filteredMedia.map((media) => (
                    <button
                      key={media.id}
                      onClick={() => handleLibrarySelect(media)}
                      className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid={`media-item-${media.id}`}
                    >
                      {media.mediaType === 'image' ? (
                        <img 
                          src={media.cloudinaryUrl} 
                          alt={media.label || 'Media asset'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video 
                            src={media.cloudinaryUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <span className="text-white text-sm font-medium">Select</span>
                        {media.label && (
                          <Badge variant="secondary" className="text-xs">
                            {media.label}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        {media.mediaType === 'image' ? (
                          <Image className="w-4 h-4 text-white drop-shadow-lg" />
                        ) : (
                          <Video className="w-4 h-4 text-white drop-shadow-lg" />
                        )}
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
                  placeholder="https://res.cloudinary.com/..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualUrl()}
                  data-testid="input-manual-url"
                />
                <Button 
                  onClick={handleManualUrl} 
                  disabled={!manualUrl.trim()}
                  data-testid="button-use-url"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Use URL
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Enter a direct URL to an image or video hosted on Cloudinary or any other service.</p>
                <p className="text-xs">Tip: For best results, use Cloudinary URLs from your Media Library.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
