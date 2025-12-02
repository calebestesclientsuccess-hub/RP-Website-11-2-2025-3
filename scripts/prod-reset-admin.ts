import { Client } from "pg";
import bcrypt from "bcryptjs";
import { PASSWORD_HASH_ROUNDS } from "../server/utils/password-validator";

const connectionString = process.env.PROD_DATABASE_URL;
const adminEmail = (process.env.ADMIN_EMAIL || "admin@revenueparty.com").toLowerCase();
const tenantId = process.env.TENANT_ID || process.env.PROD_TENANT_ID || "dev_local_tenant";
const newPassword = process.env.ADMIN_PASSWORD || "test1234";

if (!connectionString) {
  console.error("Missing PROD_DATABASE_URL environment variable.");
  process.exit(1);
}

async function main() {
  const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log(`Updating admin password for tenant "${tenantId}"...`);
    const updateResult = await client.query(
      "UPDATE users SET password = $1 WHERE LOWER(email) = $2 AND tenant_id = $3 RETURNING id, tenant_id",
      [hashedPassword, adminEmail, tenantId]
    );

    if (updateResult.rowCount === 0) {
      console.warn("No admin user found to update.");
    } else {
      console.table(updateResult.rows);
      console.log("✅ Password updated.");
    }

    console.log("Clearing login attempts for this admin...");
    const deleteResult = await client.query(
      "DELETE FROM login_attempts WHERE identifier ILIKE $1 RETURNING identifier",
      [`${adminEmail}%`]
    );
    console.log(`Deleted ${deleteResult.rowCount} login attempt records.`);
  } finally {
    await client.end();
  }

  console.log("Done. New password is set to:", newPassword);
}

main().catch((err) => {
  console.error("Failed to reset admin password:", err);
  process.exit(1);
});

