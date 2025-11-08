import { Button } from "@/components/ui/button";
import { ClipboardList, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";

export function FloatingAssessmentCTA() {
  const [location] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const hasShownOnce = useRef(false);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Find the hero section (first section on home page)
    const heroSection = document.querySelector('section');
    
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const heroEntry = entries[0];
        const heroVisible = heroEntry.isIntersecting;
        
        setIsHeroVisible(heroVisible);

        // When user scrolls past hero (hero becomes not visible)
        if (!heroVisible && !hasShownOnce.current) {
          // First time scrolling past hero - wait 3 seconds, then show with bounce
          if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
          }
          
          delayTimerRef.current = setTimeout(() => {
            setShouldShow(true);
            setShouldBounce(true);
            hasShownOnce.current = true;
            
            // Remove bounce class after animation completes
            setTimeout(() => {
              setShouldBounce(false);
            }, 1200); // 3 bounces * 0.4s = 1.2s
          }, 3000);
        } else if (!heroVisible && hasShownOnce.current) {
          // Subsequent times - show immediately without bounce
          setShouldShow(true);
        } else if (heroVisible) {
          // Hero is visible - hide the widget and clear any pending timers
          if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
          }
          setShouldShow(false);
          setShouldBounce(false);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of hero is visible
      }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  // Hide on assessment page to avoid redundancy
  if (location === "/assessment" || isDismissed) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 flex items-end gap-2 transition-opacity duration-300 ${
        shouldBounce ? 'animate-subtle-bounce' : ''
      } ${shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      data-testid="floating-assessment-cta"
    >
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
