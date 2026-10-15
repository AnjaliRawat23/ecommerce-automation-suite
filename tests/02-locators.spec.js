// TOPIC 2: Locators
// Preference order: getByRole > getByLabel/getByPlaceholder/getByText > getByTestId > CSS/XPath
const { test, expect } = require('@playwright/test');

test.describe('Locators on saucedemo login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('2.1 getByPlaceholder, getByRole', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('2.2 CSS and attribute locators', async ({ page }) => {
    await page.locator('#user-name').fill('standard_user');           // by id
    await page.locator('input[name="password"]').fill('secret_sauce'); // by attribute
    await page.locator('input.submit-button').click();                 // tag + class
    await expect(page).toHaveURL(/inventory/);
  });

  test('2.3 data-test attributes via getByTestId', async ({ page }) => {
    // saucedemo uses data-test, so tell Playwright to use that attribute.
    // (Put this in config instead: use: { testIdAttribute: 'data-test' })
    const { selectors } = require('@playwright/test');
    selectors.setTestIdAttribute('data-test');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });
});

test.describe('Locators on the inventory page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
  });

  test('2.4 multiple elements: count, nth, first, last', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
    console.log('First :', await items.first().locator('.inventory_item_name').innerText());
    console.log('Last  :', await items.last().locator('.inventory_item_name').innerText());
    console.log('Third :', await items.nth(2).locator('.inventory_item_name').innerText());
  });

  test('2.5 chaining / filtering: find ONE product card, act inside it', async ({ page }) => {
    const backpack = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' });
    await backpack.getByRole('button', { name: 'Add to cart' }).click();
    await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('2.6 getByText and getByAltText', async ({ page }) => {
    await page.getByText('Sauce Labs Bike Light').first().click();
    await expect(page).toHaveURL(/inventory-item/);
    await expect(page.getByAltText('Sauce Labs Bike Light')).toBeVisible();
  });

  test('2.7 dropdown: selectOption', async ({ page }) => {
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const prices = await page.locator('.inventory_item_price').allTextContents();
    const nums = prices.map(p => parseFloat(p.replace('$', '')));
    const sorted = [...nums].sort((a, b) => a - b);
    expect(nums).toEqual(sorted);
  });

  test('2.8 XPath (last resort)', async ({ page }) => {
    await expect(page.locator('//div[@class="inventory_item_name " and text()="Sauce Labs Onesie"]')).toBeVisible();
  });
});

// PRACTICE: use the Playwright locator picker: npx playwright codegen https://www.saucedemo.com
