# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, interactive calculators, GSAP animations, and a cinematic timeline visualization. It targets a B2B SaaS audience, focusing on founders and GTM leaders with an emphasis on data-driven decision-making. The project aims to provide a professional, sophisticated, and high-performing online presence that effectively converts visitors into leads.

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## System Architecture
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM. Animations are centralized, maintainable, and isolated, with a debug mode and accessibility features respecting `prefers-reduced-motion`. A comprehensive SEO strategy is implemented for optimal search engine performance.

**UI/UX Decisions:**
- **Color Philosophy**: Semantic color system ("Culture = Community + Competition") meeting WCAG AA accessibility standards.
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography.
    - **Dark Mode (Default)**: Dramatic cinematic design with dimpled paper texture using cross-hatch patterns, inset shadows, and SVG noise.
    - **Light Mode Enhancement**: Sophisticated watercolor-meets-glass aesthetic with subtle paper texture overlay, watercolor gradients, prismatic glass effects, vintage stamp badges, and animated sun rays.
- **Animations**: GSAP with ScrollTrigger for scroll-triggered timeline reveals, fade-ins, slide-ups, sequential line drawing, and bounce effects. Decorative animations respect `prefers-reduced-motion`.
- **Theming**: WCAG AA-compliant gradient system with distinct palettes for light and dark modes, and a 3-tier performance detection system for progressive enhancement. Multi-layer shadows, technical grid patterns (dot, isometric), and smooth theme transitions are implemented.
- **Accessibility**: `prefers-reduced-motion`, `prefers-contrast`, `forced-colors` support, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" with a tagline and problem statement.
- **Cinematic Bridge Animation**: Scroll-triggered sequence with theatre-mode effects, text transitions ("You need more than another salesperson" to "You need a system"), canvas-based particle disintegration, and a minimalist bouncing arrow.
- **Orbital Powers Animation**: Apple-inspired interactive video element with a central video, multi-color glow, and six orbiting "powers" badges. Video plays once on intersection, with badges expanding and labels appearing.
- **Badge Components**: Larger sizing with a worn, dimpled paper texture effect.
- **Interactive ROI Calculator**: Compares in-house vs. RevParty Pod based on user inputs with real-time calculations and email capture.
- **GTM Timeline Visualization**: Cinematic vertical timeline showcasing the GTM system with scroll-triggered GSAP animations for 4 key components culminating in a "20+ Qualified Appointments" result card.
- **Content Management**: Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection), testimonial display, and career listings with application forms (React Hook Form + Zod).
- **SEO Optimizations**: Comprehensive technical foundation including `robots.txt`, `sitemap.xml`, favicons, and canonical URLs. Uses `react-helmet-async` for page-specific meta tags (Open Graph, Twitter Card), structured data (JSON-LD for Organization, WebSite, Service, FAQ, Article, BreadcrumbList), and performance optimizations for Core Web Vitals.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.

## External Dependencies
- **PostgreSQL**: Primary database (Neon-backed).
- **Drizzle ORM**: ORM for PostgreSQL.
- **GSAP**: Animation library, including ScrollTrigger.
- **TanStack Query (React Query)**: Data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer.
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation.