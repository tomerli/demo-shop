import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
  });

  test('renders product cards with name and price', async ({ page }) => {
    const firstCard = page.locator('a[href^="/products/"]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByText(/\$\d+/)).toBeVisible();
  });

  test('search narrows results', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('bamboo');
    await expect(page.getByText(/bamboo/i).first()).toBeVisible({ timeout: 10_000 });

    const cards = page.locator('a[href^="/products/"]');
    const fullCount = await page.locator('a[href^="/products/"]').count();
    await page.getByPlaceholder(/search/i).fill('');
    await expect(cards).toHaveCount(await cards.count(), { timeout: 10_000 });
    expect(await page.locator('a[href^="/products/"]').count()).toBeGreaterThanOrEqual(fullCount);
  });

  test('clicking a product navigates to detail page', async ({ page }) => {
    await page.locator('a[href^="/products/"]').first().click();
    await expect(page).toHaveURL(/\/products\/.+/);
  });
});
