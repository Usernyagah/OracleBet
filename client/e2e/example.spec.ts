import { test, expect } from '@playwright/test';

/**
 * Example test file - can be used as a template
 * This demonstrates basic Playwright testing patterns
 */

test.describe('Example Tests', () => {
  test('basic page load', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Basic assertion - page should have content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    // Check page title (adjust based on actual title)
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

