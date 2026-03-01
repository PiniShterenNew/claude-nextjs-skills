---
name: type-system
description: "Designs the TypeScript type architecture for a Next.js project. Covers shared base types, entity types, API response types, form input types, and type utility patterns. Use when creating TypeScript types or interfaces, organizing the type system, typing a specific data structure, eliminating any types, resolving TypeScript errors, designing type utilities, or when the user asks about TypeScript organization, strict types, or how to type something."
allowed-tools: Read
---

# Type System

## Purpose
Designs a consistent, strict TypeScript type hierarchy. Establishes shared base types,
entity types derived from Prisma, API response envelopes, form input types, and utility
types — eliminating `any` and enabling maximum type safety.

## Shared Base Types

```typescript
// src/shared/types/entities.ts

// ── Primitives ─────────────────────────────────────────────────────────────

export type ID = string // cuid() format

// ISO 8601 string — NOT Date (not JSON-serializable from Server → Client)
export type ISODateString = string

// ── Base Entity ────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: ID
  createdAt: ISODateString
  updatedAt: ISODateString
  deletedAt: ISODateString | null
}

// ── Audit ──────────────────────────────────────────────────────────────────

export interface AuditFields {
  createdById: ID
}

// ── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
}

// Combined filter base — feature filters extend this
export type BaseFilters = PaginationParams & SortParams & SearchParams
```

```typescript
// src/shared/types/api.ts

export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: ApiError }

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
  field?: string // For validation errors — dot-notation path
}

// Convenience type for paginated lists
export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  meta: PaginationMeta
}>
```

## Entity Type Pattern

```typescript
// src/features/[feature]/types/index.ts
import type { BaseEntity, AuditFields, BaseFilters } from '@/shared/types/entities'

// ── Domain Entity ──────────────────────────────────────────────────────────

export interface Product extends BaseEntity, AuditFields {
  name: string
  description: string | null
  price: number         // Use number client-side (Prisma Decimal → number)
  status: ProductStatus
  imageUrl: string | null
  categoryId: string
  // Relations (optional — only when included in query)
  category?: { id: string; name: string; slug: string }
  createdBy?: { id: string; name: string | null }
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

// ── Input Types ────────────────────────────────────────────────────────────

// Create: required domain fields only (no audit/base fields)
export interface CreateProductInput {
  name: string
  description?: string
  price: number
  categoryId: string
  imageUrl?: string
}

// Update: all fields optional + required id
export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
}

// ── Filter/Query Types ─────────────────────────────────────────────────────

export interface ProductFilters extends BaseFilters {
  status?: ProductStatus
  categoryId?: string
  minPrice?: number
  maxPrice?: number
}
```

## Type Utilities

```typescript
// src/shared/types/utils.ts

// Derive Create/Update types from entity (when entity extends BaseEntity)
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  keyof BaseEntity | 'createdById' | keyof { [K in keyof T as T[K] extends object | undefined ? K : never]: never }
>

export type UpdateInput<T extends BaseEntity> = Partial<CreateInput<T>> & { id: string }

// Nullable vs Optional
// T | null   → field exists but can be null (DB nullable column)
// T | undefined → field may not exist (optional object property)

// Make specific fields required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Make specific fields optional
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Deep readonly (for immutable config objects)
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// Extract the data type from ApiResponse
export type ResponseData<T> = T extends { success: true; data: infer D } ? D : never

// Discriminated union helper
export type Awaited<T> = T extends Promise<infer U> ? U : T
```

## Strict TypeScript Rules

```json
// tsconfig.json — minimum strict settings
{
  "compilerOptions": {
    "strict": true,              // Enables: strictNullChecks, noImplicitAny, etc.
    "noUncheckedIndexedAccess": true,  // arr[0] is T | undefined (safer)
    "exactOptionalPropertyTypes": true, // undefined !== missing property
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Common Patterns

### Discriminated Union (for state machines)
```typescript
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Exhaustive switch — TypeScript errors if a case is missed
function renderState(state: LoadState<Product[]>) {
  switch (state.status) {
    case 'idle': return <EmptyState />
    case 'loading': return <Skeleton />
    case 'success': return <ProductList items={state.data} />
    case 'error': return <ErrorState message={state.error} />
    // No default needed — all cases covered
  }
}
```

### Type Guards (instead of `as`)
```typescript
// ❌ Never
const data = response as Product

// ✅ Type guard
function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'status' in value
  )
}

function isApiSuccess<T>(res: ApiResponse<T>): res is { success: true; data: T } {
  return res.success === true
}

// Usage
if (isApiSuccess(response)) {
  // response.data is T — fully typed
  console.log(response.data.id)
}
```

### Const Assertions for Enums
```typescript
// Prefer const objects over TypeScript enums (tree-shakeable, inspectable)
const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const

type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS]
// = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
```

### Branded Types (for IDs)
```typescript
// Prevent accidentally mixing different ID types
type ProductId = string & { readonly __brand: 'ProductId' }
type UserId = string & { readonly __brand: 'UserId' }

function createProductId(id: string): ProductId {
  return id as ProductId
}

function getProduct(id: ProductId) { /* ... */ }

// TypeScript will error if you pass a UserId where ProductId is expected
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `any` | `unknown` + type guard | any disables type checking |
| `as T` (cast) | Type guard or zod parsing | Casts hide real type errors |
| `Date` in entity types | `ISODateString` | Date is not JSON-serializable |
| TypeScript `enum` | `const` object + union type | Enums compile to IIFE, not tree-shakeable |
| Optional everything (`T?`) | Explicit `T | null` vs `T | undefined` | Semantically different |
| `interface {}` (empty) | `Record<string, never>` | Confusing, accepts everything |

## Quality Checklist
- [ ] `src/shared/types/entities.ts` created with BaseEntity, BaseFilters
- [ ] `src/shared/types/api.ts` created with ApiResponse, PaginationMeta
- [ ] Every feature has `Create[F]Input` and `Update[F]Input` types
- [ ] No `any` in the codebase (`grep -r ": any"` returns empty)
- [ ] No `Date` objects in entity/response types
- [ ] `npm run typecheck` passes with zero errors

## Related Skills
- `feature-architect`: Creates the types/ folder this skill fills
- `db-schema`: Prisma types inform the entity type structure
- `data-layer`: ApiResponse and API error types used everywhere
