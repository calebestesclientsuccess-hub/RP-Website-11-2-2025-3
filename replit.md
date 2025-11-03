# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a marketing website for a Go-to-Market (GTM) consultancy, specializing in deploying comprehensive revenue generation systems. The site showcases services like "Your Fullstack Sales Unit" through a dark-mode design, interactive calculators, GSAP animations, and a cinematic timeline visualization. It targets a B2B SaaS audience, focusing on founders and GTM leaders with an emphasis on data-driven decision-making.

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## Animation System Architecture (November 2025)
All animations are centralized, maintainable, and isolated for reliability. The system is designed to delight without distraction while being easy to debug and modify.

**Core Principles:**
- **Centralized Configuration**: All timing values, easings, and constants in `/client/src/lib/animationConfig.ts`
- **Error Isolation**: Error boundaries prevent animation failures from breaking the page
- **Debug Mode**: Add `?debug=true` to URL to see live animation values and performance metrics
- **Accessibility First**: All animations respect `prefers-reduced-motion` and show end states immediately when needed

**Animation Flow Map:**

1. **Hero Section** (Home page)
   - Static hero with ROI calculator
   - No scroll-triggered animations here

2. **ScrollScaleReveal** (`/components/ScrollScaleReveal.tsx`)
   - **What**: "You need more than another salesperson" → "You need a system"
   - **Trigger**: Pinned scroll (4x viewport height)
   - **Phases**: Growth (60%) → Crossfade (20%) → Friction hold (20%) with pulsating effect
   - **Purpose**: Create dramatic pause before revealing the solution
   - **Config**: `ANIMATION_CONFIG.scrollScale`

3. **CinematicBridge** + **CinematicTextTransform** (`/components/CinematicBridge.tsx`)
   - **What**: Theatre-mode vignette/spotlight effects with text transformation
   - **Trigger**: Pinned scroll section
   - **Phases**: Build intensity → Peak → Ease with bouncing arrow
   - **Purpose**: Transition between problem and solution with cinematic drama
   - **Config**: `ANIMATION_CONFIG.cinematicBridge` and `ANIMATION_CONFIG.cinematicText`
   - **Note**: CinematicBridge contains CinematicTextTransform as child

4. **ParticleDisintegration** (`/components/ParticleDisintegration.tsx`)
   - **What**: Red particle effects falling like leaves after text transformation
   - **Trigger**: Activated programmatically when text changes
   - **Physics**: Gravity, horizontal sway, air resistance (6-9 second lifespan)
   - **Purpose**: Visual metaphor of old thinking "falling away"
   - **Config**: `ANIMATION_CONFIG.particles`

5. **OrbitalPowers** (`/components/OrbitalPowers.tsx`)
   - **What**: Video with 6 orbiting "powers" badges using golden ratio proportions
   - **Trigger**: IntersectionObserver when 20% visible, plays video once
   - **Phases**: Orbital rotation → Slowdown (2.5s before video end) → Expansion → Interactive
   - **Purpose**: Showcase the 6 components of the GTM system dynamically
   - **Config**: `ANIMATION_CONFIG.orbital`

6. **BuildAndRampTimeline** (`/components/BuildAndRampTimeline.tsx`)
   - **What**: Vertical 5-month timeline with scroll reveals
   - **Trigger**: Individual ScrollTriggers per step (85% viewport)
   - **Animation**: Steps fade up 50px, connecting lines draw downward
   - **Purpose**: Show transparent path from audit to guaranteed results
   - **Config**: `ANIMATION_CONFIG.timeline`

**Debugging Animations:**
- **Development**: Add `?debug=true` to URL to see AnimationDebugOverlay (bottom-right)
- **Config Changes**: Edit `/client/src/lib/animationConfig.ts` - all components use these values
- **Error Handling**: Each major animation wrapped in `<AnimationErrorBoundary>` 
  - Production: Fails silently (graceful degradation)
  - Development: Shows error card with details
- **Console Logs**: All debugging console.logs removed from production code

**Performance Considerations:**
- Performance tier detection still active (via ThemeProvider)
- Reduced motion users see end states immediately
- Animations designed to run at 60fps on mid-tier devices
- Error boundaries prevent cascading failures

## System Architecture
The project utilizes a React (Vite) frontend with Tailwind CSS and an Express.js backend with PostgreSQL and Drizzle ORM.

**UI/UX Decisions:**
- **Brand Color Philosophy**: Semantic color system based on "Culture = Community + Competition" with specific colors for competition (Red), collaboration (Purple), technology (Indigo), and strategy (Dark Purple). All colors meet WCAG AA accessibility standards.
- **Typography**: Inter for headings and body, JetBrains Mono for monospace. Inverted pyramid hierarchy used in comparison section (larger questions, smaller but bolder answer line with spacing).
- **Design System**: Semantic color tokens, badge variants with larger sizing, and consistent typography for a unified aesthetic.
  - **Dark Mode (Default)**: Dramatic cinematic design with dimpled paper texture effect on badges using cross-hatch patterns, inset shadows, and SVG noise filter for authentic paper grain.
  - **Light Mode Enhancement**: Sophisticated watercolor-meets-glass aesthetic that rivals dark mode's drama while maintaining complete visual isolation (no light mode effects show in dark mode):
    - **Paper Texture Overlay**: Subtle 2.5% opacity SVG noise filter creates authentic paper grain across entire page
    - **Watercolor Gradients**: Multi-stop color gradients on badges and cards with breathing animation (15-20s cycles) creates living color that subtly shifts
    - **Prismatic Glass Effects**: Rainbow chromatic aberration shadows on cards (0.04 peak opacity) with 0.4s hover animation for crystal-like depth
    - **Vintage Stamp Badges**: Postal stamp aesthetic with -0.8deg rotation, perforated edges, cross-hatch texture, and worn ink shadows
    - **Animated Sun Rays**: Three slow-drifting light beams (35-40s cycles, 0.18 peak opacity) in hero section for atmospheric warmth
- **Animations**: GSAP with ScrollTrigger for scroll-triggered timeline reveals. Fade-in and slide-up animations on timeline steps, sequential line drawing, and bounce effect on result card. Glassmorphic floating calculator CTA. All decorative animations respect `prefers-reduced-motion` accessibility preferences.

**Technical Implementations & Feature Specifications:**
- **Hero Section**: Features "Your Fullstack Sales Unit" as the main heading with red tagline "starring two BDRs, dedicated to finding, and selling your customers." Problem section uses "Building a Sales Team is expensive" messaging.
- **Cinematic Bridge Animation**: Sophisticated scroll-triggered animation sequence featuring:
  - Theatre-mode effects (progressive vignette + spotlight) for dramatic focus
  - Text transition: "You need more than another salesperson" fades out while "You need a system" scales up in red
  - Canvas-based particle disintegration effect: particles spawn from visible text after 2.5s delay, fall gracefully like leaves with gentle gravity (0.08), horizontal sway, and air resistance for 6-9 seconds
  - Particles render at z-index 0 while "Your Fullstack Sales Unit" section has z-index 10, creating the visual effect of particles falling BEHIND the next section
  - Red minimalist bouncing arrow (z-index 9999) appears after particles settle (5s)
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

## Light & Dark Mode Gradient System (November 2025)
Comprehensive WCAG AA-compliant gradient system with performance-tiered effects:

**Gradient System:**
- **WCAG AA Compliance**: All gradient colors achieve 4.5:1+ contrast ratios
- **Light Mode Palette**: Full spectrum - Coral (0 70% 45%) → Pink (330 60% 48%) → Magenta (300 50% 46%) → Purple (252 50% 46%) → Blue (210 50% 48%)
- **Dark Mode Palette**: Warm reds only - Pure Red Coral (0 85% 58%) → Crimson (350 82% 60%) → Rose (340 78% 58%) → Warm Pink (330 70% 58%)
- **Progressive Enhancement**: @supports detection for gradient capabilities with solid color fallbacks outside @supports block for legacy browser support
- **Theme-Specific Gradients**: Both light and dark modes now feature gradient text with appropriate color ranges for each theme

**Performance Tier System:**
- **3-Tier Detection**: Automatic device capability assessment on page load
  - Tier 1 (Low): Basic solid colors, minimal effects
  - Tier 2 (Medium): Grid patterns, basic shadows, simple animations
  - Tier 3 (High): Full gradient meshes, multi-layer shadows, complex animations
- **Non-Deprecated APIs**: Uses modern performance detection without battery API
- **Dynamic Class Application**: Performance tier classes on html element for CSS activation

**Multi-Layer Shadow System:**
- **4-Layer Depth**: Ambient (soft spread) + Key (directional) + Fill (opposite) + Rim (edge highlight)
- **Adjustable Intensities**: CSS variables for contextual shadow strength
- **Performance Conscious**: Shadow complexity scales with device tier

**Technical Grid Patterns:**
- **Dot Grid**: Subtle radial gradient pattern for technical aesthetic (Tier 2+)
- **Isometric Grid**: 30-degree diagonal lines for depth perception (Tier 2+)
- **Performance Gated**: Only renders on capable devices

**Accessibility Features:**
- **prefers-reduced-motion**: Disables all animations, shows static gradients
- **prefers-contrast**: Increases shadow intensities and border strengths
- **forced-colors**: Windows high contrast mode support with semantic colors
- **Keyboard Navigation**: Gradient-aware focus states with proper outlines

**Theme Transition System:**
- **Smooth Transitions**: 300ms fade between themes without layout shifts
- **Scoped Selectors**: Performance-optimized transition targets (no * selector)
- **Gradient Mesh Fading**: Visual effects fade during theme switch

**Implementation Details:**
- All gradient text properly scoped to light mode only
- Performance tier classes on documentElement (html) for CSS activation
- CSS variables properly initialized in :root
- No gradient persistence in dark mode (shows solid red instead)
- Context-aware gradient intensities (hero, card, button, subtle)

## SEO Optimizations (November 2025)
Comprehensive technical SEO enhancements to conquer Google search results:

**Technical Foundation:**
- **robots.txt**: Proper crawl directives for search engines (allows all crawling, sitemap reference)
- **sitemap.xml**: All 11 pages with priorities (1.0-0.5) and change frequencies (weekly/monthly)
- **Favicons**: Professional icon set (favicon.png, apple-touch-icon.png) for brand recognition
- **Canonical URLs**: Prevents duplicate content penalties across all pages

**Meta Tags & Social Sharing:**
- **react-helmet-async Integration**: Centralized SPA meta tag management system (client/src/components/SEO.tsx)
- **Page-Specific SEO**: All 11 pages have unique, optimized titles and descriptions managed dynamically
- **Open Graph Tags**: Complete Facebook sharing optimization (title, description, image, type, locale) per page
- **Twitter Card Tags**: Enhanced Twitter/X sharing with summary_large_image format per page
- **Theme Color**: Brand-specific theme color (#dc2626) for mobile browsers
- **Canonical URLs**: Dynamic canonical URLs that update per page to prevent duplicate content penalties
- **Meta Tag Architecture**: Static meta tags removed from index.html to eliminate conflicts; all dynamic tags managed via Helmet

**Structured Data (JSON-LD):**
- **Organization Schema**: Company information, logo, contact points, social profiles (global in index.html)
- **WebSite Schema**: Site-wide search functionality markup (global in index.html)
- **Service Schema**: GTM Engine service offering on homepage (client/src/components/ServiceSchema.tsx)
- **FAQ Schema Component**: Reusable component for FAQ pages (client/src/components/FAQSchema.tsx)
- **Article Schema Component**: Reusable component for blog posts (client/src/components/ArticleSchema.tsx)
- **BreadcrumbList Schema**: Automatic per-page breadcrumb navigation (injected dynamically)

**Performance Optimizations:**
- **Video Loading**: Lazy loading with preload="none" for hero video (saves bandwidth)
- **Build Configuration**: Optimized Vite production build with code splitting and minification
- **Core Web Vitals**: Optimized for LCP < 2.5s, INP < 200ms, CLS < 0.1

**UX & Accessibility Enhancements:**
- **Breadcrumbs Component**: Schema.org-compliant navigation with automatic cleanup (client/src/components/Breadcrumbs.tsx)
- **SEO-Friendly 404 Page**: Helpful navigation, CTA, and proper metadata restoration on exit
- **Skip-to-Content Link**: Keyboard accessibility (visible on Tab focus)
- **ARIA Landmarks**: Semantic landmarks (main, navigation, contentinfo) for screen readers
- **WCAG AA Compliance**: Meets accessibility standards for color contrast and keyboard navigation

**Critical Features:**
- 404 page metadata cleanup prevents SEO regression when users navigate away
- Breadcrumbs automatically inject/cleanup structured data per route
- All decorative animations respect prefers-reduced-motion
- Centralized meta tag management ready for future scaling

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