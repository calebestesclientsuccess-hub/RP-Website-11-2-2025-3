import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial, InsertTestimonial } from "@shared/schema";
import { insertTestimonialSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = insertTestimonialSchema.extend({
  // Only override required fields and rating (for coercion)
  // Let optional fields use backend preprocessors (blank → null)
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  quote: z.string().min(1, "Quote is required"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function TestimonialForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/testimonials/:id/edit");
  const isEdit = !!match;
  const testimonialId = params?.id;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const { data: testimonial, isLoading } = useQuery<Testimonial>({
    queryKey: ["/api/testimonials", testimonialId],
    queryFn: async () => {
      if (!testimonialId) throw new Error("Testimonial ID is required");
      const res = await fetch(`/api/testimonials/${testimonialId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch testimonial');
      return res.json();
    },
    enabled: isEdit && !!testimonialId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      company: "",
      companyLogo: "",
      quote: "",
      rating: 5,
      featured: false,
      avatarUrl: "",
      metrics: "",
      industry: "",
      companySize: "",
    },
  });

  useEffect(() => {
    if (testimonial && isEdit) {
      form.reset({
        name: testimonial.name,
        title: testimonial.title,
        company: testimonial.company,
        companyLogo: testimonial.companyLogo || "",
        quote: testimonial.quote,
        rating: testimonial.rating,
        featured: testimonial.featured,
        avatarUrl: testimonial.avatarUrl || "",
        metrics: testimonial.metrics || "",
        industry: testimonial.industry || "",
        companySize: testimonial.companySize || "",
      });
    }
  }, [testimonial, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTestimonial) => {
      const response = await apiRequest("POST", "/api/testimonials", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
      setLocation("/admin/content?type=testimonial");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create testimonial",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertTestimonial>) => {
      const response = await apiRequest("PATCH", `/api/testimonials/${testimonialId}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials", testimonialId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
      setLocation("/admin/content?type=testimonial");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update testimonial",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // Schema preprocessors now handle blank string → null normalization
    // Just send data as-is for both create and update
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data as InsertTestimonial);
    }
  };

  const handleCancel = () => {
    setLocation("/admin/content?type=testimonial");
  };

  if (isEdit && isLoading) {
    return (
      <ProtectedRoute>
        <Helmet>
          <title>Loading... | Admin Dashboard</title>
        </Helmet>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center gap-4 p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold">Loading...</h1>
              </header>
              <main className="flex-1 overflow-auto p-6">
                <div className="flex justify-center items-center py-12" data-testid="loading-form">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isFormDisabled = isPending || (isEdit && isLoading);

  return (
    <ProtectedRoute>
      <Helmet>
        <title>{isEdit ? "Edit Testimonial" : "New Testimonial"} | Admin Dashboard</title>
      </Helmet>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <header className="flex items-center gap-4 p-4 border-b">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold" data-testid="text-page-title">
                {isEdit ? "Edit Testimonial" : "New Testimonial"}
              </h1>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Client Information</h2>
                      
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                data-testid="input-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="CEO" 
                                data-testid="input-title"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Acme Inc." 
                                data-testid="input-company"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quote *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Revenue Party helped us achieve..." 
                                className="min-h-[120px]"
                                data-testid="input-quote"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (1-5) *</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-rating">
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">⭐ 1 Star</SelectItem>
                                <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-featured"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                              <FormDescription>
                                Display this testimonial prominently on the homepage
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Optional Fields Section */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Additional Details (Optional)</h2>

                      <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/avatar.jpg" 
                                data-testid="input-avatar-url"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              URL to client's profile picture
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyLogo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Logo URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/logo.png" 
                                data-testid="input-company-logo"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              URL to company logo
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="metrics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Metrics</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="150% revenue growth" 
                                data-testid="input-metrics"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Key results or achievements
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SaaS" 
                                data-testid="input-industry"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="50-100 employees" 
                                data-testid="input-company-size"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                      <Button
                        type="submit"
                        disabled={isFormDisabled}
                        data-testid="button-submit"
                      >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update" : "Create"} Testimonial
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
