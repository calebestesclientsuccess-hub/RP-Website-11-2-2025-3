import { Helmet } from 'react-helmet-async';

export default function SoftwareApplicationSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GTM Engine",
    "alternateName": "Revenue Party GTM System",
    "description": "Complete revenue generation system combining elite BDR talent with AI-powered tools and strategic frameworks to deliver 20+ qualified appointments monthly.",
    "url": "https://revenuelabs.com/gtm-engine",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Sales & Marketing",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "10000.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Revenue Party"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "234",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Dedicated BDR Pod (2 Elite BDRs)",
      "AI-Powered Outreach Automation",
      "Strategic GTM Framework",
      "RevOps Infrastructure",
      "Elite Sales Coaching",
      "Tech Stack Integration",
      "Community & Competition Culture System",
      "20+ Qualified Appointments Monthly",
      "2-Week Deployment",
      "Performance Dashboard"
    ],
    "screenshot": "https://revenuelabs.com/gtm-engine-screenshot.png",
    "softwareVersion": "2.0",
    "releaseNotes": "Enhanced AI capabilities, improved BDR training modules, and faster deployment process.",
    "datePublished": "2023-01-01",
    "dateModified": "2024-11-01",
    "creator": {
      "@type": "Organization",
      "name": "Revenue Party",
      "url": "https://revenuelabs.com"
    },
    "provider": {
      "@type": "Organization",
      "name": "Revenue Party"
    },
    "potentialAction": {
      "@type": "ViewAction",
      "target": "https://revenuelabs.com/gtm-engine"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}