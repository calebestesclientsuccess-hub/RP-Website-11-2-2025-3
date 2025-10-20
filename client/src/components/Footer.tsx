import { Link } from "wouter";
import logoWhite from "@assets/rev-white_1760952720792.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-card-border mt-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Mission */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4" data-testid="footer-link-home">
              <img src={logoWhite} alt="Revenue Party Logo" className="h-8 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              We architect GTM systems that deliver predictable revenue. Your next sales hire shouldn't be a person—it should be a complete revenue generation system.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/solutions/gtm-engine" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-gtm-engine">
                  GTM Engine
                </Link>
              </li>
              <li>
                <Link href="/solutions/fully-loaded-bdr-pod" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-services">
                  Fully Loaded BDR Pod
                </Link>
              </li>
            </ul>
          </div>

          {/* Why Party? */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Why Party?</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/why-party" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">
                  Why Party
                </Link>
              </li>
              <li>
                <Link href="/join-the-party" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-careers">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contact">
                  Contact Us
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
