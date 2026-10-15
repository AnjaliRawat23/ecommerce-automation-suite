// Custom fixtures: reusable setup/teardown injected into tests by name.
const base = require('@playwright/test');

// A small Page Object used by the fixtures
class LoginPage {
  constructor(page) {
    this.page = page;
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginBtn = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
  }
  async goto() { await this.page.goto('/'); }
  async login(user, pass) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginBtn.click();
  }
}

class InventoryPage {
  constructor(page) {
    this.page = page;
    this.items = page.locator('.inventory_item');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }
  async addToCart(productName) {
    await this.items.filter({ hasText: productName })
      .getByRole('button', { name: 'Add to cart' }).click();
  }
}

// Extend the base test with our own fixtures
exports.test = base.test.extend({
  // 1) simple object fixture
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);            // test runs here
    // anything after `use` is teardown
  },

  // 2) fixture that depends on another fixture and does setup work
  inventoryPage: async ({ loginPage, page }, use) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await use(new InventoryPage(page));
  },

  // 3) fixture with data and a teardown step
  testUser: async ({}, use) => {
    const user = { name: 'standard_user', password: 'secret_sauce' };
    console.log('[setup] preparing test user');
    await use(user);
    console.log('[teardown] cleaning up test user');
  },

  // 4) option fixture: value you can override per file/describe
  productName: ['Sauce Labs Backpack', { option: true }],
});

exports.expect = base.expect;
