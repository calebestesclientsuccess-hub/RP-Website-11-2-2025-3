import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export interface RelatedArticle {
  title: string;
  excerpt: string;
  path: string;
  imageUrl?: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  return (
    <aside className="space-y-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Recommended Articles
      </h3>
      
      <div className="space-y-5">
        {articles.map((article, index) => (
          <Link key={index} href={article.path}>
            <div className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group border-b border-border pb-5 last:border-0" data-testid={`card-related-article-${index}`}>
              {article.imageUrl && (
                <div className="aspect-video overflow-hidden bg-muted rounded-md mb-3">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Read more</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
