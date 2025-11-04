import { useQuery } from "@tanstack/react-query";
import { FloatingCalculatorCTA } from "./FloatingCalculatorCTA";
import { FloatingAssessmentCTA } from "./FloatingAssessmentCTA";
import type { WidgetConfig } from "@shared/schema";

export function FloatingWidget() {
  const { data: widgetConfig, isLoading } = useQuery<WidgetConfig>({
    queryKey: ["/api/widget-config"],
  });

  // Don't render anything while loading to prevent flash of wrong widget
  if (isLoading) {
    return null;
  }

  // Default to calculator if no config exists or widget is disabled
  const widgetType = widgetConfig?.widgetType || "calculator";
  const isEnabled = widgetConfig?.enabled !== false;

  // Don't render if widget is disabled
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
