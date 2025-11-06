
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function resetPassword() {
  const username = "caleb@revenueparty.com";
  const newPassword = "TempPassword123!";
  
  console.log(`Resetting password for: ${username}`);
  
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update the user's password
  const result = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.username, username))
    .returning();
  
  if (result.length > 0) {
    console.log(`✅ Password successfully reset for ${username}`);
    console.log(`New password: ${newPassword}`);
    console.log(`⚠️  Please change this password after logging in!`);
  } else {
    console.log(`❌ User not found: ${username}`);
  }
  
  process.exit(0);
}

resetPassword().catch(console.error);
