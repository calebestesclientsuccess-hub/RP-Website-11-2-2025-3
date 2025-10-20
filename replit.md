# Revenue Party - GTM Systems Website

## Overview
Revenue Party is a sophisticated marketing website for a Go-to-Market (GTM) consultancy that deploys complete revenue generation systems. The site features dark mode design, GSAP animations, interactive calculators, and gear visualizations to showcase the "Fully Loaded BDR Pod" service.

## Project Structure

### Frontend (React + Vite + Tailwind CSS)
- **Pages**:
  - `/` - Home page with hero, problems, solutions, gear system, and process
  - `/services` - Services page detailing the BDR Pod components and comparison
  - `/methodology` - Methodology page explaining the GTM approach
  - `/about` - About page with company mission and values
  - `/roi-calculator` - Comprehensive ROI calculator with email capture

- **Components**:
  - `Navbar.tsx` - Fixed navigation with theme toggle
  - `Footer.tsx` - Site footer with links
  - `ThemeProvider.tsx` - Dark/light theme management
  - `MiniCalculator.tsx` - Hero section calculator widget
  - `GearSystem.tsx` - Interactive gear visualization with hover popups

### Backend (Express.js + In-Memory Storage)
- Email capture for ROI calculator results
- In-memory storage for initial setup (can be extended to PostgreSQL)

### Design System
- **Colors**:
  - Primary Red: #ef233c (CTAs, emphasis)
  - Purple: #9F8FFF (secondary accent)
  - Purple Dark: #42349c (tertiary accent)
  - Indigo: #2e294e (tech/data elements)
  
- **Typography**:
  - Headings: Inter (bold weights)
  - Body: Inter (regular)
  - Monospace: JetBrains Mono (numbers, data)

- **Animations**:
  - Glow pulse effects on gear systems
  - Rotating gear animations
  - Fade-up scroll animations
  - Glassmorphic hover popups

## Key Features

### Interactive ROI Calculator
- User inputs: ACV, close rate, sales cycle, quota
- Real-time calculations comparing in-house hire vs. RevParty Pod
- Email capture functionality for lead generation
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

### Design Excellence
- Dark mode first with light mode toggle
- Subtle glow effects using CSS animations
- Smooth transitions and hover states
- Proper accessibility (ARIA labels, keyboard navigation)
- Prefers-reduced-motion support

## Recent Changes
- Configured dark mode design system with Revenue Party brand colors
- Created comprehensive page layouts for all routes
- Implemented interactive calculators with real-time calculations
- Added theme provider for dark/light mode toggle
- Set up proper routing with wouter
- Added glassmorphic popups and glow animations
- Implemented accessibility features

## Tech Stack
- React 18 with Vite
- Tailwind CSS for styling
- Wouter for routing
- React Query for data fetching (future backend integration)
- Shadcn UI components
- GSAP for advanced animations (ready for ScrollTrigger)
- Express.js backend

## User Preferences
- Dark mode is the default theme
- Professional, sophisticated design aesthetic
- Focus on B2B SaaS audience (founders, GTM leaders)
- Emphasis on data-driven decision making
- Clean, modern typography with strong hierarchy

## Next Steps
1. Connect email capture form to backend API
2. Implement GSAP ScrollTrigger for advanced gear animations
3. Add email delivery functionality for ROI calculator results
4. Consider PostgreSQL integration for data persistence
5. Add analytics tracking for calculator usage
