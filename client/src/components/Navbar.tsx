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
        <div className="flex items-center justify-between h-24 md:h-26">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all" data-testid="link-home">
            <img src={logoWhite} alt="Revenue Party Logo" className="h-20 md:h-22 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
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
                  <ul className="w-56 p-2">
                    <li>
                      <Link 
                        href="/solutions/gtm-engine"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-gtm-engine"
                      >
                        GTM Engine
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/solutions/fully-loaded-bdr-pod"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-fully-loaded-bdr-pod"
                      >
                        Fully Loaded BDR Pod
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
                      <Link 
                        href="/methodology"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-methodology-overview"
                      >
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/methodology/full-stack-salesperson"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-full-stack-salesperson"
                      >
                        Full-Stack Salesperson
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/methodology/ai-powered-by-humans"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-ai-powered"
                      >
                        AI-Powered by Humans
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
                      <Link 
                        href="/results"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-results-overview"
                      >
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/results/roi-calculator"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-roi-calculator"
                      >
                        ROI Calculator
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/results/success-stories"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-success-stories"
                      >
                        Success Stories
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Blueprints Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/blueprints") || isActivePath("/comparison")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-blueprints"
                >
                  Blueprints
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-48 p-2">
                    <li>
                      <Link 
                        href="/blueprints"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-blueprints-overview"
                      >
                        All Blueprints
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/comparison"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-comparison"
                      >
                        Comparison White Paper
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Why Party? Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`px-4 py-2 text-sm font-medium ${
                    isActivePath("/why-party") || isActivePath("/join-the-party") || isActivePath("/contact-us")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  data-testid="dropdown-why-party"
                >
                  Why Party?
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="w-48 p-2">
                    <li>
                      <Link 
                        href="/why-party"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-why-party"
                      >
                        Why Party
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/join-the-party"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-join-the-party"
                      >
                        Join the Party
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/contact-us"
                        className="block px-3 py-2 rounded-md text-sm hover-elevate transition-all"
                        data-testid="link-contact-us"
                      >
                        Contact Us
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
            {/* Solutions Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Solutions</div>
              <Link 
                href="/solutions/gtm-engine"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-gtm-engine"
              >
                GTM Engine
              </Link>
              <Link 
                href="/solutions/fully-loaded-bdr-pod"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-fully-loaded-bdr-pod"
              >
                Fully Loaded BDR Pod
              </Link>
            </div>

            {/* Methodology Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Methodology</div>
              <Link 
                href="/methodology"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-methodology"
              >
                Overview
              </Link>
              <Link 
                href="/methodology/full-stack-salesperson"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-full-stack-salesperson"
              >
                Full-Stack Salesperson
              </Link>
              <Link 
                href="/methodology/ai-powered-by-humans"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-ai-powered"
              >
                AI-Powered by Humans
              </Link>
            </div>

            {/* Results Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Results</div>
              <Link 
                href="/results"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-results"
              >
                Overview
              </Link>
              <Link 
                href="/results/roi-calculator"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-roi-calculator"
              >
                ROI Calculator
              </Link>
              <Link 
                href="/results/success-stories"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-success-stories"
              >
                Success Stories
              </Link>
            </div>

            {/* Blueprints Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Blueprints</div>
              <Link 
                href="/blueprints"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-blueprints"
              >
                All Blueprints
              </Link>
              <Link 
                href="/comparison"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-comparison"
              >
                Comparison White Paper
              </Link>
            </div>

            {/* Why Party? Section */}
            <div className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase">Why Party?</div>
              <Link 
                href="/why-party"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-why-party"
              >
                Why Party
              </Link>
              <Link 
                href="/join-the-party"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-join-the-party"
              >
                Join the Party
              </Link>
              <Link 
                href="/contact-us"
                className="block px-4 py-2 pl-8 rounded-md text-sm hover-elevate transition-all"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-link-contact-us"
              >
                Contact Us
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
