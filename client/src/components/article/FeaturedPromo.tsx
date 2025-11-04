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
  imageUrl?: string;
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
      <div className="overflow-hidden border border-border/50 bg-muted/20 rounded-lg p-5" data-testid="card-featured-promo">
        {promo.imageUrl && (
          <div className="aspect-[16/10] overflow-hidden bg-muted rounded-md mb-4">
            <img
              src={promo.imageUrl}
              alt={promo.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div>
          {promo.badge && (
            <Badge variant="outline" className="mb-3 text-xs">
              {promo.badge}
            </Badge>
          )}
          
          {!promo.imageUrl && (
            <div className="mb-3">
              <Icon className="w-8 h-8 text-muted-foreground mb-2" />
            </div>
          )}

          <h3 className="text-base font-bold mb-2 leading-snug">
            {promo.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {promo.description}
          </p>

          <Button 
            asChild 
            variant="outline" 
            size="sm"
            className="w-full"
            data-testid="button-featured-cta"
          >
            <a href={promo.ctaUrl}>
              {promo.ctaText}
            </a>
          </Button>
        </div>
      </div>
    </aside>
  );
}
