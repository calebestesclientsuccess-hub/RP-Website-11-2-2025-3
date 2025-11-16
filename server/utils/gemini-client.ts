
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini AI Client for Scene Generation
 * Uses Replit AI Integrations (no API key required, charges billed to credits)
 * UPGRADED: Now uses gemini-2.5-pro for complex scene reasoning
 */

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

/**
 * Scene configuration output from Gemini
 * Now supports multi-asset hybrid scenes
 */
export interface GeneratedSceneConfig {
  sceneType: string;
  assetIds?: string[]; // New: supports multiple assets per scene
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  additionalMedia?: Array<{
    url: string;
    type: 'image' | 'video';
    alt?: string;
    caption?: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
  director?: {
    entryDuration?: number;
    exitDuration?: number;
    animationDuration?: number;
    parallaxIntensity?: number;
    entryEffect?: string;
    exitEffect?: string;
    headingSize?: string;
    bodySize?: string;
    alignment?: string;
    fadeOnScroll?: boolean;
    scaleOnScroll?: boolean;
    blurOnScroll?: boolean;
  };
}

/**
 * Generate a scene configuration using Gemini Pro with structured JSON output
 * 
 * @param prompt - The user's creative direction for the scene
 * @param sceneType - Optional scene type constraint (e.g., 'hero', 'testimonial')
 * @param systemInstructions - Additional system-level guidance for the AI
 * @returns Structured scene configuration with hybrid composition support
 */
export async function generateSceneWithGemini(
  prompt: string,
  sceneType?: string,
  systemInstructions?: string
): Promise<GeneratedSceneConfig> {
  const fullPrompt = buildScenePrompt(prompt, sceneType, systemInstructions);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro", // Pro model for complex scene reasoning
    contents: [{
      role: "user",
      parts: [{ text: fullPrompt }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sceneType: { 
            type: Type.STRING,
            description: "Type of scene. MUST be one of: 'text', 'image', 'video', 'split', 'gallery', 'quote', 'fullscreen'"
          },
          headline: { 
            type: Type.STRING,
            description: "Main headline text (H1 or H2)"
          },
          subheadline: { 
            type: Type.STRING,
            description: "Supporting subheadline text"
          },
          bodyText: { 
            type: Type.STRING,
            description: "Body copy or description text (can be markdown)"
          },
          mediaUrl: { 
            type: Type.STRING,
            description: "Primary image or video URL"
          },
          mediaType: { 
            type: Type.STRING,
            description: "Primary media type: 'image' or 'video'"
          },
          additionalMedia: {
            type: Type.ARRAY,
            description: "Additional media assets for hybrid scenes (galleries, multi-image layouts)",
            items: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING, description: "Media URL" },
                type: { type: Type.STRING, description: "'image' or 'video'" },
                alt: { type: Type.STRING, description: "Alt text for images (SEO required)" },
                caption: { type: Type.STRING, description: "Optional caption" }
              },
              required: ["url", "type"]
            }
          },
          backgroundColor: { 
            type: Type.STRING,
            description: "Hex color code for background (e.g., '#0a0a0a')"
          },
          textColor: { 
            type: Type.STRING,
            description: "Hex color code for text (e.g., '#ffffff')"
          },
          director: {
            type: Type.OBJECT,
            description: "Director config for scroll animations",
            properties: {
              entryDuration: { type: Type.NUMBER, description: "Entry animation duration in seconds (0.1-5)" },
              exitDuration: { type: Type.NUMBER, description: "Exit animation duration in seconds (0.1-5)" },
              animationDuration: { type: Type.NUMBER, description: "Main animation duration in seconds (0.1-10)" },
              parallaxIntensity: { type: Type.NUMBER, description: "0-1, default 0.3" },
              entryEffect: { type: Type.STRING, description: "fade, slide-up, slide-down, zoom-in, sudden" },
              exitEffect: { type: Type.STRING, description: "fade, slide-up, slide-down, dissolve" },
              headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, or 8xl" },
              bodySize: { type: Type.STRING, description: "base, lg, xl, or 2xl" },
              alignment: { type: Type.STRING, description: "left, center, or right" },
              fadeOnScroll: { type: Type.BOOLEAN, description: "Enable fade during scroll" },
              scaleOnScroll: { type: Type.BOOLEAN, description: "Enable scale during scroll" },
              blurOnScroll: { type: Type.BOOLEAN, description: "Enable blur during scroll" }
            }
          }
        },
        required: ["sceneType"]
      }
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response from Gemini AI");
  }
  
  const sceneConfig = JSON.parse(responseText) as GeneratedSceneConfig;
  
  // Validate and sanitize output
  validateSceneConfig(sceneConfig);
  
  return sceneConfig;
}

/**
 * Build the complete prompt for scene generation
 * Now emphasizes hybrid composition capabilities
 */
function buildScenePrompt(
  userPrompt: string,
  sceneType?: string,
  systemInstructions?: string
): string {
  const baseInstructions = `You are a cinematic director specializing in scrollytelling web experiences.
Generate a scene configuration for a brand portfolio website based on the user's creative direction.

HYBRID SCENE COMPOSITION:
You can now create MULTI-ASSET scenes with flexible layouts:
- Text scenes can include H1 + H2 + body + images
- Image scenes can be single image OR galleries (2-8 images)
- Split scenes can have text + multiple media assets
- Quote scenes can have background video or images

SCENE TYPE CAPABILITIES:
- "text": Headlines (H1/H2) + body copy + optional images (hero sections, chapter openers)
- "image": Single image OR gallery (2-8 images) with captions
- "video": Video background or focal video with optional text overlay
- "quote": Testimonials with author + optional background media
- "split": Side-by-side text + media (supports multiple media assets)
- "gallery": Multiple images in grid layout (4, 6, or 8 images)
- "fullscreen": Immersive media takeover (image or video)

CRITICAL SEO CONSTRAINTS:
- ALL images MUST have descriptive alt text (10-125 characters, no keyword stuffing)
- Headlines MUST be under 60 characters for SEO optimization
- Body text MUST be at least 50 characters for quality content
- NEVER use generic alt text like "image" or "photo"

DIRECTOR CONFIG REQUIREMENTS:
You MUST answer ALL 37 configuration questions for EVERY scene. Use "NA" or default values if intentionally abstaining.

=== ANIMATION & TIMING (10 REQUIRED) ===
1. entryEffect: CHOOSE ONE (fade | slide-up | slide-down | slide-left | slide-right | zoom-in | zoom-out | sudden | cross-fade | rotate-in | flip-in | spiral-in | elastic-bounce | blur-focus)
   - Reasoning: Why this effect for THIS scene's entrance?

2. exitEffect: CHOOSE ONE (fade | slide-up | slide-down | slide-left | slide-right | zoom-out | dissolve | cross-fade | rotate-out | flip-out | scale-blur)
   - Reasoning: How does this transition to the NEXT scene?

3. entryDuration: NUMBER (0.1-5 seconds)
   - Reasoning: Why this pacing? (fast <1s, normal 1-1.5s, dramatic 2.5s+)

4. exitDuration: NUMBER (0.1-5 seconds)
   - Reasoning: Exit should be 20% faster than entry unless intentional

5. entryDelay: NUMBER (0-10 seconds)
   - Reasoning: Should this scene wait? For dramatic pause or content loading?

6. exitDelay: NUMBER (0-2 seconds)
   - Reasoning: Stagger exit timing for layered effects?

7. animationDuration: NUMBER (0.5-10 seconds)
   - Reasoning: How long should the main animation loop?

8. entryEasing: CHOOSE ONE (linear | ease | ease-in | ease-out | ease-in-out | power1 | power2 | power3 | power4 | back | elastic | bounce)
   - Reasoning: What motion quality fits this entrance?

9. exitEasing: CHOOSE ONE (same 12 options)
   - Reasoning: Typically ease-in for exits, but justify if different

10. staggerChildren: NUMBER (0-1 seconds)
    - Reasoning: Should child elements animate sequentially or simultaneously?

=== VISUAL STYLE (12 REQUIRED) ===
11. backgroundColor: HEX CODE (#000000 - #ffffff)
    - Reasoning: Why this color? Consider narrative flow and contrast

12. textColor: HEX CODE (#000000 - #ffffff)
    - Reasoning: Contrast ratio must be 4.5:1 minimum (WCAG AA)

13. gradientColors: ARRAY of HEX CODES or null
    - Reasoning: Single color or gradient? If gradient, why these colors?

14. gradientDirection: CHOOSE ONE (to-top | to-bottom | to-left | to-right | to-top-right | to-bottom-right | to-top-left | to-bottom-left) or "NA"
    - Reasoning: If using gradient, which direction enhances the scene?

15. alignment: CHOOSE ONE (left | center | right)
    - Reasoning: How does alignment serve the content hierarchy?

16. headingSize: CHOOSE ONE (4xl | 5xl | 6xl | 7xl | 8xl)
    - Reasoning: What emphasis does this headline need?

17. bodySize: CHOOSE ONE (base | lg | xl | 2xl)
    - Reasoning: Balance readability with visual impact

18. fontWeight: CHOOSE ONE (normal | medium | semibold | bold)
    - Reasoning: How much typographic authority?

19. textShadow: BOOLEAN (true | false)
    - Reasoning: Does text need depth/legibility boost?

20. textGlow: BOOLEAN (true | false)
    - Reasoning: Luminous effect for emphasis? (conflicts with textShadow)

21. paddingTop: CHOOSE ONE (none | sm | md | lg | xl | 2xl)
    - Reasoning: Vertical breathing room at top

22. paddingBottom: CHOOSE ONE (none | sm | md | lg | xl | 2xl)
    - Reasoning: Vertical breathing room at bottom

=== SCROLL EFFECTS (5 REQUIRED) ===
23. parallaxIntensity: NUMBER (0.0-1.0)
    - Reasoning: Depth layering strength (CONFLICTS with scaleOnScroll if >0)

24. fadeOnScroll: BOOLEAN (true | false)
    - Reasoning: Should scene fade as user scrolls?

25. scaleOnScroll: BOOLEAN (true | false)
    - Reasoning: Zoom effect during scroll? (CONFLICTS with parallax if true)

26. blurOnScroll: BOOLEAN (true | false)
    - Reasoning: Motion blur effect? (use sparingly, conflicts with parallax)

27. scrollSpeed: CHOOSE ONE (slow | normal | fast)
    - Reasoning: How quickly should scene respond to scroll?

=== CINEMATIC CONTROLS (7 REQUIRED) ===
28. transformOrigin: CHOOSE ONE (center center | top left | top center | top right | center left | center right | bottom left | bottom center | bottom right)
    - Reasoning: Pivot point for rotations/scales - where should effects originate?

29. overflowBehavior: CHOOSE ONE (visible | hidden | auto)
    - Reasoning: Should content outside bounds be visible or clipped?

30. backdropBlur: CHOOSE ONE (none | sm | md | lg | xl)
    - Reasoning: Glass morphism effect strength?

31. mixBlendMode: CHOOSE ONE (normal | multiply | screen | overlay | difference | exclusion)
    - Reasoning: Photoshop-style layer blending?

32. enablePerspective: BOOLEAN (true | false)
    - Reasoning: Enable 3D depth for rotate effects? (conflicts with parallax)

33. customCSSClasses: STRING or ""
    - Reasoning: Any custom Tailwind classes needed? (space-separated)

34. layerDepth: NUMBER (0-10)
    - Reasoning: Z-index for parallax layering (5 = default)

=== MEDIA CONTROLS (3 REQUIRED - for image/video/fullscreen/split scenes only) ===
35. mediaPosition: CHOOSE ONE (center | top | bottom | left | right) or "NA"
    - Reasoning: Where should media focal point be?

36. mediaScale: CHOOSE ONE (cover | contain | fill) or "NA"
    - Reasoning: How should media fit its container?

37. mediaOpacity: NUMBER (0.0-1.0) or "NA"
    - Reasoning: Media transparency level?

=== CONFLICT WARNINGS - GEMINI MUST CHECK ===
- parallaxIntensity > 0 + scaleOnScroll = true → CONFLICT (choose one)
- parallaxIntensity > 0 + blurOnScroll = true → CONFLICT (disable one)
- enablePerspective = true + parallaxIntensity > 0 → MAY CONFLICT (visual confusion)
- textShadow = true + textGlow = true → CONFLICT (choose one)
- More than 2 scroll effects enabled → MAY COMPETE (simplify)

=== OUTPUT FORMAT ===
EVERY director config field MUST be present in JSON output.
Use these default values ONLY if intentionally abstaining:
- Strings: "NA" or ""
- Numbers: Use middle of range (e.g., entryDuration: 1.2)
- Booleans: false
- Enums: Use "NA" or most conservative option

Example required structure:
{
  "director": {
    "entryEffect": "fade",
    "exitEffect": "fade",
    "entryDuration": 1.2,
    "exitDuration": 1.0,
    "entryDelay": 0,
    "exitDelay": 0,
    "animationDuration": 2.0,
    "entryEasing": "ease-out",
    "exitEasing": "ease-in",
    "staggerChildren": 0,
    "backgroundColor": "#0a0a0a",
    "textColor": "#ffffff",
    "gradientColors": null,
    "gradientDirection": "NA",
    "alignment": "center",
    "headingSize": "6xl",
    "bodySize": "lg",
    "fontWeight": "bold",
    "textShadow": false,
    "textGlow": false,
    "paddingTop": "md",
    "paddingBottom": "md",
    "parallaxIntensity": 0.3,
    "fadeOnScroll": false,
    "scaleOnScroll": false,
    "blurOnScroll": false,
    "scrollSpeed": "normal",
    "transformOrigin": "center center",
    "overflowBehavior": "hidden",
    "backdropBlur": "none",
    "mixBlendMode": "normal",
    "enablePerspective": false,
    "customCSSClasses": "",
    "layerDepth": 5,
    "mediaPosition": "center",
    "mediaScale": "cover",
    "mediaOpacity": 1.0
  }
}`;

  const sceneTypeConstraint = sceneType 
    ? `\n\nREQUIRED: Set sceneType to "${sceneType}"` 
    : "";

  const customInstructions = systemInstructions 
    ? `\n\nADDITIONAL GUIDELINES:\n${systemInstructions}` 
    : "";

  return `${baseInstructions}${sceneTypeConstraint}${customInstructions}

USER'S CREATIVE DIRECTION:
${userPrompt}

Generate a complete scene configuration with director settings for cinematic scroll animations.`;
}

/**
 * Validate generated scene configuration
 */
function validateSceneConfig(config: GeneratedSceneConfig): void {
  if (!config.sceneType) {
    throw new Error("Generated scene must include sceneType");
  }

  // Validate director config if present
  if (config.director) {
    const { entryDuration, exitDuration, animationDuration, parallaxIntensity } = config.director;

    if (entryDuration !== undefined && (entryDuration < 0.1 || entryDuration > 5)) {
      throw new Error("entryDuration must be between 0.1 and 5 seconds");
    }

    if (exitDuration !== undefined && (exitDuration < 0.1 || exitDuration > 5)) {
      throw new Error("exitDuration must be between 0.1 and 5 seconds");
    }

    if (animationDuration !== undefined && (animationDuration < 0.1 || animationDuration > 10)) {
      throw new Error("animationDuration must be between 0.1 and 10 seconds");
    }

    if (parallaxIntensity !== undefined && (parallaxIntensity < 0 || parallaxIntensity > 1)) {
      throw new Error("parallaxIntensity must be between 0 and 1");
    }
  }

  // Validate and fix hex colors
  if (config.backgroundColor && !isValidHexColor(config.backgroundColor)) {
    console.warn(`Invalid backgroundColor: ${config.backgroundColor}, defaulting to #0a0a0a`);
    config.backgroundColor = '#0a0a0a';
  }

  if (config.textColor && !isValidHexColor(config.textColor)) {
    console.warn(`Invalid textColor: ${config.textColor}, defaulting to #ffffff`);
    config.textColor = '#ffffff';
  }

  // Validate media type
  if (config.mediaType && !['image', 'video'].includes(config.mediaType)) {
    throw new Error("mediaType must be 'image' or 'video'");
  }

  // Validate additional media
  if (config.additionalMedia) {
    for (const media of config.additionalMedia) {
      if (!['image', 'video'].includes(media.type)) {
        throw new Error("additionalMedia type must be 'image' or 'video'");
      }
    }
  }
}

/**
 * Check if a string is a valid hex color code
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
