import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorker } from "@/components/ServiceWorker";
import App from './App';
import './index.css';
import { ThemeProvider } from "./components/ThemeProvider";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ServiceWorker />
          <App />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);