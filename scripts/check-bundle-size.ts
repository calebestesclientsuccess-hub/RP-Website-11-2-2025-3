
import { statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BundleBudget {
  path: string;
  maxSize: number; // in KB
}

const budgets: BundleBudget[] = [
  { path: 'client/dist/assets/index-*.js', maxSize: 300 },
  { path: 'client/dist/assets/index-*.css', maxSize: 50 },
];

function getFileSize(pattern: string): number {
  const glob = await import('glob');
  const files = glob.sync(join(__dirname, '..', pattern));
  
  if (files.length === 0) {
    console.warn(`⚠️  No files found matching: ${pattern}`);
    return 0;
  }

  return files.reduce((total, file) => {
    const stats = statSync(file);
    return total + stats.size;
  }, 0);
}

async function checkBudgets() {
  let failures = 0;

  console.log('📊 Checking bundle size budgets...\n');

  for (const budget of budgets) {
    const sizeBytes = getFileSize(budget.path);
    const sizeKB = Math.round(sizeBytes / 1024);
    const withinBudget = sizeKB <= budget.maxSize;

    const status = withinBudget ? '✅' : '❌';
    const percent = Math.round((sizeKB / budget.maxSize) * 100);

    console.log(`${status} ${budget.path}`);
    console.log(`   Size: ${sizeKB} KB / ${budget.maxSize} KB (${percent}%)`);

    if (!withinBudget) {
      failures++;
      console.log(`   ⚠️  OVER BUDGET by ${sizeKB - budget.maxSize} KB\n`);
    } else {
      console.log('');
    }
  }

  if (failures > 0) {
    console.error(`\n❌ ${failures} budget(s) exceeded!`);
    process.exit(1);
  } else {
    console.log('\n✅ All budgets met!');
  }
}

checkBudgets();
