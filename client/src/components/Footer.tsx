import { Link } from "wouter";
import { useTheme } from "./ThemeProvider";
import logoWhite from "@assets/rev-white_1760952720792.png";
import logoBlack from "@assets/Revenueparty-logo-black_1762982410867.png";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

export function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const { isEnabled: problemLinkEnabled } = useFeatureFlag("page-problem");
  const { isEnabled: gtmLinkEnabled } = useFeatureFlag("page-gtm-engine");
  const { isEnabled: resultsLinkEnabled } = useFeatureFlag("page-results");
  const { isEnabled: aboutLinkEnabled } = useFeatureFlag("page-about");
  const { isEnabled: blogLinkEnabled } = useFeatureFlag("page-blog");
  const { isEnabled: resourcesEnabled } = useFeatureFlag("page-resources");
  const { isEnabled: roiEnabled } = useFeatureFlag("page-roi-calculator");
  const { isEnabled: assessmentEnabled } = useFeatureFlag("page-assessment");
  const { isEnabled: pricingEnabled } = useFeatureFlag("page-pricing");
  const { isEnabled: faqEnabled } = useFeatureFlag("page-faq");
  const { isEnabled: contactEnabled } = useFeatureFlag("page-contact");

  return (
    <footer className="bg-card border-t border-card-border mt-32" role="contentinfo" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-8">
          {/* Logo & Mission */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4" data-testid="footer-link-home">
              <img 
                src={theme === "dark" ? logoWhite : logoBlack} 
                alt="Revenue Party Logo" 
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto transition-all duration-300" 
                loading="lazy"
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              We architect GTM systems that deliver predictable revenue. Your next sales hire shouldn't be a person—it should be a complete revenue generation system.
            </p>
          </div>

          {/* Core Pages */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              {problemLinkEnabled && (
                <li>
                  <Link href="/problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-problem">
                    The Problem
                  </Link>
                </li>
              )}
              {gtmLinkEnabled && (
                <li>
                  <Link href="/gtm-engine" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-gtm-engine">
                    The GTM Engine
                  </Link>
                </li>
              )}
              {resultsLinkEnabled && (
                <li>
                  <Link href="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-results">
                    Results & Case Studies
                  </Link>
                </li>
              )}
              {aboutLinkEnabled && (
                <li>
                  <Link href="/why-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-why-us">
                    Why Party?
                  </Link>
                </li>
              )}
              {blogLinkEnabled && (
                <li>
                  <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-blog">
                    Articles
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourcesEnabled && (
                <>
                  <li>
                    <Link href="/resources/how-to-build-sdr-team-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-sdr-guide">
                      Guide: How to Build an SDR Team
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources/sdr-outsourcing-companies-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-outsourcing-guide">
                      Guide: SDR Outsourcing Companies
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources/guide-to-sales-as-a-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-sales-as-service">
                      Guide: Sales as a Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources/how-to-hire-cold-callers-guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-hire-cold-callers-guide">
                      How to Hire Cold Callers (A 2026 Guide)
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tools</h3>
            <ul className="space-y-2">
              {roiEnabled && (
                <li>
                  <Link href="/roi-calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-roi-calculator">
                    ROI Calculator
                  </Link>
                </li>
              )}
              {assessmentEnabled && (
                <li>
                  <Link href="/assessment" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-assessment">
                    GTM Readiness Assessment
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              {pricingEnabled && (
                <li>
                  <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-pricing">
                    Pricing & Engagement
                  </Link>
                </li>
              )}
              {faqEnabled && (
                <li>
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">
                    FAQ
                  </Link>
                </li>
              )}
              <li>
                <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-admin-login">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} Revenue Party. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}