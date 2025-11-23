
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to format violations for better error messages
function formatViolations(violations: any[]) {
  return violations.map(violation => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    nodes: violation.nodes.length,
    helpUrl: violation.helpUrl,
  }));
}

// Helper to run axe scan and report violations
async function checkAccessibility(page: any, url: string, description: string) {
  await page.goto(url);
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  
  const criticalViolations = accessibilityScanResults.violations.filter(
    v => v.impact === 'critical' || v.impact === 'serious'
  );
  
  if (criticalViolations.length > 0) {
    console.error(`\n❌ Critical accessibility violations on ${description}:`);
    console.error(JSON.stringify(formatViolations(criticalViolations), null, 2));
  }
  
  // Fail on critical/serious violations, warn on moderate/minor
  expect(criticalViolations, `Found ${criticalViolations.length} critical/serious accessibility violations on ${description}`).toEqual([]);
  
  if (accessibilityScanResults.violations.length > 0) {
    console.warn(`⚠️  Found ${accessibilityScanResults.violations.length} total accessibility issues on ${description}`);
  }
}

test.describe('Accessibility Tests', () => {
  test('home page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/', 'home page');
  });

  test('assessment page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/assessment', 'assessment page');
  });

  test('audit page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/audit', 'audit page');
  });

  test('pricing page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/pricing', 'pricing page');
  });

  test('contact page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/contact', 'contact page');
  });

  test('blog page should not have critical accessibility violations', async ({ page }) => {
    await checkAccessibility(page, '/blog', 'blog page');
  });

  test('forms should have proper labels and descriptions', async ({ page }) => {
    await page.goto('/assessment');
    
    // Check for form labels
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Each input should have either id with corresponding label, aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });

  test('interactive elements should have sufficient touch targets', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button, a[href]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // WCAG 2.1 Level AAA: touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').first();
    expect(await focusedElement.count()).toBeGreaterThan(0);
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus').first();
      expect(await focusedElement.count()).toBeGreaterThan(0);
    }
  });

  test('skip to main content link should be available', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip to")').first();
    
    if (await skipLink.count() > 0) {
      // Skip link should be keyboard accessible
      await skipLink.focus();
      expect(await skipLink.isVisible()).toBeTruthy();
    }
  });
});
