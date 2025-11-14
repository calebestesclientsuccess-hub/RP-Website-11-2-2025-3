# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services through a dark-mode design, focusing on conversion for a B2B SaaS audience (founders and GTM leaders). The business vision is to provide a platform for deploying revenue generation systems, with market potential in the B2B SaaS sector.

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
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM. The architecture prioritizes simplicity, maintainability, and includes a full-featured Content Management System (CMS) and a multi-user authentication system with role-based access control.

**UI/UX Decisions:**
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility, featuring a red-focused gradient system with a purple accent.
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography, supporting dark (default) and sophisticated light themes.
- **Animations**: Minimal GSAP usage, respecting `prefers-reduced-motion`.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Core Sections**: Includes Hero, Lead Magnet System, `SimpleBridgeSection`, `SimplifiedOrbitalPowers`, Interactive ROI Calculator, Testimonial Carousel, and `BuildAndRampTimeline`.
- **Content Management System (CMS)**: Unified Content Library with CRUD operations for Testimonials, Portfolio Projects, and Job Postings. Features database-driven blog with Markdown rendering, admin dashboard, rich text editor, and content scheduling.
- **SEO Optimizations**: Comprehensive technical SEO including `robots.txt`, `sitemap.xml`, favicons, canonical URLs, meta tags via `react-helmet-async`, structured data (JSON-LD), and Core Web Vitals optimization.
- **Error Handling**: Single global `ErrorBoundary` component.
- **Article Layout System**: 3-column responsive layout with sidebars and a `ReadingProgressBar`.
- **Assessment Tools**: Pipeline Assessment Tool (multi-screen, database persistent) and GTM Assessment Tool (decision-tree based).
- **Campaign Placement System**: Admin-enabled deployment of forms, calculators, and assessments across strategic zones with granular targeting.
- **Branding Portfolio (Modular Brand Portfolio System)**:
    - Secure multi-tenant database architecture for projects.
    - In-Grid Expansion with `layoutId` morphing animations for project details.
    - Scrollytelling encyclopedia pages (`/branding/:slug`) with trigger-based GSAP animations and a scene renderer interpreting `sceneConfig` JSONB for dynamic content. Features a 7-layer fix stack for animation reliability and accessibility.
    - API-backed project loading with production content.
    - **AI-Powered Scene Generation**: Gemini-based scene creation using structured JSON output with validation. Features prompt templates (database-stored with tenant isolation), type-safe scene configuration, and mandatory preview before saving.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **File Storage**: Cloudinary for images, PDFs, and videos.
- **Animation Strategy**: Minimal and performance-focused.
- **Performance Optimizations**: Campaign caching, database connection pooling, loading skeletons, code splitting, scroll-triggered animations, and resilient loading states.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: ORM for PostgreSQL.
- **Cloudinary**: Cloud-based file storage and CDN.
- **GSAP**: Animation library.
- **TanStack Query (React Query)**: Data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer.
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation.
- **Gmail Connector**: Email sending service.
- **Gemini AI (Replit AI Integrations)**: Multimodal LLM for scene generation. Uses gemini-2.5-flash model via Replit's managed service (no API key required, billed to credits).