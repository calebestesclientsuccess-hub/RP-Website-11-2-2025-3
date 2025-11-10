
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertTriangle, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export function InternalHireCostCalculator() {
  const [baseSalary, setBaseSalary] = useState([50000]);
  const [onboardingMonths, setOnboardingMonths] = useState([3]);
  
  // Cost calculations
  const bonus = 20000; // Fixed bonus to reach $70K OTE
  const totalCompensation = baseSalary[0] + bonus;
  const benefits = baseSalary[0] * 0.40; // 40% of base salary for benefits (insurance, 401k, etc.)
  const recruiterFee = totalCompensation * 0.22; // 22% recruiter fee on total comp
  const onboardingCost = (totalCompensation / 12) * onboardingMonths[0]; // Lost productivity during onboarding
  const managementTax = 22000; // Annual management time cost (meetings, reviews, coaching)
  const toolsAndLicenses = 12000; // Annual cost for tools (ZoomInfo, Outreach, etc.)
  
  const totalFirstYearCost = baseSalary[0] + bonus + benefits + recruiterFee + onboardingCost + managementTax + toolsAndLicenses;
  const turnoverRisk = totalFirstYearCost * 0.30; // 30% weighted risk of replacement cost
  const totalWithRisk = totalFirstYearCost + turnoverRisk;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="p-6 md:p-8 bg-card/95 backdrop-blur-sm border-destructive/30" data-testid="card-internal-hire-calculator">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h3 className="text-2xl md:text-3xl font-bold">The True Cost of 1 Internal SDR</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This is what you're actually paying for <span className="font-semibold text-destructive">just one SDR/BDR</span> hire
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-base font-semibold">Base Salary</Label>
                <span className="text-lg font-mono font-bold gradient-text gradient-hero" data-testid="text-base-salary">
                  {formatCurrency(baseSalary[0])}
                </span>
              </div>
              <Slider
                value={baseSalary}
                onValueChange={setBaseSalary}
                min={40000}
                max={100000}
                step={5000}
                data-testid="slider-base-salary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$40k</span>
                <span>$100k</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                + {formatCurrency(bonus)} bonus = <span className="font-semibold">{formatCurrency(totalCompensation)} OTE</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <Label className="text-base font-semibold">Onboarding Period (months)</Label>
                <span className="text-lg font-mono font-bold gradient-text gradient-hero" data-testid="text-onboarding-months">
                  {onboardingMonths[0]}
                </span>
              </div>
              <Slider
                value={onboardingMonths}
                onValueChange={setOnboardingMonths}
                min={2}
                max={6}
                step={1}
                data-testid="slider-onboarding-months"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2 months</span>
                <span>6 months</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Salary:</span>
                <span className="font-mono">{formatCurrency(baseSalary[0])}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus (OTE):</span>
                <span className="font-mono">{formatCurrency(bonus)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Benefits (40%):</span>
                <span className="font-mono">{formatCurrency(benefits)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recruiter Fee (22%):</span>
                <span className="font-mono">{formatCurrency(recruiterFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Onboarding Cost:</span>
                <span className="font-mono">{formatCurrency(onboardingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Management Tax:</span>
                <span className="font-mono">{formatCurrency(managementTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tools & Licenses:</span>
                <span className="font-mono">{formatCurrency(toolsAndLicenses)}</span>
              </div>
            </div>

            {/* Missing Support Systems Warning */}
            <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                What You're NOT Getting:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• No AI-powered research & personalization at scale</li>
                <li>• No elite coaching to accelerate ramp & performance</li>
                <li>• No RevOps support for tech stack optimization</li>
                <li>• No community & competition (vital for SDR motivation)</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-muted/50 rounded-lg border border-border"
            >
              <p className="text-sm text-muted-foreground mb-2">First Year Cost for <span className="font-bold text-foreground">1 SDR</span></p>
              <p className="text-3xl md:text-4xl font-bold font-mono gradient-text gradient-hero" data-testid="text-total-first-year">
                {formatCurrency(totalFirstYearCost)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-6 bg-destructive/10 rounded-lg border-2 border-destructive/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-semibold text-destructive">Including Replacement Risk (30%)</p>
              </div>
              <p className="text-4xl md:text-5xl font-bold font-mono text-destructive" data-testid="text-total-with-risk">
                {formatCurrency(totalWithRisk)}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                That's <span className="font-bold text-destructive text-sm">$198K for just 1 SDR</span> when you factor in the risk of them leaving or failing
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                And you get zero guarantee they'll perform.
              </p>
            </motion.div>

            {/* Hidden Costs Warning */}
            <div className="p-4 bg-card/50 rounded-lg border border-border">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Hidden Costs Not Included:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Lost revenue during 3-6 month ramp period</li>
                <li>• Opportunity cost of management time</li>
                <li>• Failed pipeline if hire doesn't work out</li>
                <li>• Cost to restart hiring process (avg. 2-3x)</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
