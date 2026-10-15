// TOPIC 4: Auto-waiting
// Before click()/fill() etc., Playwright waits until the element is:
//   attached, visible, stable (not animating), enabled, and not covered by another element.
// You almost never need sleeps or manual waits.
const { test, expect } = require('@playwright/test');

const BASE = 'https://the-internet.herokuapp.com';

test('4.1 element hidden in DOM, revealed after loading', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_loading/1`);
  await page.getByRole('button', { name: 'Start' }).click();
  // The text is NOT there yet. expect() retries until it appears (up to the timeout).
  await expect(page.locator('#finish h4')).toHaveText('Hello World!', { timeout: 15_000 });
});

test('4.2 element added to DOM after loading', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_loading/2`);
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.locator('#loading')).toBeHidden({ timeout: 15_000 });  // loader disappears
  await expect(page.locator('#finish')).toContainText('Hello World!');
});

test('4.3 click auto-waits for a disabled input to become enabled', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_controls`);
  const input = page.locator('#input-example input');
  await expect(input).toBeDisabled();
  await page.locator('#input-example button').click();       // "Enable"
  await input.fill('auto-waiting works');                    // waits until enabled, no sleep!
  await expect(input).toHaveValue('auto-waiting works');
});

test('4.4 wait for a checkbox to be removed', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_controls`);
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('#message')).toHaveText("It's gone!", { timeout: 15_000 });
  await expect(page.locator('#checkbox')).toHaveCount(0);
});

test('4.5 waitFor on a locator (explicit wait when you really need one)', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_loading/1`);
  await page.getByRole('button', { name: 'Start' }).click();
  await page.locator('#finish').waitFor({ state: 'visible', timeout: 15_000 });
  console.log(await page.locator('#finish').innerText());
});

test('4.6 wait for network response while clicking', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory/);
  // Pattern for pages that call an API after an action:
  //   const [resp] = await Promise.all([
  //     page.waitForResponse(r => r.url().includes('/api/orders') && r.status() === 200),
  //     page.getByRole('button', { name: 'Submit' }).click(),
  //   ]);
  //   expect(await resp.json()).toHaveProperty('id');
});

test('4.7 expect.poll: retry any custom value until it matches', async ({ page }) => {
  await page.goto(`${BASE}/add_remove_elements/`);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Add Element' }).click();
  }
  await expect.poll(async () => page.locator('.added-manually').count()).toBe(3);
});

test('4.8 ANTI-PATTERN: fixed sleep (avoid!)', async ({ page }) => {
  await page.goto(`${BASE}/dynamic_loading/1`);
  await page.getByRole('button', { name: 'Start' }).click();
  // await page.waitForTimeout(6000);   // BAD: slow when fast, flaky when slow
  await expect(page.locator('#finish h4')).toBeVisible({ timeout: 15_000 });  // GOOD
});

// PRACTICE: run with --headed and watch Playwright wait. Then set { timeout: 1000 } on 4.1 and see it fail.
