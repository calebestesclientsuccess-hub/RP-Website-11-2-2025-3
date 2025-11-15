
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function fixUserTenant() {
  console.log("Fixing user tenant_id and resetting password...");
  
  const DEFAULT_TENANT_ID = "default";
  
  try {
    // Update all users without tenant_id to use default tenant
    const allUsers = await db.select().from(users);
    
    for (const user of allUsers) {
      const updates: any = {};
      
      // Set tenant_id if missing
      if (!user.tenantId) {
        updates.tenantId = DEFAULT_TENANT_ID;
      }
      
      // Reset password to test1234
      const hashedPassword = await bcrypt.hash("test1234", 10);
      updates.password = hashedPassword;
      
      await db.update(users)
        .set(updates)
        .where(eq(users.id, user.id));
      
      console.log(`✓ Updated user: ${user.username} (tenant: ${DEFAULT_TENANT_ID}, password: test1234)`);
    }
    
    console.log("\n✓ All users updated successfully!");
    console.log("You can now login with password: test1234");
    
  } catch (error) {
    console.error("Error fixing users:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

fixUserTenant();
