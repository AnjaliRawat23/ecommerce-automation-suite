// TOPIC 1: async / await
// Every Playwright action returns a Promise. Without `await`, the next line
// runs before the action finishes -> flaky or broken tests.
const { test, expect } = require('@playwright/test');

test('1.1 basic async/await flow', async ({ page }) => {
  // `async` on the test function lets us use `await` inside it.
  await page.goto('/');                                     // wait for page load
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory/);                // expect needs await too
});

test('1.2 values come back through await', async ({ page }) => {
  await page.goto('/');
  // Methods that return data must be awaited to get the real value.
  const title = await page.title();
  console.log('Page title:', title);
  expect(title).toBe('Swag Labs');                          // plain value -> no await

  const loginBtn = page.locator('[data-test="login-button"]');
  const label = await loginBtn.inputValue();                // value of <input type=submit>
  expect(label).toBe('Login');
});

test('1.3 COMMON BUG: forgetting await (read, then fix)', async ({ page }) => {
  await page.goto('/');
  // BAD (do NOT do this): the click is not awaited, so the test may end early
  //   page.locator('[data-test="login-button"]').click();
  //   expect(page.locator('[data-test="error"]')).toBeVisible();
  // GOOD:
  await page.locator('[data-test="login-button"]').click();
  await expect(page.locator('[data-test="error"]')).toBeVisible();
});

test('1.4 Promise.all: wait for an event WHILE triggering it', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');
  // Start listening for the new tab BEFORE the click, then await both together.
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Click Here' }).click(),
  ]);
  await newPage.waitForLoadState();
  await expect(newPage.locator('h3')).toHaveText('New Window');
});

test('1.5 loops with await (use for...of, NOT forEach)', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  const names = await page.locator('.inventory_item_name').allTextContents();
  for (const name of names) {          // forEach(async ...) does NOT wait. for...of does.
    console.log('Product:', name);
  }
  expect(names.length).toBeGreaterThan(0);
});

// PRACTICE: remove one `await` in 1.1 and run it. Watch what breaks, then restore it.
