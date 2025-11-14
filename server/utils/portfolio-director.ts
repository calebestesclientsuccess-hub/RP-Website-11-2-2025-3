import { GoogleGenAI, Type } from "@google/genai";
import type { ContentCatalog } from "@shared/schema";

// Initialize Gemini client with Replit AI Integrations
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

// Build asset ID whitelist from catalog
function buildAssetWhitelist(catalog: ContentCatalog): string[] {
  return [
    ...catalog.texts.map((t) => t.id),
    ...catalog.images.map((i) => i.id),
    ...catalog.videos.map((v) => v.id),
    ...catalog.quotes.map((q) => q.id),
  ];
}

// Build Gemini prompt for portfolio orchestration
function buildPortfolioPrompt(catalog: ContentCatalog): string {
  const validAssetIds = buildAssetWhitelist(catalog);

  return `You are a visual director for scrollytelling web experiences. Your role is to ORCHESTRATE existing content, not create new content.

DIRECTOR'S VISION:
${catalog.directorNotes}

AVAILABLE CONTENT CATALOG:
You MUST ONLY reference these asset IDs. DO NOT create new content or fabricate IDs.

TEXTS (${catalog.texts.length} available):
${catalog.texts.map((t) => `  - ID: "${t.id}" | Type: ${t.type} | Content: "${t.content.substring(0, 100)}${t.content.length > 100 ? '...' : ''}"`).join('\n')}

IMAGES (${catalog.images.length} available):
${catalog.images.map((i) => `  - ID: "${i.id}" | Alt: "${i.alt}" | Caption: "${i.caption || 'none'}"`).join('\n')}

VIDEOS (${catalog.videos.length} available):
${catalog.videos.map((v) => `  - ID: "${v.id}" | Caption: "${v.caption || 'none'}"`).join('\n')}

QUOTES (${catalog.quotes.length} available):
${catalog.quotes.map((q) => `  - ID: "${q.id}" | Author: ${q.author} | Quote: "${q.quote.substring(0, 80)}${q.quote.length > 80 ? '...' : ''}"`).join('\n')}

VALID ASSET IDS (you MUST use these exact IDs):
${validAssetIds.join(', ')}

YOUR TASK:
Create a scene sequence that tells a compelling visual story using ONLY the provided assets.

RULES:
1. ONLY reference asset IDs from the whitelist above
2. DO NOT create new text, images, or content
3. DO NOT fabricate asset IDs
4. Choose appropriate scene types based on content:
   - "text" for headlines and paragraphs
   - "image" for image assets
   - "video" for video assets
   - "quote" for testimonials
   - "split" for side-by-side layouts (one text + one image/video)
   - "gallery" for multiple images
5. Set timing (entryDuration, exitDuration, animationDuration) in SECONDS (0.1-5.0)
6. Set colors as valid hex codes
7. Parallax intensity: 0-1 (0.3 is default)
8. Order scenes to match the director's vision
9. Create 3-8 scenes for a complete story

Generate the scene sequence now.`;
}

interface GeneratedScene {
  sceneType: string;
  assetIds: string[]; // References to catalog assets
  layout?: string;
  director?: {
    entryDuration?: number;
    exitDuration?: number;
    animationDuration?: number;
    backgroundColor?: string;
    textColor?: string;
    parallaxIntensity?: number;
    entryEffect?: string;
    exitEffect?: string;
    headingSize?: string;
    bodySize?: string;
    alignment?: string;
  };
}

interface PortfolioGenerateResponse {
  scenes: GeneratedScene[];
}

/**
 * Call Gemini to orchestrate portfolio scenes from content catalog
 */
export async function generatePortfolioWithAI(
  catalog: ContentCatalog
): Promise<PortfolioGenerateResponse> {
  const prompt = buildPortfolioPrompt(catalog);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
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
                  description: "Must be: text, image, video, quote, split, gallery, or fullscreen"
                },
                assetIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Asset IDs from the provided catalog. MUST reference existing IDs only."
                },
                layout: {
                  type: Type.STRING,
                  description: "Optional layout: default or reverse (for split scenes)"
                },
                director: {
                  type: Type.OBJECT,
                  properties: {
                    entryDuration: { type: Type.NUMBER, description: "Entry animation duration in seconds (0.1-5)" },
                    exitDuration: { type: Type.NUMBER, description: "Exit animation duration in seconds (0.1-5)" },
                    animationDuration: { type: Type.NUMBER, description: "Main animation duration in seconds (0.1-10)" },
                    backgroundColor: { type: Type.STRING, description: "Hex color code" },
                    textColor: { type: Type.STRING, description: "Hex color code" },
                    parallaxIntensity: { type: Type.NUMBER, description: "0-1, default 0.3" },
                    entryEffect: { type: Type.STRING, description: "fade, slide-up, zoom-in, etc." },
                    exitEffect: { type: Type.STRING, description: "fade, slide-down, zoom-out, etc." },
                    headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, or 8xl" },
                    bodySize: { type: Type.STRING, description: "base, lg, xl, or 2xl" },
                    alignment: { type: Type.STRING, description: "left, center, or right" },
                  }
                }
              },
              required: ["sceneType", "assetIds"]
            }
          }
        },
        required: ["scenes"]
      }
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("No response from Gemini AI");
  }

  const result = JSON.parse(responseText) as PortfolioGenerateResponse;

  // Validate that all referenced asset IDs exist
  const validAssetIds = buildAssetWhitelist(catalog);
  for (const scene of result.scenes) {
    for (const assetId of scene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        throw new Error(`AI referenced non-existent asset ID: ${assetId}. Valid IDs: ${validAssetIds.join(', ')}`);
      }
    }
  }

  return result;
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

  for (const aiScene of aiScenes) {
    const sceneConfig: any = {
      type: aiScene.sceneType,
      content: {},
      layout: aiScene.layout || "default",
      director: aiScene.director || {},
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
            heading: headline?.content || "",
            body: paragraph?.content || texts[1]?.content || "Add your content here.",
          };
        }
        break;
      }

      case "image": {
        // Expects 1 image asset
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const image = imageId ? imageMap.get(imageId) : null;
        if (image) {
          sceneConfig.content = {
            url: image.url,
            alt: image.alt,
            caption: image.caption,
          };
        }
        break;
      }

      case "video": {
        // Expects 1 video asset
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const video = videoId ? videoMap.get(videoId) : null;
        if (video) {
          sceneConfig.content = {
            url: video.url,
            caption: video.caption,
          };
        }
        break;
      }

      case "quote": {
        // Expects 1 quote asset
        const quoteId = aiScene.assetIds.find((id) => quoteMap.has(id));
        const quote = quoteId ? quoteMap.get(quoteId) : null;
        if (quote) {
          sceneConfig.content = {
            quote: quote.quote,
            author: quote.author,
            role: quote.role,
          };
        }
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

        sceneConfig.content = {
          heading: text?.content || "",
          body: texts[1]?.content || "",
          media: image?.url || video?.url || "",
          mediaType: video ? "video" : "image",
          alt: image?.alt,
        };
        break;
      }

      case "gallery": {
        // Expects multiple images
        const images = aiScene.assetIds.map((id) => imageMap.get(id)).filter(Boolean);
        sceneConfig.content = {
          heading: "",
          images: images.map((img) => ({
            url: img!.url,
            alt: img!.alt,
            caption: img!.caption,
          })),
        };
        break;
      }

      case "fullscreen": {
        // Expects 1 media asset
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const image = imageId ? imageMap.get(imageId) : null;
        const video = videoId ? videoMap.get(videoId) : null;

        sceneConfig.content = {
          url: image?.url || video?.url || "",
          mediaType: video ? "video" : "image",
          alt: image?.alt,
          overlay: false,
        };
        break;
      }
    }

    sceneConfigs.push(sceneConfig);
  }

  return sceneConfigs;
}
