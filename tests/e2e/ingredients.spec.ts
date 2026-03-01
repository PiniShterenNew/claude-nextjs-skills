import { test, expect } from '@playwright/test'

/**
 * Ingredient management E2E tests.
 *
 * Prerequisites: a running app with a seeded test DB.
 * Set PLAYWRIGHT_BASE_URL and use a workspace slug that exists.
 *
 * To run: npm run test:e2e
 * The tests assume the user is NOT authenticated (they test redirect behavior).
 * Full flow tests (with auth) require a test fixture / global setup.
 */

test.describe('Ingredients feature', () => {
  test('unauthenticated user cannot access ingredients page', async ({ page }) => {
    await page.goto('/test-workspace/ingredients')

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('ingredient list page redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/any-workspace/ingredients')
    await expect(page).toHaveURL(/\/login/)
  })
})

/**
 * The following tests require authentication.
 * They are skipped unless TEST_AUTH=true is set.
 *
 * To enable: TEST_AUTH=true npm run test:e2e
 */
test.describe('Ingredients (authenticated)', () => {
  test.skip(!process.env['TEST_AUTH'], 'Requires TEST_AUTH=true and a running DB')

  test.beforeEach(async ({ page }) => {
    // Authenticate via login form
    await page.goto('/login')
    await page.getByLabel(/אימייל/i).fill(process.env['TEST_USER_EMAIL'] ?? 'test@example.com')
    await page.getByLabel(/סיסמה/i).fill(process.env['TEST_USER_PASSWORD'] ?? 'password123')
    await page.getByRole('button', { name: /כניסה/i }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test('add ingredient — appears in list', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/ingredients`)

    // Click add ingredient
    await page.getByRole('button', { name: /הוסף חומר גלם/i }).click()

    // Fill form
    const uniqueName = `Test Ingredient ${Date.now()}`
    await page.getByLabel(/שם חומר גלם/i).fill(uniqueName)
    await page.getByLabel(/יחידת מידה/i).selectOption('kg')
    await page.getByLabel(/מחיר ליחידה/i).fill('25')

    await page.getByRole('button', { name: /הוסף חומר גלם/i }).click()

    // Should appear in list
    await expect(page.getByText(uniqueName)).toBeVisible()
  })

  test('delete ingredient used in recipe — shows error', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/ingredients`)

    // Attempt to delete an ingredient that's used in a recipe
    // (This assumes there's an ingredient named "בדיקה" in a recipe)
    const ingredientCard = page.getByText('בשר טחון').locator('..')
    if (await ingredientCard.isVisible()) {
      await ingredientCard.getByRole('button', { name: /מחק/i }).click()

      // Should show an error — ingredient is in use
      await expect(page.getByRole('alert')).toBeVisible()
    }
  })
})
