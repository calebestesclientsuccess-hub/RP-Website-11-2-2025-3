/**
 * Entry point that registers ESM loader to patch Vite
 * This solves the "Blocked request" error for Replit domains
 */

// Register the loader hook programmatically (Node.js v20.6+)
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const loaderPath = path.resolve(import.meta.dirname, 'register-loader.mjs');
console.log('[server] Registering ESM loader to patch Vite:', loaderPath);

register(pathToFileURL(loaderPath).href, {
  parentURL: import.meta.url,
});

console.log('[server] Loader registered, now loading application');

// Now dynamically import the actual application
// The loader will patch vite before server/vite.ts imports it
await import('./app.js');
