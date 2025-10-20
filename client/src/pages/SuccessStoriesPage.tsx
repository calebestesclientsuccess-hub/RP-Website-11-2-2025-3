import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export default function SuccessStoriesPage() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <Badge variant="community" className="mb-4">Community Success</Badge>
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            Success Stories
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            Real GTM leaders, real results. Here's what happens when you deploy a 
            complete revenue system instead of just hiring another rep.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-5/6 mb-2" />
                    <div className="h-4 bg-muted rounded w-4/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : testimonials && testimonials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="hover-elevate transition-all bg-gradient-to-br from-community/5 to-transparent" data-testid={`card-testimonial-${testimonial.id}`}>
                  <CardContent className="p-8">
                    <Quote className="w-8 h-8 text-community/40 mb-4" />
                    <p className="text-foreground mb-6 leading-relaxed" data-testid={`text-content-${testimonial.id}`}>
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t border-community/20 pt-4">
                      <p className="font-bold text-foreground" data-testid={`text-client-${testimonial.id}`}>
                        {testimonial.name}
                      </p>
                      {testimonial.title && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-role-${testimonial.id}`}>
                          {testimonial.title}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-community mt-1" data-testid={`text-company-${testimonial.id}`}>
                        {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No success stories available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Common Outcomes</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="text-4xl font-bold text-primary mb-2">3-5x</div>
              <h3 className="text-xl font-bold mb-3">Faster Time-to-Market</h3>
              <p className="text-muted-foreground">
                Most companies take 3-6 months to hire, train, and ramp a BDR. 
                Our clients start getting qualified meetings in 2-3 weeks.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-4xl font-bold text-community mb-2">60%+</div>
              <h3 className="text-xl font-bold mb-3">Cost Savings</h3>
              <p className="text-muted-foreground">
                When you factor in salary, benefits, tech stack, and management time, 
                our BDR Pods deliver the same output at a fraction of the cost.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-4xl font-bold text-purple-dark mb-2">100%</div>
              <h3 className="text-xl font-bold mb-3">Playbook Ownership</h3>
              <p className="text-muted-foreground">
                Unlike agencies that keep their "secret sauce" locked away, you own 
                your complete GTM playbook—it's a strategic asset you can scale.
              </p>
            </Card>

            <Card className="p-8">
              <div className="text-4xl font-bold text-community mb-2">Zero</div>
              <h3 className="text-xl font-bold mb-3">Hiring Risk</h3>
              <p className="text-muted-foreground">
                No more gambling on individual hires that might not work out. 
                Our performance-driven model means you only pay for results.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Write Your Own Success Story?</h2>
          <p className="text-muted-foreground mb-8">
            Let's talk about how a Fully Loaded BDR Pod can transform your pipeline.
          </p>
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover-elevate transition-all" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </button>
        </div>
      </section>
    </div>
  );
}
