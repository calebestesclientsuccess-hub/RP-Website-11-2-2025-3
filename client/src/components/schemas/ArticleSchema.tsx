import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle';
  wordCount?: number;
}

export function ArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  authorName = "Revenue Party",
  imageUrl = "https://revenueparty.com/og-image.png",
  articleType = "Article",
  wordCount
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": articleType,
    "headline": headline,
    "description": description,
    "image": imageUrl,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    ...(wordCount && { "wordCount": wordCount }),
    "author": {
      "@type": "Organization",
      "name": authorName,
      "url": "https://revenueparty.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Revenue Party",
      "logo": {
        "@type": "ImageObject",
        "url": "https://revenueparty.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : 'https://revenueparty.com'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
