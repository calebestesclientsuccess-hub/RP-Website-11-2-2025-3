# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, interactive calculators, GSAP animations, and a cinematic timeline visualization. It targets a B2B SaaS audience, focusing on founders and GTM leaders with an emphasis on data-driven decision-making.

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## System Architecture
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM.

**UI/UX Decisions:**
- **Brand Color Philosophy**: Semantic color system based on "Culture = Community + Competition" with specific colors for competition (Red), collaboration (Purple), technology (Indigo), and strategy (Dark Purple). All colors meet WCAG AA accessibility standards.
- **Typography**: Inter for headings and body, JetBrains Mono for monospace. Inverted pyramid hierarchy used in comparison section (larger questions, smaller but bolder answer line with spacing).
- **Design System**: Semantic color tokens, badge variants with larger sizing, and consistent typography for a unified aesthetic.
  - **Dark Mode (Default)**: Dramatic cinematic design with dimpled paper texture effect on badges using cross-hatch patterns, inset shadows, and SVG noise filter for authentic paper grain.
  - **Light Mode Enhancement**: Sophisticated watercolor-meets-glass aesthetic that rivals dark mode's drama while maintaining complete visual isolation (no light mode effects show in dark mode):
    - **Paper Texture Overlay**: Subtle 2.5% opacity SVG noise filter creates authentic paper grain across entire page
    - **Watercolor Gradients**: Multi-stop color gradients on badges and cards with breathing animation (15-20s cycles) creates living color that subtly shifts
    - **Prismatic Glass Effects**: Rainbow chromatic aberration shadows on cards (0.04 peak opacity) with 0.4s hover animation for crystal-like depth
    - **Vintage Stamp Badges**: Postal stamp aesthetic with -0.8deg rotation, perforated edges, cross-hatch texture, and worn ink shadows
    - **Animated Sun Rays**: Three slow-drifting light beams (35-40s cycles, 0.18 peak opacity) in hero section for atmospheric warmth
- **Animations**: GSAP with ScrollTrigger for scroll-triggered timeline reveals. Fade-in and slide-up animations on timeline steps, sequential line drawing, and bounce effect on result card. Glassmorphic floating calculator CTA. All decorative animations respect `prefers-reduced-motion` accessibility preferences.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" as the main heading with red tagline "starring two BDRs, dedicated to finding, and selling your customers." Problem section uses "Building a Sales Team is expensive" messaging.
- **Cinematic Bridge Animation**: Sophisticated scroll-triggered animation sequence featuring:
  - Theatre-mode effects (progressive vignette + spotlight) for dramatic focus
  - Text transition: "You need more than another salesperson" fades out while "You need a system" scales up in red
  - Canvas-based particle disintegration effect: particles spawn from visible text after 2.5s delay, fall gracefully like leaves with gentle gravity (0.08), horizontal sway, and air resistance for 6-9 seconds
  - Particles render at z-index 0 while "Your Fullstack Sales Unit" section has z-index 10, creating the visual effect of particles falling BEHIND the next section
  - Red minimalist bouncing arrow (z-index 9999) appears after particles settle (5s)
- **Orbital Powers Animation**: Apple-inspired interactive video element featuring a maximized central video (896px desktop, 640px tablet, 448px mobile) with a thin silver metallic frame and multi-color glow (blue, purple, magenta, indigo) that makes it appear to float in the same physical space as the video content. Six orbital "powers" (AI Architect, GTM Strategist, RevOps, Elite Coach, Tech Stack, Community & Competition) orbit around it. Video plays automatically once, replaying only after scrolling away for 6+ seconds. Animation stops 2.5 seconds before video ends, badges expand outward with intensified glow, and labels appear with staggered animation. Navigation arrows are integrated into the info box for easy click access. Video uses object-contain to prevent face cutoff. The futuristic frame features a 2px silver border with layered box-shadow glows matching the video's color palette.
- **Badge Components**: Larger sizing (text-sm with px-4 py-1.5) with worn, dimpled paper texture effect using cross-hatch patterns, inset shadows, and SVG noise filter for authentic paper grain.
- **Interactive ROI Calculator**: Compares in-house vs. RevParty Pod based on user inputs (ACV, close rate, sales cycle, quota) with real-time calculations and email capture.
- **GTM Timeline Visualization**: A cinematic vertical timeline showcasing the complete GTM system with scroll-triggered GSAP animations. Features 4 key components (Elite Talent, Strategic Framework, AI-Powered, Tech Stack) connected by animated lines, culminating in a "20+ Qualified Appointments" result card. Each step fades in and slides up on scroll with brand-specific colors (purple, red, indigo). Mobile-responsive and supports prefers-reduced-motion.
- **Content Management**: Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection), testimonial display, and career listings with application forms (React Hook Form + Zod for validation).
- **Site Structure**: Comprehensive navigation with dropdown menus for Solutions, Methodology, Results, and Company.
- **Accessibility**: ARIA labels, keyboard navigation, and data-testid attributes for testing.

**System Design Choices:**
- **Frontend**: React 18 with Vite for fast development, Tailwind CSS for utility-first styling, Wouter for routing, React Query (TanStack Query v5) for data fetching, and Shadcn UI components.
- **Backend**: Express.js provides API endpoints for blog posts, testimonials, job postings, job applications, and ROI submissions.
- **Database**: PostgreSQL with Drizzle ORM handles all content and application data.
- **API Routes**: RESTful APIs for content retrieval and submission.

## SEO Optimizations (November 2025)
Comprehensive technical SEO enhancements to conquer Google search results:

**Technical Foundation:**
- **robots.txt**: Proper crawl directives for search engines (allows all crawling, sitemap reference)
- **sitemap.xml**: All 11 pages with priorities (1.0-0.5) and change frequencies (weekly/monthly)
- **Favicons**: Professional icon set (favicon.png, apple-touch-icon.png) for brand recognition
- **Canonical URLs**: Prevents duplicate content penalties across all pages

**Meta Tags & Social Sharing:**
- **Open Graph Tags**: Complete Facebook sharing optimization (title, description, image, type, locale)
- **Twitter Card Tags**: Enhanced Twitter/X sharing with summary_large_image format
- **Theme Color**: Brand-specific theme color (#dc2626) for mobile browsers
- **SEO Meta Tags**: Comprehensive title, description, and keywords for all pages

**Structured Data (JSON-LD):**
- **Organization Schema**: Company information, logo, contact points, social profiles
- **WebSite Schema**: Site-wide search functionality markup
- **BreadcrumbList Schema**: Automatic per-page breadcrumb navigation (injected dynamically)

**Performance Optimizations:**
- **Video Loading**: Lazy loading with preload="none" for hero video (saves bandwidth)
- **Build Configuration**: Optimized Vite production build with code splitting and minification
- **Core Web Vitals**: Optimized for LCP < 2.5s, INP < 200ms, CLS < 0.1

**UX & Accessibility Enhancements:**
- **Breadcrumbs Component**: Schema.org-compliant navigation with automatic cleanup (client/src/components/Breadcrumbs.tsx)
- **SEO-Friendly 404 Page**: Helpful navigation, CTA, and proper metadata restoration on exit
- **Skip-to-Content Link**: Keyboard accessibility (visible on Tab focus)
- **ARIA Landmarks**: Semantic landmarks (main, navigation, contentinfo) for screen readers
- **WCAG AA Compliance**: Meets accessibility standards for color contrast and keyboard navigation

**Critical Features:**
- 404 page metadata cleanup prevents SEO regression when users navigate away
- Breadcrumbs automatically inject/cleanup structured data per route
- All decorative animations respect prefers-reduced-motion
- Centralized meta tag management ready for future scaling

## External Dependencies
- **PostgreSQL**: Primary database for all application data (Neon-backed via Replit).
- **Drizzle ORM**: Object-Relational Mapper for PostgreSQL.
- **GSAP**: Animation library, including the ScrollTrigger plugin.
- **TanStack Query (React Query)**: For data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer for secure Markdown rendering.
- **React Hook Form**: For form management and validation.
- **Zod**: Schema validation library.