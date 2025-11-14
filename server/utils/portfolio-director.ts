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

DIRECTOR CONFIG - COMPLETE FIELD REFERENCE:
You MUST provide ALL of these fields for EVERY scene. Do NOT omit any field.

REQUIRED FIELDS (every scene must have these):
┌─────────────────────────────────────────────────────────────────────────────┐
│ "entryEffect": STRING - How the scene enters the viewport                  │
│   ALLOWED VALUES:                                                           │
│   - "fade": Opacity 0→1 (smooth, universal)                                 │
│   - "slide-up": Slides from bottom edge (dynamic, reveals)                  │
│   - "slide-down": Slides from top edge (authoritative, drops in)            │
│   - "slide-left": Slides from right edge (directional storytelling)         │
│   - "slide-right": Slides from left edge (natural reading flow)             │
│   - "zoom-in": Scales from 0.8→1 (impactful, draws attention)              │
│   - "zoom-out": Scales from 1.2→1 (explosive, expands outward)             │
│   - "sudden": No transition, instant appearance (shock, disruption)         │
│   DEFAULT: "fade"                                                           │
│   USAGE: Match to director's notes (e.g., "enters from left" = slide-right)│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "entryDuration": NUMBER (seconds) - How long the entry animation takes     │
│   RANGE: 0.5 to 5.0                                                         │
│   RECOMMENDED VALUES:                                                       │
│   - 0.5-0.8: Fast, energetic (action scenes, quick cuts)                    │
│   - 1.0-1.5: Standard, smooth (most scenes)                                 │
│   - 2.0-3.0: Slow, dramatic (hero scenes, emotional moments)                │
│   - 3.5-5.0: Very slow, contemplative (rare, meditative)                    │
│   DEFAULT: 1.2                                                              │
│   USAGE: Shorter = faster pacing, longer = more dramatic                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "entryDelay": NUMBER (seconds) - Delay before entry animation starts       │
│   RANGE: 0.0 to 10.0                                                        │
│   RECOMMENDED VALUES:                                                       │
│   - 0.0: Immediate (default, most scenes)                                   │
│   - 0.3-0.5: Brief pause (creates anticipation)                             │
│   - 0.8-1.5: Noticeable delay (build tension)                               │
│   - 2.0+: Long delay (rare, dramatic effect)                                │
│   DEFAULT: 0.0                                                              │
│   USAGE: Use sparingly; most scenes should be 0.0                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "exitEffect": STRING - How the scene exits the viewport                    │
│   ALLOWED VALUES:                                                           │
│   - "fade": Opacity 1→0 (smooth, universal)                                 │
│   - "slide-up": Slides toward top edge (lifting away)                       │
│   - "slide-down": Slides toward bottom edge (sinking, transitioning)        │
│   - "slide-left": Slides toward left edge (exiting left)                    │
│   - "slide-right": Slides toward right edge (exiting right)                 │
│   - "zoom-out": Scales from 1→0.8 (receding into distance)                 │
│   - "dissolve": Fades with blur (cinematic, elegant)                        │
│   DEFAULT: "fade"                                                           │
│   USAGE: Should complement next scene's entryEffect                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "exitDuration": NUMBER (seconds) - How long the exit animation takes       │
│   RANGE: 0.5 to 5.0                                                         │
│   RECOMMENDED VALUES:                                                       │
│   - 0.5-0.8: Fast, snappy (quick transitions)                               │
│   - 1.0-1.5: Standard, smooth (most scenes)                                 │
│   - 2.0-3.0: Slow, lingering (emotional beats)                              │
│   DEFAULT: 1.0                                                              │
│   USAGE: Often slightly faster than entryDuration                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "backgroundColor": STRING (hex color) - Scene background color             │
│   FORMAT: "#RRGGBB" (must include # prefix)                                 │
│   RECOMMENDED PALETTES:                                                     │
│   DARK THEMES (for text-heavy scenes):                                      │
│   - "#0a0a0a": Near black (hero scenes, dramatic)                           │
│   - "#1a1a1a": Dark charcoal (body text, readable)                          │
│   - "#0f172a": Deep navy (professional, tech)                               │
│   - "#1e293b": Slate blue (modern, sophisticated)                           │
│   LIGHT THEMES (for image scenes):                                          │
│   - "#f8fafc": Off-white (clean, minimal)                                   │
│   - "#f1f5f9": Light gray (soft, elegant)                                   │
│   - "#e2e8f0": Medium gray (neutral, balanced)                              │
│   ACCENT THEMES (for special scenes):                                       │
│   - "#7c3aed": Purple (creative, bold)                                      │
│   - "#2563eb": Blue (trust, corporate)                                      │
│   - "#dc2626": Red (urgent, attention)                                      │
│   DEFAULT: "#0a0a0a"                                                        │
│   USAGE: Dark for text, light for media, match brand colors                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "textColor": STRING (hex color) - Text color for the scene                 │
│   FORMAT: "#RRGGBB" (must include # prefix)                                 │
│   RECOMMENDED COLORS:                                                       │
│   FOR DARK BACKGROUNDS:                                                     │
│   - "#ffffff": Pure white (maximum contrast)                                │
│   - "#f8fafc": Off-white (softer, less harsh)                               │
│   - "#e2e8f0": Light gray (subtle, elegant)                                 │
│   FOR LIGHT BACKGROUNDS:                                                    │
│   - "#0a0a0a": Near black (maximum contrast)                                │
│   - "#1a1a1a": Dark charcoal (readable, professional)                       │
│   - "#334155": Slate gray (softer, modern)                                  │
│   DEFAULT: "#ffffff"                                                        │
│   USAGE: Ensure WCAG AA contrast (4.5:1 minimum)                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "parallaxIntensity": NUMBER (0.0 to 1.0) - Depth of parallax effect        │
│   RANGE: 0.0 (no parallax) to 1.0 (extreme parallax)                        │
│   RECOMMENDED VALUES:                                                       │
│   - 0.0: No parallax (static, text scenes)                                  │
│   - 0.2-0.3: Subtle (gentle depth, professional)                            │
│   - 0.4-0.5: Moderate (noticeable, engaging)                                │
│   - 0.6-0.7: Strong (dramatic, impactful)                                   │
│   - 0.8-1.0: Extreme (rare, showcase moments)                               │
│   DEFAULT: 0.3                                                              │
│   USAGE: Higher for image/video scenes, lower for text                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "animationDuration": NUMBER (seconds) - Main animation loop duration       │
│   RANGE: 0.5 to 10.0                                                        │
│   RECOMMENDED VALUES:                                                       │
│   - 1.0-2.0: Quick, energetic (most scenes)                                 │
│   - 3.0-5.0: Moderate, smooth (hero scenes)                                 │
│   - 6.0-10.0: Slow, ambient (background effects)                            │
│   DEFAULT: 2.0                                                              │
│   USAGE: Controls ongoing animations within the scene                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "headingSize": STRING - Font size for headings                             │
│   ALLOWED VALUES:                                                           │
│   - "4xl": 36px / 2.25rem (small headings, subheadings)                     │
│   - "5xl": 48px / 3rem (standard headings)                                  │
│   - "6xl": 60px / 3.75rem (large headings, impact)                          │
│   - "7xl": 72px / 4.5rem (hero headings, dramatic)                          │
│   - "8xl": 96px / 6rem (XXL headings, rare use)                             │
│   DEFAULT: "6xl"                                                            │
│   USAGE: Bigger = more impact, smaller = more content                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "bodySize": STRING - Font size for body text                               │
│   ALLOWED VALUES:                                                           │
│   - "base": 16px / 1rem (standard, readable)                                │
│   - "lg": 18px / 1.125rem (slightly larger, comfortable)                    │
│   - "xl": 20px / 1.25rem (large, emphasis)                                  │
│   - "2xl": 24px / 1.5rem (very large, rare use)                             │
│   DEFAULT: "lg"                                                             │
│   USAGE: Larger = easier to read, smaller = more content                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "alignment": STRING - Text alignment                                       │
│   ALLOWED VALUES:                                                           │
│   - "left": Left-aligned (natural, readable)                                │
│   - "center": Center-aligned (hero scenes, symmetry)                        │
│   - "right": Right-aligned (rare, artistic)                                 │
│   DEFAULT: "center"                                                         │
│   USAGE: Center for hero/image scenes, left for text-heavy                  │
└─────────────────────────────────────────────────────────────────────────────┘

OPTIONAL SCROLL EFFECTS (set true/false):
┌─────────────────────────────────────────────────────────────────────────────┐
│ "fadeOnScroll": BOOLEAN - Fade opacity as user scrolls past                │
│   - true: Element fades out as viewport scrolls past                        │
│   - false: Element maintains opacity                                        │
│   DEFAULT: false                                                            │
│   USAGE: Creates smooth transitions between scenes                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "scaleOnScroll": BOOLEAN - Scale/zoom as user scrolls                      │
│   - true: Element scales during scroll (zoom effect)                        │
│   - false: Element maintains size                                           │
│   DEFAULT: false                                                            │
│   USAGE: Adds depth and motion to image scenes                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ "blurOnScroll": BOOLEAN - Blur as user scrolls past                        │
│   - true: Element blurs as viewport scrolls past                            │
│   - false: Element maintains sharpness                                      │
│   DEFAULT: false                                                            │
│   USAGE: Cinematic depth-of-field effect                                    │
└─────────────────────────────────────────────────────────────────────────────┘

COMPLETE EXAMPLE CONFIGS:

Example 1: Hero Text Scene (Dramatic, Slow Entry)
{
  "entryEffect": "fade",
  "entryDuration": 2.5,
  "entryDelay": 0.0,
  "exitEffect": "fade",
  "exitDuration": 1.5,
  "backgroundColor": "#0a0a0a",
  "textColor": "#ffffff",
  "parallaxIntensity": 0.0,
  "animationDuration": 3.0,
  "headingSize": "7xl",
  "bodySize": "xl",
  "alignment": "center",
  "fadeOnScroll": false,
  "scaleOnScroll": false,
  "blurOnScroll": false
}

Example 2: Image Showcase (Parallax, Zoom)
{
  "entryEffect": "zoom-in",
  "entryDuration": 1.5,
  "entryDelay": 0.0,
  "exitEffect": "dissolve",
  "exitDuration": 1.2,
  "backgroundColor": "#1a1a1a",
  "textColor": "#f8fafc",
  "parallaxIntensity": 0.5,
  "animationDuration": 4.0,
  "headingSize": "5xl",
  "bodySize": "lg",
  "alignment": "center",
  "fadeOnScroll": true,
  "scaleOnScroll": true,
  "blurOnScroll": false
}

Example 3: Split Scene (Text + Media, Slide In)
{
  "entryEffect": "slide-right",
  "entryDuration": 1.2,
  "entryDelay": 0.0,
  "exitEffect": "slide-left",
  "exitDuration": 1.0,
  "backgroundColor": "#0f172a",
  "textColor": "#ffffff",
  "parallaxIntensity": 0.3,
  "animationDuration": 2.0,
  "headingSize": "6xl",
  "bodySize": "lg",
  "alignment": "left",
  "fadeOnScroll": false,
  "scaleOnScroll": false,
  "blurOnScroll": false
}

Example 4: Quote Scene (Subtle, Elegant)
{
  "entryEffect": "fade",
  "entryDuration": 1.8,
  "entryDelay": 0.3,
  "exitEffect": "fade",
  "exitDuration": 1.5,
  "backgroundColor": "#1e293b",
  "textColor": "#e2e8f0",
  "parallaxIntensity": 0.2,
  "animationDuration": 3.0,
  "headingSize": "5xl",
  "bodySize": "xl",
  "alignment": "center",
  "fadeOnScroll": true,
  "scaleOnScroll": false,
  "blurOnScroll": false
}

DIRECTOR'S NOTES INTERPRETATION MATRIX:
Use this to translate natural language into technical configs:

SPEED/PACING:
- "fast" / "quick" / "snappy" → entryDuration: 0.8, exitDuration: 0.6
- "normal" / "smooth" / "standard" → entryDuration: 1.2, exitDuration: 1.0
- "slow" / "dramatic" / "deliberate" → entryDuration: 2.5, exitDuration: 1.8
- "very slow" / "contemplative" → entryDuration: 4.0, exitDuration: 3.0

DIRECTION:
- "enters from left" → entryEffect: "slide-right"
- "enters from right" → entryEffect: "slide-left"
- "enters from top" → entryEffect: "slide-down"
- "enters from bottom" → entryEffect: "slide-up"
- "zooms in" / "grows" → entryEffect: "zoom-in" + scaleOnScroll: true
- "appears suddenly" → entryEffect: "sudden"

EXIT DIRECTION:
- "exits to left" → exitEffect: "slide-left"
- "exits to right" → exitEffect: "slide-right"
- "exits upward" → exitEffect: "slide-up"
- "exits downward" → exitEffect: "slide-down"
- "fades away" → exitEffect: "fade"
- "crossfades" / "dissolves" → exitEffect: "dissolve"

MOOD/ATMOSPHERE:
- "dramatic" / "intense" → parallaxIntensity: 0.6-0.8, entryDuration: 2.5+
- "subtle" / "gentle" → parallaxIntensity: 0.2-0.3, entryDuration: 1.2-1.5
- "energetic" / "dynamic" → scaleOnScroll: true, entryDuration: 0.8-1.0
- "elegant" / "refined" → exitEffect: "dissolve", fadeOnScroll: true
- "cinematic" → blurOnScroll: true, parallaxIntensity: 0.5+

VISUAL STYLE:
- "dark" / "moody" → backgroundColor: "#0a0a0a" or "#1a1a1a"
- "light" / "bright" → backgroundColor: "#f8fafc" or "#f1f5f9"
- "bold" / "high contrast" → textColor: "#ffffff", backgroundColor: "#0a0a0a"
- "minimal" / "clean" → alignment: "center", backgroundColor: "#f8fafc"

TRANSITION DESIGN RULES:
1. CONTINUITY: Exit effect of Scene N should complement entry effect of Scene N+1
   - fade → fade (smooth)
   - slide-up → slide-up (maintaining direction)
   - dissolve → fade (cinematic transition)

2. PACING RHYTHM: Vary speeds to create musical flow
   - Hero (slow 2.5s) → Content (medium 1.2s) → Image (fast 0.8s) → Quote (slow 1.8s)

3. PARALLAX DISTRIBUTION:
   - Text scenes: 0.0-0.2 (minimal or none)
   - Image scenes: 0.4-0.6 (moderate to strong)
   - Video/Fullscreen: 0.3-0.5 (moderate)

4. COLOR PROGRESSION: Gradually shift backgrounds across scenes
   - Start dark (#0a0a0a) → Mid-tone (#1e293b) → Lighter (#334155) → Back to dark

5. SCROLL EFFECTS USAGE:
   - fadeOnScroll: Use on 50% of scenes for smooth transitions
   - scaleOnScroll: Use sparingly on image/video scenes (20-30%)
   - blurOnScroll: Use rarely for dramatic effect (10% of scenes)

ASSET SELECTION STRATEGY:
1. START STRONG: First scene should use the most impactful headline
2. BUILD NARRATIVE: Use texts in logical order (problem → solution → proof)
3. VISUAL SUPPORT: Place images/videos AFTER related text scenes
4. SOCIAL PROOF: Insert quotes after demonstrating value
5. VARIETY: Alternate between text-heavy and media-heavy scenes

SCENE COUNT GUIDELINES:
- 4-5 scenes: Quick story (2-3 min scroll)
- 6-7 scenes: Standard portfolio (3-5 min scroll)
- 8+ scenes: Epic narrative (5+ min scroll)

OUTPUT REQUIREMENTS:
1. EVERY scene MUST have ALL director config fields (no omissions)
2. ONLY use asset IDs from the whitelist: ${validAssetIds.join(', ')}
3. DO NOT fabricate new content or IDs
4. Timings MUST be in SECONDS (not milliseconds)
5. Colors MUST be valid hex format (#RRGGBB)
6. Ensure smooth narrative flow across all scenes
7. Create complementary transitions between consecutive scenes

Generate the scene sequence now with COMPLETE director configs.`;
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

  console.log('[Portfolio Director] Asset Maps:', {
    texts: Array.from(textMap.keys()),
    images: Array.from(imageMap.keys()),
    videos: Array.from(videoMap.keys()),
    quotes: Array.from(quoteMap.keys()),
  });

  // Validate all asset references exist
  const validAssetIds = buildAssetWhitelist(catalog);
  for (const aiScene of aiScenes) {
    console.log(`[Portfolio Director] Scene type "${aiScene.sceneType}" wants assets:`, aiScene.assetIds);
    for (const assetId of aiScene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        console.error(`❌ AI referenced non-existent asset ID: ${assetId}. Valid IDs: ${validAssetIds.join(', ')}`);
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
        
        if (!image) {
          console.error(`❌ [Portfolio Director] Image scene failed - no matching image found for assetIds:`, aiScene.assetIds);
          console.error(`   Available image IDs:`, Array.from(imageMap.keys()));
        } else {
          console.log(`✅ [Portfolio Director] Image scene matched:`, { imageId, url: image.url });
        }
        
        sceneConfig.content = image ? {
          url: image.url,
          alt: image.alt || "",
          caption: image.caption,
        } : {
          url: "https://via.placeholder.com/800x600",
          alt: "Placeholder image (NO MATCH FOUND)",
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
