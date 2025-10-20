import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "@/pages/Home";
import GTMEnginePage from "@/pages/GTMEnginePage";
import FullyLoadedBDRPage from "@/pages/FullyLoadedBDRPage";
import Methodology from "@/pages/Methodology";
import FullStackSalespersonPage from "@/pages/FullStackSalespersonPage";
import AIPoweredPage from "@/pages/AIPoweredPage";
import ResultsPage from "@/pages/ResultsPage";
import ROICalculator from "@/pages/ROICalculator";
import SuccessStoriesPage from "@/pages/SuccessStoriesPage";
import BlueprintsPage from "@/pages/BlueprintsPage";
import BlueprintPost from "@/pages/BlueprintPost";
import ComparisonPage from "@/pages/ComparisonPage";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import CareerDetail from "@/pages/CareerDetail";
import ContactPage from "@/pages/ContactPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Core Pages */}
      <Route path="/" component={Home} />
      <Route path="/gtm-engine" component={GTMEnginePage} />

      {/* Solutions Section */}
      <Route path="/solutions/fully-loaded-bdr-pod" component={FullyLoadedBDRPage} />

      {/* Methodology Section */}
      <Route path="/methodology" component={Methodology} />
      <Route path="/methodology/full-stack-salesperson" component={FullStackSalespersonPage} />
      <Route path="/methodology/ai-powered-by-humans" component={AIPoweredPage} />

      {/* Results Section */}
      <Route path="/results" component={ResultsPage} />
      <Route path="/results/roi-calculator" component={ROICalculator} />
      <Route path="/results/success-stories" component={SuccessStoriesPage} />

      {/* Resources */}
      <Route path="/blueprints" component={BlueprintsPage} />
      <Route path="/blueprints/:slug" component={BlueprintPost} />
      <Route path="/comparison" component={ComparisonPage} />

      {/* Company */}
      <Route path="/why-party" component={About} />
      <Route path="/join-the-party" component={Careers} />
      <Route path="/join-the-party/:id" component={CareerDetail} />
      <Route path="/contact-us" component={ContactPage} />

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
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
