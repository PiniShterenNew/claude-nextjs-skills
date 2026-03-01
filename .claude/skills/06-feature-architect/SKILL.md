---
name: feature-architect
description: "Plans and scaffolds the folder structure for a new feature in a feature-based Next.js architecture. Use at the start of every new feature, when adding a module to the codebase, when the user asks how to structure or organize a feature, when creating the initial files for any new product area, or when asked to 'set up a feature', 'scaffold a module', 'create the folder structure for', 'organize the code for', or 'start a new section of the app'."
allowed-tools: Read, Bash
---

# Feature Architect

## Purpose
Creates the folder structure and initial files for a new feature following the
feature-based architecture. Enforces feature isolation, sets up the public API,
and places the minimal boilerplate so other skills can immediately fill in content.

## Inputs Required
Before executing, confirm you have:
- [ ] Feature name (kebab-case, e.g., `product-catalog`, `user-profile`)
- [ ] Which sub-folders are needed (all 7, or only some)
- [ ] Whether this feature needs global state (Zustand slice)

## Feature Sub-Folder Checklist

| Sub-folder | Include when | Skip when |
|-----------|-------------|-----------|
| `components/` | Always | Never |
| `hooks/` | Need TanStack Query or form logic | Pure RSC feature with no client data |
| `store/` | State shared across 3+ components | State is local or server-only |
| `api/` | Need Server Actions or query fns | Read-only RSC fetching directly |
| `types/` | Always | Never |
| `utils/` | Have pure transformation functions | No complex data transformation |

## Scaffold Instructions

### Step 1 — Create Folder Structure
```bash
mkdir -p src/features/[feature-name]/{components,hooks,api,types,utils}
# Add store/ only if needed:
mkdir -p src/features/[feature-name]/store
```

### Step 2 — Create Initial Files

**types/index.ts** — always create first:
```typescript
// src/features/[feature-name]/types/index.ts
import type { BaseEntity } from '@/shared/types/entities'

export interface [FeatureName] extends BaseEntity {
  // TODO: add domain fields
  name: string
  status: [FeatureName]Status
}

export type [FeatureName]Status = 'ACTIVE' | 'INACTIVE'

export interface [FeatureName]Filters {
  status?: [FeatureName]Status
  search?: string
  page?: number
  pageSize?: number
}

export interface Create[FeatureName]Input {
  name: string
  // TODO: add required creation fields
}

export interface Update[FeatureName]Input {
  id: string
  name?: string
  // TODO: add updatable fields
}
```

**api/[feature]Queries.ts** — query functions for TanStack Query:
```typescript
// src/features/[feature-name]/api/[feature]Queries.ts
import type { [FeatureName], [FeatureName]Filters } from '../types'
import type { ApiResponse, PaginationMeta } from '@/shared/types/api'

export async function fetch[FeatureName]List(
  filters: [FeatureName]Filters
): Promise<ApiResponse<{ items: [FeatureName][]; meta: PaginationMeta }>> {
  // TODO: implement — call Server Action or fetch from API
  throw new Error('Not implemented')
}

export async function fetch[FeatureName]ById(
  id: string
): Promise<ApiResponse<[FeatureName]>> {
  // TODO: implement
  throw new Error('Not implemented')
}
```

**api/[feature]Actions.ts** — Server Actions:
```typescript
// src/features/[feature-name]/api/[feature]Actions.ts
'use server'

import type { Create[FeatureName]Input, Update[FeatureName]Input, [FeatureName] } from '../types'
import type { ApiResponse } from '@/shared/types/api'

export async function create[FeatureName](
  input: unknown
): Promise<ApiResponse<[FeatureName]>> {
  // TODO: implement — validate, auth check, Prisma, return
  throw new Error('Not implemented')
}

export async function update[FeatureName](
  input: unknown
): Promise<ApiResponse<[FeatureName]>> {
  // TODO: implement
  throw new Error('Not implemented')
}

export async function delete[FeatureName](
  id: string
): Promise<ApiResponse<{ id: string }>> {
  // TODO: implement — soft delete (set deletedAt)
  throw new Error('Not implemented')
}
```

**hooks/use[Feature]Query.ts** — TanStack Query hooks:
```typescript
// src/features/[feature-name]/hooks/use[Feature]Query.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetch[FeatureName]List, fetch[FeatureName]ById } from '../api/[feature]Queries'
import { create[FeatureName], update[FeatureName], delete[FeatureName] } from '../api/[feature]Actions'
import type { [FeatureName]Filters } from '../types'

// Query key factory — always colocate with the hooks that use them
export const [feature]Queries = {
  all: () => ['[feature]'] as const,
  lists: () => [...[feature]Queries.all(), 'list'] as const,
  list: (filters: [FeatureName]Filters) => [...[feature]Queries.lists(), filters] as const,
  detail: (id: string) => [...[feature]Queries.all(), id] as const,
}

export function use[FeatureName]List(filters: [FeatureName]Filters) {
  return useQuery({
    queryKey: [feature]Queries.list(filters),
    queryFn: () => fetch[FeatureName]List(filters),
  })
}

export function use[FeatureName]Detail(id: string) {
  return useQuery({
    queryKey: [feature]Queries.detail(id),
    queryFn: () => fetch[FeatureName]ById(id),
    enabled: Boolean(id),
  })
}

export function useCreate[FeatureName]() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: create[FeatureName],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [feature]Queries.lists() })
    },
  })
}
```

**components/[Feature]Page.tsx** — page shell (thin orchestrator):
```typescript
// src/features/[feature-name]/components/[Feature]Page.tsx
import type { FC } from 'react'

const [FeatureName]Page: FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        [FeatureName]
      </h1>
      {/* TODO: compose List, Form, etc. */}
    </div>
  )
}

export { [FeatureName]Page }
```

**index.ts** — public API only:
```typescript
// src/features/[feature-name]/index.ts
export { [FeatureName]Page } from './components/[FeatureName]Page'
export type { [FeatureName], [FeatureName]Filters, Create[FeatureName]Input } from './types'
```

### Step 3 — Wire Route
```typescript
// src/app/[route]/page.tsx
import { [FeatureName]Page } from '@/features/[feature-name]'

export default function Page() {
  return <[FeatureName]Page />
}
```

## Naming Cheatsheet

| Input | Result |
|-------|--------|
| Feature name (kebab) | `product-catalog` |
| Feature name (PascalCase) | `ProductCatalog` |
| Feature name (camelCase) | `productCatalog` |
| Types file | `types/index.ts` |
| Server Actions file | `api/productCatalogActions.ts` |
| Query functions file | `api/productCatalogQueries.ts` |
| TanStack Query hook file | `hooks/useProductCatalogQuery.ts` |
| Zustand slice file | `store/productCatalogSlice.ts` |
| Page component | `components/ProductCatalogPage.tsx` |

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `import { X } from '../other-feature'` | Move to shared/ or use events | Feature isolation |
| Business logic in `components/[F]Page.tsx` | Logic in hooks/ or api/ | Separation of concerns |
| Skip index.ts | Always create it | Enforces the public API contract |
| Create store/ by default | Only if state is truly cross-component | Avoid premature global state |

## Quality Checklist
- [ ] Feature folder created under `src/features/[feature-name]/`
- [ ] `types/index.ts` created with entity + filter + input types
- [ ] `api/` files have correct `'use server'` directive
- [ ] `hooks/` file has query key factory
- [ ] `index.ts` exports only public API
- [ ] Route wired in `src/app/`
- [ ] `npm run typecheck` passes

## Related Skills
- `type-system`: Refine the types created here
- `data-layer`: Fill in the Server Action implementations
- `state-architect`: Design the Zustand slice if needed
- `component-builder`: Build the actual component content
- `db-schema`: Create the Prisma model for this feature's entity
