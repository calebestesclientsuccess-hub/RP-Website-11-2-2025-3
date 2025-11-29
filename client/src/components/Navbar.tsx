import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, Contrast } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import logoWhite from "@assets/rev-white_1760952720792.png";
import logoBlack from "@assets/Revenueparty-logo-black_1762982410867.png";
import { cn } from "@/lib/utils"; // Assuming cn is available for conditional styling

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isEnabled: themeToggleEnabled, isLoading: themeToggleLoading } = useFeatureFlag("theme-toggle");
  const { isEnabled: problemLinkEnabled } = useFeatureFlag("page-problem");
  const { isEnabled: gtmLinkEnabled } = useFeatureFlag("page-gtm-engine");
  const { isEnabled: resultsLinkEnabled } = useFeatureFlag("page-results");
  const { isEnabled: aboutLinkEnabled } = useFeatureFlag("page-about");
  const { isEnabled: pricingLinkEnabled } = useFeatureFlag("page-pricing");
  const { isEnabled: blogLinkEnabled } = useFeatureFlag("page-blog");
  const { isEnabled: brandingLinkEnabled } = useFeatureFlag("page-branding");
  const { isEnabled: auditPageEnabled } = useFeatureFlag("page-audit");
  const highContrastEnabled = false;
  const highContrastLoading = false;
  const [highContrast, setHighContrast] = useState(false);
  const [isSkipLinkFocused, setIsSkipLinkFocused] = useState(false);


  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <>
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-transform duration-200",
          isSkipLinkFocused ? "translate-y-0" : "-translate-y-20"
        )}
        onFocus={() => setIsSkipLinkFocused(true)}
        onBlur={() => setIsSkipLinkFocused(false)}
        role="link"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <header role="banner">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg" role="navigation" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all" data-testid="link-home" role="link" aria-label="Go to homepage">
                <img
                  src={theme === "dark" ? logoWhite : logoBlack}
                  alt="Revenue Party Logo"
                  className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto transition-all duration-300"
                  loading="eager"
                  style={{ objectFit: 'contain' }}
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6" role="list">
                {problemLinkEnabled && (
                  <Link
                    href="/problem"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/problem")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-problem"
                    role="listitem"
                  >
                    The Problem
                  </Link>
                )}
                {gtmLinkEnabled && (
                  <Link
                    href="/gtm-engine"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/gtm-engine")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-gtm-engine"
                    role="listitem"
                  >
                    The Solution
                  </Link>
                )}
                {resultsLinkEnabled && (
                  <Link
                    href="/results"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/results")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-results"
                    role="listitem"
                  >
                    Results & Case Studies
                  </Link>
                )}
                {aboutLinkEnabled && (
                  <Link
                    href="/why-us"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/why-us")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-why-us"
                    role="listitem"
                  >
                    Why Party?
                  </Link>
                )}
                {pricingLinkEnabled && (
                  <Link
                    href="/pricing"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/pricing")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-pricing"
                    role="listitem"
                  >
                    Pricing
                  </Link>
                )}
                {blogLinkEnabled && (
                  <Link
                    href="/blog"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/blog")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-blog"
                    role="listitem"
                  >
                    Articles & Videos
                  </Link>
                )}
                {brandingLinkEnabled && (
                  <Link
                    href="/branding"
                    className={`px-4 py-2 text-sm font-medium transition-colors text-center ${
                      isActivePath("/branding")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid="link-branding"
                    role="listitem"
                  >
                    Branding
                  </Link>
                )}
              </div>

              {/* Right Side - CTA & Theme Toggle */}
              <div className="flex items-center gap-2">
                {auditPageEnabled && (
                  <Link href="/audit" role="link" aria-label="Schedule a GTM Audit">
                    <Button
                      size="default"
                      className="hidden md:inline-flex"
                      data-testid="button-schedule-audit"
                    >
                      Schedule GTM Audit
                    </Button>
                  </Link>
                )}

                {/* Theme Toggle and High Contrast Toggle */}
                {(!themeToggleLoading && themeToggleEnabled) || (!highContrastLoading && highContrastEnabled) ? (
                  <>
                    {(!themeToggleLoading && themeToggleEnabled) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="hover-elevate"
                        data-testid="button-theme-toggle"
                        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                      >
                        {theme === "dark" ? (
                          <Sun className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <Moon className="h-5 w-5" aria-hidden="true" />
                        )}
                      </Button>
                    )}
                    {(!highContrastLoading && highContrastEnabled) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setHighContrast(!highContrast)}
                        aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                        aria-pressed={highContrast}
                        className="hover-elevate"
                        data-testid="button-high-contrast-toggle"
                      >
                        <Contrast className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    )}
                  </>
                ) : null}

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden hover-elevate touch-target"
                  data-testid="button-mobile-menu"
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              id="mobile-navigation"
              className={`lg:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg transition-all duration-500 ease-out backdrop-blur-lg ${
                mobileMenuOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-8 pointer-events-none'
              }`}
              role="navigation"
              aria-label="Mobile navigation menu"
              aria-hidden={!mobileMenuOpen}
            >
              <div className="px-4 py-4 space-y-2" style={{
                animation: mobileMenuOpen ? 'slideDown 0.4s ease-out' : 'none'
              }} role="list">
                {problemLinkEnabled && (
                  <Link
                    href="/problem"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all duration-200 touch-target-button text-center ${
                      isActivePath("/problem")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3 shadow-sm"
                        : "hover-elevate hover:bg-accent hover:translate-x-1"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-problem"
                    role="listitem"
                  >
                    The Problem
                  </Link>
                )}
                {gtmLinkEnabled && (
                  <Link
                    href="/gtm-engine"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/gtm-engine")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-gtm-engine"
                    role="listitem"
                  >
                    The Solution
                  </Link>
                )}
                {resultsLinkEnabled && (
                  <Link
                    href="/results"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/results")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-results"
                    role="listitem"
                  >
                    Results & Case Studies
                  </Link>
                )}
                {aboutLinkEnabled && (
                  <Link
                    href="/why-us"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/why-us")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-why-us"
                    role="listitem"
                  >
                    Why Party?
                  </Link>
                )}
                {pricingLinkEnabled && (
                  <Link
                    href="/pricing"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/pricing")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-pricing"
                    role="listitem"
                  >
                    Pricing
                  </Link>
                )}
                {blogLinkEnabled && (
                  <Link
                    href="/blog"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/blog")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-blog"
                    role="listitem"
                  >
                    Articles & Videos
                  </Link>
                )}
                {brandingLinkEnabled && (
                  <Link
                    href="/branding"
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-all touch-target-button text-center ${
                      isActivePath("/branding")
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-3"
                        : "hover-elevate hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-link-branding"
                    role="listitem"
                  >
                    Branding
                  </Link>
                )}

                {auditPageEnabled && (
                  <Link
                    href="/audit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block mt-4"
                    role="listitem"
                    aria-label="Schedule a GTM Audit"
                  >
                    <Button
                      size="default"
                      className="w-full touch-target-button"
                      data-testid="button-mobile-schedule-audit"
                    >
                      Schedule GTM Audit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}