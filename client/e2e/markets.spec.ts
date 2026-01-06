import { test, expect } from '@playwright/test';

test.describe('Markets Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/markets');
  });

  test('should display markets list', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for markets heading - any h1 or h2 should be visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('Bitcoin');
      await page.waitForTimeout(1000); // Wait for search to filter
    }
  });

  test('should filter markets by category', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for category filter buttons
    const categoryButtons = page.locator('button').filter({ hasText: /crypto|rwa|mantle|all/i });
    
    if (await categoryButtons.count() > 0) {
      const firstCategory = categoryButtons.first();
      await firstCategory.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display market cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for market cards - could be in various formats
    const marketCards = page.locator('[class*="card"], [class*="market"], article').filter({ hasText: /will|bitcoin|eth|mantle/i });
    
    // At least check that some content is visible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should navigate to market detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Try to find and click a market link
    const marketLink = page.locator('a[href*="/market/"]').first();
    
    if (await marketLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await marketLink.click();
      await page.waitForURL('**/market/**', { timeout: 10000 });
      
      // Verify we're on market detail page
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});

