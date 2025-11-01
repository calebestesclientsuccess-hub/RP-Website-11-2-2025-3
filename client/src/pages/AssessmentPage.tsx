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
      question: "How well-defined is your Ideal Customer Profile (ICP)?",
      description: "A clear ICP is the foundation of effective GTM. It determines who you target, how you message, and where you focus resources.",
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
          score: 2,
          insight: "A general idea isn't enough - you need specific criteria to qualify prospects"
        },
        {
          value: "documented",
          label: "We have documented criteria but it's not strictly followed",
          score: 4,
          insight: "Documentation is good, but inconsistent application wastes opportunities"
        },
        {
          value: "refined",
          label: "We have a refined ICP with firmographic, technographic, and behavioral signals",
          score: 6,
          insight: "Excellent - a multi-dimensional ICP enables precision targeting"
        }
      ]
    },
    {
      id: "process",
      category: "Sales Process",
      icon: <Settings className="w-5 h-5" />,
      question: "How mature is your sales process?",
      description: "A repeatable sales process is critical for predictable revenue and efficient scaling.",
      options: [
        {
          value: "adhoc",
          label: "Each rep follows their own approach",
          score: 0,
          insight: "Without process standardization, you can't identify what works or scale success"
        },
        {
          value: "basic",
          label: "We have basic stages defined",
          score: 2,
          insight: "Basic stages are a start, but you need exit criteria and playbooks for each stage"
        },
        {
          value: "documented",
          label: "We have a documented process with clear stages and activities",
          score: 4,
          insight: "Good foundation - now focus on enforcement and continuous optimization"
        },
        {
          value: "optimized",
          label: "We have an optimized, data-driven process with playbooks and enablement",
          score: 6,
          insight: "Excellent - this level of maturity enables predictable, scalable growth"
        }
      ]
    },
    {
      id: "techstack",
      category: "Tech Stack",
      icon: <Database className="w-5 h-5" />,
      question: "How integrated is your sales tech stack?",
      description: "Your tech stack either multiplies or divides your team's productivity.",
      options: [
        {
          value: "minimal",
          label: "We use basic tools (CRM + email)",
          score: 1,
          insight: "Basic tools limit your ability to scale and optimize performance"
        },
        {
          value: "disconnected",
          label: "We have multiple tools but they don't talk to each other",
          score: 2,
          insight: "Disconnected tools create data silos and inefficiency - costing you 20%+ productivity"
        },
        {
          value: "partial",
          label: "Some tools are integrated but we still have manual processes",
          score: 4,
          insight: "Partial integration is progress, but manual processes still create bottlenecks"
        },
        {
          value: "unified",
          label: "Fully integrated stack with automated workflows and unified data",
          score: 6,
          insight: "A unified stack is a competitive advantage - this is where scale happens"
        }
      ]
    },
    {
      id: "team",
      category: "Team Structure",
      icon: <Users className="w-5 h-5" />,
      question: "How is your revenue team structured?",
      description: "Team structure determines velocity, accountability, and scalability.",
      options: [
        {
          value: "solo",
          label: "Single person or founder-led sales",
          score: 1,
          insight: "Founder-led sales can't scale - you need dedicated resources to grow"
        },
        {
          value: "generalist",
          label: "Full-cycle reps handling everything from prospecting to closing",
          score: 2,
          insight: "Full-cycle reps get pulled in too many directions to excel at any one thing"
        },
        {
          value: "specialized",
          label: "Specialized roles (BDRs, AEs) but working in silos",
          score: 4,
          insight: "Specialization is good, but silos create handoff friction and lost opportunities"
        },
        {
          value: "pods",
          label: "Integrated pods with aligned BDRs, AEs, and support resources",
          score: 6,
          insight: "Pod structures maximize collaboration and accountability - the gold standard"
        }
      ]
    },
    {
      id: "data",
      category: "Data Quality",
      icon: <Database className="w-5 h-5" />,
      question: "What's the state of your prospect and customer data?",
      description: "Data quality directly impacts your ability to target, personalize, and convert.",
      options: [
        {
          value: "poor",
          label: "Our data is outdated, incomplete, or inaccurate",
          score: 0,
          insight: "Bad data = bad outcomes. You're wasting 50%+ of your outreach effort"
        },
        {
          value: "basic",
          label: "We have basic contact info but limited enrichment",
          score: 2,
          insight: "Basic data limits personalization and reduces response rates by 70%+"
        },
        {
          value: "enriched",
          label: "We enrich data but it's a manual or periodic process",
          score: 4,
          insight: "Periodic enrichment is good, but real-time enrichment unlocks true potential"
        },
        {
          value: "dynamic",
          label: "Real-time enrichment with technographic and intent data",
          score: 6,
          insight: "Dynamic data enrichment enables precision targeting and 10x better results"
        }
      ]
    },
    {
      id: "messaging",
      category: "Messaging",
      icon: <MessageSquare className="w-5 h-5" />,
      question: "How developed is your sales messaging?",
      description: "Messaging is the bridge between your value and your customer's pain.",
      options: [
        {
          value: "feature",
          label: "We focus on product features and capabilities",
          score: 1,
          insight: "Feature-focused messaging doesn't resonate - buyers care about outcomes"
        },
        {
          value: "benefit",
          label: "We talk about benefits but it's generic",
          score: 3,
          insight: "Generic benefits are better than features, but still don't create urgency"
        },
        {
          value: "problem",
          label: "We focus on customer problems and pain points",
          score: 4,
          insight: "Problem-focused messaging is good - now personalize it by persona"
        },
        {
          value: "impact",
          label: "We quantify business impact with personalized, multi-threaded messaging",
          score: 6,
          insight: "Impact-based messaging with personalization is what drives conversions"
        }
      ]
    },
    {
      id: "metrics",
      category: "Performance Tracking",
      icon: <BarChart3 className="w-5 h-5" />,
      question: "How do you track and optimize GTM performance?",
      description: "What gets measured gets managed. What gets managed gets improved.",
      options: [
        {
          value: "none",
          label: "We track basic metrics like calls made and emails sent",
          score: 1,
          insight: "Activity metrics without outcome metrics create busy work, not results"
        },
        {
          value: "lagging",
          label: "We track results (deals closed, revenue) but not leading indicators",
          score: 2,
          insight: "Lagging indicators tell you what happened, not what will happen"
        },
        {
          value: "mixed",
          label: "We track both activity and outcome metrics",
          score: 4,
          insight: "Good balance - now focus on conversion rates between stages"
        },
        {
          value: "predictive",
          label: "We have full-funnel visibility with predictive analytics and optimization loops",
          score: 6,
          insight: "Predictive analytics enable proactive optimization - this is elite level"
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
    const maxScore = questions.length * 6;
    const percentage = (totalScore / maxScore) * 100;
    
    let level: AssessmentResults["level"];
    let diagnosis: string;
    
    if (percentage < 25) {
      level = "Foundational";
      diagnosis = "Your GTM engine needs significant development. You're likely experiencing high customer acquisition costs, long sales cycles, and unpredictable revenue. The good news: small improvements will yield massive returns.";
    } else if (percentage < 50) {
      level = "Developing";
      diagnosis = "You have some GTM foundations in place, but critical gaps are limiting your growth potential. You're leaving money on the table through inefficiency and missed opportunities.";
    } else if (percentage < 75) {
      level = "Advanced";
      diagnosis = "Your GTM engine shows maturity in several areas. With targeted optimizations, you can unlock the next level of growth and efficiency.";
    } else {
      level = "Elite";
      diagnosis = "You have a sophisticated GTM engine. Focus on continuous optimization and scaling what works. Consider advanced strategies like account-based orchestration.";
    }
    
    // Identify strengths and gaps
    const strengths: string[] = [];
    const gaps: string[] = [];
    
    questions.forEach(q => {
      const score = answers[q.id] || 0;
      if (score >= 4) {
        strengths.push(q.category);
      } else if (score <= 2) {
        gaps.push(q.category);
      }
    });
    
    // Generate recommendations
    const recommendations: AssessmentResults["recommendations"] = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    if (gaps.includes("ICP Definition")) {
      recommendations.immediate.push("Define and document your ICP with specific qualifying criteria");
    }
    if (gaps.includes("Sales Process")) {
      recommendations.immediate.push("Map and standardize your sales process with clear stage gates");
    }
    if (gaps.includes("Data Quality")) {
      recommendations.immediate.push("Audit and clean your CRM data, implement enrichment tools");
    }
    
    if (gaps.includes("Tech Stack")) {
      recommendations.shortTerm.push("Integrate your core sales tools to eliminate manual data entry");
    }
    if (gaps.includes("Messaging")) {
      recommendations.shortTerm.push("Develop impact-based messaging frameworks by persona");
    }
    if (gaps.includes("Team Structure")) {
      recommendations.shortTerm.push("Consider specialized roles or pod structures for better efficiency");
    }
    
    recommendations.longTerm.push("Build predictive models for lead scoring and opportunity prioritization");
    recommendations.longTerm.push("Implement account-based strategies for enterprise accounts");
    recommendations.longTerm.push("Create a continuous optimization culture with weekly strategy sessions");
    
    return {
      score: totalScore,
      level,
      diagnosis,
      strengths,
      gaps,
      recommendations
    };
  };

  const handleLeadSubmit = (data: LeadFormData) => {
    console.log('Lead captured:', data);
    setLeadCaptured(true);
  };

  const results = showResults && leadCaptured ? calculateResults() : null;

  return (
    <div className="min-h-screen">
      <SEO 
        title="GTM Readiness Assessment - Is Your GTM Engine Ready to Scale? | Revenue Party"
        description="Take our 7-question assessment to evaluate your GTM maturity. Get personalized recommendations to optimize your revenue generation system."
        keywords="GTM assessment, sales readiness quiz, revenue system audit, GTM maturity assessment"
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
              7-Question Assessment
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-assessment">
              Is Your GTM Engine Ready to Scale?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-assessment-description">
              Answer 7 strategic questions to assess your GTM maturity. Get a personalized diagnosis 
              and actionable recommendations to multiply your pipeline.
            </p>
          </motion.div>
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
                                    className="pl-10"
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
                                  className="pl-10"
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
                    <h2 className="text-3xl font-bold mb-2">Your GTM Maturity Level</h2>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Badge 
                        variant={results.level === "Elite" ? "default" : "secondary"}
                        className="text-lg px-4 py-2"
                      >
                        {results.level}
                      </Badge>
                      <span className="text-2xl font-bold text-primary">
                        {results.score}/{questions.length * 6} Points
                      </span>
                    </div>
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
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Your Strategic Roadmap
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
                    <h3 className="text-2xl font-bold mb-3">Ready to Level Up Your GTM Engine?</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Get a detailed GTM audit and custom blueprint. We'll show you exactly how to 
                      implement these recommendations and multiply your pipeline.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" asChild data-testid="button-schedule-audit">
                        <Link href="/audit">
                          Schedule GTM Audit
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild data-testid="button-view-solution">
                        <Link href="/gtm-engine">
                          See Our Solution
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
