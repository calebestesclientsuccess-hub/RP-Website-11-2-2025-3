import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";

interface SocialProofProps {
  heading: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  ctaText: string;
  ctaHref: string;
}

export function SocialProof({ heading, quote, author, role, company, ctaText, ctaHref }: SocialProofProps) {
  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center" data-testid="heading-social-proof">
          {heading}
        </h2>
        
        <Card className="p-8 md:p-10 relative">
          <Quote className="absolute top-6 left-6 w-12 h-12 text-competition opacity-20" />
          
          <blockquote className="relative z-10">
            <p className="text-lg md:text-xl italic mb-6 leading-relaxed" data-testid="text-testimonial-quote">
              "{quote}"
            </p>
            <footer className="text-base font-semibold" data-testid="text-testimonial-author">
              — {author}, {role}, {company}
            </footer>
          </blockquote>
          
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              size="lg"
              asChild
              data-testid="button-social-proof-cta"
            >
              <a href={ctaHref}>{ctaText}</a>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
