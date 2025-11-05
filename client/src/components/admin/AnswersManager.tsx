import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAssessmentAnswerSchema, type AssessmentAnswer, type AssessmentQuestion, type AssessmentResultBucket } from "@shared/schema";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formSchema = insertAssessmentAnswerSchema.omit({ questionId: true }).extend({
  routingType: z.enum(["question", "result"]),
  nextQuestionId: z.string().optional(),
  resultBucketKey: z.string().optional(),
});

interface AnswersManagerProps {
  assessmentId: string;
}

export function AnswersManager({ assessmentId }: AnswersManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState<AssessmentAnswer | null>(null);
  const [deleteConfirmAnswer, setDeleteConfirmAnswer] = useState<AssessmentAnswer | null>(null);

  const { data: questions = [] } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/questions`],
  });

  const { data: buckets = [] } = useQuery<AssessmentResultBucket[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/results`],
  });

  const { data: allAnswers = [] } = useQuery<AssessmentAnswer[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/answers`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answerText: "",
      answerValue: "{}",
      order: 1,
      routingType: "question",
      nextQuestionId: "",
      resultBucketKey: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const { routingType, nextQuestionId, resultBucketKey, ...answerData } = data;
      
      const routingValue = routingType === "question"
        ? JSON.stringify({ nextQuestionId })
        : JSON.stringify({ resultBucketKey });

      const response = await apiRequest("POST", `/api/assessment-questions/${selectedQuestionId}/answers`, {
        ...answerData,
        answerValue: routingValue,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Answer created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create answer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const { routingType, nextQuestionId, resultBucketKey, ...answerData } = data;
      
      const routingValue = routingType === "question"
        ? JSON.stringify({ nextQuestionId })
        : JSON.stringify({ resultBucketKey });

      const response = await apiRequest("PUT", `/api/assessment-answers/${editingAnswer?.id}`, {
        ...answerData,
        answerValue: routingValue,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
      toast({
        title: "Success",
        description: "Answer updated successfully",
      });
      setIsDialogOpen(false);
      setEditingAnswer(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update answer",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/assessment-answers/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/answers`] });
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

  const handleAddAnswer = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setEditingAnswer(null);
    
    const questionAnswers = allAnswers.filter(a => a.questionId === questionId);
    
    form.reset({
      answerText: "",
      answerValue: "{}",
      order: questionAnswers.length + 1,
      routingType: "question",
      nextQuestionId: "",
      resultBucketKey: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditAnswer = (answer: AssessmentAnswer) => {
    setEditingAnswer(answer);
    setSelectedQuestionId(answer.questionId);
    
    let routing: any = {};
    try {
      routing = JSON.parse(answer.answerValue);
    } catch (e) {
      console.error("Failed to parse answer value:", e);
    }

    form.reset({
      answerText: answer.answerText,
      answerValue: answer.answerValue,
      order: answer.order,
      routingType: routing.nextQuestionId ? "question" : "result",
      nextQuestionId: routing.nextQuestionId || "",
      resultBucketKey: routing.resultBucketKey || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingAnswer) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Add questions first before managing answers.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Answers & Routing</h3>
        <p className="text-sm text-muted-foreground">
          Manage answer choices and their routing logic
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {questions.map((question) => {
          const answers = getAnswersForQuestion(question.id);
          return (
            <AccordionItem key={question.id} value={question.id}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>Question {question.order}: {question.questionText}</span>
                  <span className="text-sm text-muted-foreground">
                    {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {answers.map((answer) => (
                    <Card key={answer.id} data-testid={`answer-card-${answer.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium">
                              {answer.answerText}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getRoutingLabel(answer)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAnswer(answer)}
                              data-testid={`button-edit-answer-${answer.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmAnswer(answer)}
                              data-testid={`button-delete-answer-${answer.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAnswer(question.id)}
                    data-testid={`button-add-answer-${question.id}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Answer
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnswer ? "Edit Answer" : "Add Answer"}
            </DialogTitle>
            <DialogDescription>
              {editingAnswer
                ? "Update the answer and its routing logic"
                : "Create a new answer choice with routing"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="answerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer Text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Yes, we have a dedicated sales team"
                        data-testid="input-answer-text"
                      />
                    </FormControl>
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
                        data-testid="input-answer-order"
                      />
                    </FormControl>
                    <FormDescription>
                      Display order (1 = first answer)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="routingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-routing-type">
                          <SelectValue placeholder="Select routing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="question" data-testid="option-route-question">
                          Go to Next Question
                        </SelectItem>
                        <SelectItem value="result" data-testid="option-route-result">
                          Show Result
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What should happen when this answer is selected?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("routingType") === "question" && (
                <FormField
                  control={form.control}
                  name="nextQuestionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Question</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-next-question">
                            <SelectValue placeholder="Select next question" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questions.map((q) => (
                            <SelectItem key={q.id} value={q.id} data-testid={`option-question-${q.id}`}>
                              Question {q.order}: {q.questionText.substring(0, 50)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("routingType") === "result" && (
                <FormField
                  control={form.control}
                  name="resultBucketKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result Bucket</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-result-bucket">
                            <SelectValue placeholder="Select result bucket" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buckets.map((bucket) => (
                            <SelectItem
                              key={bucket.id}
                              value={bucket.bucketKey}
                              data-testid={`option-bucket-${bucket.id}`}
                            >
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPending}
                  data-testid="button-cancel-answer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  data-testid="button-save-answer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingAnswer ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingAnswer ? "Update Answer" : "Create Answer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmAnswer} onOpenChange={() => setDeleteConfirmAnswer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Answer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this answer choice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmAnswer && deleteMutation.mutate(deleteConfirmAnswer.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
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
