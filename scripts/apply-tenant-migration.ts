
import { db } from "../server/db";
import { tenants, users } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

const DEFAULT_TENANT_ID = 'tnt_revenueparty_default';

async function applyTenantMigration() {
  console.log("🔍 Checking database state...\n");

  try {
    // Step 1: Ensure default tenant exists
    console.log("Step 1: Verifying default tenant...");
    const [existingTenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, DEFAULT_TENANT_ID))
      .limit(1);

    if (!existingTenant) {
      console.log("  ⚠️  Default tenant not found. Creating...");
      await db.insert(tenants).values({
        id: DEFAULT_TENANT_ID,
        name: 'Revenue Party',
        slug: 'default',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("  ✅ Default tenant created");
    } else {
      console.log("  ✅ Default tenant already exists");
    }

    // Step 2: Check if tenant_id column exists
    console.log("\nStep 2: Checking if tenant_id column exists...");
    try {
      await db.execute(sql`SELECT tenant_id FROM users LIMIT 1`);
      console.log("  ✅ tenant_id column already exists - migration already applied");
      console.log("\n✨ Migration check complete - no changes needed");
      process.exit(0);
    } catch (error: any) {
      if (error.code === '42703') {
        console.log("  ⚠️  tenant_id column does not exist - applying migration...");
      } else {
        throw error;
      }
    }

    // Step 3: Apply the migration
    console.log("\nStep 3: Applying migration...");
    
    // Add tenant_id column with default value
    await db.execute(sql`
      ALTER TABLE "users" 
      ADD COLUMN "tenant_id" varchar NOT NULL DEFAULT 'tnt_revenueparty_default'
    `);
    console.log("  ✅ Added tenant_id column");

    // Add foreign key constraint
    await db.execute(sql`
      ALTER TABLE "users" 
      ADD CONSTRAINT "users_tenant_id_tenants_id_fk" 
      FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") 
      ON DELETE no action ON UPDATE no action
    `);
    console.log("  ✅ Added foreign key constraint");

    // Add unique constraint for username per tenant
    await db.execute(sql`
      ALTER TABLE "users" 
      ADD CONSTRAINT "users_tenant_id_username_unique" 
      UNIQUE("tenant_id", "username")
    `);
    console.log("  ✅ Added username uniqueness constraint");

    // Add unique constraint for email per tenant
    await db.execute(sql`
      ALTER TABLE "users" 
      ADD CONSTRAINT "users_tenant_id_email_unique" 
      UNIQUE("tenant_id", "email")
    `);
    console.log("  ✅ Added email uniqueness constraint");

    // Step 4: Verify migration success
    console.log("\nStep 4: Verifying migration...");
    const columnCheck = await db.execute(sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'tenant_id'
    `);
    
    if (columnCheck.rows && columnCheck.rows.length > 0) {
      console.log("  ✅ Migration verified successfully");
      console.log("  Column details:", columnCheck.rows[0]);
    } else {
      throw new Error("Migration verification failed - column not found");
    }

    // Step 5: Check existing users
    console.log("\nStep 5: Checking existing users...");
    const allUsers = await db.select().from(users);
    console.log(`  ℹ️  Found ${allUsers.length} user(s)`);
    
    if (allUsers.length > 0) {
      console.log("  All users have been assigned tenant_id:", DEFAULT_TENANT_ID);
      allUsers.forEach(user => {
        console.log(`    - ${user.username}: ${user.tenantId}`);
      });
    }

    console.log("\n✨ Migration applied successfully!");
    console.log("🎉 Authentication should now work correctly\n");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

applyTenantMigration();
