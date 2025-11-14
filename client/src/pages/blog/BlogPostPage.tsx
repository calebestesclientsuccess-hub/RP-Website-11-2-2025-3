import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/schemas/ArticleSchema";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { WidgetZone } from "@/components/WidgetZone";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16">Loading...</div>;
  }

  if (error || !post) {
    return <div className="container mx-auto px-4 py-16">Post not found</div>;
  }

  const htmlContent = DOMPurify.sanitize(marked(post.content) as string);

  return (
    <>
      <ReadingProgressBar />
      <SEO
        title={`${post.title} | Revenue Party Blog`}
        description={post.excerpt}
        keywords={post.tags?.join(", ")}
        canonical={`/blog/${post.slug}`}
        ogImage={post.featuredImage}
      />
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        authorName={post.author}
        imageUrl={post.featuredImage}
      />

      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          </div>
        </header>

        <WidgetZone zone="zone-1" />

        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-lg mb-12"
          />
        )}

        <WidgetZone zone="zone-2" />

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <WidgetZone zone="zone-4" />
      </article>
    </>
  );
}