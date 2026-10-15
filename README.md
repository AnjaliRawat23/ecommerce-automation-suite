# Playwright + JavaScript Practice

## Setup
```bash
npm install
npx playwright install chromium
```

## Run
```bash
npx playwright test                         # everything, headless
npx playwright test tests/04-auto-waiting.spec.js --headed
npx playwright test -g "2.5"                # one test by name
npx playwright test --ui                    # UI mode (best for learning)
npx playwright show-report                  # HTML report
npx playwright codegen https://www.saucedemo.com   # record + pick locators
```

## Order to study
| File | Topic |
|------|-------|
| 01-async-await | await, Promise.all, for...of |
| 02-locators | getByRole, CSS, filter, chaining |
| 03-assertions | web-first, soft, regex, arrays |
| 04-auto-waiting | actionability, waitFor, expect.poll |
| 05-fixtures | built-in + custom fixtures, options |
| 06-browser-contexts | isolation, cookies, storageState |

## Practice sites used
- https://www.saucedemo.com (login: standard_user / secret_sauce)
- https://the-internet.herokuapp.com
- https://jsonplaceholder.typicode.com (API)
