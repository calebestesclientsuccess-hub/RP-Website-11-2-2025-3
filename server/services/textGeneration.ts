import { z } from "zod";
import { env } from "../config/env";
import type { TextGenerationJobResult } from "../queues/textGenerationQueue";
import { createGeminiClient, invokeWithAiBackoff } from "./aiClientFactory";

const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;
const META_DESCRIPTION_MIN = 120;
export const TEXT_MODEL_ID = "gemini-2.0-thinking-exp";

export const textGenerationSchema = z.object({
  brandVoice: z.string().min(1),
  topic: z.string().min(1),
  type: z.enum(["blog-outline", "social-caption", "seo-metadata"]).default("blog-outline"),
  content: z.string().min(1).optional(),
});

const sanitizeSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const extractJson = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const stripMarkup = (value: string | undefined) => {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*`>\[\]\\_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const smartTruncate = (value: string, limit: number) => {
  if (!value) return "";
  if (value.length <= limit) return value;
  const ellipsis = "...";
  const allowable = Math.max(limit - ellipsis.length, 1);
  const slice = value.slice(0, allowable);
  const lastSpace = slice.lastIndexOf(" ");
  const safeCut = lastSpace > allowable - 15 ? slice.slice(0, lastSpace) : slice;
  return `${safeCut.trim()}${ellipsis}`;
};

const enforceDescriptionRange = (description: string, fallbackSource: string) => {
  let normalized = normalizeWhitespace(description);
  if (!normalized) {
    normalized = fallbackSource;
  }

  if (normalized.length < META_DESCRIPTION_MIN) {
    const supplemental = fallbackSource.slice(0, META_DESCRIPTION_MAX);
    normalized = `${normalized} ${supplemental}`.trim();
  }

  if (normalized.length > META_DESCRIPTION_MAX) {
    normalized = smartTruncate(normalized, META_DESCRIPTION_MAX);
  }

  if (normalized.length < META_DESCRIPTION_MIN) {
    normalized = normalized.padEnd(META_DESCRIPTION_MIN, ".");
  }

  return normalized;
};

const aiClient = createGeminiClient(env.GOOGLE_AI_KEY);

export async function generateTextContent(
  payload: z.infer<typeof textGenerationSchema>,
): Promise<TextGenerationJobResult> {
  if (payload.type === "seo-metadata" && (!payload.content || payload.content.trim().length === 0)) {
    throw new Error("Content is required for SEO metadata generation");
  }

  const systemPrompt =
    payload.type === "seo-metadata"
      ? `You are an elite SEO strategist.
Brand Voice: ${payload.brandVoice}

Analyze the following content and produce JSON with optimized slug, metaTitle (<60 chars) and metaDescription (120-160 chars, action oriented).
CONTENT:
"""
${payload.content}
"""

Respond with JSON only in this format:
{
  "slug": "kebab-case-slug",
  "metaTitle": "Compelling title",
  "metaDescription": "Compelling description"
}`
      : `You are an expert content strategist.
Brand Voice: ${payload.brandVoice}

Task: Generate a ${payload.type === "blog-outline" ? "detailed blog post outline" : "set of 5 social media captions"} about "${payload.topic}".`;

  const response = await invokeWithAiBackoff("text-generation", () =>
    aiClient.models.generateContent({
      model: TEXT_MODEL_ID,
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    }),
  );

  const text =
    typeof response.text === "function"
      ? response.text()
      : response.response?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("\n")
          .trim();

  if (!text) {
    throw new Error("Model returned an empty response");
  }

  if (payload.type === "seo-metadata") {
    const jsonPayload = JSON.parse(extractJson(text));
    const slug = sanitizeSlug(jsonPayload.slug || payload.topic);
    const fallbackSource = normalizeWhitespace(stripMarkup(payload.content) || payload.topic);

    let metaTitle = normalizeWhitespace(jsonPayload.metaTitle || payload.topic);
    if (!metaTitle) {
      throw new Error("Missing meta title");
    }
    if (metaTitle.length > META_TITLE_MAX) {
      metaTitle = smartTruncate(metaTitle, META_TITLE_MAX);
    }

    let metaDescription = normalizeWhitespace(jsonPayload.metaDescription || "");
    metaDescription = enforceDescriptionRange(metaDescription, fallbackSource);

    return { slug, metaTitle, metaDescription };
  }

  return { text };
}


