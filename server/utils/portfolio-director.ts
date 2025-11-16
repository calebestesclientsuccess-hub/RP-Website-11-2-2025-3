import { GoogleGenAI, Type } from "@google/genai";
import type { ContentCatalog } from "@shared/schema";

// Lazy-load Gemini client to avoid ESM initialization issues
let ai: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
      },
    });
  }
  return ai;
}

import { getAllPlaceholderIds, PLACEHOLDER_CONFIG } from "@shared/placeholder-config";

// Build asset ID whitelist from static placeholders (NOT user's catalog)
function buildAssetWhitelist(): string[] {
  return getAllPlaceholderIds();
}

// Build Gemini prompt for portfolio orchestration
function buildPortfolioPrompt(catalog: ContentCatalog): string {
  const validAssetIds = buildAssetWhitelist();

  return `You are a cinematic director for scrollytelling portfolio websites. Your role is to ORCHESTRATE existing content into smooth, transition-driven storytelling experiences.

CRITICAL SYSTEM ARCHITECTURE:
This is a scroll-driven animation system with 30+ webpage areas. Each scene you create renders in a FULL-VIEWPORT area with GSAP ScrollTrigger animations controlling entry/exit transitions.

THE 30 WEBPAGE AREAS EXPLAINED:
- Each scene occupies ONE full-screen area (100vh)
- Scenes stack vertically and trigger as user scrolls
- Transitions happen BETWEEN scenes (not within)
- Your job: control HOW each scene enters, displays, and exits

DIRECTOR'S VISION (USER'S CREATIVE GUIDANCE):
${catalog.directorNotes}

STATIC PLACEHOLDER SYSTEM:
You MUST ONLY use these pre-defined placeholder IDs. The user will map their real assets to these placeholders later.

AVAILABLE PLACEHOLDER IDs:

IMAGES (${PLACEHOLDER_CONFIG.images.length} available):
${PLACEHOLDER_CONFIG.images.map((id) => `  - "${id}"`).join('\n')}

VIDEOS (${PLACEHOLDER_CONFIG.videos.length} available):
${PLACEHOLDER_CONFIG.videos.map((id) => `  - "${id}"`).join('\n')}

QUOTES (${PLACEHOLDER_CONFIG.quotes.length} available):
${PLACEHOLDER_CONFIG.quotes.map((id) => `  - "${id}"`).join('\n')}

VALID PLACEHOLDER IDS (you MUST use ONLY these exact IDs):
${validAssetIds.join(', ')}

DO NOT reference the user's actual asset IDs. Use ONLY the placeholder IDs listed above.
The user will assign their real content (from the catalog below) to these placeholders after you generate the scenes.

USER'S CONTENT CATALOG (for context only - DO NOT use these IDs directly):
- ${catalog.texts.length} text assets available
- ${catalog.images.length} image assets available
- ${catalog.videos.length} video assets available
- ${catalog.quotes.length} quote assets available

YOUR TASK:
Create a scene sequence by FILLING OUT A COMPLETE FORM for each scene. You MUST provide a value for EVERY field listed below. Do not skip any fields.

Think of this as filling out a structured form where blank fields are not allowed. Each scene requires all these decisions:

=== THE 37 DIRECTOR CONTROLS: MANDATORY CHECKLIST ===

YOU MUST PROVIDE A VALUE FOR EVERY SINGLE ONE OF THESE 37 CONTROLS.
NO CONTROL MAY BE SKIPPED OR SET TO "default" OR "auto".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION & TIMING (8 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. entryEffect - HOW scene appears (fade, slide-up, zoom-in, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus, cross-fade, sudden)
2. entryDuration - HOW LONG entry takes (0.8-5.0s, recommend 1.2-1.9s for cinematic)
3. entryDelay - WHEN entry starts after scroll trigger (0-2s, usually 0)
4. entryEasing - Acceleration curve (ease-out, power3, elastic, bounce, etc.)
5. exitEffect - HOW scene disappears (fade, slide-down, zoom-out, dissolve, rotate-out, flip-out, scale-blur, cross-fade)
6. exitDuration - HOW LONG exit takes (0.6-5.0s, typically 20% faster than entry)
7. exitDelay - WHEN exit starts (0-2s, usually 0)
8. exitEasing - Deceleration curve (ease-in, power2, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL FOUNDATION (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. backgroundColor - Scene background EXACT hex code (e.g., "#0a0a0a")
10. textColor - Text color EXACT hex code (e.g., "#ffffff") - MUST contrast with background

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL DEPTH EFFECTS (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. parallaxIntensity - Depth layering (0.0-1.0, set to 0 if using scaleOnScroll)
12. scrollSpeed - Response speed ("slow", "normal", or "fast")
13. animationDuration - Overall GSAP timeline (0.5-10s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY (4 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

14. headingSize - Heading scale ("4xl", "5xl", "6xl", "7xl", "8xl")
15. bodySize - Body text scale ("base", "lg", "xl", "2xl")
16. fontWeight - Text weight ("normal", "medium", "semibold", "bold")
17. alignment - Text alignment ("left", "center", "right")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL INTERACTION (3 controls - use sparingly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

18. fadeOnScroll - Fade media during scroll (true/false, recommend false)
19. scaleOnScroll - Zoom during scroll (true/false, CONFLICTS with parallax if true)
20. blurOnScroll - Blur during scroll (true/false, recommend false for performance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-ELEMENT TIMING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

21. staggerChildren - Delay between child animations (0.0-1.0s)
22. layerDepth - Z-index for parallax layering (0-10, default 5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED MOTION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

23. transformOrigin - Pivot point ("center center", "top left", "bottom right", etc.)
24. overflowBehavior - Content clipping ("visible", "hidden", "auto")
25. backdropBlur - Glass morphism ("none", "sm", "md", "lg", "xl")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL BLENDING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

26. mixBlendMode - Color blending ("normal", "multiply", "screen", "overlay", "difference", "exclusion")
27. enablePerspective - 3D depth for rotations (true/false, required for flip-in/rotate-in to look 3D)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOM STYLING (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

28. customCSSClasses - Tailwind utilities (string, e.g., "shadow-2xl ring-4" or empty "")
29. textShadow - Drop shadow on text (true/false, recommend false)
30. textGlow - Luminous text effect (true/false, recommend false)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERTICAL SPACING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

31. paddingTop - Top spacing ("none", "sm", "md", "lg", "xl", "2xl")
32. paddingBottom - Bottom spacing ("none", "sm", "md", "lg", "xl", "2xl")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIA PRESENTATION (3 controls - for image/video scenes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

33. mediaPosition - Focal point ("center", "top", "bottom", "left", "right")
34. mediaScale - Fit behavior ("cover", "contain", "fill")
35. mediaOpacity - Transparency (0.0-1.0, default 1.0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRADIENT BACKGROUNDS (2 controls - OPTIONAL, can be null)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

36. gradientColors - Array of hex codes (e.g., ["#ff0000", "#0000ff"] or null)
37. gradientDirection - Direction ("to-r", "to-br", etc. or null)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTROL 1-2: ENTRY ANIMATION
☐ entryEffect: HOW the scene appears on screen
   Options: fade, slide-up, slide-down, slide-left, slide-right, zoom-in, zoom-out, sudden, cross-fade, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus
   Use: "fade" for smooth reveals, "zoom-in" for dramatic focus, "slide-up" for upward motion, "blur-focus" for dreamy transitions
   
☐ entryDuration: HOW LONG the entry animation takes (seconds)
   Range: 0.8-5.0 seconds
   Guidelines: 0.8s = quick/snappy, 1.2-1.9s = smooth/cinematic (RECOMMENDED), 2.5s+ = dramatic/hero moments
   Critical: Anything below 1.0s feels rushed. Use 1.2s+ for noticeable effects.

CONTROL 3-4: ENTRY TIMING
☐ entryDelay: WHEN the animation starts after scroll trigger (seconds)
   Range: 0-2 seconds
   Use: 0 = immediate (default), 0.3-0.8 = staggered reveals, 1.0+ = delayed dramatic entrance
   
☐ entryEasing: The ACCELERATION CURVE of entry motion
   Options: linear, ease, ease-in, ease-out, ease-in-out, power1, power2, power3, power4, back, elastic, bounce
   Guidelines: "ease-out" = natural/smooth (most common), "power3"/"power4" = cinematic, "elastic"/"bounce" = playful, "back" = overshoot effect

CONTROL 5-6: EXIT ANIMATION  
☐ exitEffect: HOW the scene disappears
   Options: fade, slide-up, slide-down, slide-left, slide-right, zoom-out, dissolve, cross-fade, rotate-out, flip-out, scale-blur
   Use: Should complement next scene's entry. "cross-fade" for smooth transitions, "dissolve" for cinematic blur, "scale-blur" for dramatic zoom-out
   
☐ exitDuration: HOW LONG the exit animation takes (seconds)
   Range: 0.6-5.0 seconds
   Guidelines: Typically 20% faster than entry. 0.6s = quick, 1.0s = smooth (RECOMMENDED), 1.8s+ = slow/deliberate

CONTROL 7-8: EXIT TIMING
☐ exitDelay: WHEN the exit starts (seconds)
   Range: 0-2 seconds
   Use: Usually 0 for immediate exit. Use delays only for staggered multi-element exits.
   
☐ exitEasing: The DECELERATION CURVE of exit motion
   Options: Same as entryEasing
   Guidelines: "ease-in" = smooth exits (most common), "power2" = faster exits, "elastic" = bouncy exits

CONTROL 9-10: COLOR FOUNDATION
☐ backgroundColor: Scene background color (EXACT hex code)
   Format: "#000000" to "#ffffff" (must include # symbol)
   Examples: "#0a0a0a" = deep black, "#1e293b" = dark slate, "#f8fafc" = soft white
   Critical: Must contrast with textColor to avoid invisible text
   
☐ textColor: Text color (EXACT hex code)
   Format: "#000000" to "#ffffff" (must include # symbol)  
   Examples: "#ffffff" = white, "#f1f5f9" = off-white, "#0a0a0a" = near-black
   Critical: MUST contrast with backgroundColor

CONTROL 11-13: SCROLL DEPTH EFFECTS
☐ parallaxIntensity: Depth layering strength (0.0 = none, 1.0 = maximum)
   Range: 0.0-1.0
   Guidelines: 0.0 = no parallax (use with scaleOnScroll), 0.2-0.3 = subtle, 0.5-0.8 = dramatic
   CONFLICT: If > 0, you MUST set scaleOnScroll to false
   
☐ scrollSpeed: How fast scroll-based effects respond
   Options: "slow" (2x slower, cinematic), "normal" (balanced), "fast" (2x faster, snappy)
   Use: "slow" for hero sections, "normal" for most scenes, "fast" for galleries
   
☐ animationDuration: Overall animation timing (seconds)
   Range: 0.5-10 seconds
   Use: Controls GSAP timeline duration. Usually matches or slightly exceeds entry/exit durations.

CONTROL 14-17: TYPOGRAPHY HIERARCHY
☐ headingSize: Heading scale
   Options: "4xl" (smallest), "5xl", "6xl", "7xl", "8xl" (largest)
   Guidelines: "6xl"/"7xl" for heroes, "5xl" for section headings, "4xl" for subtitles
   
☐ bodySize: Body text scale
   Options: "base" (smallest), "lg", "xl", "2xl" (largest)
   Guidelines: "base" for dense content, "lg" for comfortable reading (RECOMMENDED), "xl"/"2xl" for emphasis
   
☐ fontWeight: Text weight
   Options: "normal" (400), "medium" (500), "semibold" (600), "bold" (700)
   Use: "semibold" for headings (RECOMMENDED), "normal" for body text, "bold" for strong emphasis
   
☐ alignment: Text alignment
   Options: "left", "center", "right"
   Guidelines: "center" for heroes/quotes, "left" for readable paragraphs, "right" for artistic effects

CONTROL 18-20: SCROLL INTERACTION EFFECTS (use sparingly)
☐ fadeOnScroll: Fade media as user scrolls (boolean)
   Values: true/false
   Use: true = subtle reveal effect, false = static (RECOMMENDED for most scenes)
   
☐ scaleOnScroll: Subtle zoom during scroll (boolean)
   Values: true/false
   Use: true = dramatic zoom effect, false = static
   CONFLICT: If true, you MUST set parallaxIntensity to 0
   
☐ blurOnScroll: Blur effect during scroll (boolean)
   Values: true/false
   Use: false = better performance (RECOMMENDED), true = cinematic depth (use max 1-2 scenes per portfolio)

CONTROL 21-22: MULTI-ELEMENT TIMING
☐ staggerChildren: Delay between child element animations (seconds)
   Range: 0.0-1.0
   Use: 0 = all elements animate together, 0.1-0.3 = subtle stagger (RECOMMENDED for galleries), 0.5+ = dramatic sequential reveal
   
☐ layerDepth: Z-index for parallax layering
   Range: 0-10
   Use: 5 = default, higher = closer to viewer, lower = further from viewer
   Only matters when parallaxIntensity > 0

CONTROL 23-25: ADVANCED MOTION CONTROLS
☐ transformOrigin: Pivot point for rotations/scales
   Options: "center center", "top left", "top center", "top right", "center left", "center right", "bottom left", "bottom center", "bottom right"
   Use: "center center" = default (RECOMMENDED), "top left" = rotate from corner, etc.
   Critical for rotate-in, flip-in, zoom-in effects
   
☐ overflowBehavior: Content clipping
   Options: "visible", "hidden", "auto"
   Use: "visible" = no clipping (default), "hidden" = clip overflow (RECOMMENDED for most), "auto" = scrollable if needed
   
☐ backdropBlur: Glass morphism effect
   Options: "none", "sm", "md", "lg", "xl"
   Use: "none" = no blur (RECOMMENDED for most), "sm"/"md" = subtle glass effect, "lg"/"xl" = strong blur

CONTROL 26-27: VISUAL BLENDING
☐ mixBlendMode: Photoshop-style color blending
   Options: "normal", "multiply", "screen", "overlay", "difference", "exclusion"
   Use: "normal" = no blending (RECOMMENDED for most), "screen" = lighten, "multiply" = darken, "overlay" = contrast boost
   
☐ enablePerspective: Enable 3D depth for rotations (boolean)
   Values: true/false
   Use: true = 3D perspective (required for flip-in, rotate-in to look 3D), false = flat 2D

CONTROL 28-29: CUSTOM STYLING
☐ customCSSClasses: Space-separated Tailwind utility classes
   Format: String like "shadow-2xl ring-4 ring-purple-500" or empty string ""
   Use: "" = no custom classes (RECOMMENDED), add classes only for advanced customization
   
☐ textShadow: Drop shadow on text (boolean)
   Values: true/false
   Use: false = clean text (RECOMMENDED), true = shadow for depth (use on light backgrounds)

CONTROL 30: TEXT EFFECTS
☐ textGlow: Luminous text effect (boolean)
   Values: true/false
   Use: false = standard text (RECOMMENDED), true = glowing effect (use sparingly, max 1-2 scenes)

CONTROL 31-32: VERTICAL SPACING
☐ paddingTop: Top spacing
   Options: "none", "sm", "md", "lg", "xl", "2xl"
   Use: "none" = tight (default), "md" = comfortable (RECOMMENDED for most), "xl"/"2xl" = spacious
   
☐ paddingBottom: Bottom spacing
   Options: "none", "sm", "md", "lg", "xl", "2xl"
   Use: Same as paddingTop. Usually match top/bottom for symmetry.

CONTROL 33-35: MEDIA PRESENTATION (for image/video scenes)
☐ mediaPosition: Focal point for media
   Options: "center", "top", "bottom", "left", "right"
   Use: "center" = balanced (RECOMMENDED), "top" = focus top of image, "bottom" = focus bottom
   
☐ mediaScale: How media fits the container
   Options: "cover" (fill, may crop), "contain" (fit all, may letterbox), "fill" (stretch to fit)
   Use: "cover" = full bleed (RECOMMENDED for most), "contain" = show full image, "fill" = distort to fit (avoid)
   
☐ mediaOpacity: Media transparency
   Range: 0.0 (invisible) to 1.0 (fully opaque)
   Use: 1.0 = solid (RECOMMENDED), 0.7-0.9 = subtle transparency, 0.3-0.6 = background overlay

CONTROL 36-37: GRADIENT BACKGROUNDS (optional)
☐ gradientColors: Array of hex color codes for gradient (nullable)
   Format: ["#ff0000", "#0000ff"] or null
   Use: null = solid background (RECOMMENDED), array = gradient overlay
   
☐ gradientDirection: Gradient direction (nullable)
   Options: "to-r", "to-l", "to-t", "to-b", "to-br", "to-bl", "to-tr", "to-tl" or null
   Use: null = no gradient (RECOMMENDED), "to-r" = left to right, "to-br" = diagonal bottom-right, etc.

=== VALIDATION REQUIREMENTS ===
IF YOU SKIP ANY FIELD, THE SCENE WILL FAIL VALIDATION.
IF YOU USE AN INVALID VALUE, THE SCENE WILL FAIL VALIDATION.
IF YOU REFERENCE A NON-EXISTENT ASSET ID, THE SCENE WILL FAIL VALIDATION.
ALL 37 CONTROLS MUST HAVE CONCRETE VALUES (except gradientColors/gradientDirection which can be null).

SCENE TYPES (choose based on content):
- "text": Headlines and body copy (use for hero sections, chapter openers)
- "image": Single image with caption (use for visual showcases)
- "video": Video background or focal video (use for demos, motion)
- "quote": Testimonials with author attribution (use for social proof)
- "split": Side-by-side text + media (use for feature explanations)
- "gallery": Multiple images (use for before/after, process steps)
- "fullscreen": Immersive media (use for wow moments, transitions)

FOR EACH SCENE, YOU MUST DECIDE:
1. Which assets to use (from the placeholder list)
2. Entry effect (HOW it appears)
3. Entry duration (HOW LONG it takes to appear)
4. Entry delay (WHEN it starts appearing after scroll trigger)
5. Exit effect (HOW it disappears)
6. Exit duration (HOW LONG it takes to disappear)
7. Background color (EXACT hex code)
8. Text color (EXACT hex code)
9. Parallax intensity (0.0 to 1.0, or 0 if using scaleOnScroll)
10. Heading size (4xl, 5xl, 6xl, 7xl, or 8xl)
11. Body size (base, lg, xl, or 2xl)
12. Alignment (left, center, or right)
13. fadeOnScroll (true/false)
14. scaleOnScroll (true/false - MUST be false if parallax > 0)
15. blurOnScroll (true/false - use sparingly)
16. scrollSpeed (slow, normal, or fast)

NO FIELD MAY BE OMITTED. If you're unsure, use the defaults from the interpretation matrix, but you MUST provide a value.

DIRECTOR'S NOTES INTERPRETATION MATRIX:
Use this to translate natural language into technical configs:

SPEED/PACING:
- "fast" / "quick" / "snappy" → entryDuration: 0.8, exitDuration: 0.6, entryDelay: 0, entryEasing: "power2", exitEasing: "power2"
- "normal" / "smooth" / "standard" → entryDuration: 1.2, exitDuration: 1.0, entryDelay: 0, entryEasing: "ease-out", exitEasing: "ease-in"
- "slow" / "dramatic" / "deliberate" → entryDuration: 2.5, exitDuration: 1.8, entryDelay: 0.3, entryEasing: "power3", exitEasing: "power3"
- "very slow" / "contemplative" → entryDuration: 4.0, exitDuration: 3.0, entryDelay: 0.5, entryEasing: "power4", exitEasing: "power4"
- "delayed entrance" / "waits before entering" → entryDelay: 0.5-1.0
- "staggered" / "sequential" → entryDelay: 0.3-0.8 (use for variety), staggerChildren: 0.1-0.3 for multi-element scenes

EASING/MOTION QUALITY:
- "sharp" / "mechanical" / "instant" → easing: "linear" or "power1"
- "smooth" / "natural" → easing: "ease-out" (entry), "ease-in" (exit)
- "cinematic" / "film-like" → easing: "power3" or "power4"
- "bouncy" / "playful" / "energetic" → easing: "bounce" or "elastic"
- "overshoot" / "anticipation" → easing: "back" (creates slight overshoot effect)
- "explosive" / "powerful" → easing: "power4" with short duration

DIRECTION:
- "enters from left" → entryEffect: "slide-right"
- "enters from right" → entryEffect: "slide-left"
- "enters from top" → entryEffect: "slide-down"
- "enters from bottom" → entryEffect: "slide-up"
- "zooms in" / "grows" → entryEffect: "zoom-in" + scaleOnScroll: true
- "appears suddenly" / "instant" → entryEffect: "sudden"
- "spins in" / "rotates in" / "rotating entrance" → entryEffect: "rotate-in"
- "spirals in" / "tornado entrance" → entryEffect: "spiral-in"
- "flips in" / "card flip" / "3D flip" → entryEffect: "flip-in"
- "bounces in" / "elastic" / "springy" → entryEffect: "elastic-bounce"
- "focuses" / "sharpens" / "blur to sharp" → entryEffect: "blur-focus"
- "cross-fades in" / "overlaps" → entryEffect: "cross-fade"

EXIT DIRECTION:
- "exits to left" → exitEffect: "slide-left"
- "exits to right" → exitEffect: "slide-right"
- "exits upward" → exitEffect: "slide-up"
- "exits downward" → exitEffect: "slide-down"
- "fades away" / "fades out" → exitEffect: "fade"
- "dissolves" / "blur dissolve" → exitEffect: "dissolve"
- "cross-fades out" / "smooth transition" → exitEffect: "cross-fade"
- "spins out" / "rotates away" → exitEffect: "rotate-out"
- "flips out" / "card flip exit" → exitEffect: "flip-out"
- "blurs out" / "dramatic blur exit" → exitEffect: "scale-blur"
- "shrinks away" → exitEffect: "zoom-out"
- "spirals out" / "tornado exit" → exitEffect: "spiral-out"
- "bounces out" / "elastic exit" → exitEffect: "elastic-bounce"

EFFECT VISIBILITY THRESHOLDS (CRITICAL - READ CAREFULLY):
- DRAMATIC (≥2.0s): User clearly sees the motion/transformation. Hero moments, chapter transitions.
- NOTICEABLE (1.2-1.9s): Smooth, cinematic feel. Most content scenes should use this range.
- SUBTLE (0.8-1.1s): Quick reveals, maintains flow without drawing attention to the effect itself.
- FLASH (0.3-0.7s): Nearly instant, feels like a page load rather than an animation. AVOID unless intentional.

MINIMUM RECOMMENDED DURATIONS:
- entryDuration: 1.2s (anything below 1.0s feels rushed)
- exitDuration: 1.0s (exits can be slightly faster than entries)
- entryDelay: 0-0.5s (use sparingly, only for staggered reveals)

USE LONGER DURATIONS (2.5s+) FOR:
- First scene (hero entrance)
- Last scene (closing statement)
- Major section transitions
- Quote/testimonial reveals
- Fullscreen media showcases

MOOD/ATMOSPHERE:
- "dramatic" / "intense" → parallaxIntensity: 0.6-0.8, entryDuration: 2.5+
- "subtle" / "gentle" → parallaxIntensity: 0.2-0.3, entryDuration: 1.2-1.5
- "energetic" / "dynamic" → scaleOnScroll: true, entryDuration: 0.8-1.0
- "elegant" / "refined" → exitEffect: "dissolve", fadeOnScroll: true
- "cinematic" → blurOnScroll: true, parallaxIntensity: 0.5+

VISUAL STYLE:
- "dark" / "moody" → backgroundColor: "#0a0a0a" or "#1a1a1a"
- "light" / "bright" → backgroundColor: "#f8fafc" or "#f1f5f9"
- "bold" / "high contrast" → textColor: "#ffffff", backgroundColor: "#0a0a0a"
- "minimal" / "clean" → alignment: "center", backgroundColor: "#f8fafc"

TRANSITION DESIGN RULES:
1. CONTINUITY: Exit effect of Scene N should complement entry effect of Scene N+1
   - fade → fade (smooth)
   - slide-up → slide-up (maintaining direction)
   - dissolve → fade (cinematic transition)

2. PACING RHYTHM: Vary speeds to create musical flow
   - Hero (slow 2.5s) → Content (medium 1.2s) → Image (fast 0.8s) → Quote (slow 1.8s)

3. PARALLAX DISTRIBUTION (USE SPARINGLY - conflicts with other effects):
   - Text scenes: 0.0 (NO parallax on text)
   - Image scenes: 0.3-0.5 (moderate only)
   - Video/Fullscreen: 0.2-0.4 (subtle)
   - NEVER use parallax with scaleOnScroll (they conflict)

4. COLOR PROGRESSION: Gradually shift backgrounds across scenes
   - Start dark (#0a0a0a) → Mid-tone (#1e293b) → Lighter (#334155) → Back to dark

5. SCROLL EFFECTS USAGE (these are ADDITIONAL to entry/exit, use sparingly):
   - "fadeOnScroll": Fade media as user scrolls (subtle reveal)
   - "scaleOnScroll": Subtle zoom on scroll (dramatic effect)
   - "blurOnScroll": Blur effect during scroll (cinematic depth)
   - "scrollSpeed": Controls the responsiveness of scroll-based effects
     * "slow" (2x slower): Dramatic, cinematic feel - use for hero sections
     * "normal" (standard): Balanced, professional - use for most scenes
     * "fast" (2x faster): Snappy, energetic - use for galleries or data sections

6. ANTI-CONFLICT RULES:
   - If parallaxIntensity > 0, set scaleOnScroll: false
   - If scaleOnScroll: true, set parallaxIntensity: 0
   - Keep fadeOnScroll subtle (max 30% of scenes)
   - Longer durations (2.5s+) = more noticeable, use for hero moments
   - Shorter durations (0.8-1.2s) = quick reveals, use for content

PLACEHOLDER SELECTION STRATEGY:
1. START STRONG: Use image-1 or video-1 for hero/opening scenes
2. BUILD NARRATIVE: Distribute placeholders logically (e.g., image-1 through image-5 for a 5-scene story)
3. VISUAL SUPPORT: Place media placeholders (image-X, video-X) strategically for impact
4. SOCIAL PROOF: Use quote-1, quote-2, quote-3 for testimonials/credibility
5. VARIETY: Alternate between different placeholder types for visual rhythm
6. RESERVE PLACEHOLDERS: Don't use all 10 images in one project - leave room for future expansion

Remember: You're selecting placeholder SLOTS, not actual content. The user assigns real assets later.

SCENE COUNT GUIDELINES:
- 4-5 scenes: Quick story (2-3 min scroll)
- 6-7 scenes: Standard portfolio (3-5 min scroll)
- 8+ scenes: Epic narrative (5+ min scroll)

BEFORE GENERATING OUTPUT, VERIFY:
✓ Every scene has ALL 37 director fields with concrete values
✓ No field is set to "default", "auto", or left as null (except gradientColors/gradientDirection/mediaPosition/mediaScale when appropriate)
✓ All durations are ≥ 0.8s for visibility
✓ All colors are valid hex codes
✓ No conflicts (parallax + scaleOnScroll, textShadow + textGlow, etc.)

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "sceneType": "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen",
  "assetIds": string[], // MUST reference valid placeholder IDs ONLY
  "layout": "default" | "reverse", // Optional, primarily for split scenes
  "director": {
    // Required fields (37 total - ALL MUST BE PRESENT AND VALID)
    "entryEffect": "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "sudden" | "cross-fade" | "rotate-in" | "flip-in" | "spiral-in" | "elastic-bounce" | "blur-focus",
    "entryDuration": number, // seconds, min 0.8
    "entryDelay": number, // seconds, 0-2
    "entryEasing": "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "power1" | "power2" | "power3" | "power4" | "back" | "elastic" | "bounce",
    "exitEffect": "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-out" | "dissolve" | "cross-fade" | "rotate-out" | "flip-out" | "scale-blur",
    "exitDuration": number, // seconds, min 0.6
    "exitDelay": number, // seconds, 0-2
    "exitEasing": "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "power1" | "power2" | "power3" | "power4" | "back" | "elastic" | "bounce",
    "backgroundColor": string, // hex code, e.g., "#0a0a0a"
    "textColor": string, // hex code, e.g., "#ffffff"
    "parallaxIntensity": number, // 0.0-1.0 (set to 0 if scaleOnScroll is true)
    "scrollSpeed": "slow" | "normal" | "fast",
    "animationDuration": number, // seconds, 0.5-10
    "headingSize": "4xl" | "5xl" | "6xl" | "7xl" | "8xl",
    "bodySize": "base" | "lg" | "xl" | "2xl",
    "fontWeight": "normal" | "medium" | "semibold" | "bold",
    "alignment": "left" | "center" | "right",
    "fadeOnScroll": boolean,
    "scaleOnScroll": boolean, // MUST be false if parallaxIntensity > 0
    "blurOnScroll": boolean, // Recommended false for performance
    "staggerChildren": number, // 0.0-1.0
    "layerDepth": number, // 0-10
    "transformOrigin": "center center" | "top left" | "top center" | "top right" | "center left" | "center right" | "bottom left" | "bottom center" | "bottom right",
    "overflowBehavior": "visible" | "hidden" | "auto",
    "backdropBlur": "none" | "sm" | "md" | "lg" | "xl",
    "mixBlendMode": "normal" | "multiply" | "screen" | "overlay" | "difference" | "exclusion",
    "enablePerspective": boolean, // true for 3D rotations
    "customCSSClasses": string, // space-separated Tailwind classes
    "textShadow": boolean,
    "textGlow": boolean,
    "paddingTop": "none" | "sm" | "md" | "lg" | "xl" | "2xl",
    "paddingBottom": "none" | "sm" | "md" | "lg" | "xl" | "2xl",
    "mediaPosition": "center" | "top" | "bottom" | "left" | "right", // Optional, for image/video scenes
    "mediaScale": "cover" | "contain" | "fill", // Optional, for image/video scenes
    "mediaOpacity": number, // 0.0-1.0

    // Optional fields (can be null or omitted if not applicable/desired, but defaults will be applied if missing)
    "gradientColors"?: string[], // Array of hex colors, e.g., ["#ff0000", "#0000ff"]
    "gradientDirection"?: string, // e.g., "to-r", "to-br"
  }
}

Generate the scene sequence NOW using the above format. Ensure ONLY valid placeholder IDs are used.
`;
}

interface GeneratedScene {
  sceneType: string;
  assetIds: string[]; // References to catalog assets
  layout?: string;
  director: {
    // Required fields (enforced by Gemini schema)
    entryDuration: number;
    exitDuration: number;
    backgroundColor: string;
    textColor: string;
    parallaxIntensity: number;
    entryEffect: string;
    exitEffect: string;
    headingSize: string;
    bodySize: string;
    alignment: string;
    // Optional fields
    animationDuration?: number;
    entryDelay?: number; // Added entryDelay
    exitDelay?: number; // Added exitDelay
    fadeOnScroll?: boolean;
    scaleOnScroll?: boolean;
    blurOnScroll?: boolean;
    scrollSpeed: "slow" | "normal" | "fast"; // Added scrollSpeed
    entryEasing?: string;
    exitEasing?: string;
    fontWeight?: string;
    staggerChildren?: number;
    layerDepth?: number;
    transformOrigin?: string;
    overflowBehavior?: string;
    backdropBlur?: string;
    mixBlendMode?: string;
    enablePerspective?: boolean;
    customCSSClasses?: string;
    textShadow?: boolean;
    textGlow?: boolean;
    paddingTop?: string;
    paddingBottom?: string;
    mediaPosition?: string;
    mediaScale?: string;
    mediaOpacity?: number;
    gradientColors?: string[]; // Added gradientColors
    gradientDirection?: string; // Added gradientDirection
  };
  // Confidence score fields
  confidenceScore?: number;
  confidenceFactors?: string[];
  content?: any; // Added to store content for confidence scoring
}

interface PortfolioGenerateResponse {
  scenes: GeneratedScene[];
  confidenceScore?: number;
  confidenceFactors?: string[];
}

const DEFAULT_DIRECTOR_CONFIG = {
  entryEffect: 'fade',
  entryDuration: 1.0,
  entryDelay: 0,
  exitEffect: 'fade',
  exitDuration: 1.0,
  exitDelay: 0,
  backgroundColor: '#000000',
  textColor: '#ffffff',
  parallaxIntensity: 0,
  animationDuration: 1.0,
  headingSize: '4xl',
  bodySize: 'base',
  alignment: 'center',
  fontWeight: 'normal',
  staggerChildren: 0,
  layerDepth: 5,
  transformOrigin: 'center center',
  overflowBehavior: 'visible',
  backdropBlur: 'none',
  mixBlendMode: 'normal',
  enablePerspective: false,
  customCSSClasses: '',
  textShadow: false,
  textGlow: false,
  paddingTop: 'none',
  paddingBottom: 'none',
  mediaPosition: 'center',
  mediaScale: 'cover',
  mediaOpacity: 1.0,
  fadeOnScroll: false,
  scaleOnScroll: false,
  blurOnScroll: false,
  scrollSpeed: 'normal', // Added default scrollSpeed
  gradientColors: undefined, // Default to undefined
  gradientDirection: undefined, // Default to undefined
};

/**
 * Call Gemini to orchestrate portfolio scenes from content catalog
 * Uses a 6-stage refinement pipeline for maximum quality:
 *
 * Stage 1: Initial Generation (Form-Filling) - Gemini fills complete director config
 * Stage 2: Self-Audit for Inconsistencies - AI identifies conflicts and issues
 * Stage 3: Generate 10 Improvements - AI proposes specific enhancements
 * Stage 4: Auto-Apply Non-Conflicting Improvements - System applies valid improvements
 * Stage 5: Final Regeneration - AI regenerates with all fixes applied
 * Stage 6: Final Validation - System validates asset IDs and director configs
 */
export async function generatePortfolioWithAI(
  catalog: ContentCatalog,
  projectTitle: string // Added projectTitle for logging
): Promise<PortfolioGenerateResponse> {
  const aiClient = getAIClient();

  console.log('[Portfolio Director] Starting 6-stage refinement pipeline...');

  // STAGE 1: Initial Generation (Form-Filling) with retry logic
  const prompt = buildPortfolioPrompt(catalog);

  let stage1Response;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      stage1Response = await aiClient.models.generateContent({
    model: "gemini-2.5-pro", // Pro model for complex cinematic reasoning
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneType: {
                  type: Type.STRING,
                  description: "Must be: text, image, video, quote, split, gallery, or fullscreen"
                },
                assetIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Asset IDs from the provided catalog. MUST reference existing IDs only."
                },
                layout: {
                  type: Type.STRING,
                  description: "Optional layout: default or reverse (for split scenes)"
                },
                director: {
                  type: Type.OBJECT,
                  properties: {
                    entryDuration: { type: Type.NUMBER, description: "Entry animation duration in seconds (0.1-5)" },
                    exitDuration: { type: Type.NUMBER, description: "Exit animation duration in seconds (0.1-5)" },
                    animationDuration: { type: Type.NUMBER, description: "Main animation duration in seconds (0.1-10)" },
                    entryDelay: { type: Type.NUMBER, description: "Entry delay in seconds (0-2)" },
                    exitDelay: { type: Type.NUMBER, description: "Exit delay in seconds (0-2)" },
                    backgroundColor: { type: Type.STRING, description: "Hex color code" },
                    textColor: { type: Type.STRING, description: "Hex color code" },
                    parallaxIntensity: { type: Type.NUMBER, description: "0-1, default 0.3" },
                    scrollSpeed: { type: Type.STRING, description: "slow, normal, or fast" },
                    entryEffect: { type: Type.STRING, description: "fade, slide-up, zoom-in, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus, cross-fade, sudden" },
                    exitEffect: { type: Type.STRING, description: "fade, slide-down, zoom-out, dissolve, rotate-out, flip-out, scale-blur, cross-fade" },
                    entryEasing: { type: Type.STRING, description: "linear, ease, ease-in, ease-out, ease-in-out, power1, power2, power3, power4, back, elastic, bounce" },
                    exitEasing: { type: Type.STRING, description: "linear, ease, ease-in, ease-out, ease-in-out, power1, power2, power3, power4, back, elastic, bounce" },
                    fadeOnScroll: { type: Type.BOOLEAN, description: "Enable fade effect during scroll" },
                    scaleOnScroll: { type: Type.BOOLEAN, description: "Enable scale effect during scroll" },
                    blurOnScroll: { type: Type.BOOLEAN, description: "Enable blur effect during scroll" },
                    headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, or 8xl" },
                    bodySize: { type: Type.STRING, description: "base, lg, xl, or 2xl" },
                    fontWeight: { type: Type.STRING, description: "normal, medium, semibold, or bold" },
                    alignment: { type: Type.STRING, description: "left, center, or right" },
                    staggerChildren: { type: Type.NUMBER, description: "Delay between child animations in seconds (0-1)" },
                    layerDepth: { type: Type.NUMBER, description: "Z-index for parallax layering (0-10)" },
                    transformOrigin: { type: Type.STRING, description: "Transform origin: center center, top left, etc." },
                    overflowBehavior: { type: Type.STRING, description: "visible, hidden, or auto" },
                    backdropBlur: { type: Type.STRING, description: "Backdrop blur: none, sm, md, lg, xl" },
                    mixBlendMode: { type: Type.STRING, description: "Blend mode: normal, multiply, screen, overlay, difference, exclusion" },
                    customCSSClasses: { type: Type.STRING, description: "Space-separated custom CSS classes" },
                    textShadow: { type: Type.BOOLEAN },
                    textGlow: { type: Type.BOOLEAN },
                    paddingTop: { type: Type.STRING },
                    paddingBottom: { type: Type.STRING },
                    mediaPosition: { type: Type.STRING, description: "center, top, bottom, left, right", nullable: true },
                    mediaScale: { type: Type.STRING, description: "cover, contain, fill", nullable: true },
                    mediaOpacity: { type: Type.NUMBER, description: "0.0-1.0, default 1.0" },
                    gradientColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of hex colors", nullable: true },
                    gradientDirection: { type: Type.STRING, description: "to-r, to-l, to-t, to-b, etc.", nullable: true },
                  },
                  required: [
                    "entryDuration", "exitDuration", "entryDelay", "exitDelay",
                    "backgroundColor", "textColor", "parallaxIntensity",
                    "scrollSpeed", "animationDuration", "entryEffect", "exitEffect", "entryEasing", "exitEasing",
                    "headingSize", "bodySize", "fontWeight", "alignment",
                    "fadeOnScroll", "scaleOnScroll", "blurOnScroll",
                    "staggerChildren", "layerDepth", "transformOrigin",
                    "overflowBehavior", "backdropBlur", "mixBlendMode",
                    "enablePerspective", "customCSSClasses",
                    "textShadow", "textGlow", "paddingTop", "paddingBottom",
                    "mediaPosition", "mediaScale", "mediaOpacity"
                  ]
                }
              },
              required: ["sceneType", "assetIds", "director"]
            }
          }
        },
        required: ["scenes"]
      }
        }
      });
      break; // Success, exit retry loop
    } catch (error) {
      retryCount++;
      console.error(`[Portfolio Director] Stage 1 attempt ${retryCount} failed:`, error);

      if (retryCount >= maxRetries) {
        throw new Error(`Failed to generate portfolio after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
    }
  }

  const responseText = stage1Response.text;
  if (!responseText) {
    throw new Error("No response from Gemini AI");
  }

  // Parse the result
  const result: PortfolioGenerateResponse = JSON.parse(responseText || '{}');

  if (!result.scenes || !Array.isArray(result.scenes)) {
    throw new Error('Invalid response structure from AI: missing scenes array');
  }

  // Check for undefined fields in director config and add defaults if missing
  result.scenes.forEach((scene: GeneratedScene) => {
    if (!scene.director) {
      scene.director = {}; // Initialize if completely missing
    }
    // Ensure all required fields from the schema are present, even if they are nullable and not provided by AI
    const requiredDirectorFields = [
      "entryDuration", "exitDuration", "entryDelay", "exitDelay",
      "backgroundColor", "textColor", "parallaxIntensity",
      "scrollSpeed", "animationDuration", "entryEffect", "exitEffect", "entryEasing", "exitEasing",
      "headingSize", "bodySize", "fontWeight", "alignment",
      "fadeOnScroll", "scaleOnScroll", "blurOnScroll",
      "staggerChildren", "layerDepth", "transformOrigin",
      "overflowBehavior", "backdropBlur", "mixBlendMode",
      "enablePerspective", "customCSSClasses",
      "textShadow", "textGlow", "paddingTop", "paddingBottom",
      "mediaPosition", "mediaScale", "mediaOpacity"
    ];
    requiredDirectorFields.forEach(field => {
      if (scene.director[field] === undefined || scene.director[field] === null) {
        // Assign default values from DEFAULT_DIRECTOR_CONFIG or a sensible fallback
        // Note: This part might need refinement based on specific field defaults
        // For simplicity, we'll assign undefined if not present in DEFAULT_DIRECTOR_CONFIG for nullable fields
        if (DEFAULT_DIRECTOR_CONFIG.hasOwnProperty(field)) {
          scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field];
        } else {
          // Fallback for fields not explicitly in DEFAULT_DIRECTOR_CONFIG but required by schema
          // This might require more specific handling based on field type
          if (typeof field === 'boolean') scene.director[field] = false;
          else if (typeof field === 'number') scene.director[field] = 0;
          else scene.director[field] = ''; // Fallback to empty string for others
        }
      }
    });

    // Ensure gradient fields are handled if they were not explicitly set and are nullable
    if (scene.director.gradientColors === undefined) {
      scene.director.gradientColors = DEFAULT_DIRECTOR_CONFIG.gradientColors;
    }
    if (scene.director.gradientDirection === undefined) {
      scene.director.gradientDirection = DEFAULT_DIRECTOR_CONFIG.gradientDirection;
    }
  });


  // Calculate confidence score based on completeness
  let confidenceScore = 100;
  let confidenceFactors: string[] = [];

  // Check if all scenes have required fields
  const requiredSceneFields = ['sceneType', 'assetIds'];
  const requiredDirectorFields = [
    'entryEffect', 'entryDuration', 'entryDelay', 'exitEffect', 'exitDuration',
    'exitDelay', 'backgroundColor', 'textColor', 'parallaxIntensity',
    'scrollSpeed', 'animationDuration', 'entryEasing', 'exitEasing',
    'headingSize', 'bodySize', 'fontWeight', 'alignment',
    'fadeOnScroll', 'scaleOnScroll', 'blurOnScroll', 'staggerChildren',
    'layerDepth', 'transformOrigin', 'overflowBehavior', 'backdropBlur',
    'mixBlendMode', 'enablePerspective', 'customCSSClasses',
    'textShadow', 'textGlow', 'paddingTop', 'paddingBottom',
    'mediaPosition', 'mediaScale', 'mediaOpacity'
  ];

  result.scenes.forEach((scene: GeneratedScene, idx: number) => {
    // Check scene structure
    for (const field of requiredSceneFields) {
      if (!scene[field]) {
        confidenceScore -= 5;
        confidenceFactors.push(`Scene ${idx}: missing ${field}`);
      }
    }

    // Check director configuration
    if (!scene.director) {
      confidenceScore -= 10;
      confidenceFactors.push(`Scene ${idx}: missing director config`);
    } else {
      for (const field of requiredDirectorFields) {
        if (scene.director[field] === undefined || scene.director[field] === null) {
          confidenceScore -= 2;
          confidenceFactors.push(`Scene ${idx}: missing director.${field}`);
        }
      }
    }
  });

  // Bonus points for proper asset selection
  const totalAssets = result.scenes.reduce((sum: number, scene: GeneratedScene) =>
    sum + (scene.assetIds?.length || 0), 0
  );
  const avgAssetsPerScene = result.scenes.length > 0 ? totalAssets / result.scenes.length : 0;
  if (avgAssetsPerScene >= 1.5) {
    confidenceScore = Math.min(100, confidenceScore + 5);
    confidenceFactors.push('Good asset utilization');
  }

  // Clamp score between 0-100
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  result.confidenceScore = confidenceScore;
  result.confidenceFactors = confidenceFactors;

  console.log(`[Portfolio Director] ✅ Generated ${result.scenes.length} scenes for project: ${projectTitle}`);
  console.log(`[Portfolio Director] 📊 Confidence Score: ${confidenceScore}% ${confidenceScore < 70 ? '⚠️ LOW' : confidenceScore < 85 ? '✓ GOOD' : '✓✓ EXCELLENT'}`);
  if (confidenceFactors.length > 0) {
    console.log(`[Portfolio Director] 📋 Confidence Factors:`, confidenceFactors);
  }

  console.log('[Portfolio Director] ✅ Stage 1 complete: Initial generation and confidence scoring');

  // STAGE 2: Self-Audit for Inconsistencies
  const auditPrompt = `You previously generated this scene sequence JSON:

${JSON.stringify(result, null, 2)}

COMPREHENSIVE AUDIT AGAINST THE 37-CONTROL SYSTEM:

MANDATORY FIELD VERIFICATION:
For each scene, verify ALL 37 controls are present with valid values:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION & TIMING (8 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ entryEffect - valid enum value (fade, slide-up, slide-down, zoom-in, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus, cross-fade, sudden)
✓ entryDuration - number >= 0.8s (recommend 1.2s+ for visibility)
✓ entryDelay - number 0-2s
✓ entryEasing - valid enum value (linear, ease, ease-out, power1-4, back, elastic, bounce)
✓ exitEffect - valid enum value (fade, slide-up, slide-down, zoom-out, dissolve, rotate-out, flip-out, scale-blur, cross-fade)
✓ exitDuration - number >= 0.6s (typically 20% faster than entry)
✓ exitDelay - number 0-2s
✓ exitEasing - valid enum value (linear, ease, ease-in, power1-4, back, elastic, bounce)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL FOUNDATION (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ backgroundColor - valid hex code (#000000 to #ffffff)
✓ textColor - valid hex code (MUST contrast with background - light text on dark bg or vice versa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL DEPTH EFFECTS (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ parallaxIntensity - number 0.0-1.0 (set to 0 if scaleOnScroll is true)
✓ scrollSpeed - "slow" | "normal" | "fast" (exact string match required)
✓ animationDuration - number 0.5-10s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY (4 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ headingSize - "4xl" | "5xl" | "6xl" | "7xl" | "8xl"
✓ bodySize - "base" | "lg" | "xl" | "2xl"
✓ fontWeight - "normal" | "medium" | "semibold" | "bold"
✓ alignment - "left" | "center" | "right"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL INTERACTION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ fadeOnScroll - boolean (true/false)
✓ scaleOnScroll - boolean (MUST be false if parallaxIntensity > 0)
✓ blurOnScroll - boolean (recommend false for performance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-ELEMENT TIMING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ staggerChildren - number 0.0-1.0s
✓ layerDepth - number 0-10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED MOTION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ transformOrigin - string (e.g., "center center", "top left")
✓ overflowBehavior - "visible" | "hidden" | "auto"
✓ backdropBlur - "none" | "sm" | "md" | "lg" | "xl"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL BLENDING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ mixBlendMode - "normal" | "multiply" | "screen" | "overlay" | "difference" | "exclusion"
✓ enablePerspective - boolean (true for 3D rotations, false for flat)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOM STYLING (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ customCSSClasses - string (space-separated Tailwind classes or empty "")
✓ textShadow - boolean
✓ textGlow - boolean

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERTICAL SPACING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ paddingTop - "none" | "sm" | "md" | "lg" | "xl" | "2xl"
✓ paddingBottom - "none" | "sm" | "md" | "lg" | "xl" | "2xl"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIA PRESENTATION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ mediaPosition - "center" | "top" | "bottom" | "left" | "right"
✓ mediaScale - "cover" | "contain" | "fill"
✓ mediaOpacity - number 0.0-1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRADIENT BACKGROUNDS (2 controls - nullable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ gradientColors - array of hex codes or undefined (if array, must have 2+ colors)
✓ gradientDirection - string or undefined (if set, must be valid Tailwind gradient direction)

CRITICAL CONFLICT DETECTION:
1. ⚠️ parallax + scaleOnScroll conflict (MUST set parallaxIntensity to 0 if scaleOnScroll is true)
2. ⚠️ Color contrast issues (backgroundColor vs textColor - must be distinguishable)
3. ⚠️ Invalid placeholder IDs (must be from: ${getAllPlaceholderIds().join(', ')})
4. ⚠️ Duration thresholds (entryDuration < 1.0s = too fast, recommend 1.2s+)
5. ⚠️ Pacing monotony (all scenes same speed = no rhythm variation)
6. ⚠️ Transition flow (exit effect of Scene N should complement entry of Scene N+1)
7. ⚠️ blurOnScroll conflicts (cannot combine with parallax or scale effects)
8. ⚠️ Gradient validation (if gradientColors set, gradientDirection must also be set)

PLACEHOLDER SYSTEM VALIDATION:
CRITICAL: All assetIds MUST reference ONLY these placeholder IDs:
- Images: ${PLACEHOLDER_CONFIG.images.join(', ')}
- Videos: ${PLACEHOLDER_CONFIG.videos.join(', ')}
- Quotes: ${PLACEHOLDER_CONFIG.quotes.join(', ')}

DO NOT reference user asset IDs. The user will map their real content to these placeholders later.

Return a JSON array of issues found (be thorough - check EVERY scene for EVERY control):
{
  "issues": [
    {"sceneIndex": 0, "field": "parallaxIntensity", "problem": "Conflicts with scaleOnScroll: true", "suggestion": "Set parallaxIntensity to 0"},
    {"sceneIndex": 1, "field": "scrollSpeed", "problem": "Missing required field", "suggestion": "Add scrollSpeed: 'normal'"},
    {"sceneIndex": 2, "field": "assetIds", "problem": "References non-existent placeholder 'user-image-1'", "suggestion": "Use valid placeholder ID like 'image-1'"},
    {"sceneIndex": 3, "field": "entryDuration", "problem": "Value 0.5s too fast for visibility", "suggestion": "Increase to 1.2s for noticeable effect"},
    {"sceneIndex": 4, "field": "backgroundColor", "problem": "Same as textColor (#ffffff)", "suggestion": "Change backgroundColor to '#0a0a0a' for contrast"}
  ]
}`;

  const auditResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: auditPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneIndex: { type: Type.NUMBER },
                field: { type: Type.STRING },
                problem: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["sceneIndex", "field", "problem", "suggestion"]
            }
          }
        },
        required: ["issues"]
      }
    }
  });

  const auditResult = JSON.parse(auditResponse.text || '{"issues":[]}');
  console.log(`[Portfolio Director] ✅ Stage 2 complete: Found ${auditResult.issues.length} issues`);

  // STAGE 3: Generate 10 Improvements
  const improvementsPrompt = `You previously generated this scene sequence:

${JSON.stringify(result, null, 2)}

User requirements from director notes:
${catalog.directorNotes}

CRITICAL REMINDER - PLACEHOLDER SYSTEM:
You MUST ONLY use these placeholder IDs in assetIds arrays:
- Images: ${PLACEHOLDER_CONFIG.images.join(', ')}
- Videos: ${PLACEHOLDER_CONFIG.videos.join(', ')}
- Quotes: ${PLACEHOLDER_CONFIG.quotes.join(', ')}

DO NOT reference user asset IDs. The user will map placeholders to their real assets later.

Generate 10 specific improvements using the 37-CONTROL FRAMEWORK:

IMPROVEMENT CATEGORIES (reference the specific control categories):

1. **ANIMATION & TIMING** (8 controls)
   - Adjust entryDuration/exitDuration for dramatic impact (1.2-2.5s for hero moments)
   - Refine easing curves (power3/power4 for cinematic feel)
   - Add strategic delays (entryDelay/exitDelay for staggered reveals)

2. **VISUAL FOUNDATION** (2 controls)
   - Improve color progression across scenes
   - Ensure proper contrast (backgroundColor vs textColor)

3. **SCROLL DEPTH EFFECTS** (3 controls)
   - Optimize parallaxIntensity (0.3-0.5 for dramatic scenes, 0 for text)
   - Set appropriate scrollSpeed (slow for hero, fast for galleries)
   - Match animationDuration to content importance

4. **TYPOGRAPHY** (4 controls)
   - Scale headingSize appropriately (7xl/8xl for heroes, 5xl for sections)
   - Adjust bodySize for readability
   - Set fontWeight for emphasis hierarchy

5. **SCROLL INTERACTION** (3 controls)
   - Use fadeOnScroll sparingly (max 30% of scenes)
   - Apply scaleOnScroll for dramatic zoom (conflicts with parallax!)
   - Avoid blurOnScroll except for 1-2 cinematic moments

6. **TRANSITION DESIGN**
   - Ensure exit/entry effects create smooth narrative flow
   - Vary speeds to create musical rhythm
   - Use complementary effects (fade→fade, dissolve→cross-fade)

Each improvement MUST:
- Reference a specific control from the 37-control system
- Provide concrete values (not "increase" but "change from 1.2 to 2.5")
- Explain the cinematic reasoning

Return:
{
  "improvements": [
    {
      "sceneIndex": 0,
      "field": "director.entryDuration",
      "currentValue": "1.2",
      "newValue": "2.5",
      "reason": "Hero scene needs slower, more dramatic entrance (ANIMATION & TIMING category). 2.5s creates noticeable impact vs 1.2s which feels rushed."
    },
    {
      "sceneIndex": 1,
      "field": "director.scrollSpeed",
      "currentValue": "normal",
      "newValue": "slow",
      "reason": "Second scene should maintain hero's contemplative pace (SCROLL DEPTH EFFECTS category). Slow scroll speed creates cinematic continuity."
    },
    ...
  ]
}`;

  const improvementsResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: improvementsPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneIndex: { type: Type.NUMBER },
                field: { type: Type.STRING },
                currentValue: { type: Type.STRING }, // Expecting string for flexibility
                newValue: { type: Type.STRING }, // Expecting string for flexibility
                reason: { type: Type.STRING }
              },
              required: ["sceneIndex", "field", "newValue", "reason"]
            }
          }
        },
        required: ["improvements"]
      }
    }
  });

  const improvementsResult = JSON.parse(improvementsResponse.text || '{"improvements":[]}');
  console.log(`[Portfolio Director] ✅ Stage 3 complete: Generated ${improvementsResult.improvements.length} improvements`);

  // STAGE 4: Auto-Apply Non-Conflicting Improvements
  const appliedImprovements: string[] = [];
  const validPlaceholderIds = buildAssetWhitelist();
  
  for (const improvement of improvementsResult.improvements) {
    const scene = result.scenes[improvement.sceneIndex];
    if (!scene) {
      console.warn(`[Portfolio Director] Warning: Improvement for non-existent scene index ${improvement.sceneIndex}. Skipping.`);
      continue;
    }

    // Check for conflicts with audit issues
    const hasConflict = auditResult.issues.some(
      (issue: any) => issue.sceneIndex === improvement.sceneIndex && issue.field === improvement.field
    );

    // Validate placeholder IDs if this improvement touches assetIds
    let hasInvalidPlaceholder = false;
    if (improvement.field === 'assetIds' && Array.isArray(improvement.newValue)) {
      for (const assetId of improvement.newValue) {
        if (!validPlaceholderIds.includes(assetId)) {
          console.warn(`[Portfolio Director] Warning: Improvement contains invalid placeholder ID "${assetId}". Skipping.`);
          hasInvalidPlaceholder = true;
          break;
        }
      }
    }

    if (!hasConflict && !hasInvalidPlaceholder) {
      // Apply improvement
      const fieldPath = improvement.field.split('.');
      let target: any = scene;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!target[fieldPath[i]]) {
          // Attempt to create nested object if it doesn't exist
          if (fieldPath[i] === 'director') {
            target[fieldPath[i]] = {};
          } else {
            console.warn(`[Portfolio Director] Warning: Could not resolve path for improvement field "${improvement.field}". Skipping.`);
            target = null; // Mark as unresolvable
            break;
          }
        }
        target = target[fieldPath[i]];
      }

      if (target) {
        const finalField = fieldPath[fieldPath.length - 1];

        // Type conversion - attempt to infer type or use string
        let newValue: any = improvement.newValue;
        try {
          if (typeof (scene.director as any)[finalField] === 'number' || (finalField === 'entryDuration' || finalField === 'exitDuration' || finalField === 'entryDelay' || finalField === 'parallaxIntensity' || finalField === 'animationDuration' || finalField === 'exitDelay' || finalField === 'staggerChildren' || finalField === 'layerDepth' || finalField === 'mediaOpacity')) {
            newValue = parseFloat(improvement.newValue);
            if (isNaN(newValue)) throw new Error("Not a number");
          } else if (typeof (scene.director as any)[finalField] === 'boolean' || (finalField === 'fadeOnScroll' || finalField === 'scaleOnScroll' || finalField === 'blurOnScroll' || finalField === 'enablePerspective' || finalField === 'textShadow' || finalField === 'textGlow')) {
            newValue = improvement.newValue.toLowerCase() === 'true';
          } else if (finalField === 'scrollSpeed') {
             const validScrollSpeeds = ['slow', 'normal', 'fast'];
             if (validScrollSpeeds.includes(improvement.newValue.toLowerCase())) {
                 newValue = improvement.newValue.toLowerCase();
             } else {
                 throw new Error(`Invalid scrollSpeed value: ${improvement.newValue}`);
             }
          } else if (finalField === 'headingSize') {
             const validSizes = ['4xl', '5xl', '6xl', '7xl', '8xl'];
             if (validSizes.includes(improvement.newValue)) {
                 newValue = improvement.newValue;
             } else {
                 throw new Error(`Invalid headingSize value: ${improvement.newValue}`);
             }
          } else if (finalField === 'bodySize') {
             const validSizes = ['base', 'lg', 'xl', '2xl'];
              if (validSizes.includes(improvement.newValue)) {
                 newValue = improvement.newValue;
             } else {
                 throw new Error(`Invalid bodySize value: ${improvement.newValue}`);
             }
          } else if (finalField === 'alignment') {
             const validAlignments = ['left', 'center', 'right'];
              if (validAlignments.includes(improvement.newValue.toLowerCase())) {
                 newValue = improvement.newValue.toLowerCase();
             } else {
                 throw new Error(`Invalid alignment value: ${improvement.newValue}`);
             }
          } else if (finalField === 'mixBlendMode') {
              const validModes = ['normal', 'multiply', 'screen', 'overlay', 'difference', 'exclusion'];
              if (validModes.includes(improvement.newValue.toLowerCase())) {
                  newValue = improvement.newValue.toLowerCase();
              } else {
                  throw new Error(`Invalid mixBlendMode value: ${improvement.newValue}`);
              }
          } else if (finalField === 'backdropBlur') {
              const validBlurs = ['none', 'sm', 'md', 'lg', 'xl'];
               if (validBlurs.includes(improvement.newValue.toLowerCase())) {
                  newValue = improvement.newValue.toLowerCase();
              } else {
                  throw new Error(`Invalid backdropBlur value: ${improvement.newValue}`);
              }
          } else if (finalField === 'paddingTop' || finalField === 'paddingBottom') {
              const validPaddings = ['none', 'sm', 'md', 'lg', 'xl', '2xl'];
               if (validPaddings.includes(improvement.newValue.toLowerCase())) {
                  newValue = improvement.newValue.toLowerCase();
              } else {
                  throw new Error(`Invalid ${finalField} value: ${improvement.newValue}`);
              }
          } else if (finalField === 'mediaPosition') {
              const validPositions = ['center', 'top', 'bottom', 'left', 'right'];
               if (validPositions.includes(improvement.newValue.toLowerCase())) {
                  newValue = improvement.newValue.toLowerCase();
              } else {
                  throw new Error(`Invalid mediaPosition value: ${improvement.newValue}`);
              }
          } else if (finalField === 'mediaScale') {
              const validScales = ['cover', 'contain', 'fill'];
               if (validScales.includes(improvement.newValue.toLowerCase())) {
                  newValue = improvement.newValue.toLowerCase();
              } else {
                  throw new Error(`Invalid mediaScale value: ${improvement.newValue}`);
              }
          }
          // Add more specific type checks as needed for other fields
        } catch (e) {
          console.warn(`[Portfolio Director] Warning: Could not convert "${improvement.newValue}" to expected type for field "${finalField}". Using as string. Error: ${e}`);
          newValue = improvement.newValue; // Fallback to string
        }

        (target as any)[finalField] = newValue;
        appliedImprovements.push(`Scene ${improvement.sceneIndex}: ${improvement.field} = ${JSON.stringify(newValue)} (${improvement.reason})`);
      }
    }
  }

  console.log(`[Portfolio Director] ✅ Stage 4 complete: Applied ${appliedImprovements.length} improvements`);

  // STAGE 5: Final Regeneration for Consistency
  const finalPrompt = `Based on the following improvements and fixes, regenerate the complete scene sequence with all enhancements applied:

ORIGINAL DIRECTOR NOTES:
${catalog.directorNotes}

APPLIED IMPROVEMENTS:
${appliedImprovements.join('\n')}

AUDIT ISSUES FIXED:
${auditResult.issues.map((issue: any) => `- Scene ${issue.sceneIndex}: ${issue.field} - ${issue.suggestion}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY 37-CONTROL VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST PROVIDE ALL 37 CONTROLS FOR EVERY SCENE. NO EXCEPTIONS.

ANIMATION & TIMING (8 controls):
✓ entryEffect, entryDuration, entryDelay, entryEasing
✓ exitEffect, exitDuration, exitDelay, exitEasing

VISUAL FOUNDATION (2 controls):
✓ backgroundColor, textColor

SCROLL DEPTH EFFECTS (3 controls):
✓ parallaxIntensity, scrollSpeed, animationDuration

TYPOGRAPHY (4 controls):
✓ headingSize, bodySize, fontWeight, alignment

SCROLL INTERACTION (3 controls):
✓ fadeOnScroll, scaleOnScroll, blurOnScroll

MULTI-ELEMENT TIMING (2 controls):
✓ staggerChildren, layerDepth

ADVANCED MOTION (3 controls):
✓ transformOrigin, overflowBehavior, backdropBlur

VISUAL BLENDING (2 controls):
✓ mixBlendMode, enablePerspective

CUSTOM STYLING (3 controls):
✓ customCSSClasses, textShadow, textGlow

VERTICAL SPACING (2 controls):
✓ paddingTop, paddingBottom

MEDIA PRESENTATION (3 controls):
✓ mediaPosition, mediaScale, mediaOpacity

GRADIENT BACKGROUNDS (2 controls - nullable):
✓ gradientColors, gradientDirection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL REQUIREMENTS:
1. All timing is dramatic and noticeable (entryDuration >= 1.2s for impact)
2. Transitions flow seamlessly between scenes
3. NO conflicts (parallax + scaleOnScroll = FORBIDDEN)
4. Color progression creates visual journey
5. Pacing has musical rhythm (varied scrollSpeed and durations)
6. Asset selection tells compelling story
7. ALL placeholder IDs must be valid - ONLY use these exact IDs:
   - Images: ${PLACEHOLDER_CONFIG.images.join(', ')}
   - Videos: ${PLACEHOLDER_CONFIG.videos.join(', ')}
   - Quotes: ${PLACEHOLDER_CONFIG.quotes.join(', ')}
8. DO NOT invent new placeholder IDs or reference user asset IDs

BEFORE GENERATING OUTPUT, VERIFY:
✓ Every scene has ALL 37 director fields with concrete values
✓ No field is set to "default", "auto", or left as undefined
✓ gradientColors is either an array of hex codes OR undefined (not null)
✓ gradientDirection is either a string OR undefined (not null)
✓ All durations are ≥ 0.8s for visibility
✓ All colors are valid hex codes with # prefix
✓ No conflicts (parallaxIntensity = 0 when scaleOnScroll = true)
✓ scrollSpeed is one of: "slow" | "normal" | "fast"

PLACEHOLDER SYSTEM REMINDER:
You MUST use ONLY these placeholder IDs in assetIds arrays:
- Images: image-1, image-2, ..., image-10
- Videos: video-1, video-2, ..., video-5
- Quotes: quote-1, quote-2, quote-3
- Texts: text-1, text-2, ..., text-10

DO NOT reference user asset IDs. The user will map placeholders to their real assets later.

Return the complete scenes array with full director configs. Ensure ALL 37 required director fields are present for each scene.

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "sceneType": "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen",
  "assetIds": string[], // MUST reference valid placeholder IDs ONLY
  "layout": "default" | "reverse", // Optional, primarily for split scenes
  "director": {
    // All 37 controls - EVERY SINGLE ONE MUST BE PRESENT
    "entryEffect": string,
    "entryDuration": number,
    "entryDelay": number,
    "entryEasing": string,
    "exitEffect": string,
    "exitDuration": number,
    "exitDelay": number,
    "exitEasing": string,
    "backgroundColor": string,
    "textColor": string,
    "parallaxIntensity": number,
    "scrollSpeed": string,
    "animationDuration": number,
    "headingSize": string,
    "bodySize": string,
    "fontWeight": string,
    "alignment": string,
    "fadeOnScroll": boolean,
    "scaleOnScroll": boolean,
    "blurOnScroll": boolean,
    "staggerChildren": number,
    "layerDepth": number,
    "transformOrigin": string,
    "overflowBehavior": string,
    "backdropBlur": string,
    "mixBlendMode": string,
    "enablePerspective": boolean,
    "customCSSClasses": string,
    "textShadow": boolean,
    "textGlow": boolean,
    "paddingTop": string,
    "paddingBottom": string,
    "mediaPosition": string,
    "mediaScale": string,
    "mediaOpacity": number,
    "gradientColors"?: string[], // Optional: array or undefined
    "gradientDirection"?: string // Optional: string or undefined
  }
}

`;

  const finalResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneType: { type: Type.STRING },
                assetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                layout: { type: Type.STRING },
                director: {
                  type: Type.OBJECT,
                  properties: {
                    entryDuration: { type: Type.NUMBER },
                    exitDuration: { type: Type.NUMBER },
                    animationDuration: { type: Type.NUMBER },
                    entryDelay: { type: Type.NUMBER },
                    exitDelay: { type: Type.NUMBER },
                    backgroundColor: { type: Type.STRING },
                    textColor: { type: Type.STRING },
                    parallaxIntensity: { type: Type.NUMBER },
                    scrollSpeed: { type: Type.STRING },
                    entryEffect: { type: Type.STRING },
                    exitEffect: { type: Type.STRING },
                    entryEasing: { type: Type.STRING },
                    exitEasing: { type: Type.STRING },
                    fadeOnScroll: { type: Type.BOOLEAN },
                    scaleOnScroll: { type: Type.BOOLEAN },
                    blurOnScroll: { type: Type.BOOLEAN },
                    headingSize: { type: Type.STRING },
                    bodySize: { type: Type.STRING },
                    fontWeight: { type: Type.STRING },
                    alignment: { type: Type.STRING },
                    staggerChildren: { type: Type.NUMBER },
                    layerDepth: { type: Type.NUMBER },
                    transformOrigin: { type: Type.STRING },
                    overflowBehavior: { type: Type.STRING },
                    backdropBlur: { type: Type.STRING },
                    mixBlendMode: { type: Type.STRING },
                    enablePerspective: { type: Type.BOOLEAN },
                    customCSSClasses: { type: Type.STRING },
                    textShadow: { type: Type.BOOLEAN },
                    textGlow: { type: Type.BOOLEAN },
                    paddingTop: { type: Type.STRING },
                    paddingBottom: { type: Type.STRING },
                    mediaPosition: { type: Type.STRING, nullable: true },
                    mediaScale: { type: Type.STRING, nullable: true },
                    mediaOpacity: { type: Type.NUMBER },
                    gradientColors: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                    gradientDirection: { type: Type.STRING, nullable: true },
                  },
                  required: [
                    "entryDuration", "exitDuration", "entryDelay", "exitDelay",
                    "backgroundColor", "textColor", "parallaxIntensity",
                    "scrollSpeed", "animationDuration", "entryEffect", "exitEffect", "entryEasing", "exitEasing",
                    "headingSize", "bodySize", "fontWeight", "alignment",
                    "fadeOnScroll", "scaleOnScroll", "blurOnScroll",
                    "staggerChildren", "layerDepth", "transformOrigin",
                    "overflowBehavior", "backdropBlur", "mixBlendMode",
                    "enablePerspective", "customCSSClasses",
                    "textShadow", "textGlow", "paddingTop", "paddingBottom",
                    "mediaPosition", "mediaScale", "mediaOpacity"
                  ]
                }
              },
              required: ["sceneType", "assetIds", "director"]
            }
          }
        },
        required: ["scenes"]
      }
    }
  });

  const finalResult: PortfolioGenerateResponse = JSON.parse(finalResponse.text || '{"scenes":[]}');
  console.log(`[Portfolio Director] ✅ Stage 5 complete: Final regeneration with ${finalResult.scenes.length} scenes`);

  // STAGE 6: Final Validation Against Requirements
  console.log('[Portfolio Director] ✅ Stage 6: Final validation - checking all 37 controls');

  const finalValidAssetIds = buildAssetWhitelist(); // Static placeholders only
  const warnings: string[] = [];

  // Define all 37 required controls with type expectations
  const requiredDirectorControls = {
    // ANIMATION & TIMING (8)
    entryEffect: { type: 'string', enum: ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'sudden', 'cross-fade', 'rotate-in', 'flip-in', 'spiral-in', 'elastic-bounce', 'blur-focus'] },
    entryDuration: { type: 'number', min: 0.8 },
    entryDelay: { type: 'number', min: 0, max: 2 },
    entryEasing: { type: 'string', enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'power1', 'power2', 'power3', 'power4', 'back', 'elastic', 'bounce'] },
    exitEffect: { type: 'string', enum: ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-out', 'dissolve', 'cross-fade', 'rotate-out', 'flip-out', 'scale-blur'] },
    exitDuration: { type: 'number', min: 0.6 },
    exitDelay: { type: 'number', min: 0, max: 2 },
    exitEasing: { type: 'string', enum: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'power1', 'power2', 'power3', 'power4', 'back', 'elastic', 'bounce'] },
    
    // VISUAL FOUNDATION (2)
    backgroundColor: { type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
    textColor: { type: 'string', pattern: /^#[0-9A-Fa-f]{6}$/ },
    
    // SCROLL DEPTH EFFECTS (3)
    parallaxIntensity: { type: 'number', min: 0, max: 1 },
    scrollSpeed: { type: 'string', enum: ['slow', 'normal', 'fast'] },
    animationDuration: { type: 'number', min: 0.5, max: 10 },
    
    // TYPOGRAPHY (4)
    headingSize: { type: 'string', enum: ['4xl', '5xl', '6xl', '7xl', '8xl'] },
    bodySize: { type: 'string', enum: ['base', 'lg', 'xl', '2xl'] },
    fontWeight: { type: 'string', enum: ['normal', 'medium', 'semibold', 'bold'] },
    alignment: { type: 'string', enum: ['left', 'center', 'right'] },
    
    // SCROLL INTERACTION (3)
    fadeOnScroll: { type: 'boolean' },
    scaleOnScroll: { type: 'boolean' },
    blurOnScroll: { type: 'boolean' },
    
    // MULTI-ELEMENT TIMING (2)
    staggerChildren: { type: 'number', min: 0, max: 1 },
    layerDepth: { type: 'number', min: 0, max: 10 },
    
    // ADVANCED MOTION (3)
    transformOrigin: { type: 'string' },
    overflowBehavior: { type: 'string', enum: ['visible', 'hidden', 'auto'] },
    backdropBlur: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl'] },
    
    // VISUAL BLENDING (2)
    mixBlendMode: { type: 'string', enum: ['normal', 'multiply', 'screen', 'overlay', 'difference', 'exclusion'] },
    enablePerspective: { type: 'boolean' },
    
    // CUSTOM STYLING (3)
    customCSSClasses: { type: 'string' },
    textShadow: { type: 'boolean' },
    textGlow: { type: 'boolean' },
    
    // VERTICAL SPACING (2)
    paddingTop: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
    paddingBottom: { type: 'string', enum: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] },
    
    // MEDIA PRESENTATION (3)
    mediaPosition: { type: 'string', enum: ['center', 'top', 'bottom', 'left', 'right'] },
    mediaScale: { type: 'string', enum: ['cover', 'contain', 'fill'] },
    mediaOpacity: { type: 'number', min: 0, max: 1 }
  };

  for (const scene of finalResult.scenes) {
    // Ensure director object exists
    if (!scene.director) {
        scene.director = {};
        warnings.push(`Scene missing director object - initializing with defaults`);
        confidenceScore -= 10;
    }
    
    // Validate all 37 required controls
    for (const [field, spec] of Object.entries(requiredDirectorControls)) {
    const value = scene.director[field];
      
      // Check if field is missing
      if (value === undefined || value === null) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Missing required field '${field}' - applying default`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? (spec.type === 'boolean' ? false : spec.type === 'number' ? 0 : '');
        confidenceScore -= 3;
        continue;
      }
      
      // Type validation
      if (spec.type === 'number' && typeof value !== 'number') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be number, got ${typeof value}`);
        confidenceScore -= 2;
      }
      
      if (spec.type === 'string' && typeof value !== 'string') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be string, got ${typeof value}`);
        confidenceScore -= 2;
      }
      
      if (spec.type === 'boolean' && typeof value !== 'boolean') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be boolean, got ${typeof value}`);
        confidenceScore -= 2;
      }
      
      // Enum validation
      if (spec.enum && !spec.enum.includes(value)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' has invalid value '${value}'. Must be one of: ${spec.enum.join(', ')}`);
        confidenceScore -= 3;
      }
      
      // Range validation
      if (spec.type === 'number') {
        if (spec.min !== undefined && value < spec.min) {
          warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value ${value} is below minimum ${spec.min}`);
          confidenceScore -= 2;
        }
        if (spec.max !== undefined && value > spec.max) {
          warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value ${value} exceeds maximum ${spec.max}`);
          confidenceScore -= 2;
        }
      }
      
      // Pattern validation (for hex colors)
      if (spec.pattern && typeof value === 'string' && !spec.pattern.test(value)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value '${value}' doesn't match required pattern`);
        confidenceScore -= 3;
      }
    }

    // Handle optional gradient fields (nullable)
    if (scene.director.gradientColors === null) {
      scene.director.gradientColors = undefined;
    }
    if (scene.director.gradientDirection === null) {
      scene.director.gradientDirection = undefined;
    }
    
    // Validate gradient fields if present
    if (scene.director.gradientColors !== undefined) {
      if (!Array.isArray(scene.director.gradientColors)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors should be array or undefined, got ${typeof scene.director.gradientColors}`);
        scene.director.gradientColors = undefined;
        confidenceScore -= 2;
      } else if (scene.director.gradientColors.length === 0) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors array is empty, setting to undefined`);
        scene.director.gradientColors = undefined;
      } else {
        // Validate each color is a hex code
        for (const color of scene.director.gradientColors) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Invalid gradient color '${color}' - must be hex code`);
            confidenceScore -= 2;
          }
        }
      }
    }
    
    // Validate gradientDirection is set if gradientColors is set
    if (scene.director.gradientColors !== undefined && !scene.director.gradientDirection) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors set but gradientDirection missing, defaulting to 'to-br'`);
      scene.director.gradientDirection = 'to-br';
      confidenceScore -= 1;
    }


    // Validate asset IDs against static placeholders
    for (const assetId of scene.assetIds) {
      if (!finalValidAssetIds.includes(assetId)) {
        const errorMsg = `AI referenced invalid placeholder ID: ${assetId}. Valid placeholder IDs: ${finalValidAssetIds.join(', ')}`;
        console.error(`❌ [Portfolio Director] ${errorMsg}`);
        // Add to confidence factors as a warning
        confidenceScore -= 3; // Deduct score for invalid placeholder ID
        confidenceFactors.push(`Scene with assets [${scene.assetIds.join(', ')}]: Invalid placeholder ID "${assetId}"`);
      }
    }

    // Validate director fields and conflicts
    const director = scene.director;
    if (!director) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing director config.`);
      confidenceScore -= 10;
      continue; // Skip further director checks if config is missing
    }

    // Conflict checks
    if (director.parallaxIntensity > 0 && director.scaleOnScroll) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ parallax + scaleOnScroll conflict detected. Auto-fixing scaleOnScroll to false.`);
      scene.director.scaleOnScroll = false; // Auto-fix
    }
    if (director.blurOnScroll && director.parallaxIntensity > 0) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ blurOnScroll conflicts with parallax. Auto-fixing blurOnScroll to false.`);
        scene.director.blurOnScroll = false; // Auto-fix
    }
     if (director.blurOnScroll && director.scaleOnScroll) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ blurOnScroll conflicts with scaleOnScroll. Auto-fixing blurOnScroll to false.`);
        scene.director.blurOnScroll = false; // Auto-fix
    }

    // Duration checks
    if (director.entryDuration !== undefined && director.entryDuration < 0.5) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Entry duration ${director.entryDuration}s may be too subtle.`);
      confidenceScore -= 2;
    }
    if (director.exitDuration !== undefined && director.exitDuration < 0.4) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Exit duration ${director.exitDuration}s may be too abrupt.`);
      confidenceScore -= 2;
    }

    // Required field presence and basic validity
    if (typeof director.entryDuration !== 'number' || director.entryDuration < 0.1) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid or missing entryDuration, defaulting to 1.2s.`);
      scene.director.entryDuration = 1.2; // Default
      confidenceScore -= 3;
    }
    if (typeof director.exitDuration !== 'number' || director.exitDuration < 0.1) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid or missing exitDuration, defaulting to 1.0s.`);
      scene.director.exitDuration = 1.0; // Default
      confidenceScore -= 3;
    }
    if (typeof director.entryDelay !== 'number' || director.entryDelay < 0) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid or missing entryDelay, defaulting to 0s.`);
      scene.director.entryDelay = 0; // Default
    }
    if (typeof director.exitDelay !== 'number' || director.exitDelay < 0) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid or missing exitDelay, defaulting to 0s.`);
      scene.director.exitDelay = 0; // Default
    }
    if (typeof director.parallaxIntensity !== 'number' || director.parallaxIntensity < 0 || director.parallaxIntensity > 1) {
      warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid parallaxIntensity (must be 0-1), defaulting to 0.3.`);
      scene.director.parallaxIntensity = 0.3; // Default
      confidenceScore -= 3;
    }
    if (!director.entryEffect) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing entryEffect, defaulting to 'fade'.`);
        scene.director.entryEffect = 'fade';
        confidenceScore -= 3;
    }
    if (!director.exitEffect) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing exitEffect, defaulting to 'fade'.`);
        scene.director.exitEffect = 'fade';
        confidenceScore -= 3;
    }
     if (!director.backgroundColor) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing backgroundColor, defaulting to '#000000'.`);
        scene.director.backgroundColor = '#000000';
        confidenceScore -= 3;
    }
     if (!director.textColor) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing textColor, defaulting to '#ffffff'.`);
        scene.director.textColor = '#ffffff';
        confidenceScore -= 3;
    }
     if (!director.headingSize) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing headingSize, defaulting to '4xl'.`);
        scene.director.headingSize = '4xl';
        confidenceScore -= 3;
    }
     if (!director.bodySize) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing bodySize, defaulting to 'base'.`);
        scene.director.bodySize = 'base';
        confidenceScore -= 3;
    }
     if (!director.alignment) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing alignment, defaulting to 'center'.`);
        scene.director.alignment = 'center';
        confidenceScore -= 3;
    }
    if (!director.fontWeight) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing fontWeight, defaulting to 'normal'.`);
        scene.director.fontWeight = 'normal';
        confidenceScore -= 3;
    }
     if (director.staggerChildren === undefined || director.staggeredChildren < 0) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid or missing staggerChildren, defaulting to 0.`);
        scene.director.staggerChildren = 0;
        confidenceScore -= 3;
    }
     if (director.layerDepth === undefined || director.layerDepth < 0 || director.layerDepth > 10) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid layerDepth (must be 0-10), defaulting to 5.`);
        scene.director.layerDepth = 5;
        confidenceScore -= 3;
    }
     if (!director.transformOrigin) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing transformOrigin, defaulting to 'center center'.`);
        scene.director.transformOrigin = 'center center';
        confidenceScore -= 3;
    }
     if (!director.overflowBehavior) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing overflowBehavior, defaulting to 'visible'.`);
        scene.director.overflowBehavior = 'visible';
        confidenceScore -= 3;
    }
     if (!director.backdropBlur) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing backdropBlur, defaulting to 'none'.`);
        scene.director.backdropBlur = 'none';
        confidenceScore -= 3;
    }
     if (!director.mixBlendMode) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing mixBlendMode, defaulting to 'normal'.`);
        scene.director.mixBlendMode = 'normal';
        confidenceScore -= 3;
    }
    // Ensure boolean fields are present
    const booleanFields = ['fadeOnScroll', 'scaleOnScroll', 'blurOnScroll', 'enablePerspective', 'textShadow', 'textGlow'];
    for (const field of booleanFields) {
        if (typeof director[field] !== 'boolean') {
            warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing or invalid ${field}, defaulting to false.`);
            scene.director[field] = false;
            confidenceScore -= 3;
        }
    }
     if (!director.paddingTop) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing paddingTop, defaulting to 'none'.`);
        scene.director.paddingTop = 'none';
        confidenceScore -= 3;
    }
     if (!director.paddingBottom) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing paddingBottom, defaulting to 'none'.`);
        scene.director.paddingBottom = 'none';
        confidenceScore -= 3;
    }
    if (!director.mediaPosition) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing mediaPosition, defaulting to 'center'.`);
        scene.director.mediaPosition = 'center';
        confidenceScore -= 3;
    }
     if (!director.mediaScale) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing mediaScale, defaulting to 'cover'.`);
        scene.director.mediaScale = 'cover';
        confidenceScore -= 3;
    }
    if (typeof director.mediaOpacity !== 'number' || director.mediaOpacity < 0 || director.mediaOpacity > 1) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Invalid mediaOpacity (must be 0-1), defaulting to 1.0.`);
        scene.director.mediaOpacity = 1.0;
        confidenceScore -= 3;
    }
    if (!director.scrollSpeed) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Missing scrollSpeed, defaulting to 'normal'.`);
        scene.director.scrollSpeed = 'normal';
        confidenceScore -= 3;
    }


    // Color contrast check
    if (director.backgroundColor && director.textColor) {
      const bgLower = director.backgroundColor.toLowerCase();
      const textLower = director.textColor.toLowerCase();

      if (bgLower === textLower) {
        warnings.push(`Scene with assets [${scene.assetIds.join(', ')}]: ⚠️ Text and background colors are identical - text will be invisible!`);
        confidenceScore -= 5;
        const isDarkBg = bgLower.includes('#0') || bgLower.includes('#1') || bgLower === '#000000';
        scene.director.textColor = isDarkBg ? '#ffffff' : '#0a0a0a';
        warnings.push(`  → Auto-fixed textColor to ${scene.director.textColor}`);
      }
    }
  }

  // Re-clamp score after warnings
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));
  result.confidenceScore = confidenceScore;
  // Update confidenceFactors with any new issues found during validation
  result.confidenceFactors = Array.from(new Set([...(result.confidenceFactors || []), ...warnings.map(w => w.replace('⚠️ ', ''))]));


  console.log('[Portfolio Director] 🎬 PIPELINE COMPLETE - Final Output:', {
    totalScenes: finalResult.scenes.length,
    stage1: 'Initial generation',
    stage2: `Found ${auditResult.issues.length} issues`,
    stage3: `Generated ${improvementsResult.improvements.length} improvements`,
    stage4: `Applied ${appliedImprovements.length} improvements`,
    stage5: 'Final regeneration with all fixes',
    stage6: warnings.length > 0 ? `${warnings.length} warnings` : 'All validations passed',
    appliedImprovements: appliedImprovements.length > 0 ? appliedImprovements : 'none',
    warnings: warnings.length > 0 ? warnings : 'none',
    sceneSummary: finalResult.scenes.map((s, i) => ({
      index: i,
      type: s.sceneType,
      assets: s.assetIds.length,
      entry: `${s.director.entryEffect} (${s.director.entryDuration}s)`,
      exit: `${s.director.exitEffect} (${s.director.exitDuration}s)`,
      scrollSpeed: s.director.scrollSpeed
    }))
  });

  return {
    scenes: finalResult.scenes,
    confidenceScore: result.confidenceScore,
    confidenceFactors: result.confidenceFactors
  };
}

/**
 * STAGE 3 REFINEMENT: Scene Type-Specific Enhancement Prompts
 * These prompts refine individual scene types based on the 37-control framework
 */

export function buildSplitScenePrompt(scene: GeneratedScene, catalog: ContentCatalog): string {
  return `You are refining a SPLIT scene (side-by-side layout) for maximum cinematic impact.

CURRENT SCENE CONFIGURATION:
${JSON.stringify(scene, null, 2)}

AVAILABLE CONTENT CATALOG:
${JSON.stringify(catalog, null, 2)}

REFINEMENT GOALS:
1. **Layout Balance**: Ensure left/right content creates visual harmony
2. **Transition Design**: Entry/exit effects should work in tandem (staggered reveals)
3. **Typography Hierarchy**: Heading size must dominate, body size supports
4. **Media Presentation**: If using image/video, ensure mediaPosition/mediaScale/mediaOpacity are optimal

SPECIFIC IMPROVEMENTS TO MAKE:

**ANIMATION CHOREOGRAPHY:**
- Use staggerChildren (0.2-0.4s) to reveal left → right or vice versa
- Entry effects should be directional (slide-left for left content, slide-right for right)
- Exit effects should mirror entry (maintain visual flow)

**VISUAL COMPOSITION:**
- If one side has media, ensure mediaOpacity complements text contrast
- Background color should not compete with media (use darker bg if media is bright)
- Text alignment: "left" for left content, "right" for right content (or both "center")

**SCROLL EFFECTS:**
- Avoid scaleOnScroll on split scenes (creates imbalance)
- Use subtle parallaxIntensity (0.2-0.3) for depth, not drama
- fadeOnScroll can work if both sides fade symmetrically

**MANDATORY VALIDATION:**
- All 37 director controls must have values
- Ensure no conflicts (parallax + scale, blur + parallax)
- Durations must be ≥ 1.2s for noticeable choreography

Return the refined scene JSON with complete director config.`;
}

export function buildGalleryScenePrompt(scene: GeneratedScene, catalog: ContentCatalog): string {
  return `You are refining a GALLERY scene (multi-image grid) for maximum visual impact.

CURRENT SCENE CONFIGURATION:
${JSON.stringify(scene, null, 2)}

AVAILABLE CONTENT CATALOG:
${JSON.stringify(catalog, null, 2)}

REFINEMENT GOALS:
1. **Staggered Reveals**: Use staggerChildren (0.1-0.3s) for sequential image appearance
2. **Grid Motion**: Entry effects should work as a wave (top-to-bottom or left-to-right)
3. **Unified Exit**: All images should exit together (no stagger on exit)
4. **Scroll Interaction**: Galleries benefit from scaleOnScroll (subtle zoom as user scrolls)

SPECIFIC IMPROVEMENTS TO MAKE:

**ANIMATION ORCHESTRATION:**
- entryEffect: "fade" or "zoom-in" works best for grids
- entryDuration: 1.5-2.0s (slower than single images for dramatic reveal)
- staggerChildren: 0.15-0.25s (creates wave effect across 4-6 images)
- exitEffect: "fade" or "dissolve" (quick, unified exit at 1.0s)

**VISUAL HARMONY:**
- backgroundColor should contrast with images (dark bg for light images)
- mediaScale: "cover" ensures all images fill grid cells uniformly
- mediaOpacity: 1.0 (full opacity for galleries, no transparency)
- alignment: "center" (galleries are inherently centered)

**SCROLL CHOREOGRAPHY:**
- scaleOnScroll: true (subtle zoom creates depth)
- parallaxIntensity: 0 (conflicts with scale, avoid)
- fadeOnScroll: false (galleries should remain visible)
- scrollSpeed: "normal" or "fast" (galleries are scan-heavy)

**MANDATORY VALIDATION:**
- Verify all 37 controls present
- Ensure staggerChildren matches number of images (0.15s × 6 images = 0.9s total reveal)
- Durations: entry ≥ 1.5s, exit ≥ 1.0s

Return the refined scene JSON with complete director config.`;
}

export function buildQuoteScenePrompt(scene: GeneratedScene, catalog: ContentCatalog): string {
  return `You are refining a QUOTE scene (testimonial/social proof) for maximum emotional impact.

CURRENT SCENE CONFIGURATION:
${JSON.stringify(scene, null, 2)}

AVAILABLE CONTENT CATALOG:
${JSON.stringify(catalog, null, 2)}

REFINEMENT GOALS:
1. **Contemplative Pacing**: Slow, deliberate entry/exit (2.5s+ durations)
2. **Typographic Emphasis**: Large heading size (6xl-8xl), elegant body size (lg-xl)
3. **Minimal Distractions**: No scroll effects, no parallax, pure focus on words
4. **Smooth Transitions**: Cross-fade entry/exit for cinematic feel

SPECIFIC IMPROVEMENTS TO MAKE:

**ANIMATION PHILOSOPHY:**
- entryEffect: "fade" or "cross-fade" (gentle, respectful entrance)
- entryDuration: 2.5-3.0s (allow words to sink in)
- entryEasing: "power3" or "power4" (cinematic deceleration)
- exitEffect: "dissolve" or "cross-fade" (elegant, blurred exit)
- exitDuration: 2.0-2.5s (slightly faster than entry, but still slow)

**TYPOGRAPHIC CONTROL:**
- headingSize: "7xl" or "8xl" (quote text dominates viewport)
- bodySize: "xl" or "2xl" (author/role text is secondary but readable)
- fontWeight: "semibold" for quote, "normal" for author
- alignment: "center" (quotes are inherently centered)

**VISUAL STILLNESS:**
- backgroundColor: Solid color, no gradients (avoid distraction)
- textColor: High contrast with background (#ffffff on #0a0a0a)
- parallaxIntensity: 0 (no motion, quotes are static moments)
- scaleOnScroll: false (no zoom)
- fadeOnScroll: false (no fade)
- blurOnScroll: false (no blur)

**MANDATORY VALIDATION:**
- All 37 controls present
- No scroll effects enabled (quotes are contemplative pauses)
- Durations: entry ≥ 2.5s, exit ≥ 2.0s
- Ensure textShadow: false, textGlow: false (clean, minimalist)

Return the refined scene JSON with complete director config.`;
}

export function buildFullscreenScenePrompt(scene: GeneratedScene, catalog: ContentCatalog): string {
  return `You are refining a FULLSCREEN scene (immersive media takeover) for maximum cinematic impact.

CURRENT SCENE CONFIGURATION:
${JSON.stringify(scene, null, 2)}

AVAILABLE CONTENT CATALOG:
${JSON.stringify(catalog, null, 2)}

REFINEMENT GOALS:
1. **Immersive Entry**: Dramatic zoom-in or dissolve (2.5s+ duration)
2. **Media Presentation**: Ensure mediaPosition/mediaScale create intended focal point
3. **Scroll Depth**: Use parallax or scale for depth perception
4. **Bold Exit**: Fast, aggressive exit (zoom-out, scale-blur) to transition to next scene

SPECIFIC IMPROVEMENTS TO MAKE:

**ANIMATION DRAMA:**
- entryEffect: "zoom-in", "blur-focus", or "spiral-in" (dramatic reveals)
- entryDuration: 2.5-3.5s (hero-level timing)
- entryEasing: "power4" (cinematic deceleration)
- exitEffect: "zoom-out", "scale-blur", or "dissolve" (fast, aggressive)
- exitDuration: 1.5-2.0s (faster than entry for punch)

**MEDIA MASTERY:**
- mediaPosition: "center" (default), or "top"/"bottom" if focal point requires
- mediaScale: "cover" (full bleed, no letterboxing)
- mediaOpacity: 1.0 (fullscreen media is 100% opaque)
- backgroundColor: #0a0a0a (dark fallback if media doesn't load)

**SCROLL CHOREOGRAPHY:**
- parallaxIntensity: 0.4-0.6 (moderate depth, creates immersion)
- scaleOnScroll: false if parallax > 0 (avoid conflict)
- blurOnScroll: true (optional, for 1-2 fullscreen scenes max)
- scrollSpeed: "slow" (cinematic, deliberate scrolling)

**OPTIONAL ENHANCEMENTS:**
- enablePerspective: true if using rotate-in/flip-in effects
- backdropBlur: "none" (media should be sharp, not blurred)
- mixBlendMode: "screen" or "overlay" if you want media to blend with background

**MANDATORY VALIDATION:**
- All 37 controls present
- Ensure parallax + scale conflict resolved (one must be 0/false)
- Durations: entry ≥ 2.5s, exit ≥ 1.5s
- mediaOpacity must be 1.0 for fullscreen

Return the refined scene JSON with complete director config.`;
}

/**
 * STAGE 5: Portfolio-Level Coherence Validation
 * This prompt ensures the entire sequence flows as a unified narrative
 */

export function buildPortfolioCoherencePrompt(scenes: GeneratedScene[], catalog: ContentCatalog): string {
  return `You are performing a FINAL COHERENCE CHECK on a complete portfolio sequence.

FULL SCENE SEQUENCE:
${JSON.stringify(scenes, null, 2)}

DIRECTOR'S VISION:
${catalog.directorNotes}

VALIDATION CHECKLIST (37-CONTROL FRAMEWORK):

**1. TRANSITION FLOW (Scene N → Scene N+1):**
For each adjacent scene pair, verify:
- Exit effect of Scene N complements entry effect of Scene N+1
  * fade → fade = smooth continuity
  * dissolve → cross-fade = cinematic blend
  * slide-up → slide-up = directional consistency
  * zoom-out → zoom-in = dramatic reversal (use sparingly)

**2. PACING RHYTHM (Musical Flow):**
- Variation in durations creates rhythm (avoid monotony)
  * Hero (slow 2.5s) → Content (medium 1.2s) → Gallery (fast 1.0s) → Quote (slow 2.0s)
- scrollSpeed should vary: slow for heroes, normal for content, fast for galleries
- Stagger delays only where needed (max 2-3 scenes with entryDelay > 0)

**3. COLOR PROGRESSION (Visual Journey):**
- Background colors should transition gradually
  * Dark (#0a0a0a) → Mid-tone (#1e293b) → Lighter (#334155) → Back to dark
- Text color must ALWAYS contrast with background
  * Light text (#ffffff, #f1f5f9) on dark backgrounds
  * Dark text (#0a0a0a, #1a1a1a) on light backgrounds

**4. SCROLL EFFECTS DISTRIBUTION:**
- parallaxIntensity: Use on 40% of scenes max (avoid overuse)
  * Text scenes: 0 (no parallax on text)
  * Image/video: 0.3-0.5 (moderate only)
- scaleOnScroll: Use on 20% of scenes max (dramatic moments only)
- blurOnScroll: Use on 10% of scenes max (1-2 scenes for cinematic depth)
- fadeOnScroll: Use on 30% of scenes max (subtle reveals)

**5. CONFLICT RESOLUTION:**
For each scene, verify NO conflicts:
- If parallaxIntensity > 0, then scaleOnScroll MUST be false
- If scaleOnScroll = true, then parallaxIntensity MUST be 0
- If blurOnScroll = true, then parallax and scale SHOULD be 0 (performance)
- backgroundColor ≠ textColor (ensure contrast)

**6. DURATION THRESHOLDS:**
- entryDuration: ≥ 1.2s for noticeable effects (0.8s min for quick reveals)
- exitDuration: ≥ 1.0s (can be faster than entry)
- First scene (hero): entryDuration ≥ 2.5s
- Last scene (closing): exitDuration ≥ 2.0s

**7. TYPOGRAPHY HIERARCHY:**
- Hero scenes: headingSize 7xl-8xl, bodySize xl-2xl
- Content scenes: headingSize 5xl-6xl, bodySize lg-xl
- Supporting scenes: headingSize 4xl-5xl, bodySize base-lg

**8. MANDATORY FIELD PRESENCE:**
Every scene MUST have ALL 37 director controls with valid values:
- ANIMATION & TIMING (8): entryEffect, entryDuration, entryDelay, entryEasing, exitEffect, exitDuration, exitDelay, exitEasing
- VISUAL FOUNDATION (2): backgroundColor, textColor
- SCROLL DEPTH EFFECTS (3): parallaxIntensity, scrollSpeed, animationDuration
- TYPOGRAPHY (4): headingSize, bodySize, fontWeight, alignment
- SCROLL INTERACTION (3): fadeOnScroll, scaleOnScroll, blurOnScroll
- MULTI-ELEMENT TIMING (2): staggerChildren, layerDepth
- ADVANCED MOTION (3): transformOrigin, overflowBehavior, backdropBlur
- VISUAL BLENDING (2): mixBlendMode, enablePerspective
- CUSTOM STYLING (3): customCSSClasses, textShadow, textGlow
- VERTICAL SPACING (2): paddingTop, paddingBottom
- MEDIA PRESENTATION (3): mediaPosition, mediaScale, mediaOpacity
- GRADIENT BACKGROUNDS (2): gradientColors, gradientDirection (nullable)

**YOUR TASK:**
Return a JSON object with:
{
  "isCoherent": boolean, // true if all checks pass
  "issues": [
    {"sceneIndex": number, "issue": string, "suggestion": string}
  ],
  "improvements": [
    {"sceneIndex": number, "field": string, "currentValue": any, "newValue": any, "reason": string}
  ],
  "overallScore": number // 0-100, based on coherence quality
}

Be ruthlessly thorough. Check EVERY scene for EVERY control.`;
}

/**
 * Convert AI-generated scenes to database scene configs
 */
export function convertToSceneConfigs(
  aiScenes: GeneratedScene[],
  catalog: ContentCatalog
): any[] {
  const sceneConfigs: any[] = [];

  // Build asset lookup maps
  const textMap = new Map(catalog.texts.map((t) => [t.id, t]));
  const imageMap = new Map(catalog.images.map((i) => [i.id, i]));
  const videoMap = new Map(catalog.videos.map((v) => [v.id, v]));
  const quoteMap = new Map(catalog.quotes.map((q) => [q.id, q]));

  console.log('[Portfolio Director] Asset Maps:', {
    texts: Array.from(textMap.keys()),
    images: Array.from(imageMap.keys()),
    videos: Array.from(videoMap.keys()),
    quotes: Array.from(quoteMap.keys()),
  });

  // Validate all asset references exist
  const validAssetIds = buildAssetWhitelist(catalog);
  for (const aiScene of aiScenes) {
    console.log(`[Portfolio Director] Scene type "${aiScene.sceneType}" wants assets:`, aiScene.assetIds);
    for (const assetId of aiScene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        console.error(`❌ [Portfolio Director] AI referenced non-existent asset ID: ${assetId}. Valid IDs: ${validAssetIds.join(', ')}`);
      }
    }
  }

  for (const aiScene of aiScenes) {
    const sceneConfig: any = {
      type: aiScene.sceneType,
      content: {},
      layout: aiScene.layout || "default",
      director: { ...DEFAULT_DIRECTOR_CONFIG, ...aiScene.director }, // Merge with defaults
    };

    // Map asset IDs to actual content based on scene type
    switch (aiScene.sceneType) {
      case "text": {
        // Expects 1-2 text assets (heading + optional body)
        const texts = aiScene.assetIds.map((id) => textMap.get(id)).filter(Boolean);
        if (texts.length > 0) {
          const headline = texts.find((t) => t!.type === "headline") || texts[0];
          const paragraph = texts.find((t) => t!.type === "paragraph");
          sceneConfig.content = {
            heading: headline?.content || "Untitled",
            body: paragraph?.content || texts[1]?.content || "",
          };
        } else {
          // Fallback if no assets found
          sceneConfig.content = {
            heading: "Untitled Scene",
            body: "",
          };
        }
        break;
      }

      case "image": {
        // Expects 1 image asset
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const image = imageId ? imageMap.get(imageId) : null;

        if (!image) {
          console.error(`❌ [Portfolio Director] Image scene failed - no matching image found for assetIds:`, aiScene.assetIds);
          console.error(`   Available image IDs:`, Array.from(imageMap.keys()));
        } else {
          console.log(`✅ [Portfolio Director] Image scene matched:`, { imageId, url: image.url });
        }

        sceneConfig.content = image ? {
          url: image.url,
          alt: image.alt || "",
          caption: image.caption,
        } : {
          url: "https://via.placeholder.com/800x600",
          alt: "Placeholder image (NO MATCH FOUND)",
        };
        break;
      }

      case "video": {
        // Expects 1 video asset
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const video = videoId ? videoMap.get(videoId) : null;

        if (!video) {
          console.error(`❌ [Portfolio Director] Video scene failed - no matching video found for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = video ? {
          url: video.url,
          caption: video.caption,
        } : {
          url: "",
          caption: "Video content not available",
        };
        break;
      }

      case "quote": {
        // Expects 1 quote asset
        const quoteId = aiScene.assetIds.find((id) => quoteMap.has(id));
        const quote = quoteId ? quoteMap.get(quoteId) : null;

        if (!quote) {
          console.error(`❌ [Portfolio Director] Quote scene failed - no matching quote found for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = quote ? {
          quote: quote.quote,
          author: quote.author,
          role: quote.role,
        } : {
          quote: "Testimonial content not available",
          author: "Unknown",
          role: "",
        };
        break;
      }

      case "split": {
        // Expects 1 text + 1 media (image or video)
        const texts = aiScene.assetIds.map((id) => textMap.get(id)).filter(Boolean);
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));

        const text = texts[0];
        const image = imageId ? imageMap.get(imageId) : null;
        const video = videoId ? videoMap.get(videoId) : null;

        if (!text) {
          console.error(`❌ [Portfolio Director] Split scene missing text for assetIds:`, aiScene.assetIds);
        }
        if (!image && !video) {
          console.error(`❌ [Portfolio Director] Split scene missing media for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          heading: text?.content || "Content unavailable",
          body: texts[1]?.content || "",
          media: image?.url || video?.url || "https://via.placeholder.com/800x600",
          mediaType: video ? "video" : "image",
          alt: image?.alt || "Placeholder image",
        };
        break;
      }

      case "gallery": {
        // Expects multiple images
        const images = aiScene.assetIds.map((id) => imageMap.get(id)).filter(Boolean);

        if (images.length === 0) {
          console.error(`❌ [Portfolio Director] Gallery scene has no valid images for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          heading: "",
          images: images.length > 0 ? images.map((img) => ({
            url: img!.url,
            alt: img!.alt,
            caption: img!.caption,
          })) : [{
            url: "https://via.placeholder.com/800x600",
            alt: "Placeholder image",
            caption: "Gallery content not available",
          }],
        };
        break;
      }

      case "fullscreen": {
        // Expects 1 media asset
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const image = imageId ? imageMap.get(imageId) : null;
        const video = videoId ? videoMap.get(videoId) : null;

        if (!image && !video) {
          console.error(`❌ [Portfolio Director] Fullscreen scene missing media for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          url: image?.url || video?.url || "https://via.placeholder.com/1920x1080",
          mediaType: video ? "video" : "image",
          alt: image?.alt || "Fullscreen media placeholder",
          overlay: false,
        };
        break;
      }
    }

    sceneConfigs.push(sceneConfig);
  }

  return sceneConfigs;
}