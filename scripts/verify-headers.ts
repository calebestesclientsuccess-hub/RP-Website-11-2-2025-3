import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(projectRoot, "dist");
const assetsDir = path.join(distDir, "assets");
const PORT = process.env.VERIFY_PORT || "5050";
const BASE_URL = `http://127.0.0.1:${PORT}`;
const HASH_PATTERN = /\.[a-f0-9]{8,}\./i;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function runBuild() {
  console.info("Running production build before header verification...");
  execSync("npm run build", {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

function chooseHashedAsset() {
  assert(fs.existsSync(assetsDir), "dist/assets missing; run build first.");
  const candidates = fs
    .readdirSync(assetsDir)
    .filter((file) => file.endsWith(".js") && HASH_PATTERN.test(file));
  assert(candidates.length > 0, "Could not find a hashed JS asset inside dist/assets.");
  return `/assets/${candidates[0]}`;
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Server did not become ready on port ${PORT}: ${String(lastError)}`);
}

function startServer() {
  console.info(`Starting production server on port ${PORT}...`);
  const serverProcess = spawn("npm", ["start"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT,
      NODE_ENV: "production",
    },
    stdio: "inherit",
  });
  return serverProcess;
}

async function fetchWithDetails(pathname: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${pathname}`, init);
  const body = await res.text();
  return { res, body };
}

function assertCacheControl(header: string | null, expectations: string[]) {
  assert(header, "Missing Cache-Control header");
  for (const token of expectations) {
    assert(header.toLowerCase().includes(token), `Cache-Control missing "${token}" (got "${header}")`);
  }
}

async function verifyIndexHeaders() {
  console.info("Verifying index.html cache headers...");
  const { res } = await fetchWithDetails("/", {
    headers: { Accept: "text/html" },
  });
  assert(res.ok, `GET / failed with status ${res.status}`);

  const cacheControl = res.headers.get("cache-control");
  assertCacheControl(cacheControl, ["no-store", "max-age=0"]);
}

async function verifyAssetHeaders(assetPath: string) {
  console.info(`Verifying asset cache headers for ${assetPath}...`);
  const { res } = await fetchWithDetails(assetPath);
  assert(res.ok, `GET ${assetPath} failed with status ${res.status}`);

  const cacheControl = res.headers.get("cache-control");
  assertCacheControl(cacheControl, ["immutable", "max-age=31536000"]);
}

async function verifyApiHeaders() {
  console.info("Verifying API cache headers for /api/health...");
  const { res } = await fetchWithDetails("/api/health");
  assert(res.ok, `/api/health failed with status ${res.status}`);

  const cacheControl = res.headers.get("cache-control");
  assertCacheControl(cacheControl, ["no-store"]);
}

async function main() {
  let serverProcess: ReturnType<typeof startServer> | undefined;
  try {
    runBuild();
    const assetPath = chooseHashedAsset();
    serverProcess = startServer();
    await waitForServer();

    await verifyIndexHeaders();
    await verifyAssetHeaders(assetPath);
    await verifyApiHeaders();

    console.info("✅ Header verification passed.");
  } catch (error) {
    console.error("❌ Header verification failed:", error);
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      console.info("Stopping production server...");
      serverProcess.kill("SIGINT");
    }
  }
}

main();

