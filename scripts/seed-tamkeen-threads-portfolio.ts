
import { db } from "../server/db";
import { projects, projectScenes } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";
import { eq } from "drizzle-orm";

async function seedTamkeenThreadsPortfolio() {
  console.log("🧵 Seeding 'The Thread' - Tamkeen Fashion Portfolio...");

  try {
    // Check if project already exists and delete it
    const existingProject = await db.select().from(projects)
      .where(eq(projects.slug, "tamkeen-threads-the-thread"))
      .limit(1);

    if (existingProject.length > 0) {
      console.log("⚠️  Project already exists, deleting...");
      await db.delete(projectScenes).where(eq(projectScenes.projectId, existingProject[0].id));
      await db.delete(projects).where(eq(projects.id, existingProject[0].id));
      console.log("✅ Deleted existing project and scenes");
    }

    // Create project
    const [project] = await db.insert(projects).values({
      tenantId: DEFAULT_TENANT_ID,
      slug: "tamkeen-threads-the-thread",
      title: "The Thread: A Designer's Journey",
      clientName: "Tamkeen Threads",
      thumbnailUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
      categories: ["Fashion", "Brand Story", "Personal Journey"],
      challengeText: "A designer trapped in corporate design work needed to find her authentic voice and build her own brand.",
      solutionText: "She traced her journey from intimate beginnings through professional success to authentic brand founding.",
      outcomeText: "Created Tamkeen Threads - a fashion brand built on authenticity, personal vision, and artistic integrity.",
      testimonialText: "My Name. My Thread. My Rules.",
      testimonialAuthor: "Mariya Tamkeen, Founder",
    }).returning();

    console.log(`✅ Created project: ${project.title} (ID: ${project.id})`);

    // ACT I: THE BEGINNING - "THE SEED" (Scenes 1-4)
    const scenes = [
      // Scene 1: Opening Image - Baby Photo
      {
        projectId: project.id,
        order: 0,
        sceneConfig: {
          type: "image",
          content: {
            url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80",
            alt: "Vintage baby photo representing the beginning of an artistic journey",
            caption: "",
          },
          director: {
            entryDuration: 3.5,
            exitDuration: 2.5,
            backgroundColor: "#f5f5dc",
            textColor: "#5a4a3a",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.1,
            animationDuration: 4.0,
            fadeOnScroll: true,
            scaleOnScroll: false,
            blurOnScroll: true,
            mediaScale: "contain",
            mediaPosition: "center",
          },
        },
      },
      
      // Scene 2: Opening Narration
      {
        projectId: project.id,
        order: 1,
        sceneConfig: {
          type: "text",
          content: {
            heading: "From the beginning, there was a need...",
            body: "",
          },
          director: {
            entryDuration: 2.5,
            exitDuration: 2.0,
            backgroundColor: "#f5f5dc",
            textColor: "#5a4a3a",
            headingSize: "6xl",
            bodySize: "xl",
            alignment: "center",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.2,
            fadeOnScroll: true,
            animationDuration: 3.5,
          },
        },
      },

      // Scene 3: Gallery - Young Artist
      {
        projectId: project.id,
        order: 2,
        sceneConfig: {
          type: "gallery",
          content: {
            heading: "",
            images: [
              {
                url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
                alt: "Young girl drawing alone",
                caption: "A space to draw",
              },
              {
                url: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80",
                alt: "Artistic creation in solitude",
                caption: "Alone with her art",
              },
              {
                url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80",
                alt: "Creative sketches and drawings",
                caption: "The early work",
              },
            ],
          },
          director: {
            entryDuration: 2.0,
            exitDuration: 1.8,
            backgroundColor: "#e8dcc4",
            textColor: "#5a4a3a",
            entryEffect: "fade",
            exitEffect: "dissolve",
            parallaxIntensity: 0.3,
            fadeOnScroll: true,
            scaleOnScroll: false,
            animationDuration: 3.0,
          },
        },
      },

      // Scene 4: Quote - Room of Her Own
      {
        projectId: project.id,
        order: 3,
        sceneConfig: {
          type: "quote",
          content: {
            quote: "I always needed a room of my own. A place to create.",
            author: "",
            role: "",
          },
          director: {
            entryDuration: 3.0,
            exitDuration: 2.5,
            backgroundColor: "#ffffff",
            textColor: "#5a4a3a",
            headingSize: "7xl",
            alignment: "center",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.1,
            fadeOnScroll: true,
            animationDuration: 4.0,
          },
        },
      },

      // ACT II: THE MIDDLE - "THE SYSTEM" (Scenes 5-8)
      // Scene 5: The World Demanded
      {
        projectId: project.id,
        order: 4,
        sceneConfig: {
          type: "text",
          content: {
            heading: "The world demanded talent",
            body: "",
          },
          director: {
            entryDuration: 0.6,
            exitDuration: 0.5,
            backgroundColor: "#ffffff",
            textColor: "#000000",
            headingSize: "8xl",
            alignment: "center",
            entryEffect: "sudden",
            exitEffect: "slide-left",
            parallaxIntensity: 0.0,
            fadeOnScroll: false,
            animationDuration: 1.0,
          },
        },
      },

      // Scene 6: Corporate Work Montage
      {
        projectId: project.id,
        order: 5,
        sceneConfig: {
          type: "gallery",
          content: {
            heading: "",
            images: [
              {
                url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
                alt: "Professional brand design work",
                caption: "",
              },
              {
                url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
                alt: "Corporate design campaigns",
                caption: "",
              },
              {
                url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
                alt: "Client brand projects",
                caption: "",
              },
              {
                url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
                alt: "Professional achievements",
                caption: "",
              },
            ],
          },
          director: {
            entryDuration: 0.5,
            exitDuration: 0.4,
            backgroundColor: "#f8f8f8",
            textColor: "#333333",
            entryEffect: "zoom-in",
            exitEffect: "slide-left",
            parallaxIntensity: 0.7,
            scaleOnScroll: true,
            fadeOnScroll: false,
            animationDuration: 1.2,
          },
        },
      },

      // Scene 7: The Conflict Quote
      {
        projectId: project.id,
        order: 6,
        sceneConfig: {
          type: "quote",
          content: {
            quote: "I mastered the rules. I built their visions. But the voice wasn't mine.",
            author: "",
            role: "",
          },
          director: {
            entryDuration: 1.0,
            exitDuration: 0.8,
            backgroundColor: "#1a1a1a",
            textColor: "#ffffff",
            headingSize: "6xl",
            alignment: "center",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.0,
            fadeOnScroll: true,
            animationDuration: 2.0,
          },
        },
      },

      // Scene 8: The Breakdown (Video/Image)
      {
        projectId: project.id,
        order: 7,
        sceneConfig: {
          type: "fullscreen",
          content: {
            media: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&q=80",
            mediaType: "image",
          },
          director: {
            entryDuration: 0.8,
            exitDuration: 0.6,
            backgroundColor: "#000000",
            textColor: "#ffffff",
            entryEffect: "zoom-in",
            exitEffect: "fade",
            parallaxIntensity: 0.5,
            scaleOnScroll: true,
            blurOnScroll: true,
            animationDuration: 1.5,
          },
        },
      },

      // ACT III: THE END - "THE FOUNDER" (Scenes 9-12)
      // Scene 9: I Built My Own Table
      {
        projectId: project.id,
        order: 8,
        sceneConfig: {
          type: "text",
          content: {
            heading: "So I built my own table.",
            body: "",
          },
          director: {
            entryDuration: 3.0,
            exitDuration: 2.5,
            backgroundColor: "#000000",
            textColor: "#d4af37",
            headingSize: "7xl",
            alignment: "center",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.0,
            fadeOnScroll: true,
            animationDuration: 4.0,
          },
        },
      },

      // Scene 10: Brand Reveal
      {
        projectId: project.id,
        order: 9,
        sceneConfig: {
          type: "image",
          content: {
            url: "https://images.unsplash.com/photo-1558769132-cb1aea1f5133?w=1200&q=80",
            alt: "Tamkeen Threads brand logo and identity",
            caption: "Tamkeen Threads",
          },
          director: {
            entryDuration: 2.5,
            exitDuration: 2.0,
            backgroundColor: "#1a1a1a",
            textColor: "#d4af37",
            entryEffect: "zoom-in",
            exitEffect: "fade",
            parallaxIntensity: 0.3,
            scaleOnScroll: true,
            fadeOnScroll: true,
            animationDuration: 3.5,
            mediaScale: "contain",
            mediaPosition: "center",
          },
        },
      },

      // Scene 11: Premium Brand Showcase
      {
        projectId: project.id,
        order: 10,
        sceneConfig: {
          type: "gallery",
          content: {
            heading: "",
            images: [
              {
                url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
                alt: "Tamkeen Threads fashion collection",
                caption: "The Collection",
              },
              {
                url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
                alt: "Authentic design details",
                caption: "The Craft",
              },
              {
                url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
                alt: "Premium fabric and materials",
                caption: "The Quality",
              },
            ],
          },
          director: {
            entryDuration: 2.0,
            exitDuration: 1.8,
            backgroundColor: "#2a2a2a",
            textColor: "#ffffff",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.6,
            scaleOnScroll: true,
            fadeOnScroll: true,
            animationDuration: 3.0,
            mediaScale: "cover",
          },
        },
      },

      // Scene 12: Final Statement & CTA
      {
        projectId: project.id,
        order: 11,
        sceneConfig: {
          type: "quote",
          content: {
            quote: "My Name. My Thread. My Rules.",
            author: "Explore Tamkeen Threads",
            role: "",
          },
          director: {
            entryDuration: 3.5,
            exitDuration: 3.0,
            backgroundColor: "#000000",
            textColor: "#d4af37",
            headingSize: "8xl",
            bodySize: "xl",
            alignment: "center",
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.0,
            fadeOnScroll: true,
            animationDuration: 5.0,
          },
        },
      },
    ];

    // Insert all scenes
    for (const scene of scenes) {
      await db.insert(projectScenes).values(scene);
    }

    console.log(`✅ Created ${scenes.length} scenes with cinematic orchestration`);
    console.log("\n🎬 Narrative Structure:");
    console.log("━".repeat(80));
    console.log("ACT I: THE SEED (Intimate & Nostalgic)");
    console.log("  Scene 1: Baby photo - Soft fade (3.5s)");
    console.log("  Scene 2: Opening narration - Contemplative (2.5s)");
    console.log("  Scene 3: Young artist gallery - Dissolving memories (2.0s)");
    console.log("  Scene 4: Room quote - Foundational truth (3.0s)");
    console.log("\nACT II: THE SYSTEM (Fast & Professional)");
    console.log("  Scene 5: World demanded - Sharp cut (0.6s)");
    console.log("  Scene 6: Corporate montage - Restless energy (0.5s)");
    console.log("  Scene 7: Conflict quote - Dramatic pause (1.0s)");
    console.log("  Scene 8: Breakdown - Symbolic shattering (0.8s)");
    console.log("\nACT III: THE FOUNDER (Confident & Premium)");
    console.log("  Scene 9: Built own table - Proud resolution (3.0s)");
    console.log("  Scene 10: Brand reveal - Ken Burns effect (2.5s)");
    console.log("  Scene 11: Premium showcase - Editorial style (2.0s)");
    console.log("  Scene 12: Final statement - Powerful close (3.5s)");
    console.log("━".repeat(80));
    console.log(`\n✨ View at: /branding/${project.slug}`);
    console.log(`📊 Admin view: /admin/projects/${project.id}/edit`);
    console.log(`🎨 Portfolio Builder: This project will appear in "Existing Project" dropdown`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seedTamkeenThreadsPortfolio()
  .then(() => {
    console.log("\n🎉 'The Thread' portfolio seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
