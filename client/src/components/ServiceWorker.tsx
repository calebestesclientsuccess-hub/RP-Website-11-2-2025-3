import { useEffect } from 'react';

/**
 * Service Worker Management
 * 
 * If PWA features are not required, this component will unregister
 * any existing service workers to prevent stale cache issues.
 * 
 * To enable PWA features, set ENABLE_PWA=true in your environment.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const enablePWA = process.env.VITE_ENABLE_PWA === 'true' || false;

    if (enablePWA && process.env.NODE_ENV === 'production') {
      // Register service worker for PWA features
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to reload
                  console.log('New service worker available. Reload to update.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    } else {
      // Unregister all service workers to prevent stale cache issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length > 0) {
          console.log(`Unregistering ${registrations.length} service worker(s) to prevent cache issues...`);
          Promise.all(
            registrations.map((registration) => {
              return registration.unregister().then((success) => {
                if (success) {
                  console.log('Service worker unregistered successfully');
                }
                return success;
              });
            })
          ).then(() => {
            // Clear all caches after unregistering
            if ('caches' in window) {
              caches.keys().then((cacheNames) => {
                return Promise.all(
                  cacheNames.map((cacheName) => {
                    console.log(`Deleting cache: ${cacheName}`);
                    return caches.delete(cacheName);
                  })
                );
              }).then(() => {
                console.log('All service worker caches cleared');
              });
            }
          });
        }
      });
    }
  }, []);

  return null;
}
