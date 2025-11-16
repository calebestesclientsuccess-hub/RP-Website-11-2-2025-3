import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  Target, 
  Users, 
  Database, 
  MessageSquare, 
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building,
  Phone,
  User
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { SuccessAnimation } from "@/components/ui/success-animation";

// Schema for lead capture form
const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().optional()
});

type LeadFormData = z.infer<typeof leadSchema>;

// Question interface
interface AssessmentQuestion {
  id: string;
  category: string;
  icon: JSX.Element;
  question: string;
  description: string;
  options: {
    value: string;
    label: string;
    score: number;
    insight: string;
  }[];
}

// Results interface
interface AssessmentResults {
  score: number;
  level: "Foundational" | "Developing" | "Advanced" | "Elite";
  primaryBottleneck: string;
  diagnosis: string;
  strengths: string[];
  gaps: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: ""
    }
  });

  // Assessment questions
  const questions: AssessmentQuestion[] = [
    {
      id: "icp",
      category: "ICP Definition",
      icon: <Target className="w-5 h-5" />,
      question: "How clearly defined is your Ideal Customer Profile (ICP)?",
      description: "Your ICP determines who you target, how you message, and where you focus resources.",
      options: [
        {
          value: "none",
          label: "We sell to anyone who will buy",
          score: 0,
          insight: "Without a clear ICP, you're burning resources on unqualified prospects"
        },
        {
          value: "basic",
          label: "We have a general idea of our target market",
          score: 3,
          insight: "A general idea isn't enough - you need specific criteria to qualify prospects"
        },
        {
          value: "documented",
          label: "We have documented criteria but it's not strictly followed",
          score: 7,
          insight: "Documentation is good, but inconsistent application wastes opportunities"
        },
        {
          value: "refined",
          label: "We have a refined ICP with firmographic, technographic, and behavioral signals",
          score: 10,
          insight: "Excellent - a multi-dimensional ICP enables precision targeting"
        }
      ]
    },
    {
      id: "messaging",
      category: "Messaging",
      icon: <MessageSquare className="w-5 h-5" />,
      question: "How confident are you in your current outbound messaging?",
      description: "Effective messaging is the bridge between your value and your customer's pain.",
      options: [
        {
          value: "not_confident",
          label: "Not confident - we're guessing what resonates",
          score: 0,
          insight: "Guesswork in messaging leads to poor response rates and wasted effort"
        },
        {
          value: "somewhat",
          label: "Somewhat confident - we get some responses",
          score: 3,
          insight: "Some success isn't enough - you need a proven, repeatable framework"
        },
        {
          value: "confident",
          label: "Confident - we have tested messaging that works",
          score: 7,
          insight: "Tested messaging is good - now focus on personalization at scale"
        },
        {
          value: "very_confident",
          label: "Very confident - our messaging consistently drives conversations",
          score: 10,
          insight: "Excellent - consistent results indicate a strong messaging foundation"
        }
      ]
    },
    {
      id: "talent",
      category: "Talent Quality",
      icon: <Users className="w-5 h-5" />,
      question: "How would you describe your current sales development talent?",
      description: "Your team's skill level directly impacts your pipeline quality and velocity.",
      options: [
        {
          value: "struggling",
          label: "We're struggling to find or retain good SDRs",
          score: 0,
          insight: "The 'Lone Wolf Trap' - relying on individual heroes creates constant risk"
        },
        {
          value: "junior",
          label: "We have junior reps who need constant supervision",
          score: 3,
          insight: "High supervision needs create a 'Management Tax' that limits your leverage"
        },
        {
          value: "competent",
          label: "We have competent reps but inconsistent performance",
          score: 7,
          insight: "Inconsistency signals a process problem, not a people problem"
        },
        {
          value: "elite",
          label: "We have elite talent who consistently exceed quota",
          score: 10,
          insight: "Elite talent is a competitive advantage - now systematize their success"
        }
      ]
    },
    {
      id: "management",
      category: "Management Burden",
      icon: <Settings className="w-5 h-5" />,
      question: "How much of your own time (or a sales leader's time) is spent managing the SDR/BDR team?",
      description: "Management time is either an investment in leverage or a tax on productivity.",
      options: [
        {
          value: "most_time",
          label: "Most of my time - I'm constantly coaching and firefighting",
          score: 0,
          insight: "You're paying the 'Management Tax' - your high-leverage time is consumed by low-leverage work"
        },
        {
          value: "significant",
          label: "A significant amount - daily 1:1s and check-ins",
          score: 3,
          insight: "Heavy management needs indicate a missing system or undertrained team"
        },
        {
          value: "moderate",
          label: "Moderate - weekly check-ins and occasional coaching",
          score: 7,
          insight: "Good balance - focus on building systems to reduce this further"
        },
        {
          value: "minimal",
          label: "Minimal - the team operates independently with clear processes",
          score: 10,
          insight: "Excellent - independent operation is the sign of a mature system"
        }
      ]
    },
    {
      id: "techstack",
      category: "Tech Stack",
      icon: <Database className="w-5 h-5" />,
      question: "How integrated is your sales tech stack (CRM, Data, Sequencer)?",
      description: "Your tech stack either multiplies or divides your team's productivity.",
      options: [
        {
          value: "disconnected",
          label: "Disconnected - lots of manual work and data silos",
          score: 0,
          insight: "Disconnected tools create the 'Tech Stack Tax' - costing you 20%+ productivity"
        },
        {
          value: "partial",
          label: "Partially integrated - some automation but many gaps",
          score: 3,
          insight: "Partial integration is progress, but gaps still create bottlenecks"
        },
        {
          value: "mostly",
          label: "Mostly integrated - automated workflows with minor manual steps",
          score: 7,
          insight: "Good foundation - eliminate remaining manual steps to unlock full potential"
        },
        {
          value: "fully",
          label: "Fully integrated - unified data and automated workflows",
          score: 10,
          insight: "A unified stack is a competitive advantage - this is where scale happens"
        }
      ]
    },
    {
      id: "tracking",
      category: "Performance Tracking",
      icon: <BarChart3 className="w-5 h-5" />,
      question: "How do you track performance?",
      description: "What gets measured gets managed. What gets managed gets improved.",
      options: [
        {
          value: "basic_activity",
          label: "Basic activity metrics (calls, emails)",
          score: 0,
          insight: "Activity metrics without outcomes create the 'Activity Mirage' - busy work, not results"
        },
        {
          value: "outcome_only",
          label: "Outcome metrics only (meetings booked, deals closed)",
          score: 3,
          insight: "Lagging indicators tell you what happened, not what will happen"
        },
        {
          value: "mixed",
          label: "Both activity and outcome metrics",
          score: 7,
          insight: "Good balance - now focus on conversion rates and predictive indicators"
        },
        {
          value: "full_funnel",
          label: "Full-funnel visibility with leading and lagging indicators",
          score: 10,
          insight: "Full-funnel tracking enables proactive optimization - this is elite level"
        }
      ]
    },
    {
      id: "ip_ownership",
      category: "IP Ownership",
      icon: <Database className="w-5 h-5" />,
      question: "If your entire sales team (or agency) left tomorrow, what GTM assets would you have left?",
      description: "The true test of a system is what remains when the people leave.",
      options: [
        {
          value: "nothing",
          label: "Nothing - all the knowledge walks out the door",
          score: 0,
          insight: "You're trapped in the 'Zero-IP Trap' - you're building their company, not yours"
        },
        {
          value: "some_docs",
          label: "Some documentation and spreadsheets",
          score: 3,
          insight: "Basic documentation is a start, but it's not a transferable system"
        },
        {
          value: "playbooks",
          label: "Documented playbooks and processes in our CRM",
          score: 7,
          insight: "Good foundation - now focus on making it repeatable and transferable"
        },
        {
          value: "full_system",
          label: "A complete, documented system with playbooks, data, and tech stack",
          score: 10,
          insight: "Excellent - you own a true asset that can survive team changes"
        }
      ]
    }
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string, score: number) => {
    setSelectedOption(value);
    setAnswers({ ...answers, [currentQ.id]: score });
  };

  const handleNext = () => {
    if (!selectedOption) return;
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption("");
    } else {
      // Show lead capture form before results
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQuestion = questions[currentQuestion - 1];
      const prevAnswer = Object.entries(answers).find(([key]) => key === prevQuestion.id);
      if (prevAnswer) {
        const option = prevQuestion.options.find(opt => opt.score === prevAnswer[1]);
        setSelectedOption(option?.value || "");
      }
    }
  };

  const calculateResults = (): AssessmentResults => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 10;
    const percentage = (totalScore / maxScore) * 100;
    
    let level: AssessmentResults["level"];
    let diagnosis: string;
    let primaryBottleneck: string;
    
    if (percentage < 30) {
      level = "Foundational";
      primaryBottleneck = "The Lone Wolf Fallacy (Single Point of Failure)";
      diagnosis = "Your GTM system is trapped in the 'Lone Wolf' model. You're likely experiencing the $198k liability cycle: hire, ramp, burn out, repeat. This isn't a person problem—it's an architecture problem. Your pipeline is dangerously dependent on individual performance, creating constant risk and unpredictable revenue.";
    } else if (percentage < 55) {
      level = "Developing";
      primaryBottleneck = "The Management Tax (High-Leverage Time Drain)";
      diagnosis = "You have some GTM foundations, but you're paying the 'Management Tax.' Your high-leverage time is consumed by low-leverage work: coaching, firefighting, and supervising reps who lack proper systems. This creates a ceiling on your growth and limits your strategic impact.";
    } else if (percentage < 80) {
      level = "Advanced";
      primaryBottleneck = "The Zero-IP Trap (Missing Transferable Assets)";
      diagnosis = "Your GTM engine shows maturity, but you're vulnerable to the 'Zero-IP Trap.' If key people leave, what remains? Without documented systems, playbooks, and processes, you're building their career, not your company's asset. Focus on systematizing your success to create true enterprise value.";
    } else {
      level = "Elite";
      primaryBottleneck = "Minor Optimization Opportunities";
      diagnosis = "You have a sophisticated GTM system. You've escaped the common traps: Lone Wolf dependency, Management Tax, and Zero-IP risk. Your focus should be on continuous optimization, scaling what works, and exploring advanced strategies like account-based orchestration.";
    }
    
    // Identify strengths and gaps
    const strengths: string[] = [];
    const gaps: string[] = [];
    
    questions.forEach(q => {
      const score = answers[q.id] || 0;
      if (score >= 7) {
        strengths.push(q.category);
      } else if (score <= 3) {
        gaps.push(q.category);
      }
    });
    
    // Generate recommendations based on specific gaps
    const recommendations: AssessmentResults["recommendations"] = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    if (gaps.includes("ICP Definition")) {
      recommendations.immediate.push("Define your ICP with firmographic, technographic, and behavioral signals");
    }
    if (gaps.includes("Messaging")) {
      recommendations.immediate.push("Develop and test impact-based messaging frameworks by persona");
    }
    if (gaps.includes("Talent Quality")) {
      recommendations.immediate.push("Audit your hiring process and consider a pod-based system to reduce 'Lone Wolf' risk");
    }
    
    if (gaps.includes("Management Burden")) {
      recommendations.shortTerm.push("Build self-managing systems to reduce the 'Management Tax'");
    }
    if (gaps.includes("Tech Stack")) {
      recommendations.shortTerm.push("Integrate your sales tools to eliminate manual work and data silos");
    }
    if (gaps.includes("Performance Tracking")) {
      recommendations.shortTerm.push("Implement full-funnel tracking with leading and lagging indicators");
    }
    
    if (gaps.includes("IP Ownership")) {
      recommendations.longTerm.push("Document all playbooks, processes, and systems to escape the 'Zero-IP Trap'");
    }
    recommendations.longTerm.push("Build predictive models for lead scoring and opportunity prioritization");
    recommendations.longTerm.push("Create a continuous optimization culture with data-driven strategy sessions");
    
    return {
      score: totalScore,
      level,
      primaryBottleneck,
      diagnosis,
      strengths,
      gaps,
      recommendations
    };
  };

  const handleLeadSubmit = (data: LeadFormData) => {
    console.log('Lead captured:', data);
    // Show success animation briefly before showing results
    setTimeout(() => {
      setLeadCaptured(true);
    }, 1500);
  };

  const results = showResults && leadCaptured ? calculateResults() : null;

  return (
    <div className="min-h-screen">
      <SEO 
        title="Free GTM Readiness Assessment - Diagnose Your Revenue System | Revenue Party"
        description="Take our free 7-question GTM assessment to identify pipeline bottlenecks, evaluate sales team readiness, and get a personalized action plan. Discover if you're stuck in the Lone Wolf or Agency Trap."
        keywords="GTM readiness assessment, sales readiness quiz, pipeline bottleneck diagnostic, revenue system audit, GTM maturity assessment, sales team evaluation, lead generation assessment"
        canonical="/assessment"
      />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4" variant="outline">
              <ClipboardCheck className="w-3 h-3 mr-1" />
              3-Minute Assessment
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-assessment">
              Are You Ready to Build a Sales Asset?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-assessment-description">
              Your next sales hire won't fix your pipeline. A broken system is the #1 reason for failure. 
              Take our 3-minute assessment to diagnose your #1 bottleneck.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-diagnose">
            Diagnose Your #1 GTM Bottleneck
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-intro">
            You're feeling the pain. But where is it really coming from? This assessment is designed by 
            our GTM Architects to diagnose the true source of your pipeline bottleneck. Is it a 'Hiring Drag' 
            problem? A 'Management Tax' problem? Or a 'Zero-IP Trap' problem? Get your score, an instant 
            diagnosis, and a 1-page playbook on how to fix it.
          </p>
        </div>
      </section>

      {/* Assessment Section */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" data-testid="progress-assessment" />
                </div>

                {/* Question Card */}
                <Card className="p-8" data-testid={`card-question-${currentQuestion}`}>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {currentQ.icon}
                      </div>
                      <Badge variant="secondary">{currentQ.category}</Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{currentQ.question}</h2>
                    <p className="text-muted-foreground">{currentQ.description}</p>
                  </div>

                  {/* Options */}
                  <RadioGroup value={selectedOption} onValueChange={(value) => {
                    const option = currentQ.options.find(opt => opt.value === value);
                    if (option) handleAnswer(value, option.score);
                  }}>
                    <div className="space-y-3">
                      {currentQ.options.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedOption === option.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                          data-testid={`option-${option.value}`}
                        >
                          <RadioGroupItem value={option.value} className="mt-1" />
                          <div className="flex-1">
                            <div className="font-medium mb-1">{option.label}</div>
                            {selectedOption === option.value && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.2 }}
                              >
                                <p className="text-sm text-muted-foreground mt-2">
                                  <AlertCircle className="inline w-3 h-3 mr-1" />
                                  {option.insight}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      data-testid="button-previous"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!selectedOption}
                      data-testid="button-next"
                    >
                      {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : !leadCaptured ? (
              /* Lead Capture Form */
              <motion.div
                key="lead-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8" data-testid="card-lead-capture">
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Your Assessment is Complete!</h2>
                    <p className="text-muted-foreground">
                      Enter your details to receive your personalized GTM diagnosis and strategic recommendations.
                    </p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleLeadSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="John Smith" 
                                    className="pl-10 touch-target"
                                    autoComplete="name"
                                    {...field} 
                                    data-testid="input-name"
                                  />
                                </div>
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
                              <FormLabel>Company *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Acme Inc" 
                                    className="pl-10"
                                    {...field}
                                    data-testid="input-company"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Email *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                  type="email" 
                                  placeholder="john@acme.com" 
                                  className="pl-10 touch-target"
                                  autoComplete="email"
                                  inputMode="email"
                                  {...field}
                                  data-testid="input-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                  placeholder="(555) 123-4567" 
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-phone"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" size="lg" className="w-full" data-testid="button-get-results">
                        Get My GTM Diagnosis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            ) : results ? (
              /* Results Display */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Score Card */}
                <Card className="p-8 mb-6 bg-gradient-to-br from-primary/10 to-background border-primary/20" data-testid="card-results">
                  <div className="text-center mb-6">
                    <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="heading-score">
                      Your GTM Readiness Score: {results.score}/70
                    </h1>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Badge 
                        variant={results.level === "Elite" ? "default" : "secondary"}
                        className="text-lg px-4 py-2"
                      >
                        {results.level}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-primary" data-testid="heading-bottleneck">
                      Your Primary Bottleneck: {results.primaryBottleneck}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      {results.diagnosis}
                    </p>
                  </div>

                  {/* Strengths and Gaps */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Your Strengths
                      </h3>
                      {results.strengths.length > 0 ? (
                        <ul className="space-y-2">
                          {results.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Keep building - every improvement counts!
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Areas to Improve
                      </h3>
                      {results.gaps.length > 0 ? (
                        <ul className="space-y-2">
                          {results.gaps.map((gap, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          You're performing well - focus on optimization!
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="p-8 mb-6" data-testid="card-recommendations">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" data-testid="heading-playbook">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Your 1-Page Playbook (The Antidote)
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Immediate Actions */}
                    <div>
                      <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                        Immediate Actions (This Week)
                      </h4>
                      <ul className="space-y-2">
                        {results.recommendations.immediate.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Short Term */}
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                        Short Term (Next 30 Days)
                      </h4>
                      <ul className="space-y-2">
                        {results.recommendations.shortTerm.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Long Term */}
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-600 dark:text-purple-400">
                        Long Term (3-6 Months)
                      </h4>
                      <ul className="space-y-2">
                        {results.recommendations.longTerm.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* CTA */}
                <Card className="p-8 bg-primary/5 border-primary/20" data-testid="card-cta">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">Ready to Build Your GTM Asset?</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Schedule your free GTM Leverage Audit. We'll design your custom blueprint and show you 
                      exactly how to escape these traps and build a scalable revenue system.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" asChild data-testid="button-schedule-audit">
                        <Link href="/audit">
                          Schedule My GTM Audit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild data-testid="button-view-solution">
                        <Link href="/gtm-engine">
                          See The GTM Engine
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
