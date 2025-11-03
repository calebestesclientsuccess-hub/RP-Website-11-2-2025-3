import { Helmet } from "react-helmet-async";
import { useSearch, Link } from "wouter";
import { DiagnosticReadoutCard } from "@/components/DiagnosticReadoutCard";
import { BlueprintCaptureForm } from "@/components/BlueprintCaptureForm";
import { SecondaryFitCallButton } from "@/components/SecondaryFitCallButton";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function GtmResultPath4() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q1 = params.get("q1") || "";
  const q2 = params.get("q2") || "";

  return (
    <>
      <Helmet>
        <title>Complex Value Prop - Enterprise Budget Solution | Revenue Party</title>
        <meta
          name="description"
          content="Your personalized GTM assessment results for complex value propositions with enterprise budget."
        />
        <meta property="og:title" content="Complex Value Prop - Enterprise Budget Solution | Revenue Party" />
        <meta
          property="og:description"
          content="Your personalized GTM assessment results for complex value propositions with enterprise budget."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="space-y-8">
            <DiagnosticReadoutCard pathName="Path 4: Complex Value Prop - Enterprise Budget" />

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

            <div className="pt-8 space-y-6 border-t border-border">
              <div>
                <h3 className="text-2xl font-bold mb-4">Get Your Personalized Blueprint</h3>
                <BlueprintCaptureForm
                  path="path-4"
                  q1={q1}
                  q2={q2}
                  customMessage="Your enterprise budget enables a fully-scaled GTM engine. Let's design your custom revenue acceleration system."
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <SecondaryFitCallButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Also</span>
                </div>
              </div>

              <Button variant="ghost" size="lg" className="w-full" asChild data-testid="link-case-studies">
                <Link href="/results">
                  <FileText className="mr-2 h-5 w-5" />
                  View Case Studies & Results
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
