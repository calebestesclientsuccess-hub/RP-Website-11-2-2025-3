# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services through a dark-mode design, focusing on conversion for a B2B SaaS audience (founders and GTM leaders). The project prioritizes SEO optimization, maintainability, fast performance, and includes a comprehensive CMS for managing content and assessment tools. The business vision is to provide a platform for deploying revenue generation systems, with market potential in the B2B SaaS sector.

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
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility standards, featuring a red-focused gradient system with a purple accent (RGB 88, 50, 175).
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography, supporting dark (default) and sophisticated light themes. Gradient text is used for numbers and key highlights.
- **Animations**: Minimal GSAP usage (only for `BuildAndRampTimeline`) respecting `prefers-reduced-motion`.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Core Sections**: Includes a Hero Section, Lead Magnet System, `SimpleBridgeSection`, `SimplifiedOrbitalPowers` (interactive badges), Interactive ROI Calculator, Testimonial Carousel, and `BuildAndRampTimeline`.
- **Content Management System (CMS)**: Database-driven blog with Markdown rendering, management of testimonials and career listings, and an admin dashboard for managing blog posts, video content, and widget configuration. Features rich text editor, content scheduling, and authentication.
- **SEO Optimizations**: Comprehensive technical SEO foundation including `robots.txt`, `sitemap.xml`, favicons, canonical URLs, `react-helmet-async` for meta tags, structured data (JSON-LD), and Core Web Vitals optimization.
- **Error Handling**: Single global `ErrorBoundary` component.
- **Article Layout System**: 3-column responsive layout for articles with sidebars and a `ReadingProgressBar` conversion widget.
- **Assessment Tools**:
    - **Pipeline Assessment Tool**: Multi-screen assessment with database persistence, lead segmentation, and an admin dashboard.
    - **GTM Assessment Tool**: Decision-tree based assessment with dynamic results pages and a blueprint capture system.
- **Campaign Placement System**: Enables admins to create and deploy forms, calculators, and assessments across 30 strategic zones with granular page and display size targeting. Supports HTML form mode with DOMPurify security.
- **Branding Portfolio (Modular Brand Portfolio System)**: 
    - **Phase 1 Complete**: Production-ready foundation with secure multi-tenant database architecture
        - Database: `projects` table (id, tenantId, slug, title, thumbnailUrl, challengeText, solutionText, outcomeText, modalMediaType, modalMediaUrls array, createdAt)
        - Database: `project_scenes` table (id, projectId FK with cascade delete, sceneConfig JSONB, createdAt)
        - Storage Layer: Comprehensive CRUD methods with tenant isolation enforcement, returning null/boolean for unauthorized access
        - API Routes: Secure endpoints (GET/POST/PATCH/DELETE) with Zod validation preventing server-controlled field injection
        - Security: Complete tenant isolation across all endpoints, no cross-tenant data leakage or injection vulnerabilities
        - Mixed Media Support: modalMediaUrls array supports both videos AND images for storytelling flexibility
        - Insert/Update Schemas: Properly omit server-controlled fields (tenantId, projectId, id, createdAt) preventing injection attacks
    - **Phase 2 Complete**: In-Grid Expansion with layoutId morphing animation (architect-approved production-ready)
        - **Architecture**: Persistent motion.div wrappers with shared layoutId stay in DOM, content swaps between ProjectCard and ProjectExpansion
        - **Animation**: Smooth spring-based morphing (stiffness 200, damping 25) with hover micro-interactions (scale + rotate) on collapsed cards
        - **Layout**: Tight spacing (gap-2 md:gap-3) for organic/messy aesthetic, col-span-full class triggers natural grid reflow (ripple effect)
        - **Robust Content**: Hero carousel (aspect-[21/9], mixed media), Challenge/Solution/Outcome storytelling with gradient text, feature media section (2 additional video/photo slots), testimonial display, close button
        - **Philosophy**: In-grid expansion (not modal overlay) - "things make room" is metaphorically more powerful than floating overlays
        - **Testing**: E2E verified smooth transitions, persistent grid cells, carousel navigation, no layout gaps or missing cards
        - **Technical**: Conditional rendering guards prevent empty media sections, screen-reader-only testid maintains test consistency
    - **Phase 3 Planned**: Scrollytelling encyclopedia pages at /branding/[slug] with unlimited content scenes accessed via dramatic particle dissolve transition
    - **Content Strategy**: Raw JSON editor approach (build engine now, dashboard UI later) for maximum creative control
    - **Frontend**: Interactive /branding page at https://revenueparty.com/branding with bouncy 3D hover animations and tight grid spacing

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **File Storage**: Cloudinary for images, PDFs, and videos with automatic optimization and CDN delivery.
- **Animation Strategy**: Minimal and performance-focused.
- **Performance Optimizations**: Implemented campaign caching, database connection pooling, loading skeletons, code splitting for bundle optimization, scroll-triggered animations, and resilient loading states to significantly reduce load times and improve user experience.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: ORM for PostgreSQL.
- **Cloudinary**: Cloud-based file storage and CDN for images, PDFs, and videos with automatic optimization.
- **GSAP**: Animation library.
- **TanStack Query (React Query)**: Data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer.
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation.
- **Gmail Connector**: Email sending service.