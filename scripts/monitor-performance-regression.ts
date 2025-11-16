
#!/usr/bin/env tsx

/**
 * Performance Regression Monitor
 * Compares current performance metrics against baseline
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PerformanceBaseline {
  timestamp: string;
  metrics: {
    [key: string]: {
      lcp: number;
      fcp: number;
      cls: number;
      ttfb: number;
      bundleSize: number;
    };
  };
}

const BASELINE_PATH = join(process.cwd(), 'performance-baseline.json');
const REGRESSION_THRESHOLD = 0.1; // 10% regression tolerance

async function loadBaseline(): Promise<PerformanceBaseline | null> {
  if (!existsSync(BASELINE_PATH)) {
    console.warn('⚠️  No baseline found. Run with --set-baseline to create one.');
    return null;
  }
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
}

async function getCurrentMetrics() {
  // This would integrate with your Lighthouse CI results
  // For now, returning mock structure
  return {
    '/': { lcp: 2400, fcp: 1200, cls: 0.08, ttfb: 600, bundleSize: 250 },
    '/blog': { lcp: 2200, fcp: 1100, cls: 0.05, ttfb: 550, bundleSize: 220 },
  };
}

async function checkRegression() {
  const baseline = await loadBaseline();
  if (!baseline) {
    process.exit(0);
  }

  const current = await getCurrentMetrics();
  let hasRegression = false;

  console.log('🔍 Checking for performance regressions...\n');

  for (const [page, metrics] of Object.entries(current)) {
    const baselineMetrics = baseline.metrics[page];
    if (!baselineMetrics) continue;

    console.log(`📄 ${page}`);
    
    for (const [metric, value] of Object.entries(metrics)) {
      const baselineValue = baselineMetrics[metric as keyof typeof baselineMetrics];
      const change = ((value - baselineValue) / baselineValue) * 100;
      
      if (change > REGRESSION_THRESHOLD * 100) {
        console.log(`  ❌ ${metric}: ${value} (${change.toFixed(1)}% regression)`);
        hasRegression = true;
      } else if (change < -5) {
        console.log(`  ✅ ${metric}: ${value} (${Math.abs(change).toFixed(1)}% improvement)`);
      } else {
        console.log(`  ✓ ${metric}: ${value} (within tolerance)`);
      }
    }
    console.log('');
  }

  if (hasRegression) {
    console.error('\n❌ Performance regression detected!');
    process.exit(1);
  } else {
    console.log('\n✅ No performance regressions detected.');
  }
}

async function setBaseline() {
  const current = await getCurrentMetrics();
  const baseline: PerformanceBaseline = {
    timestamp: new Date().toISOString(),
    metrics: current,
  };
  
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
  console.log('✅ Performance baseline updated.');
}

const args = process.argv.slice(2);
if (args.includes('--set-baseline')) {
  setBaseline();
} else {
  checkRegression();
}
