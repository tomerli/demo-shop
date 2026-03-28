import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('homepage loads and core shell renders', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('DemoShop')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('at least one product card is visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
  });
});
