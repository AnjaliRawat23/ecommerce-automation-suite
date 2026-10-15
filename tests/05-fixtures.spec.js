// TOPIC 5: Fixtures
// Built-in fixtures: page, context, browser, request, browserName.
// Custom fixtures live in tests/fixtures/my-fixtures.js and are requested by name.
const { test, expect } = require('./fixtures/my-fixtures');

test('5.1 built-in fixtures: page, context, browser, browserName', async ({ page, context, browser, browserName }) => {
  console.log('Browser:', browserName, '| version:', browser.version());
  expect(context.pages()).toContain(page);
  await page.goto('/');
  await expect(page).toHaveTitle('Swag Labs');
});

test('5.2 custom fixture: loginPage', async ({ loginPage }) => {
  await loginPage.login('wrong_user', 'wrong_pass');
  await expect(loginPage.error).toContainText('do not match');
});

test('5.3 chained fixture: inventoryPage already logged in', async ({ inventoryPage }) => {
  await expect(inventoryPage.items).toHaveCount(6);
  await inventoryPage.addToCart('Sauce Labs Backpack');
  await expect(inventoryPage.cartBadge).toHaveText('1');
});

test('5.4 fixture with setup + teardown (watch the console)', async ({ loginPage, testUser }) => {
  await loginPage.login(testUser.name, testUser.password);
  await expect(loginPage.page).toHaveURL(/inventory/);
});

test.describe('5.5 option fixture override', () => {
  test.use({ productName: 'Sauce Labs Onesie' });     // overrides the default

  test('adds the overridden product', async ({ inventoryPage, productName }) => {
    await inventoryPage.addToCart(productName);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });
});

test('5.6 request fixture: API call without a browser', async ({ request }) => {
  const res = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.id).toBe(1);
});

// Hooks vs fixtures: beforeEach/afterEach are fine for small setups,
// but fixtures are reusable across files, lazy (only run if requested), and composable.

// PRACTICE: add a `cartPage` fixture that opens the cart and returns the cart items locator.
