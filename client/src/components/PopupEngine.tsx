import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicCalculator } from "@/components/widgets/DynamicCalculator";
import { DynamicForm } from "@/components/widgets/DynamicForm";
import TestimonialCarousel from "@/components/widgets/TestimonialCarousel";
import VideoGallery from "@/components/widgets/VideoGallery";
import BlogFeed from "@/components/widgets/BlogFeed";
import { AssessmentEmbed } from "@/components/widgets/AssessmentEmbed";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { trackEvent } from "@/lib/trackEvent";
import { useCampaigns } from "@/lib/campaignCache";
import type { Campaign, CalculatorConfig, FormConfig } from "@shared/schema";

// Map route paths to campaign page names (same as WidgetZone)
const pathToPageName: Record<string, string> = {
  "/": "Home",
  "/blog": "Blog",
  "/why-us": "About",
  "/contact": "Contact",
  "/pricing": "Pricing",
  "/features": "Features",
  "/assessment": "Assessments",
};

export function PopupEngine() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const [showPopup, setShowPopup] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [triggeredBy, setTriggeredBy] = useState<'scroll' | 'time' | null>(null);
  
  // Determine the current page name from the route
  const currentPage = pathToPageName[location] || "Home";
  
  // Detect if mobile for SEO guardrails
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Use the shared campaign cache with client-side filtering for popup campaigns
  const { campaigns, isLoading, error } = useCampaigns({
    pageNames: [currentPage],
    displayAs: "popup",
  });
  
  // Get the first matching campaign
  const campaign = campaigns && campaigns.length > 0 ? campaigns[0] : null;
  
  // Check if popup was already dismissed this session
  const isDismissed = campaign 
    ? sessionStorage.getItem(`popup_dismissed_${campaign.id}`) === "true"
    : false;
  
  // Scroll trigger: track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      setScrollProgress(progress);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Trigger logic: scroll 50% OR time delay (10s desktop, 13s mobile)
  useEffect(() => {
    if (!campaign || isDismissed || hasTriggered) {
      return;
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Time trigger with mobile SEO guardrail
    const timeDelay = isMobile ? 13000 : 10000; // 13s on mobile, 10s on desktop
    timeoutId = setTimeout(() => {
      setShowPopup(true);
      setHasTriggered(true);
      setTriggeredBy('time');
    }, timeDelay);
    
    // Scroll trigger: 50% down the page
    if (scrollProgress >= 50) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setShowPopup(true);
      setHasTriggered(true);
      setTriggeredBy('scroll');
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [campaign, isDismissed, hasTriggered, scrollProgress, isMobile]);
  
  // Track campaign_viewed event when popup is displayed
  useEffect(() => {
    if (showPopup && campaign?.id) {
      trackEvent('campaign_viewed', campaign.id, {
        trigger: triggeredBy,
        page: currentPage,
        contentType: campaign.contentType
      });
    }
  }, [showPopup, campaign?.id, triggeredBy, currentPage]);
  
  // Handle dismissal
  const handleDismiss = () => {
    if (campaign) {
      sessionStorage.setItem(`popup_dismissed_${campaign.id}`, "true");
      setShowPopup(false);
      
      // Track campaign_dismissed event
      trackEvent('campaign_dismissed', campaign.id, {
        campaignName: campaign.campaignName,
        page: currentPage,
        contentType: campaign.contentType,
        trigger: triggeredBy
      });
    }
  };
  
  // Handle backdrop click (only if overlay opacity > 0)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (campaign?.dismissible && campaign.overlayOpacity && campaign.overlayOpacity > 0) {
      if (e.target === e.currentTarget) {
        handleDismiss();
      }
    }
  };
  
  // Handle form submission for DynamicForm
  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!campaign) return;
    
    try {
      const payload = {
        ...formData,
        resourceDownloaded: campaign.campaignName,
        source: `popup-campaign-${campaign.id}`,
      };
      
      await apiRequest("POST", "/api/lead-captures", payload);
      
      toast({
        title: "Success",
        description: "Thank you for your submission!",
      });
      
      // Track campaign_submit event
      trackEvent('campaign_submit', campaign.id, {
        campaignName: campaign.campaignName,
        page: currentPage,
        contentType: campaign.contentType,
        trigger: triggeredBy
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/lead-captures"] });
      
      // Auto-dismiss after successful submission
      handleDismiss();
    } catch (error) {
      console.error("[PopupEngine] Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Render the appropriate widget based on contentType
  const renderWidget = () => {
    if (!campaign) return null;
    
    const theme = (campaign.theme as "light" | "dark" | "auto") || "auto";
    const size = (campaign.size as "small" | "medium" | "large") || "medium";
    
    let parsedConfig: any = null;
    if (campaign.widgetConfig) {
      try {
        parsedConfig = JSON.parse(campaign.widgetConfig);
      } catch (error) {
        console.error(`[PopupEngine] Error parsing widgetConfig:`, error);
        return null;
      }
    }
    
    switch (campaign.contentType) {
      case "calculator":
        if (!parsedConfig) return null;
        return (
          <DynamicCalculator
            config={parsedConfig as CalculatorConfig}
            theme={theme}
            size={size}
          />
        );
      
      case "form":
        if (!parsedConfig) return null;
        return (
          <DynamicForm
            config={parsedConfig as FormConfig}
            onSubmit={handleFormSubmit}
            theme={theme}
            size={size}
          />
        );
      
      case "testimonial-carousel":
        return <TestimonialCarousel theme={theme} size={size} />;
      
      case "video-gallery":
        return <VideoGallery theme={theme} size={size} />;
      
      case "blog-feed":
        return <BlogFeed theme={theme} size={size} />;
      
      case "embedded-assessment":
        if (!parsedConfig || !parsedConfig.assessmentId) return null;
        return (
          <AssessmentEmbed
            assessmentId={parsedConfig.assessmentId}
            theme={theme}
            size={size}
          />
        );
      
      default:
        console.warn(`[PopupEngine] Unknown content type: ${campaign.contentType}`);
        return null;
    }
  };
  
  // Don't render if loading, error, no campaign, or already dismissed
  if (isLoading || error || !campaign || isDismissed) {
    return null;
  }
  
  // Get max width based on size
  const getMaxWidth = () => {
    switch (campaign.size) {
      case "small":
        return "400px";
      case "medium":
        return "600px";
      case "large":
        return "800px";
      default:
        return "600px";
    }
  };
  
  // Get animation variants based on campaign.animation
  const getAnimationVariants = () => {
    const animationType = campaign.animation || "fade";
    
    switch (animationType) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 },
        };
      
      case "slide-up":
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
        };
      
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        };
      
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
        };
      
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };
  
  const backdropOpacity = (campaign.overlayOpacity || 50) / 100;
  const animationVariants = getAnimationVariants();
  const widget = renderWidget();
  
  // If widget rendering failed, don't show popup
  if (!widget) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          data-testid="popup-engine"
        >
          {/* Backdrop */}
          {campaign.overlayOpacity && campaign.overlayOpacity > 0 && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: backdropOpacity }}
              data-testid="popup-backdrop"
            />
          )}
          
          {/* Popup content */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full"
            style={{ maxWidth: getMaxWidth() }}
            data-testid="popup-content"
          >
            <Card className="relative overflow-hidden">
              {/* Close button (if dismissible) */}
              {campaign.dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-20"
                  onClick={handleDismiss}
                  data-testid="button-close-popup"
                  aria-label="Close popup"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Widget content */}
              <ErrorBoundary silent>
                <div className="w-full">
                  {widget}
                </div>
              </ErrorBoundary>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
