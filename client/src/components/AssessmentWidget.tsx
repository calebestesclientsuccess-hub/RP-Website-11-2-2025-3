import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface AssessmentWidgetProps {
  mode?: "inline" | "standalone";
}

export function AssessmentWidget({ mode = "standalone" }: AssessmentWidgetProps) {
  const [, setLocation] = useLocation();
  const [showQ2, setShowQ2] = useState(false);

  const handleSimpleChoice = () => {
    setLocation("/resources/gtm-assessment/path-1?q1=simple");
  };

  const handleComplexChoice = () => {
    setShowQ2(true);
  };

  const handleInvestmentChoice = (q2Value: string) => {
    const pathMap: Record<string, string> = {
      low: "path-2",
      target: "path-3",
      enterprise: "path-4",
    };
    const path = pathMap[q2Value];
    setLocation(`/resources/gtm-assessment/${path}?q1=complex&q2=${q2Value}`);
  };

  return (
    <Card className="border-2 hover-elevate overflow-visible" data-testid="card-assessment-widget">
      <CardHeader>
        <CardTitle className="text-2xl">
          {showQ2 ? "Question 2: Investment Level" : "Question 1: Value Proposition Complexity"}
        </CardTitle>
        <CardDescription>
          {showQ2
            ? "What's your monthly investment capacity for outbound sales?"
            : "How would you describe your product's value proposition?"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!showQ2 ? (
          <>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between text-left h-auto py-4 px-6"
              onClick={handleSimpleChoice}
              data-testid="button-q1-simple"
            >
              <div className="flex-1">
                <div className="font-semibold mb-1">Simple Value Prop</div>
                <div className="text-sm text-muted-foreground">
                  Easy to explain, clear benefits, fast decision-making
                </div>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between text-left h-auto py-4 px-6"
              onClick={handleComplexChoice}
              data-testid="button-q1-complex"
            >
              <div className="flex-1">
                <div className="font-semibold mb-1">Complex Value Prop</div>
                <div className="text-sm text-muted-foreground">
                  Requires education, multiple stakeholders, longer sales cycle
                </div>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between text-left h-auto py-4 px-6"
              onClick={() => handleInvestmentChoice("low")}
              data-testid="button-q2-low"
            >
              <div className="flex-1">
                <div className="font-semibold mb-1">Low Budget</div>
                <div className="text-sm text-muted-foreground">
                  $5k-$15k per month
                </div>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between text-left h-auto py-4 px-6"
              onClick={() => handleInvestmentChoice("target")}
              data-testid="button-q2-target"
            >
              <div className="flex-1">
                <div className="font-semibold mb-1">Target Budget</div>
                <div className="text-sm text-muted-foreground">
                  $15k-$40k per month
                </div>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between text-left h-auto py-4 px-6"
              onClick={() => handleInvestmentChoice("enterprise")}
              data-testid="button-q2-enterprise"
            >
              <div className="flex-1">
                <div className="font-semibold mb-1">Enterprise Budget</div>
                <div className="text-sm text-muted-foreground">
                  $40k+ per month
                </div>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
