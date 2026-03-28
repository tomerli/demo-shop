import { test, expect } from '@playwright/test';

async function login(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder(/username/i).fill('demo');
  await page.getByPlaceholder(/password/i).fill('demo123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText(/Hi, demo/i)).toBeVisible({ timeout: 30_000 });
}

async function addFirstProductToCart(page: any) {
  await page.goto('/');
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible({ timeout: 30_000 });
  await page.locator('a[href^="/products/"]').first().click();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByRole('button', { name: 'Added!' })).toBeVisible({ timeout: 10_000 });
}

test.describe('Checkout form', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await addFirstProductToCart(page);
    await page.goto('/checkout');
  });

  test('all payment and shipping fields are present', async ({ page }) => {
    await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/123 Main St/i)).toBeVisible();
    await expect(page.getByPlaceholder(/DEMO10/i)).toBeVisible();
    await expect(page.getByPlaceholder(/1234 5678 9012 3456/i)).toBeVisible();
    await expect(page.getByPlaceholder('MM/YY')).toBeVisible();
    await expect(page.getByPlaceholder('123')).toBeVisible();
  });

  test('invalid coupon shows error', async ({ page }) => {
    await page.getByPlaceholder(/DEMO10/i).fill('BADCODE');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10_000 });
  });

  test('DEMO10 coupon shows success', async ({ page }) => {
    await page.getByPlaceholder(/DEMO10/i).fill('DEMO10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/10%/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Checkout happy path', () => {
  test('completes full order and shows confirmation', async ({ page }) => {
    await login(page);
    await addFirstProductToCart(page);
    await page.goto('/checkout');

    // Email is pre-filled from auth cookie — just verify it's there
    await expect(page.getByPlaceholder(/you@example\.com/i)).not.toBeEmpty();

    await page.getByPlaceholder(/123 Main St/i).fill('123 Test Ave, Springfield, CA 90210');
    await page.getByPlaceholder(/1234 5678 9012 3456/i).fill('4242 4242 4242 4242');
    await page.getByPlaceholder('MM/YY').fill('12/28');
    await page.getByPlaceholder('123').fill('123');

    await page.getByPlaceholder(/DEMO10/i).fill('DEMO10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText(/10%/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/\/order\/.+/, { timeout: 30_000 });
    await expect(page.getByText('Order Confirmed')).toBeVisible();
    await expect(page.getByText(/Order ID/i)).toBeVisible();
    await expect(page.getByText(/Transaction ID/i)).toBeVisible();
  });
});
