
import { Helmet } from 'react-helmet-async';

interface OfferSchemaProps {
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  url: string;
}

export function OfferSchema({ name, description, price, priceCurrency, url }: OfferSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": name,
    "description": description,
    "price": price,
    "priceCurrency": priceCurrency,
    "url": url,
    "seller": {
      "@type": "Organization",
      "name": "Revenue Party"
    },
    "availability": "https://schema.org/InStock",
    "validFrom": new Date().toISOString()
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
