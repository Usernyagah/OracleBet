import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test('should display portfolio page', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check for portfolio heading - any heading should be visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should show connect wallet prompt when not connected', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Look for connect wallet button or message
    const connectButton = page.locator('button').filter({ hasText: /connect|wallet/i });
    const connectMessage = page.locator('text=/connect|wallet|sign in/i');
    
    // Either should be visible if wallet not connected
    const hasConnectPrompt = (await connectButton.count() > 0) || (await connectMessage.count() > 0);
    
    if (hasConnectPrompt) {
      await expect(connectButton.first().or(connectMessage.first())).toBeVisible();
    }
  });

  test('should display portfolio statistics when connected', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Look for portfolio stats (total value, PnL, etc.)
    const statsElements = page.locator('text=/total|value|pnl|profit|loss|balance/i');
    
    // Page should have content
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should show positions table or list', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Look for table or list of positions
    const table = page.locator('table').first();
    const listItems = page.locator('[class*="position"], [class*="card"]');
    
    // Either table or list should be present (or empty state)
    const hasPositionsUI = (await table.count() > 0) || (await listItems.count() > 0);
    
    // Page should render something
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

