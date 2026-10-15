// TOPIC 3: Assertions
// WEB-FIRST assertions (await expect(locator)...) auto-retry until they pass or time out.
// GENERIC assertions (expect(value)...) check once, immediately.
const { test, expect } = require('@playwright/test');

async function login(page, user = 'standard_user') {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
}

test('3.1 page assertions: URL and title', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  await expect(page).toHaveTitle('Swag Labs');
});

test('3.2 locator assertions: visibility, text, count', async ({ page }) => {
  await login(page);
  await expect(page.locator('.title')).toBeVisible();
  await expect(page.locator('.title')).toHaveText('Products');
  await expect(page.locator('.inventory_item')).toHaveCount(6);
  await expect(page.locator('.shopping_cart_badge')).toBeHidden();   // empty cart: no badge
});

test('3.3 state assertions: enabled, checked, attribute, value', async ({ page }) => {
  await page.goto('/');
  const user = page.locator('[data-test="username"]');
  await expect(user).toBeEnabled();
  await expect(user).toBeEmpty();
  await user.fill('standard_user');
  await expect(user).toHaveValue('standard_user');
  await expect(user).toHaveAttribute('placeholder', 'Username');
});

test('3.4 text matching: exact, substring, regex', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="login-button"]').click();
  const err = page.locator('[data-test="error"]');
  await expect(err).toContainText('Username is required');           // substring
  await expect(err).toHaveText(/Username is required/);              // regex
  await expect(err).toHaveText('Epic sadface: Username is required'); // exact
});

test('3.5 negative assertions with .not', async ({ page }) => {
  await login(page, 'locked_out_user');
  await expect(page).not.toHaveURL(/inventory/);
  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
});

test('3.6 list assertions: toHaveText with an array', async ({ page }) => {
  await login(page);
  await expect(page.locator('.inventory_item_name')).toHaveText([
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt',
    'Sauce Labs Fleece Jacket',
    'Sauce Labs Onesie',
    'Test.allTheThings() T-Shirt (Red)',
  ]);
});

test('3.7 generic assertions on plain JS values', async ({ page }) => {
  await login(page);
  const prices = (await page.locator('.inventory_item_price').allTextContents())
    .map(p => parseFloat(p.replace('$', '')));
  expect(prices.length).toBe(6);
  expect(Math.min(...prices)).toBeLessThan(10);
  expect(prices).toContain(29.99);
});

test('3.8 soft assertions: keep going after a failure', async ({ page }) => {
  await login(page);
  await expect.soft(page.locator('.title')).toHaveText('Products');
  await expect.soft(page.locator('.inventory_item')).toHaveCount(6);
  await expect.soft(page).toHaveURL(/inventory/);
  // test is marked failed at the end if any soft assertion failed
});

test('3.9 custom message + custom timeout', async ({ page }) => {
  await login(page);
  await expect(page.locator('.title'), 'Products heading should show after login')
    .toBeVisible({ timeout: 3000 });
});

test('3.10 screenshot assertion (visual): first run creates the baseline', async ({ page }) => {
  await login(page);
  await expect(page.locator('.inventory_list')).toHaveScreenshot('inventory-list.png', { maxDiffPixelRatio: 0.05 });
});
