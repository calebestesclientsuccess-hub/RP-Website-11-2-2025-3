import { Helmet } from 'react-helmet-async';

export default function LocalBusinessSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Revenue Party",
    "alternateName": "RevParty",
    "description": "Go-to-Market (GTM) consultancy deploying complete revenue generation systems with elite BDR talent, AI technology, and strategic frameworks.",
    "@id": "https://revenuelabs.com/#business",
    "url": "https://revenuelabs.com",
    "logo": "https://revenuelabs.com/apple-touch-icon.png",
    "image": [
      "https://revenuelabs.com/apple-touch-icon.png"
    ],
    "telephone": "",
    "email": "hello@revenuelabs.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressLocality": "United States"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "37.7749",
      "longitude": "-122.4194"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$$",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "37.7749",
        "longitude": "-122.4194"
      },
      "geoRadius": "10000000"
    },
    "sameAs": [
      "https://www.linkedin.com/company/revenue-party",
      "https://twitter.com/revenueparty"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "GTM Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "GTM Engine",
          "description": "Complete revenue generation system with elite BDR pod",
          "url": "https://revenuelabs.com/gtm-engine",
          "priceCurrency": "USD",
          "price": "10000.00",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "GTM Audit",
          "description": "60-minute comprehensive GTM strategy audit",
          "url": "https://revenuelabs.com/audit",
          "priceCurrency": "USD",
          "price": "0",
          "availability": "https://schema.org/InStock"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    },
    "founder": {
      "@type": "Person",
      "name": "Revenue Party Founders",
      "jobTitle": "CEO"
    },
    "foundingDate": "2022-01-01",
    "knowsAbout": [
      "Go-to-Market Strategy",
      "Sales Development",
      "Revenue Operations",
      "B2B SaaS",
      "Pipeline Generation",
      "BDR Training",
      "AI Sales Tools"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}