import { Helmet } from "react-helmet-async";
import { DiagnosticReadoutCard } from "@/components/DiagnosticReadoutCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function GtmResultPath1() {
  return (
    <>
      <Helmet>
        <title>Simple Value Prop Solution | Revenue Party</title>
        <meta
          name="description"
          content="Your personalized GTM assessment results for simple value propositions."
        />
        <meta property="og:title" content="Simple Value Prop Solution | Revenue Party" />
        <meta
          property="og:description"
          content="Your personalized GTM assessment results for simple value propositions."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="space-y-8">
            <DiagnosticReadoutCard pathName="Path 1: Simple Value Prop Solution" />

            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold mb-4">The Diagnosis</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold mb-4">Your Action Plan</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                <li>Sed do eiusmod tempor incididunt ut labore et dolore</li>
                <li>Ut enim ad minim veniam, quis nostrud exercitation</li>
                <li>Duis aute irure dolor in reprehenderit in voluptate</li>
              </ul>
            </div>

            <div className="pt-8 space-y-4">
              <Button size="lg" className="w-full" asChild data-testid="button-contact">
                <Link href="/contact">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
