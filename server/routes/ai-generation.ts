import { Router, Request, Response } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from "../middleware/auth";
import { aiLimiter } from "../middleware/rate-limit";

const router = Router();

// Text Generation Schema
const textGenSchema = z.object({
  brandVoice: z.string().min(1),
  topic: z.string().min(1),
  type: z.enum(["blog-outline", "social-caption", "seo-metadata"]).default("blog-outline"),
  content: z.string().min(1).optional(),
});

// Image Generation Schema
const imageGenSchema = z.object({
  prompt: z.string().min(1),
  aspectRatio: z.string().default("16:9"),
  stylize: z.number().min(0).max(1000).default(100),
  chaos: z.number().min(0).max(100).default(0),
  count: z.number().min(1).max(4).default(4),
});

// Text Generation Endpoint
const sanitizeSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const extractJson = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
};

router.post("/ai/text", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { brandVoice, topic, type, content } = textGenSchema.parse(req.body);
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    if (type === "seo-metadata" && (!content || content.trim().length === 0)) {
      return res.status(400).json({ error: "Content is required for SEO metadata generation" });
    }

    const systemPrompt = type === "seo-metadata"
      ? `You are an elite SEO strategist.\nBrand Voice: ${brandVoice}\n\nAnalyze the following content and produce JSON with optimized slug, metaTitle (<60 chars) and metaDescription (120-160 chars, action oriented).\nCONTENT:\n"""\n${content}\n"""\n\nRespond with JSON only in this format:\n{\n  "slug": "kebab-case-slug",\n  "metaTitle": "Compelling title",\n  "metaDescription": "Compelling description"\n}`
      : `You are an expert content strategist.
    Brand Voice: ${brandVoice}
    
    Task: Generate a ${type === 'blog-outline' ? 'detailed blog post outline' : 'set of 5 social media captions'} about "${topic}".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    const text =
      typeof response.text === "function"
        ? response.text()
        : response.response?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("\n")
            .trim();

    if (!text) {
      return res.status(502).json({ error: "Gemini did not return any text" });
    }

    if (type === "seo-metadata") {
      try {
        const jsonPayload = JSON.parse(extractJson(text));
        const slug = sanitizeSlug(jsonPayload.slug || topic);
        const metaTitle = (jsonPayload.metaTitle || topic).trim();
        const metaDescription = (jsonPayload.metaDescription || "").trim();

        if (!metaTitle || !metaDescription) {
          throw new Error("Incomplete metadata");
        }

        return res.json({
          slug,
          metaTitle: metaTitle.slice(0, 60),
          metaDescription: metaDescription.slice(0, 160),
        });
      } catch (error) {
        console.error("Failed to parse SEO metadata:", error);
        return res.status(502).json({ error: "Gemini returned invalid SEO metadata" });
      }
    }

    res.json({ text });
  } catch (error: any) {
    console.error("AI Text Gen Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate text" });
  }
});

// Image Generation Endpoint (Replicate - Flux/SDXL)
router.post("/ai/image", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio, stylize, chaos, count } = imageGenSchema.parse(req.body);
    
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: "Replicate API token not configured" });
    }

    // Launch parallel predictions based on count
    const predictions = await Promise.all(
      Array.from({ length: count }).map(async () => {
        const response = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "fofr/flux-pro", // Example version
            input: {
              prompt,
              aspect_ratio: aspectRatio,
              safety_tolerance: 2,
              stylize,
              // chaos is not standard in flux-pro but kept for schema compatibility
            },
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Replicate API error");
        }

        return await response.json();
      })
    );

    res.status(202).json({ predictions: predictions.map((p) => ({ id: p.id, status: p.status })) });
  } catch (error: any) {
    console.error("AI Image Gen Error:", error);
    res.status(500).json({ error: error?.message || "Failed to initiate image generation" });
  }
});

// Check Replicate Status (Single ID)
router.get("/ai/image/:id", requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!process.env.REPLICATE_API_TOKEN) {
        return res.status(500).json({ error: "Replicate API token not configured" });
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    const prediction = await response.json();
    res.json(prediction);
  } catch (error) {
    console.error("AI Image Status Error:", error);
    res.status(500).json({ error: "Failed to check image status" });
  }
});

export default router;

