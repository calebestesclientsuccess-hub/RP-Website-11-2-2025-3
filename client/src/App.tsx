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
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, lazy, Suspense, useState, useCallback, useMemo, type ReactNode } from "react";
import { CampaignBootstrap } from "@/lib/campaignCache";
import { Skeleton } from "@/components/ui/skeleton";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { SkipLink } from "./components/SkipLink";
import { ShortcutRegistryProvider, useShortcutRegistry } from "@/context/ShortcutRegistryContext";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import { FeatureFlaggedRoute } from "@/components/FeatureFlaggedRoute";
import { ChunkReloadBoundary } from "@/components/ChunkReloadBoundary";
import { ConsentProvider } from "@/hooks/use-consent";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

// Lazy load admin pages (reduces initial bundle by ~300KB)
const LoginPageLazy = lazy(() => import("@/pages/admin/LoginPage"));
const RegisterPageLazy = lazy(() => import("@/pages/admin/RegisterPage"));
const ForgotPasswordPageLazy = lazy(() => import("@/pages/admin/ForgotPasswordPage"));
const ResetPasswordPageLazy = lazy(() => import("@/pages/admin/ResetPasswordPage"));
const WelcomePageLazy = lazy(() => import("@/pages/admin/WelcomePage"));
const AdminDashboardLazy = lazy(() => import("@/pages/admin/AdminDashboard"));
const FeatureFlagsPageLazy = lazy(() => import("@/pages/admin/FeatureFlagsPage"));
const EbookLeadMagnetsLazy = lazy(() => import("@/pages/admin/EbookLeadMagnets"));
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
const PortfolioWizardLazy = lazy(() => import("@/pages/admin/PortfolioWizard"));
const AIPromptSettingsLazy = lazy(() => import("@/pages/admin/AIPromptSettings"));
const PortfolioPromptManagerLazy = lazy(() => import("@/pages/admin/PortfolioPromptManager"));
const MediaLibraryLazy = lazy(() => import("@/pages/admin/MediaLibrary").catch(err => {
  console.error('Failed to load MediaLibrary:', err);
  return { default: () => <div className="p-8 text-center">Failed to load Media Library. Please refresh the page.</div> };
}));
const TemplateLibraryLazy = lazy(() => import("@/pages/admin/TemplateLibrary"));
const UnifiedCreatorLazy = lazy(() => import("@/pages/admin/UnifiedCreator"));
const ProjectSceneEditorLazy = lazy(() => import("@/pages/admin/ProjectSceneEditor"));
const FieldManagerLazy = lazy(() => import("@/pages/admin/FieldManager"));
const CrmWorkspaceLazy = lazy(() => import("@/pages/admin/CrmWorkspace"));
const CaseStudyEditorLazy = lazy(() => import("@/pages/admin/CaseStudyEditor"));
const CreatePortfolioLazy = lazy(() => import("@/pages/admin/CreatePortfolio"));
const DataManagementLazy = lazy(() => import("@/pages/admin/DataManagement"));

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

function MaintenanceScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">We’ll Be Right Back</h1>
      <p className="text-muted-foreground max-w-2xl">
        We’re performing scheduled maintenance to polish the experience. Please check back soon or
        reach out to your Revenue Party contact if you need immediate assistance.
      </p>
    </div>
  );
}

function MaintenanceBoundary({ children }: { children: ReactNode }) {
  const { isEnabled: maintenanceEnabled, isLoading } = useFeatureFlag("maintenance-mode");
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  if (maintenanceEnabled) {
    return <MaintenanceScreen />;
  }

  return <>{children}</>;
}

// HOC to wrap lazy-loaded components with Suspense while preserving route props
function withLazyLoading(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>
): React.ComponentType<any> {
  const WrappedComponent: React.ComponentType<any> = (props) => (
    <ChunkReloadBoundary fallback={<PageLoadingFallback />}>
      <Suspense fallback={<PageLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ChunkReloadBoundary>
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
const EbookLeadMagnets = withLazyLoading(EbookLeadMagnetsLazy);
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
const PortfolioWizard = withLazyLoading(PortfolioWizardLazy);
const AIPromptSettings = withLazyLoading(AIPromptSettingsLazy);
const PortfolioPromptManager = withLazyLoading(PortfolioPromptManagerLazy);
const MediaLibrary = withLazyLoading(MediaLibraryLazy);
const TemplateLibrary = withLazyLoading(TemplateLibraryLazy);
const UnifiedCreator = withLazyLoading(UnifiedCreatorLazy);
const ProjectSceneEditor = withLazyLoading(ProjectSceneEditorLazy);
const FieldManager = withLazyLoading(FieldManagerLazy);
const CrmWorkspace = withLazyLoading(CrmWorkspaceLazy);
const CaseStudyEditor = withLazyLoading(CaseStudyEditorLazy);
const CreatePortfolio = withLazyLoading(CreatePortfolioLazy);
const DataManagement = withLazyLoading(DataManagementLazy);

const lazyPage = (
  loader: () => Promise<{ default: React.ComponentType<any> }>,
) => withLazyLoading(lazy(loader));

const ProblemPage = lazyPage(() => import("@/pages/ProblemPage"));
const GTMEnginePage = lazyPage(() => import("@/pages/GTMEnginePage"));
const ResultsPage = lazyPage(() => import("@/pages/ResultsPage"));
const About = lazyPage(() => import("@/pages/About"));
const BlogPage = lazyPage(() => import("@/pages/BlogPage"));
const BlogPostPage = lazyPage(() => import("@/pages/blog/BlogPostPage"));
const BrandingPage = lazyPage(() => import("@/pages/BrandingPage"));
const BrandingProjectPage = lazyPage(() => import("@/pages/BrandingProjectPage"));
const AuditPage = lazyPage(() => import("@/pages/AuditPage"));
const ROICalculator = lazyPage(() => import("@/pages/ROICalculator"));
const AssessmentPage = lazyPage(() => import("@/pages/AssessmentPage"));
const PipelineAssessmentPage = lazyPage(() => import("@/pages/PipelineAssessmentPage"));
const PipelineAssessmentThankYou = lazyPage(() => import("@/pages/PipelineAssessmentThankYou"));
const AssessmentRuntime = lazyPage(() => import("@/pages/AssessmentRuntime"));
const AssessmentResult = lazyPage(() => import("@/pages/AssessmentResult"));
const PreviewPortfolio = lazyPage(() => import("@/pages/PreviewPortfolio"));
const ContactPage = lazyPage(() => import("@/pages/ContactPage"));
const PricingPage = lazyPage(() => import("@/pages/PricingPage"));
const FAQPage = lazyPage(() => import("@/pages/FAQPage"));
const InternalTrapGuide = lazyPage(() => import("@/pages/resources/InternalTrapGuide"));
const AgencyTrapGuide = lazyPage(() => import("@/pages/resources/AgencyTrapGuide"));
const SalesAsAServiceGuide = lazyPage(() => import("@/pages/resources/SalesAsAServiceGuide"));
const HireColdCallersGuide = lazyPage(() => import("@/pages/HireColdCallersGuide"));
const FourPathsToHireColdCaller = lazyPage(() => import("@/pages/resources/FourPathsToHireColdCaller"));
const GtmAssessmentPage = lazyPage(() => import("@/pages/GtmAssessmentPage"));
const GtmResultPath1 = lazyPage(() => import("@/pages/GtmResultPath1"));
const GtmResultPath2 = lazyPage(() => import("@/pages/GtmResultPath2"));
const GtmResultPath3 = lazyPage(() => import("@/pages/GtmResultPath3"));
const GtmResultPath4 = lazyPage(() => import("@/pages/GtmResultPath4"));
const ManifestoPost = lazyPage(() => import("@/pages/blog/ManifestoPost"));
function RedirectToBuilder() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/admin/portfolio-builder");
  }, [navigate]);
  return null;
}



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
          <FeatureFlaggedRoute
            path="/"
            flagKey="page-home"
            component={Home}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/problem"
            flagKey="page-problem"
            component={ProblemPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/gtm-engine"
            flagKey="page-gtm-engine"
            component={GTMEnginePage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/results"
            flagKey="page-results"
            component={ResultsPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/why-us"
            flagKey="page-about"
            component={About}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/blog"
            flagKey="page-blog"
            component={BlogPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/blog/:slug"
            flagKey="page-blog"
            component={BlogPostPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/blog/manifesto-the-lone-wolf-trap"
            flagKey="page-blog"
            component={ManifestoPost}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/branding"
            flagKey="page-branding"
            component={BrandingPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/branding/:slug"
            flagKey="page-branding"
            component={BrandingProjectPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/audit"
            flagKey="page-audit"
            component={AuditPage}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Public Portfolio Preview Route */}
          <FeatureFlaggedRoute
            path="/preview/:projectId"
            flagKey="page-preview-portfolio"
            component={PreviewPortfolio}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Tools & Resources */}
          <FeatureFlaggedRoute
            path="/roi-calculator"
            flagKey="page-roi-calculator"
            component={ROICalculator}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/assessment"
            flagKey="page-assessment"
            component={AssessmentPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/pipeline-assessment"
            flagKey="page-pipeline-assessment"
            component={PipelineAssessmentPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/pipeline-assessment/thank-you"
            flagKey="page-pipeline-assessment"
            component={PipelineAssessmentThankYou}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Configurable Assessments (Public Runtime) */}
          <FeatureFlaggedRoute
            path="/assessments/:slug"
            flagKey="page-assessment"
            component={AssessmentRuntime}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/assessments/results/:sessionId"
            flagKey="page-assessment"
            component={AssessmentResult}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Resource Pillar Pages */}
          <FeatureFlaggedRoute
            path="/resources/how-to-build-sdr-team-guide"
            flagKey="page-resources"
            component={InternalTrapGuide}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/sdr-outsourcing-companies-guide"
            flagKey="page-resources"
            component={AgencyTrapGuide}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/guide-to-sales-as-a-service"
            flagKey="page-resources"
            component={SalesAsAServiceGuide}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/how-to-hire-cold-callers-guide"
            flagKey="page-resources"
            component={HireColdCallersGuide}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/4-paths-hire-cold-caller"
            flagKey="page-resources"
            component={FourPathsToHireColdCaller}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/gtm-assessment"
            flagKey="page-resources"
            component={GtmAssessmentPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/gtm-assessment/path-1"
            flagKey="page-resources"
            component={GtmResultPath1}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/gtm-assessment/path-2"
            flagKey="page-resources"
            component={GtmResultPath2}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/gtm-assessment/path-3"
            flagKey="page-resources"
            component={GtmResultPath3}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/resources/gtm-assessment/path-4"
            flagKey="page-resources"
            component={GtmResultPath4}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Company */}
          <FeatureFlaggedRoute
            path="/pricing"
            flagKey="page-pricing"
            component={PricingPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/faq"
            flagKey="page-faq"
            component={FAQPage}
            loadingFallback={<PageLoadingFallback />}
          />
          <FeatureFlaggedRoute
            path="/contact"
            flagKey="page-contact"
            component={ContactPage}
            loadingFallback={<PageLoadingFallback />}
          />

          {/* Admin Routes - Lazy loaded with Suspense for code splitting */}
          <Route path="/admin/login" component={LoginPage} />
          <Route path="/admin/register" component={RegisterPage} />
          <Route path="/admin/forgot-password" component={ForgotPasswordPage} />
          <Route path="/admin/reset-password/:token" component={ResetPasswordPage} />
          <Route path="/admin/welcome" component={WelcomePage} />
          <Route path="/admin/content" component={ContentLibrary} />
          <Route path="/admin/feature-flags" component={FeatureFlagsPage} />
          <Route path="/admin/ebook-lead-magnets" component={EbookLeadMagnets} />
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
          <Route path="/admin/portfolio/:slug" component={ProjectSceneEditor} />
          <Route path="/admin/portfolio/:slug" component={ProjectSceneEditor} />
          <Route path="/admin/case-studies/:projectId" component={CaseStudyEditor} />
          <Route path="/admin/portfolio-wizard" component={PortfolioWizard} />
          <Route path="/admin/wizard" component={RedirectToBuilder} />
          <Route path="/admin/portfolio-builder" component={PortfolioBuilder} />
          <Route path="/admin/portfolio-prompts" component={PortfolioPromptManager} />
          <Route path="/admin/ai-prompt-settings" component={AIPromptSettings} />
          <Route path="/admin/media-library" component={MediaLibrary} />
          <Route path="/admin/template-library" component={TemplateLibrary} />
          <Route path="/admin/crm/fields" component={FieldManager} />
          <Route path="/admin/crm/workspace" component={CrmWorkspace} />
          <Route path="/admin/create" component={UnifiedCreator} />
          <Route path="/admin/create-portfolio" component={CreatePortfolio} />
          <Route path="/admin/job-postings/new" component={JobPostingForm} />
          <Route path="/admin/job-postings/:id/edit" component={JobPostingForm} />
          <Route path="/admin/widget-config" component={WidgetConfigPage} />
          <Route path="/admin/data-management" component={DataManagement} />

          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
    </>
  );
}

function AppShell() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { shortcuts } = useShortcutRegistry();

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
            <FeatureFlagProvider>
              <TooltipProvider>
                <CampaignBootstrap>
                  <ErrorBoundary>
                    <SkipLink />
                    <MaintenanceBoundary>
                      <div className="min-h-screen bg-background text-foreground">
                        <Navbar />
                        <main id="main-content" role="main" aria-label="Main content region">
                          <Router />
                        </main>
                        <Footer />
                        <FloatingWidget />
                        <PopupEngine />
                        <CookieConsentBanner />
                      </div>
                    </MaintenanceBoundary>
                    <Toaster />
                    {/* Keyboard Shortcuts Modal */}
                    <KeyboardShortcutsModal
                      open={showShortcuts}
                      onOpenChange={setShowShortcuts}
                      additionalShortcuts={shortcuts}
                    />
                  </ErrorBoundary>
                </CampaignBootstrap>
              </TooltipProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ShortcutRegistryProvider>
      <ConsentProvider>
        <AppShell />
      </ConsentProvider>
    </ShortcutRegistryProvider>
  );
}

export default App;