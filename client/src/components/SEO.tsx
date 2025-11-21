import { Helmet } from 'react-helmet-async';
import HrefLangMeta from './HrefLangMeta';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
}

export function SEO({
  title = "Revenue Party - GTM Systems That Multiply Your Pipeline 3-5x",
  description = "Stop the hiring/firing cycle. Deploy a complete GTM system with elite BDRs, AI technology, and proven strategy. Get 20+ qualified appointments monthly. 80x ROI guaranteed.",
  canonical,
  ogImage = "https://revenueparty.com/og-image.png",
  keywords = "GTM system, sales development, BDR pod, revenue generation, pipeline growth"
}: SEOProps) {
  const siteUrl = 'https://revenueparty.com';
  const canonicalIsAbsolute = canonical?.startsWith('http');
  let fullCanonical = siteUrl;
  let pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  if (canonical) {
    if (canonicalIsAbsolute) {
      fullCanonical = canonical;
      try {
        pathname = new URL(canonical).pathname || pathname;
      } catch {
        pathname = canonical;
      }
    } else {
      fullCanonical = `${siteUrl}${canonical}`;
      pathname = canonical;
    }
  }

  return (
    <>
      <HrefLangMeta pathname={pathname} />
      <Helmet>
        {/* Basic Meta Tags */}
        <html lang="en" />
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
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta property="og:site_name" content="Revenue Party" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:updated_time" content={new Date().toISOString()} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@revenueparty" />
        <meta name="twitter:creator" content="@revenueparty" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={title} />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Revenue Party" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
      </Helmet>
    </>
  );
}
