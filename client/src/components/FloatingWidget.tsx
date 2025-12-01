import { useQuery } from "@tanstack/react-query";
import { FloatingCalculatorCTA } from "./FloatingCalculatorCTA";
import { FloatingAssessmentCTA } from "./FloatingAssessmentCTA";
import type { WidgetConfig } from "@shared/schema";

export function FloatingWidget() {
  const { data: widgetConfig, isLoading, error } = useQuery<WidgetConfig>({
    queryKey: ["/api/widget-config"],
  });

  // Don't render anything while loading to prevent flash of wrong widget
  if (isLoading) {
    return null;
  }

  // If there's an error or no config, default to showing assessment widget
  if (error || !widgetConfig) {
    return <FloatingAssessmentCTA />;
  }

  // Check if widget is explicitly disabled
  const isEnabled = widgetConfig.enabled !== false;
  const widgetType = widgetConfig.widgetType || "assessment";

  // Don't render if widget is explicitly disabled
  if (!isEnabled) {
    return null;
  }

  // Render the appropriate widget based on config
  if (widgetType === "assessment") {
    return <FloatingAssessmentCTA />;
  }

  // Default to calculator
  return <FloatingCalculatorCTA />;
}
