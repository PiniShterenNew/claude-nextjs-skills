---
name: testing
description: "Writes tests for Next.js applications. Covers unit tests with Vitest, component tests with React Testing Library, API mocking with MSW, and end-to-end tests with Playwright. Use when writing any test file, following TDD, testing a component, hook, utility function, or Server Action, creating test fixtures, mocking API calls, or when the user asks about test coverage, test strategy, how to test something, or mentions spec files."
allowed-tools: Read, Bash
---

# Testing

## Purpose
Writes colocated, maintainable tests for Next.js features: unit tests for utilities,
component tests with RTL, and E2E tests with Playwright. Tests are colocated next to
source files and follow the Arrange-Act-Assert pattern.

## Test Colocation Structure

```
src/features/[feature]/
├── components/
│   ├── ProductCard.tsx
│   └── ProductCard.test.tsx    ← unit/component test here
├── hooks/
│   ├── useProductQuery.ts
│   └── useProductQuery.test.ts
├── utils/
│   ├── productUtils.ts
│   └── productUtils.test.ts
└── api/
    ├── productActions.ts
    └── productActions.test.ts  ← Server Action tests here

tests/
└── e2e/
    └── product-flow.spec.ts    ← Playwright (app/ level)
```

## Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', '.next/', 'tests/e2e/'],
    },
  },
})
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))
```

## Component Test Template

```typescript
// ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductCard } from './ProductCard'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 'prod_1',
  name: 'Test Product',
  price: 99.99,
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  createdById: 'user_1',
  categoryId: 'cat_1',
}

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText(/99.99/)).toBeInTheDocument()
  })

  it('shows ACTIVE badge for active products', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/active/i)).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(<ProductCard product={mockProduct} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledWith('prod_1')
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('disables delete button when loading', () => {
    render(<ProductCard product={mockProduct} isDeleting={true} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled()
  })

  it('renders empty state correctly', () => {
    render(<ProductCard product={{ ...mockProduct, name: '' }} />)
    // Assert what happens with empty data
  })
})
```

## Hook Test Template

```typescript
// useProductQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProductList } from './useProductQuery'
import { fetchProductList } from '../api/productQueries'

vi.mock('../api/productQueries')

const mockFetchProductList = vi.mocked(fetchProductList)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProductList', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns products on success', async () => {
    mockFetchProductList.mockResolvedValue({
      success: true,
      data: {
        items: [{ id: '1', name: 'Product A' }],
        meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
      },
    })

    const { result } = renderHook(
      () => useProductList({ page: 1 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.success).toBe(true)
    expect(result.current.data?.data.items).toHaveLength(1)
  })

  it('returns error state on failure', async () => {
    mockFetchProductList.mockResolvedValue({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed' },
    })

    const { result } = renderHook(
      () => useProductList({ page: 1 }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.success).toBe(false)
  })
})
```

## Utility Test Template

```typescript
// productUtils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, getStatusLabel } from './productUtils'

describe('formatPrice', () => {
  it('formats integer price correctly', () => {
    expect(formatPrice(99)).toBe('$99.00')
  })
  it('formats decimal price correctly', () => {
    expect(formatPrice(99.9)).toBe('$99.90')
  })
  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('getStatusLabel', () => {
  it.each([
    ['ACTIVE', 'Active'],
    ['DRAFT', 'Draft'],
    ['ARCHIVED', 'Archived'],
  ])('returns %s label for %s status', (status, expected) => {
    expect(getStatusLabel(status as ProductStatus)).toBe(expected)
  })
})
```

## E2E Test Template (Playwright)

```typescript
// tests/e2e/product-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Product management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('user can create a product', async ({ page }) => {
    await page.goto('/products')
    await page.click('button:has-text("New Product")')

    // Fill form
    await page.fill('[name="name"]', 'New Test Product')
    await page.fill('[name="price"]', '49.99')
    await page.selectOption('[name="categoryId"]', { label: 'Electronics' })
    await page.click('button[type="submit"]')

    // Assert success
    await expect(page.getByText('New Test Product')).toBeVisible()
    await expect(page.getByText('$49.99')).toBeVisible()
  })

  test('shows validation error for missing name', async ({ page }) => {
    await page.goto('/products/new')
    await page.click('button[type="submit"]')

    await expect(page.getByRole('alert')).toContainText('Name is required')
  })

  test('user can delete a product', async ({ page }) => {
    await page.goto('/products')
    // Find a specific product
    const row = page.getByText('Product to Delete').locator('..')
    await row.getByRole('button', { name: /delete/i }).click()
    // Confirm deletion modal
    await page.getByRole('button', { name: /confirm/i }).click()

    await expect(page.getByText('Product to Delete')).not.toBeVisible()
  })
})
```

## MSW (API Mocking)

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    return HttpResponse.json({
      success: true,
      data: {
        items: [{ id: '1', name: 'Mocked Product', status: 'ACTIVE' }],
        meta: { total: 1, page, pageSize: 20, totalPages: 1 },
      },
    })
  }),
  http.post('/api/products', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: { id: 'new_1', ...body } })
  }),
]

// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)

// tests/setup.ts
import { server } from './mocks/server'
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `getByTestId('btn')` | `getByRole('button', { name: /save/i })` | Tests behavior, not implementation |
| Test implementation details | Test user-visible behavior | Brittle tests |
| `wrapper: createWrapper` forgotten | Always provide QueryClient wrapper | Missing provider errors |
| `screen.debug()` left in | Remove before committing | Noise in output |
| `page.waitForTimeout(3000)` | `await expect(x).toBeVisible()` | Flaky E2E tests |
| One huge test file | One test file per source file | Maintainability |

## Quality Checklist
- [ ] Tests colocated next to source files
- [ ] Each test has a single, clear assertion goal
- [ ] Queries use role/label selectors (not testId)
- [ ] Async operations awaited with `waitFor`
- [ ] Mocks cleared in `beforeEach`
- [ ] `npm run test` passes with zero failures

## Related Skills
- `component-builder`: Components to be tested
- `data-layer`: Server Actions to unit test
- `error-handling`: Test error states explicitly
