# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a sophisticated marketing website for a Go-to-Market (GTM) consultancy that deploys complete revenue generation systems. The site features dark mode design, GSAP animations, interactive calculators, and gear visualizations to showcase the "Fully Loaded BDR Pod" service.

## Project Structure

### Frontend (React + Vite + Tailwind CSS)
- **Pages**:
  - `/` - Home page with hero, problems, solutions, gear system, process, and testimonials
  - `/gtm-engine` - GTM Engine overview page
  - **Solutions**:
    - `/solutions/fully-loaded-bdr-pod` - Fully Loaded BDR Pod service details
  - **Methodology**:
    - `/methodology` - Methodology overview
    - `/methodology/full-stack-salesperson` - Full-Stack Salesperson approach
    - `/methodology/ai-powered-by-humans` - AI-Powered by Humans philosophy
  - **Results**:
    - `/results` - Results overview page
    - `/results/roi-calculator` - Comprehensive ROI calculator with email capture
    - `/results/success-stories` - Success stories showcasing client testimonials
  - `/blueprints` - Blog/Blueprints list page with all published posts
  - `/blueprints/:slug` - Individual blog post with Markdown rendering
  - `/comparison` - Comparison page (in-house vs RevParty)
  - **Company**:
    - `/why-party` - About page with company mission and values
    - `/join-the-party` - Careers page with active job listings
    - `/join-the-party/:id` - Job detail page with application form
    - `/contact-us` - Contact page with schedule meeting CTA

- **Components**:
  - `Navbar.tsx` - Fixed navigation with dropdown menus (Solutions, Methodology, Results, Company) and theme toggle
  - `Footer.tsx` - Site footer with links
  - `ThemeProvider.tsx` - Dark/light theme management
  - `MiniCalculator.tsx` - Hero section calculator widget
  - `GearSystem.tsx` - Interactive gear visualization with hover popups

### Backend (Express.js + PostgreSQL)
- **Database**: Full PostgreSQL integration with Drizzle ORM
- **API Routes**:
  - `/api/blog-posts` - GET list of published posts, GET by slug
  - `/api/testimonials` - GET all testimonials (with optional featured filter)
  - `/api/job-postings` - GET active job listings, GET by ID
  - `/api/job-applications` - POST new job applications
  - `/api/roi-submissions` - POST ROI calculator email captures
  
- **Storage**: Database-backed storage with seeded sample data for all content types

### Design System

#### Brand Color Philosophy: Culture = Community + Competition
The site expresses the core brand philosophy through a sophisticated semantic color system where **Culture = Community (helping others succeed) + Competition (fuel that propels forward)**. All colors meet WCAG AA accessibility standards (≥4.5:1 contrast ratio).

- **Color Palette**:
  - **Primary Red (#ef233c)**: Competition, CTAs, metrics, wins, competitive advantages
  - **Community Purple (#9F8FFF)**: Collaboration, culture, testimonials, team support
  - **Indigo (#2e294e)**: Technology, data, AI-powered features, tech stack
  - **Purple Dark (#42349c)**: Strategy, frameworks, methodologies, playbooks
  - **Gradients**: Subtle 5-10% opacity overlays combining community + competition colors for "culture"
  
- **Semantic Color Tokens** (defined in `client/src/index.css`):
  - `text-primary` / `bg-primary` - Red for competition elements
  - `text-community` / `bg-community` - Purple for community elements
  - `text-indigo` / `bg-indigo` - Indigo for technology
  - `text-purple-dark` / `bg-purple-dark` - Purple dark for strategy
  - All tokens support light/dark mode with adjusted contrast

- **Badge Variants** (`client/src/components/ui/badge.tsx`):
  - `variant="default"` - Primary red (competition)
  - `variant="community"` - Community purple (collaboration)
  - `variant="indigo"` - Indigo (technology)
  - `variant="secondary"` - Neutral

- **Typography**:
  - Headings: Inter (bold weights)
  - Body: Inter (regular)
  - Monospace: JetBrains Mono (numbers, data)

- **Animations**:
  - Glow pulse effects on gear systems with brand colors
  - Rotating gear animations
  - Fade-up scroll animations
  - Glassmorphic hover popups with tinted backgrounds

## Key Features

### Interactive ROI Calculator
- User inputs: ACV, close rate, sales cycle, quota
- Real-time calculations comparing in-house hire vs. RevParty Pod
- Email capture functionality for lead generation (stored in PostgreSQL)
- Collapsible methodology section explaining assumptions
- Tooltips on all inputs with detailed explanations

### Gear System Visualization
- Central hub showing "20+ Qualified Appointments/Month"
- Four orbiting gears representing:
  1. Elite Talent (Red)
  2. Tech Stack (Indigo)
  3. Strategic Framework (Purple)
  4. Signal Factory (Purple Dark)
- Glassmorphic popups on hover with descriptions
- Responsive mobile layout with vertical stacking

### Blog & Content Management
- Database-driven blog with PostgreSQL storage
- Markdown content rendering with DOMPurify sanitization (XSS protection)
- Published/draft post status management
- SEO-friendly URLs with slug-based routing
- Responsive card grid layout on list page
- Full-width article layout on detail pages
- Featured image support

### Social Proof (Testimonials)
- Client testimonials displayed on home page
- Database-backed testimonial management
- Featured testimonials filtering
- Client company names and roles
- Elegant card grid layout with subtle animations

### Careers & Job Applications
- Active job listings page with department, location, and type filters
- Individual job detail pages with full descriptions and requirements
- Application form with validation (react-hook-form + Zod)
- Required fields: name, email, phone
- Optional fields: LinkedIn, resume link, cover letter
- Success toast notifications
- Database persistence for all applications

### Design Excellence
- Dark mode first with light mode toggle
- Subtle glow effects using CSS animations
- Smooth transitions and hover states
- Proper accessibility (ARIA labels, keyboard navigation, data-testid attributes)
- Prefers-reduced-motion support
- Consistent spacing and typography

## Recent Changes (October 2025)
- **Brand Color System Implementation (October 20, 2025)**:
  - Implemented complete semantic color system expressing "Culture = Community + Competition" philosophy
  - Replaced all hard-coded hex colors with semantic tokens (text-primary, text-community, text-indigo, text-purple-dark)
  - Added subtle gradients (5-10% opacity) across all hero sections for visual texture
  - Created Badge component variants matching brand color system (default, community, indigo, secondary)
  - Applied consistent color theming across 15+ pages:
    - **Home**: Culture gradients, community testimonials, competition CTAs
    - **Solutions/Methodology**: GTM Engine, Fully Loaded BDR, Full-Stack Salesperson, AI-Powered
    - **Results**: Success Stories with community gradients, ROI Calculator with competition emphasis
    - **Company**: About (community culture), Careers (mixed gradients), Contact (balanced approach)
    - **Marketing**: Comparison (competitive red), Blueprints (thought leadership purple)
  - All colors verified for WCAG AA accessibility (≥4.5:1 contrast) in both light and dark modes
  - Tested and validated with automated smoke tests and architect review
- **Database Integration**: Migrated from in-memory to PostgreSQL with Drizzle ORM
- **Blog System**: Built complete blog feature with Markdown rendering and XSS protection (renamed to "Blueprints")
- **Testimonials**: Added social proof section to home page with database-backed testimonials
- **Careers**: Created job listings and application system with form validation
- **Navigation Reorganization**: Major site structure update with dropdown navigation menus
  - Added dropdown menus: Solutions, Methodology, Results, Company
  - Created new pages: GTM Engine, Full-Stack Salesperson, AI-Powered, Results Overview, Success Stories, Comparison, Contact Us
  - Updated all routes to new URL structure (e.g., `/services` → `/solutions/fully-loaded-bdr-pod`, `/blog` → `/blueprints`)
  - Fixed nested anchor tag errors in Navbar and Footer components
- **Data Seeding**: Created seed data for blog posts, testimonials, and job postings
- **API Routes**: Implemented RESTful API endpoints for all content types
- **Testing**: Added comprehensive data-testid attributes for e2e testing

## Tech Stack
- React 18 with Vite
- Tailwind CSS for styling
- Wouter for routing
- React Query (TanStack Query v5) for data fetching
- Shadcn UI components
- GSAP for advanced animations (ready for ScrollTrigger)
- Express.js backend
- PostgreSQL database (Neon-backed via Replit)
- Drizzle ORM for database management
- Zod for schema validation
- React Hook Form for form handling
- Marked + DOMPurify for secure Markdown rendering

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## Database Schema
All tables use PostgreSQL with Drizzle ORM:

- **blog_posts**: id, title, slug, excerpt, content (Markdown), featuredImage, published, createdAt
- **testimonials**: id, clientName, company, role, content, featured, createdAt
- **job_postings**: id, title, department, location, type, description, requirements, active, createdAt
- **job_applications**: id, jobId, name, email, phone, linkedin, resume, coverLetter, createdAt
- **roi_submissions**: id, email, acv, closeRate, salesCycle, quota, calculations, createdAt

## Next Steps (Future Enhancements)
1. Implement GSAP ScrollTrigger for advanced gear animations with multi-scene narrative
2. Add email delivery functionality (Resend/SendGrid) for ROI calculator results
3. Add admin dashboard for content management (blog posts, testimonials, job postings)
4. Implement pagination for blog and careers pages
5. Add search and filtering for blog posts
6. Add analytics tracking for calculator and application submissions
7. Consider adding CMS integration (Sanity/Contentful) for non-technical content editing
