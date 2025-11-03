import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiagnosticReadoutCardProps {
  pathName: string;
}

const valueMapping = {
  q1: {
    simple: "Simple Value Prop",
    complex: "Complex Value Prop",
  },
  q2: {
    low: "$5k-$15k/mo",
    target: "$15k-$40k/mo",
    enterprise: "$40k+/mo",
  },
};

export function DiagnosticReadoutCard({ pathName }: DiagnosticReadoutCardProps) {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q1 = params.get("q1");
  const q2 = params.get("q2");

  const q1Display = q1 ? valueMapping.q1[q1 as keyof typeof valueMapping.q1] || q1 : "Unknown";
  const q2Display = q2 ? valueMapping.q2[q2 as keyof typeof valueMapping.q2] || q2 : null;

  return (
    <Card className="border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-visible" data-testid="card-diagnostic-readout">
      <CardHeader>
        <CardTitle className="text-2xl">Your Assessment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" data-testid="readout-complexity">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Complexity
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-start))] via-[hsl(var(--gradient-mid))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
            {q1Display}
          </div>
        </div>
        {q2Display && (
          <div className="space-y-2" data-testid="readout-investment">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Investment Level
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-start))] via-[hsl(var(--gradient-mid))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
              {q2Display}
            </div>
          </div>
        )}
        <div className="pt-2">
          <Badge variant="secondary" data-testid="badge-path-name">
            {pathName}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
