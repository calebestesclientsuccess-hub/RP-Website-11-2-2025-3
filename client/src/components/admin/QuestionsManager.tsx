import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit2, GripVertical, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  insertAssessmentQuestionSchema,
  type AssessmentQuestion,
  type AssessmentAnswer,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const formSchema = insertAssessmentQuestionSchema.omit({ assessmentId: true });

interface QuestionsManagerProps {
  assessmentId: string;
}

export function QuestionsManager({ assessmentId }: QuestionsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<AssessmentQuestion | null>(null);
  
  // Conditional logic state
  const [enableConditionalLogic, setEnableConditionalLogic] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>("");

  const { data: assessmentConfig, isLoading: isLoadingConfig } = useQuery<AssessmentConfig>({
    queryKey: [`/api/assessment-configs/${assessmentId}`],
  });

  const { data: questions = [], isLoading } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/questions`],
  });

  // Fetch answers for selected question (for conditional logic)
  const { data: availableAnswers = [], isLoading: isLoadingAnswers, error: answersError } = useQuery<AssessmentAnswer[]>({
    queryKey: ['/api/assessment-questions', selectedQuestionId, 'answers'],
    enabled: !!selectedQuestionId && enableConditionalLogic,
    refetchOnMount: true,
  });

  // Debug logging for conditional logic
  useEffect(() => {
    console.log('[QuestionsManager] selectedQuestionId changed:', selectedQuestionId);
    console.log('[QuestionsManager] enableConditionalLogic:', enableConditionalLogic);
    console.log('[QuestionsManager] Query enabled:', !!selectedQuestionId && enableConditionalLogic);
  }, [selectedQuestionId, enableConditionalLogic]);

  useEffect(() => {
    console.log('[QuestionsManager] Answers query state:', {
      selectedQuestionId,
      availableAnswers: availableAnswers?.length || 0,
      isLoadingAnswers,
      hasError: !!answersError,
      error: answersError
    });
  }, [selectedQuestionId, availableAnswers, isLoadingAnswers, answersError]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionText: "",
      description: "",
      order: questions.length + 1,
      questionType: "single-choice",
      conditionalLogic: "",
    },
  });

  // Parse conditional logic when editing
  useEffect(() => {
    if (editingQuestion && editingQuestion.conditionalLogic) {
      try {
        const parsed = JSON.parse(editingQuestion.conditionalLogic);
        if (parsed.questionId && parsed.answerId) {
          setEnableConditionalLogic(true);
          setSelectedQuestionId(parsed.questionId);
          setSelectedAnswerId(parsed.answerId);
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, [editingQuestion]);

  // Update conditionalLogic field when selections change
  useEffect(() => {
    if (enableConditionalLogic && selectedQuestionId && selectedAnswerId) {
      const logic = JSON.stringify({
        questionId: selectedQuestionId,
        answerId: selectedAnswerId,
      });
      form.setValue("conditionalLogic", logic);
    } else {
      form.setValue("conditionalLogic", "");
    }
  }, [enableConditionalLogic, selectedQuestionId, selectedAnswerId, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", `/api/assessment-configs/${assessmentId}/questions`, {
        ...data,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
      toast({
        title: "Success",
        description: "Question created successfully",
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/assessment-questions/${editingQuestion?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
      handleDialogClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/assessment-questions/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/questions`] });
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

  const setEntryQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await apiRequest("PUT", `/api/assessment-configs/${assessmentId}`, {
        entryQuestionId: questionId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}`] });
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null);
    setEnableConditionalLogic(false);
    setSelectedQuestionId("");
    setSelectedAnswerId("");
    form.reset({
      questionText: "",
      description: "",
      order: questions.length + 1,
      questionType: "single-choice",
      conditionalLogic: "",
    });
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setEnableConditionalLogic(false);
    setSelectedQuestionId("");
    setSelectedAnswerId("");
    form.reset({
      questionText: "",
      description: "",
      order: questions.length + 1,
      questionType: "single-choice",
      conditionalLogic: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setEditingQuestion(question);
    form.reset({
      questionText: question.questionText,
      description: question.description || "",
      order: question.order,
      questionType: question.questionType,
      conditionalLogic: question.conditionalLogic || "",
    });
    setIsDialogOpen(true);
  };

  const handleSetStartQuestion = (questionId: string) => {
    setEntryQuestionMutation.mutate(questionId);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingQuestion) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Get list of other questions for conditional logic (exclude current question)
  const otherQuestions = questions.filter(q => q.id !== editingQuestion?.id);
  const hasOtherQuestions = otherQuestions.length > 0;

  if (isLoading || isLoadingConfig) {
    return (
      <div className="flex justify-center items-center py-12" data-testid="loading-questions">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Questions</h3>
          <p className="text-sm text-muted-foreground">
            Manage the questions for this assessment
          </p>
        </div>
        <Button onClick={handleAddQuestion} data-testid="button-add-question">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No questions yet. Add your first question to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => {
            const isStartQuestion = assessmentConfig?.entryQuestionId === question.id;
            const hasConditionalLogic = !!question.conditionalLogic;
            
            return (
              <Card key={question.id} data-testid={`question-card-${question.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base font-medium">
                            Question {question.order}
                          </CardTitle>
                          {isStartQuestion && (
                            <Badge variant="default" className="gap-1" data-testid={`badge-start-question-${question.id}`}>
                              <Star className="w-3 h-3" />
                              Start Question
                            </Badge>
                          )}
                          {hasConditionalLogic && (
                            <Badge variant="secondary" data-testid={`badge-conditional-${question.id}`}>
                              Conditional
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1">{question.questionText}</p>
                        {question.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {question.description}
                          </p>
                        )}
                        {!isStartQuestion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-auto py-1 px-2"
                            onClick={() => handleSetStartQuestion(question.id)}
                            disabled={setEntryQuestionMutation.isPending}
                            data-testid={`button-set-start-${question.id}`}
                          >
                            {setEntryQuestionMutation.isPending ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Setting...
                              </>
                            ) : (
                              <>
                                <Star className="w-3 h-3 mr-1" />
                                Set as Start Question
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditQuestion(question)}
                        data-testid={`button-edit-question-${question.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmQuestion(question)}
                        data-testid={`button-delete-question-${question.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details below"
                : "Create a new question for this assessment"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="What is your primary business goal?"
                        data-testid="input-question-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Additional context or instructions"
                        data-testid="input-question-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional help text to show under the question
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-question-order"
                      />
                    </FormControl>
                    <FormDescription>
                      Display order (1 = first question)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Logic Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Conditional Logic</FormLabel>
                    <FormDescription>
                      Only show this question based on a previous answer
                    </FormDescription>
                  </div>
                  <Switch
                    checked={enableConditionalLogic}
                    onCheckedChange={(checked) => {
                      setEnableConditionalLogic(checked);
                      if (!checked) {
                        setSelectedQuestionId("");
                        setSelectedAnswerId("");
                      }
                    }}
                    disabled={!hasOtherQuestions}
                    data-testid="switch-conditional-logic"
                  />
                </div>

                {!hasOtherQuestions && (
                  <p className="text-sm text-muted-foreground">
                    Add more questions to enable conditional logic
                  </p>
                )}

                {enableConditionalLogic && hasOtherQuestions && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <FormLabel>If question...</FormLabel>
                      <Select
                        value={selectedQuestionId}
                        onValueChange={(value) => {
                          setSelectedQuestionId(value);
                          setSelectedAnswerId(""); // Reset answer when question changes
                        }}
                      >
                        <SelectTrigger data-testid="select-conditional-question">
                          <SelectValue placeholder="Select a question" />
                        </SelectTrigger>
                        <SelectContent>
                          {otherQuestions.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              Q{q.order}: {q.questionText.substring(0, 50)}
                              {q.questionText.length > 50 ? "..." : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedQuestionId && (
                      <div className="space-y-2">
                        <FormLabel>...has answer...</FormLabel>
                        {isLoadingAnswers ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading answers...
                          </div>
                        ) : availableAnswers.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No answers found for this question. Add answers first.
                          </p>
                        ) : (
                          <Select
                            value={selectedAnswerId}
                            onValueChange={setSelectedAnswerId}
                          >
                            <SelectTrigger data-testid="select-conditional-answer">
                              <SelectValue placeholder="Select an answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAnswers.map((answer) => (
                                <SelectItem key={answer.id} value={answer.id}>
                                  {answer.answerText}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isPending}
                  data-testid="button-cancel-question"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  data-testid="button-save-question"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingQuestion ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingQuestion ? "Update Question" : "Create Question"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmQuestion} onOpenChange={() => setDeleteConfirmQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question and all its answers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmQuestion && deleteMutation.mutate(deleteConfirmQuestion.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
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
    </div>
  );
}
