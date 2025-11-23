import { spawnSync } from "node:child_process";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  console.error(
    "[test:setup] TEST_DATABASE_URL is not defined. Set it before running this command.",
  );
  process.exit(1);
}

const cli = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(cli, ["drizzle-kit", "push"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
  },
});

if (result.status !== 0) {
  console.error("[test:setup] drizzle-kit push failed.");
  process.exit(result.status ?? 1);
}

console.log("[test:setup] Database migrations applied to test database.");

