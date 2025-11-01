import { SEO } from "@/components/SEO";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO 
        title="GTM Readiness Assessment - Test Your Revenue System | Revenue Party"
        description="Assess your GTM maturity and discover gaps in your revenue generation system. Get personalized recommendations."
        keywords="GTM assessment, sales readiness, revenue system audit"
        canonical="/assessment"
      />
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold" data-testid="heading-assessment">
          GTM Readiness Assessment
        </h1>
        <p className="text-muted-foreground" data-testid="text-assessment-note">
          Note: This page will contain the quiz
        </p>
      </div>
    </div>
  );
}
