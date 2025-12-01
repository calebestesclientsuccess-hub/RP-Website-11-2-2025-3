import { db } from '../server/db';
import bcrypt from "bcryptjs";
import { tenants, users, companies } from '../shared/schema';
import { PASSWORD_HASH_ROUNDS } from "../server/utils/password-validator";
import { eq, and } from "drizzle-orm";

const tenantId = process.argv[2] || "revenueparty-default";

async function seedProductionUser() {
  try {
    console.log('🚀 Seeding production database...');
    console.log(`📍 Database: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
    console.log(`📍 Tenant ID: ${tenantId}\n`);

    // 1. Create/check tenant
    const existingTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    
    if (existingTenant.length === 0) {
      // Use a unique slug for this tenant
      const slug = tenantId === "revenueparty-default" ? "revenueparty-prod" : tenantId.replace(/_/g, '-');
      await db.insert(tenants).values({
        id: tenantId,
        name: "Revenue Party",
        slug: slug,
      });
      console.log(`✅ Created tenant: ${tenantId} (slug: ${slug})`);
    } else {
      console.log(`ℹ️  Tenant ${tenantId} already exists`);
    }

    // 2. Create admin user
    const email = "admin@revenueparty.com";
    const existingUser = await db.select().from(users)
      .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
      .limit(1);

    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash("test1234", PASSWORD_HASH_ROUNDS);
      await db.insert(users).values({
        tenantId: tenantId,
        username: email,
        email: email,
        password: hashedPassword,
        role: "manager",
      });
      console.log(`✅ Created user: ${email} (password: test1234)`);
    } else {
      console.log(`ℹ️  User ${email} already exists`);
    }

    // 3. Create test company
    const testDomain = "example.com";
    const existingCompany = await db.select().from(companies)
      .where(and(eq(companies.domain, testDomain), eq(companies.tenantId, tenantId)))
      .limit(1);

    if (existingCompany.length === 0) {
      await db.insert(companies).values({
        tenantId: tenantId,
        name: "Example Corp",
        domain: testDomain,
        industry: "Technology",
        website: "https://example.com",
      });
      console.log(`✅ Created company: Example Corp`);
    } else {
      console.log(`ℹ️  Company Example Corp already exists`);
    }

    console.log('\n🎉 Production seed complete!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: test1234`);
    console.log(`   Tenant: ${tenantId}`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedProductionUser();

