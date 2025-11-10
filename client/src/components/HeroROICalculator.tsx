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
  const [monthlyInvestment, setMonthlyInvestment] = useState([15000]);
  const [, setLocation] = useLocation();

  // Calculate guaranteed meetings based on investment
  // Base: $15K = 20 meetings, each additional $7.5K = +10 meetings
  const investmentIncrement = (monthlyInvestment[0] - 15000) / 7500;
  const guaranteedSQOs = 20 + (investmentIncrement * 10);
  
  // Annual calculations (11 months, excluding December for training)
  const annualInvestment = monthlyInvestment[0] * 12;
  const annualSQOs = guaranteedSQOs * 11; // Dynamic: monthly meetings × 11 months

  const closedDealsPerMonth = guaranteedSQOs * (closeRate[0] / 100);
  const projectedLTVPerMonth = closedDealsPerMonth * ltv[0];
  const roi = projectedLTVPerMonth / monthlyInvestment[0];
  
  const closedDealsPerYear = annualSQOs * (closeRate[0] / 100);
  const projectedLTVPerYear = closedDealsPerYear * ltv[0];
  const annualROI = projectedLTVPerYear / annualInvestment;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`;
    }
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
      
      <Card className="p-5 bg-card/95 backdrop-blur-md border-primary/40 shadow-2xl relative" data-testid="card-hero-roi">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">The $15K Investment That Returns 40x</h3>
          <p className="text-xs text-muted-foreground">
            Adjust for your business to see the math
          </p>
        </div>

        <div className="space-y-3">
          {/* Investment Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium">Monthly Investment</label>
              <span className="text-xs font-mono font-bold text-muted-foreground" data-testid="text-investment-value">
                {formatCurrency(monthlyInvestment[0])}
              </span>
            </div>
            <Slider
              value={monthlyInvestment}
              onValueChange={setMonthlyInvestment}
              min={15000}
              max={45000}
              step={7500}
              data-testid="slider-investment"
            />
          </div>

          {/* LTV Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium">2-Year Client Value</label>
              <span className="text-xs font-mono font-bold text-muted-foreground" data-testid="text-ltv-value">
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
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium">Close Rate from Real Opportunity</label>
              <span className="text-xs font-mono font-bold text-muted-foreground" data-testid="text-close-rate-value">
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
        <div className="mt-4 pt-4 border-t border-border space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/50 p-2.5 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-0.5">Real Opportunities Each Month</p>
              <p className="text-base font-bold font-mono" data-testid="text-guaranteed-sqos">
                {guaranteedSQOs}
              </p>
            </div>
            <div className="bg-card/50 p-2.5 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-0.5">Monthly ROI</p>
              <p className="text-base font-bold font-mono" data-testid="text-roi">
                {formatNumber(roi)}x
              </p>
            </div>
          </div>

          {/* Side by side revenue metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-0.5">Additional Monthly Revenue</p>
              <p className="text-xl font-bold font-mono" data-testid="text-projected-ltv">
                {formatCurrency(projectedLTVPerMonth)}
              </p>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg border border-primary/30">
              <p className="text-xs text-muted-foreground mb-0.5">Additional Annual Revenue</p>
              <p className="text-xl font-bold font-mono" data-testid="text-projected-ltv-annual">
                {formatCurrency(projectedLTVPerYear)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimation based on 220 meetings*<br />
                <span className="italic">*December excluded for training</span>
              </p>
            </div>
          </div>

          <Button 
            size="default" 
            className="w-full gap-2" 
            variant="tertiary"
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
