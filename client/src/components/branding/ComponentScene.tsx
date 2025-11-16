
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ComparisonTable } from "@/components/ComparisonTable";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import GTMTimeline from "@/components/GTMTimeline";
import BuildAndRampTimeline from "@/components/BuildAndRampTimeline";
import { MiniCalculator } from "@/components/MiniCalculator";

interface ComponentSceneProps {
  componentType: string;
  props: Record<string, any>;
  heading?: string;
  description?: string;
  director?: Record<string, any>;
}

export function ComponentScene({ componentType, props, heading, description, director }: ComponentSceneProps) {
  const renderComponent = () => {
    switch (componentType) {
      case "metric-card":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {props.metrics?.map((metric: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{metric.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    <AnimatedCounter end={metric.value} duration={2000} />
                    {metric.suffix}
                  </div>
                  {metric.description && (
                    <CardDescription className="mt-2">{metric.description}</CardDescription>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "timeline":
        if (props.timelineType === "gtm") {
          return <GTMTimeline />;
        }
        return <BuildAndRampTimeline />;

      case "comparison-table":
        return <ComparisonTable data={props.data} columns={props.columns} />;

      case "testimonial-carousel":
        return <TestimonialCarousel testimonials={props.testimonials} />;

      case "badge-grid":
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            {props.badges?.map((badge: string, idx: number) => (
              <Badge key={idx} variant={props.variant || "secondary"}>
                {badge}
              </Badge>
            ))}
          </div>
        );

      case "icon-grid":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {props.items?.map((item: any, idx: number) => (
              <div key={idx} className="text-center space-y-3">
                <div className="flex justify-center">
                  {item.icon && <div className="text-4xl">{item.icon}</div>}
                </div>
                <h4 className="font-semibold">{item.title}</h4>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              </div>
            ))}
          </div>
        );

      case "calculator":
        return <MiniCalculator />;

      case "stat-counter":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {props.stats?.map((stat: any, idx: number) => (
              <div key={idx} className="text-center space-y-2">
                <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                  <AnimatedCounter end={stat.value} duration={2000} />
                  {stat.suffix}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        );

      case "cta-block":
        return (
          <Card className="text-center p-12 bg-gradient-to-br from-red-500/10 to-purple-500/10 border-2">
            <CardHeader>
              <CardTitle className="text-3xl">{props.ctaHeading}</CardTitle>
              <CardDescription className="text-lg">{props.ctaDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-2xl transition-all">
                {props.ctaButtonText || "Get Started"}
              </button>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Component type "{componentType}" not yet implemented</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {heading && (
        <h2 className="text-4xl font-bold text-center" style={{ color: director?.textColor }}>
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-xl text-center text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
      <div className="max-w-6xl mx-auto">
        {renderComponent()}
      </div>
    </div>
  );
}
