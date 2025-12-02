/**
 * Central registry for every feature flag in the system.
 *
 * Keeping this list in shared code ensures the backend, frontend, and tooling
 * all agree on the available flags, their purpose, and default state.
 */

export type FeatureFlagScope = "global" | "page" | "section" | "component" | "api";

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  scope: FeatureFlagScope;
  defaultEnabled: boolean;
}

export const featureFlagRegistry: Record<string, FeatureFlagDefinition> = {
  "maintenance-mode": {
    key: "maintenance-mode",
    name: "Maintenance Mode",
    description: "When enabled the public marketing site is replaced with the maintenance screen.",
    scope: "global",
    defaultEnabled: false,
  },
  "page-home": {
    key: "page-home",
    name: "Home Page",
    description: "Toggle visibility of the marketing home page.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-problem": {
    key: "page-problem",
    name: "Problem Page",
    description: "Controls access to /problem.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-gtm-engine": {
    key: "page-gtm-engine",
    name: "GTM Engine Page",
    description: "Controls access to /gtm-engine.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-results": {
    key: "page-results",
    name: "Results Page",
    description: "Controls access to /results.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-branding": {
    key: "page-branding",
    name: "Branding Portfolio Pages",
    description: "Enable the public branding landing page and project detail pages.",
    scope: "page",
    defaultEnabled: false,
  },
  "page-audit": {
    key: "page-audit",
    name: "Audit Page",
    description: "Controls access to /audit.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-about": {
    key: "page-about",
    name: "About Page",
    description: "Controls access to /why-us.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-blog": {
    key: "page-blog",
    name: "Blog Pages",
    description: "Controls access to /blog and blog post routes.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-pricing": {
    key: "page-pricing",
    name: "Pricing Page",
    description: "Controls access to /pricing.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-contact": {
    key: "page-contact",
    name: "Contact Page",
    description: "Controls access to /contact.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-faq": {
    key: "page-faq",
    name: "FAQ Page",
    description: "Controls access to /faq.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-roi-calculator": {
    key: "page-roi-calculator",
    name: "ROI Calculator",
    description: "Controls access to /roi-calculator.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-assessment": {
    key: "page-assessment",
    name: "Assessment Landing Page",
    description: "Controls access to /assessment.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-pipeline-assessment": {
    key: "page-pipeline-assessment",
    name: "Pipeline Assessment Flow",
    description: "Controls access to /pipeline-assessment and thank-you route.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-resources": {
    key: "page-resources",
    name: "Resource Pillar Pages",
    description: "Controls access to the /resources/* guides.",
    scope: "page",
    defaultEnabled: true,
  },
  "page-preview-portfolio": {
    key: "page-preview-portfolio",
    name: "Public Portfolio Preview",
    description: "Controls access to /preview/:projectId.",
    scope: "page",
    defaultEnabled: true,
  },
  "revenue-architecture-playbook": {
    key: "revenue-architecture-playbook",
    name: "Revenue Architecture Playbook Lead Magnet",
    description: "Show/hide the lead magnet form on the home page.",
    scope: "section",
    defaultEnabled: false,
  },
  "ebook-lead-magnet": {
    key: "ebook-lead-magnet",
    name: "E-Book Lead Magnet System",
    description: "Enable/disable the e-book lead magnet feature (downloadable PDFs with lead capture).",
    scope: "section",
    defaultEnabled: true,
  },
  "theme-toggle": {
    key: "theme-toggle",
    name: "Theme Toggle Button",
    description: "Show/hide the light/dark mode toggle in the navbar.",
    scope: "component",
    defaultEnabled: true,
  },
  "branding-full-story-cta": {
    key: "branding-full-story-cta",
    name: "Branding \"Experience the Full Story\" CTA",
    description: "Enable the CTA button inside branding project expansions.",
    scope: "section",
    defaultEnabled: false,
  },
  "section-recent-projects": {
    key: "section-recent-projects",
    name: "Recent Projects Section",
    description: "Show/hide the Recent Projects section on the home page.",
    scope: "section",
    defaultEnabled: false,
  },
};

export type FeatureFlagKey = keyof typeof featureFlagRegistry;

export const featureFlagList: FeatureFlagDefinition[] = Object.values(featureFlagRegistry);

export function getFeatureFlagDefinition(flagKey: string): FeatureFlagDefinition | undefined {
  return featureFlagRegistry[flagKey];
}

