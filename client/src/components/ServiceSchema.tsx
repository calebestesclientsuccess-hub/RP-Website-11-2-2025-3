import { Helmet } from 'react-helmet-async';

export function ServiceSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "GTM Engine - Complete Revenue Generation System",
    "description": "Deploy elite BDR talent with AI-powered systems and strategic frameworks",
    "provider": {
      "@type": "Organization",
      "name": "Revenue Party"
    },
    "serviceType": "Revenue Generation System",
    "areaServed": "Worldwide"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
}
