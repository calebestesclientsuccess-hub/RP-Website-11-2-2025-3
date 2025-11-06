import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit2, Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAssessmentResultBucketSchema, type AssessmentResultBucket } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  scoringMethod?: string;
}

export function ResultBucketsManager({ assessmentId, scoringMethod = "decision-tree" }: ResultBucketsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<AssessmentResultBucket | null>(null);
  const [deleteConfirmBucket, setDeleteConfirmBucket] = useState<AssessmentResultBucket | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const { data: buckets = [], isLoading } = useQuery<AssessmentResultBucket[]>({
    queryKey: [`/api/assessment-configs/${assessmentId}/results`],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bucketName: "",
      bucketKey: "",
      title: "",
      content: "",
      pdfUrl: "",
      routingRules: "",
      minScore: undefined,
      maxScore: undefined,
      order: buckets.length + 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", `/api/assessment-configs/${assessmentId}/results`, {
        ...data,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/results`] });
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
        pdfUrl: "",
        routingRules: "",
        minScore: undefined,
        maxScore: undefined,
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
      const response = await apiRequest("PUT", `/api/assessment-configs/${assessmentId}/results/${editingBucket?.id}`, {
        ...data,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/results`] });
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
      const response = await apiRequest("DELETE", `/api/assessment-configs/${assessmentId}/results/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [`/api/assessment-configs/${assessmentId}/results`] });
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
      pdfUrl: "",
      routingRules: "",
      minScore: undefined,
      maxScore: undefined,
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
      pdfUrl: bucket.pdfUrl || "",
      routingRules: bucket.routingRules || "",
      minScore: bucket.minScore !== null ? bucket.minScore : undefined,
      maxScore: bucket.maxScore !== null ? bucket.maxScore : undefined,
      order: bucket.order,
    });
    setIsDialogOpen(true);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      if (data.url) {
        form.setValue('pdfUrl', data.url);
        toast({
          title: "Success",
          description: "PDF uploaded successfully",
        });
      }
    } catch (error) {
      console.error('Failed to upload PDF:', error);
      toast({
        title: "Error",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
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
                      {scoringMethod === "points" && (bucket.minScore !== null || bucket.maxScore !== null) && (
                        <span className="ml-2 text-primary font-medium">
                          • Score: {bucket.minScore ?? "-"}–{bucket.maxScore ?? "-"}
                        </span>
                      )}
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
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                        placeholder="Based on your responses, we recommend..."
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed message or recommendations for this result (supports rich text, images, and headings)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PDF Resource (optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="/uploads/pdfs/your-file.pdf"
                            data-testid="input-pdf-url"
                            readOnly
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={uploadingPdf}
                            data-testid="button-upload-pdf"
                          >
                            {uploadingPdf ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload PDF
                              </>
                            )}
                          </Button>
                          {field.value && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => field.onChange('')}
                              data-testid="button-remove-pdf"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {field.value && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span className="truncate">{field.value}</span>
                          </div>
                        )}
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={handlePdfUpload}
                          data-testid="input-pdf-file"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a PDF that will be previewed on the results page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scoringMethod === "points" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Score</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                            placeholder="0"
                            data-testid="input-bucket-min-score"
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum points for this result
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Score</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                            placeholder="100"
                            data-testid="input-bucket-max-score"
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum points for this result
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
