
import { Helmet } from 'react-helmet-async';

export function LocalBusinessSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Revenue Party",
    "description": "GTM Systems That Multiply Your Pipeline - Deploy elite BDR pods with proven strategy and AI technology",
    "url": "https://revenueparty.com",
    "email": "hello@revenueparty.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "Remote"
    },
    "sameAs": [
      "https://twitter.com/revenueparty",
      "https://linkedin.com/company/revenueparty"
    ],
    "priceRange": "$$$$",
    "areaServed": "US"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
