
import { db } from "../server/db";
import { projects, projectScenes, tenants } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedPortfolioTest() {
  console.log("🎨 Seeding test portfolio content...");

  try {
    // Get the default tenant (or first tenant)
    const [defaultTenant] = await db.select().from(tenants).limit(1);
    
    if (!defaultTenant) {
      throw new Error("No tenant found. Please run database migrations first.");
    }

    console.log(`✅ Using tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    // Create test project
    const [testProject] = await db
      .insert(projects)
      .values({
        tenantId: defaultTenant.id,
        slug: "test-branding-portfolio",
        title: "Revolutionary SaaS Platform",
        clientName: "TechFlow Inc.",
        thumbnailUrl: "https://images.unsplash.com/photo-1557683316-973673baf926",
        categories: ["SaaS", "UI/UX Design", "Brand Strategy"],
        challengeText: "TechFlow needed to transform their outdated platform into a modern, scalable solution that could compete in the AI-driven market.",
        solutionText: "We rebuilt their entire platform from the ground up, implementing cutting-edge design patterns and a comprehensive brand refresh.",
        outcomeText: "300% increase in user engagement, 5x faster load times, and a complete brand transformation that positioned them as industry leaders.",
        modalMediaType: "carousel",
        modalMediaUrls: [
          "https://images.unsplash.com/photo-1557683316-973673baf926",
          "https://images.unsplash.com/photo-1551434678-e076c223a692",
        ],
        testimonialText: "Revenue Party completely transformed our business. Their team didn't just design a product—they architected our entire go-to-market strategy.",
        testimonialAuthor: "Sarah Chen, CEO at TechFlow Inc.",
      })
      .returning();

    console.log(`✅ Created test project: ${testProject.title}`);

    // Create test scenes with variety
    const testScenes = [
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "text",
          content: {
            heading: "The Challenge",
            body: "In 2024, TechFlow faced a critical inflection point. Their legacy platform was bleeding users, their brand felt outdated, and competitors were eating their lunch.",
          },
          director: {
            backgroundColor: "#0a0a0a",
            textColor: "#ffffff",
            headingSize: "6xl",
            bodySize: "xl",
            alignment: "center",
            entryDuration: 2.0,
            exitDuration: 1.5,
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.2,
          },
        },
      },
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "image",
          content: {
            url: "https://images.unsplash.com/photo-1557683316-973673baf926",
            alt: "Modern workspace showcasing the new TechFlow platform interface",
            caption: "Before & After: The platform transformation",
          },
          director: {
            backgroundColor: "#1a1a1a",
            textColor: "#f8fafc",
            entryDuration: 1.2,
            exitDuration: 1.0,
            entryEffect: "slide-up",
            exitEffect: "fade",
            parallaxIntensity: 0.5,
            scaleOnScroll: true,
          },
        },
      },
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "split",
          content: {
            heading: "The Strategic Rebuild",
            body: "We didn't just redesign screens. We rebuilt the entire information architecture, reimagined user flows, and created a design system that scales.",
            media: "https://images.unsplash.com/photo-1551434678-e076c223a692",
            mediaType: "image",
            alt: "Design system components and UI patterns",
          },
          layout: "default",
          director: {
            backgroundColor: "#334155",
            textColor: "#ffffff",
            headingSize: "5xl",
            bodySize: "lg",
            alignment: "left",
            entryDuration: 1.5,
            exitDuration: 1.2,
            entryEffect: "slide-right",
            exitEffect: "slide-left",
            parallaxIntensity: 0.3,
          },
        },
      },
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "quote",
          content: {
            quote: "Revenue Party didn't just give us a new design. They gave us a competitive advantage. Our product now sells itself.",
            author: "Sarah Chen",
            role: "CEO, TechFlow Inc.",
          },
          director: {
            backgroundColor: "#1e293b",
            textColor: "#f1f5f9",
            headingSize: "4xl",
            alignment: "center",
            entryDuration: 2.0,
            exitDuration: 1.8,
            entryEffect: "fade",
            exitEffect: "dissolve",
            parallaxIntensity: 0.1,
          },
        },
      },
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "gallery",
          content: {
            heading: "The Visual System",
            images: [
              {
                url: "https://images.unsplash.com/photo-1557683316-973673baf926",
                alt: "Dashboard interface",
                caption: "Analytics Dashboard",
              },
              {
                url: "https://images.unsplash.com/photo-1551434678-e076c223a692",
                alt: "Mobile app screens",
                caption: "Mobile Experience",
              },
              {
                url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
                alt: "Component library",
                caption: "Design System",
              },
            ],
          },
          director: {
            backgroundColor: "#0f172a",
            textColor: "#ffffff",
            headingSize: "5xl",
            alignment: "center",
            entryDuration: 1.0,
            exitDuration: 0.8,
            entryEffect: "zoom-in",
            exitEffect: "fade",
            parallaxIntensity: 0.4,
            mediaScale: "cover",
          },
        },
      },
      {
        projectId: testProject.id,
        sceneConfig: {
          type: "text",
          content: {
            heading: "The Results",
            body: "Within 90 days of launch, TechFlow saw a 300% increase in trial signups, 5x improvement in load times, and became the fastest-growing platform in their category.",
          },
          director: {
            backgroundColor: "#0a0a0a",
            textColor: "#ffffff",
            headingSize: "6xl",
            bodySize: "xl",
            alignment: "center",
            entryDuration: 2.5,
            exitDuration: 2.0,
            entryEffect: "fade",
            exitEffect: "fade",
            parallaxIntensity: 0.0,
            fadeOnScroll: true,
          },
        },
      },
    ];

    // Insert all scenes
    for (const scene of testScenes) {
      await db.insert(projectScenes).values(scene);
    }

    console.log(`✅ Created ${testScenes.length} test scenes`);
    console.log("\n🎉 Test portfolio seeded successfully!");
    console.log(`📍 View at: /branding/${testProject.slug}`);
  } catch (error) {
    console.error("❌ Error seeding test portfolio:", error);
    throw error;
  }
}

seedPortfolioTest()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
