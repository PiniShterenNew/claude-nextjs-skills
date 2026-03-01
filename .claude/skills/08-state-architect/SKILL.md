---
name: state-architect
description: "Designs and implements state management for Next.js features. Covers Zustand store slices, TanStack Query v5 patterns, URL state with searchParams, and local React state decisions. Use when adding state to a feature, designing a store slice, setting up data fetching hooks, handling optimistic updates, implementing filters or pagination, or when the user asks where state should live, how to share state, or how to manage any kind of application data."
allowed-tools: Read
---

# State Architect

## Purpose
Applies a strict decision tree to determine where state should live, then implements
the correct pattern. Prevents the most common mistake in Next.js apps: putting
everything in global state or mixing server state into Zustand.

## State Decision Tree

```
1. Can the state be described by the URL?
   (filters, search, pagination, active tab, selected ID visible in browser)
   → URL state: useSearchParams + useRouter
   → Why: bookmarkable, shareable, survives refresh, no hydration issues

2. Is it UI-only (purely visual, never shared)?
   (modal open, hover, accordion, local form field)
   → useState colocated in the component
   → Why: minimal scope, no unnecessary re-renders

3. Do 3+ components in the same feature tree need the same non-URL state?
   (wizard step, multi-step form state, drag-and-drop context)
   → Feature-scoped React Context (NOT Zustand)
   → Why: scoped to the tree, auto-cleans on unmount

4. Is it async data from the server?
   (lists, detail views, paginated data, mutations)
   → TanStack Query (useQuery, useMutation, useInfiniteQuery)
   → Why: caching, invalidation, optimistic updates, loading/error states

5. Does state need to persist across route changes and be shared across features?
   (cart contents, authenticated user, notification count, sidebar collapsed)
   → Zustand global store slice
   → NOT for: server data (use TanStack Query), URL-sharable state, UI-only
```

## URL State Pattern

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { ProductFilters } from '../types'

function useProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: ProductFilters = {
    status: (searchParams.get('status') as ProductFilters['status']) ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: Number(searchParams.get('page') ?? '1'),
    pageSize: Number(searchParams.get('pageSize') ?? '20'),
  }

  const setFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })
      // Reset to page 1 when filters change
      if (!('page' in updates)) params.set('page', '1')
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const resetFilters = useCallback(() => {
    router.push('?', { scroll: false })
  }, [router])

  return { filters, setFilters, resetFilters }
}

export { useProductFilters }
```

## Zustand Slice Pattern

```typescript
// src/features/[feature]/store/[feature]Slice.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import type { ProductFilters } from '../types'

interface ProductState {
  // State
  selectedId: string | null
  sidebarOpen: boolean
  filters: ProductFilters

  // Actions
  setSelectedId: (id: string | null) => void
  toggleSidebar: () => void
  updateFilters: (partial: Partial<ProductFilters>) => void
  reset: () => void
}

const initialState = {
  selectedId: null,
  sidebarOpen: false,
  filters: { page: 1, pageSize: 20 },
}

const useProductStore = create<ProductState>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setSelectedId: (id) => set((s) => { s.selectedId = id }),
      toggleSidebar: () => set((s) => { s.sidebarOpen = !s.sidebarOpen }),
      updateFilters: (partial) => set((s) => { Object.assign(s.filters, partial) }),
      reset: () => set(initialState),
    })),
    { name: 'product' }
  )
)

// Memoized selectors — define OUTSIDE component to keep stable references
const selectSelectedId = (s: ProductState) => s.selectedId
const selectSidebarOpen = (s: ProductState) => s.sidebarOpen
const selectFilters = (s: ProductState) => s.filters

export { useProductStore, selectSelectedId, selectSidebarOpen, selectFilters }
```

## TanStack Query v5 Patterns

### Query Key Factory
```typescript
// Always colocate with hooks that use them
export const productQueries = {
  all: () => ['product'] as const,
  lists: () => [...productQueries.all(), 'list'] as const,
  list: (filters: ProductFilters) => [...productQueries.lists(), filters] as const,
  detail: (id: string) => [...productQueries.all(), id] as const,
  infinite: (filters: ProductFilters) => [...productQueries.lists(), 'infinite', filters] as const,
}
```

### Query Hook
```typescript
export function useProductList(filters: ProductFilters) {
  return useQuery({
    queryKey: productQueries.list(filters),
    queryFn: () => fetchProductList(filters),
    staleTime: 30_000,           // 30s before re-fetch on focus
    placeholderData: keepPreviousData, // no jump when filters change
  })
}
```

### Mutation with Cache Update
```typescript
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProductAction,
    onSuccess: (response) => {
      if (!response.success) return
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
      // Optionally seed the detail cache immediately
      queryClient.setQueryData(
        productQueries.detail(response.data.id),
        response
      )
    },
  })
}
```

### QueryClient Global Config

```typescript
// src/shared/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,        // 1 min default stale time
        retry: 1,                 // Retry once on failure
        refetchOnWindowFocus: false, // Disable for app-like feel
      },
      mutations: {
        onError: (error) => {
          console.error('[Mutation Error]', error)
        },
      },
    },
  })
}
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Store server data in Zustand | TanStack Query | Duplication, stale data |
| Put URL-sharable state in Zustand | searchParams | Break browser nav |
| Global store for UI-only state | useState in component | Unnecessary coupling |
| Define Zustand selector inside component | Define outside component | Stable reference |
| Forget `keepPreviousData` on paginated lists | Add it | Prevents content flicker |
| `useQuery` without `staleTime` | Set staleTime explicitly | Avoids over-fetching |

## Quality Checklist
- [ ] State decision documented using the decision tree above
- [ ] URL state uses `useSearchParams` + `useRouter` (not useState)
- [ ] Zustand selectors defined outside components
- [ ] TanStack Query uses query key factory
- [ ] `staleTime` set on all queries (not 0)
- [ ] Mutations invalidate the correct query keys on success
- [ ] `npm run typecheck` passes

## Related Skills
- `data-layer`: Implements the Server Actions that mutations call
- `component-builder`: Consumes the hooks designed here
- `feature-architect`: Sets up the file structure for store/ and hooks/

## Reference
See `references/query-patterns.md` for mutation + optimistic update + infinite query patterns.
