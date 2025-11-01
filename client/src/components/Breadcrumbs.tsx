import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export function Breadcrumbs({ items, currentPage }: BreadcrumbsProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${baseUrl}/`
        },
        ...items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 2,
          "name": item.label,
          "item": `${baseUrl}${item.href}`
        })),
        {
          "@type": "ListItem",
          "position": items.length + 2,
          "name": currentPage,
          "item": `${baseUrl}${window.location.pathname}`
        }
      ]
    };

    let scriptTag = document.querySelector('script[data-breadcrumb-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-breadcrumb-schema', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const existingScript = document.querySelector('script[data-breadcrumb-schema]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items, currentPage, baseUrl]);

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="py-4 px-4 md:px-6 lg:px-8 bg-card/50 border-b border-card-border"
      data-testid="nav-breadcrumbs"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li className="flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="breadcrumb-home"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </li>
          
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-2">
              <Link 
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </li>
          ))}
          
          <li>
            <span 
              className="text-foreground font-medium" 
              aria-current="page"
              data-testid="breadcrumb-current"
            >
              {currentPage}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  );
}
