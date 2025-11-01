import { Helmet } from 'react-helmet-async';

interface HrefLangMetaProps {
  pathname: string;
}

export default function HrefLangMeta({ pathname }: HrefLangMetaProps) {
  // Base domain for the site
  const baseDomain = 'https://revenuelabs.com';
  
  // Currently only English, but structured for easy expansion
  const languages = [
    { code: 'en', url: baseDomain },
    { code: 'x-default', url: baseDomain } // Default for unmatched languages
  ];

  return (
    <Helmet>
      {languages.map(lang => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={`${lang.url}${pathname}`}
        />
      ))}
    </Helmet>
  );
}