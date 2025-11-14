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

  return `You are a cinematic director for scrollytelling portfolio websites. Your role is to ORCHESTRATE existing content into smooth, transition-driven storytelling experiences.

CRITICAL SYSTEM ARCHITECTURE:
This is a scroll-driven animation system with 30+ webpage areas. Each scene you create renders in a FULL-VIEWPORT area with GSAP ScrollTrigger animations controlling entry/exit transitions.

THE 30 WEBPAGE AREAS EXPLAINED:
- Each scene occupies ONE full-screen area (100vh)
- Scenes stack vertically and trigger as user scrolls
- Transitions happen BETWEEN scenes (not within)
- Your job: control HOW each scene enters, displays, and exits

DIRECTOR'S VISION (USER'S CREATIVE GUIDANCE):
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
Create a scene sequence with SMOOTH TRANSITIONS between each scene. Focus on pacing, rhythm, and visual flow.

SCENE TYPES (choose based on content):
- "text": Headlines and body copy (use for hero sections, chapter openers)
- "image": Single image with caption (use for visual showcases)
- "video": Video background or focal video (use for demos, motion)
- "quote": Testimonials with author attribution (use for social proof)
- "split": Side-by-side text + media (use for feature explanations)
- "gallery": Multiple images (use for before/after, process steps)
- "fullscreen": Immersive media (use for wow moments, transitions)

DIRECTOR CONFIG (controls transitions - SET THESE FOR EVERY SCENE):
{
  "entryEffect": "fade" | "slide-up" | "slide-down" | "zoom-in" | "zoom-out" | "sudden",
  "entryDuration": 0.5-5.0 (seconds - how long entry animation lasts),
  "entryDelay": 0-10.0 (seconds - delay before entry starts),
  "exitEffect": "fade" | "slide-up" | "slide-down" | "zoom-out" | "dissolve",
  "exitDuration": 0.5-5.0 (seconds - how long exit animation lasts),
  "backgroundColor": "#RRGGBB" (hex color for scene background),
  "textColor": "#RRGGBB" (hex color for text),
  "parallaxIntensity": 0.0-1.0 (0.3 is subtle, 0.7 is dramatic),
  "animationDuration": 0.5-10.0 (seconds - how long main animation lasts),
  "headingSize": "4xl" | "5xl" | "6xl" | "7xl" | "8xl",
  "bodySize": "base" | "lg" | "xl" | "2xl",
  "alignment": "left" | "center" | "right",
  "fadeOnScroll": true | false (fade as user scrolls past),
  "scaleOnScroll": true | false (scale/zoom on scroll),
  "blurOnScroll": true | false (blur on scroll)
}

TRANSITION DESIGN RULES:
1. Fast entries (0.8-1.2s) for energy, slow entries (2.0-3.0s) for drama
2. Match exit of Scene N with entry of Scene N+1 (fade-out → fade-in, slide-down → slide-up)
3. Use "sudden" entry sparingly (only for shocking reveals)
4. Parallax works best on image/video scenes (0.3-0.5 intensity)
5. Dark backgrounds (#0a0a0a, #1a1a1a) for text scenes, lighter for images
6. Create rhythm: fast → slow → fast (like music)
7. Use "dissolve" exit for smooth transitions to next scene

PACING GUIDELINES:
- Hero/opening scene: Slow, dramatic entry (2.5s fade-in)
- Middle scenes: Moderate pace (1.0-1.5s transitions)
- Climax scene: Fast, energetic (0.8s zoom-in)
- Closing scene: Slow, reflective (2.0s fade-out)

ASSET SELECTION STRATEGY:
1. Start with a strong headline (use first available headline text)
2. Build narrative arc (problem → solution → proof)
3. Use quotes strategically (after showing value, before CTA)
4. Images/videos should support the text narrative
5. Gallery scenes work best in middle (show process/results)

SCENE COUNT:
Create 4-8 scenes for a complete story. More scenes = more scroll depth = longer experience.

OUTPUT REQUIREMENTS:
1. ONLY reference asset IDs from the whitelist above
2. DO NOT create new text, images, or content
3. DO NOT fabricate asset IDs
4. EVERY scene MUST have a complete "director" config
5. Ensure smooth transitions between ALL scenes
6. Timings in SECONDS (not milliseconds)
7. Valid hex colors only (#RRGGBB format)

Generate the scene sequence now with COMPLETE director configs for smooth transitions.`;
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

  // Validate all asset references exist
  const validAssetIds = buildAssetWhitelist(catalog);
  for (const aiScene of aiScenes) {
    for (const assetId of aiScene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        console.warn(`Warning: AI referenced non-existent asset ID: ${assetId}`);
      }
    }
  }

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
        sceneConfig.content = image ? {
          url: image.url,
          alt: image.alt || "",
          caption: image.caption,
        } : {
          url: "https://via.placeholder.com/800x600",
          alt: "Placeholder image",
        };
        break;
      }

      case "video": {
        // Expects 1 video asset
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const video = videoId ? videoMap.get(videoId) : null;
        sceneConfig.content = video ? {
          url: video.url,
          caption: video.caption,
        } : {
          url: "",
          caption: "Video not found",
        };
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
