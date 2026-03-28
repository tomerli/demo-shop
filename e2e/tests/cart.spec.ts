import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test('empty cart shows empty state message', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Your cart is empty.')).toBeVisible({ timeout: 30_000 });
  });

  test('added item appears in cart', async ({ page }) => {
    // Add a product first
    await page.goto('/');
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
    await page.locator('a[href^="/products/"]').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible({ timeout: 10_000 });

    await page.goto('/cart');
    await expect(page.getByText(/\$\d+/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Proceed to Checkout' })).toBeVisible();
  });

  test('quantity increase button works', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
    await page.locator('a[href^="/products/"]').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible({ timeout: 10_000 });

    await page.goto('/cart');
    await expect(page.getByText('1').first()).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('2').first()).toBeVisible({ timeout: 5_000 });
  });

  test('removing item shows empty cart', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
    await page.locator('a[href^="/products/"]').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible({ timeout: 10_000 });

    await page.goto('/cart');
    await expect(page.getByText(/\$\d+/)).toBeVisible({ timeout: 15_000 });
    // − button when qty=1 removes the item
    await page.getByRole('button', { name: '−' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible({ timeout: 10_000 });
  });
});
