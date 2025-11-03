# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design with minimal animations, focusing on conversion over visual complexity. It targets a B2B SaaS audience (founders and GTM leaders) with an emphasis on data-driven decision-making. The project prioritizes SEO optimization, maintainability, and fast performance.

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy
- SEO optimization as top priority
- Minimal animations for better performance and maintainability
- Easy to run and maintain codebase

## System Architecture
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM. Animations are minimal and focused, with only essential scroll-triggered timeline animations retained. A single global error boundary handles all error states. The architecture prioritizes simplicity and maintainability.

**UI/UX Decisions:**
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility standards.
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography.
    - **Dark Mode (Default)**: Professional dark design with subtle gradients and clean aesthetics.
    - **Light Mode**: Sophisticated light theme with proper contrast and readability.
- **Animations**: Minimal GSAP usage - only BuildAndRampTimeline uses ScrollTrigger for essential scroll animations. All decorative animations have been removed for better performance. Respects `prefers-reduced-motion`.
- **Theming**: WCAG AA-compliant gradient system with distinct palettes for light and dark modes. No performance tier detection - all users get the same optimized experience.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" with tagline and problem statement.
- **SimpleBridgeSection**: Simple static text transition between content sections, no scroll-triggered animations.
- **SimplifiedOrbitalPowers**: Static badges arranged around a central video. Six clickable badges that reveal detailed information. No rotation or complex animations.
- **Interactive ROI Calculator**: Compares in-house vs. RevParty Pod based on user inputs with real-time calculations and email capture.
- **BuildAndRampTimeline**: The only component with GSAP ScrollTrigger animations. Showcases 4 GTM steps with scroll-triggered reveals.
- **Content Management**: Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection), testimonial display, and career listings with application forms (React Hook Form + Zod).
- **SEO Optimizations**: Comprehensive technical foundation including `robots.txt`, `sitemap.xml`, favicons, and canonical URLs. Uses `react-helmet-async` for page-specific meta tags (Open Graph, Twitter Card), structured data (JSON-LD schemas), and performance optimizations for Core Web Vitals.
- **Error Handling**: Single global ErrorBoundary component at application level for consistent error handling.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Animation Strategy**: Minimal animations using GSAP only where essential (BuildAndRampTimeline). Removed complex scroll-triggered animations, performance tier detection, and decorative animations for better maintainability and performance.

## External Dependencies
- **PostgreSQL**: Primary database (Neon-backed).
- **Drizzle ORM**: ORM for PostgreSQL.
- **GSAP**: Animation library (minimal usage - only ScrollTrigger for timeline).
- **TanStack Query (React Query)**: Data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer.
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation.