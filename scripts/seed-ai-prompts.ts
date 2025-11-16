
import { db } from "../server/db";
import { aiPromptTemplates } from "../shared/schema";

const defaultPrompts = [
  {
    promptKey: "artistic_director",
    promptName: "Artistic Director (Stage 1)",
    promptDescription: "The master prompt that generates the initial portfolio based on content-first, dual-track strategy",
    systemPrompt: `You are a cinematic director for scrollytelling portfolio websites...
(This will be populated from buildPortfolioPrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "technical_director",
    promptName: "Technical Director (Stage 2)",
    promptDescription: "Validates the dual-track output and enforces the 'Do Not Overdraw' mandate",
    systemPrompt: `You are the Technical Director (TD), the "First Assistant Director (1st AD)"...
(This will be populated from the audit prompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "split_scene_specialist",
    promptName: "Split Scene Specialist (Stage 3.1)",
    promptDescription: "Manages zig-zag layouts and validates both text and media assets",
    systemPrompt: `System Prompt: Stage 3 (The Scene Specialist - Split Scene)...
(This will be populated from buildSplitScenePrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "gallery_scene_specialist",
    promptName: "Gallery Scene Specialist (Stage 3.2)",
    promptDescription: "Manages asset overflow and forces the use of staggerChildren",
    systemPrompt: `System Prompt: Stage 3 (The Scene Specialist - Gallery Scene)...
(This will be populated from buildGalleryScenePrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "quote_scene_specialist",
    promptName: "Quote Scene Specialist (Stage 3.3)",
    promptDescription: "Mandates contemplative pacing and artistic recipe usage",
    systemPrompt: `System Prompt: Stage 3 (The Scene Specialist - Quote Scene)...
(This will be populated from buildQuoteScenePrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "fullscreen_scene_specialist",
    promptName: "Fullscreen Scene Specialist (Stage 3.4)",
    promptDescription: "Forces artistic recipes and validates conditional assets",
    systemPrompt: `System Prompt: Stage 3 (The Scene Specialist - Fullscreen Scene)...
(This will be populated from buildFullscreenScenePrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "executive_producer",
    promptName: "Executive Producer (Stage 5)",
    promptDescription: "Holistic artistic review judging narrative arc, pacing, and media strategy",
    systemPrompt: `System Prompt: Stage 5 (The Executive Producer)...
(This will be populated from buildPortfolioCoherencePrompt)`,
    isActive: true,
    version: 3,
  },
  {
    promptKey: "component_scene_specialist",
    promptName: "Component Scene Specialist (Stage 3.5)",
    promptDescription: "Artistically refines the props of component scenes",
    systemPrompt: `System Prompt: Stage 3 (The Scene Specialist - Component Scene)...
(To be developed)`,
    isActive: false, // Not yet implemented
    version: 1,
  },
];

async function seedPrompts() {
  console.log("Seeding AI prompt templates...");
  
  for (const prompt of defaultPrompts) {
    const existing = await db
      .select()
      .from(aiPromptTemplates)
      .where(eq(aiPromptTemplates.promptKey, prompt.promptKey))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(aiPromptTemplates).values(prompt);
      console.log(`✓ Created prompt: ${prompt.promptName}`);
    } else {
      console.log(`- Skipped (exists): ${prompt.promptName}`);
    }
  }
  
  console.log("Prompt seeding complete!");
  process.exit(0);
}

seedPrompts().catch((error) => {
  console.error("Error seeding prompts:", error);
  process.exit(1);
});
