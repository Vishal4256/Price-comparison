import { test, expect } from '@playwright/test';

test.describe('PriceSmart Core Flows', () => {
  test('should load landing page and search', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Expect title
    await expect(page).toHaveTitle(/PriceSmart/);
    
    // Interact with search bar
    const searchInput = page.getByPlaceholder('Search products, brands, or categories...');
    await searchInput.fill('iphone');
    
    // Since autocomplete takes time, just submit
    await searchInput.press('Enter');
    
    // Expect to be on search results page
    await expect(page).toHaveURL(/.*\/search\?q=iphone/);
  });

  test('admin dashboard loads widgets', async ({ page }) => {
    // We would need auth here normally, but for now we'll just check if the layout renders
    await page.goto('/admin');
    
    // Expect sidebar to exist
    await expect(page.getByText('PriceSmart Admin')).toBeVisible();
    
    // Expect Overview text
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  });
});
