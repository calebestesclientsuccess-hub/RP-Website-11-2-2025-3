# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, focusing on conversion. It targets a B2B SaaS audience (founders and GTM leaders) with an emphasis on data-driven decision-making. The project prioritizes SEO optimization, maintainability, and fast performance, including a comprehensive CMS for managing blog posts, video content, and site configurations, alongside assessment tools.

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
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM. The architecture prioritizes simplicity and maintainability, including a full-featured Content Management System (CMS) and a multi-user authentication system with role-based access control.

**UI/UX Decisions:**
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility standards, featuring a red-focused gradient system with purple accent (RGB 88, 50, 175).
  - **Purple Specification**: The `--community` color uses exact RGB(88, 50, 175) = HSL(258, 56%, 44%) for calculator elements, community badge, and slider components.
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography, supporting both dark (default) and sophisticated light themes. Gradient text is used for numbers and key highlights.
- **Animations**: Minimal GSAP usage (only for `BuildAndRampTimeline`) respecting `prefers-reduced-motion`.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Core Sections**: Includes a Hero Section, Lead Magnet System, `SimpleBridgeSection`, `SimplifiedOrbitalPowers` (interactive badges), Interactive ROI Calculator, Testimonial Carousel, and `BuildAndRampTimeline`.
- **Content Management System (CMS)**: Database-driven blog ("Blueprints") with Markdown rendering, management of testimonials and career listings, and an admin dashboard for managing blog posts, video content, and widget configuration. Features rich text editor (TipTap), content scheduling, and authentication.
- **SEO Optimizations**: Comprehensive technical SEO foundation including `robots.txt`, `sitemap.xml`, favicons, canonical URLs, `react-helmet-async` for meta tags, structured data (JSON-LD), and Core Web Vitals optimization.
- **Error Handling**: Single global `ErrorBoundary` component.
- **Article Layout System**: 3-column responsive layout for articles with sidebars and a `ReadingProgressBar` conversion widget.
- **Assessment Tools**:
    - **Pipeline Assessment Tool**: Multi-screen assessment with database persistence, lead segmentation, and an admin dashboard for responses.
    - **GTM Assessment Tool**: Decision-tree based assessment with dynamic results pages and a blueprint capture system, configurable via a comprehensive assessment builder UI.
- **Campaign Placement System**: Enables admins to create and deploy forms, calculators, and assessments across 30 strategic zones with granular page and display size targeting. Supports HTML form mode for quick third-party form deployment with DOMPurify security.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Animation Strategy**: Minimal and performance-focused.

## Recent Performance Optimizations (November 2025)

**Comprehensive Performance Optimization Project** targeting critical issues (janky animations, video lag, poor scroll performance) to prepare for 18-month multi-tenant SaaS pivot.

**Completed Phases:**

### Phase 1.1: Campaign Cache Service ✅
- **Problem**: 10+ duplicate `/api/public/campaigns` API calls per page (one per WidgetZone component)
- **Solution**: Application-level campaign cache using React Query with client-side filtering
- **Implementation**:
  - Created `client/src/lib/campaignCache.ts` with `useCampaigns` hook and `CampaignBootstrap` component
  - Integrated prefetch at app startup in `App.tsx`
  - Refactored `WidgetZone.tsx` and `PopupEngine.tsx` to use shared cache
  - Implemented tenant-aware cache keys (`["/api/public/campaigns", tenantId]`)
  - Wired cache invalidation into all campaign mutations (create, update, delete)
  - Fixed wildcard page targeting bug (empty `targetPages` now matches all pages)
- **Results**: 90% API call reduction (10+ → 1 per page load), tenant-ready for multi-tenancy

### Phase 1.2: Database Connection Pooling ✅
- **Problem**: Type mismatch in Drizzle adapter (using `neon-serverless` with regular PostgreSQL)
- **Solution**: Switched to correct `node-postgres` adapter with optimized pool configuration
- **Implementation**:
  - Changed from `drizzle-orm/neon-serverless` to `drizzle-orm/node-postgres` in `server/db.ts`
  - Added connection pool limits: main pool (20 connections), session pool (10 connections)
  - Added timeouts: 30s idle timeout, 2s connection timeout for fast-fail behavior
  - Documented dual-pool architecture (Drizzle queries + session storage)
- **Results**: Eliminated type errors, optimized connection management, production-ready pooling

**In Progress:**
- Phase 1.3: Loading skeletons for WidgetZone components

**Upcoming Phases:**
- Phase 2: SimplifiedOrbitalPowers refactor (GSAP ticker, Intersection Observer)
- Phase 2: Video optimization (poster images, lazy loading)
- Phase 3: Caching headers, Core Web Vitals monitoring, code splitting

**Performance Targets:**
- Load time: 4-6s → 1-2s (67% faster) ✅ On track
- Eliminate animation jank (pending Phase 2)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1 (pending Phase 3)

## External Dependencies
- **PostgreSQL**: Primary database (Neon-backed).
- **Drizzle ORM**: ORM for PostgreSQL.
- **GSAP**: Animation library (minimal usage for ScrollTrigger).
- **TanStack Query (React Query)**: Data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer.
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation.
- **Gmail Connector**: Email sending service for transactional emails.