---
name: system-planner
description: "Plans the technical architecture of a Next.js feature-based application. Converts project specs into architecture decisions, file tree, and data models. Use when starting a new project, planning a major new feature, or when the user asks about system design, folder structure, how to organize the codebase, which router to use, where state should live globally, or how to structure any non-trivial part of the application."
allowed-tools: Read, WebFetch
---

# System Planner

## Purpose
Converts `PROJECT_SPEC.md` into three concrete architecture artifacts:
`ARCHITECTURE.md`, `FILE_TREE.md`, and `DATA_MODEL.md`. Applies strict decision
matrices — no hand-waving, every choice has a reason.

## Inputs Required
Before executing, confirm you have:
- [ ] `PROJECT_SPEC.md` (from prd-analyzer) or equivalent feature description
- [ ] Stack fingerprint from `PLANNING.md` or `CLAUDE.md`

## Decision Matrices

### RSC vs Client Component
```
DEFAULT → Server Component (no directive)

Add 'use client' ONLY when the component needs:
  • onClick, onChange, onSubmit, or any DOM event handler
  • useState, useReducer, useContext
  • useEffect, useLayoutEffect, useRef (for DOM)
  • Browser APIs: window, document, localStorage, navigator
  • Third-party client library (charting, DnD, rich text)
  • TanStack Query hooks: useQuery, useMutation, useInfiniteQuery
  • Zustand hooks: useStore, useFeatureStore
  • React Hook Form: useForm, useController

Server Components CAN:
  • Be async (await directly, no useEffect needed)
  • Import from 'server-only' libraries
  • Access env vars without NEXT_PUBLIC_ prefix
  • Call Prisma directly
  • Use cookies() and headers()
```

### Server Action vs Route Handler
```
Mutation from a Next.js Client Component       → Server Action
Form submission (<form action={...}>)          → Server Action
Called by external service (webhook)           → Route Handler
Called by mobile app / third-party client      → Route Handler
Needs streaming response (SSE)                 → Route Handler
File upload (> 4MB)                            → Route Handler
Needs custom HTTP headers/status codes         → Route Handler
Complex auth middleware chain (API key, HMAC)  → Route Handler
Simple CRUD from within Next.js app            → Server Action
```

### State Location
```
Shareable URL / filters / pagination / active tab  → URL (searchParams)
UI-only: modal, hover, accordion, tooltip          → useState (colocated)
3+ components in one feature tree share state      → React Context (feature-scoped)
Any async data from server                         → TanStack Query
Cross-feature: cart, auth user, notifications      → Zustand store
Real-time sync                                     → WebSocket + invalidate Query cache
```

### Rendering Strategy
```
Marketing pages, landing, blog                     → Static (force-static or generateStaticParams)
Authenticated dashboard                            → Dynamic RSC (no-store)
Product catalog (shared, changes infrequently)     → ISR (revalidate: 60)
User profile page (specific user)                  → Dynamic RSC
Search results                                     → Dynamic RSC (URL drives query)
Real-time feed                                     → Client + WebSocket
```

## Instructions

### Step 1 — Map Features to Routes
For each P0/P1 feature, define:
- URL pattern (`/dashboard/[id]`)
- Route type (RSC page, client page, layout)
- What data it needs and where it comes from

### Step 2 — Define the Feature Tree
For each feature:
- List which of the 7 sub-folders apply (components, hooks, store, api, types, utils)
- Skip `store/` if state is truly local; skip `api/server-actions` if read-only feature

### Step 3 — Define Shared Infrastructure
- `src/shared/types/` — BaseEntity, ApiResponse, PaginationMeta
- `src/shared/lib/` — auth.ts, env.ts, prisma.ts, cn.ts
- `src/shared/components/ui/` — Button, Input, Card, Badge, Typography, Skeleton
- `src/shared/hooks/` — useDebounce, useMediaQuery, useLocalStorage

### Step 4 — Write the Three Artifacts

**ARCHITECTURE.md**: Decisions + rationale for each major choice.
**FILE_TREE.md**: Full directory tree (use ASCII tree format).
**DATA_MODEL.md**: TypeScript interfaces for all entities + relationship diagram.

See `references/decision-matrices.md` for expanded decision guidance.

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Put business logic in app/page.tsx | Thin pages — import from features/ | Keeps routing layer clean |
| Cross-feature imports | Use shared/ or event bus | Feature isolation |
| Store server data in Zustand | Use TanStack Query | Zustand is for client-side global state |
| Skip rendering strategy decision | Explicitly choose per-route | Defaults changed in Next 15 |
| Mix RSC and 'use client' in same file | Split into two components | Can't mix in same file |

## Quality Checklist
- [ ] Every P0 feature has a named route and component
- [ ] Every state choice is justified against the decision matrix
- [ ] Shared infrastructure defined (types, lib, ui)
- [ ] ARCHITECTURE.md, FILE_TREE.md, DATA_MODEL.md written
- [ ] No feature imports another feature (check FILE_TREE)

## Related Skills
- `prd-analyzer`: Run first to produce PROJECT_SPEC.md
- `task-generator`: Run after to convert architecture to atomic tasks
- `db-schema`: Refines DATA_MODEL.md into Prisma schema
- `feature-architect`: Scaffolds individual feature folders

## Reference
See `references/decision-matrices.md` for full expanded matrices.
