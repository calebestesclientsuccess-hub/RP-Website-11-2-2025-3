
import { test, expect } from '@playwright/test';

test.describe('Assessment Flow', () => {
  test('should complete full assessment journey', async ({ page }) => {
    // Navigate to assessment page
    await page.goto('/assessment');
    
    // Verify page loaded
    await expect(page.getByTestId('heading-assessment')).toBeVisible();
    
    // Start assessment
    await expect(page.getByTestId('card-question-0')).toBeVisible();
    
    // Answer first question
    await page.getByTestId('option-basic').click();
    await page.getByTestId('button-next').click();
    
    // Answer remaining questions
    for (let i = 1; i < 7; i++) {
      await expect(page.getByTestId(`card-question-${i}`)).toBeVisible();
      await page.locator('label').first().click();
      await page.getByTestId('button-next').click();
    }
    
    // Fill lead capture form
    await expect(page.getByTestId('card-lead-capture')).toBeVisible();
    await page.getByTestId('input-name').fill('Test User');
    await page.getByTestId('input-email').fill('test@example.com');
    await page.getByTestId('input-company').fill('Test Company');
    await page.getByTestId('button-get-results').click();
    
    // Verify results page
    await expect(page.getByTestId('card-results')).toBeVisible();
    await expect(page.getByTestId('heading-score')).toContainText('Score');
    await expect(page.getByTestId('heading-bottleneck')).toBeVisible();
    await expect(page.getByTestId('card-recommendations')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/assessment');
    
    // Complete questions
    for (let i = 0; i < 7; i++) {
      await page.locator('label').first().click();
      await page.getByTestId('button-next').click();
    }
    
    // Try invalid email
    await page.getByTestId('input-name').fill('Test User');
    await page.getByTestId('input-email').fill('invalid-email');
    await page.getByTestId('button-get-results').click();
    
    // Should show validation error
    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/assessment');
    
    const progressBar = page.getByTestId('progress-assessment');
    await expect(progressBar).toBeVisible();
    
    // Initial progress
    const initialProgress = await progressBar.getAttribute('value');
    expect(Number(initialProgress)).toBeGreaterThan(0);
    
    // Answer question
    await page.locator('label').first().click();
    await page.getByTestId('button-next').click();
    
    // Progress should increase
    const newProgress = await progressBar.getAttribute('value');
    expect(Number(newProgress)).toBeGreaterThan(Number(initialProgress));
  });
});
