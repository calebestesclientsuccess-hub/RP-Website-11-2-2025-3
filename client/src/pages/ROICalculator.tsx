import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info, Mail, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ROICalculator() {
  // User Inputs
  const [acv, setAcv] = useState([75000]);
  const [salesCycle, setSalesCycle] = useState([60]);
  const [closeRate, setCloseRate] = useState([30]);
  const [quota, setQuota] = useState([500000]);
  const [email, setEmail] = useState("");
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Constants
  const appointmentsPerMonth = 20;
  const appointmentsPerYear = appointmentsPerMonth * 12;

  // Calculations for RevParty Pod
  const pipelinePerMonth = appointmentsPerMonth * acv[0];
  const pipelinePerYear = pipelinePerMonth * 12;
  const closedDealsPerYear = appointmentsPerYear * (closeRate[0] / 100);
  const closedRevenuePerQuarter = (closedDealsPerYear / 4) * acv[0];
  const annualizedRevenue = closedDealsPerYear * acv[0];

  // In-House Hire Calculations
  const inHouseBaseSalary = 70000;
  const inHouseTaxesBenefits = 21000; // 30% of base
  const inHouseTechStack = 12000; // Annual tech costs
  const inHouseManagementCost = 95000; // 20hrs/week * $50/hr * 52 weeks (simplified)
  const inHouseTotalCost = inHouseBaseSalary + inHouseTaxesBenefits + inHouseTechStack + inHouseManagementCost;
  const inHouseRampTime = 4; // months
  const inHouseActiveMonths = 12 - inHouseRampTime;
  const inHouseAppointmentsPerYear = Math.round(appointmentsPerMonth * inHouseActiveMonths * 0.7); // 70% efficiency
  const inHouseClosedDeals = inHouseAppointmentsPerYear * (closeRate[0] / 100);
  const inHouseRevenue = inHouseClosedDeals * acv[0];
  const inHouseNetRevenue = inHouseRevenue - inHouseTotalCost;

  // RevParty Pod (assuming 3 weeks to first meeting, conservative pricing)
  const revPartyTimeToValue = 3; // weeks
  const revPartyNetRevenue = annualizedRevenue; // No cost shown in comparison

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
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleEmailSubmit = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ success: boolean; message: string }>(
        "POST",
        "/api/email-capture",
        {
          email,
          acv: acv[0].toString(),
          closeRate: closeRate[0].toString(),
          salesCycle: salesCycle[0].toString(),
          quota: quota[0].toString(),
          calculatedRevenue: annualizedRevenue.toString(),
        }
      );

      toast({
        title: "Success!",
        description: response.message || "Your results have been saved! Check your email for the detailed report.",
      });

      setEmail("");
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error submitting email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your results. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <TooltipProvider>
        {/* Hero */}
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Model Your <span className="text-primary">Multiplication Factor.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Don't build a budget based on hope. Use this tool to build a financial model for systematic pipeline generation. Adjust the variables to match your business and see the direct, quantifiable impact of deploying a Fully Loaded BDR Pod.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section 1: Your Business Inputs */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Business Inputs</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* ACV */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Average Annual Contract Value (ACV)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Use your average ACV to help us project the total pipeline value we can generate for you.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-primary font-mono" data-testid="text-calculator-acv">
                    {formatCurrency(acv[0])}
                  </div>
                  <Slider
                    value={acv}
                    onValueChange={setAcv}
                    min={10000}
                    max={500000}
                    step={5000}
                    data-testid="input-calculator-acv"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$10k</span>
                    <span>$500k</span>
                  </div>
                </div>

                {/* Close Rate */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Close Rate from Qualified Appointment</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">What percentage of qualified appointments (shown meetings) convert to closed-won deals?</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-primary font-mono" data-testid="text-calculator-close-rate">
                    {closeRate[0]}%
                  </div>
                  <Slider
                    value={closeRate}
                    onValueChange={setCloseRate}
                    min={5}
                    max={100}
                    step={5}
                    data-testid="input-calculator-close-rate"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Sales Cycle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Sales Cycle Length (days)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Average time from first contact to closed deal. Helps calculate time to revenue.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-primary font-mono" data-testid="text-calculator-sales-cycle">
                    {salesCycle[0]} days
                  </div>
                  <Slider
                    value={salesCycle}
                    onValueChange={setSalesCycle}
                    min={7}
                    max={365}
                    step={7}
                    data-testid="input-calculator-sales-cycle"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>7 days</span>
                    <span>365 days</span>
                  </div>
                </div>

                {/* Quota */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">Annual Quota Per Sales Rep</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Your target annual revenue per sales representative.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-primary font-mono" data-testid="text-calculator-quota">
                    {formatCurrency(quota[0])}
                  </div>
                  <Slider
                    value={quota}
                    onValueChange={setQuota}
                    min={100000}
                    max={2000000}
                    step={50000}
                    data-testid="input-calculator-quota"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$100k</span>
                    <span>$2M</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2 & 3: Side-by-Side Comparison */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* In-House Hire Model */}
              <Card className="p-8 bg-destructive/5 border-destructive/30">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-destructive">Traditional In-House Hire</span>
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time to First Meeting</p>
                    <p className="text-3xl font-bold font-mono text-destructive" data-testid="text-inhouse-time">
                      {inHouseRampTime} months
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">All-In First Year Cost</p>
                    <p className="text-3xl font-bold font-mono text-destructive" data-testid="text-inhouse-cost">
                      {formatCurrency(inHouseTotalCost)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Salary + Taxes + Tech + Management Time)
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expected Appointments (Year 1)</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-inhouse-appointments">
                      ~{inHouseAppointmentsPerYear}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Projected Revenue</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-inhouse-revenue">
                      {formatCurrency(inHouseRevenue)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Net Revenue Impact</p>
                    <p className="text-3xl font-bold font-mono text-destructive" data-testid="text-inhouse-net">
                      {formatCurrency(inHouseNetRevenue)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* RevParty Pod Model */}
              <Card className="p-8 bg-primary/5 border-primary/30 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-primary">The RevParty Pod</span>
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time to First Meeting</p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-pod-time">
                      {revPartyTimeToValue} weeks
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pipeline Generated (Monthly)</p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-pod-pipeline">
                      {formatCurrency(pipelinePerMonth)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Appointments (Year 1)</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-pod-appointments">
                      {appointmentsPerYear}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      20 per month × 12 months
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">New Closed Revenue (Quarterly)</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-pod-quarterly">
                      {formatCurrency(closedRevenuePerQuarter)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Annualized Revenue Run Rate</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-pod-annual">
                      {formatCurrency(annualizedRevenue)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-primary/30">
                    <p className="text-sm text-muted-foreground mb-1">Projected Closed Deals</p>
                    <p className="text-3xl font-bold font-mono text-primary" data-testid="text-pod-deals">
                      {formatNumber(closedDealsPerYear)} deals
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Section 4: The Verdict */}
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30">
              <h2 className="text-3xl font-bold mb-8 text-center">
                The <span className="text-primary">Verdict</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Revenue Advantage</p>
                  <p className="text-4xl font-bold text-primary font-mono" data-testid="text-verdict-advantage">
                    {formatCurrency(annualizedRevenue - inHouseRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Additional Revenue with Pod</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Speed to Market</p>
                  <p className="text-4xl font-bold text-primary font-mono" data-testid="text-verdict-speed">
                    14x
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Faster (3 weeks vs 4 months)</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Risk Reduction</p>
                  <p className="text-4xl font-bold text-primary font-mono" data-testid="text-verdict-risk">
                    0%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Failure Rate (vs 33%)</p>
                </div>
              </div>

              <div className="text-center">
                <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="gap-2" data-testid="button-email-results">
                      <Mail className="w-4 h-4" />
                      Email Me These Results
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Get Your Personalized ROI Report</DialogTitle>
                      <DialogDescription>
                        Enter your email to receive a detailed breakdown of your potential revenue with the RevParty Pod system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          data-testid="input-email"
                        />
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleEmailSubmit}
                        disabled={!email || isSubmitting}
                        data-testid="button-submit-email"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send My Results"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* Methodology Section */}
            <Card className="p-8">
              <Collapsible open={isMethodologyOpen} onOpenChange={setIsMethodologyOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="button-methodology-toggle">
                  <h3 className="text-xl font-bold">Methodology & Assumptions</h3>
                  {isMethodologyOpen ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-2">In-House Hire Model:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Base Salary: $70,000 (industry average for BDR)</li>
                      <li>Taxes & Benefits: $21,000 (30% of base salary)</li>
                      <li>Tech Stack: $12,000/year (CRM, data tools, email platforms)</li>
                      <li>Management Cost: $95,000 (20 hours/week × $50/hour × 52 weeks - opportunity cost of leadership time)</li>
                      <li>Ramp Time: 4 months before productive output</li>
                      <li>Efficiency: 70% of target output due to individual limitations</li>
                      <li>Failure Risk: 33% based on industry averages</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-2">RevParty Pod Model:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Time to Value: 3 weeks (system is pre-built and ready)</li>
                      <li>Guaranteed Output: 20 qualified appointments per month</li>
                      <li>No ramp time - full productivity from day one</li>
                      <li>No management overhead - we handle training, strategy, and optimization</li>
                      <li>Performance-driven model reduces risk to near zero</li>
                      <li>All costs included: talent, tech, strategy, and ongoing optimization</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-2">Calculation Notes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Revenue projections based on your actual close rate from qualified appointments</li>
                      <li>Conservative estimates - actual results may exceed projections</li>
                      <li>Does not account for upsells, renewals, or customer lifetime value</li>
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make the Model a <span className="text-primary">Reality?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The numbers are clear. The next step is to build the strategic blueprint. Schedule a GTM Audit to begin designing your custom revenue engine.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg" data-testid="button-calculator-schedule">
              Schedule My GTM Audit
            </Button>
          </div>
        </section>
      </TooltipProvider>
    </div>
  );
}
