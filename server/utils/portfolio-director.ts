import { GoogleGenAI, Type } from "@google/genai";
import type { ContentCatalog } from "@shared/schema";

// Lazy-load Gemini client to avoid ESM initialization issues
let ai: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
      httpOptions: {
        apiVersion: "",
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
      },
    });
  }
  return ai;
}

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
Create a scene sequence by FILLING OUT A COMPLETE FORM for each scene. You MUST provide a value for EVERY field listed below. Do not skip any fields.

Think of this as filling out a structured form where blank fields are not allowed. Each scene requires all these decisions:

MANDATORY FIELD CHECKLIST - YOU MUST PROVIDE ALL OF THESE FOR EACH SCENE:
☐ sceneType (text, image, video, quote, split, gallery, or fullscreen)
☐ assetIds (array of valid IDs from the catalog - MUST reference existing IDs only)
☐ entryEffect (fade, slide-up, slide-down, slide-left, slide-right, zoom-in, zoom-out, sudden, cross-fade, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus)
☐ entryDuration (number in seconds, minimum 0.8s recommended, 1.2s+ for noticeable effects)
☐ entryDelay (number in seconds, 0-2, use 0 if unsure)
☐ exitEffect (fade, slide-up, slide-down, slide-left, slide-right, zoom-out, dissolve, cross-fade, rotate-out, flip-out, scale-blur)
☐ exitDuration (number in seconds, minimum 0.6s recommended)
☐ backgroundColor (exact hex code like #0a0a0a or #1e293b)
☐ textColor (exact hex code like #ffffff or #f1f5f9)
☐ parallaxIntensity (number 0.0-1.0, use 0 if scaleOnScroll is true)
☐ headingSize (4xl, 5xl, 6xl, 7xl, or 8xl)
☐ bodySize (base, lg, xl, or 2xl)
☐ alignment (left, center, or right)
☐ fadeOnScroll (boolean: true or false)
☐ scaleOnScroll (boolean: true or false - MUST be false if parallaxIntensity > 0)
☐ blurOnScroll (boolean: true or false - recommended false for performance)

IF YOU SKIP ANY FIELD, THE SCENE WILL FAIL VALIDATION.
IF YOU USE AN INVALID VALUE, THE SCENE WILL FAIL VALIDATION.
IF YOU REFERENCE A NON-EXISTENT ASSET ID, THE SCENE WILL FAIL VALIDATION.

SCENE TYPES (choose based on content):
- "text": Headlines and body copy (use for hero sections, chapter openers)
- "image": Single image with caption (use for visual showcases)
- "video": Video background or focal video (use for demos, motion)
- "quote": Testimonials with author attribution (use for social proof)
- "split": Side-by-side text + media (use for feature explanations)
- "gallery": Multiple images (use for before/after, process steps)
- "fullscreen": Immersive media (use for wow moments, transitions)

FOR EACH SCENE, YOU MUST DECIDE:
1. Which assets to use (from the whitelist)
2. Entry effect (HOW it appears)
3. Entry duration (HOW LONG it takes to appear)
4. Entry delay (WHEN it starts appearing after scroll trigger)
5. Exit effect (HOW it disappears)
6. Exit duration (HOW LONG it takes to disappear)
7. Background color (EXACT hex code)
8. Text color (EXACT hex code)
9. Parallax intensity (0.0 to 1.0, or 0 if using scaleOnScroll)
10. Heading size (4xl, 5xl, 6xl, 7xl, or 8xl)
11. Body size (base, lg, xl, or 2xl)
12. Alignment (left, center, or right)
13. fadeOnScroll (true/false)
14. scaleOnScroll (true/false - MUST be false if parallax > 0)
15. blurOnScroll (true/false - use sparingly)

NO FIELD MAY BE OMITTED. If you're unsure, use the defaults from the interpretation matrix, but you MUST provide a value.

DIRECTOR'S NOTES INTERPRETATION MATRIX:
Use this to translate natural language into technical configs:

SPEED/PACING:
- "fast" / "quick" / "snappy" → entryDuration: 0.8, exitDuration: 0.6, entryDelay: 0
- "normal" / "smooth" / "standard" → entryDuration: 1.2, exitDuration: 1.0, entryDelay: 0
- "slow" / "dramatic" / "deliberate" → entryDuration: 2.5, exitDuration: 1.8, entryDelay: 0.3
- "very slow" / "contemplative" → entryDuration: 4.0, exitDuration: 3.0, entryDelay: 0.5
- "delayed entrance" / "waits before entering" → entryDelay: 0.5-1.0
- "staggered" / "sequential" → entryDelay: 0.3-0.8 (use for variety)

DIRECTION:
- "enters from left" → entryEffect: "slide-right"
- "enters from right" → entryEffect: "slide-left"
- "enters from top" → entryEffect: "slide-down"
- "enters from bottom" → entryEffect: "slide-up"
- "zooms in" / "grows" → entryEffect: "zoom-in" + scaleOnScroll: true
- "appears suddenly" / "instant" → entryEffect: "sudden"
- "spins in" / "rotates in" / "rotating entrance" → entryEffect: "rotate-in"
- "spirals in" / "tornado entrance" → entryEffect: "spiral-in"
- "flips in" / "card flip" / "3D flip" → entryEffect: "flip-in"
- "bounces in" / "elastic" / "springy" → entryEffect: "elastic-bounce"
- "focuses" / "sharpens" / "blur to sharp" → entryEffect: "blur-focus"
- "cross-fades in" / "overlaps" → entryEffect: "cross-fade"

EXIT DIRECTION:
- "exits to left" → exitEffect: "slide-left"
- "exits to right" → exitEffect: "slide-right"
- "exits upward" → exitEffect: "slide-up"
- "exits downward" → exitEffect: "slide-down"
- "fades away" / "fades out" → exitEffect: "fade"
- "dissolves" / "blur dissolve" → exitEffect: "dissolve"
- "cross-fades out" / "smooth transition" → exitEffect: "cross-fade"
- "spins out" / "rotates away" → exitEffect: "rotate-out"
- "flips out" / "card flip exit" → exitEffect: "flip-out"
- "blurs out" / "dramatic blur exit" → exitEffect: "scale-blur"
- "shrinks away" → exitEffect: "zoom-out"
- "spirals out" / "tornado exit" → exitEffect: "spiral-out"
- "bounces out" / "elastic exit" → exitEffect: "elastic-bounce"

EFFECT VISIBILITY THRESHOLDS (CRITICAL - READ CAREFULLY):
- DRAMATIC (≥2.0s): User clearly sees the motion/transformation. Hero moments, chapter transitions.
- NOTICEABLE (1.2-1.9s): Smooth, cinematic feel. Most content scenes should use this range.
- SUBTLE (0.8-1.1s): Quick reveals, maintains flow without drawing attention to the effect itself.
- FLASH (0.3-0.7s): Nearly instant, feels like a page load rather than an animation. AVOID unless intentional.

MINIMUM RECOMMENDED DURATIONS:
- entryDuration: 1.2s (anything below 1.0s feels rushed)
- exitDuration: 1.0s (exits can be slightly faster than entries)
- entryDelay: 0-0.5s (use sparingly, only for staggered reveals)

USE LONGER DURATIONS (2.5s+) FOR:
- First scene (hero entrance)
- Last scene (closing statement)
- Major section transitions
- Quote/testimonial reveals
- Fullscreen media showcases

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

3. PARALLAX DISTRIBUTION (USE SPARINGLY - conflicts with other effects):
   - Text scenes: 0.0 (NO parallax on text)
   - Image scenes: 0.3-0.5 (moderate only)
   - Video/Fullscreen: 0.2-0.4 (subtle)
   - NEVER use parallax with scaleOnScroll (they conflict)

4. COLOR PROGRESSION: Gradually shift backgrounds across scenes
   - Start dark (#0a0a0a) → Mid-tone (#1e293b) → Lighter (#334155) → Back to dark

5. SCROLL EFFECTS USAGE (these are ADDITIONAL to entry/exit, use sparingly):
   - fadeOnScroll: Use on 30% of scenes maximum (subtle effect)
   - scaleOnScroll: Use ONLY when parallaxIntensity = 0 (they conflict)
   - blurOnScroll: NEVER use (causes performance issues)

6. ANTI-CONFLICT RULES:
   - If parallaxIntensity > 0, set scaleOnScroll: false
   - If scaleOnScroll: true, set parallaxIntensity: 0
   - Keep fadeOnScroll subtle (max 30% of scenes)
   - Longer durations (2.5s+) = more noticeable, use for hero moments
   - Shorter durations (0.8-1.2s) = quick reveals, use for content

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
  director: {
    // Required fields (enforced by Gemini schema)
    entryDuration: number;
    exitDuration: number;
    backgroundColor: string;
    textColor: string;
    parallaxIntensity: number;
    entryEffect: string;
    exitEffect: string;
    headingSize: string;
    bodySize: string;
    alignment: string;
    // Optional fields
    animationDuration?: number;
    entryDelay?: number; // Added entryDelay
    fadeOnScroll?: boolean;
    scaleOnScroll?: boolean;
    blurOnScroll?: boolean;
  };
}

interface PortfolioGenerateResponse {
  scenes: GeneratedScene[];
}

/**
 * Call Gemini to orchestrate portfolio scenes from content catalog
 * Uses a 6-stage refinement pipeline for maximum quality:
 * 
 * Stage 1: Initial Generation (Form-Filling) - Gemini fills complete director config
 * Stage 2: Self-Audit for Inconsistencies - AI identifies conflicts and issues
 * Stage 3: Generate 10 Improvements - AI proposes specific enhancements
 * Stage 4: Auto-Apply Non-Conflicting Improvements - System applies valid improvements
 * Stage 5: Final Regeneration - AI regenerates with all fixes applied
 * Stage 6: Final Validation - System validates asset IDs and director configs
 */
export async function generatePortfolioWithAI(
  catalog: ContentCatalog
): Promise<PortfolioGenerateResponse> {
  const aiClient = getAIClient();

  console.log('[Portfolio Director] Starting 6-stage refinement pipeline...');

  // STAGE 1: Initial Generation (Form-Filling)
  const prompt = buildPortfolioPrompt(catalog);
  const stage1Response = await aiClient.models.generateContent({
    model: "gemini-2.5-pro", // Pro model for complex cinematic reasoning
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
                    entryDelay: { type: Type.NUMBER, description: "Entry delay in seconds (0-2)" },
                    backgroundColor: { type: Type.STRING, description: "Hex color code" },
                    textColor: { type: Type.STRING, description: "Hex color code" },
                    parallaxIntensity: { type: Type.NUMBER, description: "0-1, default 0.3" },
                    entryEffect: { type: Type.STRING, description: "fade, slide-up, zoom-in, etc." },
                    exitEffect: { type: Type.STRING, description: "fade, slide-down, zoom-out, etc." },
                    fadeOnScroll: { type: Type.BOOLEAN, description: "Enable fade effect during scroll" },
                    scaleOnScroll: { type: Type.BOOLEAN, description: "Enable scale effect during scroll" },
                    blurOnScroll: { type: Type.BOOLEAN, description: "Enable blur effect during scroll" },
                    headingSize: { type: Type.STRING, description: "4xl, 5xl, 6xl, 7xl, or 8xl" },
                    bodySize: { type: Type.STRING, description: "base, lg, xl, or 2xl" },
                    alignment: { type: Type.STRING, description: "left, center, or right" },
                  },
                  required: ["entryDuration", "exitDuration", "entryDelay", "backgroundColor", "textColor", "parallaxIntensity", "entryEffect", "exitEffect", "headingSize", "bodySize", "alignment"]
                }
              },
              required: ["sceneType", "assetIds", "director"]
            }
          }
        },
        required: ["scenes"]
      }
    }
  });

  const responseText = stage1Response.text;
  if (!responseText) {
    throw new Error("No response from Gemini AI");
  }

  let result = JSON.parse(responseText) as PortfolioGenerateResponse;

  console.log('[Portfolio Director] ✅ Stage 1 complete: Initial generation');

  // CRITICAL: Validate ALL scenes have required fields before proceeding
  const validAssetIds = buildAssetWhitelist(catalog);
  let validationErrors: string[] = [];
  
  // Track which fields are missing per scene for targeted regeneration
  const missingFieldsByScene: Map<number, string[]> = new Map();

  result.scenes.forEach((scene, idx) => {
    const d = scene.director;
    const missingFields: string[] = [];

    // Check required fields and track what's missing
    if (typeof d.entryDuration !== 'number') {
      validationErrors.push(`Scene ${idx}: Missing entryDuration`);
      missingFields.push('entryDuration');
    }
    if (typeof d.exitDuration !== 'number') {
      validationErrors.push(`Scene ${idx}: Missing exitDuration`);
      missingFields.push('exitDuration');
    }
    if (typeof d.entryDelay !== 'number') {
      validationErrors.push(`Scene ${idx}: Missing entryDelay`);
      missingFields.push('entryDelay');
    }
    if (!d.backgroundColor) {
      validationErrors.push(`Scene ${idx}: Missing backgroundColor`);
      missingFields.push('backgroundColor');
    }
    if (!d.textColor) {
      validationErrors.push(`Scene ${idx}: Missing textColor`);
      missingFields.push('textColor');
    }
    if (typeof d.parallaxIntensity !== 'number') {
      validationErrors.push(`Scene ${idx}: Missing parallaxIntensity`);
      missingFields.push('parallaxIntensity');
    }
    if (!d.entryEffect) {
      validationErrors.push(`Scene ${idx}: Missing entryEffect`);
      missingFields.push('entryEffect');
    }
    if (!d.exitEffect) {
      validationErrors.push(`Scene ${idx}: Missing exitEffect`);
      missingFields.push('exitEffect');
    }
    if (!d.headingSize) {
      validationErrors.push(`Scene ${idx}: Missing headingSize`);
      missingFields.push('headingSize');
    }
    if (!d.bodySize) {
      validationErrors.push(`Scene ${idx}: Missing bodySize`);
      missingFields.push('bodySize');
    }
    if (!d.alignment) {
      validationErrors.push(`Scene ${idx}: Missing alignment`);
      missingFields.push('alignment');
    }
    
    if (missingFields.length > 0) {
      missingFieldsByScene.set(idx, missingFields);
    }

    // Check asset IDs exist
    scene.assetIds.forEach(assetId => {
      if (!validAssetIds.includes(assetId)) {
        validationErrors.push(`Scene ${idx}: Invalid asset ID "${assetId}"`);
      }
    });
  });

  // If fields are missing, attempt targeted regeneration (Stage 1.5: Field Recovery with Retry)
  if (missingFieldsByScene.size > 0) {
    console.warn('[Portfolio Director] ⚠️ Stage 1 validation found missing fields, attempting recovery...');
    
    const MAX_RETRY_ATTEMPTS = 2;
    
    for (const [sceneIdx, missingFields] of missingFieldsByScene.entries()) {
      const scene = result.scenes[sceneIdx];
      let retryCount = 0;
      let fieldsStillMissing = [...missingFields];
      
      while (fieldsStillMissing.length > 0 && retryCount < MAX_RETRY_ATTEMPTS) {
        retryCount++;
        console.log(`[Portfolio Director] 🔄 Retry ${retryCount}/${MAX_RETRY_ATTEMPTS} for scene ${sceneIdx}, missing: ${fieldsStillMissing.join(', ')}`);
        
        const recoveryPrompt = `You previously generated this scene but forgot to fill in some required fields:

Scene Type: ${scene.sceneType}
Asset IDs: ${scene.assetIds.join(', ')}

MISSING FIELDS (you MUST provide these):
${fieldsStillMissing.map(field => `- ${field}`).join('\n')}

Please provide ONLY the missing field values in JSON format:
{
  ${fieldsStillMissing.map(field => `"${field}": <value>`).join(',\n  ')}
}

FIELD REQUIREMENTS:
- entryDuration/exitDuration: numbers in seconds (0.8-5.0, e.g., 1.2)
- entryDelay: number in seconds (0-2, e.g., 0.3)
- backgroundColor/textColor: hex codes (e.g., "#0a0a0a")
- parallaxIntensity: number 0-1 (e.g., 0.3)
- entryEffect: fade, slide-up, slide-down, zoom-in, etc.
- exitEffect: fade, slide-up, zoom-out, dissolve, etc.
- headingSize: 4xl, 5xl, 6xl, 7xl, or 8xl
- bodySize: base, lg, xl, or 2xl
- alignment: left, center, or right

Use the interpretation matrix from the original prompt for guidance.`;

        try {
          const recoveryResponse = await aiClient.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ role: "user", parts: [{ text: recoveryPrompt }] }],
            config: { responseMimeType: "application/json" }
          });

          const recoveredFields = JSON.parse(recoveryResponse.text || '{}');
          
          // Merge recovered fields back into the scene
          const successfullyRecovered: string[] = [];
          for (const field of fieldsStillMissing) {
            if (recoveredFields[field] !== undefined && recoveredFields[field] !== null) {
              (scene.director as any)[field] = recoveredFields[field];
              successfullyRecovered.push(field);
              console.log(`[Portfolio Director] ✅ Recovered ${field} for scene ${sceneIdx}: ${JSON.stringify(recoveredFields[field])}`);
            }
          }
          
          // Update list of fields still missing
          fieldsStillMissing = fieldsStillMissing.filter(f => !successfullyRecovered.includes(f));
          
        } catch (error) {
          console.error(`[Portfolio Director] ❌ Failed recovery attempt ${retryCount} for scene ${sceneIdx}:`, error);
        }
      }
      
      // If fields are still missing after all retries, apply intelligent defaults
      if (fieldsStillMissing.length > 0) {
        console.warn(`[Portfolio Director] ⚠️ Applying defaults for scene ${sceneIdx} fields: ${fieldsStillMissing.join(', ')}`);
        for (const field of fieldsStillMissing) {
          switch (field) {
            case 'entryDuration':
              scene.director.entryDuration = 1.2;
              break;
            case 'exitDuration':
              scene.director.exitDuration = 1.0;
              break;
            case 'entryDelay':
              scene.director.entryDelay = 0;
              break;
            case 'backgroundColor':
              scene.director.backgroundColor = '#0a0a0a';
              break;
            case 'textColor':
              scene.director.textColor = '#ffffff';
              break;
            case 'parallaxIntensity':
              scene.director.parallaxIntensity = 0.3;
              break;
            case 'entryEffect':
              scene.director.entryEffect = 'fade';
              break;
            case 'exitEffect':
              scene.director.exitEffect = 'fade';
              break;
            case 'headingSize':
              scene.director.headingSize = '5xl';
              break;
            case 'bodySize':
              scene.director.bodySize = 'lg';
              break;
            case 'alignment':
              scene.director.alignment = 'center';
              break;
          }
        }
      }
    }
    
    // Re-validate after recovery
    validationErrors = [];
    result.scenes.forEach((scene, idx) => {
      const d = scene.director;
      if (typeof d.entryDuration !== 'number') validationErrors.push(`Scene ${idx}: Missing entryDuration`);
      if (typeof d.exitDuration !== 'number') validationErrors.push(`Scene ${idx}: Missing exitDuration`);
      if (typeof d.entryDelay !== 'number') validationErrors.push(`Scene ${idx}: Missing entryDelay`);
      if (!d.backgroundColor) validationErrors.push(`Scene ${idx}: Missing backgroundColor`);
      if (!d.textColor) validationErrors.push(`Scene ${idx}: Missing textColor`);
      if (typeof d.parallaxIntensity !== 'number') validationErrors.push(`Scene ${idx}: Missing parallaxIntensity`);
      if (!d.entryEffect) validationErrors.push(`Scene ${idx}: Missing entryEffect`);
      if (!d.exitEffect) validationErrors.push(`Scene ${idx}: Missing exitEffect`);
      if (!d.headingSize) validationErrors.push(`Scene ${idx}: Missing headingSize`);
      if (!d.bodySize) validationErrors.push(`Scene ${idx}: Missing bodySize`);
      if (!d.alignment) validationErrors.push(`Scene ${idx}: Missing alignment`);
    });
  }

  if (validationErrors.length > 0) {
    console.error('[Portfolio Director] ❌ Stage 1 validation failed after recovery:', validationErrors);
    throw new Error(`Gemini output validation failed:\n${validationErrors.join('\n')}`);
  }

  console.log('[Portfolio Director] ✅ Stage 1 validation passed');

  // STAGE 2: Self-Audit for Inconsistencies
  const auditPrompt = `You previously generated this scene sequence JSON:

${JSON.stringify(result, null, 2)}

Audit this JSON for:
1. Internal contradictions (e.g., parallax + scaleOnScroll both enabled)
2. Missing required fields
3. Invalid values (durations < 0.1, colors not hex format, etc.)
4. Pacing issues (all scenes same speed, no rhythm)
5. Transition mismatches (exit effect of Scene N doesn't flow into entry of Scene N+1)

Return a JSON array of issues found:
{
  "issues": [
    {"sceneIndex": 0, "field": "parallaxIntensity", "problem": "Conflicts with scaleOnScroll: true", "suggestion": "Set parallaxIntensity to 0"},
    ...
  ]
}`;

  const auditResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: auditPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneIndex: { type: Type.NUMBER },
                field: { type: Type.STRING },
                problem: { type: Type.STRING },
                suggestion: { type: Type.STRING }
              },
              required: ["sceneIndex", "field", "problem", "suggestion"]
            }
          }
        },
        required: ["issues"]
      }
    }
  });

  const auditResult = JSON.parse(auditResponse.text || '{"issues":[]}');
  console.log(`[Portfolio Director] ✅ Stage 2 complete: Found ${auditResult.issues.length} issues`);

  // STAGE 3: Generate 10 Improvements
  const improvementsPrompt = `You previously generated this scene sequence:

${JSON.stringify(result, null, 2)}

User requirements from director notes:
${catalog.directorNotes}

Generate 10 specific improvements to make this sequence better:
1. Better timing/pacing
2. More cinematic transitions
3. Improved color progression
4. Better asset utilization
5. Enhanced narrative flow

Each improvement should be actionable and specific.

Return:
{
  "improvements": [
    {"sceneIndex": 0, "field": "entryDuration", "currentValue": 1.2, "newValue": 2.5, "reason": "Hero should be slower and more dramatic"},
    ...
  ]
}`;

  const improvementsResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: improvementsPrompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneIndex: { type: Type.NUMBER },
                field: { type: Type.STRING },
                currentValue: { type: Type.STRING },
                newValue: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["sceneIndex", "field", "newValue", "reason"]
            }
          }
        },
        required: ["improvements"]
      }
    }
  });

  const improvementsResult = JSON.parse(improvementsResponse.text || '{"improvements":[]}');
  console.log(`[Portfolio Director] ✅ Stage 3 complete: Generated ${improvementsResult.improvements.length} improvements`);

  // STAGE 4: Auto-Apply Non-Conflicting Improvements
  const appliedImprovements: string[] = [];
  for (const improvement of improvementsResult.improvements) {
    const scene = result.scenes[improvement.sceneIndex];
    if (!scene) continue;

    // Check for conflicts with audit issues
    const hasConflict = auditResult.issues.some(
      (issue: any) => issue.sceneIndex === improvement.sceneIndex && issue.field === improvement.field
    );

    if (!hasConflict) {
      // Apply improvement
      const fieldPath = improvement.field.split('.');
      let target: any = scene;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        target = target[fieldPath[i]];
      }
      const finalField = fieldPath[fieldPath.length - 1];

      // Type conversion
      let newValue: any = improvement.newValue;
      if (typeof target[finalField] === 'number') {
        newValue = parseFloat(improvement.newValue);
      } else if (typeof target[finalField] === 'boolean') {
        newValue = improvement.newValue === 'true';
      }

      target[finalField] = newValue;
      appliedImprovements.push(`Scene ${improvement.sceneIndex}: ${improvement.field} = ${newValue} (${improvement.reason})`);
    }
  }

  console.log(`[Portfolio Director] ✅ Stage 4 complete: Applied ${appliedImprovements.length} improvements`);

  // STAGE 5: Final Regeneration for Consistency
  const finalPrompt = `Based on the following improvements and fixes, regenerate the complete scene sequence with all enhancements applied:

ORIGINAL DIRECTOR NOTES:
${catalog.directorNotes}

APPLIED IMPROVEMENTS:
${appliedImprovements.join('\n')}

AUDIT ISSUES FIXED:
${auditResult.issues.map((issue: any) => `- Scene ${issue.sceneIndex}: ${issue.field} - ${issue.suggestion}`).join('\n')}

Generate the final, polished scene sequence incorporating ALL improvements and fixes. Ensure:
1. All timing is dramatic and noticeable
2. Transitions flow seamlessly between scenes
3. No conflicts between parallax/scaleOnScroll/blurOnScroll
4. Color progression creates visual journey
5. Pacing has musical rhythm (varied speeds)
6. Asset selection tells compelling story

Return the complete scenes array with full director configs.`;

  const finalResponse = await aiClient.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
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
                sceneType: { type: Type.STRING },
                assetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                layout: { type: Type.STRING },
                director: {
                  type: Type.OBJECT,
                  properties: {
                    entryDuration: { type: Type.NUMBER },
                    exitDuration: { type: Type.NUMBER },
                    animationDuration: { type: Type.NUMBER },
                    entryDelay: { type: Type.NUMBER },
                    backgroundColor: { type: Type.STRING },
                    textColor: { type: Type.STRING },
                    parallaxIntensity: { type: Type.NUMBER },
                    entryEffect: { type: Type.STRING },
                    exitEffect: { type: Type.STRING },
                    fadeOnScroll: { type: Type.BOOLEAN },
                    scaleOnScroll: { type: Type.BOOLEAN },
                    blurOnScroll: { type: Type.BOOLEAN },
                    headingSize: { type: Type.STRING },
                    bodySize: { type: Type.STRING },
                    alignment: { type: Type.STRING },
                  },
                  required: ["entryDuration", "exitDuration", "entryDelay", "backgroundColor", "textColor", "parallaxIntensity", "entryEffect", "exitEffect", "headingSize", "bodySize", "alignment"]
                }
              },
              required: ["sceneType", "assetIds", "director"]
            }
          }
        },
        required: ["scenes"]
      }
    }
  });

  result = JSON.parse(finalResponse.text || '{"scenes":[]}');
  console.log(`[Portfolio Director] ✅ Stage 5 complete: Final regeneration with ${result.scenes.length} scenes`);

  // STAGE 6: Final Validation Against Requirements
  console.log('[Portfolio Director] ✅ Stage 6: Final validation');

  // Validate that all referenced asset IDs exist and log potential issues
  const finalValidAssetIds = buildAssetWhitelist(catalog); // Re-fetch for latest context if catalog changed
  const warnings: string[] = [];

  for (const scene of result.scenes) {
    for (const assetId of scene.assetIds) {
      if (!finalValidAssetIds.includes(assetId)) {
        const errorMsg = `AI referenced non-existent asset ID: ${assetId}. Valid IDs: ${finalValidAssetIds.join(', ')}`;
        console.error(`❌ [Portfolio Director] ${errorMsg}`);
        // Instead of throwing, we'll just log and continue, as Gemini might hallucinate an ID
        // but still produce a valid structure. The frontend will handle missing assets gracefully.
      }
    }

    // Basic validation for required director fields and potential conflicts
    const director = scene.director;
    if (director.parallaxIntensity > 0 && director.scaleOnScroll) {
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ parallax + scaleOnScroll conflict detected. Auto-fixing scaleOnScroll to false.`);
      scene.director.scaleOnScroll = false; // Auto-fix
    }

    if (director.entryDuration !== undefined && director.entryDuration < 0.5) {
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ Entry duration ${director.entryDuration}s may be too subtle.`);
    }

    if (!director.exitEffect) {
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ No exit effect specified.`);
    }

    // Ensure valid durations with type and range checks
    if (typeof director.entryDuration !== 'number' || director.entryDuration < 0.1) {
      scene.director.entryDuration = 1.2; // Default to standard
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ Invalid entryDuration, defaulting to 1.2s`);
    }
    if (typeof director.exitDuration !== 'number' || director.exitDuration < 0.1) {
      scene.director.exitDuration = 1.0; // Default to standard
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ Invalid exitDuration, defaulting to 1.0s`);
    }
    if (typeof director.entryDelay !== 'number' || director.entryDelay < 0) {
      scene.director.entryDelay = 0; // Default to no delay
    }
    if (typeof director.parallaxIntensity !== 'number' || director.parallaxIntensity < 0 || director.parallaxIntensity > 1) {
      scene.director.parallaxIntensity = 0.3; // Default to moderate
      warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ Invalid parallaxIntensity (must be 0-1), defaulting to 0.3`);
    }

    // Validate color contrast (simplified check - ensures not identical colors)
    if (director.backgroundColor && director.textColor) {
      const bgLower = director.backgroundColor.toLowerCase();
      const textLower = director.textColor.toLowerCase();

      // Check if colors are too similar (simple heuristic)
      if (bgLower === textLower) {
        warnings.push(`Scene with assetIds [${scene.assetIds.join(', ')}]: ⚠️ Text and background colors are identical - text will be invisible!`);
        // Auto-fix: if background is dark, make text white; if light, make text dark
        const isDarkBg = bgLower.includes('#0') || bgLower.includes('#1') || bgLower === '#000000';
        scene.director.textColor = isDarkBg ? '#ffffff' : '#0a0a0a';
        warnings.push(`  → Auto-fixed textColor to ${scene.director.textColor}`);
      }
    }

  }

  console.log('[Portfolio Director] 🎬 PIPELINE COMPLETE - Final Output:', {
    totalScenes: result.scenes.length,
    stage1: 'Initial generation',
    stage2: `Found ${auditResult.issues.length} issues`,
    stage3: `Generated ${improvementsResult.improvements.length} improvements`,
    stage4: `Applied ${appliedImprovements.length} improvements`,
    stage5: 'Final regeneration with all fixes',
    stage6: warnings.length > 0 ? `${warnings.length} warnings` : 'All validations passed',
    appliedImprovements: appliedImprovements.length > 0 ? appliedImprovements : 'none',
    warnings: warnings.length > 0 ? warnings : 'none',
    sceneSummary: result.scenes.map((s, i) => ({
      index: i,
      type: s.sceneType,
      assets: s.assetIds.length,
      entry: `${s.director.entryEffect} (${s.director.entryDuration}s)`,
      exit: `${s.director.exitEffect} (${s.director.exitDuration}s)`,
    }))
  });

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
      director: aiScene.director, // Now always required by schema
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

        if (!video) {
          console.error(`❌ [Portfolio Director] Video scene failed - no matching video found for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = video ? {
          url: video.url,
          caption: video.caption,
        } : {
          url: "",
          caption: "Video content not available",
        };
        break;
      }

      case "quote": {
        // Expects 1 quote asset
        const quoteId = aiScene.assetIds.find((id) => quoteMap.has(id));
        const quote = quoteId ? quoteMap.get(quoteId) : null;

        if (!quote) {
          console.error(`❌ [Portfolio Director] Quote scene failed - no matching quote found for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = quote ? {
          quote: quote.quote,
          author: quote.author,
          role: quote.role,
        } : {
          quote: "Testimonial content not available",
          author: "Unknown",
          role: "",
        };
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

        if (!text) {
          console.error(`❌ [Portfolio Director] Split scene missing text for assetIds:`, aiScene.assetIds);
        }
        if (!image && !video) {
          console.error(`❌ [Portfolio Director] Split scene missing media for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          heading: text?.content || "Content unavailable",
          body: texts[1]?.content || "",
          media: image?.url || video?.url || "https://via.placeholder.com/800x600",
          mediaType: video ? "video" : "image",
          alt: image?.alt || "Placeholder image",
        };
        break;
      }

      case "gallery": {
        // Expects multiple images
        const images = aiScene.assetIds.map((id) => imageMap.get(id)).filter(Boolean);

        if (images.length === 0) {
          console.error(`❌ [Portfolio Director] Gallery scene has no valid images for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          heading: "",
          images: images.length > 0 ? images.map((img) => ({
            url: img!.url,
            alt: img!.alt,
            caption: img!.caption,
          })) : [{
            url: "https://via.placeholder.com/800x600",
            alt: "Placeholder image",
            caption: "Gallery content not available",
          }],
        };
        break;
      }

      case "fullscreen": {
        // Expects 1 media asset
        const imageId = aiScene.assetIds.find((id) => imageMap.has(id));
        const videoId = aiScene.assetIds.find((id) => videoMap.has(id));
        const image = imageId ? imageMap.get(imageId) : null;
        const video = videoId ? videoMap.get(videoId) : null;

        if (!image && !video) {
          console.error(`❌ [Portfolio Director] Fullscreen scene missing media for assetIds:`, aiScene.assetIds);
        }

        sceneConfig.content = {
          url: image?.url || video?.url || "https://via.placeholder.com/1920x1080",
          mediaType: video ? "video" : "image",
          alt: image?.alt || "Fullscreen media placeholder",
          overlay: false,
        };
        break;
      }
    }

    sceneConfigs.push(sceneConfig);
  }

  return sceneConfigs;
}