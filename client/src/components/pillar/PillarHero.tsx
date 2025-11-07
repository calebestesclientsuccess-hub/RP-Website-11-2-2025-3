import { Badge } from "@/components/ui/badge";

interface PillarHeroProps {
  title: string;
  subtitle: string;
  badgeText?: string;
}

export function PillarHero({ title, subtitle, badgeText }: PillarHeroProps) {
  return (
    <section className="relative pt-32 pb-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {badgeText && (
          <Badge 
            className="badge-texture sticker-dutch-right bg-competition text-white border-competition text-sm px-4 py-1.5 mb-6"
            data-testid="badge-pillar-category"
          >
            {badgeText}
          </Badge>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="heading-pillar">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed" data-testid="text-pillar-subtitle">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
