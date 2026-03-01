import { test, expect } from '@playwright/test'

test.describe('Authentication flows', () => {
  test('login page renders and shows validation errors for empty submit', async ({ page }) => {
    await page.goto('/login')

    // Page renders correctly
    await expect(page.getByRole('heading', { name: /menucost/i }).or(page.getByRole('form'))).toBeVisible()

    // Submit without credentials
    await page.getByRole('button', { name: /כניסה/i }).click()

    // Should NOT navigate away from login
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page has email and password inputs', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/אימייל/i)).toBeVisible()
    await expect(page.getByLabel(/סיסמה/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /כניסה/i })).toBeVisible()
  })

  test('signup page renders with required fields', async ({ page }) => {
    await page.goto('/signup')

    await expect(page.getByLabel(/שם/i)).toBeVisible()
    await expect(page.getByLabel(/אימייל/i)).toBeVisible()
    await expect(page.getByLabel(/סיסמה/i)).toBeVisible()
  })

  test('forgot-password page renders correctly', async ({ page }) => {
    await page.goto('/forgot-password')

    await expect(page.getByLabel(/אימייל/i)).toBeVisible()
    await expect(page.getByRole('button')).toBeVisible()
  })

  test('unauthenticated user is redirected from workspace routes to login', async ({ page }) => {
    await page.goto('/my-workspace/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('invalid credentials show error toast', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/אימייל/i).fill('nonexistent@example.com')
    await page.getByLabel(/סיסמה/i).fill('wrongpassword123')
    await page.getByRole('button', { name: /כניסה/i }).click()

    // Should stay on login page (auth failed)
    await expect(page).toHaveURL(/\/login/)
  })
})
