import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WidgetZone } from "@/components/WidgetZone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, Calendar, XCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const auditSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  workEmail: z.string().email("Please enter a valid work email"),
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Please enter a valid website URL").or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Please enter a valid domain")),
  gtmChallenge: z.string().min(10, "Please describe your GTM challenge (at least 10 characters)")
});

type AuditFormData = z.infer<typeof auditSchema>;

export default function AuditPage() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      companyName: "",
      website: "",
      gtmChallenge: ""
    }
  });

  const handleSubmit = (data: AuditFormData) => {
    console.log('Audit request submitted:', data);
    setSubmitted(true);
    toast({
      title: "Audit Request Submitted",
      description: "A GTM Architect will send a personal confirmation and prep materials within one business day."
    });
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Free GTM Audit - 30-Min Blueprint Session | Revenue Party"
        description="Book your free 30-minute GTM Leverage Audit with expert architects. Get a custom revenue blueprint, diagnose your #1 bottleneck, and receive transparent ROI projections. No sales pitch - just strategic insights."
        keywords="free GTM audit, GTM leverage audit, revenue blueprint, sales bottleneck diagnosis, GTM architect consultation, pipeline audit, revenue system assessment"
        canonical="/audit"
      />

      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 2-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Column 1: The "What & Why" */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <Badge className="mb-4" variant="outline" data-testid="badge-free-audit">
                  <Calendar className="w-3 h-3 mr-1" />
                  Free 30-Minute Workshop
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-audit">
                  Schedule Your Free GTM Leverage Audit
                </h1>
                <p className="text-xl text-muted-foreground" data-testid="text-audit-description">
                  This is not a sales call. This is a 30-minute strategic workshop with a GTM Architect 
                  to design your guaranteed revenue blueprint.
                </p>
              </div>

              {/* What You Will Get */}
              <div>
                <h2 className="text-2xl font-bold mb-4" data-testid="heading-deliverable">
                  What You Will Get (The Deliverable):
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3" data-testid="deliverable-diagnosis">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">360-Degree Diagnosis</h3>
                      <p className="text-muted-foreground">
                        Identify #1 Lone Wolf or Black Box bottleneck costing you revenue
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3" data-testid="deliverable-blueprint">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">"Fullstack" Blueprint</h3>
                      <p className="text-muted-foreground">
                        Custom plan for 1-SDR or 2-SDR Pod, including 4-month ramp and specific 
                        guaranteed SQO quota
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3" data-testid="deliverable-roi">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Transparent ROI Projection</h3>
                      <p className="text-muted-foreground">
                        Live custom build of 80x ROI calculator based on actual LTV and sales data
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What This is NOT */}
              <div>
                <h2 className="text-2xl font-bold mb-4" data-testid="heading-not">
                  What This is NOT:
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3" data-testid="not-pitch">
                    <XCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">NOT a "hard pitch"</h3>
                      <p className="text-muted-foreground">
                        We're diagnosing your system, not selling a product
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3" data-testid="not-demo">
                    <XCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">NOT a "demo"</h3>
                      <p className="text-muted-foreground">
                        We design revenue architecture, not demo software
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3" data-testid="not-sales-rep">
                    <XCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">NOT with a "sales rep"</h3>
                      <p className="text-muted-foreground">
                        You speak directly with a GTM Architect: Caleb, Muneeb, or Danyal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Column 2: The "When" (The Form) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8 sticky top-24" data-testid="card-audit-form">
                <h2 className="text-2xl font-bold mb-6" data-testid="heading-form">
                  Select a Time to Build Your Blueprint
                </h2>

                {!submitted ? (
                  <>
                    {/* Placeholder for Calendly Embed */}
                    <div className="mb-6 p-6 border border-dashed rounded-lg bg-muted/30 text-center" data-testid="calendly-placeholder">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Calendly embed placeholder</p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Smith" 
                                  {...field} 
                                  data-testid="input-full-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="john@company.com" 
                                  {...field} 
                                  data-testid="input-work-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Acme Inc" 
                                  {...field} 
                                  data-testid="input-company-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="acme.com" 
                                  {...field} 
                                  data-testid="input-website"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gtmChallenge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>What is your #1 GTM challenge right now?</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your biggest GTM challenge..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                  data-testid="input-gtm-challenge"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          data-testid="button-submit-audit"
                        >
                          Confirm My GTM Audit
                        </Button>
                      </form>
                    </Form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                    data-testid="confirmation-message"
                  >
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                    <p className="text-muted-foreground">
                      A GTM Architect will send a personal confirmation and prep materials within 
                      one business day.
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Widget Zone 30 */}
      <WidgetZone zone="zone-30" className="my-8" />
    </div>
  );
}
