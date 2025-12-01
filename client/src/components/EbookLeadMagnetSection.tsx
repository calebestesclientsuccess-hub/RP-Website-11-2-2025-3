import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, CheckCircle, Calendar, XCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLeadGeneration } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid business email required"),
  role: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EbookConfig {
  id: string;
  slug: string;
  h1Text: string;
  h2Text?: string;
  bodyText?: string;
  previewImageUrl?: string;
  imageSize?: "small" | "medium" | "large" | "xlarge" | "full";
  imageOrientation?: "portrait" | "landscape";
  imageStyle?: "shadow" | "minimal" | "elevated" | "glow" | "tilted";
  ctaButtonText?: string;
  successMessage?: string;
  calendlyLink?: string;
}

interface EbookLeadMagnetSectionProps {
  slug: string;
  className?: string;
}

const COUNTRY_CODES = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+91", country: "India" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
];

// Helper function to get image styling classes
function getImageStyling(
  size: string = "medium",
  orientation: string = "portrait",
  style: string = "shadow"
) {
  // Size classes - responsive for different breakpoints
  const sizeClasses: Record<string, string> = {
    small: 'max-w-sm md:max-w-sm',
    medium: 'max-w-md md:max-w-md lg:max-w-lg',
    large: 'max-w-lg md:max-w-xl lg:max-w-2xl',
    xlarge: 'max-w-md md:max-w-2xl lg:max-w-4xl',
    full: 'w-full'
  };

  // Style wrapper and image classes
  const styleConfig: Record<string, { wrapperClass: string; imageClass: string; decoration: JSX.Element | null }> = {
    shadow: {
      wrapperClass: 'relative',
      imageClass: 'relative rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.6)]',
      decoration: <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-xl transform rotate-6 -z-10" />
    },
    minimal: {
      wrapperClass: 'relative',
      imageClass: 'rounded-xl border-2 border-border/30',
      decoration: null
    },
    elevated: {
      wrapperClass: 'relative',
      imageClass: 'relative rounded-xl shadow-2xl',
      decoration: <div className="absolute inset-0 bg-black/20 blur-2xl rounded-xl transform translate-y-8 -z-10" />
    },
    glow: {
      wrapperClass: 'relative',
      imageClass: 'relative rounded-xl shadow-2xl ring-1 ring-white/10',
      decoration: <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-xl -z-10" />
    },
    tilted: {
      wrapperClass: 'relative',
      imageClass: 'rounded-xl shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500',
      decoration: null
    }
  };

  return {
    sizeClass: sizeClasses[size] || sizeClasses.medium,
    styleConfig: styleConfig[style] || styleConfig.shadow
  };
}

export default function EbookLeadMagnetSection({ slug, className = "" }: EbookLeadMagnetSectionProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [calendlyLink, setCalendlyLink] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Check if the feature is enabled
  const { isEnabled, isLoading: flagLoading } = useFeatureFlag('ebook-lead-magnet');
  
  // Fetch ebook config
  const { data: ebook, isLoading: ebookLoading } = useQuery<EbookConfig>({
    queryKey: [`/api/ebooks/${slug}`],
    enabled: isEnabled,
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      phone: "",
      countryCode: "+1",
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest(
        'POST',
        `/api/ebooks/${slug}/download`,
        data
      );
      return await res.json();
    },
    onSuccess: (data: any) => {
      setDownloadSuccess(true);
      setPdfUrl(data.pdfUrl);
      setCalendlyLink(data.calendlyLink);
      
      // Auto-download PDF
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      }
      
      trackLeadGeneration(`ebook-${slug}`, 'ebook-section', 75);
      
      toast({
        title: "Success!",
        description: data.message || "Check your email for the download link.",
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

  // Don't render if feature is disabled or while loading
  if (flagLoading || !isEnabled) {
    return null;
  }

  if (ebookLoading) {
    return (
      <div className={`py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return null;
  }

  return (
    <div className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!downloadSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              {/* LEFT: Content & Form */}
              <div className="order-1">
                <div className="mb-10">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    The $198,000 Mistake<br />
                    <span className="gradient-text gradient-hero">You Don't Have to Make</span>
                  </h2>
                  {ebook.h2Text && (
                    <p className="text-xl md:text-2xl mb-6 leading-relaxed">
                      {ebook.h2Text}
                    </p>
                  )}
                  {ebook.bodyText && (
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                      {ebook.bodyText}
                    </p>
                  )}
                </div>

                {/* Form - No Card, Just Raw Form */}
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => downloadMutation.mutate(data))}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your full name" 
                              {...field}
                              data-testid="input-ebook-name"
                              className="h-12 text-base"
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
                          <FormLabel className="text-base">Business Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@company.com" 
                              {...field} 
                              data-testid="input-ebook-email"
                              className="h-12 text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Your Role</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., CEO, VP Sales" 
                              {...field}
                              data-testid="input-ebook-role"
                              className="h-12 text-base"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <FormLabel className="text-base">Country</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-ebook-country" className="h-12">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRY_CODES.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-base">Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="555-123-4567" 
                                {...field}
                                data-testid="input-ebook-phone"
                                className="h-12 text-base"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full mt-8"
                      size="lg"
                      disabled={downloadMutation.isPending}
                      data-testid="button-download-ebook"
                    >
                      {downloadMutation.isPending ? (
                        "Processing..."
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          {ebook.ctaButtonText || "Get Free Access"}
                        </>
                      )}
                    </Button>
                    
                    <p className="text-sm text-center text-muted-foreground mt-3">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </Form>
              </div>

              {/* RIGHT: Preview Image */}
              {ebook.previewImageUrl && (() => {
                const { sizeClass, styleConfig } = getImageStyling(
                  ebook.imageSize,
                  ebook.imageOrientation,
                  ebook.imageStyle
                );
                
                return (
                  <div className="flex justify-center lg:justify-start order-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className={sizeClass}
                    >
                      <div className={styleConfig.wrapperClass}>
                        {styleConfig.decoration}
                        <img
                          src={ebook.previewImageUrl}
                          alt="E-Book Preview"
                          className={`${styleConfig.imageClass} w-full`}
                        />
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* LEFT: Success Confirmation & Value Delivered */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <CheckCircle className="w-12 h-12 text-primary flex-shrink-0" />
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-3">
                        You're In!<br />Check Your Inbox.
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        Your e-book is on its way to your email. The download should start automatically.
                      </p>
                    </div>
                  </div>

                  {pdfUrl && (
                    <Button variant="outline" size="lg" asChild>
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Again
                      </a>
                    </Button>
                  )}
                </div>

                {/* What You Just Got */}
                <div>
                  <h3 className="text-2xl font-bold mb-4">What You Just Got:</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">The $198K Mistake Framework</h4>
                        <p className="text-muted-foreground">
                          Understand exactly why internal hires fail 67% of the time and how to avoid it
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">The System vs. Headcount Blueprint</h4>
                        <p className="text-muted-foreground">
                          See how to build a predictable revenue engine instead of renting activity
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">Real ROI Calculator</h4>
                        <p className="text-muted-foreground">
                          Calculate your exact cost of the wrong hire vs. the right system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div>
                  <h3 className="text-2xl font-bold mb-4">What Happens Next:</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Read the E-Book</h4>
                        <p className="text-muted-foreground">
                          Understand the framework (5-10 min read)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Book Your Free Audit</h4>
                        <p className="text-muted-foreground">
                          Get a custom blueprint for your business
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Build Your System</h4>
                        <p className="text-muted-foreground">
                          Stop renting activity, start owning results
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: The Critical Next Step CTA */}
              <div>
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 sticky top-24">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-3">
                      Turn Insight Into Action
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      You now understand the problem. Let's design your solution.
                    </p>
                  </div>

                  {calendlyLink ? (
                    <>
                      {/* What You'll Get on the Call */}
                      <div className="mb-6 space-y-3">
                        <div className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-semibold">30-Minute Strategic Workshop</span> with a GTM Architect
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-semibold">Custom Revenue Blueprint</span> for your 1-SDR or 2-SDR Pod
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm">
                            <span className="font-semibold">Live ROI Projection</span> based on your actual numbers
                          </p>
                        </div>
                      </div>

                      {/* What This is NOT */}
                      <div className="mb-8 pb-6 border-b space-y-3">
                        <div className="flex gap-3">
                          <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Not a sales pitch</span> — we're diagnosing, not selling
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Not with a rep</span> — you talk to a founding GTM Architect
                          </p>
                        </div>
                      </div>

                      {/* Primary CTA */}
                      <Button size="lg" className="w-full text-lg py-6 mb-3" asChild>
                        <a href={calendlyLink} target="_blank" rel="noopener noreferrer">
                          <Calendar className="w-5 h-5 mr-2" />
                          Schedule My Free GTM Audit
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </a>
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        Free • 30 minutes • No obligation • Custom blueprint
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Want to implement this in your business?
                      </p>
                      <Button size="lg" asChild>
                        <a href="/audit">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule a Free Consultation
                        </a>
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

