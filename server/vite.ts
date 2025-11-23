import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { logger } from "./lib/logger";

const viteLogger = createLogger();

/**
 * @deprecated Use logger.info() from './lib/logger' instead
 */
export function log(message: string, source = "express") {
  logger.info(message, { module: source });
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      middlewareMode: true,
      hmr: {
        server,
        protocol: 'wss',
        timeout: 30000,
        overlay: true
      },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      // Inject CSP nonce into inline JSON-LD scripts
      const nonce = res.locals.cspNonce as string | undefined;
      if (nonce) {
        template = template.replace(
          /<script([^>]*)type="application\/ld\+json"([^>]*)>/g,
          `<script$1type="application/ld+json"$2 nonce="${nonce}">`,
        );
      }
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist");

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