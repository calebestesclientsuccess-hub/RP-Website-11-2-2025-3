
import { test, expect } from '@playwright/test';

test.describe('Admin Blog Publishing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'test1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/admin');
  });

  test('should create and publish blog post', async ({ page }) => {
    // Navigate to blog posts
    await page.goto('/admin/blog-posts');
    
    // Click new post
    await page.click('text=New Blog Post');
    
    // Fill form
    await page.getByTestId('input-title').fill('Test Blog Post');
    await page.getByTestId('input-slug').fill('test-blog-post');
    await page.getByTestId('input-excerpt').fill('This is a test excerpt');
    await page.getByTestId('input-author').fill('Test Author');
    
    // Set published
    await page.getByTestId('switch-published').click();
    
    // Submit
    await page.getByTestId('button-submit').click();
    
    // Should redirect to list
    await expect(page).toHaveURL('/admin/blog-posts');
    
    // Verify post appears in list
    await expect(page.locator('text=Test Blog Post')).toBeVisible();
  });

  test('should schedule blog post', async ({ page }) => {
    await page.goto('/admin/blog-posts/new');
    
    // Fill basic info
    await page.getByTestId('input-title').fill('Scheduled Post');
    await page.getByTestId('input-slug').fill('scheduled-post');
    
    // Set future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('input[name="scheduledFor"]', futureDate.toISOString().split('T')[0]);
    
    // Submit
    await page.getByTestId('button-submit').click();
    
    // Verify scheduled
    await expect(page.locator('text=Scheduled')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/blog-posts/new');
    
    // Try submitting without title
    await page.getByTestId('button-submit').click();
    
    // Should show validation error
    await expect(page.locator('text=required')).toBeVisible();
  });
});
