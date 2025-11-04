import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SpokeLinkProps {
  href: string;
  title: string;
  description?: string;
}

export function SpokeLink({ href, title, description }: SpokeLinkProps) {
  return (
    <Link 
      href={href}
      className="group block p-4 rounded-md hover-elevate active-elevate-2 border border-border transition-all"
      data-testid={`link-spoke-${href.replace(/\//g, '-')}`}
    >
      <div className="flex items-start gap-3">
        <ArrowRight className="w-5 h-5 text-competition mt-0.5 group-hover:translate-x-1 transition-transform" />
        <div className="flex-1">
          <h4 className="font-semibold text-foreground group-hover:text-competition transition-colors">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
