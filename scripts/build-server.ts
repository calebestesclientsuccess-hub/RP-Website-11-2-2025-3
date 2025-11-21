import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Building server...");

try {
  await build({
    entryPoints: [path.resolve(__dirname, "../server/app.ts")],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outdir: path.resolve(__dirname, "../dist/server"),
    packages: "external", // Do not bundle dependencies
    sourcemap: true,
    logLevel: "info",
  });
  console.log("Server build completed successfully.");
} catch (error) {
  console.error("Server build failed:", error);
  process.exit(1);
}

