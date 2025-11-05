import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import type { AssessmentConfig, AssessmentQuestion, AssessmentAnswer } from "@shared/schema";

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

export function ConfigurableAssessment({ configSlug, mode = "standalone" }: ConfigurableAssessmentProps) {
  const [, setLocation] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  
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
    
    if (answerData.nextQuestionId) {
      const nextIndex = sortedQuestions.findIndex((q) => q.id === answerData.nextQuestionId);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
      }
    } else if (answerData.resultBucketKey) {
      const queryParams = new URLSearchParams();
      Object.entries(newAnswers).forEach(([qId, aId]) => {
        queryParams.append(`q${qId}`, aId);
      });
      setLocation(`/resources/${configSlug}/${answerData.resultBucketKey}?${queryParams.toString()}`);
    }
  };

  return (
    <Card className="border-2 hover-elevate overflow-visible" data-testid="card-assessment-widget">
      <CardHeader>
        <CardTitle className="text-2xl" data-testid="text-question-title">
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
              onClick={() => handleAnswerClick(currentQuestion.id, answer.id)}
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
  );
}
