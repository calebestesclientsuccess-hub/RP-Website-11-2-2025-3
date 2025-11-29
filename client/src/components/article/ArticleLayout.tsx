import { ReactNode } from "react";
import { RelatedArticles, RelatedArticle } from "./RelatedArticles";
import { FeaturedPromo, FeaturedPromoData } from "./FeaturedPromo";

interface ArticleLayoutProps {
  children: ReactNode;
  relatedArticles: RelatedArticle[];
  featuredPromo: FeaturedPromoData;
  heroImageUrl?: string;
  heroImageAlt?: string;
}

export function ArticleLayout({ children, relatedArticles, featuredPromo, heroImageUrl, heroImageAlt }: ArticleLayoutProps) {
  return (
    <div className="min-h-screen pb-20 pt-20 md:pt-24 lg:pt-28">
      {/* Hero Image - Full Width Above Grid */}
      {heroImageUrl && (
        <div className="w-full aspect-[21/9] md:aspect-[21/7] overflow-hidden bg-muted relative">
          <img
            src={heroImageUrl}
            alt={heroImageAlt || "Article hero image"}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/10 to-transparent pointer-events-none" />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Featured Promo - Left Sidebar (hidden on mobile/tablet, shows on desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-6">
              <FeaturedPromo promo={featuredPromo} />
            </div>
          </div>

          {/* Main Article Content - Wider for better reading (full width mobile, 8 cols tablet, 7 cols desktop = 58%) */}
          <article className="md:col-span-8 lg:col-span-7 max-w-none prose dark:prose-invert 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-4xl prose-h1:md:text-5xl prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-6
            prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:font-bold prose-strong:text-foreground">
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
