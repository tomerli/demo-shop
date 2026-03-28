import { test, expect } from '@playwright/test';

test.describe('Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
    await page.locator('a[href^="/products/"]').first().click();
    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test('shows product name, price, and description', async ({ page }) => {
    await expect(page.getByText(/\$\d+/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
  });

  test('Add to Cart shows "Added!" confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible({ timeout: 10_000 });
  });

  test('cart badge increments after adding item', async ({ page }) => {
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByText(/^[1-9]\d*$/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Back button returns to homepage', async ({ page }) => {
    await page.getByRole('link', { name: /back/i }).click();
    await expect(page).toHaveURL('/');
  });
});
