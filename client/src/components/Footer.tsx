import { Link } from "wouter";
import logoWhite from "@assets/rev-white_1760952720792.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-card-border mt-32" role="contentinfo" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-8">
          {/* Logo & Mission */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4" data-testid="footer-link-home">
              <img 
                src={logoWhite} 
                alt="Revenue Party Logo" 
                className="h-16 md:h-18 w-auto" 
                loading="lazy"
                width="200"
                height="64"
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
              <li>
                <Link href="/problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-problem">
                  The Problem
                </Link>
              </li>
              <li>
                <Link href="/gtm-engine" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-gtm-engine">
                  The GTM Engine
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-results">
                  Results & Case Studies
                </Link>
              </li>
              <li>
                <Link href="/why-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-why-us">
                  Why Party?
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-blog">
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
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
              <li>
                <Link href="/blog/manifesto-the-lone-wolf-trap" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-manifesto">
                  The Lone Wolf Trap (Manifesto)
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/roi-calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-roi-calculator">
                  ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-assessment">
                  GTM Readiness Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-pricing">
                  Pricing & Engagement
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contact">
                  Contact Us / Careers
                </Link>
              </li>
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
