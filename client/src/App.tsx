import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./hooks/use-auth";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FloatingWidget } from "./components/FloatingWidget";
import { PopupEngine } from "./components/PopupEngine";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "@/pages/Home";
import ProblemPage from "@/pages/ProblemPage";
import GTMEnginePage from "@/pages/GTMEnginePage";
import ResultsPage from "@/pages/ResultsPage";
import WhyRevPartyPage from "@/pages/WhyRevPartyPage";
import About from "@/pages/About";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/blog/BlogPostPage";
import AuditPage from "@/pages/AuditPage";
import ROICalculator from "@/pages/ROICalculator";
import AssessmentPage from "@/pages/AssessmentPage";
import ContactPage from "@/pages/ContactPage";
import PricingPage from "@/pages/PricingPage";
import FAQPage from "@/pages/FAQPage";
import InternalTrapGuide from "@/pages/resources/InternalTrapGuide";
import AgencyTrapGuide from "@/pages/resources/AgencyTrapGuide";
import SalesAsAServiceGuide from "@/pages/resources/SalesAsAServiceGuide";
import HireColdCallersGuide from "@/pages/HireColdCallersGuide";
import FourPathsToHireColdCaller from "@/pages/resources/FourPathsToHireColdCaller";
import GtmAssessmentPage from "@/pages/GtmAssessmentPage";
import GtmResultPath1 from "@/pages/GtmResultPath1";
import GtmResultPath2 from "@/pages/GtmResultPath2";
import GtmResultPath3 from "@/pages/GtmResultPath3";
import GtmResultPath4 from "@/pages/GtmResultPath4";
import PipelineAssessmentPage from "@/pages/PipelineAssessmentPage";
import PipelineAssessmentThankYou from "@/pages/PipelineAssessmentThankYou";
import AssessmentAdminDashboard from "@/pages/AssessmentAdminDashboard";
import ManifestoPost from "@/pages/blog/ManifestoPost";
import LoginPage from "@/pages/admin/LoginPage";
import RegisterPage from "@/pages/admin/RegisterPage";
import ForgotPasswordPage from "@/pages/admin/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/admin/ResetPasswordPage";
import WelcomePage from "@/pages/admin/WelcomePage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BlogPostsList from "@/pages/admin/BlogPostsList";
import BlogPostForm from "@/pages/admin/BlogPostForm";
import VideoPostsList from "@/pages/admin/VideoPostsList";
import VideoPostForm from "@/pages/admin/VideoPostForm";
import WidgetConfigPage from "@/pages/admin/WidgetConfigPage";
import AssessmentConfigsList from "@/pages/admin/AssessmentConfigsList";
import AssessmentConfigForm from "@/pages/admin/AssessmentConfigForm";
import CampaignsList from "@/pages/admin/CampaignsList";
import CampaignForm from "@/pages/admin/CampaignForm";
import AssessmentRuntime from "@/pages/AssessmentRuntime";
import AssessmentResult from "@/pages/AssessmentResult";
import NotFound from "@/pages/not-found";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ProtectedRoute } from "@/components/ProtectedRoute";


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
          <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/audit" component={AuditPage} />

      {/* Tools & Resources */}
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/assessment" component={AssessmentPage} />
      <Route path="/pipeline-assessment" component={PipelineAssessmentPage} />
      <Route path="/pipeline-assessment/thank-you" component={PipelineAssessmentThankYou} />

      {/* Configurable Assessments (Public Runtime) */}
      <Route path="/assessments/:slug" component={AssessmentRuntime} />
      <Route path="/assessments/results/:sessionId" component={AssessmentResult} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={LoginPage} />
      <Route path="/admin/register" component={RegisterPage} />
      <Route path="/admin/forgot-password" component={ForgotPasswordPage} />
      <Route path="/admin/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/admin/welcome" component={WelcomePage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/assessment-submissions" component={AssessmentAdminDashboard} />
      <Route path="/admin/assessments/new" component={AssessmentConfigForm} />
      <Route path="/admin/assessments/:id/edit" component={AssessmentConfigForm} />
      <Route path="/admin/assessments" component={AssessmentConfigsList} />
      <Route path="/admin/campaigns/new" component={CampaignForm} />
      <Route path="/admin/campaigns/:id/edit" component={CampaignForm} />
      <Route path="/admin/campaigns" component={CampaignsList} />
      <Route path="/admin/blog-posts/new" component={BlogPostForm} />
      <Route path="/admin/blog-posts/:id/edit" component={BlogPostForm} />
      <Route path="/admin/blog-posts" component={BlogPostsList} />
      <Route path="/admin/video-posts/new" component={VideoPostForm} />
      <Route path="/admin/video-posts/:id/edit" component={VideoPostForm} />
      <Route path="/admin/video-posts" component={VideoPostsList} />
      <Route path="/admin/widget-config" component={WidgetConfigPage} />

      {/* Resource Pillar Pages */}
      <Route path="/resources/how-to-build-sdr-team-guide" component={InternalTrapGuide} />
      <Route path="/resources/sdr-outsourcing-companies-guide" component={AgencyTrapGuide} />
      <Route path="/resources/guide-to-sales-as-a-service" component={SalesAsAServiceGuide} />
      <Route path="/resources/how-to-hire-cold-callers-guide" component={HireColdCallersGuide} />
      <Route path="/resources/4-paths-hire-cold-caller" component={FourPathsToHireColdCaller} />

      {/* GTM Assessment Tool */}
      <Route path="/resources/gtm-assessment" component={GtmAssessmentPage} />
      <Route path="/resources/gtm-assessment/path-1" component={GtmResultPath1} />
      <Route path="/resources/gtm-assessment/path-2" component={GtmResultPath2} />
      <Route path="/resources/gtm-assessment/path-3" component={GtmResultPath3} />
      <Route path="/resources/gtm-assessment/path-4" component={GtmResultPath4} />

      {/* Blog Posts */}
      <Route path="/blog/manifesto-the-lone-wolf-trap" component={ManifestoPost} />

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
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <TooltipProvider>
              <ErrorBoundary>
                {/* Skip to content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
                  data-testid="skip-to-content"
                >
                  Skip to main content
                </a>

                <div className="min-h-screen bg-background text-foreground">
                  <Navbar />
                  <main id="main-content" role="main" aria-label="Main content">
                    <Router />
                  </main>
                  <Footer />
                  <FloatingWidget />
                  <PopupEngine />
                </div>
                <Toaster />
                <ServiceWorker />
              </ErrorBoundary>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;