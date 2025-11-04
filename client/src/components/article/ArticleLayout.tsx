import { ReactNode } from "react";
import { RelatedArticles, RelatedArticle } from "./RelatedArticles";
import { FeaturedPromo, FeaturedPromoData } from "./FeaturedPromo";

interface ArticleLayoutProps {
  children: ReactNode;
  relatedArticles: RelatedArticle[];
  featuredPromo: FeaturedPromoData;
}

export function ArticleLayout({ children, relatedArticles, featuredPromo }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Promo - Left Sidebar (hidden on mobile/tablet) */}
          <div className="hidden lg:block lg:col-span-3">
            <FeaturedPromo promo={featuredPromo} />
          </div>

          {/* Main Article Content */}
          <article className="lg:col-span-6">
            {children}
          </article>

          {/* Related Articles - Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-6">
              <RelatedArticles articles={relatedArticles} />
              
              {/* Show featured promo on mobile/tablet below related articles */}
              <div className="lg:hidden mt-8">
                <FeaturedPromo promo={featuredPromo} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
