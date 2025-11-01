import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Zap,
  Target,
  PiggyBank,
  Trophy,
  Mail,
  Building,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";

// Schema for email capture form
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  company: z.string().min(2, "Company name is required"),
  name: z.string().min(2, "Name is required")
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function ROICalculator() {
  // Calculator inputs
  const [acv, setAcv] = useState([75000]);
  const [closeRate, setCloseRate] = useState([25]);
  const [salesCycle, setSalesCycle] = useState([90]);
  const [quota, setQuota] = useState([1200000]);
  const [teamSize, setTeamSize] = useState([3]);
  
  // State for showing detailed results
  const [showResults, setShowResults] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      company: "",
      name: ""
    }
  });

  // Calculate In-House Model Costs
  const calculateInHouseCosts = () => {
    const baseSalary = 65000;
    const commission = 15000; // Average commission
    const benefits = baseSalary * 0.25; // 25% for benefits
    const recruitingCost = 15000; // Recruiting fees
    const managementTime = 104000; // $2k/week management cost
    const techStack = 12000; // Annual tech stack cost
    const rampTime = baseSalary * 0.5; // 6 months unproductive
    const failureRisk = (baseSalary + commission + benefits) * 0.33; // 33% failure rate
    
    const totalCost = baseSalary + commission + benefits + recruitingCost + 
                     managementTime + techStack + rampTime + failureRisk;
    
    return {
      baseSalary,
      commission,
      benefits,
      recruitingCost,
      managementTime,
      techStack,
      rampTime,
      failureRisk,
      totalCost: Math.round(totalCost)
    };
  };

  // Calculate RevParty Pod Model
  const calculatePodModel = () => {
    const monthlyInvestment = 8500; // Example monthly cost
    const annualInvestment = monthlyInvestment * 12;
    const appointmentsPerMonth = 20;
    const appointmentsPerYear = appointmentsPerMonth * 12;
    const pipelinePerMonth = appointmentsPerMonth * acv[0];
    const pipelinePerYear = pipelinePerMonth * 12;
    const closedDealsPerYear = appointmentsPerYear * (closeRate[0] / 100);
    const revenueGenerated = closedDealsPerYear * acv[0];
    const roi = ((revenueGenerated - annualInvestment) / annualInvestment) * 100;
    
    return {
      monthlyInvestment,
      annualInvestment,
      appointmentsPerMonth,
      appointmentsPerYear,
      pipelinePerMonth,
      pipelinePerYear,
      closedDealsPerYear,
      revenueGenerated,
      roi: Math.round(roi)
    };
  };

  const inHouseModel = calculateInHouseCosts();
  const podModel = calculatePodModel();
  const savings = inHouseModel.totalCost - podModel.annualInvestment;
  const roiMultiplier = (podModel.revenueGenerated / podModel.annualInvestment).toFixed(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleEmailSubmit = (data: EmailFormData) => {
    console.log('Email captured:', data);
    setEmailCaptured(true);
    setShowResults(true);
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="ROI Calculator - Model Your Multiplication Factor | Revenue Party"
        description="Calculate the true cost of hiring vs deploying a complete GTM system. Compare in-house BDR costs with RevParty Pod ROI. See your savings and time-to-revenue."
        keywords="sales ROI calculator, BDR cost calculator, GTM system ROI, hiring costs calculator, sales team ROI"
        canonical="/roi-calculator"
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="outline">
              <Calculator className="w-3 h-3 mr-1" />
              Interactive ROI Calculator
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-roi-calculator">
              Model Your Multiplication Factor
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-roi-description">
              Compare the true all-in cost of traditional hiring versus deploying a complete GTM system. 
              See how your investment multiplies into predictable pipeline and revenue.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div>
              <Card className="p-6" data-testid="card-calculator-inputs">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Your Business Metrics
                </h2>
                
                <div className="space-y-6">
                  {/* ACV Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Average Contract Value (ACV)</Label>
                      <span className="text-sm font-mono font-bold text-primary" data-testid="text-acv">
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$10k</span>
                      <span>$500k</span>
                    </div>
                  </div>

                  {/* Close Rate Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Close Rate</Label>
                      <span className="text-sm font-mono font-bold text-primary" data-testid="text-close-rate">
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Sales Cycle Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Average Sales Cycle</Label>
                      <span className="text-sm font-mono font-bold text-primary" data-testid="text-sales-cycle">
                        {salesCycle[0]} days
                      </span>
                    </div>
                    <Slider
                      value={salesCycle}
                      onValueChange={setSalesCycle}
                      min={30}
                      max={180}
                      step={15}
                      data-testid="slider-sales-cycle"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>30 days</span>
                      <span>180 days</span>
                    </div>
                  </div>

                  {/* Annual Quota Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Annual Sales Quota per AE</Label>
                      <span className="text-sm font-mono font-bold text-primary" data-testid="text-quota">
                        {formatCurrency(quota[0])}
                      </span>
                    </div>
                    <Slider
                      value={quota}
                      onValueChange={setQuota}
                      min={500000}
                      max={3000000}
                      step={100000}
                      data-testid="slider-quota"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$500k</span>
                      <span>$3M</span>
                    </div>
                  </div>

                  {/* Team Size Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Number of AEs to Support</Label>
                      <span className="text-sm font-mono font-bold text-primary" data-testid="text-team-size">
                        {teamSize[0]} AEs
                      </span>
                    </div>
                    <Slider
                      value={teamSize}
                      onValueChange={setTeamSize}
                      min={1}
                      max={10}
                      step={1}
                      data-testid="slider-team-size"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 AE</span>
                      <span>10 AEs</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Key Assumptions */}
              <Card className="mt-6 p-6 bg-muted/30" data-testid="card-assumptions">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Key Assumptions
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    In-house BDR generates 8-10 qualified meetings/month after 6-month ramp
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    RevParty Pod delivers 20+ qualified meetings/month starting week 2
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    33% of in-house BDR hires fail within first year
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Management time valued at $100/hour for 20 hours/week
                  </li>
                </ul>
              </Card>
            </div>

            {/* Results Panel */}
            <div>
              {/* Comparison Summary */}
              <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-background" data-testid="card-summary">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Your ROI Analysis
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
                    <p className="text-3xl font-bold text-primary" data-testid="text-savings">
                      {formatCurrency(savings)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">ROI Multiplier</p>
                    <p className="text-3xl font-bold text-primary" data-testid="text-roi-multiplier">
                      {roiMultiplier}x
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-background rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Revenue Generated</span>
                      <span className="text-lg font-bold text-primary" data-testid="text-revenue">
                        {formatCurrency(podModel.revenueGenerated)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on {podModel.closedDealsPerYear} closed deals/year
                    </div>
                  </div>

                  <div className="p-3 bg-background rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Pipeline Created</span>
                      <span className="text-lg font-bold" data-testid="text-pipeline">
                        {formatCurrency(podModel.pipelinePerYear)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {podModel.appointmentsPerYear} qualified appointments/year
                    </div>
                  </div>

                  <div className="p-3 bg-background rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Time to First Meeting</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="text-time-to-value">
                        2 weeks
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      vs. 3-6 months with traditional hiring
                    </div>
                  </div>
                </div>
              </Card>

              {/* Detailed Comparison Tabs */}
              <Card className="mt-6 p-6" data-testid="card-detailed-comparison">
                <Tabs defaultValue="costs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="costs" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        In-House BDR Total Cost: {formatCurrency(inHouseModel.totalCost)}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b">
                          <span>Base Salary</span>
                          <span>{formatCurrency(inHouseModel.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Commission</span>
                          <span>{formatCurrency(inHouseModel.commission)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Benefits (25%)</span>
                          <span>{formatCurrency(inHouseModel.benefits)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Recruiting Cost</span>
                          <span>{formatCurrency(inHouseModel.recruitingCost)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Management Time</span>
                          <span className="text-red-600 dark:text-red-400">
                            {formatCurrency(inHouseModel.managementTime)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Tech Stack</span>
                          <span>{formatCurrency(inHouseModel.techStack)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Ramp Time Cost</span>
                          <span className="text-red-600 dark:text-red-400">
                            {formatCurrency(inHouseModel.rampTime)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Failure Risk (33%)</span>
                          <span className="text-red-600 dark:text-red-400">
                            {formatCurrency(inHouseModel.failureRisk)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        RevParty Pod Investment: {formatCurrency(podModel.annualInvestment)}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b">
                          <span>Monthly Investment</span>
                          <span>{formatCurrency(podModel.monthlyInvestment)}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Includes Elite BDR</span>
                          <span className="text-green-600 dark:text-green-400">✓ Included</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Complete Tech Stack</span>
                          <span className="text-green-600 dark:text-green-400">✓ Included</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                          <span>Strategic Playbook</span>
                          <span className="text-green-600 dark:text-green-400">✓ Included</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Weekly Optimization</span>
                          <span className="text-green-600 dark:text-green-400">✓ Included</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="timeline" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Time to Value Comparison</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium">Week 1-2</div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm">
                                <span className="font-medium">In-House:</span> Job posting
                              </div>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                                <span className="font-medium">RevParty:</span> First meetings booked
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium">Month 1</div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm">
                                <span className="font-medium">In-House:</span> Interviewing
                              </div>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                                <span className="font-medium">RevParty:</span> 20+ meetings delivered
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium">Month 3</div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm">
                                <span className="font-medium">In-House:</span> Onboarding & training
                              </div>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                                <span className="font-medium">RevParty:</span> 60+ meetings, pipeline building
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-20 text-sm font-medium">Month 6</div>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-sm">
                                <span className="font-medium">In-House:</span> Finally productive
                              </div>
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm">
                                <span className="font-medium">RevParty:</span> 120+ meetings, deals closing
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="risks" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Risk Comparison</h3>
                      <div className="grid gap-3">
                        <Card className="p-4 border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            In-House Hiring Risks
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 33% chance of complete failure</li>
                            <li>• 6-month productivity delay</li>
                            <li>• Key person dependency</li>
                            <li>• No guaranteed performance</li>
                            <li>• Hidden management costs</li>
                          </ul>
                        </Card>
                        <Card className="p-4 border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            RevParty Pod Guarantees
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Performance guaranteed or replaced</li>
                            <li>• Productive from week 2</li>
                            <li>• Complete system, not single point of failure</li>
                            <li>• 20+ meetings/month minimum</li>
                            <li>• All management included</li>
                          </ul>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>

          {/* Email Capture for Detailed Report */}
          {!emailCaptured && (
            <Card className="mt-8 p-8 bg-primary/5 border-primary/20" data-testid="card-email-capture">
              <div className="max-w-2xl mx-auto text-center">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">Get Your Personalized ROI Report</h3>
                <p className="text-muted-foreground mb-6">
                  Receive a detailed PDF report with your custom ROI analysis, implementation roadmap, 
                  and strategic recommendations based on your specific metrics.
                </p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Your Name" 
                                {...field} 
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Company" 
                                {...field}
                                data-testid="input-company"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Work Email" 
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full md:w-auto" data-testid="button-get-report">
                      Get My Custom ROI Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </div>
            </Card>
          )}

          {/* Success Message */}
          {emailCaptured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mt-8 p-8 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50" data-testid="card-success">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Report Sent Successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Check your email for your personalized ROI report. Ready to turn these numbers into reality?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild data-testid="button-schedule-audit">
                      <Link href="/audit">
                        Schedule GTM Audit
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                      <Link href="/gtm-engine">
                        Learn About BDR Pods
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-calculator-cta">
            The Math is Clear. The Path is Proven.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Stop gambling on hires. Start deploying systems that multiply your investment into predictable revenue.
          </p>
          <Button size="lg" asChild data-testid="button-final-cta">
            <Link href="/audit">
              Get Your GTM Blueprint
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
