import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoWhite from "@assets/rev-white_1760952720792.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all" data-testid="link-home">
              <img src={logoWhite} alt="Revenue Party Logo" className="h-8 w-auto" />
            </a>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
              {/* GTM Engine - Standalone */}
              <NavigationMenuItem>
                <Link href="/gtm-engine">
                  <NavigationMenuLink
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                      isActivePath("/gtm-engine")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid="link-gtm-engine"
                  >
                    GTM Engine
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Solutions Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/solutions")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-solutions"
                >
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-48 p-2">
                    <li>
                      <Link href="/solutions/fully-loaded-bdr-pod">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-fully-loaded-bdr-pod"
                        >
                          Fully Loaded BDR Pod
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Methodology Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/methodology")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-methodology"
                >
                  Methodology
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-56 p-2">
                    <li>
                      <Link href="/methodology">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-methodology-overview"
                        >
                          Overview
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/methodology/full-stack-salesperson">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-full-stack-salesperson"
                        >
                          Full-Stack Salesperson
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/methodology/ai-powered-by-humans">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-ai-powered"
                        >
                          AI-Powered by Humans
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Results Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/results")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-results"
                >
                  Results
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-48 p-2">
                    <li>
                      <Link href="/results">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-results-overview"
                        >
                          Overview
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/results/roi-calculator">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-roi-calculator"
                        >
                          ROI Calculator
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/results/success-stories">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-success-stories"
                        >
                          Success Stories
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Blueprints - Standalone */}
              <NavigationMenuItem>
                <Link href="/blueprints">
                  <NavigationMenuLink
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                      isActivePath("/blueprints")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid="link-blueprints"
                  >
                    Blueprints
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Comparison - Standalone */}
              <NavigationMenuItem>
                <Link href="/comparison">
                  <NavigationMenuLink
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                      isActivePath("/comparison")
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid="link-comparison"
                  >
                    Comparison
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Company Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/why-party") || isActivePath("/join-the-party") || isActivePath("/contact-us")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-company"
                >
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-48 p-2">
                    <li>
                      <Link href="/why-party">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-why-party"
                        >
                          Why Party
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/join-the-party">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-join-the-party"
                        >
                          Join the Party
                        </NavigationMenuLink>
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact-us">
                        <NavigationMenuLink
                          className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                          data-testid="link-contact-us"
                        >
                          Contact Us
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - CTA & Theme Toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="default"
              className="hidden md:inline-flex"
              data-testid="button-schedule-audit"
            >
              Schedule My GTM Audit
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            {/* GTM Engine */}
            <Link href="/gtm-engine">
              <a
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                  isActivePath("/gtm-engine")
                    ? "text-primary bg-primary/10"
                    : "text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-gtm-engine"
              >
                GTM Engine
              </a>
            </Link>

            {/* Solutions Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Solutions</div>
              <Link href="/solutions/fully-loaded-bdr-pod">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-fully-loaded-bdr-pod"
                >
                  Fully Loaded BDR Pod
                </a>
              </Link>
            </div>

            {/* Methodology Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Methodology</div>
              <Link href="/methodology">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-methodology"
                >
                  Overview
                </a>
              </Link>
              <Link href="/methodology/full-stack-salesperson">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-full-stack-salesperson"
                >
                  Full-Stack Salesperson
                </a>
              </Link>
              <Link href="/methodology/ai-powered-by-humans">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-ai-powered"
                >
                  AI-Powered by Humans
                </a>
              </Link>
            </div>

            {/* Results Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Results</div>
              <Link href="/results">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-results"
                >
                  Overview
                </a>
              </Link>
              <Link href="/results/roi-calculator">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-roi-calculator"
                >
                  ROI Calculator
                </a>
              </Link>
              <Link href="/results/success-stories">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-success-stories"
                >
                  Success Stories
                </a>
              </Link>
            </div>

            {/* Blueprints */}
            <Link href="/blueprints">
              <a
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                  isActivePath("/blueprints")
                    ? "text-primary bg-primary/10"
                    : "text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-blueprints"
              >
                Blueprints
              </a>
            </Link>

            {/* Comparison */}
            <Link href="/comparison">
              <a
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-all hover-elevate ${
                  isActivePath("/comparison")
                    ? "text-primary bg-primary/10"
                    : "text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-comparison"
              >
                Comparison
              </a>
            </Link>

            {/* Company Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Company</div>
              <Link href="/why-party">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-why-party"
                >
                  Why Party
                </a>
              </Link>
              <Link href="/join-the-party">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-join-the-party"
                >
                  Join the Party
                </a>
              </Link>
              <Link href="/contact-us">
                <a
                  className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-link-contact-us"
                >
                  Contact Us
                </a>
              </Link>
            </div>

            <Button
              size="default"
              className="w-full mt-4"
              data-testid="button-mobile-schedule-audit"
            >
              Schedule My GTM Audit
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
