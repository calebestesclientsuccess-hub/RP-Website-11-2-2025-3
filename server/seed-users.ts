import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";

const userAccounts = [
  {
    username: "Caleb@RevenueParty.com",
    email: "Caleb@RevenueParty.com",
    role: "super_user",
  },
  {
    username: "admin@RevenueParty.com",
    email: "admin@RevenueParty.com",
    role: "manager",
  },
  {
    username: "mariya@RevenueParty.com",
    email: "mariya@RevenueParty.com",
    role: "manager",
  },
  {
    username: "muneeb@RevenueParty.com",
    email: "muneeb@RevenueParty.com",
    role: "manager",
  },
  {
    username: "danyal@RevenueParty.com",
    email: "danyal@RevenueParty.com",
    role: "manager",
  },
  {
    username: "sofia@RevenueParty.com",
    email: "sofia@RevenueParty.com",
    role: "manager",
  },
];

async function seedUsers() {
  console.log("Starting user account creation...");
  
  const temporaryPassword = "RevenueParty2024!";
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  for (const account of userAccounts) {
    try {
      const [user] = await db.insert(users).values({
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
  console.log("All accounts use temporary password: RevenueParty2024!");
  console.log("Please use 'Forgot Password' to set your own secure password.");
  console.log("\nAccounts created:");
  console.log("- Caleb@RevenueParty.com (Super User)");
  console.log("- admin@RevenueParty.com (Manager)");
  console.log("- mariya@RevenueParty.com (Manager)");
  console.log("- muneeb@RevenueParty.com (Manager)");
  console.log("- danyal@RevenueParty.com (Manager)");
  console.log("- sofia@RevenueParty.com (Manager)");
  
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error("Seed script failed:", error);
  process.exit(1);
});
