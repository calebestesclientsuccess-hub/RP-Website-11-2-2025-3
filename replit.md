# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, interactive calculators, GSAP animations, and a cinematic timeline visualization. It targets a B2B SaaS audience, focusing on founders and GTM leaders with an emphasis on data-driven decision-making.

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
- **Typography**: Inter for headings and body, JetBrains Mono for monospace. Inverted pyramid hierarchy used in comparison section (larger questions, smaller but bolder answer line with spacing).
- **Design System**: Semantic color tokens, badge variants with larger sizing and worn/dimpled paper texture effect, and consistent typography for a unified aesthetic.
- **Animations**: GSAP with ScrollTrigger for scroll-triggered timeline reveals. Fade-in and slide-up animations on timeline steps, sequential line drawing, and bounce effect on result card. Glassmorphic floating calculator CTA. Supports `prefers-reduced-motion`.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" as the main heading with red tagline "starring two BDRs, dedicated to finding, and selling your customers." Problem section uses "Building a Sales Team is expensive" messaging.
- **Cinematic Bridge Animation**: Sophisticated scroll-triggered animation sequence featuring:
  - Theatre-mode effects (progressive vignette + spotlight) for dramatic focus
  - Text transition: "You need more than another salesperson" fades out while "You need a system" scales up in red
  - Canvas-based particle disintegration effect (1.5s duration, left-to-right sweep with gravity physics)
  - Particles drift downward and create glowing effect on "Your Fullstack Sales Unit" section
  - Red minimalist bouncing arrow appears after disintegration completes
- **Orbital Powers Animation**: Apple-inspired interactive video element featuring a maximized central video (896px desktop, 640px tablet, 448px mobile) with a thin silver metallic frame and multi-color glow (blue, purple, magenta, indigo) that makes it appear to float in the same physical space as the video content. Six orbital "powers" (AI Architect, GTM Strategist, RevOps, Elite Coach, Tech Stack, Community & Competition) orbit around it. Video plays automatically once, replaying only after scrolling away for 6+ seconds. Animation stops 2.5 seconds before video ends, badges expand outward with intensified glow, and labels appear with staggered animation. Navigation arrows are integrated into the info box for easy click access. Video uses object-contain to prevent face cutoff. The futuristic frame features a 2px silver border with layered box-shadow glows matching the video's color palette.
- **Badge Components**: Larger sizing (text-sm with px-4 py-1.5) with worn, dimpled paper texture effect using cross-hatch patterns, inset shadows, and SVG noise filter for authentic paper grain.
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