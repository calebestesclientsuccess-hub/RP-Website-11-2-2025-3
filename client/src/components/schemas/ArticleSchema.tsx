import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle';
}

export function ArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  authorName = "Revenue Party",
  imageUrl = "https://revenueparty.com/og-image.png",
  articleType = "Article"
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": articleType,
    "headline": headline,
    "description": description,
    "image": imageUrl,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
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
