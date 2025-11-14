
import { db } from "../server/db";
import { 
  contentCatalog, 
  portfolioProjects, 
  portfolioScenes,
  type InsertContentCatalog,
  type InsertPortfolioProject,
  type InsertPortfolioScene
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedCinematicPortfolio() {
  console.log("🎬 Seeding cinematic portfolio example...");

  // Step 1: Create Content Catalog with clear, complex director notes
  const catalogData: InsertContentCatalog = {
    texts: [
      {
        id: "headline-hero",
        type: "headline",
        content: "The Revenue Architecture That Scaled 4 Startups to $10M+"
      },
      {
        id: "body-hero",
        type: "paragraph",
        content: "We don't just build sales teams. We architect the entire revenue engine—from cold outreach to customer success—using a modular system that scales without the chaos."
      },
      {
        id: "headline-problem",
        type: "headline",
        content: "The Traditional Approach is Broken"
      },
      {
        id: "body-problem",
        type: "paragraph",
        content: "Most companies waste 6-12 months hiring SDRs, only to watch 70% of them fail. The old playbook doesn't work anymore."
      },
      {
        id: "headline-solution",
        type: "headline",
        content: "Enter: The Full-Stack Sales Unit"
      },
      {
        id: "body-solution",
        type: "paragraph",
        content: "A pre-built team of 4 specialists (SDR, BDR, Closer, CSM) deployed in 30 days. One system. One price. Zero hiring headaches."
      },
      {
        id: "headline-proof",
        type: "headline",
        content: "Real Results from Real Companies"
      },
      {
        id: "headline-cta",
        type: "headline",
        content: "Ready to Build Your Revenue Engine?"
      },
      {
        id: "body-cta",
        type: "paragraph",
        content: "Book a 15-minute diagnostic call. We'll map your current bottlenecks and show you exactly how the Full-Stack Sales Unit would integrate into your business."
      }
    ],
    images: [
      {
        id: "image-blueprint",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        alt: "Revenue architecture blueprint visualization",
        caption: "The modular revenue system in action"
      },
      {
        id: "image-team",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
        alt: "Professional sales team collaboration",
        caption: "Your dedicated 4-person sales unit"
      },
      {
        id: "image-growth",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        alt: "Revenue growth chart trending upward",
        caption: "Predictable revenue growth trajectory"
      }
    ],
    videos: [
      {
        id: "video-demo",
        url: "https://player.vimeo.com/video/example",
        caption: "See the system in action: 90 days of revenue growth"
      }
    ],
    quotes: [
      {
        id: "quote-ceo",
        quote: "We went from 0 qualified meetings to 15 per month in just 60 days. The Full-Stack Sales Unit paid for itself in the first quarter.",
        author: "Sarah Chen",
        role: "CEO, TechFlow SaaS"
      },
      {
        id: "quote-founder",
        quote: "I spent 8 months trying to hire and train an SDR team. Revenue Party deployed a better system in 30 days.",
        author: "Marcus Rodriguez",
        role: "Founder, CloudScale"
      }
    ],
    directorNotes: `
VISION: A cinematic journey that transforms skepticism into conviction

PACING: Start slow and dramatic (hero), accelerate through the middle (problem/solution), slow down for emotional proof, then quick decisive CTA

SCENE 1 - HERO (Slow, Elegant Entry):
- Enters from bottom with a smooth 2.5-second slide
- Dark, cinematic background (#0a0a0a)
- Text should fade in gently as it rises
- Apply subtle parallax (0.3) for depth
- Hold on screen long enough to read twice (contemplative)

SCENE 2 - VISUAL BREAK (Medium Speed):
- Blueprint image zooms in from 0.9x to 1.1x scale
- Moderate parallax (0.5) for dimension
- 1.2-second entry, standard timing
- Background shifts to deep blue (#1e293b)

SCENE 3 - PROBLEM (Fast, Jarring):
- Slides in from RIGHT (opposing direction for contrast)
- Quick 0.8-second entry to create urgency
- Dark red undertone (#1a0a0a) to signal warning
- Minimal parallax (0.1) to keep it grounded
- Sharp, sudden appearance

SCENE 4 - SOLUTION (Slow, Confident Return):
- Enters from LEFT (correcting the direction)
- Deliberate 2.0-second entry
- Crossfade transition for smooth handoff
- Lighter background (#334155) showing hope
- Strong parallax (0.6) for authority

SCENE 5 - TEAM IMAGE (Medium, Warm):
- Gentle fade + scale effect
- Background warms to slate (#475569)
- 1.5-second entry
- Both scale AND fade on scroll for layered effect

SCENE 6 - PROOF QUOTE (Very Slow, Emotional):
- Slowest entry of all (3.0 seconds)
- Centered alignment for authority
- Deep blur effect on scroll for cinematic feel
- Nearly white background (#f1f5f9) for contrast
- Let the testimonial breathe

SCENE 7 - GROWTH IMAGE (Fast, Energetic):
- Quick zoom-in (0.8 seconds)
- Strong scale effect on scroll
- Return to dark background (#0f172a)
- High energy to show momentum

SCENE 8 - SECOND QUOTE (Medium, Confident):
- Balanced 1.5-second fade
- Maintain light background
- Standard transitions to keep rhythm

SCENE 9 - CTA (Slow, Clear, Decisive):
- Final slow entry (2.2 seconds)
- Centered for maximum impact
- Clean fade, no distractions
- Darkest background (#000000) to frame the action
- Large, bold text sizing
`.trim()
  };

  const [catalog] = await db.insert(contentCatalog)
    .values(catalogData)
    .returning();

  console.log("✅ Content catalog created:", catalog.id);

  // Step 2: Create Portfolio Project
  const projectData: InsertPortfolioProject = {
    title: "Revenue Party - Full-Stack Sales System",
    slug: "revenue-party-cinematic-demo",
    description: "A cinematic storytelling experience showcasing the modular revenue architecture",
    category: "SaaS Marketing",
    featured: true,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    catalogId: catalog.id,
    published: true
  };

  const [project] = await db.insert(portfolioProjects)
    .values(projectData)
    .returning();

  console.log("✅ Portfolio project created:", project.id);

  // Step 3: Create 9 Scenes (manually configured per director notes)
  const scenes: InsertPortfolioScene[] = [
    // Scene 1: Hero (Slow, Elegant)
    {
      projectId: project.id,
      type: "text",
      content: {
        heading: "The Revenue Architecture That Scaled 4 Startups to $10M+",
        body: "We don't just build sales teams. We architect the entire revenue engine—from cold outreach to customer success—using a modular system that scales without the chaos."
      },
      layout: "default",
      orderIndex: 0,
      director: {
        entryDuration: 2.5,
        exitDuration: 1.8,
        animationDuration: 3.0,
        backgroundColor: "#0a0a0a",
        textColor: "#ffffff",
        parallaxIntensity: 0.3,
        entryEffect: "slide-up",
        exitEffect: "fade",
        fadeOnScroll: true,
        scaleOnScroll: false,
        blurOnScroll: false,
        headingSize: "7xl",
        bodySize: "xl",
        alignment: "center"
      }
    },
    // Scene 2: Blueprint Image (Medium, Zoom)
    {
      projectId: project.id,
      type: "image",
      content: {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        alt: "Revenue architecture blueprint visualization",
        caption: "The modular revenue system in action"
      },
      layout: "default",
      orderIndex: 1,
      director: {
        entryDuration: 1.2,
        exitDuration: 1.0,
        animationDuration: 2.0,
        backgroundColor: "#1e293b",
        textColor: "#ffffff",
        parallaxIntensity: 0.5,
        entryEffect: "zoom-in",
        exitEffect: "fade",
        fadeOnScroll: false,
        scaleOnScroll: true,
        blurOnScroll: false,
        headingSize: "5xl",
        bodySize: "lg",
        alignment: "center"
      }
    },
    // Scene 3: Problem (Fast, Jarring)
    {
      projectId: project.id,
      type: "text",
      content: {
        heading: "The Traditional Approach is Broken",
        body: "Most companies waste 6-12 months hiring SDRs, only to watch 70% of them fail. The old playbook doesn't work anymore."
      },
      layout: "default",
      orderIndex: 2,
      director: {
        entryDuration: 0.8,
        exitDuration: 0.6,
        animationDuration: 1.5,
        backgroundColor: "#1a0a0a",
        textColor: "#ff6b6b",
        parallaxIntensity: 0.1,
        entryEffect: "slide-left",
        exitEffect: "slide-left",
        fadeOnScroll: false,
        scaleOnScroll: false,
        blurOnScroll: false,
        headingSize: "6xl",
        bodySize: "lg",
        alignment: "center"
      }
    },
    // Scene 4: Solution (Slow, Confident)
    {
      projectId: project.id,
      type: "text",
      content: {
        heading: "Enter: The Full-Stack Sales Unit",
        body: "A pre-built team of 4 specialists (SDR, BDR, Closer, CSM) deployed in 30 days. One system. One price. Zero hiring headaches."
      },
      layout: "default",
      orderIndex: 3,
      director: {
        entryDuration: 2.0,
        exitDuration: 1.5,
        animationDuration: 2.5,
        backgroundColor: "#334155",
        textColor: "#ffffff",
        parallaxIntensity: 0.6,
        entryEffect: "slide-right",
        exitEffect: "dissolve",
        fadeOnScroll: true,
        scaleOnScroll: false,
        blurOnScroll: false,
        headingSize: "7xl",
        bodySize: "xl",
        alignment: "center"
      }
    },
    // Scene 5: Team Image (Medium, Warm)
    {
      projectId: project.id,
      type: "image",
      content: {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
        alt: "Professional sales team collaboration",
        caption: "Your dedicated 4-person sales unit"
      },
      layout: "default",
      orderIndex: 4,
      director: {
        entryDuration: 1.5,
        exitDuration: 1.2,
        animationDuration: 2.0,
        backgroundColor: "#475569",
        textColor: "#ffffff",
        parallaxIntensity: 0.4,
        entryEffect: "fade",
        exitEffect: "fade",
        fadeOnScroll: true,
        scaleOnScroll: true,
        blurOnScroll: false,
        headingSize: "5xl",
        bodySize: "lg",
        alignment: "center"
      }
    },
    // Scene 6: First Quote (Very Slow, Emotional)
    {
      projectId: project.id,
      type: "quote",
      content: {
        quote: "We went from 0 qualified meetings to 15 per month in just 60 days. The Full-Stack Sales Unit paid for itself in the first quarter.",
        author: "Sarah Chen",
        role: "CEO, TechFlow SaaS"
      },
      layout: "default",
      orderIndex: 5,
      director: {
        entryDuration: 3.0,
        exitDuration: 2.5,
        animationDuration: 4.0,
        backgroundColor: "#f1f5f9",
        textColor: "#0a0a0a",
        parallaxIntensity: 0.2,
        entryEffect: "fade",
        exitEffect: "fade",
        fadeOnScroll: true,
        scaleOnScroll: false,
        blurOnScroll: true,
        headingSize: "6xl",
        bodySize: "xl",
        alignment: "center"
      }
    },
    // Scene 7: Growth Image (Fast, Energetic)
    {
      projectId: project.id,
      type: "image",
      content: {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        alt: "Revenue growth chart trending upward",
        caption: "Predictable revenue growth trajectory"
      },
      layout: "default",
      orderIndex: 6,
      director: {
        entryDuration: 0.8,
        exitDuration: 0.6,
        animationDuration: 1.5,
        backgroundColor: "#0f172a",
        textColor: "#ffffff",
        parallaxIntensity: 0.5,
        entryEffect: "zoom-in",
        exitEffect: "fade",
        fadeOnScroll: false,
        scaleOnScroll: true,
        blurOnScroll: false,
        headingSize: "5xl",
        bodySize: "lg",
        alignment: "center"
      }
    },
    // Scene 8: Second Quote (Medium, Confident)
    {
      projectId: project.id,
      type: "quote",
      content: {
        quote: "I spent 8 months trying to hire and train an SDR team. Revenue Party deployed a better system in 30 days.",
        author: "Marcus Rodriguez",
        role: "Founder, CloudScale"
      },
      layout: "default",
      orderIndex: 7,
      director: {
        entryDuration: 1.5,
        exitDuration: 1.2,
        animationDuration: 2.0,
        backgroundColor: "#f1f5f9",
        textColor: "#0a0a0a",
        parallaxIntensity: 0.2,
        entryEffect: "fade",
        exitEffect: "fade",
        fadeOnScroll: true,
        scaleOnScroll: false,
        blurOnScroll: false,
        headingSize: "6xl",
        bodySize: "xl",
        alignment: "center"
      }
    },
    // Scene 9: CTA (Slow, Decisive)
    {
      projectId: project.id,
      type: "text",
      content: {
        heading: "Ready to Build Your Revenue Engine?",
        body: "Book a 15-minute diagnostic call. We'll map your current bottlenecks and show you exactly how the Full-Stack Sales Unit would integrate into your business."
      },
      layout: "default",
      orderIndex: 8,
      director: {
        entryDuration: 2.2,
        exitDuration: 2.0,
        animationDuration: 3.0,
        backgroundColor: "#000000",
        textColor: "#ffffff",
        parallaxIntensity: 0.0,
        entryEffect: "fade",
        exitEffect: "fade",
        fadeOnScroll: true,
        scaleOnScroll: false,
        blurOnScroll: false,
        headingSize: "8xl",
        bodySize: "2xl",
        alignment: "center"
      }
    }
  ];

  await db.insert(portfolioScenes).values(scenes);

  console.log("✅ 9 cinematic scenes created with director configs");
  console.log("\n🎬 Director Notes Summary:");
  console.log("━".repeat(60));
  console.log("Scene 1: Hero - Slow elegant rise (2.5s), dark cinematic");
  console.log("Scene 2: Blueprint - Medium zoom (1.2s), strong parallax");
  console.log("Scene 3: Problem - Fast jarring slide-left (0.8s), red alert");
  console.log("Scene 4: Solution - Slow confident slide-right (2.0s)");
  console.log("Scene 5: Team - Medium warm fade+scale (1.5s)");
  console.log("Scene 6: Quote 1 - Very slow emotional (3.0s), blur effect");
  console.log("Scene 7: Growth - Fast energetic zoom (0.8s)");
  console.log("Scene 8: Quote 2 - Medium balanced fade (1.5s)");
  console.log("Scene 9: CTA - Slow decisive finale (2.2s), pure black");
  console.log("━".repeat(60));
  console.log("\n✨ View at: /admin/branding/projects/" + project.slug);
}

seedCinematicPortfolio()
  .then(() => {
    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
