import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini AI Client for Scene Generation
 * Uses Replit AI Integrations (no API key required, charges billed to credits)
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
 */
export interface GeneratedSceneConfig {
  sceneType: string;
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  parallaxSpeed?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  delayBeforeEntry?: number;
}

/**
 * Generate a scene configuration using Gemini with structured JSON output
 * 
 * @param prompt - The user's creative direction for the scene
 * @param sceneType - Optional scene type constraint (e.g., 'hero', 'testimonial')
 * @param systemInstructions - Additional system-level guidance for the AI
 * @returns Structured scene configuration
 */
export async function generateSceneWithGemini(
  prompt: string,
  sceneType?: string,
  systemInstructions?: string
): Promise<GeneratedSceneConfig> {
  const fullPrompt = buildScenePrompt(prompt, sceneType, systemInstructions);

  // Official SDK pattern for structured JSON output with message object array
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
            description: "Type of scene (e.g., 'hero', 'testimonial', 'stats', 'timeline')"
          },
          headline: { 
            type: Type.STRING,
            description: "Main headline text for the scene"
          },
          subheadline: { 
            type: Type.STRING,
            description: "Supporting subheadline text"
          },
          bodyText: { 
            type: Type.STRING,
            description: "Body copy or description text"
          },
          mediaUrl: { 
            type: Type.STRING,
            description: "URL to image or video asset"
          },
          mediaType: { 
            type: Type.STRING,
            description: "Media type: 'image' or 'video'"
          },
          backgroundColor: { 
            type: Type.STRING,
            description: "Hex color code for background (e.g., '#000000')"
          },
          textColor: { 
            type: Type.STRING,
            description: "Hex color code for text (e.g., '#FFFFFF')"
          },
          duration: { 
            type: Type.INTEGER,
            description: "Animation duration in milliseconds"
          },
          parallaxSpeed: { 
            type: Type.NUMBER,
            description: "Parallax scroll speed (0.5 = slower, 2 = faster)"
          },
          fadeInDuration: { 
            type: Type.INTEGER,
            description: "Fade-in animation duration in milliseconds"
          },
          fadeOutDuration: { 
            type: Type.INTEGER,
            description: "Fade-out animation duration in milliseconds"
          },
          delayBeforeEntry: { 
            type: Type.INTEGER,
            description: "Delay before scene enters in milliseconds"
          }
        },
        required: ["sceneType"]
      }
    }
  });

  // Parse JSON response (SDK returns JSON string when responseMimeType is set)
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
 */
function buildScenePrompt(
  userPrompt: string,
  sceneType?: string,
  systemInstructions?: string
): string {
  const baseInstructions = `You are a creative director specializing in scrollytelling web experiences.
Generate a scene configuration for a brand portfolio website based on the user's creative direction.

IMPORTANT CONSTRAINTS:
- Use realistic values for animation timings (duration: 800-2000ms, fadeIn/Out: 400-1000ms)
- Use web-safe hex colors that provide good contrast
- Parallax speed should be between 0.5 and 2.0
- If no media URL is provided by user, leave mediaUrl empty
- Keep headlines concise (max 10 words) and impactful
- Body text should be 1-3 sentences maximum
- Choose appropriate sceneType based on content (hero, testimonial, stats, timeline, media, text)`;

  const sceneTypeConstraint = sceneType 
    ? `\n\nREQUIRED: Set sceneType to "${sceneType}"` 
    : "";

  const customInstructions = systemInstructions 
    ? `\n\nADDITIONAL GUIDELINES:\n${systemInstructions}` 
    : "";

  return `${baseInstructions}${sceneTypeConstraint}${customInstructions}

USER'S CREATIVE DIRECTION:
${userPrompt}

Generate a complete scene configuration following the schema.`;
}

/**
 * Validate generated scene configuration
 */
function validateSceneConfig(config: GeneratedSceneConfig): void {
  if (!config.sceneType) {
    throw new Error("Generated scene must include sceneType");
  }

  // Validate duration ranges
  if (config.duration !== undefined && (config.duration < 0 || config.duration > 10000)) {
    throw new Error("Duration must be between 0 and 10000ms");
  }

  if (config.fadeInDuration !== undefined && (config.fadeInDuration < 0 || config.fadeInDuration > 5000)) {
    throw new Error("fadeInDuration must be between 0 and 5000ms");
  }

  if (config.fadeOutDuration !== undefined && (config.fadeOutDuration < 0 || config.fadeOutDuration > 5000)) {
    throw new Error("fadeOutDuration must be between 0 and 5000ms");
  }

  // Validate parallax speed
  if (config.parallaxSpeed !== undefined && (config.parallaxSpeed < 0.1 || config.parallaxSpeed > 5)) {
    throw new Error("parallaxSpeed must be between 0.1 and 5");
  }

  // Validate hex colors
  if (config.backgroundColor && !isValidHexColor(config.backgroundColor)) {
    throw new Error("backgroundColor must be a valid hex color");
  }

  if (config.textColor && !isValidHexColor(config.textColor)) {
    throw new Error("textColor must be a valid hex color");
  }

  // Validate media type
  if (config.mediaType && !['image', 'video'].includes(config.mediaType)) {
    throw new Error("mediaType must be 'image' or 'video'");
  }
}

/**
 * Check if a string is a valid hex color code
 */
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
