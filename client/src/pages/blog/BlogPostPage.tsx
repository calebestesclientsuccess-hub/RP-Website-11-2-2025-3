import { useMemo } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { BlogPost } from "@shared/schema";

import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { WidgetZone } from "@/components/WidgetZone";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import type { RelatedArticle } from "@/components/article/RelatedArticles";
import type { FeaturedPromoData } from "@/components/article/FeaturedPromo";

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
}

const featuredPromo: FeaturedPromoData = {
  type: "assessment",
  badge: "Free Assessment",
  title: "Get Your Revenue Blueprint",
  description:
    "Take our 5-minute assessment to discover which GTM architecture fits your current stage and unlock your personalized revenue blueprint.",
  ctaText: "Start Assessment",
  ctaUrl: "/pipeline-assessment",
  imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop",
};

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery<RelatedPost[]>({
    queryKey: ["/api/blog-posts", post?.id, "related"],
    enabled: !!post?.id,
  });

  // useMemo must be called before any early returns to maintain hooks order
  const sidebarArticles = useMemo<RelatedArticle[]>(() => {
    if (relatedPosts && relatedPosts.length > 0) {
      return relatedPosts.slice(0, 3).map((related) => ({
        title: related.title,
        excerpt: related.excerpt,
        path: `/blog/${related.slug}`,
        imageUrl: related.featuredImage,
      }));
    }
    return [];
  }, [relatedPosts]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16">Loading...</div>;
  }

  if (error || !post) {
    return <div className="container mx-auto px-4 py-16">Post not found</div>;
  }

  // Safety check for missing content to prevent marked() from crashing
  // Also strip leading H1 from content since we render the title separately in the header
  const contentWithoutLeadingH1 = (post.content || '').replace(/^#\s+[^\n]+\n*/, '');
  const htmlContent = DOMPurify.sanitize(marked(contentWithoutLeadingH1) as string);
  const metaTitle = post.metaTitle?.trim() || `${post.title} | Revenue Party Blog`;
  const metaDescription = post.metaDescription?.trim() || post.excerpt;
  const canonicalValue = post.canonicalUrl?.trim() || `/blog/${post.slug}`;

  return (
    <>
      <ReadingProgressBar />
      <SEO
        title={metaTitle}
        description={metaDescription}
        keywords={post.category || "GTM blog, revenue generation, B2B sales"}
        canonical={canonicalValue}
        ogImage={post.featuredImage || undefined}
      />
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        datePublished={new Date(post.publishedAt).toISOString()}
        dateModified={new Date(post.updatedAt).toISOString()}
        authorName={post.author}
        imageUrl={post.featuredImage || undefined}
      />

      <ArticleLayout
        relatedArticles={sidebarArticles}
        featuredPromo={featuredPromo}
        heroImageUrl={post.featuredImage || undefined}
        heroImageAlt={post.title}
      >
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Revenue Party Blog</span>
            <span>•</span>
            <time dateTime={new Date(post.publishedAt).toISOString()}>{new Date(post.publishedAt).toLocaleDateString()}</time>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">{post.author}</span>
            {post.category && (
              <>
                <span>•</span>
                <span>{post.category}</span>
              </>
            )}
          </div>
        </header>

        <WidgetZone zone="zone-1" className="my-8" />

        <WidgetZone zone="zone-2" className="my-8" />

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <WidgetZone zone="zone-4" className="my-12" />
      </ArticleLayout>
    </>
  );
}