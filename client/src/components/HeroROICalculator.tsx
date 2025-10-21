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
    <div className="relative w-full max-w-2xl">
      {/* Glow effect layers */}
      <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute -inset-3 bg-primary/10 rounded-2xl blur-xl"></div>
      
      <Card className="p-12 bg-card/95 backdrop-blur-md border-primary/40 shadow-2xl relative" data-testid="card-hero-roi">
        <div className="mb-10">
          <h3 className="text-4xl font-bold mb-3">ROI Calculator</h3>
          <p className="text-base text-muted-foreground">
            Interactive tool: Adjust to see your potential revenue
          </p>
        </div>

        <div className="space-y-8">
          {/* ACV Slider */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-lg font-medium">Average Contract Value</label>
              <span className="text-lg font-mono font-bold text-primary" data-testid="text-acv-value">
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
              className="py-2"
            />
          </div>

          {/* Close Rate Slider */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-lg font-medium">Close Rate</label>
              <span className="text-lg font-mono font-bold text-primary" data-testid="text-close-rate-value">
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
              className="py-2"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-10 pt-10 border-t border-border space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Projected Annual Revenue</p>
            <p className="text-4xl font-bold text-primary font-mono" data-testid="text-projected-revenue">
              {formatCurrency(annualizedRevenue)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Appointments/Year</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-appointments">
                {appointmentsPerYear}
              </p>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Pipeline/Month</p>
              <p className="text-2xl font-bold font-mono" data-testid="text-pipeline">
                {formatCurrency(pipelinePerMonth)}
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full gap-2 text-base py-6" 
            variant="default"
            data-testid="button-full-calculator"
            asChild
          >
            <Link href="/results/roi-calculator">
              See Full Analysis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
