import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { MapPin, Briefcase, Clock, ArrowLeft, Send } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobApplicationSchema, type JobPosting, type InsertJobApplication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function CareerDetail() {
  const [, params] = useRoute("/careers/:id");
  const jobId = params?.id;
  const { toast } = useToast();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const { data: job, isLoading } = useQuery<JobPosting>({
    queryKey: [`/api/job-postings/${jobId}`],
    enabled: !!jobId,
  });

  const form = useForm<InsertJobApplication>({
    resolver: zodResolver(insertJobApplicationSchema),
    defaultValues: {
      jobId: jobId || "",
      name: "",
      email: "",
      phone: "",
      resume: undefined,
      coverLetter: undefined,
      linkedin: undefined,
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: InsertJobApplication) => {
      return await apiRequest("POST", "/api/job-applications", data);
    },
    onSuccess: async () => {
      setApplicationSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertJobApplication) => {
    applicationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="h-12 bg-muted rounded w-3/4 mb-4" />
            <div className="h-6 bg-muted rounded w-1/2 mb-12" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-6" data-testid="text-not-found">
                Job posting not found.
              </p>
              <Link href="/careers" data-testid="link-back-to-careers">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Careers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <Link href="/careers" data-testid="link-back">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Jobs
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-3" data-testid="text-job-title">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span data-testid="text-job-department">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span data-testid="text-job-location">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span data-testid="text-job-type">{job.type}</span>
                  </div>
                </div>
              </div>
              {job.active && (
                <Badge variant="secondary">Open Position</Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">About the Role</h2>
            </CardHeader>
            <CardContent>
              <div 
                data-testid="text-job-description"
                className="whitespace-pre-wrap text-foreground leading-relaxed mb-6"
              >
                {job.description}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold">Requirements</h2>
            </CardHeader>
            <CardContent>
              <div 
                data-testid="text-job-requirements"
                className="whitespace-pre-wrap text-foreground leading-relaxed"
              >
                {job.requirements}
              </div>
            </CardContent>
          </Card>

          {applicationSubmitted ? (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-12 text-center">
                <h3 className="text-2xl font-bold mb-4 text-primary" data-testid="text-success">
                  Application Submitted Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  We've received your application and will review it shortly. You'll hear from us soon!
                </p>
                <Link href="/careers">
                  <Button variant="outline">
                    View Other Positions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">Apply for this Position</h2>
                <p className="text-muted-foreground">
                  Fill out the form below to submit your application.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="john@example.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+1 (555) 123-4567" 
                              {...field} 
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://linkedin.com/in/yourprofile" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-linkedin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume/CV Link (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Link to your resume (Google Drive, Dropbox, etc.)" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-resume"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us why you're a great fit for this role..." 
                              className="min-h-[150px]" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-cover-letter"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={applicationMutation.isPending}
                      data-testid="button-submit"
                    >
                      {applicationMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
