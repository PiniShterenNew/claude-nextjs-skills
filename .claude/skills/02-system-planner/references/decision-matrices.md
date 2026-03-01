# Decision Matrices (Extended)

## Component Rendering Decision Tree

```
Is the component purely presentational with no interactivity?
  YES → Server Component
  NO ↓

Does it handle DOM events (onClick, onChange, onSubmit)?
  YES → Client Component

Does it use React hooks (useState, useEffect, useRef, useContext)?
  YES → Client Component

Does it use browser APIs (window, localStorage, navigator, document)?
  YES → Client Component

Does it use a third-party library that requires the DOM?
  YES → Client Component

Does it fetch data asynchronously?
  → Server Component with async/await (no useEffect, no SWR/TanStack needed)

Does it show loading states or optimistic updates?
  → Wrap RSC in Suspense for loading; optimistic = Client Component with useMutation

Default:
  → Server Component
```

## Caching Strategy per Route

| Pattern | Next.js Config | Use Case |
|---------|---------------|----------|
| Fully static | `export const dynamic = 'force-static'` | Marketing, docs, blog |
| Time-based ISR | `export const revalidate = 60` | Product catalog, pricing |
| On-demand ISR | `revalidateTag('products')` in action | CMS-driven content |
| Fully dynamic | `export const dynamic = 'force-dynamic'` or `no-store` | Auth-gated, personalized |
| Per-request | `fetch(url, { cache: 'no-store' })` | External API, real-time data |

## Data Fetching Pattern Selection

| Scenario | Pattern | Code Location |
|----------|---------|--------------|
| Initial page load data (RSC) | `async` RSC with direct Prisma | `features/[f]/components/[F]Page.tsx` |
| Client-side read (with caching) | `useQuery` (TanStack Query) | `features/[f]/hooks/use[F]Query.ts` |
| Client-side mutation | `useMutation` (TanStack Query) + Server Action | `features/[f]/hooks/use[F]Query.ts` |
| Form submission | `<form action={serverAction}>` or `handleSubmit` + Server Action | `features/[f]/components/[F]Form.tsx` |
| Pagination / infinite scroll | `useInfiniteQuery` | `features/[f]/hooks/use[F]Query.ts` |
| Real-time | WebSocket + `queryClient.invalidateQueries` | `features/[f]/hooks/use[F]Realtime.ts` |

## State Colocation Rules

```
Can the state be described by URL?
  → Use searchParams (useSearchParams + useRouter)
  → Examples: ?page=2&filter=active&sort=createdAt

Is the state purely visual (open/closed, hover, focus)?
  → useState in the component that owns it
  → Don't lift unless 2+ siblings need it

Do 2 sibling components need the same state?
  → Lift to their nearest common parent's useState

Do 3+ components in a feature tree need the same state?
  → Feature-scoped React Context (not Zustand)

Does async server data need to be cached and shared?
  → TanStack Query with a shared query key factory
  → Never put server data in Zustand

Does state need to survive route changes and be shared across features?
  → Zustand store slice
  → Examples: auth user, shopping cart, notification count, sidebar collapsed

Is the state derived from server data (computed)?
  → Don't store — compute in selectors or useMemo
```

## API Layer Decision

```
Who calls this endpoint?
  Next.js Client Component only    → Server Action
  External service / webhook        → Route Handler (app/api/)
  Mobile app / third-party          → Route Handler with API key auth
  Another Next.js Server Component  → Call the function directly (not an action/route)

What does it return?
  Mutation result (create/update/delete)  → Server Action → ApiResponse<T>
  List / paginated data                   → Server Action (if client calls it)
  File download / stream                  → Route Handler
  SSE stream                              → Route Handler with TransformStream

How complex is the auth?
  Standard session auth       → Server Action (auth() from NextAuth)
  API key / HMAC signature    → Route Handler (custom middleware)
  Service-to-service (cron)   → Route Handler with shared secret header
```

## Zustand vs Context vs TanStack Query

| Criterion | Zustand | Context | TanStack Query |
|-----------|---------|---------|----------------|
| Scope | App-wide | Feature/tree | Async/server |
| Persists across routes | ✅ | ❌ | ✅ (cache) |
| Devtools | ✅ | ❌ | ✅ |
| Optimistic updates | Manual | Manual | Built-in |
| Server synchronization | Manual | Manual | Built-in |
| Use for server data | ❌ | ❌ | ✅ |
| Use for UI state | ✅ (global) | ✅ (local) | ❌ |
| Boilerplate | Low | Medium | Medium |
