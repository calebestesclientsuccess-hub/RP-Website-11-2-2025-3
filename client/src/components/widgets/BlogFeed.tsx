import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { widgetVariants } from '@/lib/widgetVariants';
import type { BlogPost } from '@shared/schema';

interface BlogFeedProps {
  className?: string;
  limit?: number;
  theme?: "light" | "dark" | "auto";
  size?: "small" | "medium" | "large";
}

export default function BlogFeed({ className, limit, theme, size }: BlogFeedProps) {
  const { data: blogs, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/collections/blogs'],
  });

  const displayedBlogs = limit && blogs ? blogs.slice(0, limit) : blogs;

  if (isLoading) {
    return (
      <div className={className} data-testid="blog-feed-loading">
        <div className="space-y-6">
          {Array.from({ length: limit || 3 }).map((_, i) => (
            <Card key={i} className={cn(widgetVariants({ theme, size }))}>
              <div className="flex flex-col md:flex-row">
                <Skeleton className="h-48 md:h-auto md:w-64 rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
                <div className="flex-1 p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} data-testid="blog-feed-error">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center text-muted-foreground">
            Failed to load blog posts
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!displayedBlogs || displayedBlogs.length === 0) {
    return (
      <div className={className} data-testid="blog-feed-empty">
        <Card className={cn(widgetVariants({ theme, size }))}>
          <CardContent className="p-8 text-center text-muted-foreground">
            No blog posts found
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
    <div className={className} data-testid="blog-feed">
      <div className="space-y-6">
        {displayedBlogs.map((blog, index) => (
          <Link key={blog.id} href={`/blog/${blog.slug}`}>
            <a data-testid={`blog-card-${index}`}>
              <Card className={cn(widgetVariants({ theme, size }), "hover-elevate active-elevate-2 cursor-pointer overflow-hidden")}>
                <div className="flex flex-col md:flex-row">
                  {blog.featuredImage && (
                    <div className="md:w-64 h-48 md:h-auto bg-muted flex-shrink-0">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        data-testid={`blog-image-${index}`}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {blog.category && (
                          <Badge 
                            variant="secondary"
                            data-testid={`blog-category-${index}`}
                          >
                            {blog.category}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span data-testid={`blog-date-${index}`}>
                            {format(new Date(blog.publishedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      <CardTitle 
                        className="text-xl line-clamp-2"
                        data-testid={`blog-title-${index}`}
                      >
                        {blog.title}
                      </CardTitle>
                      
                      <CardDescription 
                        className="line-clamp-3"
                        data-testid={`blog-excerpt-${index}`}
                      >
                        {truncateText(blog.excerpt, 200)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8" data-testid={`blog-avatar-${index}`}>
                          <AvatarFallback>
                            {blog.author
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-4 w-4" />
                          <span 
                            className="font-medium"
                            data-testid={`blog-author-${index}`}
                          >
                            {blog.author}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
