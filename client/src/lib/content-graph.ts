
// Content Graph - Maps relationships between pages for intelligent internal linking
export interface InternalLinkSuggestion {
  title: string;
  href: string;
  description: string;
}

export const contentGraph = {
  // Home page related links
  home: [
    {
      title: "Take the GTM Readiness Assessment",
      href: "/assessment",
      description: "Diagnose your current system's bottlenecks in 3 minutes"
    },
    {
      title: "Calculate Your ROI",
      href: "/roi-calculator",
      description: "See how much you could save vs. internal hiring"
    },
    {
      title: "Explore the GTM Engine",
      href: "/gtm-engine",
      description: "Learn how our complete revenue system works"
    },
    {
      title: "The Internal Hire Trap",
      href: "/problem",
      description: "Why the $198k SDR hire is a liability"
    }
  ],

  // Problem page related links
  problem: [
    {
      title: "The GTM Engine Solution",
      href: "/gtm-engine",
      description: "A complete alternative to hiring lone wolf SDRs"
    },
    {
      title: "Calculate True Hiring Costs",
      href: "/roi-calculator",
      description: "Compare internal hire vs. GTM Engine costs"
    },
    {
      title: "See Proven Results",
      href: "/results",
      description: "91% quota attainment, 20+ meetings/month"
    }
  ],

  // GTM Engine page related links
  gtmEngine: [
    {
      title: "Schedule Your GTM Audit",
      href: "/gtm-audit",
      description: "Get a custom GTM architecture designed for your business"
    },
    {
      title: "View Case Studies",
      href: "/results",
      description: "See real results from deployed GTM Engines"
    },
    {
      title: "Why Revenue Party",
      href: "/why-us",
      description: "What makes our GTM Engine different"
    }
  ],

  // Results page related links
  results: [
    {
      title: "Schedule Your GTM Audit",
      href: "/gtm-audit",
      description: "Start building your own GTM Engine"
    },
    {
      title: "Explore Pricing",
      href: "/pricing",
      description: "Transparent pricing for GTM Engine deployment"
    },
    {
      title: "Read the Blog",
      href: "/blog",
      description: "Deep dives into GTM strategy and execution"
    }
  ],

  // Blog post related links
  blog: [
    {
      title: "The Internal Hire Trap",
      href: "/resources/internal-trap-guide",
      description: "Why hiring SDRs fails 67% of the time"
    },
    {
      title: "The Outsourcing Trap",
      href: "/resources/agency-trap-guide",
      description: "How to spot black box agencies"
    },
    {
      title: "Take the Assessment",
      href: "/assessment",
      description: "Diagnose your GTM readiness"
    }
  ],

  // Assessment related links
  assessment: [
    {
      title: "Schedule GTM Audit",
      href: "/gtm-audit",
      description: "Work with our architects to build your engine"
    },
    {
      title: "Calculate Your ROI",
      href: "/roi-calculator",
      description: "See the financial impact of a GTM Engine"
    },
    {
      title: "Explore Solutions",
      href: "/gtm-engine",
      description: "Learn about the full GTM Engine system"
    }
  ],

  // Pricing related links
  pricing: [
    {
      title: "Schedule Discovery Call",
      href: "/gtm-audit",
      description: "Discuss your GTM architecture needs"
    },
    {
      title: "View Results",
      href: "/results",
      description: "See what you're paying for: proven performance"
    },
    {
      title: "Compare to Internal Hire",
      href: "/roi-calculator",
      description: "Calculate your savings vs. hiring internally"
    }
  ],

  // Resource guides related links
  resources: [
    {
      title: "Schedule GTM Audit",
      href: "/gtm-audit",
      description: "Get expert guidance on your GTM strategy"
    },
    {
      title: "Read More Guides",
      href: "/blog",
      description: "Explore our complete GTM resource library"
    },
    {
      title: "Take the Assessment",
      href: "/assessment",
      description: "Identify your GTM bottlenecks"
    }
  ]
};

// Helper function to get related links for a page
export function getRelatedLinks(pageKey: keyof typeof contentGraph): InternalLinkSuggestion[] {
  return contentGraph[pageKey] || [];
}
