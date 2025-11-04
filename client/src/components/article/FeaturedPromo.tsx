import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Video } from "lucide-react";

export interface FeaturedPromoData {
  type: "webinar" | "whitepaper" | "guide" | "assessment";
  badge?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

interface FeaturedPromoProps {
  promo: FeaturedPromoData;
}

export function FeaturedPromo({ promo }: FeaturedPromoProps) {
  const iconMap = {
    webinar: Video,
    whitepaper: Download,
    guide: Download,
    assessment: Download,
  };

  const Icon = iconMap[promo.type];

  return (
    <aside className="sticky top-6">
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30" data-testid="card-featured-promo">
        {promo.badge && (
          <Badge variant="default" className="mb-4">
            {promo.badge}
          </Badge>
        )}
        
        <div className="mb-4">
          <Icon className="w-10 h-10 text-primary mb-3" />
        </div>

        <h3 className="text-xl font-bold mb-3 leading-tight">
          {promo.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-6">
          {promo.description}
        </p>

        <Button 
          asChild 
          variant="default" 
          className="w-full"
          data-testid="button-featured-cta"
        >
          <a href={promo.ctaUrl}>
            {promo.ctaText}
          </a>
        </Button>
      </Card>
    </aside>
  );
}
