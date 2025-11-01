import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoWhite from "@assets/rev-white_1760952720792.png";

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
        <div className="flex items-center justify-between h-20 md:h-22">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 transition-all" data-testid="link-home">
            <img src={logoWhite} alt="Revenue Party Logo" className="h-16 md:h-18 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/problem"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath("/problem")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-problem"
            >
              The Problem
            </Link>
            <Link 
              href="/gtm-engine"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath("/gtm-engine")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-gtm-engine"
            >
              The GTM Engine
            </Link>
            <Link 
              href="/results"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath("/results")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-results"
            >
              Results & Case Studies
            </Link>
            <Link 
              href="/why-us"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath("/why-us")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-why-us"
            >
              Why Revenue Party?
            </Link>
            <Link 
              href="/blog"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActivePath("/blog")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-blog"
            >
              Blog / Resources
            </Link>
          </div>

          {/* Right Side - CTA & Theme Toggle */}
          <div className="flex items-center gap-2">
            <Link href="/audit">
              <Button
                size="default"
                className="hidden md:inline-flex"
                data-testid="button-schedule-audit"
              >
                Schedule GTM Audit
              </Button>
            </Link>
            
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
            <Link 
              href="/problem"
              className="block px-4 py-2 rounded-md text-sm hover-elevate transition-all"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-link-problem"
            >
              The Problem
            </Link>
            <Link 
              href="/gtm-engine"
              className="block px-4 py-2 rounded-md text-sm hover-elevate transition-all"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-link-gtm-engine"
            >
              The GTM Engine
            </Link>
            <Link 
              href="/results"
              className="block px-4 py-2 rounded-md text-sm hover-elevate transition-all"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-link-results"
            >
              Results & Case Studies
            </Link>
            <Link 
              href="/why-us"
              className="block px-4 py-2 rounded-md text-sm hover-elevate transition-all"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-link-why-us"
            >
              Why Revenue Party?
            </Link>
            <Link 
              href="/blog"
              className="block px-4 py-2 rounded-md text-sm hover-elevate transition-all"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-link-blog"
            >
              Blog / Resources
            </Link>

            <Link href="/audit" onClick={() => setMobileMenuOpen(false)}>
              <Button
                size="default"
                className="w-full mt-4"
                data-testid="button-mobile-schedule-audit"
              >
                Schedule GTM Audit
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
