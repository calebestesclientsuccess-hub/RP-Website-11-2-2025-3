import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export interface RelatedArticle {
  title: string;
  excerpt: string;
  path: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  return (
    <aside className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Related Reading
      </h3>
      
      <div className="space-y-3">
        {articles.map((article, index) => (
          <Link key={index} href={article.path}>
            <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer group" data-testid={`card-related-article-${index}`}>
              <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-1 text-xs text-primary">
                <span>Read more</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </aside>
  );
}
