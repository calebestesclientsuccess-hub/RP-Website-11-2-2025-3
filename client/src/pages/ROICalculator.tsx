import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  ArrowRight,
  Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type EngineOption = "lone-wolf" | "1-sdr" | "2-sdr" | "3-sdr";

interface EngineConfig {
  name: string;
  monthlyCost: number;
  guaranteedSQOs: number;
  reliability: string;
  isRecommended: boolean;
  description: string;
}

const engineConfigs: Record<EngineOption, EngineConfig> = {
  "lone-wolf": {
    name: 'Internal "Lone Wolf" Hire',
    monthlyCost: 16500,
    guaranteedSQOs: 0,
    reliability: "Single Point of Failure",
    isRecommended: false,
    description: "$198k/yr TCO"
  },
  "1-sdr": {
    name: "1-SDR GTM Engine",
    monthlyCost: 12500,
    guaranteedSQOs: 20,
    reliability: "Fully Resilient System",
    isRecommended: false,
    description: "20+ SQOs/month (from Month 5)"
  },
  "2-sdr": {
    name: "2-SDR GTM Pod",
    monthlyCost: 15000,
    guaranteedSQOs: 40,
    reliability: "Fully Resilient System",
    isRecommended: true,
    description: "40+ SQOs/month (from Month 5)"
  },
  "3-sdr": {
    name: "3-SDR GTM Pod",
    monthlyCost: 22500,
    guaranteedSQOs: 60,
    reliability: "Fully Resilient System",
    isRecommended: false,
    description: "60+ SQOs/month (from Month 5)"
  }
};

export default function ROICalculator() {
  const [ltv, setLtv] = useState([120000]);
  const [closeRate, setCloseRate] = useState([25]);
  const [selectedEngine, setSelectedEngine] = useState<EngineOption>("2-sdr");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [recipientEmails, setRecipientEmails] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ltvParam = params.get('ltv');
    const closeRateParam = params.get('closeRate');

    if (ltvParam) {
      const ltvValue = parseInt(ltvParam, 10);
      if (!isNaN(ltvValue) && ltvValue >= 10000 && ltvValue <= 500000) {
        setLtv([ltvValue]);
      }
    }

    if (closeRateParam) {
      const closeRateValue = parseInt(closeRateParam, 10);
      if (!isNaN(closeRateValue) && closeRateValue >= 5 && closeRateValue <= 50) {
        setCloseRate([closeRateValue]);
      }
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Calculate results based on selected engine
  const config = engineConfigs[selectedEngine];
  const monthlyInvestment = config.monthlyCost;
  const monthlySQOs = config.guaranteedSQOs;
  const costPerMeeting = monthlySQOs > 0 ? monthlyInvestment / monthlySQOs : 0;
  const projectedDealsPerMonth = monthlySQOs * (closeRate[0] / 100);
  const projectedLTVPerMonth = projectedDealsPerMonth * ltv[0];
  const monthlyROI = projectedLTVPerMonth > 0 ? projectedLTVPerMonth / monthlyInvestment : 0;

  const shareReportMutation = useMutation({
    mutationFn: async (emails: string) => {
      const reportData = {
        emails: emails.split(',').map(e => e.trim()).filter(e => e),
        ltv: ltv[0],
        closeRate: closeRate[0],
        selectedEngine,
        engineName: config.name,
        monthlyInvestment,
        monthlySQOs,
        costPerMeeting,
        projectedDealsPerMonth,
        projectedLTVPerMonth,
        monthlyROI
      };
      return apiRequest('/api/share-roi-report', {
        method: 'POST',
        body: JSON.stringify(reportData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Shared!",
        description: "Your ROI report has been sent successfully.",
      });
      setShareDialogOpen(false);
      setRecipientEmails("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleShareReport = () => {
    if (!recipientEmails.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate email formats
    const emails = recipientEmails.split(',').map(e => e.trim()).filter(e => e);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email Format",
        description: `Please check: ${invalidEmails.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    shareReportMutation.mutate(recipientEmails);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Calculate the ROI of a Guaranteed Sales Asset | Revenue Party"
        description="Stop guessing with $198k hires. Design a guaranteed revenue engine and see the 80x+ ROI. Compare internal hires vs. GTM Engine systems."
        keywords="ROI calculator, sales ROI, GTM engine calculator, BDR cost calculator, sales team ROI, guaranteed meetings"
        canonical="/roi-calculator"
      />

      {/* Hero Module */}
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4" variant="outline" data-testid="badge-calculator">
              <Calculator className="w-3 h-3 mr-1" />
              Interactive ROI Calculator
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-hero">
              Calculate the ROI of<br />
              <span className="gradient-text gradient-hero">a Guaranteed Sales Asset</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8" data-testid="text-hero-subtitle">
              Stop guessing with $198k hires. Design a guaranteed revenue engine and see the 80x+ ROI.
            </p>

            {/* Share Report Button */}
            <div className="flex justify-end max-w-7xl mx-auto">
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" data-testid="button-share-report">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share My Report
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-share-report">
                  <DialogHeader>
                    <DialogTitle>Share Your ROI Report</DialogTitle>
                    <DialogDescription>
                      Enter email addresses (comma-separated for multiple recipients) to share your customized ROI analysis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-recipients">Email Recipients</Label>
                      <Input
                        id="email-recipients"
                        placeholder="email@example.com, colleague@example.com"
                        value={recipientEmails}
                        onChange={(e) => setRecipientEmails(e.target.value)}
                        data-testid="input-email-recipients"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>

                    {/* Report Preview */}
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                      <p className="font-semibold">Report will include:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• LTV: {formatCurrency(ltv[0])}</li>
                        <li>• Close Rate: {closeRate[0]}%</li>
                        <li>• Selected Engine: {config.name}</li>
                        <li>• Monthly ROI: {monthlyROI > 0 ? `${formatNumber(monthlyROI, 0)}x` : '0x'}</li>
                        <li>• Projected LTV/Month: {projectedLTVPerMonth > 0 ? formatCurrency(projectedLTVPerMonth) : '$0'}</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShareDialogOpen(false)}
                      data-testid="button-cancel-share"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleShareReport}
                      disabled={shareReportMutation.isPending}
                      data-testid="button-send-report"
                    >
                      {shareReportMutation.isPending ? "Sending..." : "Send Report"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section - 2 Column Layout */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Column 1: Your Inputs */}
            <div className="space-y-6">
              {/* Part 1: Your Business Value */}
              <Card className="p-6" data-testid="card-business-value">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    Part 1: Your Business Value
                  </h2>
                  <p className="text-sm text-muted-foreground">The "Prize"</p>
                </div>

                <div className="space-y-6">
                  {/* Input 1: LTV */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Label className="text-base font-semibold">Your Avg. 24-Month Client LTV</Label>
                      <span className="text-lg font-mono font-bold gradient-text-purple" data-testid="text-ltv-value">
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>$10k</span>
                      <span>$500k</span>
                    </div>
                  </div>

                  {/* Input 2: Close Rate */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Label className="text-base font-semibold">Your Close Rate from a Qualified Meeting</Label>
                      <span className="text-lg font-mono font-bold gradient-text-purple" data-testid="text-close-rate-value">
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Part 2: Choose Your Engine */}
              <Card className="p-6" data-testid="card-engine-selection">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Part 2: Choose Your Engine
                  </h2>
                </div>

                <RadioGroup
                  value={selectedEngine}
                  onValueChange={(value) => setSelectedEngine(value as EngineOption)}
                  className="space-y-4"
                  data-testid="radio-group-engine"
                >
                  {(Object.keys(engineConfigs) as EngineOption[]).map((key) => {
                    const config = engineConfigs[key];
                    const isLoneWolf = key === "lone-wolf";

                    return (
                      <div
                        key={key}
                        className={`relative border rounded-lg p-4 hover-elevate transition-all ${
                          selectedEngine === key
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        } ${isLoneWolf ? 'border-destructive/30 bg-destructive/5' : ''}`}
                        data-testid={`radio-option-${key}`}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            value={key}
                            id={key}
                            className="mt-1"
                            data-testid={`radio-button-${key}`}
                          />
                          <Label
                            htmlFor={key}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-base">{config.name}</span>
                              {config.isRecommended && (
                                <Badge variant="default" className="text-xs" data-testid="badge-recommended">
                                  Recommended
                                </Badge>
                              )}
                              {isLoneWolf && (
                                <Badge variant="destructive" className="text-xs" data-testid="badge-warning">
                                  High Risk
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Cost: <span className="font-semibold text-foreground">{formatCurrency(config.monthlyCost)}/mo</span>
                                  {isLoneWolf && <span className="text-xs ml-1">({config.description})</span>}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Guaranteed SQOs: <span className="font-semibold text-foreground">
                                    {config.guaranteedSQOs > 0 ? `${config.guaranteedSQOs}/month` : '0'}
                                  </span>
                                  {!isLoneWolf && config.guaranteedSQOs > 0 && (
                                    <span className="text-xs ml-1">(from Month 5)</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isLoneWolf ? (
                                  <AlertTriangle className="w-4 h-4 text-destructive" />
                                ) : (
                                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                                <span className="text-muted-foreground">
                                  Reliability: <span className={`font-semibold ${
                                    isLoneWolf
                                      ? 'text-destructive'
                                      : 'text-green-600 dark:text-green-400'
                                  }`}>
                                    {config.reliability}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </Card>
            </div>

            {/* Column 2: The Results (Comparison Dashboard) */}
            <div className="space-y-6">
              <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-background" data-testid="card-results">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-primary" />
                    The Results
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Based on: {engineConfigs[selectedEngine].name}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Monthly Investment */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Investment</p>
                    <p className="text-2xl font-bold font-mono gradient-text-purple" data-testid="text-monthly-investment">
                      {formatCurrency(monthlyInvestment)}
                    </p>
                  </div>

                  {/* Monthly Guaranteed SQOs */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Guaranteed SQOs</p>
                    <p className="text-2xl font-bold font-mono gradient-text-purple" data-testid="text-monthly-sqos">
                      {monthlySQOs > 0 ? monthlySQOs : 'None'}
                    </p>
                    {monthlySQOs === 0 && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        No guarantee with internal hire
                      </p>
                    )}
                  </div>

                  {/* Cost per Guaranteed Meeting */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Your Cost per Guaranteed Meeting</p>
                    <p className="text-2xl font-bold font-mono gradient-text-purple" data-testid="text-cost-per-meeting">
                      {costPerMeeting > 0 ? formatCurrency(costPerMeeting) : 'N/A'}
                    </p>
                    {costPerMeeting === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cannot calculate without guaranteed meetings
                      </p>
                    )}
                  </div>

                  {/* Projected New Deals / Month */}
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Projected New Deals / Month (post-ramp)</p>
                    <p className="text-2xl font-bold font-mono" data-testid="text-projected-deals">
                      {formatNumber(projectedDealsPerMonth, 1)}
                    </p>
                    {monthlySQOs > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {closeRate[0]}% close rate
                      </p>
                    )}
                  </div>

                  {/* Projected New LTV Booked Per Month */}
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-sm text-muted-foreground mb-1">Projected New LTV Booked Per Month</p>
                    <p className="text-3xl font-bold font-mono gradient-text-purple" data-testid="text-projected-ltv">
                      {projectedLTVPerMonth > 0 ? formatCurrency(projectedLTVPerMonth) : '$0'}
                    </p>
                  </div>

                  {/* Your Monthly ROI */}
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary">
                    <p className="text-sm text-muted-foreground mb-1">Your Monthly ROI</p>
                    <p className="text-4xl font-bold font-mono gradient-text-purple" data-testid="text-monthly-roi">
                      {monthlyROI > 0 ? `${formatNumber(monthlyROI, 0)}x` : '0x'}
                    </p>
                    {monthlyROI > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        Return on investment multiplier
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* The Value of Reliability */}
              <Card className="p-6 bg-muted/30" data-testid="card-reliability">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  The Value of Reliability
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {selectedEngine === "lone-wolf" ? (
                    <>
                      <p className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">Single Point of Failure:</strong> When your hire gets sick, has a bad week, or quits (34% probability), your entire pipeline crashes to zero.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">No IP Ownership:</strong> If they leave, they take 100% of the knowledge, relationships, and playbooks with them.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">Zero Guarantee:</strong> You're paying $198k/year with no guaranteed output. This is a liability, not an asset.
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">System Resilience:</strong> If an operator leaves, we slot in a new one. The system keeps working. Your pipeline doesn't even notice.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">100% IP Ownership:</strong> You own the playbooks, the data, the learnings. This is a permanent asset for your company.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span>
                          <strong className="text-foreground">Performance Guarantee:</strong> We guarantee {monthlySQOs}+ qualified meetings per month starting at Month 5. This is predictable revenue.
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Module */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cta">
              The Math is Clear. The Blueprint is Next.
            </h2>
            <p className="text-lg text-muted-foreground mb-8" data-testid="text-cta-body">
              This is the math. Now let's apply it. Schedule a free GTM Audit with an Architect,
              and we will build this exact blueprint for your business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="gap-2 min-w-[280px]"
                data-testid="button-schedule-audit"
                asChild
              >
                <Link href="/audit">
                  Schedule My Free GTM Audit
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 min-w-[280px]"
                data-testid="button-assessment"
                asChild
              >
                <Link href="/assessment">
                  Wait, am I ready for an engine?
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}