
import { db } from "../server/db";
import { projects, projectScenes, tenants } from "@shared/schema";

async function seedCinematicPortfolio() {
  console.log("🎬 Seeding cinematic portfolio with complex director notes...");

  try {
    // Get the default tenant
    const [defaultTenant] = await db.select().from(tenants).limit(1);
    
    if (!defaultTenant) {
      throw new Error("No tenant found. Please run database migrations first.");
    }

    console.log(`✅ Using tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    // Create cinematic project
    const [cinematicProject] = await db
      .insert(projects)
      .values({
        tenantId: defaultTenant.id,
        slug: "impossible-product-launch",
        title: "The Impossible Product Launch",
        clientName: "Quantum Dynamics Inc.",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
        categories: ["Product Launch", "B2B SaaS", "Brand Transformation"],
        challengeText: "Quantum Dynamics had 6 weeks to launch an AI product in a crowded market with zero brand recognition and a skeptical audience.",
        solutionText: "We built a launch system that didn't sell features—it sold belief. A narrative-driven campaign that turned skeptics into believers through pure storytelling.",
        outcomeText: "Waitlist of 12,000 in 3 weeks. $2.4M in pre-orders before launch. Category leader status in 90 days.",
        modalMediaType: "carousel",
        modalMediaUrls: [
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
          "https://images.unsplash.com/photo-1518770660439-4636190af475",
        ],
        testimonialText: "They didn't just launch our product. They orchestrated a movement. The campaign was pure cinema.",
        testimonialAuthor: "Dr. Maya Patel, CEO at Quantum Dynamics",
      })
      .returning();

    console.log(`✅ Created cinematic project: ${cinematicProject.title}`);

    // Create scenes following the director's vision
    const cinematicScenes = [
      // SCENE 1: Slow, dramatic opening - Dark mystery phase
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "text",
          content: {
            heading: "They Said It Was Impossible",
            body: "Six weeks. Zero budget. A product nobody asked for in a market that didn't care. This is how we made the impossible happen.",
          },
          director: {
            backgroundColor: "#0a0a0a",
            textColor: "#ffffff",
            headingSize: "8xl", // WOW moment sizing
            bodySize: "xl",
            alignment: "center",
            entryDuration: 3.5, // SLOW contemplative
            exitDuration: 2.0,
            entryEffect: "slide-up", // Rising into view
            exitEffect: "fade",
            parallaxIntensity: 0.1, // Minimal for text
            fadeOnScroll: true,
            scaleOnScroll: false,
            blurOnScroll: false,
          },
        },
      },

      // SCENE 2: Still dark, building tension
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "image",
          content: {
            url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
            alt: "Abstract technology visualization showing the impossible challenge",
            caption: "The market everyone said was saturated",
          },
          director: {
            backgroundColor: "#1a1a1a",
            textColor: "#f8fafc",
            entryDuration: 3.0, // Still slow, building
            exitDuration: 1.8,
            entryEffect: "slide-up",
            exitEffect: "dissolve", // Crossfade transition
            parallaxIntensity: 0.7, // Strong parallax for drama
            fadeOnScroll: true,
            scaleOnScroll: true, // Scale effect on image
            blurOnScroll: false,
          },
        },
      },

      // SCENE 3: Revelation phase begins - Brightening
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "split",
          content: {
            heading: "The Insight Nobody Saw",
            body: "While competitors shouted features, we whispered a story. We didn't build a product pitch. We architected a belief system.",
            media: "https://images.unsplash.com/photo-1518770660439-4636190af475",
            mediaType: "image",
            alt: "Strategic planning visualization",
          },
          layout: "default",
          director: {
            backgroundColor: "#334155", // Brightening
            textColor: "#ffffff",
            headingSize: "6xl",
            bodySize: "lg",
            alignment: "left",
            entryDuration: 1.2, // FASTER now - acceleration phase
            exitDuration: 1.0,
            entryEffect: "slide-up",
            exitEffect: "slide-down", // Alternating exit
            parallaxIntensity: 0.2, // Minimal for split
            fadeOnScroll: true,
            scaleOnScroll: false,
          },
        },
      },

      // SCENE 4: Peak energy - Fast pacing
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "video",
          content: {
            url: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7a1b2",
            caption: "The campaign that changed everything",
          },
          director: {
            backgroundColor: "#475569", // Lighter still
            textColor: "#f1f5f9",
            entryDuration: 0.8, // FAST and energetic
            exitDuration: 0.8,
            entryEffect: "slide-up",
            exitEffect: "fade",
            parallaxIntensity: 0.4, // Moderate for video
            fadeOnScroll: true,
            scaleOnScroll: false,
            blurOnScroll: true, // Cinematic depth effect
          },
        },
      },

      // SCENE 5: Social proof at peak brightness
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "quote",
          content: {
            quote: "I've been in tech for 20 years. I've never seen a launch campaign this sophisticated. It wasn't marketing. It was art.",
            author: "Dr. Maya Patel",
            role: "CEO, Quantum Dynamics Inc.",
          },
          director: {
            backgroundColor: "#475569", // Still bright
            textColor: "#ffffff",
            headingSize: "5xl", // Quote sizing
            alignment: "center",
            entryDuration: 2.0, // Slowing down for emphasis
            exitDuration: 1.5,
            entryEffect: "slide-up",
            exitEffect: "dissolve", // Crossfade
            parallaxIntensity: 0.1,
            fadeOnScroll: true,
            scaleOnScroll: false,
          },
        },
      },

      // SCENE 6: Return to darkness - Triumphant
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "gallery",
          content: {
            heading: "The Results Speak",
            images: [
              {
                url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
                alt: "Analytics dashboard showing exponential growth",
                caption: "12,000 Waitlist Signups",
              },
              {
                url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
                alt: "Revenue metrics visualization",
                caption: "$2.4M Pre-Launch Revenue",
              },
              {
                url: "https://images.unsplash.com/photo-1551434678-e076c223a692",
                alt: "Market position chart",
                caption: "Category Leader in 90 Days",
              },
            ],
          },
          director: {
            backgroundColor: "#0f172a", // Dark triumph
            textColor: "#ffffff",
            headingSize: "6xl",
            alignment: "center",
            entryDuration: 1.0, // Moderate pace
            exitDuration: 0.8,
            entryEffect: "zoom-in", // Gallery zoom
            exitEffect: "fade",
            parallaxIntensity: 0.0, // No parallax for gallery
            fadeOnScroll: true,
            scaleOnScroll: true,
          },
        },
      },

      // SCENE 7: DRAMATIC slow-motion finale
      {
        projectId: cinematicProject.id,
        sceneConfig: {
          type: "text",
          content: {
            heading: "The Impossible Became Inevitable",
            body: "This is what happens when you stop selling and start believing. When you architect narrative instead of features. When you choose cinema over commerce.",
          },
          director: {
            backgroundColor: "#0a0a0a", // Return to original dark
            textColor: "#ffffff",
            headingSize: "8xl", // Final WOW moment
            bodySize: "xl",
            alignment: "center",
            entryDuration: 4.0, // DRAMATIC slow motion
            exitDuration: 3.0,
            entryEffect: "slide-up",
            exitEffect: "fade",
            parallaxIntensity: 0.0, // No parallax - pure focus
            fadeOnScroll: true,
            scaleOnScroll: false,
            blurOnScroll: false,
          },
        },
      },
    ];

    // Insert all scenes
    for (const scene of cinematicScenes) {
      await db.insert(projectScenes).values(scene);
    }

    console.log(`✅ Created ${cinematicScenes.length} cinematic scenes`);
    console.log("\n🎉 Cinematic portfolio seeded successfully!");
    console.log(`📍 View at: /branding/${cinematicProject.slug}`);
    console.log("\n📋 Director Notes Summary:");
    console.log("   - Pacing: Slow → Fast → Dramatic Slow");
    console.log("   - Colors: Dark → Light → Dark (sunrise arc)");
    console.log("   - Parallax: 0.1-0.7 range, scene-appropriate");
    console.log("   - Scroll Effects: 71% fade, 29% scale, 14% blur");
  } catch (error) {
    console.error("❌ Error seeding cinematic portfolio:", error);
    throw error;
  }
}

seedCinematicPortfolio()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
