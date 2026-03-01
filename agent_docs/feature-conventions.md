# Feature Conventions

## Feature Folder Anatomy

Every feature lives under `src/features/[feature-name]/` and owns its full
vertical slice. No feature imports from another feature — use `shared/` or events.

```
src/features/[feature-name]/
├── components/
│   ├── [Feature]Page.tsx       # Top-level page shell — orchestrates, no business logic
│   ├── [Feature]List.tsx       # List + empty/loading/error states
│   ├── [Feature]Card.tsx       # Single item card
│   ├── [Feature]Form.tsx       # Create/edit form (React Hook Form)
│   └── [Feature]Modal.tsx      # Optional — confirmation, detail, create modal
├── hooks/
│   ├── use[Feature]Query.ts    # TanStack Query hooks (list, detail, mutations)
│   └── use[Feature]Form.ts     # React Hook Form setup + zod schema + submit handler
├── store/
│   └── [feature]Slice.ts       # Zustand slice — ONLY if cross-component state needed
├── api/
│   ├── [feature]Queries.ts     # Query functions (used by TanStack Query)
│   └── [feature]Actions.ts     # Server Actions ('use server' at top)
├── types/
│   └── index.ts                # TypeScript interfaces for this feature only
├── utils/
│   └── [feature]Utils.ts       # Pure transformation functions, no side effects
└── index.ts                    # Public API — barrel export of public-only items
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component file | PascalCase | `ProductCard.tsx` |
| Hook file | camelCase, `use` prefix | `useProductQuery.ts` |
| Server Action file | camelCase, `Actions` suffix | `productActions.ts` |
| Query function file | camelCase, `Queries` suffix | `productQueries.ts` |
| Zustand slice | camelCase, `Slice` suffix | `productSlice.ts` |
| Type file | `index.ts` inside `types/` | `features/product/types/index.ts` |
| Utility file | camelCase, `Utils` suffix | `productUtils.ts` |
| Feature folder | kebab-case | `features/product-catalog/` |
| CSS module | PascalCase matching component | `ProductCard.module.css` |

## index.ts — Public API Rules

`index.ts` is the public contract of the feature. Only export what other code
(app routes, shared/) actually needs. Keep internals private.

```typescript
// src/features/products/index.ts

// ✅ Export: page-level component (used by app/products/page.tsx)
export { ProductsPage } from './components/ProductsPage'

// ✅ Export: types needed outside the feature
export type { Product, ProductFilters } from './types'

// ❌ Never export: internal components, hooks, slices
// ❌ Never export: implementation details of api/queries
```

## What Goes Where

| Code | Location | Rule |
|------|----------|------|
| Routing (page.tsx, layout.tsx) | `app/` | Thin — only import from features/ |
| Page shell component | `features/[f]/components/[F]Page.tsx` | Orchestrates RSC + client |
| UI-only sub-components | `features/[f]/components/` | No data fetching |
| Data fetching hooks | `features/[f]/hooks/` | Wraps TanStack Query |
| Form logic | `features/[f]/hooks/use[F]Form.ts` | RHF + Zod schema here |
| Server mutations | `features/[f]/api/[f]Actions.ts` | `'use server'` at top |
| Prisma read queries | `features/[f]/api/[f]Queries.ts` | Used in RSC or query fns |
| Cross-feature state | `features/[f]/store/[f]Slice.ts` | Only if truly shared |
| Feature-local types | `features/[f]/types/index.ts` | Not in shared/ |
| Shared base components | `shared/components/ui/` | Button, Input, Card, etc. |
| Shared hooks | `shared/hooks/` | useDebounce, useMediaQuery |
| Utilities | `shared/lib/` | cn(), auth, env, prisma |
| App-wide types | `shared/types/` | BaseEntity, ApiResponse |

## ESLint Boundary Enforcement

Add to `eslint.config.js` to prevent cross-feature imports at lint time:

```javascript
'no-restricted-imports': ['error', {
  patterns: [
    {
      group: ['**/features/*/components/*', '**/features/*/hooks/*',
               '**/features/*/store/*', '**/features/*/api/*',
               '**/features/*/utils/*'],
      message: 'Import from the feature index.ts instead, or move to shared/'
    }
  ]
}]
```

## RSC vs Client Decision (Quick Reference)

```
DEFAULT → Server Component (no directive)
Add 'use client' only when the component needs:
  • onClick, onChange, or any DOM event handler
  • useState, useReducer
  • useEffect, useLayoutEffect
  • Browser APIs: window, localStorage, navigator
  • Third-party client library (e.g., charting, DnD)
  • TanStack Query hooks (useQuery, useMutation)
  • Zustand hooks (useStore)
```

## Feature Creation Checklist

When starting a new feature, complete in this order:
- [ ] Create folder structure under `src/features/[feature]/`
- [ ] Define types in `types/index.ts`
- [ ] Create Prisma model (skill: db-schema)
- [ ] Write Server Actions in `api/[feature]Actions.ts`
- [ ] Write query functions in `api/[feature]Queries.ts`
- [ ] Write TanStack Query hooks in `hooks/use[Feature]Query.ts`
- [ ] Build components (RSC-first) in `components/`
- [ ] Wire up route in `app/[route]/page.tsx`
- [ ] Export public API from `index.ts`
- [ ] Run `npm run typecheck` — zero errors
