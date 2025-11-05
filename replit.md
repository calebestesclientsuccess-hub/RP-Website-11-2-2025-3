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

## Testing Summary & UI/UX Issues

### Testing Completed (November 5, 2025)

**✅ Fully Working Features:**

1. **Blog Posts CRUD** - Complete create, read, update, delete workflow
   - Admin can create both draft and published blog posts
   - Edit form loads existing posts correctly
   - Updates persist correctly
   - Draft/published state filtering works
   - Public page shows only published posts
   
2. **Video Posts CRUD** - Complete create, read, update, delete workflow
   - Admin can create both draft and published video posts
   - Edit form loads existing posts correctly  
   - Updates persist correctly
   - Draft/published state filtering works
   - Public page shows only published videos

3. **Assessment Configs CRUD** - Basic assessment metadata management
   - Admin can create assessment configurations (title, slug, description, scoring method)
   - Edit form loads existing configs correctly
   - Updates persist correctly
   - Fixed: Infinite re-render loop in edit form (moved form.reset to useEffect)

4. **GTM Assessment** - Public-facing assessment tool
   - 2-question decision tree assessment working at /gtm-assessment
   - ConfigurableAssessment widget renders correctly
   - Answer routing logic works (nextQuestionId and resultBucketKey)
   - Result buckets display properly

### Critical Bugs Fixed

1. **Blog/Video Posts**: Fixed missing `publishedOnly=false` query parameter
   - Issue: Admin list only showed published content, breaking edit flows
   - Fix: Added `?publishedOnly=false` query param to admin endpoints
   - Added separate `/by-id/:id` routes for fetching by UUID

2. **Cache Invalidation**: Changed from `invalidateQueries` to `removeQueries`
   - Issue: Stale cache preventing fresh data after updates
   - Fix: Force cache removal after mutations to ensure fresh fetches

3. **Assessment Form**: Fixed infinite re-render loop
   - Issue: `form.reset()` called during render causing infinite loop
   - Fix: Moved `form.reset()` to `useEffect` hook

### Known Limitations & Missing Features

**🔴 Critical Limitation: Assessment Admin UI Incomplete**

The assessment admin interface only supports basic configuration management. To create a fully functional assessment, admins need to manually manage:

- **Questions**: No UI to add/edit questions for an assessment
- **Answers**: No UI to add/edit answer choices for questions
- **Result Buckets**: No UI to add/edit result categories
- **Answer Routing**: No UI to configure nextQuestionId or resultBucketKey logic

Current workaround: GTM assessment was created via direct database inserts or migration scripts.

**Impact**: Non-technical users cannot create new assessments through the admin UI.

**Recommended Fix**: Build comprehensive admin pages for:
1. Questions management (linked to assessment config)
2. Answers management (linked to questions, with routing logic)
3. Result buckets management (linked to assessment config)
4. Visual decision tree builder for routing logic

### Minor UI/UX Issues

1. **ROI Calculator CTA Overlay**
   - Issue: Floating ROI Calculator CTA can obstruct admin forms
   - Severity: Low - can be dismissed with Escape key
   - Recommendation: Exclude ROI Calculator from admin pages

2. **Slug Auto-generation**
   - Current: Slugs auto-generate from titles
   - Works well for most use cases
   - No validation for slug uniqueness in UI (only DB constraint)

3. **Form Validation Messages**
   - Some validation errors could be more descriptive
   - Generally acceptable for admin users

### API Consistency Patterns Established

All content endpoints follow consistent patterns:

```
GET /api/{resource}?publishedOnly=false  // Admin list (all items)
GET /api/{resource}?publishedOnly=true   // Public list (published only, default)
GET /api/{resource}/by-id/:id           // Fetch by UUID for editing
GET /api/{resource}/:slug               // Fetch by slug for public display
POST /api/{resource}                    // Create
PUT /api/{resource}/:id                 // Update
DELETE /api/{resource}/:id              // Delete
```

### Testing Credentials

- **Email**: Caleb@RevenueParty.com
- **Password**: RevenueParty2024!
- **Role**: super_user

Additional manager accounts available (see Authentication section).

### Next Steps for Production Readiness

1. **High Priority**: Build complete assessment admin UI (questions, answers, results)
2. **Medium Priority**: Add form field validation for slug uniqueness
3. **Low Priority**: Hide ROI Calculator widget on admin pages
4. **Polish**: Improve error messages and form validation feedback
5. **Testing**: Add automated e2e tests for critical admin workflows