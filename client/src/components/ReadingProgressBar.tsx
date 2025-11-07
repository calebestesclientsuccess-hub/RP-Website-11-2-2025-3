import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ReadingProgressBar() {
  const [, setLocation] = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const scrollCountRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const lastGlowTimeRef = useRef(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      setScrollProgress(Math.min(progress, 100));

      // Track meaningful scrolls (downward movement of at least 100px)
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollYRef.current + 100) {
        scrollCountRef.current += 1;
        lastScrollYRef.current = currentScrollY;
        
        // Trigger engagement after 2-3 scrolls
        if (scrollCountRef.current >= 2 && !isEngaged) {
          setIsEngaged(true);
        }
      }

      // Update last scroll time for idle detection
      lastScrollTimeRef.current = Date.now();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isEngaged]);

  useEffect(() => {
    if (!isEngaged) return;

    // Check for idle state and trigger glow every 30 seconds
    const glowInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTimeRef.current;
      const timeSinceLastGlow = now - lastGlowTimeRef.current;

      // Only glow if:
      // 1. User is actively reading (scrolled within last 10 seconds)
      // 2. At least 30 seconds since last glow
      if (timeSinceLastScroll < 10000 && timeSinceLastGlow >= 30000) {
        setShowGlow(true);
        lastGlowTimeRef.current = now;
        
        // Glow fades after 3 seconds
        setTimeout(() => setShowGlow(false), 3000);
      }
    }, 1000); // Check every second

    return () => clearInterval(glowInterval);
  }, [isEngaged]);

  const handleAssessmentClick = () => {
    setLocation("/pipeline-assessment");
  };

  // Detect if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border"
      data-testid="reading-progress-bar"
    >
      {/* Content bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {Math.round(scrollProgress)}% Complete
          </span>
        </div>

        <Button
          variant="default"
          onClick={handleAssessmentClick}
          size="sm"
          className={`
            relative overflow-visible transition-all duration-2000 ease-in-out
            ${!isMobile && showGlow ? 'shadow-[0_0_20px_rgba(220,38,38,0.3)]' : ''}
          `}
          data-testid="button-take-assessment"
        >
          <Sparkles className="w-3 h-3 mr-2" />
          <span>
            Take Assessment
          </span>
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
          data-testid="progress-fill"
        />
      </div>

      <style>{`
        @keyframes gentleGlow {
          0%, 100% { 
            box-shadow: 0 0 0 rgba(220, 38, 38, 0);
          }
          50% { 
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
          }
        }
      `}</style>
    </div>
  );
}
