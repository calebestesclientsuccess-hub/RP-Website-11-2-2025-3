import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AssessmentData {
  sessionId: string;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
  q9?: string;
  q10a1?: string;
  q10a2?: string;
  q10b1?: string;
  q10b2?: string;
  q10c1?: string;
  q10c2?: string;
  q11?: string;
  q13?: string;
  q14?: string;
  q15?: string;
  q16?: string;
  q17?: string;
  q18?: string;
  q19?: string;
  q20?: string;
  usedCalculator?: boolean;
}

export default function PipelineAssessmentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('pipeline_assessment_session');
    if (stored) return stored;
    const newSession = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pipeline_assessment_session', newSession);
    return newSession;
  });
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({ sessionId });
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const totalScreens = 14;
  const progress = ((currentScreen + 1) / totalScreens) * 100;

  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/assessments/init', { sessionId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data && Object.keys(data).length > 0) {
        setAssessmentData(data);
        
        const screenIndex = calculateResumeScreen(data);
        setCurrentScreen(screenIndex);
      }
      setIsLoading(false);
    },
  });

  const calculateResumeScreen = (data: AssessmentData): number => {
    if (data.q20) return 12;
    if (data.q11) return 11;
    if (data.q9) return 9;
    if (data.q8) return 8;
    if (data.q7) return 7;
    if (data.q6) return 6;
    if (data.q5) return 5;
    if (data.q4) return 4;
    if (data.q3) return 3;
    if (data.q2) return 2;
    if (data.q1) return 1;
    return 0;
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AssessmentData>) => {
      const response = await apiRequest('PUT', `/api/assessments/${sessionId}`, data);
      return response.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: AssessmentData) => {
      const response = await apiRequest('POST', `/api/assessments/${sessionId}/submit`, data);
      return response.json();
    },
    onSuccess: async (response) => {
      localStorage.removeItem('pipeline_assessment_session');
      setLocation(`/pipeline-assessment/thank-you?bucket=${response.bucket}`);
    },
  });

  useEffect(() => {
    initMutation.mutate();
  }, []);

  const handleAnswer = async (field: keyof AssessmentData, value: string) => {
    const updatedData = { ...assessmentData, [field]: value };
    setAssessmentData(updatedData);
    
    await updateMutation.mutateAsync({ [field]: value });
    
    setTimeout(() => {
      goNext();
    }, 300);
  };

  const handleTextSubmit = (field: keyof AssessmentData, value: string) => {
    const updatedData = { ...assessmentData, [field]: value };
    setAssessmentData(updatedData);
    updateMutation.mutate({ [field]: value });
  };

  const goNext = () => {
    setDirection(1);
    setCurrentScreen(prev => Math.min(prev + 1, totalScreens - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentScreen(prev => Math.max(prev - 1, 0));
  };

  const handleEmailSubmit = async () => {
    if (!assessmentData.q20) {
      toast({ title: "Email required", description: "Please enter your email to continue", variant: "destructive" });
      return;
    }
    goNext();
  };

  const handleCalculatorChoice = (useCalculator: boolean) => {
    setAssessmentData({ ...assessmentData, usedCalculator: useCalculator });
    if (useCalculator) {
      goNext();
    } else {
      submitMutation.mutate(assessmentData);
    }
  };

  const handleFinalSubmit = () => {
    submitMutation.mutate(assessmentData);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading assessment...</div>
        </div>
      );
    }

    switch (currentScreen) {
      case 0:
        return (
          <QuestionScreen
            header="Phase 1: Core Philosophy"
            question="When it comes to your pipeline, what is your core philosophy?"
            options={[
              { value: 'a', label: 'I want to RENT a managed service.', subtext: 'I want to outsource this problem. I need a vendor to handle it.' },
              { value: 'b', label: 'I want to OWN the asset/capability.', subtext: 'I want to build an internal capability, whether I hire or partner.' },
            ]}
            onSelect={(value) => handleAnswer('q1', value)}
            selected={assessmentData.q1}
          />
        );
      
      case 1:
        return (
          <QuestionScreen
            header="Phase 1: Core Philosophy"
            question="How does your ideal customer typically buy?"
            options={[
              { value: 'a', label: "It's a Transactional Sale.", subtext: 'They already know they have a problem and are shopping for a known solution.' },
              { value: 'b', label: "It's a Consultative Sale.", subtext: "They often don't know the scope of their problem. We have to educate them." },
            ]}
            onSelect={(value) => handleAnswer('q2', value)}
            selected={assessmentData.q2}
          />
        );
      
      case 2:
        return (
          <QuestionScreen
            header="Phase 1: Core Philosophy"
            question="When building a new revenue function, what do you believe is the most critical piece to get right first?"
            options={[
              { value: 'a', label: "The Person (e.g., a 'star' cold caller)" },
              { value: 'b', label: 'Pricing' },
              { value: 'c', label: 'Technology' },
              { value: 'd', label: 'Brand' },
              { value: 'e', label: 'The System (The GTM Engine)' },
            ]}
            onSelect={(value) => handleAnswer('q3', value)}
            selected={assessmentData.q3}
          />
        );

      case 3:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part A)"
            question="How urgently do you need to see a reliable pipeline?"
            options={[
              { value: 'i', label: 'ASAP' },
              { value: 'ii', label: '90 Days' },
              { value: 'iii', label: '180 Days' },
              { value: 'iv', label: '1+ Year' },
            ]}
            onSelect={(value) => handleAnswer('q4', value)}
            selected={assessmentData.q4}
          />
        );

      case 4:
        return (
          <TextInputScreen
            header="Phase 2: Architect's Audit (Part A)"
            question={`What happens if you don't succeed in ${
              assessmentData.q4 === 'i' ? 'ASAP' :
              assessmentData.q4 === 'ii' ? '90 Days' :
              assessmentData.q4 === 'iii' ? '180 Days' :
              '1+ Year'
            }?`}
            value={assessmentData.q5 || ''}
            onChange={(value) => setAssessmentData({ ...assessmentData, q5: value })}
            onNext={() => {
              handleTextSubmit('q5', assessmentData.q5 || '');
              goNext();
            }}
          />
        );

      case 5:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part A)"
            question="Who is the ultimate owner of this pipeline problem?"
            options={[
              { value: 'i', label: 'Me (The Founder / CEO).' },
              { value: 'ii', label: 'Our Head of Sales / CRO.' },
              { value: 'iii', label: 'A committee (Sales, Marketing, Ops).' },
            ]}
            onSelect={(value) => handleAnswer('q6', value)}
            selected={assessmentData.q6}
          />
        );

      case 6:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part B)"
            question="What kind of problem is your company aiming to solve?"
            options={[
              { value: 'i', label: 'A hiring problem. (We need to hire/train good salespeople.)' },
              { value: 'ii', label: 'A branding problem. (Our brand needs to better support sales.)' },
              { value: 'iii', label: 'A pricing problem. (We are not competitive.)' },
              { value: 'iv', label: 'A holistic revenue problem. (We need a full system.)' },
            ]}
            onSelect={(value) => handleAnswer('q7', value)}
            selected={assessmentData.q7}
          />
        );

      case 7:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part B)"
            question="Where is that budget (or your team's effort) going now?"
            options={[
              { value: 'i', label: "Nowhere. We're trying to do this ourselves.", subtext: 'The "DIY / Founder Trap"' },
              { value: 'ii', label: 'To an internal "Lone Wolf" hire.', subtext: 'The "$198k Mistake"' },
              { value: 'iii', label: 'To a commodity agency or freelancers.', subtext: 'The "Black Box Trap"' },
            ]}
            onSelect={(value) => handleAnswer('q8', value)}
            selected={assessmentData.q8}
          />
        );

      case 8:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part C)"
            question="Where in the pipeline does the trouble FIRST start?"
            options={[
              { value: 'i', label: "No Meetings. We're not booking enough new qualified meetings." },
              { value: 'ii', label: "Low-Quality Meetings. We get meetings, but they are low-quality, no-shows, or not with the right person." },
              { value: 'iii', label: 'Low Close Rate. Our meetings are good, but they don\'t close.' },
            ]}
            onSelect={(value) => handleAnswer('q9', value)}
            selected={assessmentData.q9}
          />
        );

      case 9:
        return <ConditionalScreen 
          assessmentData={assessmentData} 
          onUpdate={(data) => {
            setAssessmentData(data);
            const updates = Object.fromEntries(
              Object.entries(data).filter(([key]) => 
                key.startsWith('q10') && data[key as keyof AssessmentData] !== assessmentData[key as keyof AssessmentData]
              )
            );
            if (Object.keys(updates).length > 0) {
              updateMutation.mutate(updates);
            }
          }} 
          onNext={goNext} 
        />;

      case 10:
        return (
          <QuestionScreen
            header="Phase 2: Architect's Audit (Part D)"
            question="What is your realistic monthly budget for this system?"
            options={[
              { value: 'i', label: '< $8,000 / month' },
              { value: 'ii', label: '$8,000+ / month' },
            ]}
            onSelect={(value) => handleAnswer('q11', value)}
            selected={assessmentData.q11}
          />
        );

      case 11:
        return (
          <EmailCaptureScreen
            assessmentData={assessmentData}
            onUpdate={(data) => {
              setAssessmentData(data);
              const updates: Partial<AssessmentData> = {};
              if (data.q19 !== assessmentData.q19) updates.q19 = data.q19;
              if (data.q20 !== assessmentData.q20) updates.q20 = data.q20;
              if (Object.keys(updates).length > 0) {
                updateMutation.mutate(updates);
              }
            }}
            onNext={handleEmailSubmit}
          />
        );

      case 12:
        return (
          <BranchingScreen onChoice={handleCalculatorChoice} />
        );

      case 13:
        return (
          <CalculatorScreen
            assessmentData={assessmentData}
            onUpdate={setAssessmentData}
            onSubmit={handleFinalSubmit}
          />
        );

      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO 
        title="Pipeline Diagnosis Assessment | Revenue Party"
        description="Take our comprehensive pipeline assessment to discover your GTM bottlenecks and get a personalized diagnosis."
        keywords="pipeline assessment, GTM diagnosis, sales pipeline audit"
        canonical="/pipeline-assessment"
      />

      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Screen {currentScreen + 1} of {totalScreens}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface QuestionScreenProps {
  header: string;
  question: string;
  options: Array<{ value: string; label: string; subtext?: string }>;
  onSelect: (value: string) => void;
  selected?: string;
}

function QuestionScreen({ header, question, options, onSelect, selected }: QuestionScreenProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary mb-2" data-testid="text-header">{header}</p>
        <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-question">{question}</h2>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full text-left p-6 rounded-lg border transition-all group ${
                isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover-elevate active-elevate-2'
              }`}
              data-testid={`option-${option.value}`}
            >
              <div className={`font-semibold text-lg mb-1 transition-colors ${
                isSelected ? 'text-primary' : 'group-hover:text-primary'
              }`}>
                {option.label}
              </div>
              {option.subtext && (
                <p className="text-sm text-muted-foreground">{option.subtext}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TextInputScreenProps {
  header: string;
  question: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

function TextInputScreen({ header, question, value, onChange, onNext }: TextInputScreenProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary mb-2">{header}</p>
        <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-question">{question}</h2>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] text-lg"
        placeholder="Type your answer here..."
        data-testid="textarea-answer"
      />

      <Button 
        onClick={onNext} 
        size="lg" 
        className="w-full md:w-auto"
        data-testid="button-next"
      >
        Next
      </Button>
    </div>
  );
}

interface ConditionalScreenProps {
  assessmentData: AssessmentData;
  onUpdate: (data: AssessmentData) => void;
  onNext: () => void;
}

function ConditionalScreen({ assessmentData, onUpdate, onNext }: ConditionalScreenProps) {
  const q9 = assessmentData.q9;

  const handleSubmit = () => {
    onNext();
  };

  if (q9 === 'i') {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-primary mb-2">Phase 2: Architect's Audit (Part C)</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Let's find out why...</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              How many full-time appointment setters (SDRs/BDRs) do you have?
            </label>
            <Input
              type="number"
              value={assessmentData.q10a1 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q10a1: e.target.value })}
              className="text-lg"
              data-testid="input-q10a1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              How many other people have this responsibility (e.g., AEs, Founders)?
            </label>
            <Input
              type="number"
              value={assessmentData.q10a2 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q10a2: e.target.value })}
              className="text-lg"
              data-testid="input-q10a2"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto" data-testid="button-next">
          Next
        </Button>
      </div>
    );
  }

  if (q9 === 'ii') {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-primary mb-2">Phase 2: Architect's Audit (Part C)</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Let's find out why...</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              How is data (accounts, contacts) provided to your appointment setters?
            </label>
            <div className="space-y-2">
              {[
                { value: 'build', label: 'They build their own lists' },
                { value: 'provider', label: 'We provide lists from a data provider' },
                { value: 'ops', label: 'We have an ops team that builds enriched lists' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ ...assessmentData, q10b1: option.value })}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    assessmentData.q10b1 === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover-elevate'
                  }`}
                  data-testid={`option-q10b1-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Do you have a crystal-clear, written ICP (Ideal Customer Profile)?
            </label>
            <div className="space-y-2">
              {[
                { value: 'yes-enforced', label: 'Yes, and it is rigorously enforced' },
                { value: 'yes-not-enforced', label: "Yes, but it's not really enforced" },
                { value: 'no', label: "No, we don't have a formal ICP" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ ...assessmentData, q10b2: option.value })}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    assessmentData.q10b2 === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover-elevate'
                  }`}
                  data-testid={`option-q10b2-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto" data-testid="button-next">
          Next
        </Button>
      </div>
    );
  }

  if (q9 === 'iii') {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-primary mb-2">Phase 2: Architect's Audit (Part C)</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Let's find out why...</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Is there at least one video of your sales cycle being successfully carried out in a standardized way, that you use for training?
            </label>
            <div className="space-y-2">
              {[
                { value: 'yes', label: 'Yes, we have a clear, repeatable process' },
                { value: 'no', label: 'No, every rep does their own thing' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdate({ ...assessmentData, q10c1: option.value })}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    assessmentData.q10c1 === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover-elevate'
                  }`}
                  data-testid={`option-q10c1-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              What is your actual lead-to-close/win rate (as a %)? (e.g., '5' for 5%)
            </label>
            <Input
              type="number"
              value={assessmentData.q10c2 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q10c2: e.target.value })}
              className="text-lg"
              placeholder="5"
              data-testid="input-q10c2"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto" data-testid="button-next">
          Next
        </Button>
      </div>
    );
  }

  return null;
}

interface EmailCaptureScreenProps {
  assessmentData: AssessmentData;
  onUpdate: (data: AssessmentData) => void;
  onNext: () => void;
}

function EmailCaptureScreen({ assessmentData, onUpdate, onNext }: EmailCaptureScreenProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Architect's Blueprint is ready.</h2>
        <p className="text-lg text-muted-foreground">
          We'll send you a personalized 'Pipeline Diagnosis & Reframe' PDF based on your responses.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Optional: Add any other context about your goals or challenges here.
          </label>
          <Textarea
            value={assessmentData.q19 || ''}
            onChange={(e) => onUpdate({ ...assessmentData, q19: e.target.value })}
            className="min-h-[120px]"
            placeholder="Any additional context..."
            data-testid="textarea-q19"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Where should we send your full, personalized 'Pipeline Diagnosis & Reframe' PDF? *
          </label>
          <Input
            type="email"
            value={assessmentData.q20 || ''}
            onChange={(e) => onUpdate({ ...assessmentData, q20: e.target.value })}
            className="text-lg"
            placeholder="your@email.com"
            required
            data-testid="input-email"
          />
        </div>
      </div>

      <Button 
        onClick={onNext} 
        size="lg" 
        className="w-full md:w-auto"
        disabled={!assessmentData.q20}
        data-testid="button-next"
      >
        Continue
      </Button>
    </div>
  );
}

interface BranchingScreenProps {
  onChoice: (useCalculator: boolean) => void;
}

function BranchingScreen({ onChoice }: BranchingScreenProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">One Last Question...</h2>
        <p className="text-xl text-muted-foreground">How much should I pay per meeting?</p>
      </div>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <Button
          onClick={() => onChoice(true)}
          size="lg"
          variant="outline"
          className="w-full text-lg py-6"
          data-testid="button-calculate"
        >
          Calculate
        </Button>

        <Button
          onClick={() => onChoice(false)}
          size="lg"
          className="w-full text-lg py-8"
          data-testid="button-get-results"
        >
          Get My Results
        </Button>
      </div>
    </div>
  );
}

interface CalculatorScreenProps {
  assessmentData: AssessmentData;
  onUpdate: (data: AssessmentData) => void;
  onSubmit: () => void;
}

function CalculatorScreen({ assessmentData, onUpdate, onSubmit }: CalculatorScreenProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Optional: Pipeline ROI Calculator</h2>
        <p className="text-lg text-muted-foreground">
          Fill in your numbers to add a detailed ROI projection to your report.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Average LTV (Lifetime Value)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={assessmentData.q13 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q13: e.target.value })}
              className="pl-7"
              data-testid="input-q13"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Average Close/Win Rate (%)</label>
          <div className="relative">
            <Input
              type="number"
              value={assessmentData.q14 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q14: e.target.value })}
              data-testid="input-q14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Average Contract Term (months)</label>
          <Input
            type="number"
            value={assessmentData.q15 || ''}
            onChange={(e) => onUpdate({ ...assessmentData, q15: e.target.value })}
            data-testid="input-q15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Gross Margin (%)</label>
          <div className="relative">
            <Input
              type="number"
              value={assessmentData.q16 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q16: e.target.value })}
              data-testid="input-q16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Average Sales Cycle Length (days)</label>
          <Input
            type="number"
            value={assessmentData.q17 || ''}
            onChange={(e) => onUpdate({ ...assessmentData, q17: e.target.value })}
            data-testid="input-q17"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Average Deal Size (ACV)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={assessmentData.q18 || ''}
              onChange={(e) => onUpdate({ ...assessmentData, q18: e.target.value })}
              className="pl-7"
              data-testid="input-q18"
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={onSubmit} 
        size="lg" 
        className="w-full md:w-auto text-lg py-6"
        data-testid="button-get-results"
      >
        Get My Results
      </Button>
    </div>
  );
}
