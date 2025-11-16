import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from "@shared/schema";
import { useAnnouncer } from './AccessibilityAnnouncer';

interface ConfigurableAssessmentProps {
  configSlug: string;
  mode?: "inline" | "standalone";
}

interface QuestionData {
  text: string;
  description?: string;
}

interface AnswerData {
  text: string;
  description?: string;
  nextQuestionId?: string;
  resultBucketKey?: string;
}

interface ConditionalLogic {
  questionId: string;
  answerId: string;
}

const parseConditionalLogic = (conditionalLogic: string | null | undefined): ConditionalLogic | null => {
  if (!conditionalLogic) return null;
  try {
    const parsed = JSON.parse(conditionalLogic);
    if (parsed.questionId && parsed.answerId) {
      return { questionId: parsed.questionId, answerId: parsed.answerId };
    }
    return null;
  } catch {
    return null;
  }
};

const isQuestionVisible = (
  question: AssessmentQuestion,
  userAnswers: Record<string, string>,
  allQuestions: AssessmentQuestion[]
): boolean => {
  const condition = parseConditionalLogic(question.conditionalLogic);

  if (!condition) {
    return true;
  }

  const referencedQuestion = allQuestions.find(q => q.id === condition.questionId);
  if (!referencedQuestion) {
    return false;
  }

  return userAnswers[condition.questionId] === condition.answerId;
};

export function ConfigurableAssessment({ configSlug, mode = "standalone" }: ConfigurableAssessmentProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { announce } = useAnnouncer();
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem(`assessment_session_${configSlug}`);
    if (existing) return existing;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`assessment_session_${configSlug}`, newId);
    return newId;
  });

  const { data: config, isLoading } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/slug/${configSlug}`],
  });

  const { data: questions = [] } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${config?.id}/questions`],
    enabled: !!config?.id,
  });

  const { data: allAnswers = [] } = useQuery<AssessmentAnswer[]>({
    queryKey: [`/api/assessment-configs/${config?.id}/answers`],
    enabled: !!config?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { assessmentId: string; [key: string]: string }) => {
      const response = await apiRequest('POST', `/api/assessments/${sessionId}/submit`, data);
      return response.json();
    },
    onSuccess: (response) => {
      localStorage.removeItem(`assessment_session_${configSlug}`);
      setLocation(`/resources/${configSlug}/${response.bucket}`);
    },
  });

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.order - b.order);
  }, [questions]);

  useEffect(() => {
    if (currentQuestionId === null && sortedQuestions.length > 0 && config) {
      let initialQuestionId: string | null = null;

      if (config.entryQuestionId) {
        const entryQuestion = sortedQuestions.find(q => q.id === config.entryQuestionId);
        if (entryQuestion && isQuestionVisible(entryQuestion, answers, sortedQuestions)) {
          initialQuestionId = config.entryQuestionId;
        }
      }

      if (!initialQuestionId) {
        for (const question of sortedQuestions) {
          if (isQuestionVisible(question, answers, sortedQuestions)) {
            initialQuestionId = question.id;
            break;
          }
        }
      }

      if (initialQuestionId) {
        setCurrentQuestionId(initialQuestionId);
      }
    }
  }, [currentQuestionId, sortedQuestions, config, answers]);

  useEffect(() => {
    if (currentQuestionId && sortedQuestions.length > 0 && config) {
      const current = sortedQuestions.find(q => q.id === currentQuestionId);
      if (current && !isQuestionVisible(current, answers, sortedQuestions)) {
        const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestionId);
        let nextVisibleId: string | null = null;

        for (let i = currentIndex + 1; i < sortedQuestions.length; i++) {
          if (isQuestionVisible(sortedQuestions[i], answers, sortedQuestions)) {
            nextVisibleId = sortedQuestions[i].id;
            break;
          }
        }

        if (nextVisibleId) {
          setCurrentQuestionId(nextVisibleId);
        } else {
          // Current question became hidden and no subsequent visible questions found
          // Finalize the assessment to prevent user from being stuck

          if (config.scoringMethod === 'points') {
            // Submit the assessment for points calculation
            // The backend will calculate the score and route to the appropriate bucket
            submitMutation.mutate({
              assessmentId: config.id,
              ...answers,
            });
          } else {
            // Decision tree: show toast and reset to entry question
            toast({
              title: "Assessment Updated",
              description: "Your previous answer changed which questions are visible. Restarting assessment.",
              variant: "default",
            });

            // Reset to entry question to prevent user from being stuck
            setAnswers({});
            const initialQuestionId = config.entryQuestionId || sortedQuestions[0]?.id;
            if (initialQuestionId) {
              setCurrentQuestionId(initialQuestionId);
            }
          }
        }
      }
    }
  }, [answers, currentQuestionId, sortedQuestions, config, toast, submitMutation]);

  if (isLoading) {
    return (
      <Card className="border-2" data-testid="card-assessment-loading">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!config || questions.length === 0) {
    return (
      <Card className="border-2" data-testid="card-assessment-not-found">
        <CardContent className="py-12 text-center text-muted-foreground">
          Assessment not found or not configured
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = sortedQuestions.find(q => q.id === currentQuestionId);

  if (!currentQuestion) {
    return null;
  }

  const questionData: QuestionData = currentQuestion.questionText
    ? { text: currentQuestion.questionText, description: currentQuestion.description || undefined }
    : { text: "Question" };

  const questionAnswers = allAnswers
    .filter((a) => a.questionId === currentQuestion.id)
    .sort((a, b) => a.order - b.order);

  const handleAnswerClick = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    const selectedAnswer = allAnswers.find((a) => a.id === answerId);
    if (!selectedAnswer) return;

    let answerData: AnswerData = { text: selectedAnswer.answerText };

    try {
      const parsedValue = JSON.parse(selectedAnswer.answerValue);
      if (parsedValue.nextQuestionId) {
        answerData.nextQuestionId = parsedValue.nextQuestionId;
      }
      if (parsedValue.resultBucketKey) {
        answerData.resultBucketKey = parsedValue.resultBucketKey;
      }
    } catch {
      // answerValue is just a string, not JSON
    }

    if (answerData.resultBucketKey) {
      if (config?.scoringMethod === 'points') {
        submitMutation.mutate({
          assessmentId: config.id,
          ...newAnswers,
        });
      } else {
        const queryParams = new URLSearchParams();
        Object.entries(newAnswers).forEach(([qId, aId]) => {
          queryParams.append(`q${qId}`, aId);
        });
        setLocation(`/resources/${configSlug}/${answerData.resultBucketKey}?${queryParams.toString()}`);
      }
      return;
    }

    let nextQuestionId: string | null = null;
    let startIndex = 0;

    if (answerData.nextQuestionId) {
      const targetIndex = sortedQuestions.findIndex(q => q.id === answerData.nextQuestionId);
      if (targetIndex !== -1) {
        startIndex = targetIndex;
      } else {
        console.warn(`nextQuestionId ${answerData.nextQuestionId} not found in questions list`);
        const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
        startIndex = currentIndex !== -1 ? currentIndex + 1 : 0;
      }
    } else {
      const currentIndex = sortedQuestions.findIndex(q => q.id === questionId);
      startIndex = currentIndex !== -1 ? currentIndex + 1 : 0;
    }

    const visitedIndices = new Set<number>();
    for (let i = startIndex; i < sortedQuestions.length; i++) {
      if (visitedIndices.has(i)) {
        console.warn('Infinite loop detected in question navigation');
        break;
      }
      visitedIndices.add(i);

      const question = sortedQuestions[i];
      if (isQuestionVisible(question, newAnswers, sortedQuestions)) {
        nextQuestionId = question.id;
        announce(`Navigating to question: ${question.questionText}`);
        break;
      }

      if (visitedIndices.size > sortedQuestions.length) {
        console.warn('Loop guard: exceeded maximum iterations');
        break;
      }
    }

    if (nextQuestionId) {
      setCurrentQuestionId(nextQuestionId);
    } else {
      // No more visible questions found after answering current question

      if (config?.scoringMethod === 'points') {
        // Submit the assessment for points calculation
        // The backend will calculate the score and route to the appropriate bucket
        submitMutation.mutate({
          assessmentId: config.id,
          ...newAnswers,
        });
      } else {
        // Decision tree is incomplete - no result bucket configured for this path
        console.error('Assessment decision tree is incomplete - no result bucket configured for this path');

        // Show user-friendly message
        toast({
          title: "Assessment Complete",
          description: "Assessment complete, but no result was configured for this path. Restarting assessment.",
          variant: "default",
        });

        // Reset to entry question to prevent user from being stuck
        setAnswers({});
        const initialQuestionId = config?.entryQuestionId || sortedQuestions[0]?.id;
        if (initialQuestionId) {
          setCurrentQuestionId(initialQuestionId);
        }
      }
    }
  };

  return (
    <Card className="border-2 hover-elevate overflow-visible" data-testid="card-assessment-widget" role="region" aria-label="Assessment questions">
      <CardHeader>
        <CardTitle className="text-2xl" data-testid="text-question-title" role="heading" aria-level="1">
          {questionData.text}
        </CardTitle>
        {questionData.description && (
          <CardDescription data-testid="text-question-description">
            {questionData.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {questionAnswers.map((answer) => {
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
              onClick={() => {
                handleAnswerClick(currentQuestion.id, answer.id);
                announce(`Selected answer: ${answerText}.`);
              }}
              data-testid={`button-answer-${answer.id}`}
              role="radio"
              aria-checked={answers[currentQuestion.id] === answer.id}
              aria-label={answerText}
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
  );
}