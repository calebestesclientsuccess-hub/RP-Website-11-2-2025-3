import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle, ArrowRight, Search } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content') || '';
    
    document.title = "404 - Page Not Found | Revenue Party";
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Page not found. Explore Revenue Party\'s GTM Engine solutions or schedule a free audit to transform your revenue generation.');
    }
    
    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.setAttribute('content', originalDescription);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <AlertCircle className="h-12 w-12 text-primary" data-testid="icon-404" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-foreground" data-testid="heading-404">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground" data-testid="heading-not-found">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto" data-testid="text-description">
            The page you're looking for doesn't exist or has been moved. But don't worry—we've got plenty of ways to help you find what you need.
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center justify-center gap-2" data-testid="heading-explore">
              <Search className="h-5 w-5" />
              Explore Our Solutions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/problem">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-problem"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  The Problem
                </Button>
              </Link>
              <Link href="/gtm-engine">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-gtm-engine"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  The GTM Engine
                </Button>
              </Link>
              <Link href="/results">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-results"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Results & Case Studies
                </Button>
              </Link>
              <Link href="/roi-calculator">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-roi-calculator"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  ROI Calculator
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-contact"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="space-y-4">
          <p className="text-foreground font-medium" data-testid="text-cta-intro">
            Still not finding what you need?
          </p>
          <Link href="/audit">
            <Button 
              size="lg"
              className="text-base px-8"
              data-testid="button-schedule-audit"
            >
              Schedule Free GTM Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground" data-testid="text-cta-description">
            Let us analyze your revenue generation system and show you what's possible.
          </p>
        </div>
      </div>
    </div>
  );
}
