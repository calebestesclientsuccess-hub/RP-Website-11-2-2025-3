# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, focusing on conversion over visual complexity. It targets a B2B SaaS audience (founders and GTM leaders) with an emphasis on data-driven decision-making. The project prioritizes SEO optimization, maintainability, and fast performance. The platform includes a comprehensive CMS for managing blog posts, video content, and site configurations.

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
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM. Animations are minimal and focused, with essential scroll-triggered timeline animations retained. A single global error boundary handles all error states. The architecture prioritizes simplicity and maintainability, including a full-featured Content Management System (CMS).

**UI/UX Decisions:**
- **Color Philosophy**: Semantic color system meeting WCAG AA accessibility standards, featuring a red-focused gradient system.
- **Typography**: Inter for headings/body, JetBrains Mono for monospace, with an inverted pyramid hierarchy.
- **Design System**: Semantic color tokens, badge variants, and consistent typography, supporting both dark (default) and sophisticated light themes. Gradient text is used for numbers and key highlights.
- **Animations**: Minimal GSAP usage (only for `BuildAndRampTimeline`) respecting `prefers-reduced-motion`. Decorative animations are removed.
- **Accessibility**: `prefers-reduced-motion`, keyboard navigation, ARIA landmarks, and WCAG AA compliance.

**Technical Implementations & Feature Specifications:**
- **Core Sections**: Includes a Hero Section, Lead Magnet System, `SimpleBridgeSection`, `SimplifiedOrbitalPowers` (interactive badges), Interactive ROI Calculator, Testimonial Carousel, and `BuildAndRampTimeline` (with GSAP ScrollTrigger).
- **Content Management System (CMS)**:
    - Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection).
    - Management of testimonials and career listings with application forms (React Hook Form + Zod).
    - Admin dashboard for managing blog posts, video content, and widget configuration.
    - Features rich text editor (TipTap), content scheduling, authentication with bcrypt and PostgreSQL session store.
- **SEO Optimizations**: Comprehensive technical SEO foundation including `robots.txt`, `sitemap.xml`, favicons, canonical URLs, `react-helmet-async` for meta tags (Open Graph, Twitter Card), structured data (JSON-LD), and Core Web Vitals optimization.
- **Error Handling**: Single global `ErrorBoundary` component.
- **Article Layout System**: 3-column responsive layout for articles with `FeaturedPromo` and `RelatedArticles` sidebars. Includes `ReadingProgressBar` conversion widget.
- **Assessment Tools**:
    - **Pipeline Assessment Tool**: A multi-screen assessment at `/pipeline-assessment` with database persistence, lead segmentation, and an admin dashboard for responses.
    - **GTM Assessment Tool**: A decision-tree based assessment at `/resources/gtm-assessment` with dynamic results pages and a blueprint capture system.

**System Design Choices:**
- **Frontend**: React 18 (Vite), Tailwind CSS, Wouter (routing), React Query (data fetching), Shadcn UI.
- **Backend**: Express.js for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Animation Strategy**: Minimal and performance-focused, utilizing GSAP only for essential timeline animations.

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
- **Gmail Connector**: Email sending service for transactional emails (configured with caleb@revenueparty.com).

## Authentication & User Management

**Multi-User System:**
The application includes a comprehensive authentication system with role-based access control and password reset functionality.

**User Accounts:**
- **Super User**: Caleb@RevenueParty.com (role: super_user)
- **Managers**: admin@RevenueParty.com, mariya@RevenueParty.com, muneeb@RevenueParty.com, danyal@RevenueParty.com, sofia@RevenueParty.com (role: manager)
- **Temporary Password**: RevenueParty2024! (all accounts should change passwords via forgot password flow)

**Features:**
- Login with username OR email (case-insensitive email matching)
- Password reset via email with time-limited one-time tokens (1 hour expiration)
- Email delivery via Gmail API integration
- Bcrypt password hashing for security
- PostgreSQL session store for session management
- Email enumeration prevention (neutral success messages)

**Email Integration:**
- Uses Replit's Gmail connector (authenticated with caleb@revenueparty.com)
- Sends password reset emails with RFC 2822 compliant formatting
- Proper error handling and logging for email delivery monitoring
- Reset link format: `https://{domain}/admin/reset-password/{token}`

**Database Schema:**
- **users table**: id, username, email (unique, nullable), password (hashed), role (super_user/manager)
- **passwordResetTokens table**: id, token (unique), userId, expiresAt, used (single-use flag)

**Security Best Practices:**
- Time-limited tokens (1 hour expiration)
- Single-use tokens (marked as used after password reset)
- Case-insensitive email matching for better UX
- No email enumeration (always returns success message)
- Comprehensive error logging for monitoring

**Note**: For production deployment, consider adding rate limiting to authentication endpoints to prevent brute-force attacks.