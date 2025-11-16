
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('assessment page should not have accessibility violations', async ({ page }) => {
    await page.goto('/assessment');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('audit page should not have accessibility violations', async ({ page }) => {
    await page.goto('/audit');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
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
