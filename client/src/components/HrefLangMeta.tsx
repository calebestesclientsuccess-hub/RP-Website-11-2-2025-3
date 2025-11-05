import { Helmet } from 'react-helmet-async';

interface HrefLangMetaProps {
  pathname: string;
}

export default function HrefLangMeta({ pathname }: HrefLangMetaProps) {
  const siteUrl = 'https://revenueparty.com';
  const fullUrl = `${siteUrl}${pathname}`;

  return (
    <Helmet>
      {/* Primary language version */}
      <link rel="alternate" hrefLang="en" href={fullUrl} />
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />

      {/* Add more language versions here as needed */}
      {/* Example: <link rel="alternate" hrefLang="es" href={`${siteUrl}/es${pathname}`} /> */}
    </Helmet>
  );
}