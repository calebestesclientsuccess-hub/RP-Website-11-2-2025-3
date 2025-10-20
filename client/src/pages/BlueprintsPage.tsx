import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

export default function BlueprintsPage() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-dark/10 via-community/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <Badge variant="community" className="mb-4">Thought Leadership</Badge>
            <h1 className="text-5xl font-bold mb-4" data-testid="text-blueprints-title">
              Revenue Party Blueprints
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl" data-testid="text-blueprints-subtitle">
              Battle-tested GTM playbooks and frameworks. Each blueprint is a complete system you can deploy in your business.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blueprints/${post.slug}`} data-testid={`link-blueprint-${post.slug}`}>
                <Card className="h-full hover-elevate cursor-pointer transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground" data-testid={`text-date-${post.slug}`}>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {post.published && (
                        <Badge variant="secondary" className="ml-auto">Published</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors" data-testid={`text-title-${post.slug}`}>
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground" data-testid={`text-author-${post.slug}`}>
                      By {post.author}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4" data-testid={`text-excerpt-${post.slug}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-no-posts">
                No blog posts published yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
