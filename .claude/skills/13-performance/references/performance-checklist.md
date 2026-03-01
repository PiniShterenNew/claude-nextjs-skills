# Performance Checklist

## Pre-Launch Audit

Run in this order: build → measure → fix → measure again.

### 1. Build Analysis
```bash
npm run build
# Check output for:
# - Large page sizes (> 100KB JS for a single page = red flag)
# - Slow server-side rendering times
# - ISR pages that should be static

ANALYZE=true npm run build
# Open bundle-analyzer and look for:
# - node_modules in client bundle that shouldn't be there
# - Duplicate packages (multiple versions of react, lodash, etc.)
# - Vendor chunks > 500KB
```

### 2. Lighthouse Audit
```bash
npx lighthouse http://localhost:3000 --view --only-categories=performance
# Target: 90+ performance score
# Focus: LCP, CLS, INP (not FCP — less important)
```

### 3. Network Tab Checks
- Total page weight on initial load: < 300KB (compressed)
- Hero image served at correct size (not 4K image in 400px container)
- Fonts: max 2 font files, both preloaded
- API calls on page load: < 3 (consolidate where possible)

---

## Images Checklist

- [ ] Every `<img>` replaced with `next/image`
- [ ] LCP/hero image has `priority` prop
- [ ] All images have `alt` text (empty string for decorative)
- [ ] Images with unknown dimensions use `fill` + container div with `aspect-ratio`
- [ ] `sizes` prop set correctly on all images
- [ ] Remote image domains allowlisted in `next.config.ts`
- [ ] Blur placeholder on images that take > 200ms to load

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.example.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats
  },
}
```

## Fonts Checklist

- [ ] All fonts loaded via `next/font/google` (not Google CDN `<link>`)
- [ ] `display: 'swap'` on all fonts
- [ ] Only used subsets loaded (`subsets: ['latin']`)
- [ ] Font variable passed to `<html>` className
- [ ] Max 2 font families (heading + body)
- [ ] Italic/bold weights loaded only if used (`weight: ['400', '700']`)

## JavaScript Bundle Checklist

- [ ] No `moment.js` → use `date-fns` or `dayjs`
- [ ] No full lodash import → use individual functions or native
- [ ] No `react-icons` full import → use `@heroicons/react` or `lucide-react`
- [ ] All chart libraries dynamic imported with `ssr: false`
- [ ] All rich text editors dynamic imported with `ssr: false`
- [ ] All map libraries dynamic imported with `ssr: false`
- [ ] `'use client'` boundary placed as deep as possible in the tree
- [ ] Server-only code never imported on client (use `server-only` package)

```typescript
// Protect server-only modules
import 'server-only'
// If accidentally imported in client bundle, throws at build time
```

## Caching Checklist

- [ ] Marketing/landing pages: `force-static` or `revalidate: 86400`
- [ ] Product catalog: `revalidate: 60` with tag-based invalidation
- [ ] Dashboard: `force-dynamic` (user-specific)
- [ ] `revalidateTag()` called in Server Actions after mutations
- [ ] External API calls use `next: { revalidate: N, tags: ['tag'] }`
- [ ] No `no-store` on data that can be cached

## Database Query Performance Checklist

- [ ] All common WHERE fields have Prisma `@@index`
- [ ] Pagination uses `take` + `skip` (or cursor for large datasets)
- [ ] `select` used to fetch only needed fields (not `*`)
- [ ] Relations loaded with `include` only when needed (avoid N+1)
- [ ] No queries in loops → use `findMany` with `in` filter
- [ ] Connection pooling configured (PgBouncer or Prisma Accelerate for serverless)

```typescript
// Anti-pattern: N+1 query
const products = await db.product.findMany()
for (const product of products) {
  const category = await db.category.findUnique({ where: { id: product.categoryId } })
  // N extra queries!
}

// Correct: single query with relation
const products = await db.product.findMany({
  include: { category: { select: { name: true, slug: true } } }
})
```

## React Performance Checklist

- [ ] No unnecessary `'use client'` — push boundaries deep into the tree
- [ ] Lists use stable `key` props (not array index)
- [ ] Large lists virtualized (> 200 items) — use `@tanstack/virtual`
- [ ] `React.memo` only where measured re-render cost is high
- [ ] Zustand selectors defined outside components (stable references)
- [ ] `useCallback` only for functions passed to memoized children
- [ ] No object/array created in JSX without `useMemo` (if passed to memoized child)

## Server Performance Checklist

- [ ] Parallel data fetching with `Promise.all` in RSC
- [ ] No sequential awaits for independent data

```typescript
// ❌ Sequential (waterfall — slow)
const user = await fetchUser(id)
const products = await fetchUserProducts(id)

// ✅ Parallel
const [user, products] = await Promise.all([
  fetchUser(id),
  fetchUserProducts(id),
])
```
