import { Card } from "@/components/ui/card";
import { Brain, Code, TrendingUp } from "lucide-react";

export default function Methodology() {
  const attributes = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Strategically-Minded",
      description: "They don't just follow scripts; they understand the \"why\" behind the playbook. They can analyze feedback, identify patterns, and contribute to the evolution of the GTM strategy.",
      color: "#ef233c",
    },
    {
      icon: <Code className="w-12 h-12" />,
      title: "Technically-Fluent",
      description: "Fluent in the modern GTM tech stack, they leverage data and automation not just for efficiency, but for precision. They are as comfortable in a CRM as they are in a conversation.",
      color: "#9F8FFF",
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Commercially-Focused",
      description: "Trained in our Impact Selling framework, they understand that their job isn't to book meetings; it's to initiate valuable business conversations that lead directly to revenue.",
      color: "#2e294e",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Stop Guessing. <span className="text-primary">Start Engineering.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Predictable pipeline isn't the result of charisma or luck; it's the output of a rigorously engineered system. Our methodology is a complete GTM operating system, built on a foundation of elite talent, a commitment to strategic execution, and a proprietary intelligence engine. This is the blueprint for how we build revenue machines.
          </p>
        </div>
      </section>

      {/* Full-Stack Salesperson */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              We Don't Hire Reps. <span className="text-primary">We Develop GTM Athletes.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              The most critical component of any system is the operator. A traditional BDR is trained to be a single-threaded tool—a specialist in one motion. A Full-Stack Salesperson is a strategic athlete, trained to be a versatile, multi-threaded problem solver. They are the human core of our high-performance pods.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {attributes.map((attr, index) => (
              <Card key={index} className="p-8 hover-elevate transition-all" data-testid={`card-attribute-${index}`}>
                <div className="mb-4" style={{ color: attr.color }}>
                  {attr.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{attr.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{attr.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Selling */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Influence Isn't a Script. <span className="text-primary">It's a Strategy.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Traditional sales is a performance for a passive audience. Impact Selling is a collaboration with a scene partner. It's a methodology that shifts the focus from "what to say" to "what to do." It's a structured framework for demonstrating competence, building trust, and guiding a prospect to a conclusion, not pushing them to a decision.
            </p>
          </div>
        </div>
      </section>

      {/* Signal Factory */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Your Unfair Advantage: <span className="text-primary">Private Buying Signals</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              The best time to talk to a buyer is the moment they begin thinking about a problem. While your competitors are buying stale contact lists, our Signal Factory is at work. It's our proprietary intelligence engine that uses AI and data aggregation to identify and surface private buying signals—the digital breadcrumbs that indicate a prospect is entering a buying cycle. This ensures your message doesn't just reach the right person, but reaches them at the right time.
            </p>

            {/* Simple visualization */}
            <Card className="p-12 bg-gradient-to-r from-card/50 to-card">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rp-purple animate-glow-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-rp-red animate-glow-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-rp-indigo animate-glow-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-rp-purple animate-glow-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
                
                <div className="text-2xl font-bold text-muted-foreground">→</div>
                
                <div className="px-8 py-4 bg-background/80 backdrop-blur-sm border-2 border-primary rounded-lg">
                  <p className="font-bold text-primary">Signal Factory</p>
                  <p className="text-sm text-muted-foreground">AI-Powered Intelligence</p>
                </div>
                
                <div className="text-2xl font-bold text-muted-foreground">→</div>
                
                <div className="px-8 py-4 bg-primary/20 border-2 border-primary rounded-lg">
                  <p className="font-bold">Ideal Buyer</p>
                  <p className="text-sm text-muted-foreground">Ready to Engage</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
