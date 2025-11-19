import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileOverlayProps {
  /** Threshold for mobile detection (default: 768px) */
  maxWidth?: number;
  /** Custom message to display */
  customMessage?: string;
  /** Whether to also show for tablets (< 1024px) */
  includeTablets?: boolean;
}

export function MobileOverlay({ 
  maxWidth = 768,
  customMessage,
  includeTablets = false
}: MobileOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsMounted(true);

    // Check if should display overlay
    const checkShouldDisplay = () => {
      const width = window.innerWidth;
      const threshold = includeTablets ? 1024 : maxWidth;
      const isMobileDevice = width < threshold;
      const wasDismissed = sessionStorage.getItem('mobile-overlay-dismissed') === 'true';
      
      if (isMobileDevice && !wasDismissed) {
        setIsVisible(true);
      }
    };

    // Initial check
    checkShouldDisplay();

    // Check on resize (in case user switches orientation)
    const handleResize = () => {
      const width = window.innerWidth;
      const threshold = includeTablets ? 1024 : maxWidth;
      
      if (width >= threshold) {
        // Hide if no longer mobile
        setIsVisible(false);
      } else {
        // Re-check if should show
        checkShouldDisplay();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [maxWidth, includeTablets]);

  const handleDismiss = () => {
    sessionStorage.setItem('mobile-overlay-dismissed', 'true');
    setIsVisible(false);
  };

  // Don't render on server or if not mounted
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          </motion.div>

          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
            data-testid="mobile-overlay"
          >
            <div className={cn(
              "relative overflow-hidden rounded-2xl",
              "bg-background/95 backdrop-blur-xl",
              "border border-border/50",
              "shadow-2xl shadow-black/20 dark:shadow-black/40",
              "p-8"
            )}>
              {/* Gradient decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              
              {/* Content */}
              <div className="relative space-y-6 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                    <div className={cn(
                      "relative bg-gradient-to-br from-primary/10 to-primary/5",
                      "border border-primary/20",
                      "rounded-full p-4"
                    )}>
                      <Monitor className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Best Viewed on Desktop
                  </h2>
                  <p className="text-lg font-medium text-primary">
                    Mobile Experience Coming Soon
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed px-4">
                    {customMessage || 
                     "Our portfolios feature advanced animations and interactive experiences that truly shine on larger screens. We're crafting an optimized mobile version for you."}
                  </p>
                </div>

                {/* Device Icons */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-muted-foreground/50" />
                    <div className="w-12 h-1 bg-gradient-to-r from-muted-foreground/50 to-primary/50 rounded-full" />
                    <Monitor className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleDismiss}
                  size="lg"
                  className={cn(
                    "w-full font-medium",
                    "bg-primary hover:bg-primary/90",
                    "shadow-lg shadow-primary/20",
                    "transition-all duration-200"
                  )}
                  data-testid="button-continue-mobile"
                >
                  Continue on Mobile
                </Button>

                {/* Optional: Add link to be notified */}
                <p className="text-xs text-muted-foreground pt-2">
                  We'll make it worth the wait ✨
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}