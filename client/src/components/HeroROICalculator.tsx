import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeroROICalculatorProps {
  testIdSuffix?: string;
}

export function HeroROICalculator({ testIdSuffix = "" }: HeroROICalculatorProps) {
  const [ltv, setLtv] = useState([120000]);
  const [closeRate, setCloseRate] = useState([25]);
  const [, setLocation] = useLocation();

  const monthlyInvestment = 15000;
  const guaranteedSQOs = 40;
  const costPerMeeting = monthlyInvestment / guaranteedSQOs;

  const closedDealsPerMonth = guaranteedSQOs * (closeRate[0] / 100);
  const projectedLTVPerMonth = closedDealsPerMonth * ltv[0];
  const roi = projectedLTVPerMonth / monthlyInvestment;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Glow effect layers */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-2xl blur-2xl opacity-50 animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute -inset-2 bg-primary/10 rounded-xl blur-xl"></div>
      
      <Card className="p-6 bg-card/95 backdrop-blur-md border-primary/40 shadow-2xl relative" data-testid="card-hero-roi">
        <div className="mb-5">
          <h3 className="text-2xl font-bold mb-1">My ROI: The GTM Engine</h3>
          <p className="text-xs text-muted-foreground">
            See the math behind the system
          </p>
        </div>

        <div className="space-y-4">
          {/* LTV Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Your 24-Month Client LTV</label>
              <span className="text-sm font-mono font-bold text-community" data-testid="text-ltv-value">
                {formatCurrency(ltv[0])}
              </span>
            </div>
            <Slider
              value={ltv}
              onValueChange={setLtv}
              min={10000}
              max={500000}
              step={5000}
              data-testid="slider-ltv"
            />
          </div>

          {/* Close Rate Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Close Rate from Qualified Meeting</label>
              <span className="text-sm font-mono font-bold text-community" data-testid="text-close-rate-value">
                {closeRate[0]}%
              </span>
            </div>
            <Slider
              value={closeRate}
              onValueChange={setCloseRate}
              min={5}
              max={50}
              step={5}
              data-testid="slider-close-rate"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-5 pt-5 border-t border-border space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Monthly Investment</p>
              <p className="text-lg font-bold font-mono" data-testid="text-monthly-investment">
                {formatCurrency(monthlyInvestment)}
              </p>
            </div>
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Guaranteed SQOs</p>
              <p className="text-lg font-bold font-mono" data-testid="text-guaranteed-sqos">
                {guaranteedSQOs}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Cost per Meeting</p>
              <p className="text-lg font-bold font-mono" data-testid="text-cost-per-meeting">
                {formatCurrency(costPerMeeting)}
              </p>
            </div>
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">ROI</p>
              <p className="text-lg font-bold font-mono text-community" data-testid="text-roi">
                {formatNumber(roi)}x
              </p>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Projected New LTV/Month</p>
            <p className="text-3xl font-bold text-community font-mono" data-testid="text-projected-ltv">
              {formatCurrency(projectedLTVPerMonth)}
            </p>
          </div>

          <Button 
            size="default" 
            className="w-full gap-2" 
            variant="default"
            data-testid={`button-full-calculator${testIdSuffix}`}
            onClick={() => setLocation(`/roi-calculator?ltv=${ltv[0]}&closeRate=${closeRate[0]}`)}
          >
            My Full Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
