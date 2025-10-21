import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroROICalculator() {
  const [acv, setAcv] = useState([75000]);
  const [salesCycle, setSalesCycle] = useState([60]);
  const [closeRate, setCloseRate] = useState([30]);
  const [quota, setQuota] = useState([500000]);

  const appointmentsPerMonth = 20;
  const appointmentsPerYear = appointmentsPerMonth * 12;

  const pipelinePerMonth = appointmentsPerMonth * acv[0];
  const pipelinePerYear = pipelinePerMonth * 12;
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
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl" data-testid="card-hero-roi">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Calculate Your ROI</h3>
        <p className="text-sm text-muted-foreground">
          See what a BDR Pod could generate for your business
        </p>
      </div>

      <div className="space-y-5">
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

        {/* Sales Cycle Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Sales Cycle (days)</label>
            <span className="text-sm font-mono font-bold text-primary" data-testid="text-sales-cycle-value">
              {salesCycle[0]}
            </span>
          </div>
          <Slider
            value={salesCycle}
            onValueChange={setSalesCycle}
            min={15}
            max={365}
            step={15}
            data-testid="slider-sales-cycle"
          />
        </div>

        {/* Quota Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">Annual Quota</label>
            <span className="text-sm font-mono font-bold text-primary" data-testid="text-quota-value">
              {formatCurrency(quota[0])}
            </span>
          </div>
          <Slider
            value={quota}
            onValueChange={setQuota}
            min={250000}
            max={5000000}
            step={50000}
            data-testid="slider-quota"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 pt-6 border-t border-border space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Projected Annual Revenue</p>
          <p className="text-2xl font-bold text-primary font-mono" data-testid="text-projected-revenue">
            {formatCurrency(annualizedRevenue)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Appointments/Year</p>
            <p className="text-lg font-bold font-mono" data-testid="text-appointments">
              {appointmentsPerYear}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pipeline/Month</p>
            <p className="text-lg font-bold font-mono" data-testid="text-pipeline">
              {formatCurrency(pipelinePerMonth)}
            </p>
          </div>
        </div>

        <Button 
          size="sm" 
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
  );
}
