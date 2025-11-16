import { statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

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

async function getFileSize(pattern: string): Promise<number> {
  const { glob } = await import('glob');
  const files = await glob(join(__dirname, '..', pattern));

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
    const sizeBytes = await getFileSize(budget.path);
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

console.log('📦 Checking bundle size against performance budget...');

const performanceBudget = JSON.parse(readFileSync('performance-budget.json', 'utf-8'));

try {
  // Build the project
  execSync('npm run build', { stdio: 'inherit' });

  // Get bundle stats (this assumes vite build outputs stats)
  const stats = execSync('du -sh dist/assets/*.js').toString();

  console.log('Bundle sizes:', stats);

  // Parse and validate against budget
  const jsFiles = stats.split('\n').filter(line => line.includes('.js'));
  const totalSize = jsFiles.reduce((sum, line) => {
    const size = parseInt(line.split('\t')[0]);
    return sum + (isNaN(size) ? 0 : size);
  }, 0);

  const budgetKb = performanceBudget.javascript || 300;

  if (totalSize > budgetKb * 1024) {
    console.error(`❌ Bundle size ${Math.round(totalSize/1024)}KB exceeds budget of ${budgetKb}KB`);
    process.exit(1);
  }

  console.log(`✅ Bundle size ${Math.round(totalSize/1024)}KB within budget of ${budgetKb}KB`);
} catch (error) {
  console.error('Bundle size check failed:', error);
  process.exit(1);
}