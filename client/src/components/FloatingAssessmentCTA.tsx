import { Button } from "@/components/ui/button";
import { ClipboardList, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export function FloatingAssessmentCTA() {
  const [location] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);

  // Hide on assessment page to avoid redundancy
  if (location === "/assessment" || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-2 animate-fade-up" data-testid="floating-assessment-cta">
      {/* Tooltip/Message */}
      <div className="hidden lg:flex items-center gap-3 bg-card border border-primary/20 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">Take Assessment</p>
          <p className="text-xs text-muted-foreground">
            Discover your GTM readiness in 5 minutes
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setIsDismissed(true)}
          data-testid="button-dismiss-tooltip"
          aria-label="Dismiss assessment tooltip"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main CTA Button */}
      <Button
        variant="default"
        size="lg"
        className="shadow-2xl h-14 w-14 lg:h-auto lg:w-auto gap-2 rounded-full lg:rounded-md"
        data-testid="button-floating-assessment"
        aria-label="Take GTM Assessment"
        asChild
      >
        <Link href="/assessment">
          <ClipboardList className="h-5 w-5" />
          <span className="hidden lg:inline">Take Assessment</span>
        </Link>
      </Button>
    </div>
  );
}
