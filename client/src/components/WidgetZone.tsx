import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
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
import type { Campaign, CalculatorConfig, FormConfig, SeoMetadata } from "@shared/schema";
import { cn } from "@/lib/utils";
import { PopupEngine } from "./PopupEngine";

interface WidgetZoneProps {
  zone: string;
  className?: string;
}

// Map static route paths to campaign page names
const pathToPageName: Record<string, string> = {
  "/": "home",
  "/blog": "blog",
  "/why-us": "about",
  "/contact": "contact",
  "/pricing": "pricing",
  "/problem": "problem",
  "/gtm-engine": "gtm-engine",
  "/results": "results",
  "/roi-calculator": "roi-calculator",
  "/faq": "faq",
  "/assessment": "assessment",
  "/audit": "audit",
};

// Determine all page names that apply to the current path
const getPageNames = (path: string): string[] => {
  const names: string[] = [];

  // Add specific page name if it exists in the static map
  if (pathToPageName[path]) {
    names.push(pathToPageName[path]);
  }

  // Check for wildcard matches

  // Blog posts: /blog/:slug (but not /blog itself)
  if (path.startsWith("/blog/") && path !== "/blog") {
    names.push("all-blog-posts");
  }

  // Assessment pages
  if (
    path.startsWith("/resources/gtm-assessment") ||
    path.startsWith("/pipeline-assessment") ||
    path === "/assessment"
  ) {
    names.push("all-assessment-pages");

    // Also add specific assessment page names
    if (path === "/resources/gtm-assessment") {
      names.push("gtm-assessment");
    } else if (path.startsWith("/pipeline-assessment")) {
      names.push("pipeline-assessment");
    }
  }

  // Default to "home" if no names found
  if (names.length === 0) {
    names.push("home");
  }

  return names;
};

// Get display size CSS classes based on campaign.displaySize
const getDisplaySizeClasses = (displaySize?: string | null): string => {
  switch (displaySize) {
    case "inline":
      // Compact styling - smaller padding, tighter layout
      return "p-2 space-y-2";
    case "standard":
      // Default styling
      return "p-4 space-y-4";
    case "large":
      // Larger padding and spacing
      return "p-6 md:p-8 space-y-6";
    case "hero":
      // Full-width, banner-style layout
      return "w-full p-8 md:p-12 space-y-6 md:space-y-8";
    case "takeover":
      // Maximum size, dominates the section
      return "w-full min-h-[60vh] p-12 md:p-16 space-y-8 md:space-y-12";
    default:
      // Default to standard
      return "p-4 space-y-4";
  }
};

export function WidgetZone({ zone, className }: WidgetZoneProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  // Determine all page names that apply to the current path
  const pageNames = getPageNames(location);

  // Use first page name as primary (for tracking purposes)
  const currentPage = pageNames[0];

  // Fetch all active campaigns for this zone
  const { data: allCampaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ["/api/public/campaigns", { zone, displayAs: "inline" }],
    queryFn: async () => {
      const params = new URLSearchParams({
        zone,
        displayAs: "inline",
      });
      const response = await fetch(`/api/public/campaigns?${params}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      return response.json();
    },
  });

  // Filter campaigns to match current page names
  const campaigns = allCampaigns?.filter(campaign => 
    campaign.targetPages?.some(targetPage => pageNames.includes(targetPage))
  );

  // Separate inline and popup campaigns
  const inlineCampaigns = campaigns?.filter((c: Campaign) => c.displayAs === 'inline') || [];
  const popupCampaigns = campaigns?.filter((c: Campaign) => c.displayAs === 'popup') || [];

  // Get the first matching campaign (or null if none)
  const campaign = inlineCampaigns?.[0] || null;


  // Track campaign_viewed event when campaign is loaded
  // IMPORTANT: This must be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (campaign?.id) {
      trackEvent('campaign_viewed', campaign.id, {
        zone,
        page: currentPage,
        contentType: campaign.contentType
      });
    }
  }, [campaign?.id, zone, currentPage, campaign?.contentType]);

  // Handle loading state - return null (invisible)
  if (isLoading) {
    return null;
  }

  // Handle error state - log and return null (fail silently)
  if (error) {
    console.error(`[WidgetZone] Error fetching campaign for zone ${zone}:`, error);
    return null;
  }

  // Handle empty state - no campaigns found
  if (!campaign) {
    return null;
  }

  // Parse widgetConfig if it exists (stored as JSON string)
  let parsedConfig: any = null;
  if (campaign.widgetConfig) {
    try {
      parsedConfig = JSON.parse(campaign.widgetConfig);
    } catch (error) {
      console.error(`[WidgetZone] Error parsing widgetConfig for campaign ${campaign.id}:`, error);
      return null;
    }
  }

  // Parse seoMetadata if it exists (stored as JSON string)
  let seoMetadata: SeoMetadata | null = null;
  if (campaign.seoMetadata) {
    try {
      seoMetadata = JSON.parse(campaign.seoMetadata);
    } catch (error) {
      console.error(`[WidgetZone] Error parsing seoMetadata for campaign ${campaign.id}:`, error);
    }
  }

  // Handle form submission for DynamicForm
  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      // Submit to lead-captures endpoint with campaign metadata
      const payload = {
        ...formData,
        resourceDownloaded: campaign.campaignName,
        source: `campaign-${campaign.id}`,
      };

      await apiRequest("POST", "/api/lead-captures", payload);

      // Show success toast
      toast({
        title: "Success",
        description: "Thank you for your submission!",
      });

      // Track campaign_submit event
      trackEvent('campaign_submit', campaign.id, {
        campaignName: campaign.campaignName,
        zone,
        page: currentPage,
        contentType: campaign.contentType
      });

      // Invalidate lead captures cache
      queryClient.invalidateQueries({ queryKey: ["/api/lead-captures"] });
    } catch (error) {
      console.error("[WidgetZone] Form submission error:", error);
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
    const theme = (campaign.theme as "light" | "dark" | "auto") || "auto";
    const size = (campaign.size as "small" | "medium" | "large") || "medium";

    switch (campaign.contentType) {
      case "calculator":
        if (!parsedConfig) {
          console.error(`[WidgetZone] No config found for calculator widget`);
          return null;
        }
        return (
          <DynamicCalculator
            config={parsedConfig as CalculatorConfig}
            theme={theme}
            size={size}
          />
        );

      case "form":
        if (!parsedConfig) {
          console.error(`[WidgetZone] No config found for form widget`);
          return null;
        }

        // Check if this is raw HTML mode
        if (parsedConfig.type === "html") {
          // Sanitize HTML with DOMPurify for security
          // Allow essential form attributes for third-party integrations (Mailchimp, ConvertKit, etc.)
          const sanitizedHTML = DOMPurify.sanitize(parsedConfig.html || "", {
            ALLOWED_TAGS: ['form', 'input', 'textarea', 'button', 'select', 'option', 'label', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'a', 'strong', 'em', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: [
              // Form attributes (essential for third-party form providers)
              'action', 'method', 'enctype', 'accept-charset', 'autocomplete', 'novalidate',
              // Input attributes
              'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'maxlength', 'min', 'max', 'step', 'pattern',
              // Select/option attributes
              'selected', 'multiple', 'size',
              // Common attributes
              'class', 'id', 'style', 'title', 'aria-label', 'aria-describedby',
              // Link attributes
              'href', 'target', 'rel',
              // Label attributes
              'for',
              // Data attributes (used by many form providers)
              'data-form-id', 'data-uid', 'data-ga', 'data-track'
            ],
            // Allow data-* attributes for form providers
            ALLOW_DATA_ATTR: true,
          });

          return (
            <div 
              dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              data-testid="raw-html-form"
            />
          );
        }

        // Otherwise use the DynamicForm builder
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
        if (!parsedConfig || !parsedConfig.assessmentId) {
          console.error(`[WidgetZone] No assessmentId found for embedded-assessment widget`);
          return null;
        }
        return (
          <AssessmentEmbed
            assessmentId={parsedConfig.assessmentId}
            theme={theme}
            size={size}
          />
        );

      case "collection":
        if (!parsedConfig || !parsedConfig.collectionType) {
          console.error(`[WidgetZone] No collectionType found for collection widget`);
          return null;
        }
        
        console.log(`[WidgetZone] Rendering collection type: ${parsedConfig.collectionType}`);
        
        switch (parsedConfig.collectionType) {
          case "testimonials":
            return <TestimonialCarousel theme={theme} size={size} />;
          case "videos":
            return <VideoGallery theme={theme} size={size} />;
          case "blogs":
            return <BlogFeed theme={theme} size={size} />;
          default:
            console.warn(`[WidgetZone] Unknown collection type: ${parsedConfig.collectionType}`);
            return null;
        }

      default:
        console.error(`[WidgetZone] Unknown content type: ${campaign.contentType}`, { 
          campaign, 
          parsedConfig 
        });
        return null;
    }
  };

  const widget = renderWidget();

  // If widget rendering failed, return null (don't render empty space)
  if (!widget) {
    console.error(`[WidgetZone] Failed to render widget for campaign ${campaign.id}`, {
      contentType: campaign.contentType,
      hasConfig: !!campaign.widgetConfig,
      configPreview: campaign.widgetConfig?.substring(0, 100),
    });
    return null;
  }

  // Get display size classes
  const displaySizeClasses = getDisplaySizeClasses(campaign.displaySize);

  return (
    <>
      {/* Inject SEO metadata if available */}
      {seoMetadata && (
        <Helmet>
          {seoMetadata.metaTitle && <title>{seoMetadata.metaTitle}</title>}
          {seoMetadata.metaDescription && (
            <meta name="description" content={seoMetadata.metaDescription} />
          )}
          {seoMetadata.metaTitle && (
            <meta property="og:title" content={seoMetadata.metaTitle} />
          )}
          {seoMetadata.metaDescription && (
            <meta property="og:description" content={seoMetadata.metaDescription} />
          )}
          {seoMetadata.ogImage && (
            <meta property="og:image" content={seoMetadata.ogImage} />
          )}
        </Helmet>
      )}

      {/* Render the widget with displaySize styling */}
      <ErrorBoundary silent>
        <div 
          className={`${displaySizeClasses} ${className || ''}`}
          data-testid={`widget-zone-${zone}`}
        >
          {widget}
        </div>
      </ErrorBoundary>
      <PopupEngine campaigns={popupCampaigns} />
    </>
  );
}