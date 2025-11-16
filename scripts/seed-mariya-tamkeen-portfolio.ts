
import { db } from "../server/db";
import { projects, projectScenes } from "@shared/schema";
import { generatePortfolioWithAI, convertToSceneConfigs } from "../server/utils/portfolio-director";
import type { ContentCatalog } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";

async function seedMariyaTamkeenPortfolio() {
  console.log("🎨 Seeding Mariya Tamkeen Fashion Portfolio with AI orchestration...");

  // Build content catalog for a fashion designer portfolio
  const contentCatalog: ContentCatalog = {
    texts: [
      {
        id: "text-hero",
        type: "headline",
        content: "Mariya Tamkeen"
      },
      {
        id: "text-hero-sub",
        type: "subheading",
        content: "Pakistani-American Feminist Fashion Designer"
      },
      {
        id: "text-manifesto",
        type: "headline",
        content: "Fashion as Resistance"
      },
      {
        id: "text-manifesto-body",
        type: "paragraph",
        content: "My work exists at the intersection of heritage and rebellion. Each piece is a statement—a refusal to choose between my Pakistani roots and my American identity, between tradition and revolution, between modesty and power."
      },
      {
        id: "text-design-philosophy",
        type: "headline",
        content: "Design Philosophy"
      },
      {
        id: "text-philosophy-body",
        type: "paragraph",
        content: "I create garments that challenge the male gaze while honoring the feminine divine. Negative space becomes armor. Draping becomes defiance. Every stitch is intentional."
      },
      {
        id: "text-heritage",
        type: "headline",
        content: "Honoring Heritage"
      },
      {
        id: "text-heritage-body",
        type: "paragraph",
        content: "Traditional Pakistani craftsmanship meets Brooklyn edge. Hand-embroidered motifs reimagined for the contemporary woman who refuses to be defined by a single narrative."
      },
      {
        id: "text-collection-1",
        type: "headline",
        content: "Indigo Dreams Collection"
      },
      {
        id: "text-collection-1-body",
        type: "paragraph",
        content: "Deep indigo fabrics cascading with silver threadwork. Each piece explores the tension between concealment and revelation, modesty and sensuality."
      },
      {
        id: "text-feminism",
        type: "headline",
        content: "Feminist Threads"
      },
      {
        id: "text-feminism-body",
        type: "paragraph",
        content: "My feminism isn't borrowed from Western narratives. It's rooted in the strength of my grandmother's hands, in the quiet revolutions of women who covered and uncovered on their own terms."
      },
      {
        id: "text-brooklyn",
        type: "headline",
        content: "Made in Brooklyn"
      },
      {
        id: "text-brooklyn-body",
        type: "paragraph",
        content: "From my Williamsburg studio, I bridge worlds. The subway becomes my runway. The city's chaos informs every cut, every fold."
      },
      {
        id: "text-metallic",
        type: "headline",
        content: "Metallic Rebellion"
      },
      {
        id: "text-metallic-body",
        type: "paragraph",
        content: "Silver and teal metallics catch light like armor. These aren't decorative flourishes—they're statements of strength, of refusing to dim your shine for anyone's comfort."
      },
      {
        id: "text-process",
        type: "headline",
        content: "The Process"
      },
      {
        id: "text-process-body",
        type: "paragraph",
        content: "Every garment begins with a question: What would my mother wear to a revolution? What would my daughter inherit? The answer emerges in fabric and form."
      },
      {
        id: "text-future",
        type: "headline",
        content: "The Future of Fashion"
      },
      {
        id: "text-future-body",
        type: "paragraph",
        content: "I envision a world where Muslim women design for themselves, where modesty is power, where tradition evolves without erasure. This is that future."
      }
    ],
    images: [
      {
        id: "image-studio",
        url: "https://images.unsplash.com/photo-1558769132-cb1aea3c8737?w=1600&q=80",
        alt: "Fashion design studio in Brooklyn with fabric samples",
        caption: "The Williamsburg studio where tradition meets innovation"
      },
      {
        id: "image-indigo-1",
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
        alt: "Model wearing flowing indigo garment with silver embroidery",
        caption: "Indigo Dreams: Statement piece with hand-embroidered silver threadwork"
      },
      {
        id: "image-indigo-2",
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1600&q=80",
        alt: "Close-up of metallic teal fabric detail",
        caption: "Metallic teal accents catching urban light"
      },
      {
        id: "image-process",
        url: "https://images.unsplash.com/photo-1558769132-92e717d613cd?w=1600&q=80",
        alt: "Designer sketching fashion illustrations",
        caption: "Design process: from concept to creation"
      },
      {
        id: "image-silver",
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
        alt: "Silver metallic fashion piece with dramatic draping",
        caption: "Silver armor: fashion as empowerment"
      },
      {
        id: "image-black-1",
        url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
        alt: "Black garment with negative space design",
        caption: "Negative space as power statement"
      },
      {
        id: "image-heritage",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600&q=80",
        alt: "Traditional Pakistani embroidery on contemporary silhouette",
        caption: "Heritage reimagined for the modern woman"
      },
      {
        id: "image-runway",
        url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=80",
        alt: "Fashion runway show with dramatic lighting",
        caption: "Brooklyn Fashion Week debut"
      }
    ],
    videos: [
      {
        id: "video-collection",
        url: "https://player.vimeo.com/video/76979871",
        caption: "Indigo Dreams Collection: Behind the seams"
      }
    ],
    quotes: [
      {
        id: "quote-1",
        quote: "Mariya doesn't just design clothes—she designs revolutions. Every piece is a manifesto, every show a statement that fashion can be both modest and radical.",
        author: "Aisha Rahman",
        role: "Fashion Critic, Vogue Arabia"
      },
      {
        id: "quote-2",
        quote: "Working with Mariya changed how I see my body, my heritage, my power. Her designs don't ask you to choose—they celebrate all of who you are.",
        author: "Zainab Chaudhry",
        role: "Model & Activist"
      },
      {
        id: "quote-3",
        quote: "Tamkeen's work represents the future of fashion: unapologetically feminist, deeply rooted in cultural heritage, and technically brilliant. She's the designer we've been waiting for.",
        author: "Dr. Fatima Al-Rashid",
        role: "Fashion Historian, Parsons School of Design"
      }
    ],
    directorNotes: `Create a dramatic 20 section portfolio for a Brooklyn based fashion designer Mariya Tamkeen. She is a Pakistani-American feminist. The purpose of this portfolio is to show off the features, so please use many dramatic choices especially around movement and transitions and formatting, so that we can see what is possible. Use brand colors indigo, black, silver, as primary, and secondary can include metalic teal. Use negative space in a way that is sexy and dramatic.`
  };

  try {
    console.log("\n🤖 Sending content catalog to Gemini AI for orchestration...");
    console.log("📦 Content catalog contains:");
    console.log(`   - ${contentCatalog.texts.length} text assets`);
    console.log(`   - ${contentCatalog.images.length} image assets`);
    console.log(`   - ${contentCatalog.videos.length} video assets`);
    console.log(`   - ${contentCatalog.quotes.length} quote assets`);
    console.log(`   - Director notes: "${contentCatalog.directorNotes}"\n`);

    // Call Gemini AI to generate scenes
    console.log("🎬 Calling Gemini AI for scene orchestration...");
    const aiResult = await generatePortfolioWithAI(contentCatalog, "Mariya Tamkeen Fashion Portfolio");
    console.log(`✅ Gemini generated ${aiResult.scenes.length} scenes`);
    console.log(`📊 AI Confidence Score: ${aiResult.confidenceScore}%\n`);

    // Convert AI scenes to database format
    console.log("🔄 Converting to database format...");
    const sceneConfigs = convertToSceneConfigs(aiResult.scenes, contentCatalog);
    console.log(`✅ Converted ${sceneConfigs.length} scene configs\n`);

    // Create project and scenes in database transaction
    console.log("💾 Saving to database...");
    const result = await db.transaction(async (tx) => {
      // Create project
      const [project] = await tx.insert(projects).values({
        tenantId: DEFAULT_TENANT_ID,
        title: "Mariya Tamkeen",
        slug: "mariya-tamkeen-fashion",
        clientName: "Mariya Tamkeen Fashion",
        thumbnailUrl: contentCatalog.images[0]?.url || null,
        categories: ["Fashion", "Design", "Feminist Art"],
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
    console.log(`   AI Confidence: ${aiResult.confidenceScore}%`);
    
    if (aiResult.confidenceFactors && aiResult.confidenceFactors.length > 0) {
      console.log(`\n📋 Confidence Factors:`);
      aiResult.confidenceFactors.forEach((factor: string) => {
        console.log(`   - ${factor}`);
      });
    }

    console.log("\n🎬 Generated Scenes:");
    console.log("━".repeat(80));
    result.scenes.forEach((scene: any, index: number) => {
      const config = scene.sceneConfig || {};
      const director = config.director || {};
      console.log(`Scene ${index + 1}: ${config.type || 'UNKNOWN'}`);
      console.log(`  Entry: ${director.entryEffect || 'fade'} (${director.entryDuration || 1.2}s)`);
      console.log(`  Exit: ${director.exitEffect || 'fade'} (${director.exitDuration || 1.0}s)`);
      console.log(`  Background: ${director.backgroundColor || 'default'}`);
      console.log(`  Parallax: ${director.parallaxIntensity || 0}`);
      console.log(`  Scroll Speed: ${director.scrollSpeed || 'normal'}`);
      console.log("━".repeat(80));
    });

    console.log(`\n✨ View the AI-generated portfolio at: /branding/${result.project.slug}`);
    console.log(`📊 Admin view at: /admin/branding/projects/${result.project.slug}\n`);

  } catch (error) {
    console.error("\n❌ AI generation failed:", error);
    throw error;
  }
}

seedMariyaTamkeenPortfolio()
  .then(() => {
    console.log("\n🎉 Mariya Tamkeen portfolio seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
