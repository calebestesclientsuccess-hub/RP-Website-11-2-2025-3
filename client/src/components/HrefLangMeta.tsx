import { Helmet } from 'react-helmet-async';

interface HrefLangMetaProps {
  pathname: string;
}

export default function HrefLangMeta({ pathname }: HrefLangMetaProps) {
  const baseUrl = 'https://revenueparty.com';

  return (
    <Helmet>
      {/* Global default */}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />

      {/* English variants */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="en-US" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="en-GB" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="en-CA" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="en-AU" href={`${baseUrl}${pathname}`} />
    </Helmet>
  );
}