import { Helmet } from "react-helmet-async";
import { useSearch } from "wouter";
import { DiagnosticReadoutCard } from "@/components/DiagnosticReadoutCard";
import { BlueprintCaptureForm } from "@/components/BlueprintCaptureForm";
import { SecondaryFitCallButton } from "@/components/SecondaryFitCallButton";

export default function GtmResultPath2() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const q1 = params.get("q1") || "";
  const q2 = params.get("q2") || "";

  return (
    <>
      <Helmet>
        <title>Complex Value Prop - Low Budget Solution | Revenue Party</title>
        <meta
          name="description"
          content="Your personalized GTM assessment results for complex value propositions with low budget constraints."
        />
        <meta property="og:title" content="Complex Value Prop - Low Budget Solution | Revenue Party" />
        <meta
          property="og:description"
          content="Your personalized GTM assessment results for complex value propositions with low budget constraints."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="space-y-8">
            <DiagnosticReadoutCard pathName="Path 2: Complex Value Prop - Low Budget" />

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
                  path="path-2"
                  q1={q1}
                  q2={q2}
                  customMessage="Based on your complex value prop and budget constraints, we've created a tailored approach to maximize your outbound ROI."
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
