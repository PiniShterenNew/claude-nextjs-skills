# Component Patterns Reference

## Suspense + Streaming

Use Suspense to stream content from Server Components progressively.

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import { ProductListSkeleton } from '@/features/products'

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <Suspense fallback={<ProductListSkeleton />}>
        {/* This async component streams in when ready */}
        <ProductListRSC />
      </Suspense>
    </div>
  )
}

// RSC that fetches data asynchronously
async function ProductListRSC() {
  const products = await fetchProducts() // direct Prisma or fetch
  return <ProductList items={products} />
}
```

## Error Boundary (error.tsx)

```typescript
// app/dashboard/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.)
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center"
    >
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        An unexpected error occurred. Try again or contact support if this persists.
      </p>
      <Button onClick={reset} variant="secondary">Try again</Button>
    </div>
  )
}
```

## Loading Page (loading.tsx)

```typescript
// app/dashboard/loading.tsx
import { ProductListSkeleton } from '@/features/products'

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="h-8 w-48 animate-pulse rounded bg-border mb-6" />
      <ProductListSkeleton />
    </div>
  )
}
```

## Not Found (not-found.tsx)

```typescript
// app/dashboard/not-found.tsx
import Link from 'next/link'
import { Button } from '@/shared/components/ui'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
      <p className="text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
```

## Optimistic UI with useMutation

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProduct } from '../api/productActions'
import { productQueries } from '../hooks/useProductQuery'
import type { Product } from '../types'

function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    // Optimistic update — remove immediately before server confirms
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: productQueries.lists() })
      const previous = queryClient.getQueryData(productQueries.lists())
      queryClient.setQueryData(productQueries.lists(), (old: Product[]) =>
        old.filter((p) => p.id !== product.id)
      )
      return { previous } // context for onError rollback
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(productQueries.lists(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
    },
  })

  return (
    <article>
      <h3>{product.name}</h3>
      <button
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
        aria-label={`Delete ${product.name}`}
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
      </button>
    </article>
  )
}
```

## Infinite Scroll List

```typescript
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { fetchProductList } from '../api/productQueries'
import { productQueries } from '../hooks/useProductQuery'

function InfiniteProductList() {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: productQueries.lists(),
    queryFn: ({ pageParam }) => fetchProductList({ page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data?.meta ?? {}
      return page && totalPages && page < totalPages ? page + 1 : undefined
    },
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )
    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = data?.pages.flatMap((p) => p.data?.items ?? []) ?? []

  return (
    <>
      <ul className="grid gap-4">
        {items.map((item) => (
          <li key={item.id}>
            {/* render item */}
          </li>
        ))}
      </ul>
      {/* Intersection sentinel */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      {isFetchingNextPage && (
        <p role="status" className="text-center text-sm text-muted-foreground py-4">
          Loading more...
        </p>
      )}
    </>
  )
}
```

## Dynamic Import (code splitting)

```typescript
import dynamic from 'next/dynamic'
import { Skeleton } from '@/shared/components/ui'

// Split heavy components into separate chunks
const RichTextEditor = dynamic(
  () => import('@/shared/components/RichTextEditor'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Editor requires browser APIs
  }
)

const ChartWidget = dynamic(
  () => import('@/features/analytics/components/ChartWidget'),
  { loading: () => <Skeleton className="h-48 w-full" /> }
)
```

## Form with React Hook Form + Zod + Server Action

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input } from '@/shared/components/ui'
import { createProduct } from '../api/productActions'
import { productQueries } from '../hooks/useProductQuery'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  price: z.coerce.number().positive('Price must be positive'),
})

type FormValues = z.infer<typeof schema>

function CreateProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueries.lists() })
      reset()
      onSuccess?.()
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex flex-col gap-4"
      noValidate
    >
      <Input
        label="Name"
        required
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Price"
        type="number"
        required
        error={errors.price?.message}
        {...register('price')}
      />
      {mutation.error && (
        <p role="alert" className="text-sm text-error">
          Failed to create. Please try again.
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}
```
