import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from "@shared/schema";

type AssessmentPhase = "email-capture" | "questions" | "post-email-capture" | "complete";

interface AnswerData {
  nextQuestionId?: string;
  resultBucketKey?: string;
}

const emailCaptureSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

const isQuestionVisible = (
  question: AssessmentQuestion,
  userAnswers: Record<string, string>,
  allQuestions: AssessmentQuestion[]
): boolean => {
  if (!question.conditionalLogic) return true;
  
  try {
    const condition = JSON.parse(question.conditionalLogic);
    if (condition.questionId && condition.answerId) {
      return userAnswers[condition.questionId] === condition.answerId;
    }
  } catch {
    return true;
  }
  
  return true;
};

interface AssessmentRuntimeProps {
  slugProp?: string;
}

export default function AssessmentRuntime({ slugProp }: AssessmentRuntimeProps = {}) {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = slugProp || urlSlug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [phase, setPhase] = useState<AssessmentPhase>("email-capture");
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [emailData, setEmailData] = useState<EmailCaptureFormData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Separate form instances for pre-gate and post-gate to avoid validation conflicts
  const preGateEmailForm = useForm<EmailCaptureFormData>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: "",
      name: "",
      company: "",
    },
  });

  const postGateEmailForm = useForm<EmailCaptureFormData>({
    resolver: zodResolver(emailCaptureSchema),
    defaultValues: {
      email: "",
      name: "",
      company: "",
    },
  });

  const { data: config, isLoading: isLoadingConfig } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/slug/${slug}`],
  });

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${config?.id}/questions`],
    enabled: !!config?.id,
  });

  const { data: allAnswers = [], isLoading: isLoadingAnswers } = useQuery<AssessmentAnswer[]>({
    queryKey: [`/api/assessment-configs/${config?.id}/answers`],
    enabled: !!config?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { answers: Array<{ questionId: string; answerId: string }>; email?: string; name?: string; company?: string }) => {
      const response = await apiRequest('POST', `/api/configurable-assessments/${config!.id}/submit`, data);
      return response.json();
    },
    onSuccess: (response) => {
      setSessionId(response.sessionId);
      
      if (config?.gateBehavior === "POST_GATED") {
        // Show email capture form
        setPhase("post-email-capture");
      } else {
        // Navigate to results (PRE_GATED or UNGATED)
        setLocation(`/assessments/results/${response.sessionId}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const captureLeadMutation = useMutation({
    mutationFn: async (data: EmailCaptureFormData) => {
      const response = await apiRequest('PUT', `/api/configurable-assessments/sessions/${sessionId}/capture-lead`, data);
      return response.json();
    },
    onSuccess: (response) => {
      setLocation(response.resultUrl);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.order - b.order);
  }, [questions]);

  const visibleQuestions = useMemo(() => {
    return sortedQuestions.filter(q => isQuestionVisible(q, answers, sortedQuestions));
  }, [sortedQuestions, answers]);

  // Initialize phase based on gate behavior
  useEffect(() => {
    if (!config) return;
    
    if (config.gateBehavior === "PRE_GATED") {
      setPhase("email-capture");
    } else {
      setPhase("questions");
      // Set initial question
      if (sortedQuestions.length > 0 && !currentQuestionId) {
        const initialId = config.entryQuestionId || sortedQuestions[0]?.id;
        setCurrentQuestionId(initialId);
      }
    }
  }, [config, sortedQuestions, currentQuestionId]);

  // Set initial question when moving to questions phase
  useEffect(() => {
    if (phase === "questions" && !currentQuestionId && sortedQuestions.length > 0) {
      const initialId = config?.entryQuestionId || sortedQuestions[0]?.id;
      setCurrentQuestionId(initialId);
    }
  }, [phase, currentQuestionId, sortedQuestions, config]);

  const handlePreEmailSubmit = preGateEmailForm.handleSubmit((data) => {
    setEmailData(data);
    setPhase("questions");
    
    // Set initial question
    if (sortedQuestions.length > 0) {
      const initialId = config?.entryQuestionId || sortedQuestions[0]?.id;
      setCurrentQuestionId(initialId);
    }
  });

  const handleAnswerClick = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    const selectedAnswer = allAnswers.find((a) => a.id === answerId);
    if (!selectedAnswer) return;

    let answerData: AnswerData = {};
    
    try {
      const parsedValue = JSON.parse(selectedAnswer.answerValue);
      if (parsedValue.nextQuestionId) answerData.nextQuestionId = parsedValue.nextQuestionId;
      if (parsedValue.resultBucketKey) answerData.resultBucketKey = parsedValue.resultBucketKey;
    } catch {
      // answerValue is just a string, not JSON
    }
    
    // Check if we've reached a terminal bucket (decision-tree early termination)
    if (answerData.resultBucketKey) {
      handleAssessmentComplete(newAnswers);
      return;
    }
    
    // Find next question
    let nextQuestionId: string | null = null;
    
    if (answerData.nextQuestionId) {
      // Use explicit next question from answer (decision-tree routing)
      const targetQuestion = sortedQuestions.find(q => q.id === answerData.nextQuestionId);
      if (targetQuestion && isQuestionVisible(targetQuestion, newAnswers, sortedQuestions)) {
        nextQuestionId = answerData.nextQuestionId;
      } else {
        // If explicit next question is hidden, fall back to sequential search
        // This handles conditional visibility in decision-tree routing
        const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
        for (let i = currentIndex + 1; i < sortedQuestions.length; i++) {
          if (isQuestionVisible(sortedQuestions[i], newAnswers, sortedQuestions)) {
            nextQuestionId = sortedQuestions[i].id;
            break;
          }
        }
      }
    } else {
      // Find next sequential visible question
      const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
      for (let i = currentIndex + 1; i < sortedQuestions.length; i++) {
        if (isQuestionVisible(sortedQuestions[i], newAnswers, sortedQuestions)) {
          nextQuestionId = sortedQuestions[i].id;
          break;
        }
      }
    }
    
    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
    } else {
      // No more questions - submit assessment
      handleAssessmentComplete(newAnswers);
    }
  };

  const handleAssessmentComplete = (finalAnswers: Record<string, string>) => {
    const answersArray = Object.entries(finalAnswers).map(([questionId, answerId]) => ({
      questionId,
      answerId,
    }));

    const submissionData = {
      answers: answersArray,
      ...(emailData && {
        email: emailData.email,
        name: emailData.name,
        company: emailData.company,
      }),
    };

    submitMutation.mutate(submissionData);
  };

  const handlePostEmailSubmit = postGateEmailForm.handleSubmit((data) => {
    captureLeadMutation.mutate(data);
  });

  const isLoading = isLoadingConfig || isLoadingQuestions || isLoadingAnswers;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4">
          <CardContent className="py-12 text-center text-muted-foreground">
            Assessment not found or not published
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = sortedQuestions.find(q => q.id === currentQuestionId);
  const currentQuestionIndex = visibleQuestions.findIndex(q => q.id === currentQuestionId);
  const totalQuestions = config.scoringMethod === "points-based" ? visibleQuestions.length : sortedQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <>
      <Helmet>
        <title>{config.title} | Assessment</title>
        <meta name="description" content={config.description || "Take this assessment"} />
      </Helmet>

      <div className="min-h-screen bg-background py-8 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-assessment-title">
              {config.title}
            </h1>
            {config.description && (
              <p className="text-lg text-muted-foreground" data-testid="text-assessment-description">
                {config.description}
              </p>
            )}
          </div>

          {/* PRE_GATED: Email Capture Before Questions */}
          {phase === "email-capture" && (
            <Card className="border-2" data-testid="card-email-capture-pre">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Get Your Results
                </CardTitle>
                <CardDescription>
                  Enter your details to begin the assessment and receive your personalized results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...preGateEmailForm.register("email")}
                      data-testid="input-email"
                    />
                    {preGateEmailForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{preGateEmailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      {...preGateEmailForm.register("name")}
                      data-testid="input-name"
                    />
                    {preGateEmailForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{preGateEmailForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Your company (optional)"
                      {...preGateEmailForm.register("company")}
                      data-testid="input-company"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" data-testid="button-start-assessment">
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Questions Phase */}
          {phase === "questions" && currentQuestion && (
            <>
              {/* Progress Bar */}
              {totalQuestions > 1 && (
                <div className="mb-6" data-testid="progress-bar">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Card className="border-2 hover-elevate overflow-visible" data-testid="card-question">
                <CardHeader>
                  <CardTitle className="text-2xl" data-testid="text-question-title">
                    {currentQuestion.questionText}
                  </CardTitle>
                  {currentQuestion.description && (
                    <CardDescription data-testid="text-question-description">
                      {currentQuestion.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {allAnswers
                    .filter((a) => a.questionId === currentQuestion.id)
                    .sort((a, b) => a.order - b.order)
                    .map((answer) => {
                      let answerText = answer.answerText;
                      let answerDescription: string | undefined;
                      
                      try {
                        const parsed = JSON.parse(answer.answerValue);
                        if (parsed.text) answerText = parsed.text;
                        if (parsed.description) answerDescription = parsed.description;
                      } catch {
                        // answerValue is not JSON
                      }

                      return (
                        <Button
                          key={answer.id}
                          variant="outline"
                          size="lg"
                          className="w-full justify-between text-left h-auto py-4 px-6"
                          onClick={() => handleAnswerClick(currentQuestion.id, answer.id)}
                          disabled={submitMutation.isPending}
                          data-testid={`button-answer-${answer.id}`}
                        >
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{answerText}</div>
                            {answerDescription && (
                              <div className="text-sm text-muted-foreground">
                                {answerDescription}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0" />
                        </Button>
                      );
                    })}
                </CardContent>
              </Card>
            </>
          )}

          {/* POST_GATED: Email Capture After Questions */}
          {phase === "post-email-capture" && (
            <Card className="border-2" data-testid="card-email-capture-post">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Get Your Results
                </CardTitle>
                <CardDescription>
                  You've completed the assessment! Enter your details to view your personalized results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-email">Email *</Label>
                    <Input
                      id="post-email"
                      type="email"
                      placeholder="your@email.com"
                      {...postGateEmailForm.register("email")}
                      data-testid="input-email-post"
                    />
                    {postGateEmailForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{postGateEmailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-name">Name *</Label>
                    <Input
                      id="post-name"
                      type="text"
                      placeholder="Your name"
                      {...postGateEmailForm.register("name")}
                      data-testid="input-name-post"
                    />
                    {postGateEmailForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{postGateEmailForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-company">Company</Label>
                    <Input
                      id="post-company"
                      type="text"
                      placeholder="Your company (optional)"
                      {...postGateEmailForm.register("company")}
                      data-testid="input-company-post"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={captureLeadMutation.isPending}
                    data-testid="button-get-results"
                  >
                    {captureLeadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Get My Results
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading State During Submission */}
          {submitMutation.isPending && phase === "questions" && (
            <Card className="border-2 mt-6">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Calculating your results...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
