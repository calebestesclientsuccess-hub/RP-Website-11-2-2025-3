import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(projectRoot, "dist");
const assetsDir = path.join(distDir, "assets");

const HASH_PATTERN = /[-.][A-Za-z0-9_-]{8,}\.(?:js|css)$/;
const JS_CSS_EXT = /\.(?:js|css)$/i;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function runBuild() {
  console.info("Running production build...");
  execSync("npm run build", {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
  });
}

function verifyIndexFile() {
  const indexPath = path.join(distDir, "index.html");
  console.info(`Checking for ${indexPath}`);
  assert(fs.existsSync(indexPath), "dist/index.html is missing after build.");

  const contents = fs.readFileSync(indexPath, "utf-8");
  assert(/<div id="root"><\/div>/i.test(contents), "index.html is missing the #root mount point.");
}

function verifyAssetHashes() {
  console.info("Scanning dist/assets for hashed filenames...");
  assert(fs.existsSync(assetsDir), "dist/assets directory is missing.");

  const entries = fs.readdirSync(assetsDir);
  assert(entries.length > 0, "dist/assets directory is empty.");

  const jsCssFiles = entries.filter((entry) => JS_CSS_EXT.test(entry));
  assert(jsCssFiles.length > 0, "No JS/CSS assets were emitted.");

  const unHashed = jsCssFiles.filter((entry) => !HASH_PATTERN.test(entry));
  assert(
    unHashed.length === 0,
    `The following assets are missing content hashes: ${unHashed.join(", ")}`,
  );
}

function verifySourceMapsPolicy() {
  const expectation = process.env.EXPECT_SOURCEMAPS;
  if (!expectation) {
    console.info("EXPECT_SOURCEMAPS not set; skipping source map verification.");
    return;
  }

  const mapFiles = fs.existsSync(assetsDir)
    ? fs.readdirSync(assetsDir).filter((entry) => entry.endsWith(".map"))
    : [];

  if (expectation === "true") {
    assert(mapFiles.length > 0, "EXPECT_SOURCEMAPS=true but no source maps were emitted.");
  } else if (expectation === "false") {
    assert(mapFiles.length === 0, "EXPECT_SOURCEMAPS=false but source maps were emitted.");
  } else {
    console.warn(`Unknown EXPECT_SOURCEMAPS value "${expectation}"; skipping check.`);
  }
}

function main() {
  try {
    runBuild();
    verifyIndexFile();
    verifyAssetHashes();
    verifySourceMapsPolicy();
    console.info("✅ Build output verification passed.");
  } catch (error) {
    console.error("❌ Build output verification failed:", error);
    process.exit(1);
  }
}

main();

