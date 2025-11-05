
import { Helmet } from 'react-helmet-async';

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Revenue Party",
    "alternateName": "RevParty",
    "url": "https://revenueparty.com",
    "logo": "https://revenueparty.com/apple-touch-icon.png",
    "description": "Revenue Party deploys complete GTM systems with elite BDR pods, AI-powered Signal Factory, and proprietary Impact Selling OS to deliver 20+ guaranteed qualified appointments monthly.",
    "foundingDate": "2022",
    "founder": {
      "@type": "Person",
      "name": "Caleb Estes",
      "jobTitle": "Chief Architect"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Sales",
      "email": "hello@revenueparty.com",
      "url": "https://revenueparty.com/audit"
    },
    "sameAs": [
      "https://www.linkedin.com/company/revenue-party",
      "https://twitter.com/revenueparty"
    ],
    "knowsAbout": [
      "Go-to-Market Strategy",
      "Sales Development Representatives",
      "BDR Outsourcing",
      "Revenue Operations",
      "B2B SaaS Sales",
      "Pipeline Generation",
      "Sales as a Service",
      "Cold Calling",
      "Lead Generation"
    ],
    "offers": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "GTM Engine - Complete Revenue Generation System",
        "description": "Elite BDR Pod with AI-powered Signal Factory and Impact Selling OS"
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
