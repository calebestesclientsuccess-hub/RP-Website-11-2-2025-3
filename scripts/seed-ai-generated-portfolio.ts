import { db } from "../server/db";
import { projects, projectScenes } from "@shared/schema";
import { generatePortfolioWithAI, convertToSceneConfigs } from "../server/utils/portfolio-director";
import type { ContentCatalog } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";

async function seedAIGeneratedPortfolio() {
  console.log("🤖 Seeding AI-generated portfolio with 10 complex scenes...");

  // Create a rich content catalog with diverse assets
  const contentCatalog = {
    texts: [
      {
        id: "text-hero-headline",
        type: "headline",
        content: "The Digital Transformation That Saved a Legacy Brand"
      },
      {
        id: "text-hero-subheading",
        type: "subheading",
        content: "From Bankruptcy to Market Leader in 18 Months"
      },
      {
        id: "text-hero-body",
        type: "paragraph",
        content: "When we met the CEO of Heritage Foods in 2023, they had 90 days to turn around a 50-year-old company. Traditional retail was dying. Their e-commerce presence was non-existent. The board was ready to liquidate."
      },
      {
        id: "text-crisis-headline",
        type: "headline",
        content: "The Crisis: A Perfect Storm"
      },
      {
        id: "text-crisis-body",
        type: "paragraph",
        content: "Sales down 40% year-over-year. Three failed digital initiatives. A demoralized team that had watched competitors thrive online while they struggled with a website that looked like it was built in 2005."
      },
      {
        id: "text-strategy-headline",
        type: "headline",
        content: "The Strategy: Digital-First, But Human-Centered"
      },
      {
        id: "text-strategy-body",
        type: "paragraph",
        content: "We didn't just build them a new website. We architected an entire digital ecosystem: a modern e-commerce platform, AI-powered inventory management, social commerce integration, and a customer loyalty program that drove 3x repeat purchases."
      },
      {
        id: "text-build-headline",
        type: "headline",
        content: "The Build: Speed Meets Precision"
      },
      {
        id: "text-build-body",
        type: "paragraph",
        content: "Phase 1: 30 days to launch MVP with core e-commerce. Phase 2: 60 days for mobile app and loyalty program. Phase 3: 90 days for AI recommendations and social integration. Each milestone validated with real revenue data."
      },
      {
        id: "text-results-headline",
        type: "headline",
        content: "The Results: Beyond Expectations"
      },
      {
        id: "text-results-body",
        type: "paragraph",
        content: "Month 6: First profitable quarter in 3 years. Month 12: Online sales surpass in-store for the first time. Month 18: Acquired by a major retailer for $47M—10x their initial valuation when we started."
      },
      {
        id: "text-future-headline",
        type: "headline",
        content: "The Future is Digital—But the Story is Human"
      },
      {
        id: "text-future-body",
        type: "paragraph",
        content: "This wasn't about technology. It was about preserving jobs, honoring a legacy, and proving that innovation can coexist with tradition. Every digital transformation starts with understanding what you're trying to save."
      }
    ],
    images: [
      {
        id: "image-dashboard",
        url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1600&q=80",
        alt: "Modern e-commerce dashboard with analytics",
        caption: "The new digital command center"
      },
      {
        id: "image-planning",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80",
        alt: "Strategic planning session with stakeholders",
        caption: "Mapping the transformation roadmap"
      },
      {
        id: "image-growth",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
        alt: "Revenue growth chart showing dramatic upward trend",
        caption: "18-month transformation trajectory"
      },
      {
        id: "image-team",
        url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80",
        alt: "Team celebrating success in modern office",
        caption: "The team that made it happen"
      }
    ],
    videos: [
      {
        id: "video-behind-scenes",
        url: "https://player.vimeo.com/video/76979871",
        caption: "Behind the scenes: The 90-day sprint that changed everything"
      }
    ],
    quotes: [
      {
        id: "quote-ceo",
        quote: "I thought we were done. Revenue Party didn't just save our company—they showed us how to thrive in a world we didn't understand. The digital transformation they built generated more revenue in 6 months than our physical stores did in the previous year.",
        author: "Margaret Thompson",
        role: "CEO, Heritage Foods"
      },
      {
        id: "quote-cto",
        quote: "What impressed me most wasn't the technology—it was the empathy. They took time to understand our 50-year legacy and found a way to honor it while building something completely new. That's rare.",
        author: "David Park",
        role: "CTO, Heritage Foods"
      },
      {
        id: "quote-vp-digital",
        quote: "The mobile app they built has a 4.8-star rating and 73% daily active users. In our industry, that's unheard of. They didn't just build software—they built an experience our customers actually love.",
        author: "Lisa Martinez",
        role: "VP of Digital, Heritage Foods"
      }
    ],
    directorNotes: `
VISION: A dramatic rise-from-ashes narrative told through contrasting visual rhythms and emotional pacing

NARRATIVE ARC: Crisis → Strategy → Build → Triumph → Reflection
- Open with slow, contemplative scenes (set the stakes)
- Accelerate dramatically through the crisis (create urgency)
- Slow down for strategic clarity (show the plan)
- Build rhythm through implementation phases (show momentum)
- Explosive climax with results (celebrate victory)
- Gentle, reflective close (zoom out to meaning)

SCENE-SPECIFIC ORCHESTRATION:

OPENING MOVEMENT (Scenes 1-2): The Setup
- Scene 1: Ultra-slow hero entry (3.5s), deep black background (#000000), massive headlines (9xl), minimal parallax (0.1) for gravitas
- Scene 2: Medium-paced subheading (1.8s), slightly lighter background (#0a0a0a), strong fade-on-scroll for depth, center-aligned

CRISIS MOVEMENT (Scenes 3-4): The Fall
- Scene 3: Dashboard image bursts in (0.6s), harsh red tint in background (#1a0505), aggressive scale-on-scroll, simulate chaos
- Scene 4: Problem text slams from RIGHT (0.8s), jarring slide-left exit, dark crimson background (#2d0a0a), high-contrast white text, NO parallax (grounded in harsh reality)

STRATEGY MOVEMENT (Scenes 5-6): The Plan
- Scene 5: Solution text glides in smoothly from LEFT (2.5s), background brightens to navy (#1e3a5f), strong parallax (0.7) for authority, crossfade transitions
- Scene 6: Planning image fades elegantly (2.0s), warm slate background (#334155), scale + fade on scroll for layered depth

BUILD MOVEMENT (Scenes 7-8): The Execution
- Scene 7: Build process text with medium speed (1.3s), background continues warming (#475569), moderate parallax (0.5)
- Scene 8: Video scene with quick entry (0.9s), background shifts to deep blue (#0f172a), blur-on-scroll for cinematic feel

CLIMAX MOVEMENT (Scene 9): The Victory
- Scene 9: Results image EXPLODES onto screen (0.5s), fastest entry of entire piece, dramatic zoom + scale, vibrant background (#1a472a), high-energy parallax (0.8)

TESTIMONIAL INTERLUDE (Scene 10-12): The Human Element
- Scene 10: First quote enters slowly (3.0s), nearly white background (#f1f5f9), dark text for contrast, deep blur-on-scroll, contemplative spacing
- Scene 11: Second quote medium speed (1.7s), maintain light background, standard fade transitions
- Scene 12: Third quote slow again (2.3s), return to emotional pacing

CLOSING MOVEMENT (Scene 13): The Meaning
- Scene 13: Final reflection text with slowest entry (4.0s), pure black background (#000000), white text, zero parallax (stability), massive text (9xl heading, 2xl body), center-aligned, fade-only transitions

TECHNICAL REQUIREMENTS:
- Total scene count: Exactly 10 scenes (use strategic asset selection)
- Timing variance: Min 0.5s to Max 4.0s (create dramatic contrast)
- Color journey: Dark → Crisis Red → Strategic Navy → Warm Slate → Victory Green → Pure White (testimonials) → Back to Black (closure)
- Parallax strategy: Low (0.1-0.2) for emotional weight, High (0.6-0.8) for energy/authority, Zero (0.0) for grounding
- Scroll effects: Use blur sparingly (2-3 scenes max), scale for energy scenes, fade for contemplation
- Text sizing: Vary dramatically (5xl to 9xl headlines) to match emotional intensity
- Alignment: Primarily center, but consider left-align for strategic/technical scenes

PACING FORMULA:
Opening (slow) → Crisis (fast) → Strategy (slow) → Build (medium) → Victory (fastest) → Testimonials (very slow) → Close (slowest)

This creates a W-shaped energy curve that mirrors the emotional journey: calm → panic → resolution → execution → triumph → reflection
`.trim()
  };

  // Call the AI generation logic directly
  console.log("\n🎬 Sending content to AI orchestrator...");
  console.log("📦 Content catalog contains:");
  console.log(`   - ${contentCatalog.texts.length} text assets`);
  console.log(`   - ${contentCatalog.images.length} image assets`);
  console.log(`   - ${contentCatalog.videos.length} video assets`);
  console.log(`   - ${contentCatalog.quotes.length} quote assets`);
  console.log(`   - Director notes: ${contentCatalog.directorNotes.split('\n').length} lines\n`);

  try {
    // Call Gemini AI to generate scenes
    console.log("🤖 Calling Gemini AI for scene orchestration...");
    const aiResult = await generatePortfolioWithAI(contentCatalog as ContentCatalog);
    console.log(`✅ Gemini generated ${aiResult.scenes.length} scenes\n`);

    // Convert AI scenes to database format
    console.log("🔄 Converting to database format...");
    const sceneConfigs = convertToSceneConfigs(aiResult.scenes, contentCatalog as ContentCatalog);
    console.log(`✅ Converted ${sceneConfigs.length} scene configs\n`);

    // Create project and scenes in database transaction
    console.log("💾 Saving to database...");
    const result = await db.transaction(async (tx) => {
      // Create project
      const [project] = await tx.insert(projects).values({
        tenantId: DEFAULT_TENANT_ID,
        title: "Heritage Foods Digital Transformation",
        slug: "heritage-foods-transformation",
        clientName: "Heritage Foods",
        thumbnailUrl: contentCatalog.images[0]?.url || null,
        categories: [],
        challengeText: null,
        solutionText: null,
        outcomeText: null,
        modalMediaType: "video",
        modalMediaUrls: [],
        testimonialText: null,
        testimonialAuthor: null,
      }).returning();

      console.log(`✅ Created project: ${project.id}`);

      // Create scenes
      const createdScenes = [];
      for (const sceneConfig of sceneConfigs) {
        const [scene] = await tx.insert(projectScenes).values({
          projectId: project.id,
          sceneConfig,
          order: createdScenes.length,
        }).returning();
        createdScenes.push(scene);
      }

      console.log(`✅ Created ${createdScenes.length} scenes\n`);

      return {
        project,
        scenes: createdScenes,
      };
    });

    console.log("\n🎉 AI Generation Successful!");
    console.log("━".repeat(80));
    console.log(`   Project ID: ${result.project.id}`);
    console.log(`   Slug: ${result.project.slug}`);
    console.log(`   Scenes generated: ${result.scenes.length}`);
    
    console.log("\n🎬 Generated Scenes:");
    console.log("━".repeat(80));
    result.scenes.forEach((scene: any, index: number) => {
      const config = scene.sceneConfig || {};
      console.log(`Scene ${index + 1}: ${config.type || 'UNKNOWN'}`);
      console.log(`  Entry: ${config.entryEffect} (${config.entryDuration}s)`);
      console.log(`  Background: ${config.backgroundColor}`);
      console.log(`  Parallax: ${config.parallaxIntensity}`);
      console.log(`  Effects: ${[
        config.fadeOnScroll && 'fade-scroll',
        config.scaleOnScroll && 'scale-scroll',
        config.blurOnScroll && 'blur-scroll'
      ].filter(Boolean).join(', ') || 'none'}`);
      console.log("━".repeat(80));
    });

    console.log(`\n✨ View the AI-generated portfolio at: /branding/${result.project.slug}`);
    console.log(`📊 Admin view at: /admin/branding/projects/${result.project.slug}\n`);

  } catch (error) {
    console.error("\n❌ AI generation failed:", error);
    throw error;
  }
}

seedAIGeneratedPortfolio()
  .then(() => {
    console.log("\n🎉 AI-powered seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
