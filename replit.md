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
- **Content Management System (CMS)**: 
    - **Unified Content Library** (✅ Complete): Single interface for managing all content types with type filtering (blog, video, testimonial, portfolio, job), search, lazy loading, and proper route ordering. Features edit/delete actions, featured toggle for testimonials, and type-specific color badges.
    - **Testimonials CRUD** (✅ Complete - Task 2): Full-featured testimonials management system
        - Storage Layer: 6 CRUD methods (get, getById, create, update, delete, updateFeaturedStatus) with tenant isolation
        - API Routes: 6 secure endpoints with requireAuth middleware, 404 handling, and Zod validation
        - Schema Architecture: Preprocessors convert blank strings → null for optional fields (companyLogo, avatarUrl, metrics, industry, companySize), enabling field clearing
        - API Undefined Filtering: Preserves null values during PATCH operations to support clearing optional fields
        - TestimonialForm Component: Comprehensive form with validation, loading states, proper schema inheritance (no field overrides)
        - Routes: Lazy-loaded at /admin/testimonials/new and /admin/testimonials/:id/edit
        - Cache Management: Complete TanStack Query v5 invalidation for both list and detail queries across all mutations (create, update, delete, toggle featured)
        - ContentLibrary Integration: Full CRUD operations available from unified interface
    - **Portfolio Projects CRUD** (✅ Complete - Task 3): Comprehensive portfolio management for 3-level branding system
        - Storage Layer: Existing CRUD methods (getAllProjects, getProjectById, createProject, updateProject, deleteProject) with tenant isolation
        - API Routes: 5 secure endpoints at /api/projects with requireAuth, 404 handling, Zod validation, and undefined filtering
        - Schema Architecture: Preprocessors convert blank strings → null for 7 optional fields (clientName, thumbnailUrl, challengeText, solutionText, outcomeText, testimonialText, testimonialAuthor), enabling field clearing
        - ProjectForm Component: Comprehensive form with 13 fields including dynamic arrays for categories and media URLs
        - Dynamic Arrays: Categories and modalMediaUrls synced with react-hook-form via setValue on every add/remove operation
        - Form Sections: Basic Info (title, slug, client, thumbnail, categories), Content (challenge/solution/outcome), Media (type selection, URL array), Testimonial (optional quote/author)
        - Routes: Lazy-loaded at /admin/projects/new and /admin/projects/:id/edit
        - Cache Management: Complete TanStack Query v5 invalidation for list, detail, and public queries (/api/projects, /api/projects/:id, /api/branding/projects)
        - ContentLibrary Integration: Full CRUD operations with create/edit/delete actions, "Portfolio Project" option in Add Content dropdown
    - **Job Postings CRUD** (✅ Complete - Task 4): Full-featured job postings management for careers page
        - Storage Layer: CRUD methods (getAllJobPostings, getJobPosting, createJobPosting, updateJobPosting, deleteJobPosting) following testimonials pattern with tenant isolation
        - API Routes: 5 secure endpoints at /api/job-postings with requireAuth, 404 handling, and Zod validation
        - Schema: 7 required fields (title, department, location, type, description, requirements) plus active boolean (default true)
        - JobPostingForm Component: Comprehensive form with validation, loading states, Active toggle switch
        - Form Reset Pattern: useEffect-based form population to avoid render-time state updates
        - Routes: Lazy-loaded at /admin/job-postings/new and /admin/job-postings/:id/edit
        - Cache Management: Complete TanStack Query v5 invalidation for list, detail, and admin content queries
        - ContentLibrary Integration: Full CRUD operations with create/edit/delete actions, "Job Posting" option in Add Content dropdown
        - Security: All endpoints require authentication, tenant isolation enforced
    - Database-driven blog with Markdown rendering and an admin dashboard for managing blog posts, video content, and widget configuration. Features rich text editor, content scheduling, and authentication.
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
    - **Phase 3 Complete**: Scrollytelling encyclopedia pages (production-ready three-level system)
        - **Dynamic Routes**: /branding/:slug pages with GSAP-powered scroll-driven animations honoring prefers-reduced-motion
        - **Particle Dissolve**: 1.2s canvas-based transition from Level 2 expansion to Level 3 scrollytelling delivering "raw energy of life" feeling
        - **Scene Renderer**: Interprets project_scenes.sceneConfig JSONB with 7 scene types (hero, text, image, video, split-layout, gallery, testimonial)
        - **Immersive Animations**: Full-viewport parallax sections, scroll-triggered reveals, cinematic fade transitions using GSAP ScrollTrigger
        - **Navigation UI**: Scroll progress tracking, scene navigation, return to portfolio button with persistent header
        - **Data Architecture**: Database-driven with extended schema (client_name, categories, testimonial_text, testimonial_author fields)
        - **API Integration**: Public endpoint GET /api/branding/projects returns all projects with React Query consumption
        - **Production Content**: 5 professional portfolio projects seeded (TechFlow AI, SaaSync, GreenLeaf Market, FinView Analytics, Nomad Wellness)
        - **Single Source of Truth**: All three levels (grid, expansion, scrollytelling) use database - no mock data dependencies
        - **Testing**: E2E verified complete flow (grid → expansion → particle dissolve → scrollytelling → navigation)
    - **Content Strategy**: Raw JSON editor approach for project_scenes (build engine complete, dashboard UI for later iterations)
    - **Frontend**: Interactive /branding page with bouncy 3D hover animations, tight grid spacing, and API-backed project loading

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