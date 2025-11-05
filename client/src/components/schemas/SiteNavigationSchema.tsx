
import { Helmet } from 'react-helmet-async';

export function SiteNavigationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "The Problem",
        "url": "https://revenueparty.com/problem"
      },
      {
        "@type": "WebPage",
        "name": "GTM Engine",
        "url": "https://revenueparty.com/gtm-engine"
      },
      {
        "@type": "WebPage",
        "name": "Results",
        "url": "https://revenueparty.com/results"
      },
      {
        "@type": "WebPage",
        "name": "Pricing",
        "url": "https://revenueparty.com/pricing"
      },
      {
        "@type": "WebPage",
        "name": "Why Us",
        "url": "https://revenueparty.com/why-us"
      },
      {
        "@type": "WebPage",
        "name": "Blog",
        "url": "https://revenueparty.com/blog"
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
