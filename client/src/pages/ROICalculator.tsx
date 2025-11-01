import { SEO } from "@/components/SEO";

export default function ROICalculator() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SEO 
        title="ROI Calculator - Compare In-House vs GTM System | Revenue Party"
        description="Calculate the true cost of hiring vs deploying a complete GTM system. See your savings and time-to-revenue."
        keywords="sales ROI calculator, hiring costs, GTM system cost, BDR cost comparison"
        canonical="/roi-calculator"
      />
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold" data-testid="heading-roi-calculator">
          ROI Calculator
        </h1>
        <p className="text-muted-foreground" data-testid="text-roi-note">
          Note: This page will contain the calculator tool
        </p>
      </div>
    </div>
  );
}
