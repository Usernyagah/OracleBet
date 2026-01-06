import { Page } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for page to be fully loaded including network requests
 */
export async function waitForPageLoad(page: Page, timeout = 10000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Find and click a button by text (case insensitive)
 */
export async function clickButtonByText(page: Page, text: string, timeout = 5000) {
  const button = page.locator('button').filter({ hasText: new RegExp(text, 'i') }).first();
  if (await button.isVisible({ timeout }).catch(() => false)) {
    await button.click();
    return true;
  }
  return false;
}

/**
 * Find and click a link by text or href
 */
export async function clickLink(page: Page, textOrHref: string, timeout = 5000) {
  const link = page.locator(`a:has-text("${textOrHref}"), a[href*="${textOrHref}"]`).first();
  if (await link.isVisible({ timeout }).catch(() => false)) {
    await link.click();
    return true;
  }
  return false;
}

/**
 * Fill form input by label or placeholder
 */
export async function fillInput(page: Page, labelOrPlaceholder: string, value: string) {
  const input = page.locator(`input[placeholder*="${labelOrPlaceholder}" i], label:has-text("${labelOrPlaceholder}") + input`).first();
  if (await input.isVisible({ timeout: 5000 }).catch(() => false)) {
    await input.fill(value);
    return true;
  }
  return false;
}

/**
 * Check if element with text is visible
 */
export async function isTextVisible(page: Page, text: string, timeout = 5000): Promise<boolean> {
  try {
    const element = page.locator(`text=/${text}/i`).first();
    await element.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp, timeout = 10000) {
  await page.waitForURL(urlPattern, { timeout });
}

