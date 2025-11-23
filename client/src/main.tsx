import { createRoot } from "react-dom/client";
import React from "react";
import App from './App';
import './index.css';
import { initWebVitals } from "./lib/web-vitals";

const SW_CLEANUP_FLAG = "__revparty_sw_cleanup__";
const STORAGE_TEST_KEY = "__revparty_storage_test__";

function getSafeSessionStorage(): Storage | null {
  if (typeof window === "undefined" || typeof window.sessionStorage === "undefined") {
    return null;
  }

  try {
    window.sessionStorage.setItem(STORAGE_TEST_KEY, "1");
    window.sessionStorage.removeItem(STORAGE_TEST_KEY);
    return window.sessionStorage;
  } catch (error) {
    console.warn("[Storage] sessionStorage unavailable:", error);
    return null;
  }
}

function unregisterLegacyServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const storage = getSafeSessionStorage();

  const cleanup = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        return;
      }

      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
      }

      storage?.setItem(SW_CLEANUP_FLAG, new Date().toISOString());
      console.info("[ServiceWorker] Unregistered legacy service workers to prevent stale caches.");
    } catch (error) {
      console.warn("[ServiceWorker] Cleanup failed:", error);
    }
  };

  const hasRun = storage?.getItem(SW_CLEANUP_FLAG);
  if (!hasRun) {
    if (document.readyState === "complete") {
      void cleanup();
    } else {
      window.addEventListener(
        "load",
        () => {
          void cleanup();
        },
        { once: true },
      );
    }
  }
}

unregisterLegacyServiceWorkers();

function registerServiceWorker() {
  if (import.meta.env.DEV || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.info("[ServiceWorker] Registered:", registration.scope);
        })
        .catch((error) => {
          console.error("[ServiceWorker] Registration failed:", error);
        });
    },
    { once: true },
  );
}

registerServiceWorker();

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found');
  }

  console.log('🚀 Mounting React App...');

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Initialize Web Vitals tracking
  if (typeof window !== 'undefined') {
    initWebVitals();
  }
} catch (error) {
  console.error('Failed to initialize app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui;">
      <h1>Application Error</h1>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
    </div>
  `;
}