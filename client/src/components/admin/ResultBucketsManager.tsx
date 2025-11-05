import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAssessmentResultBucketSchema, type AssessmentResultBucket } from "@shared/schema";
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

const formSchema = insertAssessmentResultBucketSchema.omit({ assessmentId: true });

interface ResultBucketsManagerProps {
  assessmentId: string;
}

export function ResultBucketsManager({ assessmentId }: ResultBucketsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<AssessmentResultBucket | null>(null);
  const [deleteConfirmBucket, setDeleteConfirmBucket] = useState<AssessmentResultBucket | null>(null);

  const { data: buckets = [], isLoading } = useQuery<AssessmentResultBucket[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/buckets`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bucketName: "",
      bucketKey: "",
      title: "",
      content: "",
      routingRules: "",
      order: buckets.length + 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", `/api/assessment-configs/${assessmentId}/buckets`, {
        ...data,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/buckets`] });
      toast({
        title: "Success",
        description: "Result bucket created successfully",
      });
      setIsDialogOpen(false);
      form.reset({
        bucketName: "",
        bucketKey: "",
        title: "",
        content: "",
        routingRules: "",
        order: buckets.length + 2,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create result bucket",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("PUT", `/api/assessment-buckets/${editingBucket?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/buckets`] });
      toast({
        title: "Success",
        description: "Result bucket updated successfully",
      });
      setIsDialogOpen(false);
      setEditingBucket(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update result bucket",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/assessment-buckets/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/buckets`] });
      toast({
        title: "Success",
        description: "Result bucket deleted successfully",
      });
      setDeleteConfirmBucket(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete result bucket",
        variant: "destructive",
      });
    },
  });

  const handleAddBucket = () => {
    setEditingBucket(null);
    form.reset({
      bucketName: "",
      bucketKey: "",
      title: "",
      content: "",
      routingRules: "",
      order: buckets.length + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEditBucket = (bucket: AssessmentResultBucket) => {
    setEditingBucket(bucket);
    form.reset({
      bucketName: bucket.bucketName,
      bucketKey: bucket.bucketKey,
      title: bucket.title,
      content: bucket.content,
      routingRules: bucket.routingRules || "",
      order: bucket.order,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingBucket) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12" data-testid="loading-buckets">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Result Buckets</h3>
          <p className="text-sm text-muted-foreground">
            Define the result categories users can receive
          </p>
        </div>
        <Button onClick={handleAddBucket} data-testid="button-add-bucket">
          <Plus className="w-4 h-4 mr-2" />
          Add Result
        </Button>
      </div>

      {buckets.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No result buckets yet. Add your first result to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {buckets.map((bucket) => (
            <Card key={bucket.id} data-testid={`bucket-card-${bucket.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base">{bucket.bucketName}</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Key: {bucket.bucketKey}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditBucket(bucket)}
                      data-testid={`button-edit-bucket-${bucket.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmBucket(bucket)}
                      data-testid={`button-delete-bucket-${bucket.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">{bucket.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                      {bucket.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBucket ? "Edit Result Bucket" : "Add Result Bucket"}
            </DialogTitle>
            <DialogDescription>
              {editingBucket
                ? "Update the result bucket details below"
                : "Create a new result bucket for this assessment"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bucketName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="High-Value Prospect"
                        data-testid="input-bucket-name"
                      />
                    </FormControl>
                    <FormDescription>
                      Internal name for this result category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bucketKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="high-value"
                        data-testid="input-bucket-key"
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier (no spaces, lowercase recommended)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="You're Ready for Rapid Growth"
                        data-testid="input-bucket-title"
                      />
                    </FormControl>
                    <FormDescription>
                      Title shown to users when they get this result
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Based on your responses, we recommend..."
                        rows={6}
                        data-testid="input-bucket-content"
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed message or recommendations for this result
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
                        data-testid="input-bucket-order"
                      />
                    </FormControl>
                    <FormDescription>
                      Display order for admin listing
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
                  data-testid="button-cancel-bucket"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  data-testid="button-save-bucket"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingBucket ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingBucket ? "Update Bucket" : "Create Bucket"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmBucket} onOpenChange={() => setDeleteConfirmBucket(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Result Bucket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this result bucket. Make sure no answers are routed to this result. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmBucket && deleteMutation.mutate(deleteConfirmBucket.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Bucket"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
