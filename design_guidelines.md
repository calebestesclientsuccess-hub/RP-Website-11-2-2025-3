- #### Button Hierarchy System

  | Level | Button Variant | Token Mapping | Typical Use |
  | --- | --- | --- | --- |
  | Primary | `primary` / `default` | `--cta-primary-bg`, `--cta-primary-text`, `--cta-primary-border` | Conversion-driving CTAs (`Schedule Audit`, `Calculate Savings`) in hero sections and calculator finales. |
  | Secondary | `secondary` | `--cta-secondary-bg`, `--cta-secondary-text`, `--cta-secondary-border` | Companion actions (lead magnets, assessments) that still need prominence but are not the success metric. |
  | Tertiary | `tertiary` | `--cta-tertiary-*` (purple) | Contextual CTAs inside cards, value-added resources, or supporting links on dark surfaces. |
  | Utility | `outline`, `ghost`, `link` | Inherit surface colors / `--button-outline` | Administrative or inline actions (dismiss, filter, back). |

  All primary/secondary buttons automatically receive a `data-priority` attribute so analytics can track funnel interactions. Only one primary button should exist per view; demote extras to secondary or tertiary variants to maintain hierarchy.
# Revenue Party Design Guidelines

## Design Approach

**Selected Approach:** Custom Dark Blueprint Aesthetic - A sophisticated, professional design combining industrial blueprint aesthetics with modern SaaS polish. Think technical precision meets high-end B2B consulting.

**Design Philosophy:** Dark-first design with technical credibility, engineered precision, and strategic sophistication. The aesthetic communicates "we engineer revenue systems" through visual metaphors of machinery, precision, and systematic operation.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: `#0A0A0A` (near-black)
- Surface: `#1a1a1a` to `#262626` (layered surfaces)
- Primary Accent (Red/Energy): `#ef233c` - Use for CTAs, active states, critical metrics
- Secondary Accent (Purple/Intelligence): `#9F8FFF` and `#42349c` - Use for Strategy pillar, secondary CTAs
- Tertiary Accent (Indigo/Technology): `#2e294e` - Use for Technology pillar, data visualizations
- Text Primary: `#FFFFFF` (headings, emphasis)
- Text Secondary: `#d4d4d8` (body copy, descriptions)
- Text Tertiary: `#a1a1aa` (labels, meta information)

**Light Mode (Toggle Available):**
- Background Base: `#FAFAFA`
- Surface: `#FFFFFF` with subtle borders
- Maintain same accent colors for consistency
- Text inverted appropriately

**Glow Effects:** Apply subtle neon glows using accent colors on interactive elements (buttons, gear systems, hover states) with `box-shadow` and `filter: drop-shadow()`

### B. Typography

**Font Families:**
- Primary (Headings): Manrope or Inter, weight 700-800, for H1-H3
- Secondary (Body): Inter, weight 400-500, for all body text
- Monospace (Data/Metrics): JetBrains Mono or similar for calculator outputs, numbers

**Scale & Hierarchy:**
- H1 (Hero): `text-5xl md:text-6xl lg:text-7xl` (clamp 2.5rem to 4.5rem)
- H2 (Section): `text-3xl md:text-4xl lg:text-5xl`
- H3 (Subsection): `text-2xl md:text-3xl`
- Body: `text-base md:text-lg` (16-18px)
- Small/Meta: `text-sm` (14px)

**Line Height:** Tight for headings (1.1-1.2), comfortable for body (1.6-1.7)

### C. Layout System

**Container Strategy:**
- Max-width: `max-w-7xl` (1280px) for most content
- Hero sections: Can go full-width with inner max-w-7xl
- Padding: `px-4 md:px-6 lg:px-8` (responsive gutters)

**Spacing Units (Tailwind):**
- Primary rhythm: 4, 8, 12, 16, 20, 24, 32 (e.g., `p-8`, `mb-12`, `gap-16`)
- Section spacing: `py-16 md:py-24 lg:py-32`
- Component spacing: `space-y-6 md:space-y-8`

**Grid Systems:**
- Feature grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Comparison tables: `grid-cols-1 lg:grid-cols-2`
- Mobile-first: Always stack to single column on mobile

### D. Component Library

**Buttons:**
- Primary CTA (`variant="primary"` or `default`): uses the `--cta-primary-*` tokens (red fill, white text, subtle drop shadow). Large buttons default to `px-8 py-4`; default size is `px-4 py-3`. This is the only gradient-free marketing CTA and should live on the far right of button groups.
- Secondary CTA (`variant="secondary"`): inverts the palette (white/near-white fill, red text/border via `--cta-secondary-*`). Use this for "learn more" or lead magnet actions placed next to a primary. Never stack more than one secondary in a row—convert additional options to tertiary/outline.
- Tertiary & utility buttons: `variant="tertiary"` leans on the purple community token, `outline` exposes the parent surface, `ghost`/`link` are reserved for inline actions. These are the “lesser buttons” mentioned in the spec and should only follow a primary or secondary CTA within the same container.
- Iconography: Leading icons are allowed on secondary/tertiary buttons; trailing icons (arrows) are reserved for primary CTAs. Keep icon size at `1rem (16px)` and maintain an `8px` gap to text.
- States: Hover and active states are handled inside `Button` via brightness/alpha adjustments plus `hover-elevate` micro-movement. Do not add ad-hoc gradients, shimmer animations, or custom transforms to CTAs—extend the component instead.
- QA checklist: after edits, manually spot-check the Hero CTA pair on `Home`, the ROI Calculator toast CTA, the floating calculator button, and any section using `CTASection`. Confirm focus rings are visible, hover states darken correctly in both light/dark themes, and that `data-priority` attributes exist on primary/secondary buttons for analytics hooks.

**Cards:**
- Dark cards: bg-zinc-900/50, border border-zinc-800, rounded-xl
- Glassmorphism: For gear popups - `backdrop-blur-lg bg-white/10 border border-white/20`
- Hover state: Lift with `hover:translate-y-[-4px] transition-transform`

**Forms/Inputs:**
- Dark inputs: bg-zinc-900, border-zinc-700, focus:border-accent color
- Slider inputs: Custom styled with accent color tracks
- Tooltips: Small info icons with hover popups explaining fields

**Navigation:**
- Fixed navbar: Dark bg with blur backdrop, border-b border-zinc-800
- Logo on left, navigation center, CTA + theme toggle right
- Mobile: Hamburger menu with full-screen overlay

**Interactive Gear System:**
- Central "Culture" core with pulsing glow animation
- Three orbital systems (People/Red, Strategy/Purple, Technology/Indigo)
- Each gear rotates continuously at different speeds
- Hover reveals glassmorphic popup with description
- Mobile: Vertical stacking reveal animation

### E. Animations

**GSAP ScrollTrigger Implementation:**
- Pin gear visualization container during 6-scene narrative
- Smooth progressive reveals for stats and features
- Parallax effects on hero backgrounds (subtle, 0.3-0.5 factor)

**Performance Guidelines:**
- GPU-accelerated: Use `transform` and `opacity` only
- 60fps target: `will-change` on animated elements
- Prefers-reduced-motion: Disable complex animations, keep essential transitions

**Specific Effects:**
- Fade-up on scroll: Elements start `opacity-0 translate-y-8`, animate to visible
- Number counters: Animate from 0 to target value on scroll into view
- Gear rotation: Continuous CSS `animation` with different speeds per gear
- Glow pulses: Subtle keyframe animation on core elements

## Images

**Hero Section:**
- No large hero image - instead feature the interactive mini-calculator prominently
- Use abstract geometric patterns or subtle grid overlays in background
- Focus on typography and calculator interaction

**Throughout Site:**
- Logo: White version on dark, dark version on light (rev-white_*.png provided)
- Icons: Use SVG icon library (Heroicons preferred) for features, process steps
- Abstract visualizations: Gear systems, data flow diagrams (GSAP/SVG)
- NO photography - maintain technical, blueprint aesthetic throughout

## Specialized Components

**ROI Calculator:**
- Professional financial tool aesthetic
- Two-column layout: Inputs left, outputs right
- Real-time calculation updates
- Comparison table: In-House vs. RevParty Pod
- Tooltips on all inputs with methodology explanations
- Email results: Form modal with branding

**Mini Calculator (Hero):**
- Inline sliders with live value display
- Bold, large output showing "Potential New Revenue: $X,XXX,XXX"
- Prominent positioning above or alongside primary CTA

**Process Diagrams:**
- Three-step visual with connecting arrows
- Cards showing duration, description for each phase
- Use accent colors to differentiate phases

## Accessibility & Performance

- Keyboard navigation: All interactive elements reachable via Tab
- ARIA labels: Especially for gear system, calculators, complex interactions
- Focus states: Visible outline in accent color (2px offset)
- Reduced motion: Disable ScrollTrigger animations, maintain basic transitions
- Lighthouse 90+: Optimize images, lazy load, minimize bundle, use CDN fonts