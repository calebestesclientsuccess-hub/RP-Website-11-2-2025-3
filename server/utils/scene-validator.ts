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