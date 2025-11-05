import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAssessmentQuestionSchema, type AssessmentQuestion } from "@shared/schema";
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

  const { data: questions = [], isLoading } = useQuery<AssessmentQuestion[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/questions`],
  });

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
      setIsDialogOpen(false);
      form.reset({
        questionText: "",
        description: "",
        order: questions.length + 2,
        questionType: "single-choice",
        conditionalLogic: "",
      });
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
      setIsDialogOpen(false);
      setEditingQuestion(null);
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

  const handleAddQuestion = () => {
    setEditingQuestion(null);
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingQuestion) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
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
          {questions.map((question) => (
            <Card key={question.id} data-testid={`question-card-${question.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium">
                        Question {question.order}
                      </CardTitle>
                      <p className="text-sm mt-1">{question.questionText}</p>
                      {question.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {question.description}
                        </p>
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
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
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
