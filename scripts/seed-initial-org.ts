import { db } from "../server/db";
import { tenants, users, companies } from "@shared/schema";
import { DEFAULT_TENANT_ID } from "../server/middleware/tenant";
import bcrypt from "bcryptjs";
import { PASSWORD_HASH_ROUNDS } from "../server/utils/password-validator";
import { eq } from "drizzle-orm";

async function seedInitialOrg() {
  console.log("Seeding initial organization...");

  try {
    // 1. Seed Tenant
    const existingTenant = await db.query.tenants.findFirst({
      where: (t, { eq }) => eq(t.id, DEFAULT_TENANT_ID),
    });

    if (!existingTenant) {
      await db.insert(tenants).values({
        id: DEFAULT_TENANT_ID,
        name: "Revenue Party",
        slug: "revenueparty",
      });
      console.log(`✅ Created tenant: ${DEFAULT_TENANT_ID}`);
    } else {
      console.log(`ℹ️ Tenant ${DEFAULT_TENANT_ID} already exists`);
    }

    // 2. Seed User
    const email = "admin@revenueparty.com";
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq, and }) => and(eq(u.email, email), eq(u.tenantId, DEFAULT_TENANT_ID)),
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("test1234", PASSWORD_HASH_ROUNDS);
      await db.insert(users).values({
        tenantId: DEFAULT_TENANT_ID,
        username: email,
        email: email,
        password: hashedPassword,
        role: "manager",
      });
      console.log(`✅ Created user: ${email} (password: test1234)`);
    } else {
      // Force update password to ensure it matches
      const hashedPassword = await bcrypt.hash("test1234", PASSWORD_HASH_ROUNDS);
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, existingUser.id));
      console.log(`✅ Updated password for user: ${email} to test1234`);
    }

    // 3. Seed Company
    const testDomain = "example.com";
    const existingCompany = await db.query.companies.findFirst({
      where: (c, { eq, and }) => and(eq(c.domain, testDomain), eq(c.tenantId, DEFAULT_TENANT_ID)),
    });

    if (!existingCompany) {
      await db.insert(companies).values({
        tenantId: DEFAULT_TENANT_ID,
        name: "Example Corp",
        domain: testDomain,
        industry: "Technology",
        website: "https://example.com",
      });
      console.log(`✅ Created company: Example Corp`);
    } else {
      console.log(`ℹ️ Company Example Corp already exists`);
    }

    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedInitialOrg();

