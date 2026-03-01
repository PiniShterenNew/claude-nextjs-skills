# TanStack Query Patterns Reference

## Optimistic Update (full pattern)

```typescript
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProductAction(id),

    onMutate: async (id) => {
      // Cancel any in-flight refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: productQueries.lists() })

      // Snapshot current state for rollback
      const previousLists = queryClient.getQueriesData<ApiResponse<{ items: Product[] }>>({
        queryKey: productQueries.lists(),
      })

      // Optimistically update all list caches
      queryClient.setQueriesData<ApiResponse<{ items: Product[] }>>(
        { queryKey: productQueries.lists() },
        (old) => {
          if (!old?.success) return old
          return {
            ...old,
            data: { ...old.data, items: old.data.items.filter((p) => p.id !== id) },
          }
        }
      )

      return { previousLists }
    },

    onError: (_err, _id, context) => {
      // Roll back to snapshot
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSettled: () => {
      // Always refetch after mutation settles (error or success)
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
    },
  })
}
```

## Infinite Query (pagination / infinite scroll)

```typescript
export function useInfiniteProductList(baseFilters: Omit<ProductFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: productQueries.infinite(baseFilters),
    queryFn: ({ pageParam }) =>
      fetchProductList({ ...baseFilters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined
      const { page, totalPages } = lastPage.data.meta
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 30_000,
  })
}

// Usage:
function InfiniteList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteProductList({ status: 'ACTIVE' })

  const items = data?.pages.flatMap((p) => (p.success ? p.data.items : [])) ?? []

  if (status === 'pending') return <ListSkeleton />
  if (status === 'error') return <ErrorState />

  return (
    <>
      <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </>
  )
}
```

## Prefetching on Server (RSC + TanStack Query)

```typescript
// app/products/page.tsx — prefetch in RSC, hydrate on client
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { makeQueryClient } from '@/shared/lib/queryClient'
import { fetchProductList } from '@/features/products/api/productQueries'
import { productQueries } from '@/features/products/hooks/useProductQuery'
import { ProductListClient } from '@/features/products'

export default async function ProductsPage() {
  const queryClient = makeQueryClient()

  await queryClient.prefetchQuery({
    queryKey: productQueries.list({ page: 1, pageSize: 20 }),
    queryFn: () => fetchProductList({ page: 1, pageSize: 20 }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListClient />
    </HydrationBoundary>
  )
}
```

## Dependent Queries

```typescript
// Query B depends on result from Query A
function useProductWithCategory(productId: string) {
  const productQuery = useProductDetail(productId)

  const categoryQuery = useQuery({
    queryKey: ['category', productQuery.data?.data.categoryId],
    queryFn: () => fetchCategory(productQuery.data!.data.categoryId),
    enabled: productQuery.data?.success && Boolean(productQuery.data.data.categoryId),
  })

  return { product: productQuery, category: categoryQuery }
}
```

## Mutation with Toast Notification

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner' // or your toast library

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProductAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.error.message)
        return
      }
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
      queryClient.invalidateQueries({
        queryKey: productQueries.detail(response.data.id),
      })
    },
    onError: () => {
      toast.error('Failed to update product. Please try again.')
    },
  })
}
```

## Global QueryClient Provider

```typescript
// src/shared/providers/QueryProvider.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { makeQueryClient } from '../lib/queryClient'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState ensures QueryClient is not shared between requests (SSR safe)
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```
