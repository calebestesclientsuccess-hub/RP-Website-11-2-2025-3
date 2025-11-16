import { createRoot } from "react-dom/client";
import React from "react";
import App from './App';
import './index.css';
import { initWebVitals } from "./lib/web-vitals";

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