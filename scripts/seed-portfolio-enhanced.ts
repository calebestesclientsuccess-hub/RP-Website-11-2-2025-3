
import { db } from "../server/db";
import { projects, projectScenes, tenants } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedEnhancedPortfolio() {
  console.log("🎬 Seeding enhanced portfolio with per-scene AI configuration...");

  try {
    // CRITICAL FIX #1: Verify tenant exists
    const [defaultTenant] = await db.select().from(tenants).where(eq(tenants.id, "default")).limit(1);
    
    if (!defaultTenant) {
      console.error("❌ No tenant found with id 'default'. Available tenants:");
      const allTenants = await db.select().from(tenants);
      console.log(allTenants);
      throw new Error("Default tenant not found. Please create a tenant first or update tenantId in script.");
    }

    console.log(`✅ Using tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    // CRITICAL FIX #2: Check if project already exists and delete it
    const existingProject = await db.select().from(projects)
      .where(eq(projects.slug, "saas-transformation-showcase"))
      .limit(1);

    if (existingProject.length > 0) {
      console.log("⚠️  Project already exists, deleting...");
      await db.delete(projectScenes).where(eq(projectScenes.projectId, existingProject[0].id));
      await db.delete(projects).where(eq(projects.id, existingProject[0].id));
      console.log("✅ Deleted existing project and scenes");
    }

    // CRITICAL FIX #3: Use transaction for atomicity
    await db.transaction(async (tx) => {
      // Create project
      const [project] = await tx.insert(projects)
        .values({
          tenantId: defaultTenant.id,
          slug: "saas-transformation-showcase",
          title: "SaaS Platform Transformation",
          clientName: "TechVenture Co.",
          thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
          categories: ["SaaS", "Product Design", "Growth Strategy"],
          challengeText: "TechVenture needed to pivot from a failing B2C model to enterprise B2B within 6 months.",
          solutionText: "We architected a complete GTM rebuild: new positioning, enterprise sales pod, and a scalable onboarding system.",
          outcomeText: "120% revenue growth in Q1, 40% reduction in CAC, and 3 enterprise contracts signed in first 90 days.",
          testimonialText: "Revenue Party didn't just save our business—they gave us a repeatable system to scale it.",
          testimonialAuthor: "Michael Torres, CEO at TechVenture Co.",
        })
        .returning();

      console.log(`✅ Created project: ${project.title} (ID: ${project.id})`);

      // Scene definitions with proper order field
      const scenes = [
        {
          projectId: project.id,
          order: 0, // CRITICAL FIX #4: Add order field
          sceneConfig: {
            type: "text",
            content: {
              heading: "From Failing Startup to $2M ARR",
              body: "How we rebuilt TechVenture's entire go-to-market system in 180 days—and turned chaos into predictable revenue.",
            },
            director: {
              entryEffect: "fade",
              entryDuration: 3.0,
              exitEffect: "fade",
              exitDuration: 2.0,
              backgroundColor: "#0a0a0a",
              textColor: "#ffffff",
              headingSize: "8xl",
              bodySize: "xl",
              alignment: "center",
              parallaxIntensity: 0.2,
              fadeOnScroll: true,
              animationDuration: 4.0,
            },
          },
        },
        {
          projectId: project.id,
          order: 1,
          sceneConfig: {
            type: "split",
            content: {
              heading: "The Crisis",
              body: "Six months of runway. A product nobody wanted. A sales team that couldn't close deals. The clock was ticking.",
              media: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
              mediaType: "image",
              alt: "Crisis situation visualization",
            },
            layout: "default",
            director: {
              entryEffect: "slide-left",
              entryDuration: 0.8,
              exitEffect: "slide-left",
              exitDuration: 0.6,
              backgroundColor: "#1a0a0a",
              textColor: "#ff6b6b",
              headingSize: "6xl",
              bodySize: "lg",
              alignment: "left",
              parallaxIntensity: 0.1,
              scaleOnScroll: false,
            },
          },
        },
        {
          projectId: project.id,
          order: 2,
          sceneConfig: {
            type: "image",
            content: {
              url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
              alt: "Strategic planning session",
              caption: "Week 1: Diagnosing the real problem",
            },
            director: {
              entryEffect: "zoom-in",
              entryDuration: 1.2,
              exitEffect: "fade",
              exitDuration: 1.0,
              backgroundColor: "#1e293b",
              textColor: "#ffffff",
              parallaxIntensity: 0.5,
              scaleOnScroll: true,
              mediaScale: "cover",
              mediaPosition: "center",
            },
          },
        },
        {
          projectId: project.id,
          order: 3,
          sceneConfig: {
            type: "text",
            content: {
              heading: "The Rebuild Strategy",
              body: "We didn't fix the product first. We fixed the go-to-market system. New ICP. New messaging. New sales process. Everything architected for repeatability.",
            },
            director: {
              entryEffect: "slide-right",
              entryDuration: 2.0,
              exitEffect: "dissolve",
              exitDuration: 1.5,
              backgroundColor: "#334155",
              textColor: "#ffffff",
              headingSize: "7xl",
              bodySize: "xl",
              alignment: "center",
              parallaxIntensity: 0.6,
              fadeOnScroll: true,
            },
          },
        },
        {
          projectId: project.id,
          order: 4,
          sceneConfig: {
            type: "gallery",
            content: {
              heading: "The New GTM Architecture",
              images: [
                {
                  url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
                  alt: "ICP Definition Framework",
                  caption: "1. Crystal-Clear ICP",
                },
                {
                  url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                  alt: "Sales Process Diagram",
                  caption: "2. Repeatable Sales Process",
                },
                {
                  url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
                  alt: "Onboarding System",
                  caption: "3. Scalable Onboarding",
                },
              ],
            },
            director: {
              entryEffect: "fade",
              entryDuration: 1.5,
              exitEffect: "fade",
              exitDuration: 1.2,
              backgroundColor: "#0f172a",
              textColor: "#ffffff",
              headingSize: "5xl",
              alignment: "center",
              parallaxIntensity: 0.4,
              scaleOnScroll: true,
              mediaScale: "cover",
            },
          },
        },
        {
          projectId: project.id,
          order: 5,
          sceneConfig: {
            type: "quote",
            content: {
              quote: "They didn't just consult—they embedded with our team, rewrote our playbook, and trained us to execute it. Now we have a system we can scale.",
              author: "Michael Torres",
              role: "CEO, TechVenture Co.",
            },
            director: {
              entryEffect: "fade",
              entryDuration: 3.0,
              exitEffect: "fade",
              exitDuration: 2.5,
              backgroundColor: "#f1f5f9",
              textColor: "#0a0a0a",
              headingSize: "6xl",
              bodySize: "xl",
              alignment: "center",
              parallaxIntensity: 0.2,
              blurOnScroll: true,
              fadeOnScroll: true,
              animationDuration: 4.0,
            },
          },
        },
        {
          projectId: project.id,
          order: 6,
          sceneConfig: {
            type: "image",
            content: {
              url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
              alt: "Revenue growth chart",
              caption: "180 days: $0 → $2M ARR",
            },
            director: {
              entryEffect: "zoom-in",
              entryDuration: 0.8,
              exitEffect: "fade",
              exitDuration: 0.6,
              backgroundColor: "#0f172a",
              textColor: "#ffffff",
              parallaxIntensity: 0.5,
              scaleOnScroll: true,
              mediaScale: "cover",
            },
          },
        },
        {
          projectId: project.id,
          order: 7,
          sceneConfig: {
            type: "text",
            content: {
              heading: "The Numbers",
              body: "120% revenue growth. 40% reduction in CAC. 3 enterprise contracts in 90 days. A repeatable system that scales without chaos.",
            },
            director: {
              entryEffect: "fade",
              entryDuration: 2.2,
              exitEffect: "fade",
              exitDuration: 2.0,
              backgroundColor: "#000000",
              textColor: "#ffffff",
              headingSize: "7xl",
              bodySize: "2xl",
              alignment: "center",
              parallaxIntensity: 0.0,
              fadeOnScroll: true,
              animationDuration: 3.0,
            },
          },
        },
      ];

      // Insert all scenes within the transaction
      for (const scene of scenes) {
        await tx.insert(projectScenes).values(scene);
      }

      console.log(`✅ Created ${scenes.length} scenes with detailed director configurations`);
    });

    console.log("\n🎬 Director Flow:");
    console.log("━".repeat(60));
    console.log("Scene 1: Hero - Slow dramatic fade (3.0s)");
    console.log("Scene 2: Problem - Fast urgent slide-left (0.8s)");
    console.log("Scene 3: Image - Medium zoom-in (1.2s)");
    console.log("Scene 4: Solution - Confident slide-right (2.0s)");
    console.log("Scene 5: Gallery - Component showcase (1.5s)");
    console.log("Scene 6: Quote - Emotional slow fade (3.0s)");
    console.log("Scene 7: Results - Fast energetic zoom (0.8s)");
    console.log("Scene 8: Numbers - Slow decisive finale (2.2s)");
    console.log("━".repeat(60));
    console.log(`\n✨ View at: /branding/saas-transformation-showcase`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    // CRITICAL FIX #5: Log detailed error info
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

seedEnhancedPortfolio()
  .then(() => {
    console.log("\n🎉 Enhanced portfolio seeding complete!");
    // CRITICAL FIX #6: Use setTimeout to ensure logs flush before exit
    setTimeout(() => process.exit(0), 100);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    setTimeout(() => process.exit(1), 100);
  });
