
import { Helmet } from 'react-helmet-async';

interface EventSchemaProps {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  eventAttendanceMode?: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
  location?: string;
  isAccessibleForFree?: boolean;
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  eventAttendanceMode = 'OnlineEventAttendanceMode',
  location = 'https://revenueparty.com/audit',
  isAccessibleForFree = true
}: EventSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": name,
    "description": description,
    ...(startDate && { "startDate": startDate }),
    ...(endDate && { "endDate": endDate }),
    "eventAttendanceMode": `https://schema.org/${eventAttendanceMode}`,
    "location": {
      "@type": "VirtualLocation",
      "url": location
    },
    "organizer": {
      "@type": "Organization",
      "name": "Revenue Party",
      "url": "https://revenueparty.com"
    },
    "isAccessibleForFree": isAccessibleForFree,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": location,
      "validFrom": new Date().toISOString()
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
