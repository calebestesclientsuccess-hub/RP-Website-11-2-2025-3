import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Edit2, Save, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  insertAssessmentQuestionSchema,
  insertAssessmentAnswerSchema,
  type AssessmentQuestion,
  type AssessmentAnswer,
  type AssessmentResultBucket,
  type AssessmentConfig,
} from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const questionFormSchema = insertAssessmentQuestionSchema.omit({ assessmentId: true });
const answerFormSchema = insertAssessmentAnswerSchema.omit({ questionId: true }).extend({
  routingType: z.enum(["question", "result"]),
  nextQuestionId: z.string().optional(),
  resultBucketKey: z.string().optional(),
});

interface FlowBuilderProps {
  assessmentId: string;
  scoringMethod?: string;
}

export function FlowBuilder({ assessmentId, scoringMethod = "decision-tree" }: FlowBuilderProps) {
  const { toast } = useToast();
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<AssessmentQuestion | null>(null);
  const [deleteConfirmAnswer, setDeleteConfirmAnswer] = useState<AssessmentAnswer | null>(null);
  const [addingAnswerToQuestion, setAddingAnswerToQuestion] = useState<string | null>(null);

  const { data: assessmentConfig, isLoading: isLoadingConfig } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/${assessmentId}`],
  });

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/questions`],
  });

  const { data: allAnswers = [], isLoading: isLoadingAnswers } = useQuery<AssessmentAnswer[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/answers`],
  });

  const { data: buckets = [] } = useQuery<AssessmentResultBucket[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/results`],
  });

  const questionForm = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      description: "",
      order: 1,
      questionType: "single-choice",
      conditionalLogic: "",
    },
  });

  const answerForm = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      answerText: "",
      answerValue: "{}",
      points: undefined,
      order: 1,
      routingType: "question",
      nextQuestionId: "",
      resultBucketKey: "",
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof questionFormSchema>) => {
      const response = await apiRequest("POST", `/api/assessment-configs/${assessmentId}/questions`, {
        ...data,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
      toast({
        title: "Success",
        description: "Question created successfully",
      });
      setEditingQuestionId(null);
      questionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof questionFormSchema> }) => {
      const response = await apiRequest("PUT", `/api/assessment-questions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      setEditingQuestionId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/assessment-questions/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      setDeleteConfirmQuestion(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: z.infer<typeof answerFormSchema> }) => {
      const { routingType, nextQuestionId, resultBucketKey, ...answerData } = data;
      
      const routingValue = routingType === "question"
        ? JSON.stringify({ nextQuestionId })
        : JSON.stringify({ resultBucketKey });

      const response = await apiRequest("POST", `/api/assessment-questions/${questionId}/answers`, {
        ...answerData,
        answerValue: routingValue,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Answer created successfully",
      });
      setAddingAnswerToQuestion(null);
      answerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create answer",
        variant: "destructive",
      });
    },
  });

  const updateAnswerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof answerFormSchema> }) => {
      const { routingType, nextQuestionId, resultBucketKey, ...answerData } = data;
      
      const routingValue = routingType === "question"
        ? JSON.stringify({ nextQuestionId })
        : JSON.stringify({ resultBucketKey });

      const response = await apiRequest("PUT", `/api/assessment-answers/${id}`, {
        ...answerData,
        answerValue: routingValue,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Answer updated successfully",
      });
      setEditingAnswerId(null);
      answerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update answer",
        variant: "destructive",
      });
    },
  });

  const deleteAnswerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/assessment-answers/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Answer deleted successfully",
      });
      setDeleteConfirmAnswer(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete answer",
        variant: "destructive",
      });
    },
  });

  const setEntryQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiRequest("PUT", `/api/assessment-configs/${assessmentId}`, {
        entryQuestionId: questionId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessment-configs/${assessmentId}`] });
      toast({
        title: "Success",
        description: "Start question updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set start question",
        variant: "destructive",
      });
    },
  });

  const handleAddQuestion = () => {
    questionForm.reset({
      questionText: "",
      description: "",
      order: questions.length + 1,
      questionType: "single-choice",
      conditionalLogic: "",
    });
    setEditingQuestionId("new");
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    questionForm.reset({
      questionText: question.questionText,
      description: question.description || "",
      order: question.order,
      questionType: question.questionType,
      conditionalLogic: question.conditionalLogic || "",
    });
    setEditingQuestionId(question.id);
  };

  const handleSaveQuestion = (questionId: string) => {
    const data = questionForm.getValues();
    if (questionId === "new") {
      createQuestionMutation.mutate(data);
    } else {
      updateQuestionMutation.mutate({ id: questionId, data });
    }
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    questionForm.reset();
  };

  const handleAddAnswer = (questionId: string) => {
    const questionAnswers = getAnswersForQuestion(questionId);
    answerForm.reset({
      answerText: "",
      answerValue: "{}",
      points: undefined,
      order: questionAnswers.length + 1,
      routingType: "question",
      nextQuestionId: "",
      resultBucketKey: "",
    });
    setAddingAnswerToQuestion(questionId);
  };

  const handleEditAnswer = (answer: AssessmentAnswer) => {
    let routing: any = {};
    try {
      routing = JSON.parse(answer.answerValue);
    } catch (e) {
      console.error("Failed to parse answer value:", e);
    }

    answerForm.reset({
      answerText: answer.answerText,
      answerValue: answer.answerValue,
      points: answer.points !== null ? answer.points : undefined,
      order: answer.order,
      routingType: routing.nextQuestionId ? "question" : "result",
      nextQuestionId: routing.nextQuestionId || "",
      resultBucketKey: routing.resultBucketKey || "",
    });
    setEditingAnswerId(answer.id);
    setAddingAnswerToQuestion(null);
  };

  const handleSaveAnswer = (answerId: string) => {
    const data = answerForm.getValues();
    if (addingAnswerToQuestion) {
      createAnswerMutation.mutate({ questionId: addingAnswerToQuestion, data });
    } else {
      updateAnswerMutation.mutate({ id: answerId, data });
    }
  };

  const handleCancelEditAnswer = () => {
    setEditingAnswerId(null);
    setAddingAnswerToQuestion(null);
    answerForm.reset();
  };

  const getAnswersForQuestion = (questionId: string) => {
    return allAnswers.filter(a => a.questionId === questionId).sort((a, b) => a.order - b.order);
  };

  const getRoutingLabel = (answer: AssessmentAnswer) => {
    try {
      const routing = JSON.parse(answer.answerValue);
      if (routing.nextQuestionId) {
        const nextQ = questions.find(q => q.id === routing.nextQuestionId);
        return nextQ ? `→ Question ${nextQ.order}` : "→ Unknown Question";
      }
      if (routing.resultBucketKey) {
        const bucket = buckets.find(b => b.bucketKey === routing.resultBucketKey);
        return bucket ? `→ Result: ${bucket.bucketName}` : "→ Unknown Result";
      }
    } catch (e) {
      return "→ Invalid routing";
    }
    return "→ No routing";
  };

  if (isLoadingQuestions || isLoadingAnswers || isLoadingConfig) {
    return (
      <div className="flex justify-center items-center py-12" data-testid="loading-flow-builder">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Flow Builder</h3>
          <p className="text-sm text-muted-foreground">
            Build your assessment flow by managing questions and their answer options
          </p>
        </div>
      </div>

      {questions.length === 0 && editingQuestionId !== "new" ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground space-y-4">
              <p>No questions yet. Add your first question to get started.</p>
              <Button onClick={handleAddQuestion} data-testid="button-add-first-question">
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-3">
          {questions.map((question) => {
            const isStartQuestion = assessmentConfig?.entryQuestionId === question.id;
            const answers = getAnswersForQuestion(question.id);
            const isEditing = editingQuestionId === question.id;

            return (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="border rounded-lg"
                data-testid={`question-accordion-${question.id}`}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium">
                        Question {question.order}
                      </span>
                      {isStartQuestion && (
                        <Badge variant="default" className="gap-1" data-testid={`badge-start-${question.id}`}>
                          <Star className="w-3 h-3" />
                          Start
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {question.questionText.substring(0, 60)}
                        {question.questionText.length > 60 ? "..." : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" data-testid={`badge-answers-count-${question.id}`}>
                        {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuestion(question);
                        }}
                        data-testid={`button-edit-question-${question.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmQuestion(question);
                        }}
                        data-testid={`button-delete-question-${question.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {isEditing ? (
                      <Form {...questionForm}>
                        <form className="space-y-4 p-4 border rounded-lg bg-muted/50">
                          <FormField
                            control={questionForm.control}
                            name="questionText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question Text</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="What is your primary business goal?"
                                    data-testid={`input-question-text-${question.id}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={questionForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={field.value || ""}
                                    placeholder="Additional context or instructions"
                                    rows={2}
                                    data-testid={`input-question-description-${question.id}`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={questionForm.control}
                            name="order"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid={`input-question-order-${question.id}`}
                                  />
                                </FormControl>
                                <FormDescription>Display order (1 = first)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveQuestion(question.id)}
                              disabled={updateQuestionMutation.isPending}
                              data-testid={`button-save-question-${question.id}`}
                            >
                              {updateQuestionMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEditQuestion}
                              disabled={updateQuestionMutation.isPending}
                              data-testid={`button-cancel-question-${question.id}`}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{question.questionText}</p>
                        {question.description && (
                          <p className="text-sm text-muted-foreground">{question.description}</p>
                        )}
                        {!isStartQuestion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2"
                            onClick={() => setEntryQuestionMutation.mutate(question.id)}
                            disabled={setEntryQuestionMutation.isPending}
                            data-testid={`button-set-start-${question.id}`}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Set as Start Question
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold">Answers</h4>
                      
                      {answers.map((answer) => {
                        const isEditingAnswer = editingAnswerId === answer.id;

                        return isEditingAnswer ? (
                          <Form key={answer.id} {...answerForm}>
                            <form className="space-y-4 p-4 border rounded-lg bg-card">
                              <FormField
                                control={answerForm.control}
                                name="answerText"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Answer Text</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Yes, we have a dedicated sales team"
                                        data-testid={`input-answer-text-${answer.id}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {scoringMethod === "points" && (
                                <FormField
                                  control={answerForm.control}
                                  name="points"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Points</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          value={field.value ?? ""}
                                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                          placeholder="0"
                                          data-testid={`input-answer-points-${answer.id}`}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <FormField
                                control={answerForm.control}
                                name="routingType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Routing Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid={`select-routing-type-${answer.id}`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="question">Go to Next Question</SelectItem>
                                        <SelectItem value="result">Show Result</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {answerForm.watch("routingType") === "question" && (
                                <FormField
                                  control={answerForm.control}
                                  name="nextQuestionId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Next Question</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid={`select-next-question-${answer.id}`}>
                                            <SelectValue placeholder="Select next question" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {questions.map((q) => (
                                            <SelectItem key={q.id} value={q.id}>
                                              Q{q.order}: {q.questionText.substring(0, 50)}...
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              {answerForm.watch("routingType") === "result" && (
                                <FormField
                                  control={answerForm.control}
                                  name="resultBucketKey"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Result Bucket</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid={`select-result-bucket-${answer.id}`}>
                                            <SelectValue placeholder="Select result bucket" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {buckets.map((bucket) => (
                                            <SelectItem key={bucket.id} value={bucket.bucketKey}>
                                              {bucket.bucketName}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleSaveAnswer(answer.id)}
                                  disabled={updateAnswerMutation.isPending}
                                  data-testid={`button-save-answer-${answer.id}`}
                                >
                                  {updateAnswerMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="w-4 h-4 mr-2" />
                                      Save
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEditAnswer}
                                  disabled={updateAnswerMutation.isPending}
                                  data-testid={`button-cancel-answer-${answer.id}`}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        ) : (
                          <Card key={answer.id} data-testid={`answer-card-${answer.id}`}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{answer.answerText}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {getRoutingLabel(answer)}
                                    </p>
                                    {scoringMethod === "points" && answer.points !== null && (
                                      <Badge variant="secondary" className="text-xs">
                                        {answer.points} pts
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditAnswer(answer)}
                                    data-testid={`button-edit-answer-${answer.id}`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteConfirmAnswer(answer)}
                                    data-testid={`button-delete-answer-${answer.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {addingAnswerToQuestion === question.id && (
                        <Form {...answerForm}>
                          <form className="space-y-4 p-4 border rounded-lg bg-card">
                            <FormField
                              control={answerForm.control}
                              name="answerText"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Answer Text</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Yes, we have a dedicated sales team"
                                      data-testid={`input-new-answer-text-${question.id}`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {scoringMethod === "points" && (
                              <FormField
                                control={answerForm.control}
                                name="points"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Points</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                        placeholder="0"
                                        data-testid={`input-new-answer-points-${question.id}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            <FormField
                              control={answerForm.control}
                              name="routingType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Routing Type</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid={`select-new-routing-type-${question.id}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="question">Go to Next Question</SelectItem>
                                      <SelectItem value="result">Show Result</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {answerForm.watch("routingType") === "question" && (
                              <FormField
                                control={answerForm.control}
                                name="nextQuestionId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Next Question</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid={`select-new-next-question-${question.id}`}>
                                          <SelectValue placeholder="Select next question" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {questions.map((q) => (
                                          <SelectItem key={q.id} value={q.id}>
                                            Q{q.order}: {q.questionText.substring(0, 50)}...
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {answerForm.watch("routingType") === "result" && (
                              <FormField
                                control={answerForm.control}
                                name="resultBucketKey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Result Bucket</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid={`select-new-result-bucket-${question.id}`}>
                                          <SelectValue placeholder="Select result bucket" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {buckets.map((bucket) => (
                                          <SelectItem key={bucket.id} value={bucket.bucketKey}>
                                            {bucket.bucketName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveAnswer("new")}
                                disabled={createAnswerMutation.isPending}
                                data-testid={`button-save-new-answer-${question.id}`}
                              >
                                {createAnswerMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Answer
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEditAnswer}
                                disabled={createAnswerMutation.isPending}
                                data-testid={`button-cancel-new-answer-${question.id}`}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={!!addingAnswerToQuestion || !!editingAnswerId}
                        data-testid={`button-add-answer-${question.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Answer
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {editingQuestionId === "new" && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <Form {...questionForm}>
                  <form className="space-y-4">
                    <h4 className="text-sm font-semibold">New Question</h4>
                    
                    <FormField
                      control={questionForm.control}
                      name="questionText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What is your primary business goal?"
                              data-testid="input-new-question-text"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={questionForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Additional context or instructions"
                              rows={2}
                              data-testid="input-new-question-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={questionForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-new-question-order"
                            />
                          </FormControl>
                          <FormDescription>Display order (1 = first)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSaveQuestion("new")}
                        disabled={createQuestionMutation.isPending}
                        data-testid="button-save-new-question"
                      >
                        {createQuestionMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Create Question
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEditQuestion}
                        disabled={createQuestionMutation.isPending}
                        data-testid="button-cancel-new-question"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </Accordion>
      )}

      {questions.length > 0 && editingQuestionId !== "new" && (
        <Button onClick={handleAddQuestion} data-testid="button-add-question">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      )}

      <AlertDialog open={!!deleteConfirmQuestion} onOpenChange={() => setDeleteConfirmQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question and all its answers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-question">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmQuestion && deleteQuestionMutation.mutate(deleteConfirmQuestion.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-question"
            >
              {deleteQuestionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Question"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirmAnswer} onOpenChange={() => setDeleteConfirmAnswer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Answer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this answer choice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-answer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmAnswer && deleteAnswerMutation.mutate(deleteConfirmAnswer.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-answer"
            >
              {deleteAnswerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Answer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
