import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FloatingCalculatorCTA } from "./components/FloatingCalculatorCTA";
import Home from "@/pages/Home";
import ProblemPage from "@/pages/ProblemPage";
import GTMEnginePage from "@/pages/GTMEnginePage";
import ResultsPage from "@/pages/ResultsPage";
import About from "@/pages/About";
import BlogPage from "@/pages/BlogPage";
import AuditPage from "@/pages/AuditPage";
import ROICalculator from "@/pages/ROICalculator";
import AssessmentPage from "@/pages/AssessmentPage";
import ContactPage from "@/pages/ContactPage";
import PricingPage from "@/pages/PricingPage";
import FAQPage from "@/pages/FAQPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Core Pages */}
      <Route path="/" component={Home} />
      <Route path="/problem" component={ProblemPage} />
      <Route path="/gtm-engine" component={GTMEnginePage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/why-us" component={About} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/audit" component={AuditPage} />
      
      {/* Tools & Resources */}
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/assessment" component={AssessmentPage} />
      
      {/* Company */}
      <Route path="/pricing" component={PricingPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>
              <Router />
            </main>
            <Footer />
            <FloatingCalculatorCTA />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
