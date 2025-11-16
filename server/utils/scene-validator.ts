import { z } from "zod";

/**
 * Scene Validator: Basic structure validation only
 * SEO constraints removed for MVP functionality
 */

// Text scene validation
const textSceneSchema = z.object({
  type: z.literal("text"),
  content: z.object({
    heading: z.string().min(1),
    headingLevel: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).optional(),
    body: z.string().optional(),
  }).passthrough(),
}).passthrough();

// Image scene validation
const imageSceneSchema = z.object({
  type: z.literal("image"),
  content: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
  }).passthrough(),
}).passthrough();

// Other scene types
const videoSceneSchema = z.object({
  type: z.literal("video"),
  content: z.object({
    url: z.string().url(),
    caption: z.string().optional(),
  }).passthrough(),
}).passthrough();

const splitSceneSchema = z.object({
  type: z.literal("split"),
  content: z.object({
    media: z.string().url(),
    heading: z.string().optional(),
    body: z.string().optional(),
  }).passthrough(),
}).passthrough();

const gallerySceneSchema = z.object({
  type: z.literal("gallery"),
  content: z.object({
    images: z.array(z.object({
      url: z.string().url(),
      alt: z.string().optional(),
    })).min(1),
  }).passthrough(),
}).passthrough();

const quoteSceneSchema = z.object({
  type: z.literal("quote"),
  content: z.object({
    quote: z.string().min(1),
    author: z.string().optional(),
    role: z.string().optional(),
  }).passthrough(),
}).passthrough();

const fullscreenSceneSchema = z.object({
  type: z.literal("fullscreen"),
  content: z.object({
    media: z.string().url(),
    mediaType: z.enum(["image", "video"]),
  }).passthrough(),
}).passthrough();

// Discriminated union of all scene types
export const sceneConfigSchema = z.discriminatedUnion("type", [
  textSceneSchema,
  imageSceneSchema,
  videoSceneSchema,
  splitSceneSchema,
  gallerySceneSchema,
  quoteSceneSchema,
  fullscreenSceneSchema,
]);

/**
 * Validate a scene configuration
 * Throws ZodError if validation fails
 */
export function validateScene(sceneConfig: any) {
  return sceneConfigSchema.parse(sceneConfig);
}

// Assume validateDirectorConfig is defined elsewhere and returns an object with `valid` (boolean), `errors` (array), and `warnings` (array) properties.
// Example placeholder for validateDirectorConfig if it were in this file:
/*
function validateDirectorConfig(directorConfig: any) {
  // Placeholder logic: In a real scenario, this would validate the director config
  // and return validation results, including potential warnings.
  const errors = [];
  const warnings = [];

  // Example: Check for entryDelay and its application
  if (directorConfig && directorConfig.entryDelay !== undefined) {
    // Simulate checking if entryDelay is correctly used in animations (this part would be complex)
    // For demonstration, let's assume a conflict if entryDelay is negative or too large
    if (directorConfig.entryDelay < 0 || directorConfig.entryDelay > 10000) {
      errors.push("Invalid entryDelay value.");
    } else {
      // Simulate a potential conflict warning
      if (directorConfig.animations && directorConfig.animations.some((anim: any) => anim.duration === undefined)) {
        warnings.push("entryDelay might conflict with animations missing duration.");
      }
    }
  }

  // Example: Check for opacity handling
  if (directorConfig && directorConfig.animations) {
    const hasOpacity = directorConfig.animations.some((anim: any) => anim.opacity !== undefined);
    const hasAutoAlpha = directorConfig.animations.some((anim: any) => anim.autoAlpha !== undefined);
    if (hasOpacity && hasAutoAlpha) {
      warnings.push("Mixing 'opacity' and 'autoAlpha' can lead to unexpected behavior. Consider using 'autoAlpha' exclusively.");
    }
  }

  // Example: Add more checks for other potential conflicts

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
*/

// Assuming validateDirectorConfig is imported or defined elsewhere.
// For the purpose of this combined file, let's assume it's available.
// If it were in this file, it would be placed here or imported.

// The following is a placeholder to make the code runnable as is,
// assuming validateDirectorConfig is an external function.
// In a real project, you would import it.
declare function validateDirectorConfig(directorConfig: any): { valid: boolean; errors: string[]; warnings?: string[] };

export function validateSceneWithDirector(scene: any) {
  // Validate basic scene structure first
  try {
    validateScene(scene);
  } catch (e) {
    return {
      valid: false,
      errors: e.errors || ["Unknown validation error"],
    };
  }

  // Validate director config if present
  if (scene.director) {
    const directorValidation = validateDirectorConfig(scene.director);
    if (!directorValidation.valid) {
      return {
        valid: false,
        errors: directorValidation.errors
      };
    }

    // Log warnings (non-blocking) about potential conflicts
    if (directorValidation.warnings && directorValidation.warnings.length > 0) {
      console.warn(`[Scene Validator] Animation warnings for scene:`, directorValidation.warnings);
    }
  }

  return {
    valid: true,
    errors: [],
  };
}