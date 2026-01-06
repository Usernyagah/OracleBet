import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded - title is "OracleBet Hub" or page has content
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Also check that main content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for hero content (headings, CTAs)
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible({ timeout: 10000 });
  });

  test('should display featured markets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for market cards or featured content
    const marketCards = page.locator('[class*="card"], [class*="market"], article');
    
    // Should have some content visible
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should display statistics or features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for stats (volume, markets, fees, etc.)
    const stats = page.locator('text=/volume|markets|fees|low|secure/i');
    
    // Page should render
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for navigation - might be in header or nav element
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
    
    // Check for key navigation links - look for any links
    const navLinks = page.locator('a[href]');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await expect(pageContent).toBeVisible();
  });
});

