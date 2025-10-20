# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like the "Fully Loaded BDR Pod" through a dark-mode design, interactive calculators, GSAP animations, and gear visualizations. It targets a B2B SaaS audience, focusing on founders and GTM leaders with an emphasis on data-driven decision-making.

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## System Architecture
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM.

**UI/UX Decisions:**
- **Brand Color Philosophy**: Semantic color system based on "Culture = Community + Competition" with specific colors for competition (Red), collaboration (Purple), technology (Indigo), and strategy (Dark Purple). All colors meet WCAG AA accessibility standards.
- **Typography**: Inter for headings and body, JetBrains Mono for monospace.
- **Design System**: Semantic color tokens, badge variants, and consistent typography for a unified aesthetic.
- **Animations**: GSAP with ScrollTrigger for scroll-triggered timeline reveals. Fade-in and slide-up animations on timeline steps, sequential line drawing, and bounce effect on result card. Glassmorphic floating calculator CTA. Supports `prefers-reduced-motion`.

**Technical Implementations & Feature Specifications:**
- **Interactive ROI Calculator**: Compares in-house vs. RevParty Pod based on user inputs (ACV, close rate, sales cycle, quota) with real-time calculations and email capture.
- **GTM Timeline Visualization**: A cinematic vertical timeline showcasing the complete GTM system with scroll-triggered GSAP animations. Features 4 key components (Elite Talent, Strategic Framework, AI-Powered, Tech Stack) connected by animated lines, culminating in a "20+ Qualified Appointments" result card. Each step fades in and slides up on scroll with brand-specific colors (purple, red, indigo). Mobile-responsive and supports prefers-reduced-motion.
- **Content Management**: Database-driven blog ("Blueprints") with Markdown rendering (DOMPurify for XSS protection), testimonial display, and career listings with application forms (React Hook Form + Zod for validation).
- **Site Structure**: Comprehensive navigation with dropdown menus for Solutions, Methodology, Results, and Company.
- **Accessibility**: ARIA labels, keyboard navigation, and data-testid attributes for testing.

**System Design Choices:**
- **Frontend**: React 18 with Vite for fast development, Tailwind CSS for utility-first styling, Wouter for routing, React Query (TanStack Query v5) for data fetching, and Shadcn UI components.
- **Backend**: Express.js provides API endpoints for blog posts, testimonials, job postings, job applications, and ROI submissions.
- **Database**: PostgreSQL with Drizzle ORM handles all content and application data.
- **API Routes**: RESTful APIs for content retrieval and submission.

## External Dependencies
- **PostgreSQL**: Primary database for all application data (Neon-backed via Replit).
- **Drizzle ORM**: Object-Relational Mapper for PostgreSQL.
- **GSAP**: Animation library, including the ScrollTrigger plugin.
- **TanStack Query (React Query)**: For data fetching and state management.
- **Shadcn UI**: UI component library.
- **Marked**: Markdown parser.
- **DOMPurify**: HTML sanitizer for secure Markdown rendering.
- **React Hook Form**: For form management and validation.
- **Zod**: Schema validation library.