
import { GoogleGenAI, Type } from "@google/genai";
import type { ContentCatalog } from "@shared/schema";

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

/**
 * CINEMATIC AI DIRECTOR - Multi-Stage Pipeline
 * 
 * Stage 1: Storyboard Vision (Film Director)
 * Stage 2: Creative Refinement (Self-Critique)
 * Stage 3: Technical Translation (JSON + CSS)
 * Stage 4: Validation & Polish (Accuracy Check)
 * Stage 5: Final Assembly (Asset Verification)
 */

interface StoryboardScene {
  sceneNumber: number;
  narrativePurpose: string;
  visualDescription: string;
  motionDescription: string;
  emotionalTone: string;
  timingGuidance: string;
  transitionNotes: string;
}

interface TechnicalScene {
  sceneType: string;
  assetIds: string[];
  customCSS?: string;
  director: Record<string, any>;
  content: Record<string, any>;
}

// STAGE 1: Film Director Storyboard
async function generateStoryboard(catalog: ContentCatalog): Promise<StoryboardScene[]> {
  const aiClient = getAIClient();

  const prompt = `You are a FILM DIRECTOR hired to create a cinematic storytelling experience through scroll-driven animation.

GLOBAL NARRATIVE VISION:
${catalog.globalPrompt}

SECTION STRUCTURE:
${catalog.sections.map((section, idx) => `
Section ${idx + 1}: ${section.sectionType.toUpperCase()}
Guidance: ${section.sectionPrompt}
Assets: ${section.assetIds.join(', ')}
User Styling Preferences: ${JSON.stringify(section.userStyling || {}, null, 2)}
`).join('\n')}

AVAILABLE CONTENT ASSETS:
Texts: ${catalog.texts.map(t => `${t.id} (${t.type}): "${t.content.substring(0, 100)}..."`).join('\n')}
Images: ${catalog.images.map(i => `${i.id}: ${i.alt} [${i.metadata?.visualStyle || 'unspecified style'}]`).join('\n')}
Videos: ${catalog.videos.map(v => `${v.id} [${v.metadata?.energyLevel || 'moderate'} energy]`).join('\n')}
Quotes: ${catalog.quotes.map(q => `${q.id}: "${q.quote}" - ${q.author}`).join('\n')}

YOUR TASK AS DIRECTOR:
Describe how to tell this story through SCROLL-DRIVEN CINEMATIC SEQUENCES. For each scene:

1. **Narrative Purpose**: Why does this scene exist in the story arc?
2. **Visual Description**: Describe the composition like explaining to a storyboard artist
3. **Motion Description**: How do elements move/transition as user scrolls?
4. **Emotional Tone**: What should the viewer feel?
5. **Timing Guidance**: Fast cuts? Slow reveals? Dramatic pauses?
6. **Transition Notes**: How does this connect to the next scene?

Think in FILM TERMS, not code. Describe the cinematic experience you want to create.`;

  const response = await aiClient.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
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
                sceneNumber: { type: Type.NUMBER },
                narrativePurpose: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                motionDescription: { type: Type.STRING },
                emotionalTone: { type: Type.STRING },
                timingGuidance: { type: Type.STRING },
                transitionNotes: { type: Type.STRING },
              },
              required: ["sceneNumber", "narrativePurpose", "visualDescription", "motionDescription", "emotionalTone", "timingGuidance", "transitionNotes"],
            },
          },
        },
        required: ["scenes"],
      },
    },
  });

  const result = JSON.parse(response.text || '{"scenes":[]}');
  console.log(`[Cinematic Director] Stage 1: Generated ${result.scenes.length} storyboard scenes`);
  return result.scenes;
}

// STAGE 2: Creative Refinement
async function refineStoryboard(storyboard: StoryboardScene[]): Promise<StoryboardScene[]> {
  const aiClient = getAIClient();

  const prompt = `You are reviewing your own storyboard as a FILM DIRECTOR. Analyze this sequence for:

1. **Pacing Issues**: Are there too many slow scenes in a row? Too many fast cuts?
2. **Emotional Arc**: Does the emotional journey flow naturally?
3. **Transition Quality**: Do scenes connect smoothly or feel disjointed?
4. **Visual Variety**: Is there enough contrast between scenes?
5. **Narrative Clarity**: Will the story make sense to viewers?

ORIGINAL STORYBOARD:
${JSON.stringify(storyboard, null, 2)}

Suggest 5-10 SPECIFIC improvements. For each:
- Which scene number to modify
- What to change (pacing, emotion, visuals, transitions)
- Why this improves the overall experience

Return improved storyboard with changes applied.`;

  const response = await aiClient.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
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
                sceneNumber: { type: Type.NUMBER },
                changeType: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
            },
          },
          refinedScenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.NUMBER },
                narrativePurpose: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                motionDescription: { type: Type.STRING },
                emotionalTone: { type: Type.STRING },
                timingGuidance: { type: Type.STRING },
                transitionNotes: { type: Type.STRING },
              },
            },
          },
        },
        required: ["improvements", "refinedScenes"],
      },
    },
  });

  const result = JSON.parse(response.text || '{"refinedScenes":[]}');
  console.log(`[Cinematic Director] Stage 2: Applied ${result.improvements?.length || 0} refinements`);
  return result.refinedScenes;
}

// STAGE 3: Technical Translation (Storyboard → JSON + CSS)
async function translateToTechnical(
  storyboard: StoryboardScene[],
  catalog: ContentCatalog
): Promise<TechnicalScene[]> {
  const aiClient = getAIClient();

  const validAssetIds = [
    ...catalog.texts.map(t => t.id),
    ...catalog.images.map(i => i.id),
    ...catalog.videos.map(v => v.id),
    ...catalog.quotes.map(q => q.id),
  ];

  const prompt = `You are a TECHNICAL DIRECTOR translating cinematic vision into EXECUTABLE CODE.

STORYBOARD TO IMPLEMENT:
${JSON.stringify(storyboard, null, 2)}

AVAILABLE ASSETS (you MUST use these exact IDs):
${validAssetIds.join(', ')}

ASSET DETAILS:
${JSON.stringify({
  texts: catalog.texts,
  images: catalog.images,
  videos: catalog.videos,
  quotes: catalog.quotes,
}, null, 2)}

SECTION REQUIREMENTS:
${catalog.sections.map(s => `${s.sectionType}: ${s.assetIds.join(', ')}`).join('\n')}

For each storyboard scene, generate:

1. **sceneType**: "text" | "image" | "video" | "split" | "gallery" | "quote" | "fullscreen"
2. **assetIds**: Array of asset IDs from catalog (MUST be valid IDs)
3. **customCSS**: Advanced animations/effects as CSS string (keyframes, filters, transforms)
4. **director config**: All timing, transitions, colors, effects
5. **content**: Structured content object for the scene type

DIRECTOR CONFIG RULES:
- entryEffect: fade, slide-up, slide-down, slide-left, slide-right, zoom-in, zoom-out, sudden, cross-fade, rotate-in, flip-in, spiral-in, elastic-bounce, blur-focus
- exitEffect: fade, slide-up, slide-down, slide-left, slide-right, zoom-out, dissolve, cross-fade, rotate-out, flip-out, scale-blur
- entryDuration/exitDuration: 0.8-5.0 seconds (longer = more dramatic)
- backgroundColor/textColor: hex codes
- parallaxIntensity: 0-1 (MUST be 0 if scaleOnScroll is true)
- scrollSpeed: slow, normal, fast

CUSTOM CSS EXAMPLES:
- Keyframe animations for complex motion
- SVG filter effects (blur, glow, distortion)
- Advanced blend modes
- Custom easing curves
- Parallax layering with transform-3d`;

  const response = await aiClient.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
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
                customCSS: { type: Type.STRING },
                director: { type: Type.OBJECT },
                content: { type: Type.OBJECT },
              },
              required: ["sceneType", "assetIds", "director"],
            },
          },
        },
        required: ["scenes"],
      },
    },
  });

  const result = JSON.parse(response.text || '{"scenes":[]}');
  console.log(`[Cinematic Director] Stage 3: Translated ${result.scenes.length} scenes to technical specs`);
  return result.scenes;
}

// STAGE 4: Validation & Final Polish
async function validateAndPolish(
  scenes: TechnicalScene[],
  catalog: ContentCatalog
): Promise<{ scenes: TechnicalScene[]; warnings: string[] }> {
  const validAssetIds = [
    ...catalog.texts.map(t => t.id),
    ...catalog.images.map(i => i.id),
    ...catalog.videos.map(v => v.id),
    ...catalog.quotes.map(q => q.id),
  ];

  const warnings: string[] = [];

  // Validate each scene
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];

    // Check asset IDs
    for (const assetId of scene.assetIds) {
      if (!validAssetIds.includes(assetId)) {
        warnings.push(`Scene ${i + 1}: Invalid asset ID "${assetId}"`);
        // Remove invalid asset
        scene.assetIds = scene.assetIds.filter(id => id !== assetId);
      }
    }

    // Check conflicts
    if (scene.director.parallaxIntensity > 0 && scene.director.scaleOnScroll) {
      warnings.push(`Scene ${i + 1}: parallax + scaleOnScroll conflict, disabling scaleOnScroll`);
      scene.director.scaleOnScroll = false;
    }

    // Check durations
    if (scene.director.entryDuration < 0.8) {
      warnings.push(`Scene ${i + 1}: entryDuration ${scene.director.entryDuration}s too fast, setting to 1.2s`);
      scene.director.entryDuration = 1.2;
    }

    // Ensure required fields
    scene.director.entryEffect = scene.director.entryEffect || 'fade';
    scene.director.exitEffect = scene.director.exitEffect || 'fade';
    scene.director.backgroundColor = scene.director.backgroundColor || '#000000';
    scene.director.textColor = scene.director.textColor || '#ffffff';
  }

  console.log(`[Cinematic Director] Stage 4: Validated ${scenes.length} scenes, found ${warnings.length} issues`);
  return { scenes, warnings };
}

// MAIN EXPORT: Full Cinematic Pipeline
export async function generateCinematicPortfolio(catalog: ContentCatalog) {
  console.log('[Cinematic Director] Starting 4-stage pipeline...');

  // Stage 1: Storyboard Vision
  const storyboard = await generateStoryboard(catalog);

  // Stage 2: Creative Refinement
  const refinedStoryboard = await refineStoryboard(storyboard);

  // Stage 3: Technical Translation
  const technicalScenes = await translateToTechnical(refinedStoryboard, catalog);

  // Stage 4: Validation & Polish
  const { scenes, warnings } = await validateAndPolish(technicalScenes, catalog);

  return {
    scenes,
    storyboard: refinedStoryboard, // Return for debugging/transparency
    warnings,
    confidenceScore: warnings.length === 0 ? 100 : Math.max(70, 100 - warnings.length * 5),
    confidenceFactors: warnings,
  };
}
