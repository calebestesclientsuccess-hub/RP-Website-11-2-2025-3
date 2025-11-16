import { createRoot } from "react-dom/client";
import React from "react";
import App from './App';
import './index.css';
import { initWebVitals } from "./lib/web-vitals";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Web Vitals tracking
if (typeof window !== 'undefined') {
  initWebVitals();
}