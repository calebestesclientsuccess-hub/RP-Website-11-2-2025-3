# Production Serving Logic Refactor

## Overview

This document outlines the comprehensive refactor of production serving logic to eliminate "Stale Index" issues, aggressive mobile caching, and inconsistent behavior across user sessions.

## Changes Implemented

### 1. Server-Side Cache-Control Strategy (Split-Strategy)

**Files Modified:**
- `server/middleware/compression.ts`
- `server/vite.ts`

**Implementation:**
- **Entry Point (`index.html`)**: Serves with `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`
  - Ensures browser always fetches the latest asset manifest
  - Prevents "Stale Index" issues where old index.html references non-existent chunks
  
- **Static Assets (JS/CSS with content hashes)**: Serves with `Cache-Control: public, max-age=31536000, immutable`
  - Only applies to files with content hashes in filename (e.g., `index-abc123.js`)
  - Safe to cache indefinitely since filename changes on content change
  
- **Images/Fonts**: Serves with `Cache-Control: public, max-age=31536000, immutable`
  - Long-term caching for static assets
  
- **API Responses**: Serves with `Cache-Control: no-store, no-cache, must-revalidate, private, max-age=0`
  - Ensures API responses are never cached

**Key Features:**
- Detects content-hashed filenames using regex pattern `/[a-f0-9]{8,}/`
- Falls back to shorter cache with revalidation for non-hashed assets
- Explicit no-cache headers set in both middleware and static file serving

### 2. Build Configuration Verification

**File Modified:** `vite.config.ts`

**Changes:**
- Explicitly configured content-based hashing for all assets
- Entry files: `assets/[name]-[hash].js`
- Chunk files: `assets/[name]-[hash].js`
- Asset files: `assets/[name]-[hash][extname]`
- Ensures new deployments generate distinct filenames

**Verification:**
- Vite uses content-based hashing by default (hash changes when content changes)
- Manual chunks configuration preserved for code splitting
- Source maps disabled in production for smaller bundles

### 3. ChunkLoadError Handling

**Files Created:**
- `client/src/components/ChunkLoadErrorBoundary.tsx`

**Files Modified:**
- `client/src/main.tsx`
- `client/src/App.tsx`

**Implementation:**
- **Error Boundary Component**: Catches ChunkLoadError and displays user-friendly message
  - Auto-reloads after 1 second delay
  - Maximum 3 retry attempts
  - Provides manual reload button
  
- **Global Error Handler**: Catches chunk load errors at window level
  - Detects errors before they reach React error boundary
  - Unregisters service workers that might cache stale assets
  - Forces hard reload to fetch latest index.html

**Error Detection:**
- Checks for `ChunkLoadError` name
- Detects error messages containing "Loading chunk", "Failed to fetch dynamically imported module"
- Handles both ErrorEvent and PromiseRejectionEvent

### 4. Service Worker Hygiene

**File Modified:** `client/src/components/ServiceWorker.tsx`

**Implementation:**
- **Conditional Registration**: Only registers if `VITE_ENABLE_PWA=true`
- **Auto-Unregistration**: Unregisters all service workers if PWA features not enabled
- **Cache Clearing**: Clears all caches after unregistering
- **Update Detection**: Listens for service worker updates when enabled

**Benefits:**
- Prevents stale service worker caches from serving old assets
- Allows opting into PWA features when needed
- Automatically cleans up on app load

### 5. Mobile Viewport Optimization

**File Modified:** `client/index.html`

**Changes:**
- Optimized viewport meta tag with `viewport-fit=cover` for modern devices
- Maintains `maximum-scale=5.0` for accessibility
- Prevents layout shifting on mobile devices

## Testing Checklist

- [ ] Verify `index.html` serves with no-cache headers in production
- [ ] Verify hashed assets (JS/CSS) serve with immutable cache headers
- [ ] Test ChunkLoadError handling by deploying new version while user has old version
- [ ] Verify service worker unregistration works correctly
- [ ] Test mobile viewport behavior on various devices
- [ ] Verify build generates content-hashed filenames
- [ ] Test cache behavior in browser DevTools Network tab

## Deployment Notes

1. **First Deployment After This Change:**
   - Users with old service workers will have them unregistered automatically
   - Users with cached index.html will get fresh version on next navigation
   - ChunkLoadError boundary will handle any edge cases

2. **Subsequent Deployments:**
   - New asset filenames will be generated automatically
   - Old assets can be safely cached until next deployment
   - Users will seamlessly get new version via index.html refresh

## Environment Variables

- `VITE_ENABLE_PWA=true`: Enable service worker registration (default: false)
- `NODE_ENV=production`: Enables production cache strategy

## Monitoring

Monitor for:
- ChunkLoadError occurrences (should be rare after initial deployment)
- Service worker registration/unregistration logs
- Cache hit rates for static assets
- User reports of stale content

## Future Improvements

1. **Service Worker with Update Strategy**: If PWA features are needed, implement a proper update strategy
2. **Cache Versioning**: Add version header to index.html for easier cache invalidation
3. **Preload Critical Assets**: Add `<link rel="preload">` for critical chunks in index.html
4. **Bundle Analysis**: Add bundle size monitoring in CI/CD pipeline

