# Architecture

## Data Flow

```
Browser
  │
  ├── RSC Page (app/[route]/page.tsx)
  │     └── imports FeaturePage from features/[feature]/components/
  │           ├── Server fetch (async RSC, Prisma direct or Server Action)
  │           └── Client subtree ('use client' boundary)
  │                 ├── TanStack Query (client-side async state)
  │                 ├── Zustand (global cross-feature state)
  │                 └── URL state (useSearchParams + useRouter)
  │
  ├── Server Actions  (features/[feature]/api/[feature]Actions.ts)
  │     └── Zod validation → auth check → Prisma → return ApiResponse<T>
  │
  └── Route Handlers  (app/api/[route]/route.ts)
        └── External clients, webhooks, file uploads, streaming
```

## State Ownership

| State Type | Owner | Why | Example |
|------------|-------|-----|---------|
| URL / navigation | `useSearchParams` + `useRouter` | Shareable, bookmarkable, survives refresh | Filters, pagination, active tab |
| UI-only | `useState` (colocated) | Never needs to leave the component | Modal open, accordion expanded |
| Feature tree | React Context (feature-scoped) | Avoids prop drilling within one feature | Wizard step, multi-step form |
| Async / server | TanStack Query | Caching, invalidation, optimistic updates | User list, product detail |
| Cross-feature | Zustand store | Predictable, devtools, persists across routes | Cart, auth user, notifications |
| Form | React Hook Form | Controlled form state + validation | Any create/edit form |

## Rendering Strategy

| Route Type | Strategy | Reason |
|------------|----------|--------|
| Marketing / landing | Static (`force-static`) | No user data, CDN-cacheable |
| Dashboard / app | Dynamic RSC (`no-store`) | User-specific data |
| Product list with filters | ISR (`revalidate: 60`) | Shared data, acceptable staleness |
| API webhook endpoint | Route Handler | External service calls |
| Form mutation | Server Action | Next.js-native, no extra round-trip |
| Real-time feed | Client + WebSocket | Push-driven, cannot prerender |

## Dependency Rules

```
app/          → can import from features/, shared/
features/[A]  → can import from shared/ ONLY
features/[A]  → CANNOT import from features/[B]
shared/       → CANNOT import from features/
```

Cross-feature communication: use Zustand events or the shared event bus in
`src/shared/lib/events.ts` — never a direct import.

## API Response Envelope

All Server Actions and Route Handlers return this discriminated union:

```typescript
// src/shared/types/api.ts
export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string; field?: string } }

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

Error codes:
- `UNAUTHORIZED` — not authenticated
- `FORBIDDEN` — authenticated but lacks permission
- `NOT_FOUND` — resource does not exist
- `VALIDATION_ERROR` — Zod parse failure (includes `field`)
- `CONFLICT` — duplicate or constraint violation
- `INTERNAL_ERROR` — catch-all server error (never expose details to client)

## Module Aliases (tsconfig paths)

```json
"@/*": ["./src/*"]
```

Usage:
```typescript
import { Button } from '@/shared/components/ui'
import { useFeatureStore } from '@/features/feature/store/featureSlice'
import { env } from '@/shared/lib/env'
```
