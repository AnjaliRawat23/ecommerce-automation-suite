// TOPIC 6: Browser contexts
// Browser  -> one browser process
// Context  -> an isolated "incognito-like" session (own cookies, storage, cache)
// Page     -> a tab inside a context
// Each test gets a fresh context automatically, which is why tests don't leak state.
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function login(page, user = 'standard_user') {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory/);
}

test('6.1 two isolated contexts = two different users at once', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await login(pageA, 'standard_user');          // A is logged in
  await pageB.goto('/inventory.html');          // B has no session
  await expect(pageB).not.toHaveURL(/inventory\.html$/);   // redirected to login
  await expect(pageB.locator('[data-test="error"]')).toContainText("only access '/inventory.html' when you are logged in");

  await contextA.close();
  await contextB.close();
});

test('6.2 multiple pages (tabs) share one context', async ({ context }) => {
  const page1 = await context.newPage();
  await login(page1);
  const page2 = await context.newPage();        // same context -> same cookies/storage
  await page2.goto('/inventory.html');
  await expect(page2.locator('.title')).toHaveText('Products');   // already logged in!
  console.log('Open pages in context:', context.pages().length);
});

test('6.3 cookies: read, add, clear', async ({ page, context }) => {
  await login(page);
  const cookies = await context.cookies();
  console.log('Cookies:', cookies.map(c => c.name));
  expect(cookies.some(c => c.name === 'session-username')).toBeTruthy();

  await context.addCookies([{ name: 'demo', value: '123', url: 'https://www.saucedemo.com' }]);
  expect((await context.cookies()).some(c => c.name === 'demo')).toBeTruthy();

  await context.clearCookies();
  await page.reload();
  await expect(page).not.toHaveURL(/inventory\.html$/);           // logged out
});

test('6.4 save login once with storageState, reuse it', async ({ browser }) => {
  const authFile = path.join(__dirname, '..', '.auth', 'user.json');
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  // Step 1: log in and save the session
  const setupCtx = await browser.newContext();
  const setupPage = await setupCtx.newPage();
  await login(setupPage);
  await setupCtx.storageState({ path: authFile });
  await setupCtx.close();

  // Step 2: new context starts already logged in. No login steps needed.
  const ctx = await browser.newContext({ storageState: authFile });
  const page = await ctx.newPage();
  await page.goto('/inventory.html');
  await expect(page.locator('.title')).toHaveText('Products');
  await ctx.close();
});

test('6.5 context options: viewport, locale, geolocation, permissions', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },       // phone-sized
    locale: 'hi-IN',
    timezoneId: 'Asia/Kolkata',
    geolocation: { latitude: 27.1767, longitude: 78.0081 },
    permissions: ['geolocation'],
  });
  const page = await ctx.newPage();
  await page.goto('/');
  const width = await page.evaluate(() => window.innerWidth);
  expect(width).toBe(390);
  const lang = await page.evaluate(() => navigator.language);
  expect(lang).toBe('hi-IN');
  await ctx.close();
});

test('6.6 handle a new tab opened by a click', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Click Here' }).click(),
  ]);
  await expect(popup.locator('h3')).toHaveText('New Window');
  await popup.close();
  await expect(page.locator('h3')).toHaveText('Opening a new window');
});

test('6.7 network mocking is per context', async ({ page }) => {
  await page.route('**/*.png', route => route.abort());   // block all images
  await login(page);
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

// PRACTICE: log in as standard_user in context A and problem_user in context B,
// add different items to each cart, and assert the cart badges don't affect each other.
