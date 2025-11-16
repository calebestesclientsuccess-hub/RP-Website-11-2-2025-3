import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Send Web Vitals to analytics endpoint
 */
function sendToAnalytics(metric: Metric) {
  const body: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  };

  // Send to backend analytics
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(body));
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating
    });
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  const isDev = process.env.NODE_ENV === 'development';

  onCLS((metric) => {
    if (isDev) console.log('[Web Vitals] CLS:', metric);
  });

  onFCP((metric) => {
    if (isDev) console.log('[Web Vitals] FCP:', metric);
  });

  onLCP((metric) => {
    if (isDev) console.log('[Web Vitals] LCP:', metric);
  });

  onTTFB((metric) => {
    if (isDev) console.log('[Web Vitals] TTFB:', metric);
  });

  onINP((metric) => {
    if (isDev) console.log('[Web Vitals] INP:', metric);
  });
}