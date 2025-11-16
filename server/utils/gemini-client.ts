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
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASEURL || "",
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
            description: "Complete director config with all 37 cinematic controls",
            properties: {
              // Animation & Timing (10 controls)
              entryEffect: { type: Type.STRING, description: "fade, slide-up, zoom-in, etc." },
              exitEffect: { type: Type.STRING, description: "fade, slide-down, dissolve, etc." },
              entryDuration: { type: Type.NUMBER, description: "0.1-5 seconds" },
              exitDuration: { type: Type.NUMBER, description: "0.1-5 seconds" },
              entryDelay: { type: Type.NUMBER, description: "0-10 seconds" },
              exitDelay: { type: Type.NUMBER, description: "0-2 seconds" },
              animationDuration: { type: Type.NUMBER, description: "0.5-10 seconds" },
              entryEasing: { type: Type.STRING, description: "linear, ease, power1-4, elastic, etc." },
              exitEasing: { type: Type.STRING, description: "linear, ease, power1-4, elastic, etc." },
              staggerChildren: { type: Type.NUMBER, description: "0-1 seconds" },

              // Visual Style (11 controls)
              backgroundColor: { type: Type.STRING, description: "Hex color" },
              textColor: { type: Type.STRING, description: "Hex color" },
              gradientColors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of hex colors", nullable: true },
              gradientDirection: { type: Type.STRING, description: "to-r, to-l, to-t, to-b, etc.", nullable: true },
              alignment: { type: Type.STRING, description: "left, center, right" },
              headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, 8xl" },
              bodySize: { type: Type.STRING, description: "base, lg, xl, 2xl" },
              fontWeight: { type: Type.STRING, description: "normal, medium, semibold, bold" },
              textShadow: { type: Type.BOOLEAN, description: "Drop shadow on text" },
              textGlow: { type: Type.BOOLEAN, description: "Luminous text effect" },
              paddingTop: { type: Type.STRING, description: "none, sm, md, lg, xl, 2xl" },
              paddingBottom: { type: Type.STRING, description: "none, sm, md, lg, xl, 2xl" },

              // Scroll Effects (5 controls)
              parallaxIntensity: { type: Type.NUMBER, description: "0-1" },
              fadeOnScroll: { type: Type.BOOLEAN, description: "Enable fade during scroll" },
              scaleOnScroll: { type: Type.BOOLEAN, description: "Enable scale during scroll" },
              blurOnScroll: { type: Type.BOOLEAN, description: "Enable blur during scroll" },
              scrollSpeed: { type: Type.STRING, description: "slow, normal, fast" },

              // Cinematic Controls (7 controls)
              transformOrigin: { type: Type.STRING, description: "center center, top left, etc." },
              overflowBehavior: { type: Type.STRING, description: "visible, hidden, auto" },
              backdropBlur: { type: Type.STRING, description: "none, sm, md, lg, xl" },
              mixBlendMode: { type: Type.STRING, description: "normal, multiply, screen, overlay, etc." },
              enablePerspective: { type: Type.BOOLEAN, description: "Enable 3D transforms" },
              customCSSClasses: { type: Type.STRING, description: "Custom Tailwind classes" },
              layerDepth: { type: Type.NUMBER, description: "0-10 z-index" },

              // Media Controls (3 controls - nullable for text-only scenes)
              mediaPosition: { type: Type.STRING, description: "center, top, bottom, left, right", nullable: true },
              mediaScale: { type: Type.STRING, description: "cover, contain, fill", nullable: true },
              mediaOpacity: { type: Type.NUMBER, description: "0-1" }
            },
            required: [
              "entryEffect", "exitEffect", "entryDuration", "exitDuration",
              "entryDelay", "exitDelay", "animationDuration", "entryEasing",
              "exitEasing", "staggerChildren", "backgroundColor", "textColor",
              "alignment", "headingSize", "bodySize", "fontWeight",
              "textShadow", "textGlow", "paddingTop", "paddingBottom",
              "parallaxIntensity", "fadeOnScroll", "scaleOnScroll",
              "blurOnScroll", "scrollSpeed", "transformOrigin",
              "overflowBehavior", "backdropBlur", "mixBlendMode",
              "enablePerspective", "customCSSClasses", "layerDepth",
              "mediaOpacity"
            ]
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
 * Implements 37-control comprehensive configuration protocol
 */
function buildScenePrompt(
  instruction: string,
  sceneType?: string,
  systemInstructions?: string
): string {
  return `You are a cinematic director creating a portfolio scene. You MUST consider ALL 37 configuration options for professional-grade output.

${systemInstructions ? `SYSTEM CONTEXT:\n${systemInstructions}\n` : ''}

USER INSTRUCTION:
${instruction}

${sceneType ? `REQUESTED SCENE TYPE: ${sceneType}` : 'SCENE TYPE: Determine the most appropriate type'}

MANDATORY CONFIGURATION PROTOCOL
You must address every single control below. For each category, provide explicit values (never skip or use "default").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 1: ANIMATION & TIMING (10 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. entryEffect - Choose from: fade, slide-up, slide-down, slide-left, slide-right, zoom-in, zoom-out, rotate-in, flip-in, bounce-in, elastic-in, blur-in, glitch-in, particle-dissolve
   Consider: Scene emotional tone, continuity from previous scene

2. exitEffect - Choose from: fade, slide-down, slide-up, slide-left, slide-right, zoom-out, dissolve, rotate-out, flip-out, blur-out, particle-dissolve
   Consider: Transition to next scene, narrative flow

3. entryDuration - Range: 0.1-5 seconds
   Consider: Pacing, dramatic weight, user attention span

4. exitDuration - Range: 0.1-5 seconds
   Consider: Should match or contrast entryDuration

5. entryDelay - Range: 0-10 seconds
   Consider: Scroll trigger timing, sequential reveal needs

6. exitDelay - Range: 0-2 seconds
   Consider: Smooth transition timing

7. animationDuration - Range: 0.5-10 seconds
   Consider: Background/ambient animations if applicable

8. entryEasing - Choose from: linear, ease, ease-in, ease-out, ease-in-out, power1, power2, power3, power4, elastic, bounce, back
   Consider: Naturalness vs dramatic impact

9. exitEasing - Choose from: (same as entryEasing)
   Consider: Should complement entryEasing

10. staggerChildren - Range: 0-1 seconds
    Consider: Multi-element reveals, text line-by-line effects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 2: VISUAL STYLE (11 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. backgroundColor - Hex color (e.g., #0a0a0a)
    Consider: Brand palette, mood, contrast with text

12. textColor - Hex color (e.g., #ffffff)
    Consider: Readability (4.5:1 contrast minimum), hierarchy

13. gradientColors - Array of hex colors or null
    Consider: Visual interest, depth, brand consistency

14. gradientDirection - Choose from: to-r, to-l, to-t, to-b, to-tr, to-tl, to-br, to-bl
    Consider: Reading flow, visual hierarchy (use null if no gradient)

15. alignment - Choose from: left, center, right
    Consider: Content type, screen width, emphasis

16. headingSize - Choose from: 4xl, 5xl, 6xl, 7xl, 8xl
    Consider: Hierarchy, viewport size, importance

17. bodySize - Choose from: base, lg, xl, 2xl
    Consider: Readability, emphasis level

18. fontWeight - Choose from: normal, medium, semibold, bold
    Consider: Emphasis, hierarchy, brand voice

19. textShadow - Boolean
    Consider: Contrast needs, depth, legibility on complex backgrounds
    ⚠️ WARNING: Do not use with textGlow (choose one)

20. textGlow - Boolean
    Consider: Dramatic effect, hero moments, brand style
    ⚠️ WARNING: Do not use with textShadow (choose one)

21. paddingTop - Choose from: none, sm, md, lg, xl, 2xl
    Consider: Breathing room, section separation

22. paddingBottom - Choose from: none, sm, md, lg, xl, 2xl
    Consider: Rhythm, next section proximity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 3: SCROLL EFFECTS (5 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

23. parallaxIntensity - Range: 0-1 (0 = no parallax, 1 = extreme)
    Consider: Depth perception, motion sickness risk, subtlety
    ⚠️ WARNING: Values > 0.5 can cause motion sickness

24. fadeOnScroll - Boolean
    Consider: Smooth transitions, cinematic flow

25. scaleOnScroll - Boolean
    Consider: Zoom effects, emphasis
    ⚠️ WARNING: Heavy on mobile, use sparingly, avoid with blurOnScroll

26. blurOnScroll - Boolean
    Consider: Depth of field, focus shifts
    ⚠️ WARNING: GPU intensive, avoid with scaleOnScroll

27. scrollSpeed - Choose from: slow, normal, fast
    Consider: Pacing, user control, narrative rhythm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 4: CINEMATIC CONTROLS (7 controls)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

28. transformOrigin - Choose from: center center, top left, top center, top right, center left, center right, bottom left, bottom center, bottom right
    Consider: Rotation/scale anchor point, visual balance

29. overflowBehavior - Choose from: visible, hidden, auto
    Consider: Content clipping, animations extending beyond bounds

30. backdropBlur - Choose from: none, sm, md, lg, xl
    Consider: Glassmorphism, depth, layering
    ⚠️ WARNING: Performance heavy, use sparingly

31. mixBlendMode - Choose from: normal, multiply, screen, overlay, difference, exclusion
    Consider: Layering effects, creative compositing
    ⚠️ WARNING: Test on various backgrounds

32. enablePerspective - Boolean
    Consider: 3D transforms, spatial depth, modern aesthetic

33. customCSSClasses - String (empty string if not needed)
    Consider: Special edge cases, experimental effects

34. layerDepth - Range: 0-10 (z-index management)
    Consider: Stacking context, depth hierarchy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY 5: MEDIA CONTROLS (3 controls - nullable for text-only scenes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

35. mediaPosition - Choose from: center, top, bottom, left, right
    Consider: Focal point, composition, subject matter
    Use null for text-only scenes

36. mediaScale - Choose from: cover, contain, fill
    Consider: Aspect ratio preservation, content priority
    Use null for text-only scenes

37. mediaOpacity - Range: 0-1
    Consider: Overlay effects, text legibility, layering
    Use 1 for full opacity, lower for overlay effects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL CONFLICT WARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ textShadow + textGlow = visual mud (choose one)
❌ scaleOnScroll + blurOnScroll = performance death (pick one)
❌ backdropBlur + heavy animations = lag city (use sparingly)
❌ mixBlendMode != "normal" requires testing on all backgrounds
❌ parallaxIntensity > 0.5 = motion sickness risk

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "sceneType": "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen",
  "headline": "compelling headline text",
  "subheadline": "optional subheadline",
  "bodyText": "optional body copy",
  "mediaUrl": "URL or null",
  "mediaType": "image" | "video" | null,
  "backgroundColor": "#hex",
  "textColor": "#hex",
  "director": {
    "entryEffect": "value",
    "exitEffect": "value",
    "entryDuration": number,
    "exitDuration": number,
    "entryDelay": number,
    "exitDelay": number,
    "animationDuration": number,
    "entryEasing": "value",
    "exitEasing": "value",
    "staggerChildren": number,
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "gradientColors": ["#hex", "#hex"] or null,
    "gradientDirection": "value" or null,
    "alignment": "value",
    "headingSize": "value",
    "bodySize": "value",
    "fontWeight": "value",
    "textShadow": boolean,
    "textGlow": boolean,
    "paddingTop": "value",
    "paddingBottom": "value",
    "parallaxIntensity": number,
    "fadeOnScroll": boolean,
    "scaleOnScroll": boolean,
    "blurOnScroll": boolean,
    "scrollSpeed": "value",
    "transformOrigin": "value",
    "overflowBehavior": "value",
    "backdropBlur": "value",
    "mixBlendMode": "value",
    "enablePerspective": boolean,
    "customCSSClasses": "value",
    "layerDepth": number,
    "mediaPosition": "value" or null,
    "mediaScale": "value" or null,
    "mediaOpacity": number
  }
}

Return ONLY valid JSON. Every field must be present with a concrete value (never omit or use defaults).`;
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