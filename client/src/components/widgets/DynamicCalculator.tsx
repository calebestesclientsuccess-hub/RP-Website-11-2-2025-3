import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CalculatorConfig } from "@shared/schema";

interface DynamicCalculatorProps {
  config: CalculatorConfig;
  className?: string;
}

export function DynamicCalculator({ config, className }: DynamicCalculatorProps) {
  const [inputValues, setInputValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    config.inputs.forEach((input) => {
      initial[input.name] = input.defaultValue;
    });
    return initial;
  });

  const [formulaError, setFormulaError] = useState<string | null>(null);

  const result = useMemo(() => {
    try {
      setFormulaError(null);
      const calculatorFunction = new Function("inputs", `return ${config.formula}`);
      const calculatedValue = calculatorFunction(inputValues);
      
      if (typeof calculatedValue !== "number" || !isFinite(calculatedValue)) {
        throw new Error("Invalid result");
      }
      
      return calculatedValue;
    } catch (error) {
      setFormulaError("Invalid formula");
      return 0;
    }
  }, [inputValues, config.formula]);

  const handleInputChange = (name: string, value: number) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <CardDescription>{config.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {config.inputs.map((input) => (
          <div key={input.name} className="space-y-2">
            {input.type === "number" && (
              <>
                <Label htmlFor={`input-${input.name}`}>{input.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`input-${input.name}`}
                    type="number"
                    value={inputValues[input.name]}
                    onChange={(e) =>
                      handleInputChange(input.name, parseFloat(e.target.value) || 0)
                    }
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    data-testid={`input-${input.name}`}
                    className="flex-1"
                  />
                  {input.unit && (
                    <span className="text-sm text-muted-foreground" data-testid={`unit-${input.name}`}>
                      {input.unit}
                    </span>
                  )}
                </div>
              </>
            )}

            {input.type === "slider" && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor={`input-${input.name}`}>{input.label}</Label>
                  <span className="text-sm font-medium" data-testid={`value-${input.name}`}>
                    {inputValues[input.name]}
                    {input.unit && ` ${input.unit}`}
                  </span>
                </div>
                <Slider
                  id={`input-${input.name}`}
                  value={[inputValues[input.name]]}
                  onValueChange={(values) => handleInputChange(input.name, values[0])}
                  min={input.min || 0}
                  max={input.max || 100}
                  step={input.step || 1}
                  data-testid={`slider-${input.name}`}
                  className="w-full"
                />
              </>
            )}

            {input.type === "toggle" && (
              <div className="flex items-center justify-between">
                <Label htmlFor={`input-${input.name}`}>{input.label}</Label>
                <Switch
                  id={`input-${input.name}`}
                  checked={inputValues[input.name] === 1}
                  onCheckedChange={(checked) =>
                    handleInputChange(input.name, checked ? 1 : 0)
                  }
                  data-testid={`toggle-${input.name}`}
                />
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{config.resultLabel}</span>
            {formulaError ? (
              <span className="text-sm text-destructive" data-testid="result-error">
                {formulaError}
              </span>
            ) : (
              <span className="text-2xl font-bold" data-testid="result-value">
                {result.toLocaleString()}
                {config.resultUnit && ` ${config.resultUnit}`}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
