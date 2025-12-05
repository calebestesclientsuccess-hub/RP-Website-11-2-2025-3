/**
 * SimpleBridgeSection Router
 * 
 * Determines device type and renders appropriate version:
 * - Desktop: Cinematic scroll-driven GSAP animation
 * - Mobile: Clean, performant content reveal with CSS
 * 
 * Uses lazy loading for code splitting - only loads the component needed
 */

import { lazy, Suspense } from 'react';

// Lazy load for code splitting
const DesktopBridge = lazy(() => import('./DesktopBridge'));
const MobileBridge = lazy(() => import('./MobileBridge'));

/**
 * Loading skeleton shown while lazy components load
 */
function BridgeSkeleton() {
  return (
    <section 
      className="min-h-screen bg-zinc-950 flex items-center justify-center"
      aria-label="Loading bridge section"
    >
      <div className="animate-pulse text-white/20 text-2xl">
        Loading...
      </div>
    </section>
  );
}

/**
 * SimpleBridgeSection - The Router Component
 * 
 * Philosophy: Desktop and mobile are separate experiences, not responsive variations.
 * - Desktop: Full cinematic scroll narrative
 * - Mobile: Simple, elegant reveal
 * 
 * DO NOT add isMobile checks here beyond the initial routing decision.
 */
export default function SimpleBridgeSection() {
  // Synchronous mobile detection for routing (SSR-safe)
  const isMobile = typeof window !== 'undefined' 
    ? window.matchMedia('(max-width: 767px)').matches 
    : false;
  
  return (
    <Suspense fallback={<BridgeSkeleton />}>
      {isMobile ? <MobileBridge /> : <DesktopBridge />}
    </Suspense>
  );
}

