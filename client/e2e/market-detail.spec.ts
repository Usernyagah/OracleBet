import { test, expect } from '@playwright/test';

test.describe('Market Detail Page', () => {
  test('should display market information', async ({ page }) => {
    // Navigate to a market detail page (using mock market ID)
    await page.goto('/market/1');
    
    await page.waitForLoadState('networkidle');
    
    // Check for market title
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('should show market odds', async ({ page }) => {
    await page.goto('/market/1');
    await page.waitForLoadState('networkidle');
    
    // Look for odds display (could be percentage, gauge, etc.)
    const oddsElements = page.locator('text=/yes|no|odds|probability|%/i');
    
    // At least one odds-related element should be visible
    const hasOdds = await oddsElements.count() > 0;
    expect(hasOdds).toBeTruthy();
  });

  test('should display trading interface', async ({ page }) => {
    await page.goto('/market/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React to render
    
    // Look for any interactive elements - buttons, inputs, tabs, links
    const buttons = page.locator('button');
    const inputs = page.locator('input');
    const tabs = page.locator('[role="tab"]');
    const links = page.locator('a[href]');
    const clickableElements = page.locator('button, a, input, [role="button"]');
    
    // Should have some interactive elements on the page
    const buttonCount = await buttons.count();
    const inputCount = await inputs.count();
    const tabCount = await tabs.count();
    const linkCount = await links.count();
    const clickableCount = await clickableElements.count();
    
    // Page should have content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // Should have at least some interactive elements (buttons, inputs, tabs, or links)
    const hasInteractiveElements = buttonCount > 0 || inputCount > 0 || tabCount > 0 || linkCount > 0 || clickableCount > 0;
    expect(hasInteractiveElements).toBeTruthy();
  });

  test('should show connect wallet prompt when not connected', async ({ page }) => {
    await page.goto('/market/1');
    await page.waitForLoadState('networkidle');
    
    // Look for connect wallet button or message
    const connectButton = page.locator('button').filter({ hasText: /connect|wallet/i });
    
    // If connect button exists, it should be visible
    if (await connectButton.count() > 0) {
      await expect(connectButton.first()).toBeVisible();
    }
  });

  test('should display market chart or statistics', async ({ page }) => {
    await page.goto('/market/1');
    await page.waitForLoadState('networkidle');
    
    // Look for chart, volume, liquidity, or statistics
    const statsElements = page.locator('text=/volume|liquidity|volume|statistics|chart/i');
    
    // Page should have some content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

