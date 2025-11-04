import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function SimpleCalculator() {
  const [monthlyValue, setMonthlyValue] = useState<number>(5000);
  const [conversionRate, setConversionRate] = useState<number>(2);

  const annualValue = monthlyValue * 12;
  const salesNeeded = Math.ceil(100 / conversionRate);
  const opportunitiesNeeded = salesNeeded * 3;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="monthly-value" className="text-sm font-medium text-foreground">
            Monthly Revenue Target ($)
          </Label>
          <Input
            id="monthly-value"
            type="number"
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(Number(e.target.value))}
            className="mt-1.5"
            data-testid="input-monthly-value"
          />
        </div>

        <div>
          <Label htmlFor="conversion-rate" className="text-sm font-medium text-foreground">
            Conversion Rate (%)
          </Label>
          <Input
            id="conversion-rate"
            type="number"
            step="0.1"
            value={conversionRate}
            onChange={(e) => setConversionRate(Number(e.target.value))}
            className="mt-1.5"
            data-testid="input-conversion-rate"
          />
        </div>
      </div>

      {/* Results */}
      <Card className="p-5 bg-card">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Annual Revenue
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-[hsl(0,85%,38%)] via-[hsl(0,85%,48%)] to-[hsl(340,85%,58%)] bg-clip-text text-transparent" data-testid="text-annual-revenue">
              ${annualValue.toLocaleString()}
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Pipeline Requirements
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sales Needed:</span>
                <span className="font-semibold text-foreground" data-testid="text-sales-needed">{salesNeeded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opportunities Needed:</span>
                <span className="font-semibold text-foreground" data-testid="text-opportunities-needed">{opportunitiesNeeded}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
