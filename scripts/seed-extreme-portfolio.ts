import { db } from "../server/db";
import { projects, projectScenes } from "@shared/schema";
import { generatePortfolioWithAI, convertToSceneConfigs } from "../server/utils/portfolio-director";
import type { ContentCatalog } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";

async function seedExtremePortfolio() {
  console.log("🎪 Seeding EXTREME VARIATION portfolio - Testing all director capabilities...");

  // Rich content catalog with maximum diversity
  const contentCatalog = {
    texts: [
      { id: "text-hero-1", type: "headline", content: "Velocity Labs: When Innovation Meets Impossible Deadlines" },
      { id: "text-hero-2", type: "subheading", content: "From Concept to Launch in 72 Hours" },
      { id: "text-crisis-1", type: "headline", content: "The Crisis" },
      { id: "text-crisis-2", type: "paragraph", content: "At 3 AM on Monday, we got the call. Their entire platform had crashed during Black Friday. 2 million users locked out. $40M in transactions frozen. Competitors circling like sharks." },
      { id: "text-strategy-1", type: "headline", content: "The War Room Strategy" },
      { id: "text-strategy-2", type: "paragraph", content: "We assembled a dream team: 3 DevOps wizards, 2 security experts, 1 database architect who'd seen it all. The plan? Rebuild the entire infrastructure while keeping 80% of services running. Impossible? Maybe. Necessary? Absolutely." },
      { id: "text-execution-1", type: "headline", content: "Hour by Hour: The 72-Hour Sprint" },
      { id: "text-execution-2", type: "paragraph", content: "Hour 12: New database cluster online. Hour 24: Payment processing restored. Hour 48: All services migrated. Hour 72: Stress-tested at 10x normal load. Zero downtime during the transition." },
      { id: "text-results-1", type: "headline", content: "The Aftermath" },
      { id: "text-results-2", type: "paragraph", content: "99.99% uptime achieved. Response times 40% faster. Infrastructure costs cut by 60%. The CEO sent champagne. The CTO offered us equity. We just smiled and said: 'That's what we do.'" },
      { id: "text-tech-1", type: "headline", content: "The Tech Stack" },
      { id: "text-tech-2", type: "paragraph", content: "Kubernetes orchestration. PostgreSQL with Citus sharding. Redis clustering. NGINX load balancing. Prometheus monitoring. Grafana dashboards. All deployed with GitOps workflows and automated rollback capabilities." },
      { id: "text-future-1", type: "headline", content: "What's Next?" },
      { id: "text-future-2", type: "paragraph", content: "They're now handling 10M daily users. Planning international expansion. And they call us first for every major initiative. Because when the impossible becomes possible, you don't forget who made it happen." },
      { id: "text-final-1", type: "headline", content: "Innovation Never Sleeps" },
      { id: "text-final-2", type: "paragraph", content: "This is what we live for. The adrenaline. The challenge. The moment when everything clicks and the impossible becomes inevitable. Ready for your own transformation?" },
    ],
    images: [
      { id: "img-command-center", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80", alt: "Command center dashboard", caption: "Mission control" },
      { id: "img-war-room", url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80", alt: "Team in war room", caption: "The team that never sleeps" },
      { id: "img-code-screen", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&q=80", alt: "Code on screen", caption: "Building at light speed" },
      { id: "img-server-room", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80", alt: "Server infrastructure", caption: "The new backbone" },
      { id: "img-celebration", url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80", alt: "Team celebrating", caption: "Victory at dawn" },
      { id: "img-analytics", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80", alt: "Analytics dashboard", caption: "The proof is in the data" },
    ],
    videos: [
      { id: "vid-behind-scenes", url: "https://player.vimeo.com/video/76979871", caption: "Behind the scenes: 72 hours of controlled chaos" },
      { id: "vid-demo", url: "https://player.vimeo.com/video/148751763", caption: "Platform demo: The new architecture" },
    ],
    quotes: [
      { id: "quote-ceo", quote: "I've worked with dozens of agencies. Velocity Labs is in a different league. They don't just solve problems—they redefine what's possible.", author: "Sarah Chen", role: "CEO, TechFlow" },
      { id: "quote-cto", quote: "The technical depth combined with speed of execution is unmatched. They saved our company and made us stronger than ever.", author: "Marcus Rodriguez", role: "CTO, TechFlow" },
      { id: "quote-investor", quote: "After Velocity Labs rebuilt their infrastructure, we tripled our investment. This is the kind of transformation that changes valuations.", author: "Jennifer Park", role: "Lead Investor, Sequoia Capital" },
    ],
    directorNotes: `
EXTREME VARIATION PORTFOLIO - Testing ALL Director Capabilities

MISSION: Create a showcase demonstrating the full range of cinematic effects, timing variations, transitions, and visual treatments available in the director system.

═══════════════════════════════════════════════════════════════════════════════
SCENE ARCHITECTURE (15 scenes total - Maximum diversity)
═══════════════════════════════════════════════════════════════════════════════

OPENING MOVEMENT - The Hook (Scenes 1-3)
───────────────────────────────────────────────────────────────────────────────
Scene 1: HERO TEXT - Ultra-slow dramatic entrance
  - Assets: [text-hero-1, text-hero-2]
  - Entry: fade, 4.5s (slowest possible, build anticipation)
  - Exit: dissolve, 2.5s
  - Background: Pure black (#000000)
  - Text: White (#ffffff), center-aligned
  - Typography: 8xl heading, 2xl body, bold weight
  - Parallax: 0.0 (grounded, stable)
  - Scroll Effects: fadeOnScroll (subtle disappearance)
  - Scroll Speed: slow (contemplative)
  
Scene 2: IMAGE - Explosive fast entrance
  - Assets: [img-command-center]
  - Entry: zoom-in, 0.5s (FASTEST - dramatic contrast from scene 1)
  - Exit: fade, 1.0s
  - Background: Deep navy (#0a0e27)
  - Media: cover fit, center position, scale 1.2 (zoomed)
  - Parallax: 0.85 (maximum movement, creates depth)
  - Scroll Effects: scaleOnScroll + fadeOnScroll (double effect)
  - Scroll Speed: fast (energy)

Scene 3: TEXT - Crisis revelation
  - Assets: [text-crisis-1, text-crisis-2]
  - Entry: slide-up, 1.2s
  - Exit: slide-left, 0.8s
  - Background: Dark red (#8b0000)
  - Text: White, left-aligned
  - Typography: 7xl heading, xl body, semibold
  - Parallax: 0.15 (minimal, urgent feel)
  - Scroll Effects: blurOnScroll (adds tension)
  - Scroll Speed: normal

CRISIS MOVEMENT - The Problem (Scenes 4-6)
───────────────────────────────────────────────────────────────────────────────
Scene 4: VIDEO - Behind the scenes
  - Assets: [vid-behind-scenes]
  - Entry: fade, 2.0s (medium pace)
  - Exit: zoom-out, 1.5s
  - Background: Black (#000000)
  - Media: contain fit, center position
  - Parallax: 0.5 (balanced)
  - Scroll Effects: fadeOnScroll only
  - Scroll Speed: normal

Scene 5: QUOTE - Testimonial interlude
  - Assets: [quote-ceo]
  - Entry: slide-right, 3.0s (slow, let it sink in)
  - Exit: fade, 2.0s
  - Background: Very light gray (#f8f9fa)
  - Text: Dark gray (#1a1a1a), center-aligned
  - Typography: 6xl quote, base citation, medium weight
  - Parallax: 0.05 (barely moves, stability)
  - Scroll Effects: None (pure, clean)
  - Scroll Speed: slow

Scene 6: IMAGE - The team
  - Assets: [img-war-room]
  - Entry: slide-down, 1.5s
  - Exit: slide-up, 1.0s
  - Background: Warm slate (#475569)
  - Gradient: [#1e293b, #475569, #64748b] (3-color gradient)
  - Media: cover, top position, scale 1.0
  - Parallax: 0.7 (high movement)
  - Scroll Effects: scaleOnScroll + blurOnScroll (dramatic)
  - Scroll Speed: fast

STRATEGY MOVEMENT - The Solution (Scenes 7-9)
───────────────────────────────────────────────────────────────────────────────
Scene 7: TEXT - Strategy reveal
  - Assets: [text-strategy-1, text-strategy-2]
  - Entry: zoom-out, 2.2s (reverse zoom for variety)
  - Exit: fade, 1.5s
  - Background: Deep purple (#4c1d95)
  - Text: White, center-aligned
  - Typography: 7xl heading, lg body, bold
  - Parallax: 0.3 (moderate)
  - Scroll Effects: fadeOnScroll
  - Scroll Speed: normal

Scene 8: IMAGE - The code
  - Assets: [img-code-screen]
  - Entry: slide-left, 0.8s (fast, technical)
  - Exit: slide-right, 0.6s
  - Background: Dark teal (#134e4a)
  - Media: cover, center, scale 1.1
  - Parallax: 0.6 (good movement)
  - Scroll Effects: scaleOnScroll
  - Scroll Speed: fast

Scene 9: VIDEO - Demo walkthrough
  - Assets: [vid-demo]
  - Entry: sudden, 0.3s (instant appearance)
  - Exit: dissolve, 2.0s
  - Background: Black (#000000)
  - Media: contain, center
  - Parallax: 0.0 (stable for video playback)
  - Scroll Effects: None
  - Scroll Speed: slow

EXECUTION MOVEMENT - The Build (Scenes 10-12)
───────────────────────────────────────────────────────────────────────────────
Scene 10: TEXT - Hour by hour
  - Assets: [text-execution-1, text-execution-2]
  - Entry: fade, 3.5s (slow build)
  - Exit: zoom-out, 1.8s
  - Background: Midnight blue (#1e3a8a)
  - Text: Cyan (#06b6d4), left-aligned
  - Typography: 8xl heading, xl body, bold
  - Parallax: 0.25 (subtle)
  - Scroll Effects: fadeOnScroll + blurOnScroll
  - Scroll Speed: slow

Scene 11: IMAGE - Server infrastructure
  - Assets: [img-server-room]
  - Entry: zoom-in, 1.0s (medium fast)
  - Exit: slide-down, 1.2s
  - Background: Steel gray (#374151)
  - Media: cover, bottom, scale 1.3 (dramatic zoom)
  - Parallax: 0.8 (near-maximum)
  - Scroll Effects: All three (fadeOnScroll + scaleOnScroll + blurOnScroll)
  - Scroll Speed: fast

Scene 12: QUOTE - CTO perspective
  - Assets: [quote-cto]
  - Entry: slide-up, 2.5s
  - Exit: fade, 2.0s
  - Background: White (#ffffff)
  - Text: Black (#000000), center-aligned
  - Typography: 7xl quote, base citation, semibold
  - Parallax: 0.1 (minimal)
  - Scroll Effects: fadeOnScroll only
  - Scroll Speed: slow

RESULTS MOVEMENT - The Victory (Scenes 13-14)
───────────────────────────────────────────────────────────────────────────────
Scene 13: TEXT - The aftermath
  - Assets: [text-results-1, text-results-2]
  - Entry: zoom-in, 0.7s (fast victory)
  - Exit: fade, 1.0s
  - Background: Victory green (#166534)
  - Text: White, center-aligned
  - Typography: 8xl heading, 2xl body, bold
  - Parallax: 0.4 (balanced)
  - Scroll Effects: scaleOnScroll
  - Scroll Speed: normal

Scene 14: IMAGE - Celebration
  - Assets: [img-celebration]
  - Entry: slide-right, 1.5s
  - Exit: dissolve, 2.5s
  - Background: Warm gold (#f59e0b)
  - Media: cover, center, scale 1.0
  - Parallax: 0.65 (high energy)
  - Scroll Effects: fadeOnScroll + scaleOnScroll
  - Scroll Speed: normal

CLOSING MOVEMENT - The Future (Scene 15)
───────────────────────────────────────────────────────────────────────────────
Scene 15: TEXT - Call to action
  - Assets: [text-final-1, text-final-2]
  - Entry: fade, 5.0s (MAXIMUM duration - leave lasting impression)
  - Exit: None (final scene)
  - Background: Pure black (#000000)
  - Text: White, center-aligned
  - Typography: 8xl heading, 2xl body, bold
  - Parallax: 0.0 (grounded, stable ending)
  - Scroll Effects: None (pure focus)
  - Scroll Speed: slow (contemplative ending)

═══════════════════════════════════════════════════════════════════════════════
VARIATION SUMMARY - What We're Testing
═══════════════════════════════════════════════════════════════════════════════

TIMING RANGE:
  - Entry durations: 0.3s (sudden) → 5.0s (ultra-slow)
  - Exit durations: 0.6s (fast) → 2.5s (slow)
  - Creates dramatic pacing contrasts

TRANSITION TYPES USED:
  - fade (4x)
  - zoom-in (3x)
  - slide-up (2x)
  - slide-down (1x)
  - slide-left (1x)
  - slide-right (2x)
  - zoom-out (1x)
  - sudden (1x)
  - dissolve (2x exits)

BACKGROUND COLORS (11 unique):
  - Black (#000000) - 4x
  - Navy (#0a0e27)
  - Dark red (#8b0000)
  - Light gray (#f8f9fa)
  - Warm slate (#475569)
  - Deep purple (#4c1d95)
  - Dark teal (#134e4a)
  - Midnight blue (#1e3a8a)
  - Steel gray (#374151)
  - White (#ffffff)
  - Victory green (#166534)
  - Warm gold (#f59e0b)

PARALLAX INTENSITY:
  - Range: 0.0 → 0.85
  - 0.0 (stable): 3 scenes
  - 0.05-0.25 (subtle): 5 scenes
  - 0.3-0.5 (moderate): 3 scenes
  - 0.6-0.85 (high): 4 scenes

SCROLL EFFECTS:
  - fadeOnScroll: 8 scenes
  - scaleOnScroll: 7 scenes
  - blurOnScroll: 4 scenes
  - All three combined: 1 scene
  - None: 3 scenes

SCROLL SPEED:
  - slow: 6 scenes
  - normal: 6 scenes
  - fast: 3 scenes

TEXT ALIGNMENT:
  - center: 11 scenes
  - left: 2 scenes

TYPOGRAPHY SIZES:
  - Headings: 6xl, 7xl (3x), 8xl (4x)
  - Body: base, lg, xl (3x), 2xl (3x)
  - Weights: medium, semibold (3x), bold (6x)

MEDIA TREATMENTS:
  - Scale: 1.0, 1.1, 1.2, 1.3
  - Fit: cover (5x), contain (2x)
  - Position: center (5x), top (1x), bottom (1x)

═══════════════════════════════════════════════════════════════════════════════
AI ORCHESTRATION INSTRUCTIONS
═══════════════════════════════════════════════════════════════════════════════

Dear AI Director,

Create exactly 15 scenes following the structure above. Use the specified assets in order, applying the exact timing, effects, and visual treatments described.

This portfolio is a stress test of the system's capabilities. Every scene should feel distinctly different from its neighbors while maintaining narrative flow.

Prioritize:
1. TIMING CONTRAST - Adjacent scenes should have different entry speeds
2. VISUAL VARIETY - No two consecutive scenes should share the same background color family
3. EFFECT DIVERSITY - Rotate through different scroll effects and parallax intensities
4. TRANSITION FLOW - Use entry/exit transitions that create smooth visual connections

The result should be a mesmerizing journey that demonstrates every tool in the director's arsenal.
`.trim()
  };

  try {
    console.log("\n🎬 Calling Gemini AI for extreme orchestration...");
    const aiResult = await generatePortfolioWithAI(contentCatalog as ContentCatalog);
    console.log(`✅ Gemini generated ${aiResult.scenes.length} scenes\n`);

    console.log("🔄 Converting to database format...");
    const sceneConfigs = convertToSceneConfigs(aiResult.scenes, contentCatalog as ContentCatalog);
    console.log(`✅ Converted ${sceneConfigs.length} scene configs\n`);

    console.log("💾 Saving to database...");
    const result = await db.transaction(async (tx) => {
      const [project] = await tx.insert(projects).values({
        tenantId: DEFAULT_TENANT_ID,
        title: "Velocity Labs: The 72-Hour Miracle",
        slug: "velocity-labs-extreme",
        clientName: "TechFlow",
        thumbnailUrl: contentCatalog.images[0]?.url || null,
        categories: ["DevOps", "Infrastructure", "Emergency Response"],
        challengeText: null,
        solutionText: null,
        outcomeText: null,
        modalMediaType: "video",
        modalMediaUrls: [],
        testimonialText: null,
        testimonialAuthor: null,
      }).returning();

      console.log(`✅ Created project: ${project.id}`);

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

      return { project, scenes: createdScenes };
    });

    console.log("\n🎉 EXTREME PORTFOLIO GENERATED!");
    console.log("═".repeat(80));
    console.log(`   Project: ${result.project.title}`);
    console.log(`   Slug: ${result.project.slug}`);
    console.log(`   Scenes: ${result.scenes.length}`);
    
    console.log("\n🎬 Scene Summary:");
    console.log("═".repeat(80));
    result.scenes.forEach((scene: any, index: number) => {
      const config = scene.sceneConfig || {};
      const effects = [
        config.fadeOnScroll && 'fade',
        config.scaleOnScroll && 'scale',
        config.blurOnScroll && 'blur'
      ].filter(Boolean);
      
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${config.type?.toUpperCase().padEnd(6)} | Entry: ${config.entryEffect?.padEnd(12)} ${config.entryDuration}s | Parallax: ${config.parallaxIntensity} | Effects: ${effects.join('+') || 'none'}`);
    });

    console.log("\n" + "═".repeat(80));
    console.log(`🌐 View at: http://localhost:5000/branding/${result.project.slug}`);
    console.log(`⚙️  Admin at: http://localhost:5000/admin/branding/projects/${result.project.slug}`);
    console.log("═".repeat(80) + "\n");

  } catch (error) {
    console.error("\n❌ Generation failed:", error);
    throw error;
  }
}

seedExtremePortfolio()
  .then(() => {
    console.log("\n🎪 Extreme variation seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
