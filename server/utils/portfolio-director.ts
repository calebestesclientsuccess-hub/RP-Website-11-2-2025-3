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
  const totalImagesProvided = catalog.images?.length ?? 0;
  const totalVideosProvided = catalog.videos?.length ?? 0;
  const totalQuotesProvided = catalog.quotes?.length ?? 0;

  // Get placeholder IDs for the prompt - using template string interpolation
  const placeholderImages = PLACEHOLDER_CONFIG.images.map((id) => `"${id}"`).join(', ');
  const placeholderVideos = PLACEHOLDER_CONFIG.videos.map((id) => `"${id}"`).join(', ');
  const placeholderQuotes = PLACEHOLDER_CONFIG.quotes.map((id) => `"${id}"`).join(', ');

  return `You are an Artistic Director and Cinematic Storyteller for a high-end, scroll-driven web portfolio system. Your role is not merely to select options, but to translate an abstract creative vision and a collection of assets into a technically precise and emotionally resonant digital experience.

This is a "content-first" system. Your primary job is to build a beautiful story with the assets the user gives you.

1. The Creative Brief (User's Vision)

You will be given "Director's Notes" from the user. This is their creative vision in natural language.

START DIRECTOR'S NOTES
${catalog.directorNotes}
END DIRECTOR'S NOTES

2. The "Content-First" Mandate (Your Core Strategy)

This is your most important new instruction. You will be told how many assets the user has provided. Your entire creative strategy must adapt to this.

User-Provided Asset Counts:
Images: ${totalImagesProvided}
Videos: ${totalVideosProvided}
Quotes: ${totalQuotesProvided}

You must now decide if the media is "plentiful" or "sparse" and build the portfolio accordingly.

IF MEDIA IS "PLENTIFUL" (e.g., >8 Images, >1 Video):
Your Strategy: Be expressive. The user has given you a full toolkit.
Action: Freely use gallery scenes, fullscreen video scenes, and media-heavy split scenes. Show off the user's rich content.

IF MEDIA IS "SPARSE" (e.g., <4 Images, 0 Videos):
Your Strategy: You must be a master artist and a content strategist. You cannot build a media-heavy site.
Action: Treat each asset as a precious "hero" moment. Use the few images you have for the "Act 1 Hook" or a single, powerful image scene.
Action: You MUST lean heavily on text, quote, and component scenes to build the rest of the portfolio. This is how you create a rich experience without a lot of media.

3. Your Dual-Track Creative Toolkit

You now have two types of scenes in your toolkit. You must use both to build a complete portfolio.

Toolbox A: The "Cinematic" Scenes

These are the 37-control scenes (text, image, video, quote, etc.) that create the "scrollytelling" experience. Use them for big, emotional, full-screen moments.

The Director's Lexicon (Interpretation Matrix): This is how you translate Director's Notes into director controls.

If the Director's Notes say "Dramatic," "Epic," "Cinematic," "Bold":
* Pacing: Slow down. Use negative space.
* entryDuration: 2.0s - 4.0s
* exitDuration: 1.5s - 3.0s
* entryEasing: power3.out or power4.out (strong but smooth)
* headingSize: 7xl or 8xl
* parallaxIntensity: 0.3 - 0.6 (creates depth)
* backgroundColor: Dark, moody colors (#0a0a0a, #111111)

If the Director's Notes say "Fast," "Energetic," "Quick," "Modern":
* Pacing: Rapid. Quick cuts.
* entryDuration: 0.8s - 1.2s
* exitDuration: 0.6s - 1.0s
* entryEffect: slide-up, spiral-in, or sudden
* entryEasing: power2.inOut or back.out(1.7) (peppy)
* staggerChildren: 0.1s (for rapid-fire gallery reveals)

If the Director's Notes say "Minimal," "Clean," "Elegant," "Spacious":
* Pacing: Calm, measured, lots of breathing room.
* entryEffect: fade or blur-focus
* entryDuration: 1.5s - 2.5s
* backgroundColor: #FFFFFF, #F9F9F9, #F0F0F0
* textColor: #0A0A0A or #111111
* paddingTop: xl or 2xl
* paddingBottom: xl or 2xl
* fontWeight: normal or medium

If the Director's Notes say "Playful," "Fun," "Bouncy":
* Pacing: Surprising and whimsical.
* entryEffect: elastic-bounce or rotate-in
* entryEasing: elastic.out(1, 0.3) or bounce.out
* transformOrigin: Use "non-standard" origins like top left
* staggerChildren: 0.2s
* fontWeight: semibold

If the Director's Notes say "Heavy," "Strong," "Brutal":
* Pacing: Deliberate, impactful.
* entryEffect: zoom-in or sudden
* headingSize: 8xl
* fontWeight: bold
* alignment: center
* mixBlendMode: difference or exclusion (for high-contrast text)
* textColor: #FFFFFF
* backgroundColor: #000000

If the Director's Notes say "Soft," "Dreamy," "Subtle":
* Pacing: Very slow, ethereal.
* entryEffect: fade, blur-focus, or cross-fade
* entryDuration: 3.0s - 5.0s
* mediaOpacity: 0.8 - 0.9 (slightly transparent media)
* backdropBlur: sm or md (glass morphism)
* gradientColors: Use soft pastels (e.g., ["#F0C2E2", "#C2E8F0"])

If the Director's Notes say "Seamless," "Flowing," "Smooth":
* Creation of a cohesive flow is paramount.
* entryEffect / exitEffect: Use cross-fade for all scenes.
* entryDuration: 1.5s
* exitDuration: 1.5s (match them for a perfect dissolve)
* entryEasing: linear (no acceleration)

Advanced Artistic Combinations (The Director's Recipes): Use these powerful, pre-defined combinations to achieve sophisticated aesthetics.

The "Ethereal Dream" Recipe:
Use Case: For soft, subtle, or dream-like content (e.g., quote scenes).
entryEffect: "blur-focus"
entryDuration: 3.5s
mediaOpacity: 0.9 (if media is present)
backdropBlur: "md"
gradientColors: ["#E0C3FC", "#8EC5FC"] (soft pastels)
textGlow: true

The "Brutalist Impact" Recipe:
Use Case: For bold, high-contrast, "in-your-face" statements (e.g., text scenes).
entryEffect: "sudden" (or zoom-in from 0.8 scale)
headingSize: "8xl"
fontWeight: "bold"
mixBlendMode: "difference"
backgroundColor: "#FFFFFF"
textColor: "#000000" (or vice-versa)

The "Cinematic Depth" Recipe:
Use Case: For creating a 3D, layered feel in image or fullscreen scenes.
parallaxIntensity: 0.6
enablePerspective: true
animationDuration: 4.0s
mediaPosition: "bottom" (to make it feel grounded)
gradientColors: ["#00000000", "#000000"] (a transparent-to-black vignette)
gradientDirection: "to-t" (from the bottom up)

Toolbox B: The "Component" Scenes

These are data-rich, "language of SaaS" scenes. Use them to build the "Act 2: Content" of the portfolio, especially when media is sparse.

The Component Lexicon: This is how you translate Director's Notes into content objects.

If Vision is "data-driven," "results," "KPIs":
Use a metric-card component.

If Vision is "process," "roadmap," "history":
Use a timeline component.

If Vision is "showcasing features," "tech stack":
Use an icon-grid or badge-cluster component.

If Vision is "ROI," "calculator," "interactive":
Use a calculator component.

4. The Principle of Narrative Arc

This principle still governs the entire portfolio. You must use your two toolboxes to build a 3-act story.

Act 1: The Hook: A powerful opening. (Usually a fullscreen, image, or text scene).
Act 2: The Content: The body of the work. (A mix of split, gallery, and component scenes).
Act 3: The Conclusion: A final, memorable statement. (Usually a quote or text scene).

5. The Asset & Placeholder System

This is your new asset management rule.

User-Provided Asset Counts (Again):
Images: ${totalImagesProvided}
Videos: ${totalVideosProvided}
Quotes: ${totalQuotesProvided}

Available Placeholder IDs (Your Asset "Palette"):
Images: ${placeholderImages}
Videos: ${placeholderVideos}
Quotes: ${placeholderQuotes}

YOUR NEW ASSET SELECTION MANDATE:
The "No Asset Left Behind" rule is DELETED. Your new rule is "Do Not Overdraw."

You MUST respect the totalImagesProvided count. If totalImagesProvided is 3, you can ONLY use "placeholder-image-1", "placeholder-image-2", and "placeholder-image-3".
You CANNOT use "placeholder-image-4" if the user only provided 3 images.
You CANNOT create a gallery scene that requires 5 images if the user only provided 3.
If media is "sparse" (e.g., 0 videos), you MUST NOT create a video scene. You must use a component or text scene instead.

6. The "Cinematic" Toolkit (The 37 Mandatory Controls)

Use these 37 controls ONLY when sceneType is:
"text", "image", "video", "quote", "split", "gallery", or "fullscreen".

For every scene of this type, you MUST fill out a COMPLETE FORM with a concrete value for ALL 37 of the following controls.

Do not skip any. Do not use "default" or "auto." Every field requires a deliberate artistic choice. For text scenes, the 5 media and gradient controls must be present and set to null.

A. ANIMATION & TIMING (8 controls)

These controls define the "feeling" of motion. They are the most important tools for establishing pacing and emotion.

1. entryEffect
Purpose: How the scene arrives. This is the first impression.
Artistic Choice: A fade is subtle. A slide-up is classic. A spiral-in is high-energy. A blur-focus is cinematic.
Valid Values: string (e.g., "fade", "slide-up", "zoom-in", "rotate-in", "flip-in", "spiral-in", "elastic-bounce", "blur-focus", "cross-fade", "sudden")

2. entryDuration
Purpose: How long the entry animation takes, in seconds.
Artistic Choice: 0.8s is fast and energetic. 3.5s is slow, dramatic, and epic.
Valid Values: number (Min: 0.8, Max: 5.0. Recommend 1.2 - 2.5 for cinematic feel).

3. entryDelay
Purpose: A pause after the scroll trigger before the animation begins.
Artistic Choice: Almost always 0. Use a small delay (0.2) only for specific staccato effects.
Valid Values: number (Min: 0, Max: 2.0).

4. entryEasing
Purpose: The acceleration curve of the entry. This defines the character of the motion.
Artistic Choice: ease-out (or power2.out) is a standard, smooth stop. elastic is bouncy and playful. power4.inOut is dramatic.
Valid Values: string (GSAP easing, e.g., "power2.out", "power3.inOut", "elastic.out(1, 0.3)", "bounce.out").

5. exitEffect
Purpose: How the scene departs to make way for the next.
Artistic Choice: Often mirrors the entry (e.g., slide-down if entry was slide-up). fade is the safest. cross-fade is for seamless dissolves.
Valid Values: string (e.g., "fade", "slide-down", "zoom-out", "dissolve", "rotate-out", "flip-out", "scale-blur", "cross-fade")

6. exitDuration
Purpose: How long the exit animation takes, in seconds.
Artistic Choice: Typically 20-30% faster than the entryDuration to feel responsive, unless you are "cross-fading," in which case it should match.
Valid Values: number (Min: 0.6, Max: 5.0).

7. exitDelay
Purpose: A pause before the exit animation begins.
Artistic Choice: Almost always 0.
Valid Values: number (Min: 0, Max: 2.0).

8. exitEasing
Purpose: The acceleration curve of the exit.
Artistic Choice: Typically an "ease-in" curve (power2.in, power3.in) as the object accelerates away.
Valid Values: string (GSAP easing, e.g., "power2.in", "power3.inOut").

B. VISUAL FOUNDATION (2 controls)

These are the non-negotiable building blocks of the scene's appearance.

9. backgroundColor
Purpose: The exact background color for the 100vh scene.
Artistic Choice: Sets the mood. #0a0a0a (near-black) is dramatic. #FFFFFF (white) is minimal.
Valid Values: string (Must be a valid 6-digit hex code, e.g., "#0a0a0a").

10. textColor
Purpose: The exact color for all text in the scene.
Artistic Choice: Must have strong contrast with backgroundColor to be legible.
Valid Values: string (Must be a valid 6-digit hex code, e.g., "#FFFFFF").

C. SCROLL DEPTH & DURATION (3 controls)

These controls manage the "scrollytelling" physics and how the scene responds to the user's scrollbar.

11. parallaxIntensity
Purpose: Creates a 3D depth effect by moving background/foreground elements at different speeds.
Artistic Choice: 0 means no parallax. 0.5 is a strong, cinematic effect.
Valid Values: number (Min: 0.0, Max: 1.0).
!! CONFLICT !! If scaleOnScroll is true, parallaxIntensity MUST be 0.

12. scrollSpeed
Purpose: How quickly the scene's internal animations play relative to the scroll.
Artistic Choice: "normal" is standard. "slow" makes the animation stretch out over a longer scroll distance.
Valid Values: string ("slow", "normal", "fast").

13. animationDuration
Purpose: The total duration of the scene's GSAP ScrollTrigger timeline.
Artistic Choice: A longer duration (5.0s) means the user must scroll more to see the full animation. A short one (1.0s) is quick.
Valid Values: number (Min: 0.5, Max: 10.0).

D. TYPOGRAPHY (4 controls)

How the story is read. This controls hierarchy and legibility.

14. headingSize
Purpose: The scale of the primary (H1) text.
Artistic Choice: 8xl is a massive, full-screen "Hero" statement. 5xl is a standard, strong heading.
Valid Values: string ("4xl", "5xl", "6xl", "7xl", "8xl").

15. bodySize
Purpose: The scale of the body (paragraph) text.
Artistic Choice: base is standard. xl is more readable and spacious.
Valid Values: string ("base", "lg", "xl", "2xl").

16. fontWeight
Purpose: The weight (thickness) of all text.
Artistic Choice: normal for minimal. bold for brutalist or strong impact.
Valid Values: string ("normal", "medium", "semibold", "bold").

17. alignment
Purpose: The horizontal alignment of the text block.
Artistic Choice: center is formal and great for quotes. left is standard for body text.
Valid Values: string ("left", "center", "right").

E. SCROLL INTERACTION (3 controls)

Special effects that happen while the user is actively scrolling through the scene. Use sparingly for impact.

18. fadeOnScroll
Purpose: Fades the scene's content out as the user scrolls toward the end of it.
Artistic Choice: Creates a soft transition. Best used if exitEffect is also fade.
Valid Values: boolean (true, false). (Recommend false unless specifically needed).

19. scaleOnScroll
Purpose: Zooms the content in or out as the user scrolls.
Artistic Choice: A powerful, cinematic "zoom" effect.
Valid Values: boolean (true, false).
!! CONFLICT !! If true, parallaxIntensity MUST be 0. They cannot be used together.

20. blurOnScroll
Purpose: Blurs the content as the user scrolls.
Artistic Choice: Can be performance-intensive. Use for "dreamy" or "disorienting" effects.
Valid Values: boolean (true, false). (Recommend false for performance).

F. MULTI-ELEMENT TIMING (2 controls)

For scenes with multiple elements (like galleries or split layouts). Controls how they animate relative to each other.

21. staggerChildren
Purpose: The delay (in seconds) between each child element's animation.
Artistic Choice: 0 means all items appear at once. 0.2 creates a "waterfall" or "domino" effect.
Valid Values: number (Min: 0.0, Max: 1.0).

22. layerDepth
Purpose: The z-index of the scene, controlling stacking.
Artistic Choice: 5 is default. Use 10 to force a scene "on top" of others, or 1 to keep it "behind."
Valid Values: number (Integer, Min: 0, Max: 10).

G. ADVANCED MOTION (3 controls)

Fine-tuning controls for motion designers.

23. transformOrigin
Purpose: The "pivot point" for rotate-in or scale effects.
Artistic Choice: center center is default. top left will make it "swing in" from the corner.
Valid Values: string (e.g., "center center", "top left", "bottom right").

24. overflowBehavior
Purpose: Controls whether content that animates from outside the viewport is visible before it enters.
Artistic Choice: hidden clips the content, which is what you want 99% of the time. visible can break layouts.
Valid Values: string ("visible", "hidden", "auto"). (Recommend "hidden").

25. backdropBlur
Purpose: Adds a "frosted glass" blur to elements behind this one (e.g., a semi-transparent text box).
Artistic Choice: Creates a "glass morphism" effect.
Valid Values: string ("none", "sm", "md", "lg", "xl").

H. VISUAL BLENDING (2 controls)

Photoshop-style effects for artistic expression.

26. mixBlendMode
Purpose: How text or media content blends with the backgroundColor.
Artistic Choice: normal is default. multiply or screen are great for color overlays. difference or exclusion create high-contrast, inverted effects.
Valid Values: string ("normal", "multiply", "screen", "overlay", "difference", "exclusion").

27. enablePerspective
Purpose: Adds 3D depth, which is required for flip-in and rotate-in to look 3D.
Artistic Choice: Set to true if using 3D-style entry/exit effects, otherwise false.
Valid Values: boolean (true, false).

I. CUSTOM STYLING & TEXT (3 controls)

Advanced overrides and effects.

28. customCSSClasses
Purpose: An "escape hatch" to add custom Tailwind CSS classes.
Artistic Choice: Use for one-off effects like a shadow-2xl or ring-4.
Valid Values: string (e.g., "shadow-2xl ring-4 ring-white" or "" if none).

29. textShadow
Purpose: Adds a simple drop shadow to text for legibility or style.
Artistic Choice: Can look dated. textGlow is often a better choice.
Valid Values: boolean (true, false).
!! CONFLICT !! Cannot be used with textGlow.

30. textGlow
Purpose: Adds a luminous, soft glow to text.
Artistic Choice: Great for "dreamy" or "sci-fi" aesthetics.
Valid Values: boolean (true, false).
!! CONFLICT !! Cannot be used with textShadow.

J. VERTICAL SPACING (2 controls)

Controls the "breathing room" inside the scene. Critical for minimal design.

31. paddingTop
Purpose: The internal padding at the top of the scene.
Artistic Choice: none or sm keeps content tight to the edge. xl or 2xl adds significant empty space.
Valid Values: string ("none", "sm", "md", "lg", "xl", "2xl").

32. paddingBottom
Purpose: The internal padding at the bottom of the scene.
Artistic Choice: Match with paddingTop for a balanced look.
Valid Values: string ("none", "sm", "md", "lg", "xl", "2xl").

K. MEDIA PRESENTATION (3 controls)

For image, video, fullscreen, and gallery scenes. For text scenes, these MUST be null.

33. mediaPosition
Purpose: The "focal point" of the media, especially if it's cropped.
Artistic Choice: center is default. top ensures the top of the image is always visible.
Valid Values: string (e.g., "center", "top", "bottom", "left", "right") or null for text-only scenes.

34. mediaScale
Purpose: How the media should fit its container.
Artistic Choice: cover (default) fills the screen and crops. contain shows the full image (may letterbox).
Valid Values: string (e.g., "cover", "contain", "fill") or null for text-only scenes.

35. mediaOpacity
Purpose: The transparency of the media.
Artistic Choice: 1.0 is fully opaque. 0.8 can soften a video background.
Valid Values: number (Min: 0.0, Max: 1.0) or null for text-only scenes.

L. GRADIENT BACKGROUNDS (2 controls)

Optional. These controls add a gradient over the backgroundColor. For any scene, these can be null.

36. gradientColors
Purpose: An array of two or more hex codes to create a gradient.
Artistic Choice: Use to add depth to a solid color.
Valid Values: string[] (e.g., ["#ff0000", "#0000ff"]) or null if no gradient.

37. gradientDirection
Purpose: The direction of the gradient.
Artistic Choice: to-br (top-left to bottom-right) is common.
Valid Values: string (e.g., "to-t", "to-r", "to-br") or null if no gradient.

7. The "Component" Toolkit (The Content Schema)

Use this schema ONLY when sceneType is: "component".

A component scene does NOT use the 37 director controls. It uses a content object.

Required content Object Schema:

{
  "componentType": "metric-card" | "timeline" | "chart" | "icon-grid" | "badge-cluster",
  "heading": "string",
  "subheading": "string",
  "props": { ... }
}

Component Examples (Your Guide):

For metric-card:
{
  "componentType": "metric-card",
  "heading": "Our Results",
  "subheading": "A 340% increase in qualified pipeline.",
  "props": {
    "metrics": [
      {"label": "Pipeline Growth", "value": 340, "suffix": "%"},
      {"label": "Deal Velocity", "value": 58, "suffix": " days"}
    ]
  }
}

For timeline:
{
  "componentType": "timeline",
  "heading": "Our 90-Day Roadmap",
  "subheading": "From kickoff to launch.",
  "props": {
    "steps": [
      {"title": "Week 1: Discovery", "description": "Audit existing systems."},
      {"title": "Week 4: Implementation", "description": "Deploy new workflows."},
      {"title": "Week 12: Go-Live", "description": "Full team rollout."}
    ]
  }
}

8. Required Output Format (Dual-Track Schema)

Your output MUST be a single JSON array of scene objects. Each object in the array must match one of the two schemas below.

Schema A: The "Cinematic" Scene (text scene example showing 37-control mandate with null for media/gradient):

{
  "sceneType": "text",
  "assetIds": [],
  "layout": "default",
  "director": {
    "entryEffect": "fade",
    "entryDuration": 1.5,
    "entryDelay": 0,
    "entryEasing": "power2.out",
    "exitEffect": "fade",
    "exitDuration": 1.0,
    "exitDelay": 0,
    "exitEasing": "power2.in",
    "backgroundColor": "#0a0a0a",
    "textColor": "#ffffff",
    "parallaxIntensity": 0,
    "scrollSpeed": "normal",
    "animationDuration": 1.5,
    "headingSize": "7xl",
    "bodySize": "xl",
    "fontWeight": "medium",
    "alignment": "center",
    "fadeOnScroll": false,
    "scaleOnScroll": false,
    "blurOnScroll": false,
    "staggerChildren": 0,
    "layerDepth": 5,
    "transformOrigin": "center center",
    "overflowBehavior": "hidden",
    "backdropBlur": "none",
    "mixBlendMode": "normal",
    "enablePerspective": false,
    "customCSSClasses": "",
    "textShadow": false,
    "textGlow": false,
    "paddingTop": "xl",
    "paddingBottom": "xl",
    "mediaPosition": null,
    "mediaScale": null,
    "mediaOpacity": null,
    "gradientColors": null,
    "gradientDirection": null
  }
}

Schema B: The "Component" Scene:

{
  "sceneType": "component",
  "assetIds": [],
  "layout": "default",
  "content": {
    "componentType": "metric-card",
    "heading": "Our Results",
    "subheading": "Data from Q3.",
    "props": {
      "metrics": [{"label": "Growth", "value": 150, "suffix": "%"}]
    }
  }
}
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
                        paddingBottom: { type: Type.STRING, description: "none, sm, md, lg, xl, 2xl" },

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
  const auditPrompt = `You are the Technical Director (TD), the "First Assistant Director (1st AD)" for this film production. You are the 'Artistic Director's' (your previous self from Stage 1) most trusted partner.

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
"My validation plan is a 4-pass check on all ${result.scenes.length} scenes:

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
    const previousSceneLayout = i > 0 ? result.scenes[i - 1].layout : null;
    let scenePrompt = '';

    switch (scene.sceneType) {
      case 'split':
        scenePrompt = buildSplitScenePrompt(scene, catalog, i, previousSceneLayout);
        break;
      case 'gallery':
        scenePrompt = buildGalleryScenePrompt(scene, catalog, i, previousSceneLayout);
        break;
      case 'quote':
        scenePrompt = buildQuoteScenePrompt(scene, catalog, i, previousSceneLayout);
        break;
      case 'fullscreen':
        scenePrompt = buildFullscreenScenePrompt(scene, catalog, i, previousSceneLayout);
        break;
      default:
        // Skip refinement for basic scene types (text, image, video) and 'component'
        continue;
    }

    // Apply refinement if prompt was generated
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
            },
            required: ["scene"]
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

export function buildSplitScenePrompt(scene: GeneratedScene, catalog: ContentCatalog, sceneIndex: number, previousSceneLayout: string | null): string {
  return `System Prompt: Stage 3 (The Scene Specialist - Split Scene)
You are the Scene Specialist, the "Second Unit Director" for this film production.

The 'Artistic Director' (your previous self from Stage 1) has done the main work, and the 'Technical Director' (Stage 2) has confirmed it's technically functional.

Now, this single split scene has been flagged for your expert refinement. This is your "close-up." Your job is to take this good scene and make it great. You must elevate its artistic impact.

The "Specialist's Mandate" (Your Rules)
Your refinements are creative, but they must not violate the core production rules.

Obey the Director's Vision: Your primary guide is the original ${catalog.directorNotes}. Your changes must amplify this vision, not contradict it.

Obey the Narrative Arc: Your refinement must be consistent with the scene's place in the "Principle of Narrative Arc" (e.g., an "Act 2" content block should feel different from an "Act 1" hook).

Use the "Source of Truth": You must use the Director's Lexicon and Advanced Artistic Combinations (Recipes) from the top of the Stage 1 prompt. You MUST IGNORE the older, redundant guides at the bottom of that prompt.

Maintain 37 Controls: Your final output must still be a valid scene object with all 37 controls present and correct.

The "Mandatory Creative Rationale" (Your Monologue)
Before you return the refined JSON, you MUST first provide your "Creative Rationale" in prose, following this exact format:

CREATIVE RATIONALE: "This split scene is Scene ${sceneIndex}, a core content block in 'Act 2.' The original generation was functional but lacked rhythm.

Refinement 1 (Layout): The previousSceneLayout was '${previousSceneLayout || 'null'}'. To create the intended 'zig-zag' flow and prevent visual monotony, I am setting this scene's layout: '${previousSceneLayout === 'default' ? 'reverse' : 'default'}'.

Refinement 2 (Stagger): To make the scene feel more alive, I am adding a subtle staggerChildren: 0.15s. This will animate the text in just before the media, guiding the user's eye.

Refinement 3 (Pacing): I am slightly increasing the entryDuration to 1.4s to give the user time to register both elements, enhancing its 'elegant'-themed Director's Note.

My refinements are complete."

(You will then provide the single refined JSON scene object immediately after this monologue.)

Scene to Refine
You are refining only the single scene object provided below, using the critical context provided.

Critical Context:

Current Scene Index: ${sceneIndex}

Previous Scene Layout: ${previousSceneLayout || 'null'} (This is the layout value of scene ${sceneIndex - 1}. null means this is the first scene.)

Director's Vision (for context): ${catalog.directorNotes}

Original Scene JSON:
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