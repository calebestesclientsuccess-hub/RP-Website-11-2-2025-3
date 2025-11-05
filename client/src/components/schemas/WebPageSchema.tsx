
import { Helmet } from 'react-helmet-async';

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
  breadcrumbItems?: Array<{ name: string; url: string }>;
}

export function WebPageSchema({
  name,
  description,
  url,
  breadcrumbItems
}: WebPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": name,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "Revenue Party",
      "logo": {
        "@type": "ImageObject",
        "url": "https://revenueparty.com/apple-touch-icon.png"
      }
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Revenue Party",
      "url": "https://revenueparty.com"
    },
    ...(breadcrumbItems && {
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `https://revenueparty.com${item.url}`
        }))
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
