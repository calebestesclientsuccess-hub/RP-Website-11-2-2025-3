import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";

interface CTASectionProps {
  heading: string;
  description?: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  children?: React.ReactNode;
}

export function CTASection({ heading, description, primaryCTA, secondaryCTA, children }: CTASectionProps) {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cta">
            {heading}
          </h2>
          
          {description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
              {description}
            </p>
          )}
          
          {children && (
            <div className="mb-8">
              {children}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2"
              asChild
              data-testid="button-primary-cta"
            >
              <a href={primaryCTA.href}>
                {primaryCTA.text}
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            
            {secondaryCTA && (
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                asChild
                data-testid="button-secondary-cta"
              >
                <a href={secondaryCTA.href}>
                  <Download className="w-4 h-4" />
                  {secondaryCTA.text}
                </a>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
