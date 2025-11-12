
import { db } from "../server/db";
import { featureFlags } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";

async function seedFeatureFlags() {
  console.log("Seeding feature flags...");

  try {
    await db.insert(featureFlags).values([
      {
        tenantId: DEFAULT_TENANT_ID,
        flagKey: "revenue-architecture-playbook",
        flagName: "Revenue Architecture Playbook",
        description: "Show/hide the playbook lead magnet on the home page",
        enabled: true,
      },
      {
        tenantId: DEFAULT_TENANT_ID,
        flagKey: "theme-toggle",
        flagName: "Theme Toggle Button",
        description: "Show/hide the light/dark mode theme toggle button",
        enabled: true,
      },
    ]).onConflictDoNothing();

    console.log("Feature flags seeded successfully!");
  } catch (error) {
    console.error("Error seeding feature flags:", error);
    throw error;
  }
}

seedFeatureFlags()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
