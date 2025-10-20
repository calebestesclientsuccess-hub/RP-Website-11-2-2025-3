import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, TrendingUp, Shield } from "lucide-react";

export default function AIPoweredPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo/10 via-community/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <Badge variant="indigo" className="mb-4">AI + Human Intelligence</Badge>
          <h1 className="text-6xl font-bold mb-6" data-testid="text-hero-title">
            AI-Powered, Human-Perfected
          </h1>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
            Artificial intelligence doesn't replace your sales team—it amplifies them. 
            Our Signal Factory turns AI from a buzzword into actual pipeline.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-8 text-center">The AI Paradox in Sales</h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Everyone's talking about AI in GTM. Most are using it to send more bad emails, faster. 
            That's not intelligence—it's industrialized spam.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-destructive/30">
              <h3 className="text-xl font-bold mb-4 text-destructive">❌ The Wrong Approach</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>• AI-generated email blasts with no personalization</li>
                <li>• Chatbots that frustrate instead of convert</li>
                <li>• "Smart" tools that create more noise, not signal</li>
                <li>• Zero human oversight or strategic direction</li>
              </ul>
            </Card>

            <Card className="p-6 border-primary/30">
              <h3 className="text-xl font-bold mb-4 text-primary">✓ The Revenue Party Way</h3>
              <ul className="space-y-3 text-foreground">
                <li>• AI analyzes patterns, humans craft strategy</li>
                <li>• Technology surfaces insights, people execute</li>
                <li>• Automation handles repetition, experts handle relationships</li>
                <li>• Data informs decisions, humans make the call</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Use AI */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Signal Factory in Action</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <Brain className="w-10 h-10 text-indigo" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Conversation Intelligence</h3>
                  <p className="text-muted-foreground">
                    Our AI analyzes every call, email, and LinkedIn message to identify what messaging 
                    resonates and where objections arise. Your team learns from every interaction.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <Zap className="w-10 h-10 text-community" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Intent Signal Aggregation</h3>
                  <p className="text-muted-foreground">
                    We monitor buying signals across web behavior, job changes, funding rounds, and tech stack 
                    changes—then surface high-priority accounts to your BDR.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <TrendingUp className="w-10 h-10 text-purple-dark" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Performance Optimization</h3>
                  <p className="text-muted-foreground">
                    AI tracks performance metrics in real-time, automatically testing messaging variations 
                    and channel mix to maximize meeting bookings.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <Shield className="w-10 h-10 text-community" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Quality Assurance</h3>
                  <p className="text-muted-foreground">
                    Every AI-generated insight is reviewed by a human strategist. Every automated action 
                    is governed by playbook rules. No black boxes.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">The Result: Signal, Not Noise</h3>
            <p className="text-foreground mb-4">
              Most GTM teams drown in data. Our Signal Factory cuts through the noise to deliver:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span>Prioritized account lists based on real buying intent</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span>Messaging frameworks proven to convert in your market</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span>Weekly performance insights with clear action items</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">→</span>
                <span>Continuous optimization without constant manual testing</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Ready to Turn AI into Pipeline?</h2>
          <p className="text-muted-foreground mb-8">
            Stop playing with ChatGPT prompts. Get a complete AI-powered GTM system deployed in your business.
          </p>
          <Button size="lg" data-testid="button-schedule-audit">
            Schedule My GTM Audit
          </Button>
        </div>
      </section>
    </div>
  );
}
