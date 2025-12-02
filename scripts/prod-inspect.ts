import { Client } from "pg";

const connectionString = process.env.PROD_DATABASE_URL;

if (!connectionString) {
  console.error("Missing PROD_DATABASE_URL environment variable.");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("=== Tenants ===");
    const tenants = await client.query(
      "SELECT id, name, slug, created_at FROM tenants ORDER BY created_at ASC"
    );
    console.table(tenants.rows);

    console.log("\n=== Admin Users (admin@revenueparty.com) ===");
    const admins = await client.query(
      "SELECT id, tenant_id, username, email, role FROM users WHERE email = $1 ORDER BY tenant_id ASC",
      ["admin@revenueparty.com"]
    );
    console.table(admins.rows);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Failed to inspect production DB:", err);
  process.exit(1);
});

