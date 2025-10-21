import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroROICalculator() {
  const [acv, setAcv] = useState([75000]);
  const [closeRate, setCloseRate] = useState([30]);

  const appointmentsPerMonth = 20;
  const appointmentsPerYear = appointmentsPerMonth * 12;

  const pipelinePerMonth = appointmentsPerMonth * acv[0];
  const closedDealsPerYear = appointmentsPerYear * (closeRate[0] / 100);
  const annualizedRevenue = closedDealsPerYear * acv[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
          <h3 className="text-2xl font-bold mb-1">ROI Calculator</h3>
          <p className="text-xs text-muted-foreground">
            Adjust to see your potential revenue
          </p>
        </div>

        <div className="space-y-4">
          {/* ACV Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Average Contract Value</label>
              <span className="text-sm font-mono font-bold text-primary" data-testid="text-acv-value">
                {formatCurrency(acv[0])}
              </span>
            </div>
            <Slider
              value={acv}
              onValueChange={setAcv}
              min={10000}
              max={500000}
              step={5000}
              data-testid="slider-acv"
            />
          </div>

          {/* Close Rate Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Close Rate</label>
              <span className="text-sm font-mono font-bold text-primary" data-testid="text-close-rate-value">
                {closeRate[0]}%
              </span>
            </div>
            <Slider
              value={closeRate}
              onValueChange={setCloseRate}
              min={10}
              max={80}
              step={5}
              data-testid="slider-close-rate"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-5 pt-5 border-t border-border space-y-3">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Projected Annual Revenue</p>
            <p className="text-3xl font-bold text-primary font-mono" data-testid="text-projected-revenue">
              {formatCurrency(annualizedRevenue)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Appointments/Year</p>
              <p className="text-lg font-bold font-mono" data-testid="text-appointments">
                {appointmentsPerYear}
              </p>
            </div>
            <div className="bg-card/50 p-3 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Pipeline/Month</p>
              <p className="text-lg font-bold font-mono" data-testid="text-pipeline">
                {formatCurrency(pipelinePerMonth)}
              </p>
            </div>
          </div>

          <Button 
            size="default" 
            className="w-full gap-2" 
            variant="default"
            data-testid="button-full-calculator"
            asChild
          >
            <Link href="/results/roi-calculator">
              See Full Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
