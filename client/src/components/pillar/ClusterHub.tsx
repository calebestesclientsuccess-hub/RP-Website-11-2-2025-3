import { SpokeLink } from "./SpokeLink";

interface ClusterHubLink {
  href: string;
  title: string;
  description?: string;
}

interface ClusterHubProps {
  heading: string;
  description: string;
  links: ClusterHubLink[];
}

export function ClusterHub({ heading, description, links }: ClusterHubProps) {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cluster-hub">
          {heading}
        </h2>
        <p className="text-lg text-muted-foreground mb-8" data-testid="text-cluster-description">
          {description}
        </p>
        
        <div className="grid gap-4">
          {links.map((link, index) => (
            <SpokeLink 
              key={index}
              href={link.href}
              title={link.title}
              description={link.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
