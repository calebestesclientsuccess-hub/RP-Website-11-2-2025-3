import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { PASSWORD_HASH_ROUNDS } from "./utils/password-validator";
import { DEFAULT_TENANT_ID } from "./middleware/tenant";

const userAccounts = [
  {
    username: "caleb@revenueparty.com",
    email: "caleb@revenueparty.com",
    role: "super_user",
  },
  {
    username: "admin@revenueparty.com",
    email: "admin@revenueparty.com",
    role: "manager",
  },
  {
    username: "mariya@revenueparty.com",
    email: "mariya@revenueparty.com",
    role: "manager",
  },
  {
    username: "muneeb@revenueparty.com",
    email: "muneeb@revenueparty.com",
    role: "manager",
  },
  {
    username: "danyal@revenueparty.com",
    email: "danyal@revenueparty.com",
    role: "manager",
  },
  {
    username: "sofia@revenueparty.com",
    email: "sofia@revenueparty.com",
    role: "manager",
  },
];

async function seedUsers() {
  console.log("Starting user account creation...");
  
  const temporaryPassword = "test1234";
  const hashedPassword = await bcrypt.hash(temporaryPassword, PASSWORD_HASH_ROUNDS);
  
  for (const account of userAccounts) {
    try {
      const [user] = await db.insert(users).values({
        tenantId: DEFAULT_TENANT_ID,
        username: account.username,
        email: account.email,
        password: hashedPassword,
        role: account.role,
      }).returning();
      
      console.log(`✓ Created ${account.role} account: ${account.email}`);
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`→ Account already exists: ${account.email}`);
      } else {
        console.error(`✗ Failed to create ${account.email}:`, error.message);
      }
    }
  }
  
  console.log("\n=== USER ACCOUNTS CREATED ===");
  console.log("All accounts use temporary password: test1234");
  console.log("Please use 'Forgot Password' to set your own secure password.");
  console.log("\nAccounts created:");
  console.log("- caleb@revenueparty.com (Super User)");
  console.log("- admin@revenueparty.com (Manager)");
  console.log("- mariya@revenueparty.com (Manager)");
  console.log("- muneeb@revenueparty.com (Manager)");
  console.log("- danyal@revenueparty.com (Manager)");
  console.log("- sofia@revenueparty.com (Manager)");
  
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
