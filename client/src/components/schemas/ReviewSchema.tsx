
import { Helmet } from 'react-helmet-async';

interface Review {
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: number;
}

interface ReviewSchemaProps {
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export function ReviewSchema({ reviews, aggregateRating }: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "GTM Engine - Revenue Generation System",
    "description": "Complete GTM system with elite BDR pods",
    "brand": {
      "@type": "Organization",
      "name": "Revenue Party"
    },
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.reviewRating,
        "bestRating": "5",
        "worstRating": "1"
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
