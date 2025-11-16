
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WebVitalMetric {
  name: string;
  avg_value: number;
  p75: number;
  p95: number;
  sample_count: number;
  good_rate_percent: number;
}

export function WebVitalsDashboard() {
  const { data: metrics, isLoading } = useQuery<WebVitalMetric[]>({
    queryKey: ['/api/analytics/web-vitals/summary'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getMetricThreshold = (name: string) => {
    const thresholds: Record<string, { good: number; poor: number; unit: string }> = {
      'LCP': { good: 2500, poor: 4000, unit: 'ms' },
      'INP': { good: 200, poor: 500, unit: 'ms' },
      'CLS': { good: 0.1, poor: 0.25, unit: '' },
      'FCP': { good: 1800, poor: 3000, unit: 'ms' },
      'TTFB': { good: 800, poor: 1800, unit: 'ms' },
    };
    return thresholds[name] || { good: 0, poor: 0, unit: '' };
  };

  const getRatingBadge = (value: number, name: string) => {
    const { good, poor } = getMetricThreshold(name);
    if (value <= good) return <Badge variant="default" className="bg-green-500">Good</Badge>;
    if (value <= poor) return <Badge variant="secondary">Needs Improvement</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  if (isLoading) {
    return <div>Loading Web Vitals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics?.map((metric) => {
          const threshold = getMetricThreshold(metric.name);
          const trend = metric.good_rate_percent >= 75 ? 'up' : metric.good_rate_percent >= 50 ? 'neutral' : 'down';
          
          return (
            <Card key={metric.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{metric.name}</span>
                  {getRatingBadge(metric.p75, metric.name)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">P75 Value</p>
                  <p className="text-2xl font-bold">
                    {metric.p75.toFixed(0)}{threshold.unit}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Average</p>
                    <p className="font-semibold">{metric.avg_value.toFixed(0)}{threshold.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P95</p>
                    <p className="font-semibold">{metric.p95.toFixed(0)}{threshold.unit}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Good Experiences</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{metric.good_rate_percent.toFixed(1)}%</span>
                      {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {trend === 'neutral' && <Minus className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.sample_count} samples (7 days)
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
