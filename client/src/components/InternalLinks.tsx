
import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface InternalLink {
  title: string;
  href: string;
  description: string;
}

interface InternalLinksProps {
  links: InternalLink[];
  title?: string;
}

export function InternalLinks({ links, title = "Related Resources" }: InternalLinksProps) {
  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link, index) => (
          <Link key={index} href={link.href}>
            <Card className="p-4 hover:bg-accent transition-colors cursor-pointer h-full">
              <h3 className="font-semibold mb-2 text-primary hover:underline">
                {link.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
