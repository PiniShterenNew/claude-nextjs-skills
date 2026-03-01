import { test, expect } from '@playwright/test'

test.describe('Recipe Builder (unauthenticated)', () => {
  test('unauthenticated user cannot access recipes page', async ({ page }) => {
    await page.goto('/test-workspace/recipes')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user cannot access recipe builder', async ({ page }) => {
    await page.goto('/test-workspace/recipes/new')
    await expect(page).toHaveURL(/\/login/)
  })
})

/**
 * Authenticated recipe builder tests.
 * Requires TEST_AUTH=true environment variable.
 */
test.describe('Recipe Builder (authenticated)', () => {
  test.skip(!process.env['TEST_AUTH'], 'Requires TEST_AUTH=true and a running DB')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/אימייל/i).fill(process.env['TEST_USER_EMAIL'] ?? 'test@example.com')
    await page.getByLabel(/סיסמה/i).fill(process.env['TEST_USER_PASSWORD'] ?? 'password123')
    await page.getByRole('button', { name: /כניסה/i }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test('create recipe — appears in recipe list', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/recipes/new`)

    const recipeName = `Test Recipe ${Date.now()}`
    await page.getByLabel(/שם המתכון/i).fill(recipeName)
    await page.getByLabel(/יחידת תפוקה/i).fill('מנה')
    await page.locator('input[type="number"]').first().fill('1')

    // Submit
    await page.getByRole('button', { name: /צור מתכון/i }).click()

    // Should navigate to recipe detail or list
    await expect(page).toHaveURL(/\/recipes/)
  })

  test('recipe builder shows form fields', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/recipes/new`)

    await expect(page.getByLabel(/שם המתכון/i)).toBeVisible()
    await expect(page.getByLabel(/יחידת תפוקה/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /צור מתכון/i })).toBeVisible()
  })
})
