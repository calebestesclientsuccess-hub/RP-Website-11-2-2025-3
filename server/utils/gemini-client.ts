
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

DIRECTOR CONFIG GUIDELINES:
Use these to create cinematic transitions:

SPEED/PACING:
- "fast" / "snappy" → entryDuration: 0.8, exitDuration: 0.6
- "normal" / "smooth" → entryDuration: 1.2, exitDuration: 1.0
- "slow" / "dramatic" → entryDuration: 2.5, exitDuration: 1.8

DIRECTION:
- "enters from left" → entryEffect: "slide-right"
- "enters from right" → entryEffect: "slide-left"
- "enters from top" → entryEffect: "slide-down"
- "enters from bottom" → entryEffect: "slide-up"
- "zooms in" → entryEffect: "zoom-in" + scaleOnScroll: true
- "fades in" → entryEffect: "fade"

EXIT EFFECTS:
- "exits to left" → exitEffect: "slide-left"
- "exits upward" → exitEffect: "slide-up"
- "fades away" → exitEffect: "fade"
- "dissolves" → exitEffect: "dissolve"

MOOD/ATMOSPHERE:
- "dramatic" → parallaxIntensity: 0.6-0.8, entryDuration: 2.5+
- "subtle" → parallaxIntensity: 0.2-0.3, fadeOnScroll: true
- "energetic" → scaleOnScroll: true, entryDuration: 0.8-1.0
- "cinematic" → blurOnScroll: true, parallaxIntensity: 0.5+

COLOR GUIDELINES:
- Use dark backgrounds (#0a0a0a, #1a1a1a) for drama
- Use light backgrounds (#f8fafc, #f1f5f9) for brightness
- Ensure high contrast between text and background`;

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
