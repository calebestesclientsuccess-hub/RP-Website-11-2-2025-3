
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
  // Track Largest Contentful Paint (LCP)
  onLCP(sendToAnalytics);
  
  // Track Interaction to Next Paint (INP) - replaces FID
  onINP(sendToAnalytics);
  
  // Track Cumulative Layout Shift (CLS)
  onCLS(sendToAnalytics);
  
  // Track First Contentful Paint (FCP)
  onFCP(sendToAnalytics);
  
  // Track Time to First Byte (TTFB)
  onTTFB(sendToAnalytics);
}
