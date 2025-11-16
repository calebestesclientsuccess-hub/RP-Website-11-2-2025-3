// This file MUST be imported first to set environment variables before Vite initialization
if (!process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS) {
  process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = '.riker.replit.dev,.replit.dev';
}

// Log the value for debugging
console.log('[env-setup] __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS:', process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS);
