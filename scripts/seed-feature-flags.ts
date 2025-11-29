
import { db } from "../server/db";
import { featureFlags } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";
import { featureFlagList } from "@shared/feature-flags";

async function seedFeatureFlags() {
  console.log("Seeding feature flags...");

  try {
    const values = featureFlagList.map((definition) => ({
      tenantId: DEFAULT_TENANT_ID,
      flagKey: definition.key,
      flagName: definition.name,
      description: definition.description,
      enabled: definition.defaultEnabled,
    }));

    await db.insert(featureFlags).values(values).onConflictDoNothing();

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
