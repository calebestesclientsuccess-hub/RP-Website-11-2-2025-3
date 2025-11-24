import { Button } from "@/components/ui/button";
import { Calculator, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export function FloatingCalculatorCTA() {
  const [location] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Hide on ROI calculator page to avoid redundancy
  if (location === "/results/roi-calculator" || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-2 animate-fade-up" data-testid="floating-calculator-cta">
      {/* Tooltip/Message */}
      <div className="hidden lg:flex items-center gap-3 bg-card border border-primary/20 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Calculate Your ROI</p>
          <p className="text-xs text-muted-foreground">
            See how much you could save with a BDR Pod
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setIsDismissed(true)}
          data-testid="button-dismiss-tooltip"
          aria-label="Dismiss calculator tooltip"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main CTA Button */}
      <Button
        variant="primary"
        size="lg"
        className="shadow-2xl h-14 w-14 lg:h-auto lg:w-auto gap-2 rounded-full lg:rounded-md"
        data-testid="button-floating-calculator"
        aria-label="Open ROI Calculator"
        asChild
      >
        <Link href="/results/roi-calculator">
          <Calculator className="h-5 w-5" />
          <span className="hidden lg:inline">ROI Calculator</span>
        </Link>
      </Button>
    </div>
  );
}
