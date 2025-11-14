import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { insertJobPostingSchema, type InsertJobPosting, type JobPosting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = insertJobPostingSchema;
type FormValues = z.infer<typeof formSchema>;

export default function JobPostingForm() {
  const [, setLocation] = useLocation();
  const [isEdit, params] = useRoute("/admin/job-postings/:id/edit");
  const jobId = params?.id;
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "",
      type: "",
      description: "",
      requirements: "",
      active: true,
    },
  });

  const { data: job, isLoading } = useQuery<JobPosting>({
    queryKey: ["/api/job-postings", jobId],
    enabled: isEdit && !!jobId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertJobPosting) => {
      const response = await apiRequest("POST", "/api/job-postings", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Job posting created successfully" });
      setLocation("/admin/content?type=job");
    },
    onError: () => {
      toast({ title: "Failed to create job posting", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertJobPosting>) => {
      const response = await apiRequest("PATCH", `/api/job-postings/${jobId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Job posting updated successfully" });
      setLocation("/admin/content?type=job");
    },
    onError: () => {
      toast({ title: "Failed to update job posting", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    setLocation("/admin/content?type=job");
  };

  if (isEdit && isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Card className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (isEdit && job) {
    form.reset({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      active: job.active,
    });
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Job Posting" : "New Job Posting"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEdit ? "Update the job posting details" : "Create a new job posting for your careers page"}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Senior GTM Manager"
                            data-testid="input-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Sales, Marketing, Engineering"
                              data-testid="input-department"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Remote, San Francisco, etc."
                              data-testid="input-location"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full-time, Part-time, Contract"
                            data-testid="input-type"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Show this job posting on the careers page
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Job Details</h2>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be doing..."
                            className="min-h-[200px]"
                            data-testid="textarea-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List the qualifications, skills, and experience required for this position..."
                            className="min-h-[200px]"
                            data-testid="textarea-requirements"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? "Saving..." 
                    : isEdit 
                      ? "Update Job Posting" 
                      : "Create Job Posting"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
