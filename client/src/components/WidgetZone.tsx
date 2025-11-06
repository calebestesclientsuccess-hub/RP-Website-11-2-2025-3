import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
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

interface WidgetZoneProps {
  zone: string;
  className?: string;
}

// Map route paths to campaign page names
const pathToPageName: Record<string, string> = {
  "/": "Home",
  "/blog": "Blog",
  "/why-us": "About",
  "/contact": "Contact",
  "/pricing": "Pricing",
  "/features": "Features",
  "/assessment": "Assessments",
};

export function WidgetZone({ zone, className }: WidgetZoneProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  // Determine the current page name from the route
  const currentPage = pathToPageName[location] || "Home";

  // Fetch active campaigns for this zone and page
  const { data: campaigns, isLoading, error } = useQuery<Campaign[]>({
    queryKey: ["/api/public/campaigns", { zone, page: currentPage, displayAs: "inline" }],
    queryFn: async () => {
      const params = new URLSearchParams({
        zone,
        page: currentPage,
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
  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  // Get the first matching campaign
  const campaign = campaigns[0];

  // Track campaign_viewed event when campaign is loaded
  useEffect(() => {
    if (campaign?.id) {
      trackEvent('campaign_viewed', campaign.id, {
        zone,
        page: currentPage,
        contentType: campaign.contentType
      });
    }
  }, [campaign?.id, zone, currentPage]);

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

      default:
        console.warn(`[WidgetZone] Unknown content type: ${campaign.contentType}`);
        return null;
    }
  };

  const widget = renderWidget();

  // If widget rendering failed, return null
  if (!widget) {
    return null;
  }

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

      {/* Render the widget */}
      <ErrorBoundary silent>
        <div className={className} data-testid={`widget-zone-${zone}`}>
          {widget}
        </div>
      </ErrorBoundary>
    </>
  );
}
