---
name: error-handling
description: "Implements error boundaries, API error normalization, and user-facing error states for Next.js applications. Use when creating error.tsx files, handling API failures, displaying error messages to users, logging errors, implementing fallback UI, or when the user mentions error handling, app crashes, unhandled exceptions, failure states, error pages, or error messages."
allowed-tools: Read
---

# Error Handling

## Purpose
Implements a layered error handling strategy: normalized API errors, Next.js error
boundaries, client-side error display, and server-side logging. Ensures internal
errors never reach the client and users always see a useful, actionable message.

## Error Layers

```
Layer 1: Server Action / Route Handler
  → Catch all errors, normalize, return ApiResponse<never> with error
  → Log full error server-side (never send to client)

Layer 2: Next.js error.tsx boundaries
  → Catch unhandled RSC render errors
  → Show retry UI

Layer 3: TanStack Query error states
  → Handle query/mutation failures in client components
  → Show inline error with retry

Layer 4: Global app/error.tsx
  → Last resort catch-all
  → Generic fallback UI
```

## Error Normalization

```typescript
// src/shared/lib/errors.ts

export type AppError = {
  code: string
  message: string  // Safe to show to users
  field?: string   // For validation errors
}

// Map error codes to user-friendly messages
const USER_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'You need to sign in to do that.',
  FORBIDDEN: "You don't have permission to do that.",
  NOT_FOUND: "The item you're looking for doesn't exist.",
  CONFLICT: 'This already exists. Please check your input.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again.',
}

export function normalizeError(e: unknown): AppError {
  // Log full error server-side
  if (e instanceof Error) {
    console.error('[Server Error]', {
      message: e.message,
      stack: e.stack,
      name: e.name,
    })
  } else {
    console.error('[Server Error] Unknown:', e)
  }

  // Return only safe, user-facing message — never internals
  return {
    code: 'INTERNAL_ERROR',
    message: USER_MESSAGES.INTERNAL_ERROR,
  }
}

export function getUserMessage(code: string): string {
  return USER_MESSAGES[code] ?? USER_MESSAGES.INTERNAL_ERROR
}
```

## Error Boundary Files

### Route-Level error.tsx (preferred)
```typescript
// src/app/dashboard/error.tsx  (or any route segment)
'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Report to error tracking (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary]', {
      message: error.message,
      digest: error.digest,
    })
    // reportError(error) // your error tracking call here
  }, [error])

  return (
    <div
      role="alert"
      className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center p-8"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          An unexpected error occurred. This has been reported.
          {error.digest && (
            <span className="block mt-1 font-mono text-xs">
              Reference: {error.digest}
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="secondary">
          Go home
        </Button>
      </div>
    </div>
  )
}
```

### Global app/error.tsx (last resort)
```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  // Must include <html> and <body> — this replaces the entire layout
  return (
    <html>
      <body>
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <h1 className="text-2xl font-bold">Application Error</h1>
          <p className="text-gray-600 max-w-sm">
            The application encountered a critical error. Please refresh the page.
          </p>
          <Button onClick={reset}>Refresh</Button>
        </div>
      </body>
    </html>
  )
}
```

### Not Found — app/not-found.tsx
```typescript
// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/shared/components/ui'

export default function NotFound() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
```

## Client-Side Error Display Patterns

### Inline API Error (after mutation)
```typescript
'use client'

function CreateProductForm() {
  const mutation = useCreateProduct()

  return (
    <form onSubmit={handleSubmit(mutation.mutate)}>
      {/* form fields */}

      {/* Show error inline — never in alert() or console */}
      {mutation.isError && (
        <div
          role="alert"
          className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
        >
          Failed to create product. Please try again.
        </div>
      )}

      {/* Show API error from response */}
      {mutation.data?.success === false && (
        <div role="alert" className="text-sm text-error">
          {getUserMessage(mutation.data.error.code)}
        </div>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}
```

### Query Error State
```typescript
function ProductList() {
  const { data, isError, error, refetch } = useProductList({ page: 1 })

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 py-12 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Failed to load products.
        </p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  // render list
}
```

## Server Action Error Pattern

```typescript
'use server'

export async function createProductAction(input: unknown) {
  const session = await auth()
  if (!session?.user) return { success: false, error: API_ERRORS.UNAUTHORIZED }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    const err = parsed.error.errors[0]
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, field: err.path.join('.') },
    }
  }

  try {
    // ... implementation
    return { success: true, data: result }
  } catch (e) {
    // Log full error server-side
    console.error('[createProductAction]', e)
    // Return safe message to client
    return { success: false, error: API_ERRORS.INTERNAL }
  }
}
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `return { error: e.message }` | `return { error: API_ERRORS.INTERNAL }` | Exposes stack traces |
| `alert(error.message)` | Inline `role="alert"` element | Blocks UI, inaccessible |
| Empty catch block | Log + return normalized error | Silent failures |
| One global error.tsx only | error.tsx per route segment | Granular recovery |
| `throw new Error()` in Server Action | `return { success: false, error }` | Actions shouldn't throw to client |

## Quality Checklist
- [ ] Every Server Action has a try/catch that returns `API_ERRORS.INTERNAL`
- [ ] All errors logged with `console.error` server-side before returning
- [ ] `error.tsx` created for each major route segment
- [ ] Client error display uses `role="alert"`
- [ ] No internal error messages exposed to the client
- [ ] `not-found.tsx` created at `app/` level
- [ ] `npm run typecheck` passes

## Related Skills
- `data-layer`: Server Action error handling pattern is defined here
- `component-builder`: Use error states in list/form components
- `testing`: Test error states explicitly (not just happy path)
