import { Switch, Route, useLocation } from "wouter";
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
import BrandingPage from "@/pages/BrandingPage";
import BrandingProjectPage from "@/pages/BrandingProjectPage";
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
import ManifestoPost from "@/pages/blog/ManifestoPost";
import AssessmentRuntime from "@/pages/AssessmentRuntime";
import AssessmentResult from "@/pages/AssessmentResult";
import NotFound from "@/pages/not-found";
import { ServiceWorker } from "@/components/ServiceWorker";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, lazy, Suspense, useState, useCallback, useMemo } from "react";
import { CampaignBootstrap } from "@/lib/campaignCache";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { SkipLink } from "./components/SkipLink";

// Lazy load admin pages (reduces initial bundle by ~300KB)
const LoginPageLazy = lazy(() => import("@/pages/admin/LoginPage"));
const RegisterPageLazy = lazy(() => import("@/pages/admin/RegisterPage"));
const ForgotPasswordPageLazy = lazy(() => import("@/pages/admin/ForgotPasswordPage"));
const ResetPasswordPageLazy = lazy(() => import("@/pages/admin/ResetPasswordPage"));
const WelcomePageLazy = lazy(() => import("@/pages/admin/WelcomePage"));
const AdminDashboardLazy = lazy(() => import("@/pages/admin/AdminDashboard"));
const FeatureFlagsPageLazy = lazy(() => import("@/pages/admin/FeatureFlagsPage"));
const BlogPostsListLazy = lazy(() => import("@/pages/admin/BlogPostsList"));
const BlogPostFormLazy = lazy(() => import("@/pages/admin/BlogPostForm"));
const VideoPostsListLazy = lazy(() => import("@/pages/admin/VideoPostsList"));
const VideoPostFormLazy = lazy(() => import("@/pages/admin/VideoPostForm"));
const WidgetConfigPageLazy = lazy(() => import("@/pages/admin/WidgetConfigPage"));
const AssessmentConfigsListLazy = lazy(() => import("@/pages/admin/AssessmentConfigsList"));
const AssessmentConfigFormLazy = lazy(() => import("@/pages/admin/AssessmentConfigForm"));
const CampaignsListLazy = lazy(() => import("@/pages/admin/CampaignsList"));
const CampaignFormLazy = lazy(() => import("@/pages/admin/CampaignForm"));
const AssessmentAdminDashboardLazy = lazy(() => import("@/pages/AssessmentAdminDashboard"));
const ContentLibraryLazy = lazy(() => import("@/pages/admin/ContentLibrary"));
const TestimonialFormLazy = lazy(() => import("@/pages/admin/TestimonialForm"));
const ProjectFormLazy = lazy(() => import("@/pages/admin/ProjectForm"));
const JobPostingFormLazy = lazy(() => import("@/pages/admin/JobPostingForm"));
const PortfolioBuilderLazy = lazy(() => import("@/pages/admin/PortfolioBuilder"));

// Loading fallback component
function PageLoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen p-8 gap-4" data-testid="loading-page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// HOC to wrap lazy-loaded components with Suspense while preserving route props
function withLazyLoading(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>
): React.ComponentType<any> {
  const WrappedComponent: React.ComponentType<any> = (props) => (
    <Suspense fallback={<PageLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  return WrappedComponent;
}

// Wrapped admin pages that preserve route props
const LoginPage = withLazyLoading(LoginPageLazy);
const RegisterPage = withLazyLoading(RegisterPageLazy);
const ForgotPasswordPage = withLazyLoading(ForgotPasswordPageLazy);
const ResetPasswordPage = withLazyLoading(ResetPasswordPageLazy);
const WelcomePage = withLazyLoading(WelcomePageLazy);
const AdminDashboard = withLazyLoading(AdminDashboardLazy);
const ContentLibrary = withLazyLoading(ContentLibraryLazy);
const FeatureFlagsPage = withLazyLoading(FeatureFlagsPageLazy);
const BlogPostsList = withLazyLoading(BlogPostsListLazy);
const BlogPostForm = withLazyLoading(BlogPostFormLazy);
const VideoPostsList = withLazyLoading(VideoPostsListLazy);
const VideoPostForm = withLazyLoading(VideoPostFormLazy);
const WidgetConfigPage = withLazyLoading(WidgetConfigPageLazy);
const AssessmentConfigsList = withLazyLoading(AssessmentConfigsListLazy);
const AssessmentConfigForm = withLazyLoading(AssessmentConfigFormLazy);
const CampaignsList = withLazyLoading(CampaignsListLazy);
const CampaignForm = withLazyLoading(CampaignFormLazy);
const AssessmentAdminDashboard = withLazyLoading(AssessmentAdminDashboardLazy);
const TestimonialForm = withLazyLoading(TestimonialFormLazy);
const ProjectForm = withLazyLoading(ProjectFormLazy);
const JobPostingForm = withLazyLoading(JobPostingFormLazy);
const PortfolioBuilder = withLazyLoading(PortfolioBuilderLazy);


function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top on route change, unless there's a hash in the URL
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      {/* Core Pages */}
      <Route path="/" component={Home} />
      <Route path="/problem" component={ProblemPage} />
      <Route path="/gtm-engine" component={GTMEnginePage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/why-us" component={About} />
      <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/branding" component={BrandingPage} />
      <Route path="/branding/:slug" component={BrandingProjectPage} />
      <Route path="/audit" component={AuditPage} />

      {/* Tools & Resources */}
      <Route path="/roi-calculator" component={ROICalculator} />
      <Route path="/assessment" component={AssessmentPage} />
      <Route path="/pipeline-assessment" component={PipelineAssessmentPage} />
      <Route path="/pipeline-assessment/thank-you" component={PipelineAssessmentThankYou} />

      {/* Configurable Assessments (Public Runtime) */}
      <Route path="/assessments/:slug" component={AssessmentRuntime} />
      <Route path="/assessments/results/:sessionId" component={AssessmentResult} />

      {/* Admin Routes - Lazy loaded with Suspense for code splitting */}
      <Route path="/admin/login" component={LoginPage} />
      <Route path="/admin/register" component={RegisterPage} />
      <Route path="/admin/forgot-password" component={ForgotPasswordPage} />
      <Route path="/admin/reset-password/:token" component={ResetPasswordPage} />
      <Route path="/admin/welcome" component={WelcomePage} />
      <Route path="/admin/content" component={ContentLibrary} />
      <Route path="/admin/feature-flags" component={FeatureFlagsPage} />
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
      <Route path="/admin/testimonials/new" component={TestimonialForm} />
      <Route path="/admin/testimonials/:id/edit" component={TestimonialForm} />
      <Route path="/admin/projects/new" component={ProjectForm} />
      <Route path="/admin/projects/:id/edit" component={ProjectForm} />
      <Route path="/admin/portfolio-builder" component={PortfolioBuilder} />
          <Route path="/admin/ai-prompt-settings" component={() => import("./pages/admin/AIPromptSettings").then(m => m.default)} />
      <Route path="/admin/job-postings/new" component={JobPostingForm} />
      <Route path="/admin/job-postings/:id/edit" component={JobPostingForm} />
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
    </>
  );
}

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Set up global keyboard shortcuts - simplified to avoid initialization crashes
  useKeyboardShortcuts(
    GLOBAL_SHORTCUTS.map(shortcut => 
      shortcut.key === '?' 
        ? { ...shortcut, action: () => setShowShortcuts(true) }
        : shortcut
    ),
    true
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <TooltipProvider>
              <CampaignBootstrap>
                <ErrorBoundary>
                  <SkipLink />
                  <div className="min-h-screen bg-background text-foreground">
                    <Navbar />
                    <main id="main-content" role="main" aria-label="Main content region">
                      <Router />
                    </main>
                    <Footer />
                    <FloatingWidget />
                    <PopupEngine />
                  </div>
                  <Toaster />
                  <ServiceWorker />
                  {/* Keyboard Shortcuts Modal */}
                  <KeyboardShortcutsModal 
                    open={showShortcuts} 
                    onOpenChange={setShowShortcuts}
                  />
                </ErrorBoundary>
              </CampaignBootstrap>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;