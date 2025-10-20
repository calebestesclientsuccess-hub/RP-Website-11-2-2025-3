import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PartyPopper } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-community/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="community" className="mb-4">Company Mission</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Performance is Fueled by <span className="text-primary">People.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We architect GTM systems that deliver predictable revenue. But we know a secret most GTM consultants ignore: the most sophisticated machine is useless without a motivated operator. Our entire company is built around one, core conviction...
          </p>
        </div>
      </section>

      {/* Central Quote */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-relaxed">
              "In a profession defined by rejection, 'vibe' isn't a perk; it's a{" "}
              <span className="text-primary">core performance metric.</span> It's the difference between 5 meetings and 35."
            </blockquote>
          </Card>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              The Traditional BDR Model is a <span className="text-destructive">Burnout Machine.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The industry standard for a BDR is to chew them up and spit them out. They are given poor tools, little strategic guidance, and immense pressure. The result is a 33% failure rate, high turnover, and inconsistent results for clients. It's a model that treats talented, ambitious people as disposable assets. This is not just a moral failure; it is a strategic one.
            </p>
          </div>
        </div>
      </section>

      {/* Why Revenue Party */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Why "<span className="text-primary">Revenue Party</span>"?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our name is our strategy, and it's designed for two audiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover-elevate transition-all" data-testid="card-revenue">
              <div className="mb-4">
                <DollarSign className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                For Our Clients, We Deliver <span className="text-primary">REVENUE.</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Predictable, systematic, and engineered for ROI. We are architects and engineers of Go-to-Market machines. We provide the system, the strategy, and the relentless focus on the only metric that matters: measurable financial results.
              </p>
            </Card>

            <Card className="p-8 hover-elevate transition-all" data-testid="card-party">
              <div className="mb-4">
                <PartyPopper className="w-12 h-12 text-community" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                To Do That, We Build a <span className="text-community">PARTY.</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A culture that attracts, energizes, and celebrates the top 1% of sales talent. A "party" is a high-energy, collaborative environment where success is a team sport. By creating the best place for sales professionals to win, we ensure the person executing your campaign is not only skilled, but is in an environment built for peak performance.
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold">
              Our internal <span className="text-community">culture</span> is your <span className="text-primary">competitive advantage.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
