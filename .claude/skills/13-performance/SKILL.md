---
name: performance
description: "Optimizes Next.js application performance for Core Web Vitals, bundle size, image loading, font strategy, React memoization, and caching. Use when working on performance, running bundle analysis, optimizing load times, improving LCP/CLS/INP scores, reducing bundle size, or when the user mentions performance, slow pages, bundle size, lighthouse score, web vitals, loading speed, or optimization."
allowed-tools: Read, WebFetch, Bash
---

# Performance

## Purpose
Audits and optimizes Next.js applications across five dimensions: Core Web Vitals,
bundle size, image and font strategy, React rendering efficiency, and caching.
Provides concrete, measurable fixes — not generic advice.

## Quick Audit

```bash
# Build and analyze
npm run build
npx @next/bundle-analyzer  # Add ANALYZE=true env if not configured

# Lighthouse (requires Chrome)
npx lighthouse http://localhost:3000 --view

# Check bundle size
npx cost-of-modules --no-install
```

## 1 — Core Web Vitals

| Metric | Target | Common Cause of Failure |
|--------|--------|------------------------|
| LCP | < 2.5s | Hero image not preloaded, slow API |
| CLS | < 0.1 | No image dimensions, font swap, dynamic content push |
| INP | < 200ms | Long JS tasks, unoptimized event handlers |
| TTFB | < 0.8s | Slow DB query, no caching |

### LCP Fixes
```typescript
// 1. Preload hero image
import Image from 'next/image'

// In page component — priority prop tells Next.js to preload
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  priority   // ← Critical for LCP image
  sizes="100vw"
/>

// 2. Preload font
// In app/layout.tsx <head>
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

### CLS Fixes
```typescript
// Always provide width + height on images (or use fill + container)
<Image src="..." alt="..." width={800} height={600} />

// Reserve space for dynamic content
<div className="min-h-[400px]">
  <Suspense fallback={<Skeleton className="h-[400px]" />}>
    <AsyncContent />
  </Suspense>
</div>
```

## 2 — Images

```typescript
// Always use next/image — never <img>
import Image from 'next/image'

// Fixed size
<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, 400px"  // ← Critical for responsive
/>

// Fill container
<div className="relative aspect-video">
  <Image
    src={product.imageUrl}
    alt={product.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>

// Blur placeholder
<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={product.blurHash}
/>
```

## 3 — Fonts

```typescript
// src/app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // CLS-safe: show fallback until font loads
  variable: '--font-sans', // CSS variable for Tailwind
  preload: true,
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,          // Load lazily if not above-the-fold
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```typescript
// tailwind.config.ts — use CSS variables
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

## 4 — React Memoization

Rules — violating these causes unnecessary complexity with zero perf gain:

```
React.memo:
  → Use only when: component renders frequently AND receives expensive-to-diff props
  → Never use for: simple presentational components, leaf components with primitive props
  → Test before adding: is this component actually re-rendering unnecessarily?

useMemo:
  → Use only for: computations that take > ~1ms (sorting large arrays, complex transforms)
  → Never use for: simple filtering, object creation, formatting strings
  → Wrong: useMemo(() => items.filter(x => x.active), [items])
  → Right: useMemo(() => expensiveGraphCalculation(1000nodes), [nodes])

useCallback:
  → Use only when: function is passed to a React.memo'd child OR stable ref matters
  → Never use by default: adds overhead, rarely helps
```

```typescript
// Dynamic import for heavy components
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false,
})

const DataChart = dynamic(() => import('./DataChart'), {
  loading: () => <Skeleton className="h-48" />,
})

// Never dynamic import for small components — chunk overhead > savings
```

## 5 — Caching Strategy

```typescript
// app/products/page.tsx
// Option A: ISR — revalidate every 60 seconds
export const revalidate = 60

// Option B: Static — never changes (marketing pages)
export const dynamic = 'force-static'

// Option C: Dynamic — user-specific (dashboard)
export const dynamic = 'force-dynamic'
// or just use cookies()/headers() which auto-opts into dynamic
```

```typescript
// Selective per-fetch caching
async function ProductPage() {
  // This is cached for 5 minutes
  const categories = await fetch('/api/categories', {
    next: { revalidate: 300, tags: ['categories'] },
  })

  // This is always fresh
  const userCart = await fetch('/api/cart', { cache: 'no-store' })
}
```

```typescript
// On-demand revalidation in Server Actions
import { revalidateTag, revalidatePath } from 'next/cache'

export async function createProductAction(input: unknown) {
  // ... create product
  revalidateTag('products')        // Invalidate all fetches with this tag
  revalidatePath('/products')      // Invalidate this route's full cache
}
```

## 6 — Bundle Size

```bash
# Find large dependencies
npx bundlephobia [package-name]

# Common replacements:
# date-fns (tree-shakeable) instead of moment (large, not treeshakeable)
# Lucide React (tree-shakeable) instead of FontAwesome (large)
# nanoid instead of uuid
# zod (lean) already good

# Analyze with next-bundle-analyzer
# next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| `<img>` tag | `next/image` | No optimization, no lazy load |
| Google Fonts `<link>` in head | `next/font/google` | Font swap CLS, extra request |
| Import all of lodash | `import clamp from 'lodash/clamp'` | Huge bundle |
| useMemo on everything | Only for expensive computations | Adds overhead |
| Dynamic import for small components | Static import | Chunk overhead > savings |
| Skip `sizes` on Image | Always provide `sizes` | Wrong image served |

## Quality Checklist
- [ ] All images use `next/image` with `width`+`height` or `fill`+container
- [ ] Hero/LCP image has `priority` prop
- [ ] Fonts use `next/font/google` with `display: 'swap'`
- [ ] Caching strategy set per route (static, ISR, or dynamic)
- [ ] Heavy components (charts, editors) use dynamic import
- [ ] Bundle analyzer run — no single chunk > 500KB
- [ ] `npm run build` output shows no unexpected large pages

## Related Skills
- `component-builder`: Apply memoization rules when building components
- `data-layer`: Set `next: { revalidate }` on fetch calls

## Reference
See `references/performance-checklist.md` for full audit checklist.
