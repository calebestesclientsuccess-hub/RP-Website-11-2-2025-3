import { db } from "../server/db";
import { featureFlags, widgetConfig, testimonials } from "../shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedProductionConfigs(tenantId: string) {
  console.log("⚙️  Seeding production configurations...");

  // Feature Flags - System defaults
  const flags = [
    {
      tenantId,
      flagKey: "theme_toggle",
      flagName: "Theme Toggle",
      enabled: true,
      description: "Enable dark/light theme toggle in UI",
    },
    {
      tenantId,
      flagKey: "ebook_lead_magnets",
      flagName: "E-Book Lead Magnets",
      enabled: true,
      description: "Enable e-book lead magnet functionality",
    },
    {
      tenantId,
      flagKey: "portfolio_wizard",
      flagName: "Portfolio Wizard",
      enabled: true,
      description: "Enable AI-powered portfolio creation wizard",
    },
    {
      tenantId,
      flagKey: "advanced_director_controls",
      flagName: "Advanced Director Controls",
      enabled: true,
      description: "Enable all 37 director controls for scene customization",
    },
    {
      tenantId,
      flagKey: "media_library",
      flagName: "Media Library",
      enabled: true,
      description: "Enable Cloudinary media library integration",
    },
    {
      tenantId,
      flagKey: "crm_workspace",
      flagName: "CRM Workspace",
      enabled: true,
      description: "Enable built-in CRM functionality",
    },
  ];

  let flagsCreated = 0;
  let flagsUpdated = 0;

  for (const flag of flags) {
    const existing = await db.query.featureFlags.findFirst({
      where: and(
        eq(featureFlags.tenantId, tenantId),
        eq(featureFlags.flagKey, flag.flagKey)
      ),
    });

    if (existing) {
      await db.update(featureFlags)
        .set({ 
          enabled: flag.enabled, 
          flagName: flag.flagName,
          description: flag.description,
          updatedAt: new Date() 
        })
        .where(eq(featureFlags.id, existing.id));
      console.log(`  ⬆️  Updated flag: ${flag.flagName}`);
      flagsUpdated++;
    } else {
      await db.insert(featureFlags).values(flag);
      console.log(`  ✅ Created flag: ${flag.flagName}`);
      flagsCreated++;
    }
  }

  // Widget Configurations - Default widgets
  const widgets = [
    {
      tenantId,
      widgetType: "floating-assessment",
      enabled: true,
      position: "bottom-right",
      settings: JSON.stringify({
        buttonText: "Take Assessment",
        icon: "clipboard-list",
        color: "primary",
      }),
    },
    {
      tenantId,
      widgetType: "exit-intent",
      enabled: false,
      position: "center",
      settings: JSON.stringify({
        title: "Wait! Before you go...",
        description: "Get our free GTM assessment",
        delay: 3000,
      }),
    },
  ];

  let widgetsCreated = 0;
  let widgetsUpdated = 0;

  for (const widget of widgets) {
    const existing = await db.query.widgetConfig.findFirst({
      where: and(
        eq(widgetConfig.tenantId, tenantId),
        eq(widgetConfig.widgetType, widget.widgetType)
      ),
    });

    if (existing) {
      await db.update(widgetConfig)
        .set({ 
          enabled: widget.enabled,
          position: widget.position,
          settings: widget.settings,
          updatedAt: new Date() 
        })
        .where(eq(widgetConfig.id, existing.id));
      console.log(`  ⬆️  Updated widget: ${widget.widgetType}`);
      widgetsUpdated++;
    } else {
      await db.insert(widgetConfig).values(widget);
      console.log(`  ✅ Created widget: ${widget.widgetType}`);
      widgetsCreated++;
    }
  }

  // Default Testimonials
  const testimonialsData = [
    {
      tenantId,
      name: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow",
      quote: "We went from 2-3 qualified meetings per month to 20+ in the first 60 days. The system just works.",
      rating: 5,
      featured: true,
    },
    {
      tenantId,
      name: "Marcus Johnson",
      title: "Founder & CEO",
      company: "DataPulse",
      quote: "Finally, predictable pipeline. The GTM engine delivered exactly what they promised—and the ROI is insane.",
      rating: 5,
      featured: true,
    },
    {
      tenantId,
      name: "Emily Rodriguez",
      title: "Head of Growth",
      company: "CloudScale",
      quote: "Revenue Party built us a complete revenue system in 2 weeks. What took our competitors 6 months to figure out.",
      rating: 5,
      featured: true,
    },
  ];

  let testimonialsCreated = 0;

  for (const testimonial of testimonialsData) {
    const existing = await db.query.testimonials.findFirst({
      where: and(
        eq(testimonials.tenantId, tenantId),
        eq(testimonials.name, testimonial.name),
        eq(testimonials.company, testimonial.company)
      ),
    });

    if (!existing) {
      await db.insert(testimonials).values(testimonial);
      console.log(`  ✅ Created testimonial: ${testimonial.name}`);
      testimonialsCreated++;
    } else {
      console.log(`  ⏭️  Skipped testimonial: ${testimonial.name} (exists)`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Feature Flags: ${flagsCreated} created, ${flagsUpdated} updated`);
  console.log(`   Widgets: ${widgetsCreated} created, ${widgetsUpdated} updated`);
  console.log(`   Testimonials: ${testimonialsCreated} created`);

  return {
    flags: { created: flagsCreated, updated: flagsUpdated },
    widgets: { created: widgetsCreated, updated: widgetsUpdated },
    testimonials: { created: testimonialsCreated },
  };
}

// Can be run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "revenueparty-default";
  
  seedProductionConfigs(DEFAULT_TENANT_ID)
    .then((result) => {
      console.log(`\n✅ Configuration seeding complete!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

