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
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASEURL || "",
      },
    });
  }
  return ai;
}

import { getAllPlaceholderIds, PLACEHOLDER_CONFIG } from "@shared/placeholder-config";

// Build asset ID whitelist from static placeholders (NOT user's catalog)
function buildAssetWhitelist(catalog?: ContentCatalog): string[] { // Added catalog parameter for context
  // If catalog is provided, filter placeholder IDs to those actually available in the catalog.
  // This is crucial for ensuring AI only references IDs it can actually use.
  const availablePlaceholderIds = getAllPlaceholderIds();
  if (!catalog) {
    return availablePlaceholderIds; // Return all if no catalog context
  }

  const availableInCatalog = new Set<string>();

  // Add text placeholders if available
  if (catalog.texts && catalog.texts.length > 0) {
    catalog.texts.forEach(text => {
      if (text.id && availablePlaceholderIds.includes(text.id)) {
        availableInCatalog.add(text.id);
      }
    });
  }

  // Add image placeholders if available
  if (catalog.images && catalog.images.length > 0) {
    catalog.images.forEach(image => {
      if (image.id && availablePlaceholderIds.includes(image.id)) {
        availableInCatalog.add(image.id);
      }
    });
  }

  // Add video placeholders if available
  if (catalog.videos && catalog.videos.length > 0) {
    catalog.videos.forEach(video => {
      if (video.id && availablePlaceholderIds.includes(video.id)) {
        availableInCatalog.add(video.id);
      }
    });
  }

  // Add quote placeholders if available
  if (catalog.quotes && catalog.quotes.length > 0) {
    catalog.quotes.forEach(quote => {
      if (quote.id && availablePlaceholderIds.includes(quote.id)) {
        availableInCatalog.add(quote.id);
      }
    });
  }

  // Ensure all static placeholders are included if they aren't mapped to catalog items
  // This is important for AI to know about ALL possible placeholder slots, even if not used in the current catalog.
  availablePlaceholderIds.forEach(id => {
    if (!availableInCatalog.has(id)) {
      // Add it back if it's a static placeholder and not explicitly used in catalog (e.g., image-1 through image-10 are always available)
      // This logic needs to be precise: we only want to include placeholders that _could_ be used.
      // If a placeholder type (like 'image') has zero items in the catalog, we still list all its placeholders.
      const placeholderType = id.split('-')[0]; // e.g., 'image', 'video', 'text', 'quote'
      if (
        (placeholderType === 'image' && catalog.images?.length === 0) ||
        (placeholderType === 'video' && catalog.videos?.length === 0) ||
        (placeholderType === 'text' && catalog.texts?.length === 0) ||
        (placeholderType === 'quote' && catalog.quotes?.length === 0)
      ) {
        availableInCatalog.add(id);
      } else if (
        (placeholderType === 'image' && catalog.images?.length > 0) ||
        (placeholderType === 'video' && catalog.videos?.length > 0) ||
        (placeholderType === 'text' && catalog.texts?.length > 0) ||
        (placeholderType === 'quote' && catalog.quotes?.length > 0)
      ) {
        // If catalog items EXIST for this type, only add placeholders that ARE mapped
        // This is handled by the above catalog.forEach loops.
      } else {
        // If it's a placeholder type that doesn't exist in the catalog at all (e.g., maybe an older placeholder ID is still listed)
        // We still add it so the AI knows about it, but the generated scenes might not use it.
        availableInCatalog.add(id);
      }
    }
  });


  // Special case: if no items of a certain type exist in catalog, still list all placeholders for that type
  if (catalog.images && catalog.images.length === 0) {
      PLACEHOLDER_CONFIG.images.forEach(id => availableInCatalog.add(id));
  }
  if (catalog.videos && catalog.videos.length === 0) {
      PLACEHOLDER_CONFIG.videos.forEach(id => availableInCatalog.add(id));
  }
  if (catalog.texts && catalog.texts.length === 0) {
      PLACEHOLDER_CONFIG.texts.forEach(id => availableInCatalog.add(id));
  }
  if (catalog.quotes && catalog.quotes.length === 0) {
      PLACEHOLDER_CONFIG.quotes.forEach(id => availableInCatalog.add(id));
  }


  return Array.from(availableInCatalog).sort(); // Sort for consistent output
}


// Build Gemini prompt for portfolio orchestration
function buildPortfolioPrompt(catalog: ContentCatalog): string {
  const validAssetIds = buildAssetWhitelist(catalog); // Pass catalog context

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
You MUST ONLY use these pre-defined placeholder IDs that are AVAILABLE IN THE USER'S CONTENT CATALOG. The user will map their real assets to these placeholders later.

AVAILABLE PLACEHOLDER IDs (based on user's catalog):

IMAGES (${(catalog.images?.length ?? 0)} available):
${(catalog.images?.length ?? 0) > 0 ? catalog.images.map((asset) => `  - "${asset.id}"`).join('\n') : '  (No images in catalog)'}

VIDEOS (${(catalog.videos?.length ?? 0)} available):
${(catalog.videos?.length ?? 0) > 0 ? catalog.videos.map((asset) => `  - "${asset.id}"`).join('\n') : '  (No videos in catalog)'}

QUOTES (${(catalog.quotes?.length ?? 0)} available):
${(catalog.quotes?.length ?? 0) > 0 ? catalog.quotes.map((asset) => `  - "${asset.id}"`).join('\n') : '  (No quotes in catalog)'}

TEXTS (${(catalog.texts?.length ?? 0)} available):
${(catalog.texts?.length ?? 0) > 0 ? catalog.texts.map((asset) => `  - "${asset.id}"`).join('\n') : '  (No texts in catalog)'}

VALID PLACEHOLDER IDS (you MUST use ONLY these exact IDs from the available list above):
${validAssetIds.join(', ')}

DO NOT reference the user's actual asset IDs. Use ONLY the placeholder IDs listed above that are present in their catalog.
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
   Format: String like "shadow-2xl ring-4" or empty string ""
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
- "component": Rich SaaS UI components (metrics, timelines, calculators, comparison tables, badge grids, icon showcases, stat counters, CTA blocks)

FOR EACH SCENE, YOU MUST DECIDE:
1. Which assets to use (from the placeholder list available in the catalog)
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
- "enters from top" → entryEffect: "slide-up"
- "enters from bottom" → entryEffect: "slide-down"
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
   - dissolve → cross-fade (cinematic transition)

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
1. START STRONG: Use image-1 or video-1 for hero/opening scenes if available.
2. BUILD NARRATIVE: Distribute placeholders logically (e.g., image-1 through image-5 for a 5-scene story).
3. VISUAL SUPPORT: Place media placeholders (image-X, video-X) strategically for impact.
4. SOCIAL PROOF: Use quote-1, quote-2, quote-3 for testimonials/credibility if available.
5. VARIETY: Alternate between different placeholder types for visual rhythm.
6. RESERVE PLACEHOLDERS: Don't use all available placeholders in one project - leave room for future expansion.

REMEMBER: You're selecting placeholder SLOTS that are AVAILABLE IN THE USER'S CATALOG, not actual content. The user assigns real assets later.

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
✓ All assetIds MUST reference ONLY placeholder IDs available in the user's catalog (from the list above).

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "sceneType": "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen" | "component",
  "assetIds": string[], // MUST reference valid placeholder IDs ONLY from the available list (empty array for component scenes)
  "layout": "default" | "reverse", // Optional, primarily for split scenes
  "director": {
    // Required fields (37 total - ALL MUST BE PRESENT AND VALID)
    "entryEffect": "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "sudden" | "cross-fade" | "rotate-in" | "flip-in" | "spiral-in" | "elastic-bounce" | "blur-focus",
    "entryDuration": number, // seconds, min 0.8
    "entryDelay": number, // seconds, min 0
    "entryEasing": "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "power1" | "power2" | "power3" | "power4" | "back" | "elastic" | "bounce",
    "exitEffect": "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-out" | "dissolve" | "cross-fade" | "rotate-out" | "flip-out" | "scale-blur",
    "exitDuration": number, // seconds, min 0.6
    "exitDelay": number, // seconds, min 0
    "exitEasing": "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "power1" | "power2" | "power3" | "power4" | "back" | "elastic" | "bounce",
    "backgroundColor": string, // hex code, e.g., "#0a0a0a"
    "textColor": string, // hex code, e.g., "#ffffff"
    "parallaxIntensity": number, // 0.0-1.0 (set to 0 if scaleOnScroll is true)
    "scrollSpeed": "slow" | "normal" | "fast",
    "animationDuration": number, // seconds, min 0.5
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

    // Optional fields (can be null or undefined if not applicable/desired, but defaults will be applied if missing by schema)
    "gradientColors"?: string[] | undefined, // Array of hex colors, e.g., ["#ff0000", "#0000ff"] or undefined
    "gradientDirection"?: string | undefined // e.g., "to-r", "to-br" or undefined
  }
}

Generate the scene sequence NOW using the above format. Ensure ONLY valid placeholder IDs available in the user's catalog are used.
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
 * Stage 3.5: Scene-Type Specific Refinement - AI refines complex scene types (split, gallery, quote, fullscreen)
 * Stage 4: Auto-Apply Non-Conflicting Improvements - System applies valid improvements
 * Stage 5: Final Regeneration - AI regenerates with all fixes applied
 * Stage 5.5: Portfolio-Level Coherence Check - AI validates narrative flow, pacing, color progression etc.
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
      // This is the responseSchema for the Stage 1 'Artistic Director'
      // (buildPortfolioPrompt) - PERFECTED ENFORCER
      stage1Response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Changed model to a more suitable one for this task
        contents: [{
          role: 'user',
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
                      description: "Must be: text, image, video, quote, split, gallery, fullscreen, or component"
                    },
                    assetIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Array of valid placeholder IDs (e.g., ['placeholder-image-1']). MUST be an empty array for 'component' sceneType."
                    },
                    layout: {
                      type: Type.STRING,
                      description: "Optional layout: default or reverse (for split scenes)."
                    },
                    director: {
                      type: Type.OBJECT,
                      properties: {
                        // --- ANIMATION & TIMING (8 controls) ---
                        entryEffect: { type: Type.STRING, description: "e.g., fade, slide-up, zoom-in" },
                        entryDuration: { type: Type.NUMBER, description: "seconds, min 0.8" },
                        entryDelay: { type: Type.NUMBER, description: "seconds, min 0" },
                        entryEasing: { type: Type.STRING, description: "e.g., power2.out" },
                        exitEffect: { type: Type.STRING, description: "e.g., fade, slide-down" },
                        exitDuration: { type: Type.NUMBER, description: "seconds, min 0.6" },
                        exitDelay: { type: Type.NUMBER, description: "seconds, min 0" },
                        exitEasing: { type: Type.STRING, description: "e.g., power2.in" },

                        // --- VISUAL FOUNDATION (2 controls) ---
                        backgroundColor: { type: Type.STRING, description: "Hex code, e.g., #0a0a0a" },
                        textColor: { type: Type.STRING, description: "Hex code, e.g., #ffffff" },

                        // --- SCROLL DEPTH & DURATION (3 controls) ---
                        parallaxIntensity: { type: Type.NUMBER, description: "0.0-1.0. Set to 0 if scaleOnScroll is true" },
                        scrollSpeed: { type: Type.STRING, description: "slow, normal, or fast" },
                        animationDuration: { type: Type.NUMBER, description: "seconds, min 0.5" },

                        // --- TYPOGRAPHY (4 controls) ---
                        headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, or 8xl" },
                        bodySize: { type: Type.STRING, description: "base, lg, xl, or 2xl" },
                        fontWeight: { type: Type.STRING, description: "normal, medium, semibold, or bold" },
                        alignment: { type: Type.STRING, description: "left, center, or right" },

                        // --- SCROLL INTERACTION (3 controls) ---
                        fadeOnScroll: { type: Type.BOOLEAN },
                        scaleOnScroll: { type: Type.BOOLEAN },
                        blurOnScroll: { type: Type.BOOLEAN },

                        // --- MULTI-ELEMENT TIMING (2 controls) ---
                        staggerChildren: { type: Type.NUMBER, description: "seconds, min 0.0" },
                        layerDepth: { type: Type.NUMBER, description: "0-10" },

                        // --- ADVANCED MOTION (3 controls) ---
                        transformOrigin: { type: Type.STRING, description: "e.g., center center" },
                        overflowBehavior: { type: Type.STRING, description: "visible, hidden, or auto" },
                        backdropBlur: { type: Type.STRING, description: "none, sm, md, lg, xl" },

                        // --- VISUAL BLENDING (2 controls) ---
                        mixBlendMode: { type: Type.STRING, description: "e.g., normal, multiply" },
                        enablePerspective: { type: Type.BOOLEAN },

                        // --- CUSTOM STYLING & TEXT (3 controls) ---
                        customCSSClasses: { type: Type.STRING, description: "e.g., 'shadow-xl' or ''" },
                        textShadow: { type: Type.BOOLEAN },
                        textGlow: { type: Type.BOOLEAN },

                        // --- VERTICAL SPACING (2 controls) ---
                        paddingTop: { type: Type.STRING, description: "none, sm, md, lg, xl, 2xl" },
                        paddingBottom: { type: Type.STRING, description: "none, sm, md", },

                        // --- MEDIA PRESENTATION (3 controls) ---
                        // These are now required BUT nullable to allow for 'text' scenes
                        mediaPosition: {
                          type: Type.STRING,
                          description: "center, top, bottom, left, right, or null for text scenes",
                          nullable: true
                        },
                        mediaScale: {
                          type: Type.STRING,
                          description: "cover, contain, fill, or null for text scenes",
                          nullable: true
                        },
                        mediaOpacity: {
                          type: Type.NUMBER,
                          description: "0.0-1.0, or null for text scenes",
                          nullable: true
                        },

                        // --- GRADIENT BACKGROUNDS (2 controls) ---
                        // These are required BUT nullable
                        gradientColors: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Array of hex colors or null",
                          nullable: true
                        },
                        gradientDirection: {
                          type: Type.STRING,
                          description: "e.g., to-r, to-br, or null",
                          nullable: true
                        },
                      },
                      //
                      // --- THE 37-CONTROL ENFORCER ---
                      // This 'required' array now matches the 37-control mandate.
                      // All 37 fields must be present.
                      //
                      required: [
                        // Animation & Timing (8)
                        "entryEffect", "entryDuration", "entryDelay", "entryEasing",
                        "exitEffect", "exitDuration", "exitDelay", "exitEasing",

                        // Visual Foundation (2)
                        "backgroundColor", "textColor",

                        // Scroll Depth & Duration (3)
                        "parallaxIntensity", "scrollSpeed", "animationDuration",

                        // Typography (4)
                        "headingSize", "bodySize", "fontWeight", "alignment",

                        // Scroll Interaction (3)
                        "fadeOnScroll", "scaleOnScroll", "blurOnScroll",

                        // Multi-Element Timing (2)
                        "staggerChildren", "layerDepth",

                        // Advanced Motion (3)
                        "transformOrigin", "overflowBehavior", "backdropBlur",

                        // Visual Blending (2)
                        "mixBlendMode", "enablePerspective",

                        // Custom Styling & Text (3)
                        "customCSSClasses", "textShadow", "textGlow",

                        // Vertical Spacing (2)
                        "paddingTop", "paddingBottom",

                        // Media Presentation (3) - NOW REQUIRED (but nullable)
                        "mediaPosition", "mediaScale", "mediaOpacity",

                        // Gradient Backgrounds (2) - NOW REQUIRED (but nullable)
                        "gradientColors", "gradientDirection"
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

  // Ensure all default values are applied if fields are missing from AI response
  result.scenes.forEach((scene: GeneratedScene) => {
    if (!scene.director) {
      scene.director = {}; // Initialize if completely missing
    }
    // Apply defaults for all fields present in DEFAULT_DIRECTOR_CONFIG
    for (const field in DEFAULT_DIRECTOR_CONFIG) {
      if (scene.director[field] === undefined) {
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field];
      }
    }

    // Explicitly handle nullable fields that might be set to null by AI
    if (scene.director.mediaPosition === null) scene.director.mediaPosition = undefined;
    if (scene.director.mediaScale === null) scene.director.mediaScale = undefined;
    if (scene.director.mediaOpacity === null) scene.director.mediaOpacity = undefined;
    if (scene.director.gradientColors === null) scene.director.gradientColors = undefined;
    if (scene.director.gradientDirection === null) scene.director.gradientDirection = undefined;
  });

  // Calculate confidence score based on completeness
  let confidenceScore = 100;
  let confidenceFactors: string[] = [];

  result.scenes.forEach((scene: GeneratedScene, idx: number) => {
    // Check scene structure
    for (const field of requiredSceneFields) {
      if (!scene[field]) {
        confidenceScore -= 5;
        confidenceFactors.push(`Scene ${idx}: missing ${field}`);
      }
    }

    // Check director configuration completeness against the 37 controls
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
  const auditPrompt = `System Prompt: Stage 2 (The Technical Director)

You are the Technical Director (TD), the "First Assistant Director (1st AD)" for this film production. You are the 'Artistic Director's' (your previous self from Stage 1) most trusted partner.

Your job is not to judge the art. Your job is to ensure the film functions. A single technical failure—a conflict, a missing field, a broken asset link—ruins the art.

Your audit must be ruthless, precise, and 100% technical. The Director is counting on you to find every flaw so they don't have to. You are the final technical gatekeeper before the creative refinement stages.

The "Project Bible" (Core Technical Mandates)

You must validate the entire scene sequence against these non-negotiable technical rules.

The 37-Control Mandate: Every scene MUST contain all 37 director fields. There are no exceptions.

The Nullable Mandate: The gradientColors and gradientDirection fields MUST be present, but their value can be null (represented as undefined in JSON). The mediaPosition, mediaScale, and mediaOpacity fields MUST also be present but can be null/undefined if not applicable (e.g., for text scenes).

The Asset Mandate: The "No Asset Left Behind" rule MUST be obeyed. All placeholders must be used at least once.

The No-Conflict Mandate: All !! CONFLICT !! rules must be respected (e.g., parallax + scale).

The "Source of Truth" Mandate: This audit is based only on the guides at the top of the Stage 1 prompt (the Director's Lexicon and Advanced Artistic Combinations). You MUST ignore the older, redundant guides and matrices at the bottom of that prompt.

The "Mandatory Pre-Audit Monologue" (Your Plan)

Before you return your JSON audit, you MUST first provide your "Technical Rationale" in prose, following this exact format:

TECHNICAL RATIONALE:
"My validation plan is a 4-pass check on all \${sceneCount} scenes:

Pass 1 (Completeness): I will iterate through every scene to verify all 37 mandatory director controls are present.

Pass 2 (Conflicts & Enums): I will verify all !! CONFLICT !! rules (e.g., parallaxIntensity vs scaleOnScroll) and ensure all string values are valid enums (e.g., entryEffect is a valid option).

Pass 3 (Asset Validation): I will check every assetIds array to ensure it only uses valid Placeholder IDs from the master list.

Pass 4 (Asset Utilization): I will aggregate all assetIds used across the entire portfolio to confirm the "No Asset Left Behind" mandate is satisfied.

Audit complete. My findings are as follows..."

(You will then provide the JSON object of issues immediately after this monologue.)

Scene Sequence to Audit

You previously generated this scene sequence JSON:

${JSON.stringify(result, null, 2)}

MANDATORY TECHNICAL AUDIT CHECKLIST

You must now audit the JSON above. For each scene, verify ALL 37 controls are present and valid.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION & TIMING (8 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ entryEffect - (string) Must be a valid enum (e.g., "fade", "slide-up", "zoom-in")
✓ entryDuration - (number) Must be ≥ 0.8s
✓ entryDelay - (number) Must be ≥ 0s
✓ entryEasing - (string) Must be a valid GSAP easing string (e.g., "power2.out")
✓ exitEffect - (string) Must be a valid enum (e.g., "fade", "slide-down")
✓ exitDuration - (number) Must be ≥ 0.6s
✓ exitDelay - (number) Must be ≥ 0s
✓ exitEasing - (string) Must be a valid GSAP easing string (e.g., "power2.in")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL FOUNDATION (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ backgroundColor - (string) Must be a valid 6-digit hex code (e.g., "#0a0a0a")
✓ textColor - (string) Must be a valid 6-digit hex code (e.g., "#FFFFFF")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL DEPTH & DURATION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ parallaxIntensity - (number) Must be 0.0-1.0.
✓ scrollSpeed - (string) Must be "slow", "normal", or "fast".
✓ animationDuration - (number) Must be ≥ 0.5s.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY (4 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ headingSize - (string) Must be a valid enum (e.g., "4xl", "8xl")
✓ bodySize - (string) Must be a valid enum (e.g., "base", "xl")
✓ fontWeight - (string) Must be a valid enum (e.g., "normal", "bold")
✓ alignment - (string) Must be "left", "center", or "right".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCROLL INTERACTION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ fadeOnScroll - (boolean) Must be true or false.
✓ scaleOnScroll - (boolean) Must be true or false.
✓ blurOnScroll - (boolean) Must be true or false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-ELEMENT TIMING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ staggerChildren - (number) Must be ≥ 0.0.
✓ layerDepth - (number) Must be 0-10.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED MOTION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ transformOrigin - (string) Must be a valid origin (e.g., "center center", "top left").
✓ overflowBehavior - (string) Must be "visible", "hidden", or "auto".
✓ backdropBlur - (string) Must be a valid enum (e.g., "none", "md").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL BLENDING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ mixBlendMode - (string) Must be a valid blend mode (e.g., "normal", "multiply").
✓ enablePerspective - (boolean) Must be true or false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOM STYLING & TEXT (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ customCSSClasses - (string) Must be a string (e.g., "shadow-xl" or "").
✓ textShadow - (boolean) Must be true or false.
✓ textGlow - (boolean) Must be true or false.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERTICAL SPACING (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ paddingTop - (string) Must be a valid enum (e.g., "none", "lg").
✓ paddingBottom - (string) Must be a valid enum (e.g., "none", "lg").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIA PRESENTATION (3 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ mediaPosition - (string | null) Must be a valid enum (e.g., "center", "top"), or null.
✓ mediaScale - (string | null) Must be "cover", "contain", or "fill", or null.
✓ mediaOpacity - (number | null) Must be 0.0-1.0, or null.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRADIENT BACKGROUNDS (2 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ gradientColors - (array | null) Must be present. Must be an array of hex strings or null.
✓ gradientDirection - (string | null) Must be present. Must be a valid direction string or null.

CRITICAL CONFLICT DETECTION

You must also find these specific technical failures:

!! CONFLICT !! - parallaxIntensity > 0 and scaleOnScroll: true in the same scene. (Only one can be active. If scaleOnScroll is true, parallaxIntensity MUST be 0).

!! CONFLICT !! - textShadow: true and textGlow: true in the same scene. (Only one can be active).

!! CONFLICT !! - gradientColors is an array (even empty) BUT gradientDirection is null or undefined. (If colors are set, direction must also be set).

!! INVALID PLACEHOLDER !! - An assetIds string does not match an ID from the master list.

Valid IDs: ${getAllPlaceholderIds().join(', ')}

!! ASSET UTILIZATION FAILURE !! - The "No Asset Left Behind" mandate failed. (You must check the entire portfolio and report if any of the ${getAllPlaceholderIds().length} total placeholders were not used at least once).

!! IDENTICAL COLOR !! - backgroundColor and textColor are identical. (This is a 100% string match check. Do not attempt to calculate visual contrast.)

Required Output Format (Monologue, then JSON)

First, provide the Mandatory Pre-Audit Monologue.

Then, return only a JSON object of all issues found.

JSON
{
  "issues": [
    {
      "sceneIndex": 0,
      "field": "director.parallaxIntensity",
      "problem": "!! CONFLICT !!: Conflicts with scaleOnScroll: true",
      "suggestion": "Set scaleOnScroll to false"
    },
    {
      "sceneIndex": 1,
      "field": "director.animationDuration",
      "problem": "Missing required field. This is a 37-control violation.",
      "suggestion": "Add animationDuration: 1.0"
    },
    {
      "sceneIndex": 2,
      "field": "assetIds",
      "problem": "!! INVALID PLACEHOLDER !!: References non-existent placeholder 'image-10'",
      "suggestion": "Use a valid placeholder ID like 'image-1'"
    },
    {
      "sceneIndex": 4,
      "field": "director.gradientDirection",
      "problem": "!! CONFLICT !!: gradientColors is set, but gradientDirection is null",
      "suggestion": "Set gradientDirection (e.g., 'to-br') or set gradientColors to null"
    },
    {
      "sceneIndex": 5,
      "field": "director.textColor",
      "problem": "!! IDENTICAL COLOR !!: textColor (#0a0a0a) is identical to backgroundColor (#0a0a0a)",
      "suggestion": "Change textColor (e.g., to '#ffffff') for visibility."
    }
  ],
  "portfolioLevelIssues": [
    {
      "issueType": "Asset Utilization",
      "problem": "!! ASSET UTILIZATION FAILURE !!: The 'No Asset Left Behind' mandate failed. The following 2 placeholders were unused: 'image-10', 'quote-3'",
      "suggestion": "The portfolio must be regenerated to include these missing assets."
    }
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
          },
          portfolioLevelIssues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issueType: { type: Type.STRING },
                problem: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["issueType", "problem", "suggestion"]
            }
          }
        },
        required: ["issues", "portfolioLevelIssues"]
      }
    }
  });

  const auditResult = JSON.parse(auditResponse.text || '{"issues":[], "portfolioLevelIssues":[]}');
  console.log(`[Portfolio Director] ✅ Stage 2 complete: Found ${auditResult.issues.length} issues`);

  // STAGE 3: Generate 10 Improvements
  const improvementsPrompt = `You previously generated this scene sequence:

${JSON.stringify(result, null, 2)}

User requirements from director notes:
${catalog.directorNotes}

CRITICAL REMINDER - PLACEHOLDER SYSTEM:
You MUST ONLY use these placeholder IDs that are AVAILABLE IN THE USER'S CONTENT CATALOG:
- Images: ${(catalog.images?.length ?? 0) > 0 ? catalog.images.map(a => a.id).join(', ') : '(none)'}
- Videos: ${(catalog.videos?.length ?? 0) > 0 ? catalog.videos.map(a => a.id).join(', ') : '(none)'}
- Quotes: ${(catalog.quotes?.length ?? 0) > 0 ? catalog.quotes.map(a => a.id).join(', ') : '(none)'}
- Texts: ${(catalog.texts?.length ?? 0) > 0 ? catalog.texts.map(a => a.id).join(', ') : '(none)'}

VALID PLACEHOLDER IDS (you MUST use ONLY these exact IDs from the available list above):
${buildAssetWhitelist(catalog).join(', ')}

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

  // STAGE 3.5: Scene Type-Specific Refinement
  console.log('[Portfolio Director] 🎬 Stage 3.5: Running scene-type-specific refinements...');
  const sceneTypeImprovements: string[] = [];

  for (let i = 0; i < result.scenes.length; i++) {
    const scene = result.scenes[i];
    let scenePrompt = '';

    switch (scene.sceneType) {
      case 'split':
        scenePrompt = buildSplitScenePrompt(scene, catalog);
        break;
      case 'gallery':
        scenePrompt = buildGalleryScenePrompt(scene, catalog);
        break;
      case 'quote':
        scenePrompt = buildQuoteScenePrompt(scene, catalog);
        break;
      case 'fullscreen':
        scenePrompt = buildFullscreenScenePrompt(scene, catalog);
        break;
      default:
        // Skip refinement for basic scene types (text, image, video) and 'component'
        if (scene.sceneType === 'component') {
            // Special handling for component scenes if needed, but for now, skip
            console.log(`[Portfolio Director] Stage 3.5 skipping refinement for 'component' scene type (index ${i}).`);
        }
        continue;
    }

    if (scenePrompt) {
      try {
        const sceneRefinementResponse = await aiClient.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [{ role: "user", parts: [{ text: scenePrompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scene: {
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
                        mediaOpacity: { type: Type.NUMBER, nullable: true },
                        gradientColors: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                        gradientDirection: { type: Type.STRING, nullable: true },
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const refinedScene = JSON.parse(sceneRefinementResponse.text || '{}');
        if (refinedScene.scene) {
          result.scenes[i] = refinedScene.scene;
          sceneTypeImprovements.push(`Scene ${i} (${scene.sceneType}): Applied type-specific refinement`);
        }
      } catch (error) {
        console.warn(`[Portfolio Director] Stage 3.5 failed for scene ${i}:`, error);
      }
    }
  }

  console.log(`[Portfolio Director] ✅ Stage 3.5 complete: Applied ${sceneTypeImprovements.length} scene-type refinements`);

  // STAGE 4: Auto-Apply Non-Conflicting Improvements
  const appliedImprovements: string[] = [];
  const validPlaceholderIds = buildAssetWhitelist(catalog); // Use catalog context

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
${auditResult.portfolioLevelIssues.map((issue: any) => `- Portfolio Level: ${issue.issueType} - ${issue.problem}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY 37-CONTROL VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST PROVIDE ALL 37 CONTROLS FOR EVERY SCENE. NO EXCEPTIONS.

ANIMATION & TIMING (8): entryEffect, entryDuration, entryDelay, entryEasing, exitEffect, exitDuration, exitDelay, exitEasing
VISUAL FOUNDATION (2): backgroundColor, textColor
SCROLL DEPTH EFFECTS (3): parallaxIntensity, scrollSpeed, animationDuration
TYPOGRAPHY (4): headingSize, bodySize, fontWeight, alignment
SCROLL INTERACTION (3): fadeOnScroll, scaleOnScroll, blurOnScroll
MULTI-ELEMENT TIMING (2): staggerChildren, layerDepth
ADVANCED MOTION (3): transformOrigin, overflowBehavior, backdropBlur
VISUAL BLENDING (2): mixBlendMode, enablePerspective
CUSTOM STYLING (3): customCSSClasses, textShadow, textGlow
VERTICAL SPACING (2): paddingTop, paddingBottom
MEDIA PRESENTATION (3): mediaPosition, mediaScale, mediaOpacity (nullable)
GRADIENT BACKGROUNDS (2): gradientColors, gradientDirection (nullable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL REQUIREMENTS:
1. All timing is dramatic and noticeable (entryDuration >= 1.2s for impact)
2. Transitions flow seamlessly between scenes
3. NO conflicts (parallax + scaleOnScroll = FORBIDDEN)
4. Color progression creates visual journey
5. Pacing has musical rhythm (varied scrollSpeed and durations)
6. Asset selection tells compelling story
7. ALL placeholder IDs must be valid and AVAILABLE IN THE USER'S CATALOG - ONLY use these exact IDs:
   - Images: ${(catalog.images?.length ?? 0) > 0 ? catalog.images.map(a => a.id).join(', ') : '(none)'}
   - Videos: ${(catalog.videos?.length ?? 0) > 0 ? catalog.videos.map(a => a.id).join(', ') : '(none)'}
   - Quotes: ${(catalog.quotes?.length ?? 0) > 0 ? catalog.quotes.map(a => a.id).join(', ') : '(none)'}
   - Texts: ${(catalog.texts?.length ?? 0) > 0 ? catalog.texts.map(a => a.id).join(', ') : '(none)'}
8. DO NOT invent new placeholder IDs or reference user asset IDs.

BEFORE GENERATING OUTPUT, VERIFY:
✓ Every scene has ALL 37 director fields with concrete values
✓ No field is set to "default", "auto", or left as undefined
✓ gradientColors is either an array of hex codes OR undefined (not null)
✓ gradientDirection is either a string OR undefined (not null)
✓ mediaPosition, mediaScale, mediaOpacity are handled correctly (undefined if not applicable, or valid value)
✓ All durations are ≥ 0.8s for visibility
✓ All colors are valid hex codes with # prefix
✓ No conflicts (parallaxIntensity = 0 when scaleOnScroll = true)
✓ scrollSpeed is one of: "slow" | "normal" | "fast"

PLACEHOLDER SYSTEM REMINDER:
You MUST use ONLY these placeholder IDs that are AVAILABLE IN THE USER'S CATALOG.
${buildAssetWhitelist(catalog).join(', ')}

DO NOT reference user asset IDs. The user will map placeholders to their real assets later.

Return the complete scenes array with full director configs. Ensure ALL 37 required director fields are present for each scene.

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "sceneType": "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen",
  "assetIds": string[], // MUST reference valid placeholder IDs ONLY from the available list
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
    "mediaPosition": string | null, // Nullable
    "mediaScale": string | null, // Nullable
    "mediaOpacity": number | null, // Nullable
    "gradientColors"?: string[] | undefined, // Optional: array or undefined
    "gradientDirection"?: string | undefined // Optional: string or undefined
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
                    mediaOpacity: { type: Type.NUMBER, nullable: true },
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

  // STAGE 5.5: Portfolio-Level Coherence Validation
  console.log('[Portfolio Director] 🎬 Stage 5.5: Validating portfolio-level coherence...');

  const coherencePrompt = buildPortfolioCoherencePrompt(finalResult.scenes, catalog);

  let coherenceResult;
  try {
    const coherenceResponse = await aiClient.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: coherencePrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCoherent: { type: Type.BOOLEAN },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneIndex: { type: Type.NUMBER },
                  issue: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                }
              }
            },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneIndex: { type: Type.NUMBER },
                  field: { type: Type.STRING },
                  currentValue: { type: Type.ANY }, // Allow any type for current value
                  newValue: { type: Type.ANY }, // Allow any type for new value
                  reason: { type: Type.STRING }
                }
              }
            },
            overallScore: { type: Type.NUMBER }
          }
        }
      }
    });

    coherenceResult = JSON.parse(coherenceResponse.text || '{"isCoherent":true,"issues":[],"improvements":[],"overallScore":100}');

    console.log(`[Portfolio Director] 📊 Coherence Score: ${coherenceResult.overallScore}/100`);
    console.log(`[Portfolio Director] 🔍 Found ${coherenceResult.issues.length} coherence issues`);

    // Apply coherence improvements if score is below 85
    if (coherenceResult.overallScore < 85 && coherenceResult.improvements.length > 0) {
      console.log(`[Portfolio Director] 🔧 Applying ${coherenceResult.improvements.length} coherence improvements...`);

      for (const improvement of coherenceResult.improvements) {
        const scene = finalResult.scenes[improvement.sceneIndex];
        if (scene) {
          const fieldPath = improvement.field.split('.');
          let target: any = scene;

          for (let i = 0; i < fieldPath.length - 1; i++) {
            if (!target[fieldPath[i]]) {
              target[fieldPath[i]] = {};
            }
            target = target[fieldPath[i]];
          }

          const finalField = fieldPath[fieldPath.length - 1];
          let newValue: any = improvement.newValue;

          // Type conversion
          try {
            // Attempt to convert to number if the original field is a number
            if (typeof (scene.director as any)[finalField] === 'number') {
              newValue = parseFloat(improvement.newValue);
              if (isNaN(newValue)) throw new Error("Not a number");
            } else if (typeof (scene.director as any)[finalField] === 'boolean') {
              newValue = improvement.newValue.toLowerCase() === 'true';
            }
            // Add more specific type conversions if needed based on field definitions
          } catch (e) {
            console.warn(`[Portfolio Director] Type conversion warning for ${improvement.field}: ${e}`);
            // If conversion fails, it might remain a string, or we might default
            // For simplicity here, we'll keep the original string value if conversion fails
          }

          (target as any)[finalField] = newValue;
        }
      }
    }

    console.log(`[Portfolio Director] ✅ Stage 5.5 complete: Portfolio coherence validated`);
  } catch (error) {
    console.warn('[Portfolio Director] Stage 5.5 failed, continuing with current scenes:', error);
  }

  // STAGE 6: Final Validation Against Requirements
  console.log('[Portfolio Director] ✅ Stage 6: Final validation - checking all 37 controls');

  const finalValidAssetIds = buildAssetWhitelist(catalog); // Static placeholders only
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
    mediaPosition: { type: 'string', enum: ['center', 'top', 'bottom', 'left', 'right'] }, // Note: This will be validated as string, nulls handled separately
    mediaScale: { type: 'string', enum: ['cover', 'contain', 'fill'] }, // Note: This will be validated as string, nulls handled separately
    mediaOpacity: { type: 'number', min: 0, max: 1 } // Note: This will be validated as number, nulls handled separately
  };

  for (const scene of finalResult.scenes) {
    // Ensure director object exists and has all default values applied first
    if (!scene.director) {
        scene.director = {};
    }
    for (const field in DEFAULT_DIRECTOR_CONFIG) {
        if (scene.director[field] === undefined) {
            scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field];
        }
    }

    // Handle nullable fields explicitly for validation logic
    const mediaPosition = scene.director.mediaPosition === null ? undefined : scene.director.mediaPosition;
    const mediaScale = scene.director.mediaScale === null ? undefined : scene.director.mediaScale;
    const mediaOpacity = scene.director.mediaOpacity === null ? undefined : scene.director.mediaOpacity;
    const gradientColors = scene.director.gradientColors === null ? undefined : scene.director.gradientColors;
    const gradientDirection = scene.director.gradientDirection === null ? undefined : scene.director.gradientDirection;


    // Validate all 37 required controls
    for (const [field, spec] of Object.entries(requiredDirectorControls)) {
      // Get the value, considering that nullable fields might be undefined
      const value = scene.director[field];

      // Check if field is missing (undefined or null if it's supposed to be non-nullable)
      if (value === undefined || value === null) {
        // Check if the field is explicitly allowed to be null/undefined (nullable fields)
        const isNullableField = ['mediaPosition', 'mediaScale', 'mediaOpacity', 'gradientColors', 'gradientDirection'].includes(field);

        if (!isNullableField) {
          warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Missing required field '${field}' - applying default`);
          scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? (spec.type === 'boolean' ? false : spec.type === 'number' ? 0 : '');
          confidenceScore -= 3;
          continue;
        }
        // If it's a nullable field and missing, we don't warn unless it causes a conflict later
      }

      // Type validation
      if (spec.type === 'number' && typeof value !== 'number') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be number, got ${typeof value}. Applying default.`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? 0; // Default to 0 for numbers
        confidenceScore -= 2;
      } else if (spec.type === 'string' && typeof value !== 'string') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be string, got ${typeof value}. Applying default.`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? ''; // Default to empty string
        confidenceScore -= 2;
      } else if (spec.type === 'boolean' && typeof value !== 'boolean') {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' should be boolean, got ${typeof value}. Applying default.`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? false; // Default to false
        confidenceScore -= 2;
      }

      // Enum validation
      if (spec.enum && typeof value === 'string' && !spec.enum.includes(value)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' has invalid value '${value}'. Must be one of: ${spec.enum.join(', ')}. Applying default.`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? spec.enum[0]; // Default to first enum value
        confidenceScore -= 3;
      }

      // Range validation
      if (spec.type === 'number') {
        if (spec.min !== undefined && value < spec.min) {
          warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value ${value} is below minimum ${spec.min}. Applying default.`);
          scene.director[field] = Math.max(value, spec.min); // Clamp to min
          confidenceScore -= 2;
        }
        if (spec.max !== undefined && value > spec.max) {
          warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value ${value} exceeds maximum ${spec.max}. Applying default.`);
          scene.director[field] = Math.min(value, spec.max); // Clamp to max
          confidenceScore -= 2;
        }
      }

      // Pattern validation (for hex colors)
      if (spec.pattern && typeof value === 'string' && !spec.pattern.test(value)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Field '${field}' value '${value}' doesn't match required pattern. Applying default.`);
        scene.director[field] = DEFAULT_DIRECTOR_CONFIG[field] ?? '#000000'; // Default to black
        confidenceScore -= 3;
      }
    }

    // Validate nullable fields specifically
    if (mediaPosition !== undefined && mediaPosition !== null && !['center', 'top', 'bottom', 'left', 'right'].includes(mediaPosition)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Invalid mediaPosition '${mediaPosition}'. Setting to null.`);
        scene.director.mediaPosition = null;
        confidenceScore -= 2;
    }
    if (mediaScale !== undefined && mediaScale !== null && !['cover', 'contain', 'fill'].includes(mediaScale)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Invalid mediaScale '${mediaScale}'. Setting to null.`);
        scene.director.mediaScale = null;
        confidenceScore -= 2;
    }
    if (mediaOpacity !== undefined && mediaOpacity !== null && (typeof mediaOpacity !== 'number' || mediaOpacity < 0 || mediaOpacity > 1)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Invalid mediaOpacity '${mediaOpacity}'. Setting to null.`);
        scene.director.mediaOpacity = null;
        confidenceScore -= 2;
    }

    // Validate gradient fields if present
    if (gradientColors !== undefined && gradientColors !== null) {
      if (!Array.isArray(gradientColors)) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors should be array or null/undefined, got ${typeof gradientColors}. Setting to undefined.`);
        scene.director.gradientColors = undefined;
        confidenceScore -= 2;
      } else if (gradientColors.length === 0) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors array is empty, setting to undefined.`);
        scene.director.gradientColors = undefined;
      } else {
        // Validate each color is a hex code
        for (const color of gradientColors) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
            warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: Invalid gradient color '${color}' - must be hex code. Setting gradientColors to undefined.`);
            scene.director.gradientColors = undefined;
            confidenceScore -= 2;
            break; // Stop checking colors if one is invalid
          }
        }
      }
    }

    // Validate gradientDirection is set if gradientColors is set
    if (scene.director.gradientColors !== undefined && scene.director.gradientColors !== null && (scene.director.gradientDirection === undefined || scene.director.gradientDirection === null)) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: gradientColors set but gradientDirection missing, setting to 'to-br'`);
      scene.director.gradientDirection = 'to-br'; // Default direction
      confidenceScore -= 1;
    }


    // Validate asset IDs against static placeholders that are available in the catalog
    for (const assetId of scene.assetIds) {
      if (!finalValidAssetIds.includes(assetId)) {
        const errorMsg = `AI referenced invalid placeholder ID: ${assetId}. Valid placeholder IDs available in catalog: ${finalValidAssetIds.join(', ')}`;
        console.error(`❌ [Portfolio Director] ${errorMsg}`);
        // Add to confidence factors as a warning
        confidenceScore -= 3; // Deduct score for invalid placeholder ID
        confidenceFactors.push(`Scene with assets [${scene.assetIds.join(', ')}]: Invalid placeholder ID "${assetId}"`);
      }
    }

    // Validate director fields and conflicts
    const director = scene.director;

    // Conflict checks
    if (director.parallaxIntensity > 0 && director.scaleOnScroll) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ parallax + scaleOnScroll conflict detected. Auto-fixing scaleOnScroll to false.`);
      scene.director.scaleOnScroll = false; // Auto-fix
    }
    if (director.blurOnScroll && director.parallaxIntensity > 0) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ blurOnScroll conflicts with parallax. Auto-fixing blurOnScroll to false.`);
        scene.director.blurOnScroll = false; // Auto-fix
    }
     if (director.blurOnScroll && director.scaleOnScroll) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ blurOnScroll conflicts with scaleOnScroll. Auto-fixing blurOnScroll to false.`);
        scene.director.blurOnScroll = false; // Auto-fix
    }
    if (director.textShadow && director.textGlow) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ textShadow and textGlow conflict. Auto-fixing textGlow to false.`);
        scene.director.textGlow = false;
    }

    // Duration checks
    if (director.entryDuration !== undefined && director.entryDuration < 0.5) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Entry duration ${director.entryDuration}s may be too subtle.`);
      confidenceScore -= 2;
    }
    if (director.exitDuration !== undefined && director.exitDuration < 0.4) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Exit duration ${director.exitDuration}s may be too abrupt.`);
      confidenceScore -= 2;
    }

    // Required field presence and basic validity (re-check after defaults are applied)
    if (typeof director.entryDuration !== 'number' || director.entryDuration < 0.1) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid or missing entryDuration, defaulting to 1.2s.`);
      scene.director.entryDuration = 1.2; // Default
      confidenceScore -= 3;
    }
    if (typeof director.exitDuration !== 'number' || director.exitDuration < 0.1) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid or missing exitDuration, defaulting to 1.0s.`);
      scene.director.exitDuration = 1.0; // Default
      confidenceScore -= 3;
    }
    if (typeof director.entryDelay !== 'number' || director.entryDelay < 0) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid or missing entryDelay, defaulting to 0s.`);
      scene.director.entryDelay = 0; // Default
    }
    if (typeof director.exitDelay !== 'number' || director.exitDelay < 0) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid or missing exitDelay, defaulting to 0s.`);
      scene.director.exitDelay = 0; // Default
    }
    if (typeof director.parallaxIntensity !== 'number' || director.parallaxIntensity < 0 || director.parallaxIntensity > 1) {
      warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid parallaxIntensity (must be 0-1), defaulting to 0.3.`);
      scene.director.parallaxIntensity = 0.3; // Default
      confidenceScore -= 3;
    }
    if (!director.entryEffect) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing entryEffect, defaulting to 'fade'.`);
        scene.director.entryEffect = 'fade';
        confidenceScore -= 3;
    }
    if (!director.exitEffect) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing exitEffect, defaulting to 'fade'.`);
        scene.director.exitEffect = 'fade';
        confidenceScore -= 3;
    }
     if (!director.backgroundColor) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing backgroundColor, defaulting to '#000000'.`);
        scene.director.backgroundColor = '#000000';
        confidenceScore -= 3;
    }
     if (!director.textColor) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing textColor, defaulting to '#ffffff'.`);
        scene.director.textColor = '#ffffff';
        confidenceScore -= 3;
    }
     if (!director.headingSize) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing headingSize, defaulting to '4xl'.`);
        scene.director.headingSize = '4xl';
        confidenceScore -= 3;
    }
     if (!director.bodySize) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing bodySize, defaulting to 'base'.`);
        scene.director.bodySize = 'base';
        confidenceScore -= 3;
    }
     if (!director.alignment) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing alignment, defaulting to 'center'.`);
        scene.director.alignment = 'center';
        confidenceScore -= 3;
    }
    if (!director.fontWeight) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing fontWeight, defaulting to 'normal'.`);
        scene.director.fontWeight = 'normal';
        confidenceScore -= 3;
    }
     if (director.staggerChildren === undefined || director.staggeredChildren < 0) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid or missing staggerChildren, defaulting to 0.`);
        scene.director.staggerChildren = 0;
        confidenceScore -= 3;
    }
     if (director.layerDepth === undefined || director.layerDepth < 0 || director.layerDepth > 10) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid layerDepth (must be 0-10), defaulting to 5.`);
        scene.director.layerDepth = 5;
        confidenceScore -= 3;
    }
     if (!director.transformOrigin) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing transformOrigin, defaulting to 'center center'.`);
        scene.director.transformOrigin = 'center center';
        confidenceScore -= 3;
    }
     if (!director.overflowBehavior) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing overflowBehavior, defaulting to 'visible'.`);
        scene.director.overflowBehavior = 'visible';
        confidenceScore -= 3;
    }
     if (!director.backdropBlur) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing backdropBlur, defaulting to 'none'.`);
        scene.director.backdropBlur = 'none';
        confidenceScore -= 3;
    }
     if (!director.mixBlendMode) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing mixBlendMode, defaulting to 'normal'.`);
        scene.director.mixBlendMode = 'normal';
        confidenceScore -= 3;
    }
    // Ensure boolean fields are present
    const booleanFields = ['fadeOnScroll', 'scaleOnScroll', 'blurOnScroll', 'enablePerspective', 'textShadow', 'textGlow'];
    for (const field of booleanFields) {
        if (typeof director[field] !== 'boolean') {
            warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing or invalid ${field}, defaulting to false.`);
            scene.director[field] = false;
            confidenceScore -= 3;
        }
    }
     if (!director.paddingTop) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing paddingTop, defaulting to 'none'.`);
        scene.director.paddingTop = 'none';
        confidenceScore -= 3;
    }
     if (!director.paddingBottom) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing paddingBottom, defaulting to 'none'.`);
        scene.director.paddingBottom = 'none';
        confidenceScore -= 3;
    }
    if (!director.mediaPosition) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing mediaPosition, defaulting to 'center'.`);
        scene.director.mediaPosition = 'center';
        confidenceScore -= 3;
    }
     if (!director.mediaScale) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing mediaScale, defaulting to 'cover'.`);
        scene.director.mediaScale = 'cover';
        confidenceScore -= 3;
    }
    if (typeof director.mediaOpacity !== 'number' || director.mediaOpacity < 0 || director.mediaOpacity > 1) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Invalid mediaOpacity (must be 0-1), defaulting to 1.0.`);
        scene.director.mediaOpacity = 1.0;
        confidenceScore -= 3;
    }
    if (!director.scrollSpeed) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Missing scrollSpeed, defaulting to 'normal'.`);
        scene.director.scrollSpeed = 'normal';
        confidenceScore -= 3;
    }


    // Color contrast check
    if (director.backgroundColor && director.textColor) {
      const bgLower = director.backgroundColor.toLowerCase();
      const textLower = director.textColor.toLowerCase();

      if (bgLower === textLower) {
        warnings.push(`Scene ${finalResult.scenes.indexOf(scene) + 1}: ⚠️ Text and background colors are identical - text will be invisible!`);
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
    stage3_5: `Applied ${sceneTypeImprovements.length} scene-type refinements`,
    stage4: `Applied ${appliedImprovements.length} improvements`,
    stage5: 'Final regeneration with all fixes',
    stage5_5: `Coherence validated (${coherenceResult?.overallScore ?? 'N/A'}/100)`,
    stage6: warnings.length > 0 ? `${warnings.length} validation warnings` : 'All validations passed',
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
 * STAGE 5.5: Portfolio-Level Coherence Validation
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
- MEDIA PRESENTATION (3): mediaPosition, mediaScale, mediaOpacity (nullable)
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

  // Validate all asset references exist against available placeholders in catalog
  const validAssetIds = buildAssetWhitelist(catalog);
  for (const aiScene of aiScenes) {
    console.log(`[Portfolio Director] Scene type "${aiScene.sceneType}" wants assets:`, aiScene.assetIds);
    for (const assetId of aiScene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        console.error(`❌ [Portfolio Director] AI referenced non-existent or unavailable placeholder ID: ${assetId}. Valid IDs available in catalog: ${validAssetIds.join(', ')}`);
      }
    }
  }

  for (const aiScene of aiScenes) {
    // Ensure default values are applied before merging AI scene director config
    const mergedDirectorConfig = { ...DEFAULT_DIRECTOR_CONFIG };
    // Overwrite defaults with AI-generated values, handling potential nulls correctly
    if (aiScene.director) {
      for (const key in aiScene.director) {
        // Assign if the value from AI is not undefined. Treat null as potentially valid if the field allows it.
        // For nullable fields, we might want to explicitly assign undefined if AI returned null and it's not desired.
        if (aiScene.director[key] !== undefined) {
          // If the field is nullable and AI returned null, keep it null (or undefined if preferred)
          if (['mediaPosition', 'mediaScale', 'mediaOpacity', 'gradientColors', 'gradientDirection'].includes(key) && aiScene.director[key] === null) {
             mergedDirectorConfig[key] = undefined; // Prefer undefined over null for consistency
          } else {
             mergedDirectorConfig[key] = aiScene.director[key];
          }
        }
      }
    }

    const sceneConfig: any = {
      type: aiScene.sceneType,
      content: {},
      layout: aiScene.layout || "default",
      director: mergedDirectorConfig,
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
          console.error(`   Available image IDs in catalog:`, Array.from(imageMap.keys()));
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
          console.error(`   Available video IDs in catalog:`, Array.from(videoMap.keys()));
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
          console.error(`   Available quote IDs in catalog:`, Array.from(quoteMap.keys()));
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
          console.error(`   Available image IDs in catalog:`, Array.from(imageMap.keys()));
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
          console.error(`   Available image IDs in catalog:`, Array.from(imageMap.keys()));
          console.error(`   Available video IDs in catalog:`, Array.from(videoMap.keys()));
        }

        sceneConfig.content = {
          url: image?.url || video?.url || "https://via.placeholder.com/1920x1080",
          mediaType: video ? "video" : "image",
          alt: image?.alt || "Fullscreen media placeholder",
          overlay: false,
        };
        break;
      }
      case "component": {
        // Component scenes do not use assetIds directly from the catalog.
        // They will reference component names or configurations.
        // For now, we assign an empty array and rely on the AI's director config.
        sceneConfig.assetIds = []; // Explicitly empty for component scenes
        sceneConfig.content = {
          // The AI will populate this based on the director config and potentially other context
          // For example, it might specify which specific component to render and its props.
          // This will likely be a JSON object defining the component and its configuration.
        };
        break;
      }
    }

    sceneConfigs.push(sceneConfig);
  }

  return sceneConfigs;
}