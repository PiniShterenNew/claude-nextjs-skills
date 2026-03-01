---
name: data-layer
description: "Implements the data access layer for Next.js: Server Actions, Route Handlers, and data fetching functions. Handles Zod validation, authentication checks, error normalization, and the standard ApiResponse format. Use when creating API routes, server actions, data fetching functions, or any code that reads from or writes to the database or calls external APIs. Also triggers on: 'create an API', 'add a server action', 'handle form submission on the server', 'fetch data from the database', 'call an external API', 'implement CRUD'."
allowed-tools: Read, WebFetch
---

# Data Layer

## Purpose
Implements validated, authenticated, and type-safe data access. Every mutation goes
through Zod validation and auth checks. Every response uses the standard ApiResponse
envelope. Never exposes internal errors to the client.

## Inputs Required
Before executing, confirm you have:
- [ ] The entity type (from type-system or feature-architect)
- [ ] The Prisma model (from db-schema)
- [ ] Auth requirements (public, authenticated, role-restricted)

## Standard Types

```typescript
// src/shared/types/api.ts
export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string; field?: string } }

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ApiError = { code: string; message: string; field?: string }

// Error code constants
export const API_ERRORS = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Authentication required' },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'You do not have permission' },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found' },
  INTERNAL: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
} as const
```

## Server Action Template

```typescript
// src/features/[feature]/api/[feature]Actions.ts
'use server'

import { z } from 'zod'
import { auth } from '@/shared/lib/auth'
import { db } from '@/shared/lib/prisma'
import { API_ERRORS } from '@/shared/types/api'
import type { ApiResponse } from '@/shared/types/api'
import type { Product } from '../types'

// Zod schemas for input validation
const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().cuid('Invalid category ID'),
})

const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().cuid('Invalid product ID'),
})

// CREATE
export async function createProductAction(
  input: unknown
): Promise<ApiResponse<Product>> {
  // 1. Auth check
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: API_ERRORS.UNAUTHORIZED }
  }

  // 2. Input validation
  const parsed = CreateProductSchema.safeParse(input)
  if (!parsed.success) {
    const err = parsed.error.errors[0]
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, field: err.path.join('.') },
    }
  }

  // 3. Business logic
  try {
    const product = await db.product.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
      },
    })
    return { success: true, data: product as Product }
  } catch (e) {
    console.error('[createProductAction]', e)
    return { success: false, error: API_ERRORS.INTERNAL }
  }
}

// UPDATE
export async function updateProductAction(
  input: unknown
): Promise<ApiResponse<Product>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: API_ERRORS.UNAUTHORIZED }

  const parsed = UpdateProductSchema.safeParse(input)
  if (!parsed.success) {
    const err = parsed.error.errors[0]
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, field: err.path.join('.') },
    }
  }

  try {
    const { id, ...data } = parsed.data
    // Authorization: check ownership
    const existing = await db.product.findUnique({
      where: { id, deletedAt: null },
      select: { createdById: true },
    })
    if (!existing) return { success: false, error: API_ERRORS.NOT_FOUND }
    if (existing.createdById !== session.user.id) {
      return { success: false, error: API_ERRORS.FORBIDDEN }
    }

    const product = await db.product.update({ where: { id }, data })
    return { success: true, data: product as Product }
  } catch (e) {
    console.error('[updateProductAction]', e)
    return { success: false, error: API_ERRORS.INTERNAL }
  }
}

// SOFT DELETE
export async function deleteProductAction(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: API_ERRORS.UNAUTHORIZED }

  const parsed = z.string().cuid().safeParse(id)
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } }
  }

  try {
    const existing = await db.product.findUnique({
      where: { id: parsed.data, deletedAt: null },
      select: { createdById: true },
    })
    if (!existing) return { success: false, error: API_ERRORS.NOT_FOUND }
    if (existing.createdById !== session.user.id) {
      return { success: false, error: API_ERRORS.FORBIDDEN }
    }

    await db.product.update({
      where: { id: parsed.data },
      data: { deletedAt: new Date() },
    })
    return { success: true, data: { id: parsed.data } }
  } catch (e) {
    console.error('[deleteProductAction]', e)
    return { success: false, error: API_ERRORS.INTERNAL }
  }
}
```

## Query Functions (for TanStack Query)

```typescript
// src/features/[feature]/api/[feature]Queries.ts
// These can be called from RSC directly OR used as queryFn in useQuery

import { db } from '@/shared/lib/prisma'
import type { ApiResponse, PaginationMeta } from '@/shared/types/api'
import type { Product, ProductFilters } from '../types'

export async function fetchProductList(
  filters: ProductFilters
): Promise<ApiResponse<{ items: Product[]; meta: PaginationMeta }>> {
  try {
    const page = filters.page ?? 1
    const pageSize = Math.min(filters.pageSize ?? 20, 100)
    const skip = (page - 1) * pageSize

    const where = {
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        name: { contains: filters.search, mode: 'insensitive' as const },
      }),
    }

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    return {
      success: true,
      data: { items: items as Product[], meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } },
    }
  } catch (e) {
    console.error('[fetchProductList]', e)
    return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch products' } }
  }
}
```

## Route Handler Template

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/shared/lib/auth'

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  // ... implementation

  return NextResponse.json({ success: true, data: [] })
}

export async function POST(request: NextRequest) {
  // ... POST implementation
}
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Trust raw `input` without Zod | Always `safeParse` first | Injection attacks |
| Expose error.message to client | Return `API_ERRORS.INTERNAL` | Leaks internals |
| Hard delete user data | Soft delete (`deletedAt`) | Compliance, recovery |
| Skip auth check in action | Always check session first | Authorization bypass |
| Use `parseInt()` for IDs | Validate with `z.string().cuid()` | Type safety |
| Forget `deletedAt: null` filter | Always include in `where` | Expose deleted records |

## Quality Checklist
- [ ] Every action validates with Zod before any DB call
- [ ] Auth check is the first operation after validation
- [ ] Ownership verified before update/delete
- [ ] All error paths return `ApiResponse<never>` with correct error code
- [ ] All DB queries include `deletedAt: null` filter
- [ ] Console.error logs full error server-side (never sent to client)
- [ ] `npm run typecheck` passes

## Related Skills
- `db-schema`: Provides the Prisma models used in queries
- `auth-flow`: Provides the `auth()` helper and session type
- `type-system`: Provides ApiResponse and entity types
- `state-architect`: Consumes these actions via useMutation

## Reference
See `references/api-patterns.md` for pagination, file upload, and webhook patterns.
