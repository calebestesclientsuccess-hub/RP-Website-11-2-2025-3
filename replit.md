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
- **Media Library**: Cloudinary-backed media management system with database persistence (`media_library` table). Supports image and video uploads with labeling and tagging. Uses multer for multipart form handling. Note: Removed conflicting `express-fileupload` global middleware that was consuming multipart data before multer could process it.
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
    - **AI-Powered Scene Generation**: Natural language to scene conversion using Gemini 2.5 Flash.
        - **Architecture**: Three-layer validation system (Gemini constraints → API validation → Frontend normalization)
        - **Type Normalization**: Maps AI-suggested types (hero, testimonial) to valid DB schema types (text, quote, image, video, split, gallery, fullscreen)
        - **Duration Detection**: Smart heuristic detects milliseconds (≥50) vs seconds, converts and clamps to schema limits (entry/exit ≤5s, animation ≤10s)
        - **Required Field Enforcement**: Ensures text scenes have both heading and body (uses subheading as fallback)
        - **User Flow**: Three-tab editor (Quick Add, Advanced, AI Generate) → Prompt input → JSON preview → Save to database
        - **Error Handling**: Detailed validation messages with field-level errors surfaced in UI toasts
        - **API**: POST `/api/scenes/generate-with-ai` with lazy-loaded Gemini client
    - **AI Portfolio Builder** (`/admin/portfolio-builder`): Comprehensive project creation tool with AI-orchestrated scene generation.
        - **Editable Conversation History**: All chat messages (user and AI) in the conversation history are editable via inline Edit/Save/Cancel controls. ChatMessage component features useEffect-based state synchronization to prevent stale edits when conversation updates.
        - **Content Catalog System**: Structured asset management with the following fields:
            - **Texts**: type (headline/subheading/paragraph, required) + content (required)
            - **Images**: url (required) + alt (required for accessibility) + caption (optional)
            - **Videos**: url (required) + caption (optional)
            - **Quotes**: quote (required) + author (required) + role (optional)
            - **Director Notes**: Non-empty string (required) providing AI orchestration guidance
        - **AI Director Model**: Users provide all content; AI orchestrates presentation (scene ordering, timing, transitions, animations) based on director notes
        - **Workflow**: Supports both new projects (requires title and slug; client optional) and adding scenes to existing projects
        - **Validation**: Triple-layer enforcement (frontend UI → Zod schema refinement → backend runtime checks); catalog must contain at least one asset
        - **Transactional Atomicity**: Drizzle transaction wrapper ensures project creation and scene inserts commit or rollback together
        - **API Endpoint Routing**: Frontend routes to mode-specific endpoints:
            - Initial cinematic generation → POST `/api/portfolio/generate-cinematic` with catalog payload
            - Initial hybrid/refinement → POST `/api/portfolio/generate-enhanced` with scenes/conversation payload
        - **Navigation**: Accessible from admin sidebar with Sparkles icon
- **Scene Recycler System (Sprints 0-2 Complete)**:
    - **Database Schema**: `scene_templates` table with full tenant isolation, GIN full-text search index, usage analytics tracking
    - **Template Storage**: Reusable scene configurations with metadata (name, description, category, tags, preview_image_url)
    - **Source Tracking**: Links to original project/scene for template provenance (source_project_id, source_scene_id)
    - **Usage Analytics**: Atomically tracks usage_count and last_used_at timestamp on recycle
    - **Full-Text Search**: PostgreSQL GIN index using to_tsvector for production-grade search across name/description
    - **Performance Indexes**: Tenant filtering (btree), category filtering (btree), full-text search (GIN)
    - **Type Safety**: Zod validation schemas (insertSceneTemplateSchema, SceneTemplate, InsertSceneTemplate, UpdateSceneTemplate)
    - **Backend API (8 endpoints)**:
        - GET `/api/scene-templates` - List all templates with optional category filter
        - GET `/api/scene-templates/search?q={query}` - Full-text search using plainto_tsquery
        - GET `/api/scene-templates/:id` - Get single template details
        - POST `/api/scene-templates` - Create template manually
        - PATCH `/api/scene-templates/:id` - Update template metadata
        - DELETE `/api/scene-templates/:id` - Delete template
        - POST `/api/project-scenes/:sceneId/save-as-template` - Convert existing scene into template
        - POST `/api/scene-templates/:id/recycle?projectId={id}` - Apply template to project (increments usage stats)
    - **Frontend UI**:
        - **Template Library Page** (`/admin/template-library`): Grid layout with category filters, search input, template preview modal
        - **TemplateCard Component**: Displays preview image, name, description, category badge, tags, usage stats, with Preview/Use/Delete actions
        - **TemplatePreviewModal**: Shows full template details including sceneConfig JSON and metadata
        - **Save as Template Feature**: Bookmark icon button in ProjectSceneEditor opens SaveTemplateDialog with fields for name, description, category, tags
        - **Navigation**: Template Library link in AdminSidebar (Bookmark icon) between Media Library and AI Prompts
    - **React Query Integration**: Cache invalidation on mutations, hierarchical query keys for templates and scenes
    - **Outstanding**: AI-powered template suggestions (Sprint 3) not yet implemented. End-to-end testing blocked by unrelated Portfolio Builder rendering issue.

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