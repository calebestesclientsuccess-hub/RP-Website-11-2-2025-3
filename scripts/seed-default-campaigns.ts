import { db } from "../server/db";
import { campaigns, tenants } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_TENANT_ID = "tnt_revenueparty_default";

const zones = ["zone-1", "zone-2", "zone-3", "zone-4", "zone-5", "zone-6"];

async function ensureTenant() {
  const existing = await db.query.tenants.findFirst({
    where: (t, { eq }) => eq(t.id, DEFAULT_TENANT_ID),
  });
  if (!existing) {
    await db.insert(tenants).values({
      id: DEFAULT_TENANT_ID,
      name: "Revenue Party",
      slug: "revenueparty",
    });
    console.log(`✅ Created tenant ${DEFAULT_TENANT_ID}`);
  } else {
    console.log(`ℹ️ Tenant ${DEFAULT_TENANT_ID} already exists`);
  }
}

async function upsertDefaultCampaigns() {
  console.log("📋 Ensuring default campaigns for home page zones...");

  for (const zone of zones) {
    const existing = await db.query.campaigns.findFirst({
      where: (c, { eq, and }) =>
        and(eq(c.tenantId, DEFAULT_TENANT_ID), eq(c.targetZone, zone)),
    });

    if (existing) {
      console.log(`ℹ️ Campaign already exists for ${zone}: ${existing.id}`);
      continue;
    }

    const [created] = await db
      .insert(campaigns)
      .values({
        tenantId: DEFAULT_TENANT_ID,
        campaignName: `Default ${zone} blog-feed`,
        contentType: "blog-feed",
        displayAs: "inline",
        displaySize: "standard",
        targetPages: ["home"],
        targetZone: zone,
        isActive: true,
        theme: "auto",
        size: "medium",
      })
      .returning();

    console.log(`✅ Created campaign for ${zone}: ${created.id}`);
  }
}

async function main() {
  try {
    await ensureTenant();
    await upsertDefaultCampaigns();
    console.log("✅ Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
}

main();


