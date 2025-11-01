export default function ROICalculator() {
  return (
    <div className="min-h-screen flex items-center justify-center">
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
