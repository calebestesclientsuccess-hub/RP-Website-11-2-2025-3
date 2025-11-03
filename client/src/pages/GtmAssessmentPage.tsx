import { Helmet } from "react-helmet-async";
import { AssessmentWidget } from "@/components/AssessmentWidget";

export default function GtmAssessmentPage() {
  return (
    <>
      <Helmet>
        <title>GTM Assessment Tool | Revenue Party</title>
        <meta
          name="description"
          content="Diagnose your go-to-market needs in 2 questions. Get a personalized action plan for your sales strategy."
        />
        <meta property="og:title" content="GTM Assessment Tool | Revenue Party" />
        <meta
          property="og:description"
          content="Diagnose your go-to-market needs in 2 questions. Get a personalized action plan for your sales strategy."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              GTM Assessment Tool
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-lg text-muted-foreground mb-6">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <AssessmentWidget mode="standalone" />
        </div>
      </div>
    </>
  );
}
