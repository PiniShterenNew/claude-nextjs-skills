import { test, expect } from '@playwright/test'

test.describe('Dashboard (unauthenticated)', () => {
  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/test-workspace/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})

/**
 * Authenticated dashboard tests.
 * Requires TEST_AUTH=true environment variable and a running app with DB.
 */
test.describe('Dashboard (authenticated)', () => {
  test.skip(!process.env['TEST_AUTH'], 'Requires TEST_AUTH=true and a running DB')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/אימייל/i).fill(process.env['TEST_USER_EMAIL'] ?? 'test@example.com')
    await page.getByLabel(/סיסמה/i).fill(process.env['TEST_USER_PASSWORD'] ?? 'password123')
    await page.getByRole('button', { name: /כניסה/i }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test('dashboard shows KPI section', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/dashboard`)

    await page.waitForLoadState('networkidle')

    // Should show KPI cards or empty state
    const hasKPIs = await page.getByText(/food cost/i).isVisible().catch(() => false)
    const hasEmptyState = await page.getByText(/אין מתכונים/i).isVisible().catch(() => false)

    expect(hasKPIs || hasEmptyState).toBe(true)
  })

  test('dashboard navigation works', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'
    await page.goto(`/${slug}/dashboard`)

    // Sidebar navigation links visible
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('dashboard page loads without errors', async ({ page }) => {
    const slug = process.env['TEST_WORKSPACE_SLUG'] ?? 'test-workspace'

    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(`/${slug}/dashboard`)
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })
})
