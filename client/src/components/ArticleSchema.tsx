import { Helmet } from 'react-helmet-async';

interface ArticleSchemaProps {
  title: string;
  description: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export function ArticleSchema({
  title,
  description,
  author = "Revenue Party Team",
  datePublished,
  dateModified,
  image = "https://revenueparty.com/og-image.png"
}: ArticleSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://revenueparty.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Revenue Party",
      "logo": {
        "@type": "ImageObject",
        "url": "https://revenueparty.com/apple-touch-icon.png",
        "width": 180,
        "height": 180
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : "https://revenueparty.com"
    },
    "inLanguage": "en-US",
    "isAccessibleForFree": true
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
