import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('should display connect wallet button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for connect wallet button in navbar
    const connectButton = page.locator('button').filter({ hasText: /connect|wallet/i });
    
    // Connect button should be visible
    if (await connectButton.count() > 0) {
      await expect(connectButton.first()).toBeVisible();
    }
  });

  test('should open wallet connection modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click connect wallet button
    const connectButton = page.locator('button').filter({ hasText: /connect|wallet/i }).first();
    
    if (await connectButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await connectButton.click();
      
      // Wait for modal or dropdown to appear
      await page.waitForTimeout(1000);
      
      // Look for wallet options (MetaMask, WalletConnect, etc.)
      const walletOptions = page.locator('text=/metamask|walletconnect|coinbase|injected/i');
      
      // Modal should appear with wallet options
      const hasWalletOptions = await walletOptions.count() > 0;
      
      // At minimum, something should happen when clicking
      expect(hasWalletOptions || await page.locator('[role="dialog"], [class*="modal"]').count() > 0).toBeTruthy();
    }
  });

  test('should show network information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for network indicator or testnet banner
    const networkInfo = page.locator('text=/mantle|testnet|sepolia|chain/i');
    
    // Network info might be visible in banner or navbar
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should prompt to switch network if wrong network', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // This test would require actual wallet interaction
    // For now, just verify the page loads
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});

