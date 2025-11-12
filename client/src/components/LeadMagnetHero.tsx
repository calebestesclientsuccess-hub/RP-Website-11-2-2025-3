import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, FileText, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { insertLeadCaptureSchema } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLeadGeneration } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { z } from 'zod';

const formSchema = insertLeadCaptureSchema.pick({
  email: true,
  firstName: true,
  company: true,
});

type FormData = z.infer<typeof formSchema>;

export default function LeadMagnetHero() {
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();
  
  // Check if the playbook feature is enabled using the feature flag hook
  const { isEnabled, isLoading } = useFeatureFlag('revenue-architecture-playbook');
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      company: "",
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest(
        'POST',
        '/api/lead-magnets/download',
        { 
          ...data, 
          resourceDownloaded: 'revenue-architecture-playbook',
          source: 'hero'
        }
      );
      return await res.json();
    },
    onSuccess: (data: any) => {
      setShowThankYou(true);
      
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      
      trackLeadGeneration('revenue-architecture-playbook', 'hero', 50);
      
      toast({
        title: "Success!",
        description: "Check your email for the Revenue Architecture Playbook.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process your request. Please try again.",
      });
    },
  });

  // Don't render while loading or if feature is disabled
  // This prevents the "flash of content" issue where the form appears then disappears
  if (isLoading || !isEnabled) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!showThankYou ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-8"
        >
          <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Free: The Revenue Architecture Playbook
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Diagnose your GTM problems in 14 days. Includes ROI calculator & system audit checklist.
                </p>
                
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => downloadMutation.mutate(data))}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="First name*" 
                                {...field}
                                value={field.value || ""}
                                className="h-9"
                                data-testid="input-lead-firstname"
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
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Work email*" 
                                {...field} 
                                className="h-9"
                                data-testid="input-lead-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Company (optional)" 
                              {...field}
                              value={field.value || ""}
                              className="h-9"
                              data-testid="input-lead-company"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={downloadMutation.isPending}
                      data-testid="button-download-playbook"
                    >
                      {downloadMutation.isPending ? (
                        "Processing..."
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Instant Access
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </Form>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Check your email!</h3>
                <p className="text-sm text-muted-foreground">
                  The Revenue Architecture Playbook is on its way.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
