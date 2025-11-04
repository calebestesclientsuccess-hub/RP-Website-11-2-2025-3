import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, Mail, Calendar } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PipelineAssessmentThankYou() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const bucket = params.get('bucket') || 'architecture-gap';

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('POST', '/api/newsletter-signups', { email, source: 'pipeline-assessment-thank-you' });
    },
    onSuccess: () => {
      setSubscribed(true);
      toast({
        title: "Subscribed!",
        description: "You've been added to our newsletter.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      newsletterMutation.mutate(email);
    }
  };

  const getBucketInfo = () => {
    switch (bucket) {
      case 'hot-mql-architect':
        return {
          title: 'Hot MQL - GTM Pod Blueprint',
          description: "You're ready for a full GTM Pod system. Your personalized blueprint is on its way.",
        };
      case 'architecture-gap':
        return {
          title: 'Architecture Gap Blueprint',
          description: "We've identified key gaps in your GTM architecture. Your personalized blueprint is on its way.",
        };
      case 'person-trap':
        return {
          title: 'The $198k Mistake Blueprint',
          description: 'You\'re at risk of the "Person Trap." Your personalized blueprint shows how to build systems, not dependencies.',
        };
      case 'agency':
        return {
          title: 'Agency Black Box Trap Blueprint',
          description: 'You need to escape the agency dependency cycle. Your personalized blueprint is on its way.',
        };
      case 'freelancer':
        return {
          title: 'Why Freelancers Fail at Scale',
          description: 'Freelancers hit a ceiling fast. Your personalized blueprint shows the path to scalable systems.',
        };
      default:
        return {
          title: 'Your GTM Blueprint',
          description: 'Your personalized pipeline diagnosis is on its way.',
        };
    }
  };

  const bucketInfo = getBucketInfo();

  return (
    <div className="min-h-screen">
      <SEO 
        title="Thank You - Pipeline Assessment | Revenue Party"
        description="Thank you for completing the pipeline assessment. Check your email for your personalized GTM blueprint."
        canonical="/pipeline-assessment/thank-you"
      />

      <section className="pt-32 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-thank-you">
              Thank You!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personalized GTM Architecture Blueprint is being generated. It will arrive in your inbox in the next 5-10 minutes.
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{bucketInfo.title}</h2>
              <p className="text-lg text-muted-foreground">{bucketInfo.description}</p>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Stay Updated</h3>
                </div>
                <p className="text-muted-foreground">
                  Get weekly insights on building scalable GTM systems and avoiding common pipeline traps.
                </p>

                {!subscribed ? (
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      data-testid="input-newsletter-email"
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={newsletterMutation.isPending}
                      data-testid="button-subscribe"
                    >
                      {newsletterMutation.isPending ? 'Subscribing...' : 'Subscribe to Newsletter'}
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">You're subscribed!</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Book 15 Min Consult</h3>
                </div>
                <p className="text-muted-foreground">
                  See if a Free GTM Audit is right for you. Let's discuss your specific challenges and opportunities.
                </p>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    window.open('https://calendly.com/revenue-party', '_blank');
                  }}
                  data-testid="button-book-consult"
                >
                  Schedule Free Consult
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No pressure. Just a conversation about your GTM challenges.
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
