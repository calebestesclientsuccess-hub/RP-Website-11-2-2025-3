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
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility standards. Red-focused gradient system emphasizes brand colors (darkest red #C52A2A through pink/magenta).
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography.
    - **Dark Mode (Default)**: Professional dark design with subtle gradients and clean aesthetics.
    - **Light Mode**: Sophisticated light theme with proper contrast and readability.
    - **Gradient Text**: All numbers, metrics, and key highlights use red-focused gradient (darkest red → vibrant red → pink-red → magenta-pink) for visual emphasis.
- **Animations**: Minimal GSAP usage - only BuildAndRampTimeline uses ScrollTrigger for essential scroll animations. All decorative animations have been removed for better performance. Respects `prefers-reduced-motion`.
- **Theming**: WCAG AA-compliant red-focused gradient system. Primary buttons and sliders use darkest red (hsl(0, 85%, 38%)). No performance tier detection - all users get the same optimized experience.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" with tagline and problem statement.
- **Lead Magnet System**: Positioned after "The $198,000 Mistake" section. Captures email, name, and company in exchange for downloadable playbook PDF. Includes GTM event tracking, form validation (Zod), toast notifications, and database storage.
- **SimpleBridgeSection**: Simple static text transition between content sections, no scroll-triggered animations. Uses gradient text for emphasis.
- **SimplifiedOrbitalPowers**: Interactive badges that gently orbit around a central video with magnetic hover effects and dynamic background color morphing. Six clickable badges that reveal detailed information about each power.
- **Interactive ROI Calculator**: Compares in-house vs. RevParty Pod based on user inputs with real-time calculations. All numbers display in red-focused gradient.
- **Testimonial Carousel**: Auto-rotating carousel (8s intervals) with Schema.org markup, manual navigation controls, and gradient-styled metrics display.
- **BuildAndRampTimeline**: The only component with GSAP ScrollTrigger animations. Showcases 4 GTM steps with scroll-triggered reveals.
- **Content Management**: Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection), testimonial display, and career listings with application forms (React Hook Form + Zod).
- **SEO Optimizations**: Comprehensive technical foundation including `robots.txt`, `sitemap.xml`, favicons, and canonical URLs. Uses `react-helmet-async` for page-specific meta tags (Open Graph, Twitter Card), structured data (JSON-LD schemas including Product Reviews), and performance optimizations for Core Web Vitals.
- **Error Handling**: Single global ErrorBoundary component at application level for consistent error handling.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Animation Strategy**: Minimal animations using GSAP only where essential (BuildAndRampTimeline). Removed complex scroll-triggered animations, performance tier detection, and decorative animations for better maintainability and performance.

## Recent Changes

### Pipeline Assessment & Reading Progress Bar (November 2025)
- **Pipeline Assessment Tool**: Netflix-style cinematic assessment at `/pipeline-assessment` with 14+ question screens
  - Database persistence: `assessment_responses` and `newsletter_signups` tables
  - Horizontal sliding transitions with progress persistence (localStorage sessionId)
  - Bucket-based lead segmentation (5 buckets: quick-win, architecture-gap, process-problem, system-stuck, not-ready)
  - Admin dashboard at `/admin/assessment-dashboard` with filtering, CSV export
  - All copy uses "Revenue Blueprint" terminology (no "Architect's Audit" references)
  - Thank you page with bucket-specific messaging and newsletter signup
- **ReadingProgressBar Component**: Graceful conversion widget on guide pages
  - Scroll-triggered engagement: Activates after 2-3 meaningful scrolls
  - Subtle shimmer effects: Gradient transition on button text, soft glow every 30 seconds while reading
  - Pause animations if user idle >10 seconds (respects active reading)
  - Mobile-optimized: Simplified on mobile (no glow effects for battery efficiency)
  - Deployed on 4 guide pages: AgencyTrapGuide, InternalTrapGuide, SalesAsAServiceGuide, HireColdCallersGuide
  - Links to `/pipeline-assessment` for seamless conversion funnel

### GTM Assessment Tool (November 2025)
- Added new GTM Assessment tool at `/resources/gtm-assessment` with decision-tree logic (2 questions)
- Created 4 dynamic results pages (`path-1` through `path-4`) with URL query parameter tracking (`q1`, `q2`)
- Implemented blueprint capture system with new `blueprintCaptures` database table
- Added email template generation for assessment results (placeholder - Resend integration pending)
- Created article page "How to Hire Cold Callers (2026 Guide)" with embedded assessment widgets
- Updated footer navigation with new resource link
- Components created: `AssessmentWidget`, `DiagnosticReadoutCard`, `BlueprintCaptureForm`, `SecondaryFitCallButton`
- Backend API: `POST /api/v1/capture-blueprint`, `GET /api/v1/blueprint-captures`

**Note**: Email sending is currently a placeholder. When ready to set up, use Resend integration (connector:ccfg_resend_01K69QKYK789WN202XSE3QS17V) and update `server/routes.ts` to actually send emails using the generated templates from `server/email-templates.ts`.

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
- **Resend** (pending setup): Email sending service for transactional emails.