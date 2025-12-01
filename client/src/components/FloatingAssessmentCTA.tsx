import { Button } from "@/components/ui/button";
import { ClipboardList, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";

export function FloatingAssessmentCTA() {
  const [location] = useLocation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const hasShownOnce = useRef(false);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Try to find the "Proven Results No Black Box" section
    const targetSection = document.querySelector('[data-testid="section-proven-results"]');
    
    if (targetSection) {
      // ========================================
      // STRATEGY A: Section exists - Use IntersectionObserver
      // ========================================
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const isVisible = entry.isIntersecting;
          
          if (isVisible && !hasShownOnce.current) {
            // First time section becomes visible - show with delay and bounce
            if (delayTimerRef.current) {
              clearTimeout(delayTimerRef.current);
            }
            
            delayTimerRef.current = setTimeout(() => {
              setShouldShow(true);
              setShouldBounce(true);
              hasShownOnce.current = true;
              
              setTimeout(() => setShouldBounce(false), 1200);
            }, 1500);
          } else if (isVisible && hasShownOnce.current) {
            // Section visible and already shown before - display immediately
            setShouldShow(true);
          } else if (!isVisible) {
            // Section not visible - hide widget
            if (delayTimerRef.current) {
              clearTimeout(delayTimerRef.current);
              delayTimerRef.current = null;
            }
            setShouldShow(false);
            setShouldBounce(false);
          }
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px"
        }
      );

      observer.observe(targetSection);

      return () => {
        observer.disconnect();
        if (delayTimerRef.current) {
          clearTimeout(delayTimerRef.current);
        }
      };
    } else {
      // ========================================
      // STRATEGY B: No section found - Use scroll-based trigger
      // ========================================
      const handleScroll = () => {
        const scrollY = window.scrollY;
        
        if (scrollY > 300 && !hasShownOnce.current) {
          // First time scrolling past 300px - show with delay and bounce
          if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
          }
          
          delayTimerRef.current = setTimeout(() => {
            setShouldShow(true);
            setShouldBounce(true);
            hasShownOnce.current = true;
            
            setTimeout(() => setShouldBounce(false), 1200);
          }, 1500);
        } else if (scrollY > 300 && hasShownOnce.current) {
          // Already shown before - display immediately
          setShouldShow(true);
        } else if (scrollY <= 300) {
          // Scrolled back to top - hide widget
          if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
          }
          setShouldShow(false);
          setShouldBounce(false);
        }
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial scroll position on mount

      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (delayTimerRef.current) {
          clearTimeout(delayTimerRef.current);
        }
      };
    }
  }, [location]); // Re-run when location changes

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
