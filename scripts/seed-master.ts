import { seedProductionAIPrompts } from "./seed-production-ai-prompts";
import { seedProductionConfigs } from "./seed-production-configs";
import { seedProductionBlogs } from "./seed-production-blogs";

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || "revenueparty-default";

async function seedAll() {
  console.log("🚀 Starting master seed process...\n");
  console.log(`Using tenant ID: ${DEFAULT_TENANT_ID}\n`);

  const results: any = {};

  try {
    // 1. AI Prompts (critical foundation)
    console.log("═".repeat(60));
    console.log("STEP 1: AI Prompt Templates");
    console.log("═".repeat(60));
    results.aiPrompts = await seedProductionAIPrompts();
    console.log("");

    // 2. System Configurations
    console.log("═".repeat(60));
    console.log("STEP 2: System Configurations");
    console.log("═".repeat(60));
    results.configs = await seedProductionConfigs(DEFAULT_TENANT_ID);
    console.log("");

    // 3. Blog Content
    console.log("═".repeat(60));
    console.log("STEP 3: Blog Posts");
    console.log("═".repeat(60));
    results.blogs = await seedProductionBlogs(DEFAULT_TENANT_ID);
    console.log("");

    // Summary
    console.log("═".repeat(60));
    console.log("🎉 MASTER SEED COMPLETE!");
    console.log("═".repeat(60));
    console.log("\n📊 Final Summary:");
    console.log("\nAI Prompts:");
    console.log(`  ✅ Created: ${results.aiPrompts.created}`);
    console.log(`  ⬆️  Updated: ${results.aiPrompts.updated}`);
    console.log(`  ⏭️  Skipped: ${results.aiPrompts.skipped}`);
    
    console.log("\nConfigurations:");
    console.log(`  Feature Flags: ${results.configs.flags.created} created, ${results.configs.flags.updated} updated`);
    console.log(`  Widgets: ${results.configs.widgets.created} created, ${results.configs.widgets.updated} updated`);
    console.log(`  Testimonials: ${results.configs.testimonials.created} created`);
    
    console.log("\nBlog Posts:");
    console.log(`  ✅ Created: ${results.blogs.created}`);
    console.log(`  ⬆️  Updated: ${results.blogs.updated}`);
    
    console.log("\n✨ Your production environment is ready!");
    console.log("═".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Master seed failed:", error);
    console.error("\nPartial results:", results);
    process.exit(1);
  }
}

seedAll();

