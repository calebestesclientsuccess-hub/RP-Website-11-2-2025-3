import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { logger } from "./lib/logger";

/**
 * @deprecated Use logger.info() from './lib/logger' instead
 */
export function log(message: string, source = "express") {
  logger.info(message, { module: source });
}

export function serveStatic(app: Express) {
  // In production, the bundled file is in dist/server/app.js
  // So import.meta.dirname is dist/server, and we need to go up one level to dist
  // In development, import.meta.dirname is server, and we need to go up one level then into dist
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = isProduction 
    ? path.resolve(import.meta.dirname, "..")  // dist/server -> dist
    : path.resolve(import.meta.dirname, "..", "dist");  // server -> project/dist

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to run "npm run build" before starting the server.`,
    );
  }

  const hashedAssetPattern = /\.[a-f0-9]{8,}\./i;
  const longLivedAssetPattern = /\.(?:js|mjs|css|json|txt|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|ico|mp4|mp3|webm)$/i;

  const applyIndexNoStore = (res: Response) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  };

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(`${path.sep}index.html`)) {
          applyIndexNoStore(res);
          return;
        }

        const basename = path.basename(filePath);
        if (hashedAssetPattern.test(basename)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        if (longLivedAssetPattern.test(basename)) {
          res.setHeader("Cache-Control", "public, max-age=604800, must-revalidate");
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
      },
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use("*", async (_req, res) => {
    applyIndexNoStore(res);
    const indexPath = path.resolve(distPath, "index.html");
    
    // Inject CSP nonce into inline JSON-LD scripts
    const nonce = res.locals.cspNonce as string | undefined;
    if (nonce) {
      try {
        let html = await fs.promises.readFile(indexPath, "utf-8");
        html = html.replace(
          /<script([^>]*)type="application\/ld\+json"([^>]*)>/g,
          `<script$1type="application/ld+json"$2 nonce="${nonce}">`,
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
        return;
      } catch (error) {
        logger.error("Failed to inject CSP nonce into index.html", { error });
        // Fall back to sendFile if injection fails
      }
    }
    
    res.sendFile(indexPath);
  });
}

