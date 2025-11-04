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
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-8">
          {/* Featured Promo - Left Sidebar (hidden on mobile/tablet, shows on desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-6">
              <FeaturedPromo promo={featuredPromo} />
            </div>
          </div>

          {/* Main Article Content (full width mobile, 8 cols tablet, 6 cols desktop) */}
          <article className="md:col-span-8 lg:col-span-6">
            {children}
          </article>

          {/* Related Articles - Right Sidebar (full width mobile, 4 cols tablet, 3 cols desktop) */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="md:sticky md:top-6">
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
