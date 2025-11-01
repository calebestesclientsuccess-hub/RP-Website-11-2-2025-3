import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
}

export function SEO({
  title = "Revenue Party - GTM Systems That Multiply Your Pipeline",
  description = "Deploy a complete GTM system with elite BDRs, AI tech, and proven strategy. Get 20+ qualified appointments monthly.",
  canonical,
  ogImage = "https://revenueparty.com/og-image.png",
  keywords = "GTM system, sales development, BDR pod, revenue generation, pipeline growth"
}: SEOProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://revenueparty.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Revenue Party" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Revenue Party" />
    </Helmet>
  );
}
