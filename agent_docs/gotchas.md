# Gotchas & Known Edge Cases

## Next.js App Router Pitfalls

### RSC / Client Boundary
- `async` components are Server Components — never add `'use client'` to them.
- Hooks (`useState`, `useEffect`, TanStack Query hooks) require `'use client'`.
- Passing non-serializable props (functions, class instances, Date objects) across
  the RSC → Client boundary causes a runtime error. Use ISO strings for dates.
- `cookies()`, `headers()`, `redirect()` from `next/headers` can ONLY be called in RSC,
  Server Actions, or Route Handlers — not in Client Components.

### Server Actions
- Server Actions must be in a file with `'use server'` at the top, OR the
  individual function must have `'use server'` as its first line.
- Never call a Server Action directly from an RSC — only from Client Components
  or `<form action={...}>`.
- Server Actions are POST requests under the hood — they cannot be cached.
- Large file uploads should use a Route Handler instead of a Server Action
  (Server Actions have a 4MB body limit by default).

### Caching (Next.js 15)
- Next.js 15 changed defaults: `fetch()` is now `no-store` by default (was
  `force-cache` in 14). Be explicit about caching strategy.
- `revalidatePath()` and `revalidateTag()` only work inside Server Actions or
  Route Handlers, not in RSC render functions.
- Calling `cookies()` or `headers()` inside a route automatically opts it into
  dynamic rendering — no ISR for that route.

## TypeScript Strict Mode

- `strict: true` enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`.
- Never use `as any` — use `as unknown` + type guard instead.
- `Date` objects are not JSON-serializable. Always store/transmit dates as ISO strings.
  Use `new Date(isoString)` when you need a Date object client-side.
- Prisma returns `null` for optional fields — account for `T | null` vs `T | undefined`.
  Use `?? undefined` to convert if needed.

## Prisma

- **Always filter soft-deleted records**: every query must include `where: { deletedAt: null }`.
  Create a Prisma extension or middleware to enforce this globally.
- `prisma.findUnique()` returns `null` (not `undefined`) when not found.
- After any `schema.prisma` change, run `npm run db:generate` to regenerate the client.
- Never run `prisma db push` in production — use `prisma migrate deploy`.
- Prisma transactions have a default 5-second timeout. Long-running operations need
  explicit `$transaction([...], { timeout: 30000 })`.

## Authentication (NextAuth v5)

- `auth()` in a Server Component returns the session or `null` — always null-check.
- The `session.user.id` field requires a custom session callback to include it;
  it's not there by default.
- Middleware `auth()` runs on every matched route — keep it fast. No DB calls in middleware.
- OAuth providers require `NEXTAUTH_URL` to be set correctly in production.
- JWT sessions expire — implement token refresh if using long-lived sessions.

## TanStack Query v5

- v5 changed `useQuery` signature: `queryKey` and `queryFn` are now inside an options object
  (no positional args). Update any v4 patterns.
- `useMutation` `onSuccess` receives `(data, variables, context)` — use `variables` to
  update optimistic state.
- Stale time defaults to `0` — set a global default in `QueryClient` config.
- Infinite queries use `getNextPageParam` — ensure it returns `undefined` (not `null`)
  when there are no more pages.

## Tailwind CSS

- JIT mode is default in v3. Purging works via `content` globs — ensure all files
  with Tailwind classes are covered.
- Never construct class names dynamically with string concatenation:
  ```typescript
  // ❌ Breaks purging
  className={`text-${color}-500`}
  // ✅ Use full class names in a map
  const colorMap = { red: 'text-red-500', blue: 'text-blue-500' }
  className={colorMap[color]}
  ```
- `tailwind-merge` (`cn()` utility) handles conflicting classes — always use `cn()`,
  never raw string concatenation for conditional classes.

## Environment Variables

- Variables without `NEXT_PUBLIC_` prefix are server-only — they will be `undefined`
  in Client Components even if set in `.env.local`.
- `NEXT_PUBLIC_` vars are inlined at build time — changing them requires a rebuild.
- Never commit `.env.local` — it's git-ignored. Use `.env.example` as the template.

## Testing

- Vitest requires `@vitejs/plugin-react` in `vitest.config.ts`.
- React Testing Library: use `screen.getByRole` over `getByTestId` — prefer semantic queries.
- MSW v2 has breaking changes from v1 — ensure handlers use `http.get()` not `rest.get()`.
- Playwright tests run against the built app by default — run `npm run build` first or
  configure `webServer` in `playwright.config.ts` to auto-start dev server.

## Zustand

- Define selectors outside components to avoid recreating them on every render:
  ```typescript
  // ❌ New function reference on every render
  const count = useStore(s => s.count)
  // ✅ Stable reference
  const selectCount = (s: StoreState) => s.count
  const count = useStore(selectCount)
  ```
- Zustand `immer` middleware: mutate the draft directly, don't return from set callbacks.
- Never store non-serializable values (functions, class instances) in Zustand if you
  want devtools / persistence to work correctly.

## WebSocket

- Next.js Route Handlers do not natively support WebSocket upgrades.
  Use a separate Node.js server (e.g., `server.ts` with `ws` package) alongside Next.js,
  or use a managed service (Ably, Pusher, Liveblocks).
- Always implement exponential backoff reconnect logic — servers restart, connections drop.
- Clean up WebSocket connections in `useEffect` return function to prevent memory leaks.
