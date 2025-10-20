import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MessageSquare, Linkedin, Twitter, Calendar } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-community/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <Badge variant="default" className="mb-4">Get In Touch</Badge>
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            Let's Talk GTM
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            Ready to deploy a complete revenue system? Schedule a 30-minute GTM audit 
            and we'll show you exactly how we can accelerate your pipeline.
          </p>
        </div>
      </section>

      {/* Schedule Meeting Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-community/10 to-purple-dark/10">
        <div className="container mx-auto px-6 max-w-3xl">
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4" data-testid="text-schedule-title">
              Schedule Your GTM Audit
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              In 30 minutes, we'll analyze your current GTM motion, identify pipeline gaps, 
              and show you exactly how a Fully Loaded BDR Pod can transform your outbound.
            </p>
            <Button size="lg" className="text-lg px-8 py-6" data-testid="button-schedule-meeting">
              Book Your 30-Minute Audit →
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No pressure, no pitch deck—just a strategic conversation about your growth.
            </p>
          </Card>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Other Ways to Reach Us</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email */}
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <a 
                    href="mailto:hello@revenueparty.com" 
                    className="text-primary hover:underline"
                    data-testid="link-email"
                  >
                    hello@revenueparty.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    We respond within 24 hours
                  </p>
                </div>
              </div>
            </Card>

            {/* Phone */}
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-community/10 rounded-lg">
                  <Phone className="w-6 h-6 text-community" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <a 
                    href="tel:+15551234567" 
                    className="text-primary hover:underline"
                    data-testid="link-phone"
                  >
                    +1 (555) 123-4567
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mon-Fri, 9am-6pm EST
                  </p>
                </div>
              </div>
            </Card>

            {/* Live Chat */}
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-dark/10 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-dark" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Live Chat</h3>
                  <button 
                    className="text-primary hover:underline text-left"
                    data-testid="button-live-chat"
                  >
                    Start a conversation
                  </button>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available during business hours
                  </p>
                </div>
              </div>
            </Card>

            {/* LinkedIn */}
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo/10 rounded-lg">
                  <Linkedin className="w-6 h-6 text-indigo" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">LinkedIn</h3>
                  <a 
                    href="https://linkedin.com/company/revenueparty" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-linkedin"
                  >
                    Follow us on LinkedIn
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    GTM insights & updates
                  </p>
                </div>
              </div>
            </Card>

            {/* Twitter */}
            <Card className="p-6 hover-elevate transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Twitter className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Twitter</h3>
                  <a 
                    href="https://twitter.com/revenueparty" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-twitter"
                  >
                    @revenueparty
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily GTM tactics
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">What to Expect</h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">What happens during the GTM Audit?</h3>
              <p className="text-muted-foreground">
                We'll discuss your current outbound motion, ideal customer profile, sales cycle, 
                and pipeline goals. Then we'll show you exactly how a Fully Loaded BDR Pod would 
                integrate into your GTM strategy and what results you can expect.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">Is there any pressure to buy?</h3>
              <p className="text-muted-foreground">
                Zero. This is a strategic conversation. If we're not a fit, we'll tell you. 
                If there's a better approach for your business, we'll recommend it—even if it's 
                not us.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-2">How quickly can we get started?</h3>
              <p className="text-muted-foreground">
                If we decide to move forward, we can have your Fully Loaded BDR Pod deployed 
                and booking meetings in 2-3 weeks. No 6-month hiring saga.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Rev Up Your GTM Engine?</h2>
          <p className="text-muted-foreground mb-8">
            The fastest way to get answers is to schedule your 30-minute audit.
          </p>
          <Button size="lg" data-testid="button-schedule-audit-footer">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
