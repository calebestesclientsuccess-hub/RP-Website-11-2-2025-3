
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  similarity: number;
}

interface RelatedContentProps {
  currentPostId: string;
  maxItems?: number;
}

export function RelatedContent({ currentPostId, maxItems = 3 }: RelatedContentProps) {
  const { data: relatedPosts, isLoading } = useQuery<RelatedPost[]>({
    queryKey: [`/api/blog-posts/${currentPostId}/related`],
  });

  if (isLoading || !relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {relatedPosts.slice(0, maxItems).map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="h-full hover-elevate cursor-pointer group">
              <CardHeader>
                {post.category && (
                  <Badge variant="outline" className="w-fit mb-2">
                    {post.category}
                  </Badge>
                )}
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-primary">
                  Read more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
