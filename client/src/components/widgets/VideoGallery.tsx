import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { widgetVariants } from '@/lib/widgetVariants';
import type { VideoPost } from '@shared/schema';

interface VideoGalleryProps {
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
}

export default function VideoGallery({ className, theme, size }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);

  const { data: videos, isLoading, error } = useQuery<VideoPost[]>({
    queryKey: ['/api/collections/videos'],
  });

  if (isLoading) {
    return (
      <div className={className} data-testid="video-gallery-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={cn(widgetVariants({ theme, size }))}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} data-testid="video-gallery-error">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center text-muted-foreground">
            Failed to load videos
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={className} data-testid="video-gallery-empty">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center text-muted-foreground">
            No videos found
          </CardContent>
        </Card>
      </div>
    );
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <>
      <div className={className} data-testid="video-gallery">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <Card
              key={video.id}
              className={cn(widgetVariants({ theme, size }), "hover-elevate active-elevate-2 cursor-pointer overflow-hidden")}
              onClick={() => setSelectedVideo(video)}
              data-testid={`video-card-${index}`}
            >
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  data-testid={`video-thumbnail-${index}`}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="rounded-full bg-primary/90 p-4">
                    <Play 
                      className="h-8 w-8 text-primary-foreground" 
                      fill="currentColor"
                      data-testid={`icon-play-${index}`}
                    />
                  </div>
                </div>
                {video.duration && (
                  <Badge 
                    className="absolute bottom-2 right-2 bg-black/70"
                    data-testid={`badge-duration-${index}`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                )}
              </div>

              <CardHeader>
                <CardTitle 
                  className="text-lg line-clamp-2"
                  data-testid={`text-title-${index}`}
                >
                  {video.title}
                </CardTitle>
                <CardDescription 
                  className="line-clamp-2"
                  data-testid={`text-description-${index}`}
                >
                  {truncateText(video.description, 100)}
                </CardDescription>
                {video.category && (
                  <Badge 
                    variant="secondary" 
                    className="w-fit mt-2"
                    data-testid={`badge-category-${index}`}
                  >
                    {video.category}
                  </Badge>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl" data-testid="video-modal">
          {selectedVideo && (
            <>
              <DialogHeader>
                <DialogTitle data-testid="modal-video-title">
                  {selectedVideo.title}
                </DialogTitle>
              </DialogHeader>
              <div className="aspect-video w-full">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  data-testid="modal-video-iframe"
                />
              </div>
              <p className="text-muted-foreground" data-testid="modal-video-description">
                {selectedVideo.description}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
