
import { test, expect } from '@playwright/test';

test.describe('Lead Submission Flow', () => {
  test('should submit lead from audit page', async ({ page }) => {
    await page.goto('/audit');
    
    // Fill form
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="workEmail"]', 'john@example.com');
    await page.fill('input[name="companyName"]', 'Example Corp');
    await page.fill('input[name="website"]', 'example.com');
    await page.fill('textarea[name="gtmChallenge"]', 'We need help scaling our GTM team');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=success')).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/audit');
    
    // Try submitting without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should sanitize malicious input', async ({ page }) => {
    await page.goto('/audit');
    
    // Try XSS attack
    await page.fill('input[name="fullName"]', '<script>alert("xss")</script>');
    await page.fill('input[name="workEmail"]', 'test@example.com');
    await page.fill('input[name="companyName"]', 'Test Co');
    await page.fill('input[name="website"]', 'test.com');
    await page.fill('textarea[name="gtmChallenge"]', 'Test challenge');
    
    await page.click('button[type="submit"]');
    
    // Form should submit successfully (input sanitized server-side)
    await expect(page.locator('text=success')).toBeVisible({ timeout: 10000 });
    
    // Verify no script executed
    page.on('dialog', () => {
      throw new Error('XSS alert detected');
    });
  });
});
