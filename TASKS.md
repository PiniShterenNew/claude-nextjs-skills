# TASKS.md
## MenuCost — Atomic Development Task List

---

## Summary Table

| Task | Phase | Skill | Complexity | Depends On |
|------|-------|-------|------------|------------|
| TASK-01 | 0-Foundation | none | S | none |
| TASK-02 | 0-Foundation | type-system | S | TASK-01 |
| TASK-03 | 0-Foundation | env-config | S | TASK-01 |
| TASK-04 | 0-Foundation | design-system | M | TASK-01 |
| TASK-05 | 0-VERIFY | none | S | TASK-01–04 |
| TASK-06 | 1-Infrastructure | db-schema | L | TASK-05 |
| TASK-07 | 1-Infrastructure | db-schema | S | TASK-06 |
| TASK-08 | 1-Infrastructure | db-schema | S | TASK-07 |
| TASK-09 | 1-Infrastructure | auth-flow | M | TASK-07 |
| TASK-10 | 1-Infrastructure | auth-flow | M | TASK-09 |
| TASK-11 | 1-Infrastructure | component-builder | M | TASK-09 |
| TASK-12 | 1-Infrastructure | state-architect | S | TASK-02 |
| TASK-13 | 1-Infrastructure | none | M | TASK-02 |
| TASK-14 | 1-Infrastructure | none | S | TASK-02 |
| TASK-15 | 1-Infrastructure | component-builder | M | TASK-11 |
| TASK-16 | 1-Infrastructure | design-system | M | TASK-04 |
| TASK-17 | 1-Infrastructure | design-system | M | TASK-16 |
| TASK-18 | 1-VERIFY | none | S | TASK-06–17 |
| TASK-19 | 2-Feature/auth | type-system | S | TASK-18 |
| TASK-20 | 2-Feature/auth | data-layer | M | TASK-19 |
| TASK-21 | 2-Feature/auth | component-builder | M | TASK-20 |
| TASK-22 | 2-Feature/auth | component-builder | S | TASK-21 |
| TASK-23 | 2-Feature/workspace | type-system | S | TASK-18 |
| TASK-24 | 2-Feature/workspace | data-layer | M | TASK-23 |
| TASK-25 | 2-Feature/workspace | component-builder | M | TASK-24 |
| TASK-26 | 2-Feature/workspace | component-builder | M | TASK-25 |
| TASK-27 | 2-Feature/ingredients | type-system | S | TASK-18 |
| TASK-28 | 2-Feature/ingredients | data-layer | M | TASK-27 |
| TASK-29 | 2-Feature/ingredients | state-architect | S | TASK-28 |
| TASK-30 | 2-Feature/ingredients | component-builder | M | TASK-29 |
| TASK-31 | 2-Feature/ingredients | component-builder | M | TASK-30 |
| TASK-32 | 2-Feature/ingredients | component-builder | S | TASK-31 |
| TASK-33 | 2-Feature/recipes | type-system | S | TASK-18 |
| TASK-34 | 2-Feature/recipes | data-layer | M | TASK-33 |
| TASK-35 | 2-Feature/recipes | data-layer | M | TASK-34 |
| TASK-36 | 2-Feature/recipes | state-architect | S | TASK-35 |
| TASK-37 | 2-Feature/recipes | component-builder | M | TASK-36 |
| TASK-38 | 2-Feature/recipes | component-builder | L | TASK-37 |
| TASK-39 | 2-Feature/recipes | component-builder | M | TASK-38 |
| TASK-40 | 2-Feature/recipes | component-builder | S | TASK-39 |
| TASK-41 | 2-Feature/dashboard | data-layer | M | TASK-35 |
| TASK-42 | 2-Feature/dashboard | component-builder | M | TASK-41 |
| TASK-43 | 2-Feature/dashboard | component-builder | S | TASK-42 |
| TASK-44 | 2-Feature/menu-eng | data-layer | M | TASK-35 |
| TASK-45 | 2-Feature/menu-eng | component-builder | L | TASK-44 |
| TASK-46 | 2-Feature/menu-eng | component-builder | S | TASK-45 |
| TASK-47 | 2-VERIFY | none | S | TASK-19–46 |
| TASK-48 | 3-Polish | error-handling | M | TASK-47 |
| TASK-49 | 3-Polish | component-builder | M | TASK-47 |
| TASK-50 | 3-Polish | testing | M | TASK-47 |
| TASK-51 | 3-Polish | testing | M | TASK-47 |
| TASK-52 | 3-Polish | testing | L | TASK-47 |
| TASK-53 | 3-Polish | accessibility | M | TASK-47 |
| TASK-54 | 3-Polish | component-builder | M | TASK-47 |
| TASK-55 | 3-VERIFY | none | S | TASK-48–54 |

---

## Phase 0 — Foundation

---

## TASK-01: Configure tsconfig.json and project path aliases

**Skill**: none
**Phase**: 0-Foundation
**Depends on**: none
**Inputs**: none (new project setup)
**Outputs**: `tsconfig.json`, `next.config.ts`

**Acceptance Criteria**:
- [ ] `tsconfig.json` has `strict: true`, `noUncheckedIndexedAccess: true`
- [ ] Path alias `@/*` maps to `./src/*`
- [ ] `next.config.ts` has no TypeScript errors
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-02: Set up shared base TypeScript types

**Skill**: type-system
**Phase**: 0-Foundation
**Depends on**: TASK-01
**Inputs**: `DATA_MODEL.md` — BaseEntity, ApiResponse, PaginationMeta sections
**Outputs**: `src/shared/types/index.ts`

**Acceptance Criteria**:
- [ ] `BaseEntity` interface exported with `id`, `createdAt`, `updatedAt`, `deletedAt`
- [ ] `ApiResponse<T>` discriminated union exported (`success: true | false`)
- [ ] `PaginationMeta` and `PaginatedResponse<T>` exported
- [ ] `WorkspaceRole` type (`'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'`) exported
- [ ] `RecipeCostResult` interface exported (matches DATA_MODEL.md)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-03: Set up type-safe environment variable validation

**Skill**: env-config
**Phase**: 0-Foundation
**Depends on**: TASK-01
**Inputs**: `ARCHITECTURE.md` §1 (env vars needed: DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY)
**Outputs**: `src/shared/lib/env.ts`, `.env.example`

**Acceptance Criteria**:
- [ ] `src/shared/lib/env.ts` validates all required env vars using Zod at module load time
- [ ] Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- [ ] Missing env var throws a descriptive error at startup (not at runtime)
- [ ] `.env.example` lists all required vars with placeholder values
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-04: Set up Tailwind design tokens + cn.ts utility

**Skill**: design-system
**Phase**: 0-Foundation
**Depends on**: TASK-01
**Inputs**: `ARCHITECTURE.md` §10 (RTL + Hebrew font), `PROJECT_SPEC.md` (color system needs)
**Outputs**: `tailwind.config.ts`, `src/app/globals.css`, `src/shared/lib/cn.ts`

**Acceptance Criteria**:
- [ ] `tailwind.config.ts` defines semantic color tokens: `primary`, `surface`, `surface-raised`, `border`, `text-primary`, `text-secondary`, `text-muted`, `destructive`
- [ ] `globals.css` defines CSS custom properties for all tokens (light mode only in MVP)
- [ ] RTL support enabled in Tailwind config (`rtl` variant)
- [ ] `Noto Sans Hebrew` loaded via `next/font/google` in root layout
- [ ] `src/shared/lib/cn.ts` exports `cn()` using `clsx` + `tailwind-merge`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-05: VERIFY Phase 0 — Run quality checks

**Skill**: none
**Phase**: 0-VERIFY
**Depends on**: TASK-01, TASK-02, TASK-03, TASK-04

**Acceptance Criteria**:
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — succeeds (empty Next.js shell)

**Complexity**: S
**Web search needed**: no

---

## Phase 1 — Infrastructure

---

## TASK-06: Write Prisma schema — all models, enums, indexes

**Skill**: db-schema
**Phase**: 1-Infrastructure
**Depends on**: TASK-05
**Inputs**: `DATA_MODEL.md` (full Prisma schema draft)
**Outputs**: `prisma/schema.prisma`

**Acceptance Criteria**:
- [ ] All 9 models defined: `User`, `Workspace`, `WorkspaceMember`, `WorkspaceInvitation`, `Ingredient`, `Recipe`, `RecipeItem`, `AuditLog`, `UnitConversion`
- [ ] All enums defined: `WorkspaceRole`, `AuditEntityType`, `AuditAction`
- [ ] All `Decimal` fields use `@db.Decimal(10, 4)` (never `Float`)
- [ ] All `deletedAt DateTime?` soft-delete fields present on: `User`, `Workspace`, `Ingredient`, `Recipe`
- [ ] All indexes from `DATA_MODEL.md` indexes table present
- [ ] `RecipeItem` has `@@index([ingredientId])` and `@@index([subRecipeId])` for impact queries
- [ ] `npx prisma validate` passes with no errors

**Complexity**: L
**Web search needed**: no

---

## TASK-07: Set up Prisma client singleton + soft-delete middleware

**Skill**: db-schema
**Phase**: 1-Infrastructure
**Depends on**: TASK-06
**Inputs**: `ARCHITECTURE.md` §9 (soft delete strategy), `FILE_TREE.md` (`src/shared/lib/prisma.ts`)
**Outputs**: `src/shared/lib/prisma.ts`

**Acceptance Criteria**:
- [ ] Prisma client exported as singleton (dev hot-reload safe via `globalThis`)
- [ ] Prisma middleware intercepts all `findMany`, `findFirst`, `findUnique` queries and appends `where: { deletedAt: null }` automatically
- [ ] Middleware skips models without `deletedAt` field (UnitConversion, RecipeItem, etc.)
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run db:push` succeeds (requires `DATABASE_URL` in env)

**Complexity**: S
**Web search needed**: no

---

## TASK-08: Create database seed file (unit conversions + dev fixtures)

**Skill**: db-schema
**Phase**: 1-Infrastructure
**Depends on**: TASK-07
**Inputs**: `ARCHITECTURE.md` §14 (unit conversion table), `DATA_MODEL.md` (UnitConversion interface)
**Outputs**: `prisma/seed.ts`

**Acceptance Criteria**:
- [ ] Seed upserts all bidirectional unit conversions: kg↔g, liter↔ml, kg↔mg, liter↔cl
- [ ] Seed is idempotent (safe to run multiple times via `upsert`)
- [ ] `package.json` has `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-09: Configure NextAuth v5 (auth.ts + Credentials provider)

**Skill**: auth-flow
**Phase**: 1-Infrastructure
**Depends on**: TASK-07
**Inputs**: `ARCHITECTURE.md` §2 (auth decisions), `DATA_MODEL.md` (User model)
**Outputs**: `src/shared/lib/auth.ts`

**Acceptance Criteria**:
- [ ] NextAuth configured with `Credentials` provider (email + bcrypt password)
- [ ] Session strategy is `jwt`
- [ ] Session shape includes `user.id`, `user.email`, `user.name`
- [ ] `authorized` callback in middleware config protects `[workspaceSlug]` routes
- [ ] Invalid credentials return typed error (not `null`)
- [ ] Route handler at `src/app/api/auth/[...nextauth]/route.ts` created
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-10: Set up Next.js middleware (session guard + workspace membership guard)

**Skill**: auth-flow
**Phase**: 1-Infrastructure
**Depends on**: TASK-09
**Inputs**: `ARCHITECTURE.md` §1 (routing), §2 (auth), §7 (RBAC)
**Outputs**: `src/middleware.ts`

**Acceptance Criteria**:
- [ ] Unauthenticated requests to any `/[workspaceSlug]/*` route redirect to `/login`
- [ ] Requests to auth routes (`/login`, `/signup`) by authenticated users redirect to their last workspace or onboarding
- [ ] `matcher` config in middleware correctly targets `[workspaceSlug]` segments (not `_next`, `api`, static assets)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-11: Set up root layout + global Providers

**Skill**: component-builder
**Phase**: 1-Infrastructure
**Depends on**: TASK-09, TASK-04
**Inputs**: `FILE_TREE.md` (root layout + providers), `ARCHITECTURE.md` §12 (rendering strategy)
**Outputs**: `src/app/layout.tsx`, `src/app/providers.tsx`

**Acceptance Criteria**:
- [ ] Root `layout.tsx` sets `<html lang="he" dir="rtl">` (Hebrew RTL)
- [ ] Noto Sans Hebrew font applied via `next/font/google`
- [ ] `providers.tsx` wraps children with: `QueryClientProvider`, `SessionProvider`, Sonner `Toaster`
- [ ] `providers.tsx` is a Client Component (`'use client'`)
- [ ] Root layout is a Server Component (no `'use client'`)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-12: Set up Zustand stores (auth-store + workspace-store)

**Skill**: state-architect
**Phase**: 1-Infrastructure
**Depends on**: TASK-02
**Inputs**: `ARCHITECTURE.md` §6 (state management decisions), `FILE_TREE.md` (`src/store/`)
**Outputs**: `src/store/auth-store.ts`, `src/store/workspace-store.ts`

**Acceptance Criteria**:
- [ ] `auth-store.ts` exports `useAuthStore` with shape `{ user: UserPublic | null, setUser, clearUser }`
- [ ] `workspace-store.ts` exports `useWorkspaceStore` with shape `{ workspace: { id, slug, role, name, foodCostThreshold } | null, setWorkspace, clearWorkspace }`
- [ ] Both stores use Zustand `create` (not `createWithEqualityFn`)
- [ ] `workspace-store.ts` has `sidebarCollapsed: boolean, toggleSidebar` persisted to `localStorage` via `persist` middleware
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-13: Implement recursive cost engine (shared/lib/cost-engine.ts)

**Skill**: none
**Phase**: 1-Infrastructure
**Depends on**: TASK-02
**Inputs**: `ARCHITECTURE.md` §3 (cost engine algorithm), `DATA_MODEL.md` (RecipeCostResult interface)
**Outputs**: `src/shared/lib/cost-engine.ts`

**Acceptance Criteria**:
- [ ] `calculateRecipeCost(recipeId, recipesMap, ingredientsMap, conversionsMap): RecipeCostResult` exported as pure function (no Prisma, no fetch)
- [ ] Recursively traverses sub-recipes up to 10 levels deep without stack overflow
- [ ] `effectivePrice = pricePerUnit * (1 + wastePercent / 100)` applied per ingredient
- [ ] Unit conversion factor applied via `conversionsMap` lookup; throws descriptive error if conversion unknown
- [ ] `foodCostPercent`, `grossMargin`, `netMargin` computed correctly per `DATA_MODEL.md`
- [ ] All monetary arithmetic uses `Decimal` (from `decimal.js`), never native `number` for intermediate values
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-14: Implement shared utility modules (decimal.ts, unit-conversion.ts, resend.ts)

**Skill**: none
**Phase**: 1-Infrastructure
**Depends on**: TASK-02, TASK-03
**Inputs**: `ARCHITECTURE.md` §8 (monetary), §11 (invitations), §14 (unit conversion)
**Outputs**: `src/shared/lib/decimal.ts`, `src/shared/lib/unit-conversion.ts`, `src/shared/lib/resend.ts`

**Acceptance Criteria**:
- [ ] `decimal.ts` exports `formatILS(value: Decimal): string` (e.g. `"₪12.50"`) and `toDecimal(n: number | string): Decimal`
- [ ] `unit-conversion.ts` exports `getConversionFactor(from: string, to: string, conversions: UnitConversion[]): number` — returns 1 if same unit, throws if no conversion found
- [ ] `resend.ts` exports `sendInvitationEmail({ to, workspaceName, role, inviteUrl })` using Resend SDK; uses `env.RESEND_API_KEY`
- [ ] `resend.ts` exports `sendVerificationEmail({ to, verifyUrl })`
- [ ] `resend.ts` exports `sendPasswordResetEmail({ to, resetUrl })`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-15: Build AppShell layout components (AppShell, Sidebar, Header, WorkspaceSwitcher)

**Skill**: component-builder
**Phase**: 1-Infrastructure
**Depends on**: TASK-11, TASK-12
**Inputs**: `FILE_TREE.md` (`src/shared/components/layout/`), `ARCHITECTURE.md` §5 (RSC/client decisions)
**Outputs**: `src/shared/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`, `WorkspaceSwitcher.tsx`

**Acceptance Criteria**:
- [ ] `AppShell.tsx` is RSC — renders `<Sidebar>` + `<main>` wrapper + `<Header>`, accepts `children`
- [ ] `Sidebar.tsx` is `'use client'` — uses `usePathname` for active nav highlighting; uses `useWorkspaceStore` for collapse state
- [ ] Sidebar nav items: Dashboard, Ingredients, Recipes, Menu Engineering, Settings (conditionally shown by role)
- [ ] `Header.tsx` is RSC — shows workspace name + user avatar (from session prop)
- [ ] `WorkspaceSwitcher.tsx` is `'use client'` — dropdown listing user's workspaces; navigates on select
- [ ] All components have proper ARIA landmark roles (`<nav>`, `<header>`, `<main>`)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-16: Build base UI components — Button, Input, Card, Badge, Typography, Skeleton

**Skill**: design-system
**Phase**: 1-Infrastructure
**Depends on**: TASK-04
**Inputs**: `FILE_TREE.md` (`src/shared/components/ui/`), design tokens from TASK-04
**Outputs**: `src/shared/components/ui/Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Typography.tsx`, `Skeleton.tsx`

**Acceptance Criteria**:
- [ ] `Button` has variants: `primary`, `secondary`, `destructive`, `ghost`; sizes: `sm`, `md`, `lg`; `isLoading` prop shows spinner and disables
- [ ] `Input` wraps `<input>` with label, error message slot, RTL-compatible
- [ ] `Card` has `CardHeader`, `CardBody`, `CardFooter` sub-components
- [ ] `Badge` has variants: `default`, `success`, `warning`, `destructive` — uses semantic color tokens (no hardcoded hex)
- [ ] `Typography` exports `H1`, `H2`, `H3`, `Body`, `Caption`, `Label` variants
- [ ] `Skeleton` accepts `className` and renders a pulsing placeholder
- [ ] All components accept `className` prop via `cn()`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-17: Build base UI components — Select, Modal, Table, Tabs, Toast, Tooltip

**Skill**: design-system
**Phase**: 1-Infrastructure
**Depends on**: TASK-16
**Inputs**: `FILE_TREE.md` (`src/shared/components/ui/`), accessibility requirements
**Outputs**: `src/shared/components/ui/Select.tsx`, `Modal.tsx`, `Table.tsx`, `Tabs.tsx`, `Toast.tsx`, `Tooltip.tsx`

**Acceptance Criteria**:
- [ ] `Select` is `'use client'` — controlled component with `value`/`onChange`; keyboard navigable
- [ ] `Modal` is `'use client'` — uses React portal, focus trap on open, closes on Escape key, ARIA `role="dialog"` + `aria-modal="true"`
- [ ] `Table` is RSC-compatible — accepts `columns` + `data` array, renders `<thead>` / `<tbody>` with proper `scope` attributes
- [ ] `Tabs` is `'use client'` — ARIA `role="tablist"`, `role="tab"`, `role="tabpanel"`; keyboard arrow navigation
- [ ] `Toast` re-exports Sonner's `toast` function with typed helpers: `toast.success()`, `toast.error()`
- [ ] `Tooltip` is `'use client'` — shows on hover + focus; ARIA `role="tooltip"` with `id` linkage
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-18: VERIFY Phase 1 — Run quality checks

**Skill**: none
**Phase**: 1-VERIFY
**Depends on**: TASK-06 through TASK-17

**Acceptance Criteria**:
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — succeeds
- [ ] `npx prisma validate` — no schema errors
- [ ] `npm run db:push` succeeds against local dev DB

**Complexity**: S
**Web search needed**: no

---

## Phase 2 — Features

---

## TASK-19: Auth feature — types

**Skill**: type-system
**Phase**: 2-Feature/auth
**Depends on**: TASK-18
**Inputs**: `PROJECT_SPEC.md` (auth flows), `DATA_MODEL.md` (User entity)
**Outputs**: `src/features/auth/types/index.ts`

**Acceptance Criteria**:
- [ ] `LoginInput` Zod schema exported: `{ email: string, password: string }`
- [ ] `SignupInput` Zod schema exported: `{ name: string, email: string, password: string (min 8) }`
- [ ] `ForgotPasswordInput` Zod schema exported: `{ email: string }`
- [ ] `AuthError` type exported: `{ code: 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'UNVERIFIED' | 'SERVER_ERROR', message: string }`
- [ ] All Zod schemas export their inferred TypeScript types
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-20: Auth feature — Server Actions (login, signup, forgot-password, verify-email)

**Skill**: data-layer
**Phase**: 2-Feature/auth
**Depends on**: TASK-19, TASK-14
**Inputs**: `ARCHITECTURE.md` §2 (auth flow), `FILE_TREE.md` (`features/auth/actions/`)
**Outputs**: `src/features/auth/actions/login.ts`, `signup.ts`, `forgot-password.ts`, `verify-email.ts`

**Acceptance Criteria**:
- [ ] `signup`: creates `User` with bcrypt-hashed password, sends verification email via `sendVerificationEmail`, returns `ApiResponse<{ userId: string }>`
- [ ] `login`: validates credentials with `signIn('credentials', ...)`, returns `ApiResponse<void>` or `AuthError`
- [ ] `forgot-password`: creates `passwordResetToken` (UUID) on User, sends email, returns `ApiResponse<void>`; does NOT reveal if email exists (always returns success)
- [ ] `verify-email`: finds user by `emailVerifyToken`, sets `emailVerified: true`, clears token, returns `ApiResponse<void>`
- [ ] All actions validate input with Zod before touching the DB
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-21: Auth feature — UI components (LoginForm, SignupForm, ForgotPasswordForm)

**Skill**: component-builder
**Phase**: 2-Feature/auth
**Depends on**: TASK-20, TASK-16
**Inputs**: `FILE_TREE.md` (`features/auth/components/`), auth types from TASK-19
**Outputs**: `src/features/auth/components/LoginForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`

**Acceptance Criteria**:
- [ ] All three are `'use client'` components using React Hook Form + Zod resolver
- [ ] `LoginForm` calls `login` Server Action on submit; shows field errors inline; shows spinner during submit
- [ ] `SignupForm` calls `signup` SA; shows password strength hint; redirects to `/verify-email` on success
- [ ] `ForgotPasswordForm` calls `forgot-password` SA; shows success message (never reveals if email exists)
- [ ] All forms are RTL-compatible (labels, inputs, error messages)
- [ ] All inputs have associated `<label>` elements (not placeholder-only)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-22: Auth feature — pages + layout

**Skill**: component-builder
**Phase**: 2-Feature/auth
**Depends on**: TASK-21
**Inputs**: `FILE_TREE.md` (`app/(auth)/`)
**Outputs**: `src/app/(auth)/layout.tsx`, `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `verify-email/page.tsx`

**Acceptance Criteria**:
- [ ] Auth layout centers content, no sidebar/header
- [ ] `login/page.tsx` renders `<LoginForm>` inside a `<Card>`; has link to `/signup`
- [ ] `signup/page.tsx` renders `<SignupForm>`; reads `?invite=` param and passes to `SignupForm`
- [ ] `forgot-password/page.tsx` renders `<ForgotPasswordForm>`
- [ ] `verify-email/page.tsx` reads `?token=` from URL, calls `verifyEmail` SA, shows success or error state
- [ ] All pages are Server Components (no `'use client'`)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-23: Workspace feature — types

**Skill**: type-system
**Phase**: 2-Feature/workspace
**Depends on**: TASK-18
**Inputs**: `DATA_MODEL.md` (Workspace, WorkspaceMember, WorkspaceInvitation entities)
**Outputs**: `src/features/workspace/types/index.ts`

**Acceptance Criteria**:
- [ ] `CreateWorkspaceInput` Zod schema: `{ name: string, slug: string (slug-safe regex) }`
- [ ] `UpdateWorkspaceInput` Zod schema: `{ name?: string, foodCostThreshold?: number (0-100) }`
- [ ] `InviteMemberInput` Zod schema: `{ email: string, role: WorkspaceRole }`
- [ ] `UpdateMemberRoleInput` Zod schema: `{ memberId: string, role: WorkspaceRole }`
- [ ] `MemberRow` type for UI: `{ id, user: { name, email }, role, acceptedAt }`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-24: Workspace feature — Server Actions

**Skill**: data-layer
**Phase**: 2-Feature/workspace
**Depends on**: TASK-23, TASK-14
**Inputs**: `ARCHITECTURE.md` §7 (RBAC), `FILE_TREE.md` (`features/workspace/actions/`)
**Outputs**: `src/features/workspace/actions/create-workspace.ts`, `update-workspace.ts`, `invite-member.ts`, `update-member-role.ts`, `remove-member.ts`

**Acceptance Criteria**:
- [ ] `createWorkspace`: validates slug uniqueness, creates `Workspace` + `WorkspaceMember` (role=OWNER), returns `ApiResponse<{ slug: string }>`
- [ ] `updateWorkspace`: OWNER-only; updates name and/or `foodCostThreshold`
- [ ] `inviteMember`: OWNER-only; creates `WorkspaceInvitation` with 48hr expiry token, sends email via `sendInvitationEmail`; returns error if email already a member
- [ ] `updateMemberRole`: OWNER-only; cannot demote self
- [ ] `removeMember`: OWNER-only; cannot remove self (last owner); soft-deletes `WorkspaceMember`
- [ ] All actions call `auth()` + verify workspace membership before executing
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-25: Workspace feature — invitation Route Handler + onboarding page

**Skill**: component-builder
**Phase**: 2-Feature/workspace
**Depends on**: TASK-24
**Inputs**: `ARCHITECTURE.md` §11 (invitation flow), `FILE_TREE.md`
**Outputs**: `src/app/api/invitations/[token]/route.ts`, `src/app/(auth)/onboarding/page.tsx`, `src/features/workspace/components/WorkspaceCreateForm.tsx`

**Acceptance Criteria**:
- [ ] `GET /api/invitations/[token]`: validates token exists + not expired + not accepted; if user logged in → creates `WorkspaceMember` + redirects to workspace; if not logged in → redirects to `/signup?invite=[token]`
- [ ] Returns 410 Gone if token expired, 404 if not found
- [ ] `WorkspaceCreateForm` is `'use client'` — RHF form, auto-generates slug from name (slugified), allows manual edit
- [ ] Onboarding page (`/onboarding`) shown after first signup; renders `WorkspaceCreateForm`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-26: Workspace feature — settings pages + member management components

**Skill**: component-builder
**Phase**: 2-Feature/workspace
**Depends on**: TASK-25, TASK-17
**Inputs**: `FILE_TREE.md` (`features/workspace/components/`, `app/[workspaceSlug]/settings/`)
**Outputs**: `src/features/workspace/components/WorkspaceSettingsForm.tsx`, `MemberList.tsx`, `InviteMemberForm.tsx`, `MemberRoleSelector.tsx`, `src/app/[workspaceSlug]/settings/page.tsx`, `settings/members/page.tsx`

**Acceptance Criteria**:
- [ ] `WorkspaceSettingsForm` is `'use client'` — edits workspace name + `foodCostThreshold`; OWNER-only
- [ ] `MemberList` is RSC — renders `<Table>` of members with name, email, role, joined date
- [ ] `InviteMemberForm` is `'use client'` — email input + role Select; calls `inviteMember` SA; shows success toast
- [ ] `MemberRoleSelector` is `'use client'` — inline dropdown to change role; calls `updateMemberRole` SA; OWNER-only
- [ ] Settings page renders `WorkspaceSettingsForm` (OWNER sees it, others see read-only view)
- [ ] Members page renders `MemberList` + `InviteMemberForm` (OWNER-only)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-27: Ingredients feature — types + effective-price utility

**Skill**: type-system
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-18
**Inputs**: `DATA_MODEL.md` (Ingredient entity), `PROJECT_SPEC.md` (Flow 2 — Add an Ingredient)
**Outputs**: `src/features/ingredients/types/index.ts`, `src/features/ingredients/utils/effective-price.ts`

**Acceptance Criteria**:
- [ ] `CreateIngredientInput` Zod schema: name, unit, pricePerUnit (positive Decimal-compatible), wastePercent (0-100), supplier (optional)
- [ ] `UpdateIngredientInput` Zod schema: all fields optional + `id`
- [ ] `IngredientRow` type for UI display (includes computed `effectivePrice`)
- [ ] `ImpactResult` type: `{ recipesAffected: number, avgFoodCostBefore: number, avgFoodCostAfter: number, recipes: { id, name, foodCostBefore, foodCostAfter }[] }`
- [ ] `effectivePrice(pricePerUnit: Decimal, wastePercent: number): Decimal` utility exported from `utils/effective-price.ts`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-28: Ingredients feature — Server Actions

**Skill**: data-layer
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-27, TASK-13
**Inputs**: `ARCHITECTURE.md` §3 (cost engine), §4 (caching), `FILE_TREE.md` (`features/ingredients/actions/`)
**Outputs**: `src/features/ingredients/actions/create-ingredient.ts`, `update-ingredient.ts`, `delete-ingredient.ts`, `get-ingredients.ts`, `get-ingredient-impact.ts`

**Acceptance Criteria**:
- [ ] `createIngredient`: validates input with Zod + workspace membership (OWNER/MANAGER); creates `Ingredient` + `AuditLog`; revalidates workspace cache tag
- [ ] `updateIngredient`: validates; updates `Ingredient.pricedAt` on price change; creates `AuditLog`; sets `costStaleSince` on all recipes using this ingredient; calls `revalidateTag`
- [ ] `deleteIngredient`: soft deletes; prevents deletion if ingredient is used in any active `RecipeItem` (returns error with affected recipe names)
- [ ] `getIngredients`: returns paginated list filtered by `workspaceId`; accepts `search?: string` param
- [ ] `getIngredientImpact`: for a given price change, returns `ImpactResult` by computing costs before + after using `cost-engine`
- [ ] All actions return `ApiResponse<T>`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-29: Ingredients feature — TanStack Query hooks

**Skill**: state-architect
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-28
**Inputs**: `ARCHITECTURE.md` §6 (state management), `FILE_TREE.md` (`features/ingredients/hooks/`)
**Outputs**: `src/features/ingredients/hooks/useIngredients.ts`, `useIngredientMutations.ts`

**Acceptance Criteria**:
- [ ] `useIngredients({ workspaceId, search })` uses `useQuery` with key `['ingredients', workspaceId, search]`; calls `getIngredients` SA
- [ ] `useIngredientMutations()` returns `{ createIngredient, updateIngredient, deleteIngredient }` — each is a `useMutation` that invalidates `['ingredients', workspaceId]` on success
- [ ] Mutations show `toast.success()` on success and `toast.error()` on failure
- [ ] Query key factory typed to prevent key typos
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-30: Ingredients feature — list components (IngredientListPage, IngredientListClient, IngredientCard)

**Skill**: component-builder
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-29, TASK-16
**Inputs**: `FILE_TREE.md` (`features/ingredients/components/`), `ARCHITECTURE.md` §7 (RBAC visibility)
**Outputs**: `src/features/ingredients/components/IngredientListPage.tsx`, `IngredientListClient.tsx`, `IngredientCard.tsx`

**Acceptance Criteria**:
- [ ] `IngredientListPage` is async RSC — fetches ingredient list server-side; passes to `IngredientListClient`
- [ ] `IngredientListClient` is `'use client'` — has search input with 300ms debounce; uses `useIngredients` hook for client-side filter updates; shows `<Skeleton>` while loading
- [ ] "Add Ingredient" button visible only if role is OWNER or MANAGER (hidden for CHEF/VIEWER)
- [ ] `IngredientCard` is RSC — shows name, unit, price (cost hidden for CHEF/VIEWER via `canViewCosts` prop), effective price after waste
- [ ] Empty state shown when no ingredients with CTA
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-31: Ingredients feature — form + detail components (IngredientForm, IngredientDetailPage, IngredientImpactPanel)

**Skill**: component-builder
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-30
**Inputs**: `PROJECT_SPEC.md` (Flow 2 + Flow 4), `FILE_TREE.md` (`features/ingredients/components/`)
**Outputs**: `src/features/ingredients/components/IngredientForm.tsx`, `IngredientDetailPage.tsx`, `IngredientImpactPanel.tsx`

**Acceptance Criteria**:
- [ ] `IngredientForm` is `'use client'` — RHF form for create/edit; `unit` field is `<Select>` with all `IngredientUnit` options; shows computed effective price preview in real-time as user types price + waste
- [ ] `IngredientForm` opens in a `<Modal>` triggered by "Add Ingredient" / "Edit" buttons
- [ ] `IngredientDetailPage` is RSC — shows ingredient detail + price history from `AuditLog`
- [ ] `IngredientImpactPanel` is RSC — after price change, shows `ImpactResult`: count of affected recipes, avg food cost delta, list of recipes color-coded by new food cost %
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-32: Ingredients feature — route pages

**Skill**: component-builder
**Phase**: 2-Feature/ingredients
**Depends on**: TASK-31
**Inputs**: `FILE_TREE.md` (`app/[workspaceSlug]/ingredients/`)
**Outputs**: `src/app/[workspaceSlug]/ingredients/page.tsx`, `[id]/page.tsx`

**Acceptance Criteria**:
- [ ] Both pages are Server Components with `export const dynamic = 'force-dynamic'`
- [ ] Both pages extract `workspaceSlug` + session + membership, derive `canViewCosts` from role, pass to feature components
- [ ] Ingredient list page imports `IngredientListPage` from features layer
- [ ] Ingredient detail page imports `IngredientDetailPage` from features layer
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-33: Recipes feature — types + circular-check utility

**Skill**: type-system
**Phase**: 2-Feature/recipes
**Depends on**: TASK-18
**Inputs**: `DATA_MODEL.md` (Recipe, RecipeItem, RecipeCostResult), `PROJECT_SPEC.md` (Flow 3)
**Outputs**: `src/features/recipes/types/index.ts`, `src/features/recipes/utils/circular-check.ts`

**Acceptance Criteria**:
- [ ] `CreateRecipeInput` Zod schema with all Recipe fields
- [ ] `RecipeItemInput` Zod schema: `{ ingredientId?: string, subRecipeId?: string, quantity: positive, unit: string }` — one of the two IDs required (superRefine)
- [ ] `RecipeRow` type for list view (without cost data)
- [ ] `RecipeWithItems` type: Recipe + RecipeItem[]
- [ ] `detectCircularRef(parentRecipeId: string, newSubRecipeId: string, allRecipes: RecipeWithItems[]): boolean` exported — traverses sub-recipe tree to detect cycles
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-34: Recipes feature — CRUD Server Actions

**Skill**: data-layer
**Phase**: 2-Feature/recipes
**Depends on**: TASK-33
**Inputs**: `FILE_TREE.md` (`features/recipes/actions/`), `ARCHITECTURE.md` §7 (RBAC)
**Outputs**: `src/features/recipes/actions/create-recipe.ts`, `update-recipe.ts`, `delete-recipe.ts`, `get-recipes.ts`, `get-recipe.ts`

**Acceptance Criteria**:
- [ ] `createRecipe`: OWNER/MANAGER/CHEF; validates input; creates `Recipe` + `AuditLog`
- [ ] `updateRecipe`: same roles; creates `AuditLog`; if `sellingPrice` changed, revalidates cache tags
- [ ] `deleteRecipe`: soft delete; returns error if recipe is used as sub-recipe in other active recipes
- [ ] `getRecipes`: returns `RecipeRow[]` filtered by `workspaceId` + optional `category` filter + `isSubRecipe` filter; `deletedAt: null` enforced
- [ ] `getRecipe`: returns `RecipeWithItems` (recipe + all items with ingredient/sub-recipe names resolved)
- [ ] All return `ApiResponse<T>`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-35: Recipes feature — cost + RecipeItem Server Actions

**Skill**: data-layer
**Phase**: 2-Feature/recipes
**Depends on**: TASK-34, TASK-13
**Inputs**: `ARCHITECTURE.md` §3 (cost engine pre-fetch strategy), §4 (caching)
**Outputs**: `src/features/recipes/actions/calculate-recipe-cost.ts`, `add-recipe-item.ts`, `update-recipe-item.ts`, `remove-recipe-item.ts`

**Acceptance Criteria**:
- [ ] `calculateRecipeCost(recipeId, workspaceId)`: fetches entire recipe tree in 2 queries (all recipes in workspace + all ingredients), calls `calculateRecipeCost` from `cost-engine`, wraps in `unstable_cache` tagged `recipe:${recipeId}` + `workspace:${workspaceId}`
- [ ] `addRecipeItem`: validates `RecipeItemInput`; runs `detectCircularRef` before saving; returns error if circular; updates recipe `updatedAt`
- [ ] `updateRecipeItem`: validates quantity + unit; updates item
- [ ] `removeRecipeItem`: hard deletes `RecipeItem` (it has no `deletedAt`); updates recipe `updatedAt`
- [ ] All mutations call `revalidateTag(`recipe:${recipeId}`)` after write
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-36: Recipes feature — TanStack Query hooks

**Skill**: state-architect
**Phase**: 2-Feature/recipes
**Depends on**: TASK-35
**Inputs**: `ARCHITECTURE.md` §6 (state decisions), `FILE_TREE.md` (`features/recipes/hooks/`)
**Outputs**: `src/features/recipes/hooks/useRecipes.ts`, `useRecipeMutations.ts`, `useRecipeCost.ts`

**Acceptance Criteria**:
- [ ] `useRecipes({ workspaceId, category?, isSubRecipe? })` uses `useQuery` calling `getRecipes` SA
- [ ] `useRecipeMutations()` returns `{ createRecipe, updateRecipe, deleteRecipe }` mutations
- [ ] `useRecipeCost(recipeId, workspaceId)` uses `useMutation` (not `useQuery`) — called on demand in builder as user adds items; returns `RecipeCostResult | null`
- [ ] All mutations invalidate `['recipes', workspaceId]` on success
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-37: Recipes feature — RecipeForm + RecipeItemSearch components

**Skill**: component-builder
**Phase**: 2-Feature/recipes
**Depends on**: TASK-36, TASK-17
**Inputs**: `FILE_TREE.md` (`features/recipes/components/`), recipe types from TASK-33
**Outputs**: `src/features/recipes/components/RecipeForm.tsx`, `RecipeItemSearch.tsx`

**Acceptance Criteria**:
- [ ] `RecipeForm` is `'use client'` — RHF form for recipe meta (name, category, yield, yieldUnit, sellingPrice, vatPercent, laborCost, overheadCost); all monetary inputs use decimal-aware `<Input>`
- [ ] `RecipeItemSearch` is `'use client'` — typeahead that searches both ingredients and sub-recipes; shows separate sections "Ingredients" / "Sub-recipes"; debounced 300ms; uses `useIngredients` + `useRecipes(isSubRecipe:true)` hooks
- [ ] `RecipeItemSearch` prevents selecting the current recipe as a sub-recipe
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-38: Recipes feature — RecipeBuilder + RecipeItemRow + RecipeCostSummary

**Skill**: component-builder
**Phase**: 2-Feature/recipes
**Depends on**: TASK-37
**Inputs**: `PROJECT_SPEC.md` (Flow 3 — Build a Recipe), `ARCHITECTURE.md` §5 (RSC/client)
**Outputs**: `src/features/recipes/components/RecipeBuilder.tsx`, `RecipeItemRow.tsx`, `RecipeCostSummary.tsx`

**Acceptance Criteria**:
- [ ] `RecipeBuilder` is `'use client'` — top-level builder; manages `items[]` in local `useState`; calls `useRecipeCost` mutation after each item add/change (debounced 500ms)
- [ ] `RecipeBuilder` renders `<RecipeForm>` + list of `<RecipeItemRow>` + `<RecipeItemSearch>` for adding items + `<RecipeCostSummary>`
- [ ] `RecipeItemRow` is `'use client'` — shows ingredient/sub-recipe name, quantity input, unit select; `×` button to remove; inline edit of quantity triggers cost recalculation
- [ ] `RecipeCostSummary` is `'use client'` — displays `RecipeCostResult` fields: ingredient cost, labor, overhead, total, food cost %, gross margin; shows `<Skeleton>` while computing
- [ ] Cost columns hidden (replaced with "—") when viewer role is CHEF
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: L
**Web search needed**: no

---

## TASK-39: Recipes feature — list + detail components

**Skill**: component-builder
**Phase**: 2-Feature/recipes
**Depends on**: TASK-38
**Inputs**: `FILE_TREE.md` (`features/recipes/components/`), `ARCHITECTURE.md` §7 (RBAC visibility)
**Outputs**: `src/features/recipes/components/RecipeListPage.tsx`, `RecipeListClient.tsx`, `RecipeDetailPage.tsx`

**Acceptance Criteria**:
- [ ] `RecipeListPage` is async RSC — fetches recipe list; passes to `RecipeListClient`; shows `costStaleSince` warning badge on stale recipes
- [ ] `RecipeListClient` is `'use client'` — category filter via URL `searchParams`; renders recipe cards with name, category, food cost % badge (OWNER/MANAGER only)
- [ ] `RecipeDetailPage` is async RSC — fetches recipe + computed cost server-side via `calculateRecipeCost`; renders full breakdown; shows edit button for OWNER/MANAGER/CHEF
- [ ] `CostThresholdBadge` (imported from dashboard feature via `shared/`) colors food cost % green/yellow/red vs workspace threshold
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-40: Recipes feature — route pages

**Skill**: component-builder
**Phase**: 2-Feature/recipes
**Depends on**: TASK-39
**Inputs**: `FILE_TREE.md` (`app/[workspaceSlug]/recipes/`)
**Outputs**: `src/app/[workspaceSlug]/recipes/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`

**Acceptance Criteria**:
- [ ] All pages are Server Components with `export const dynamic = 'force-dynamic'`
- [ ] Recipe list page renders `RecipeListPage`
- [ ] New recipe page renders `RecipeBuilder` with no initial data; accessible to OWNER/MANAGER/CHEF only (redirect VIEWER)
- [ ] Detail page renders `RecipeDetailPage`
- [ ] Edit page renders `RecipeBuilder` seeded with existing recipe data
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-41: Dashboard feature — types + Server Action

**Skill**: data-layer
**Phase**: 2-Feature/dashboard
**Depends on**: TASK-35
**Inputs**: `PROJECT_SPEC.md` (Flow 5 — View Dashboard), `DATA_MODEL.md` (AuditLog)
**Outputs**: `src/features/dashboard/types/index.ts`, `src/features/dashboard/actions/get-dashboard-data.ts`

**Acceptance Criteria**:
- [ ] `DashboardKPI` type: `{ avgFoodCostPercent, mostProfitableRecipe: { name, grossMargin }, mostExpensiveRecipe: { name, totalCost }, recipesOverThreshold: number }`
- [ ] `RecipeCostRow` type: `{ id, name, category, foodCostPercent, grossMargin, isStale, thresholdStatus: 'ok' | 'warning' | 'alert' }`
- [ ] `AlertRow` type: `{ ingredientName, changedAt, affectedRecipeCount, actorName }`
- [ ] `getDashboardData(workspaceId)`: fetches all active recipes; calls `calculateRecipeCost` for each (via existing cached SA); aggregates KPIs; fetches last 20 `AuditLog` entries for price changes
- [ ] Returns `ApiResponse<{ kpis: DashboardKPI, recipeCostRows: RecipeCostRow[], alerts: AlertRow[] }>`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-42: Dashboard feature — display components

**Skill**: component-builder
**Phase**: 2-Feature/dashboard
**Depends on**: TASK-41, TASK-16
**Inputs**: `FILE_TREE.md` (`features/dashboard/components/`), `ARCHITECTURE.md` §5 (RSC decisions)
**Outputs**: `src/features/dashboard/components/FoodCostKPICard.tsx`, `CostThresholdBadge.tsx`, `RecipeCostTable.tsx`, `PriceAlertFeed.tsx`

**Acceptance Criteria**:
- [ ] `FoodCostKPICard` is RSC — accepts `label`, `value`, `unit`, `highlight?: 'good' | 'warning' | 'bad'`; renders metric card using `<Card>` + `<Badge>`
- [ ] `CostThresholdBadge` is RSC — accepts `foodCostPercent`, `threshold`; renders green Badge if < threshold, yellow if within 5%, red if over
- [ ] `RecipeCostTable` is RSC — renders sortable `<Table>` of `RecipeCostRow[]`; food cost % column uses `CostThresholdBadge`; cost columns hidden for CHEF role
- [ ] `PriceAlertFeed` is RSC — renders list of `AlertRow[]` with ingredient name, date, how many recipes affected
- [ ] All components accept `canViewCosts: boolean` prop
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-43: Dashboard feature — DashboardPage (RSC) + route page

**Skill**: component-builder
**Phase**: 2-Feature/dashboard
**Depends on**: TASK-42
**Inputs**: `FILE_TREE.md` (`features/dashboard/components/`, `app/[workspaceSlug]/dashboard/`)
**Outputs**: `src/features/dashboard/components/DashboardPage.tsx`, `src/app/[workspaceSlug]/dashboard/page.tsx`

**Acceptance Criteria**:
- [ ] `DashboardPage` is async RSC — calls `getDashboardData`, renders KPI grid (4 `FoodCostKPICard`s), `RecipeCostTable`, `PriceAlertFeed`
- [ ] KPI grid is 2×2 responsive grid; RTL-compatible
- [ ] Empty state shown when workspace has no recipes (CTA to add first recipe)
- [ ] Route page is Server Component with `dynamic = 'force-dynamic'`; derives `canViewCosts` from session role; passes to `DashboardPage`
- [ ] Chef and Viewer roles redirected away from Dashboard (middleware or page-level check)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-44: Menu Engineering feature — types + classify-dish utility + Server Action + hook

**Skill**: data-layer
**Phase**: 2-Feature/menu-eng
**Depends on**: TASK-35
**Inputs**: `PROJECT_SPEC.md` (Flow 6 — Menu Engineering), `DATA_MODEL.md` (Recipe.salesVolume)
**Outputs**: `src/features/menu-engineering/types/index.ts`, `src/features/menu-engineering/utils/classify-dish.ts`, `src/features/menu-engineering/actions/get-menu-engineering-data.ts`, `src/features/menu-engineering/hooks/useMenuEngineering.ts`

**Acceptance Criteria**:
- [ ] `Quadrant` type: `'STAR' | 'WORKHORSE' | 'PUZZLE' | 'DOG'`
- [ ] `DishMatrixPoint` type: `{ recipeId, name, category, profitability: number, popularity: number, quadrant: Quadrant, grossMargin, foodCostPercent }`
- [ ] `classifyDish(profitability, avgProfitability, popularity, avgPopularity): Quadrant` — STAR: above avg on both; DOG: below avg on both; WORKHORSE: above avg pop / below avg profit; PUZZLE: below avg pop / above avg profit
- [ ] `getMenuEngineeringData(workspaceId)` SA: fetches all active non-sub recipes; computes cost for each; maps to `DishMatrixPoint[]` using `classifyDish`
- [ ] `useMenuEngineering(workspaceId)` uses `useQuery` calling `getMenuEngineeringData`
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-45: Menu Engineering feature — MenuMatrix + filter + detail panel components

**Skill**: component-builder
**Phase**: 2-Feature/menu-eng
**Depends on**: TASK-44, TASK-17
**Inputs**: `FILE_TREE.md` (`features/menu-engineering/components/`)
**Outputs**: `src/features/menu-engineering/components/MenuMatrix.tsx`, `MenuMatrixFilters.tsx`, `DishDetailPanel.tsx`, `QuadrantLabel.tsx`

**Acceptance Criteria**:
- [ ] `MenuMatrix` is `'use client'` — renders SVG scatter plot (not canvas) with 4 quadrants; each dish is a circle sized by salesVolume; hover shows tooltip with name + quadrant; click emits `onSelectDish` callback
- [ ] Quadrant dividers drawn as dashed lines at avgProfitability × avgPopularity intersection
- [ ] Axis labels: "Profitability (Gross Margin %)" (Y), "Popularity (Sales Volume)" (X)
- [ ] `MenuMatrixFilters` is `'use client'` — category filter chips using URL searchParams
- [ ] `DishDetailPanel` is `'use client'` — slide-over panel showing selected dish details: quadrant classification, food cost %, gross margin, recommendation text per quadrant
- [ ] `QuadrantLabel` is RSC — renders quadrant name badge with color coding (Star=green, Workhorse=blue, Puzzle=yellow, Dog=red)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: L
**Web search needed**: no

---

## TASK-46: Menu Engineering feature — MenuEngineeringPage + route page

**Skill**: component-builder
**Phase**: 2-Feature/menu-eng
**Depends on**: TASK-45
**Inputs**: `FILE_TREE.md` (`features/menu-engineering/`, `app/[workspaceSlug]/menu-engineering/`)
**Outputs**: `src/features/menu-engineering/components/MenuEngineeringPage.tsx`, `src/app/[workspaceSlug]/menu-engineering/page.tsx`

**Acceptance Criteria**:
- [ ] `MenuEngineeringPage` is RSC — fetches initial data server-side, renders `<MenuMatrix>` + `<MenuMatrixFilters>` + `<DishDetailPanel>` (client children)
- [ ] Shows note when any recipe has `salesVolume = null` (popularity axis may not be representative)
- [ ] Empty state when workspace has < 2 recipes (matrix requires data to be meaningful)
- [ ] Route page is Server Component with `dynamic = 'force-dynamic'`; redirects CHEF/VIEWER
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: S
**Web search needed**: no

---

## TASK-47: VERIFY Phase 2 — Run quality checks

**Skill**: none
**Phase**: 2-VERIFY
**Depends on**: TASK-19 through TASK-46

**Acceptance Criteria**:
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — succeeds with no build errors
- [ ] Manual smoke test: can sign up, create workspace, add ingredient, build recipe, view dashboard
- [ ] No cross-feature imports (run `grep -r "from '@/features/" src/features/ | grep -v "from '@/features/$(dirname ...)"`  or use ESLint import boundary rule)

**Complexity**: S
**Web search needed**: no

---

## Phase 3 — Polish

---

## TASK-48: Implement error boundaries (error.tsx per route group)

**Skill**: error-handling
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: `FILE_TREE.md` (route structure), `PROJECT_SPEC.md` (error paths in user flows)
**Outputs**: `src/app/(auth)/error.tsx`, `src/app/[workspaceSlug]/error.tsx`, `src/app/[workspaceSlug]/recipes/error.tsx`, `src/app/global-error.tsx`

**Acceptance Criteria**:
- [ ] Each `error.tsx` is `'use client'` (required by Next.js)
- [ ] Workspace-level error boundary shows workspace name + friendly message + "Go to Dashboard" button
- [ ] Recipe-level error boundary catches cost calculation failures with "Unable to calculate cost — refresh or contact support"
- [ ] `global-error.tsx` exists as last-resort fallback
- [ ] Error boundaries log to console in dev; in prod would log to monitoring (stub with `console.error`)
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-49: Implement loading states + not-found pages

**Skill**: component-builder
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: `FILE_TREE.md` (route structure), Skeleton components from TASK-16
**Outputs**: `loading.tsx` files for each main route, `not-found.tsx` files

**Acceptance Criteria**:
- [ ] `src/app/[workspaceSlug]/dashboard/loading.tsx` — skeleton of 4 KPI cards + table rows
- [ ] `src/app/[workspaceSlug]/ingredients/loading.tsx` — skeleton of ingredient cards list
- [ ] `src/app/[workspaceSlug]/recipes/loading.tsx` — skeleton of recipe list
- [ ] `src/app/[workspaceSlug]/menu-engineering/loading.tsx` — skeleton of matrix area
- [ ] `src/app/[workspaceSlug]/not-found.tsx` — workspace not found / access denied page with link back to login
- [ ] `src/app/not-found.tsx` — global 404 page
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-50: Unit tests — pure utility functions

**Skill**: testing
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: `src/shared/lib/cost-engine.ts`, `src/features/recipes/utils/circular-check.ts`, `src/features/menu-engineering/utils/classify-dish.ts`, `src/features/ingredients/utils/effective-price.ts`
**Outputs**: `src/shared/lib/cost-engine.test.ts`, `src/features/recipes/utils/circular-check.test.ts`, `src/features/menu-engineering/utils/classify-dish.test.ts`, `src/features/ingredients/utils/effective-price.test.ts`

**Acceptance Criteria**:
- [ ] `cost-engine.test.ts`: tests flat recipe (1 ingredient), nested sub-recipe (2 levels), 5-level deep sub-recipe, waste % applied correctly, unknown unit throws descriptive error
- [ ] `circular-check.test.ts`: direct cycle (A→B, B→A) detected, no false positive on valid tree, self-reference detected
- [ ] `classify-dish.test.ts`: all 4 quadrants covered, boundary values (exactly at average) tested
- [ ] `effective-price.test.ts`: 0% waste = same price, 50% waste = 1.5× price, 100% waste = 2× price
- [ ] `npm run test` — all tests pass

**Complexity**: M
**Web search needed**: no

---

## TASK-51: Component tests — IngredientForm, RecipeBuilder, LoginForm

**Skill**: testing
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: Feature component files from Phase 2
**Outputs**: `src/features/ingredients/components/IngredientForm.test.tsx`, `src/features/recipes/components/RecipeBuilder.test.tsx`, `src/features/auth/components/LoginForm.test.tsx`

**Acceptance Criteria**:
- [ ] `IngredientForm.test.tsx`: renders empty form; shows validation error on submit with empty name; calls `createIngredient` SA mock on valid submit; shows effective price update in real-time
- [ ] `LoginForm.test.tsx`: renders email + password inputs; shows error toast on `INVALID_CREDENTIALS`; disables submit button while loading
- [ ] `RecipeBuilder.test.tsx`: renders empty builder; can add ingredient item via `RecipeItemSearch` (mocked); shows cost summary after item added (mocked SA response)
- [ ] MSW used to intercept Server Action calls in tests
- [ ] `npm run test` — all tests pass

**Complexity**: M
**Web search needed**: no

---

## TASK-52: E2E tests — core user flows with Playwright

**Skill**: testing
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: `PROJECT_SPEC.md` (user flows 1–6), Playwright config
**Outputs**: `tests/e2e/auth.spec.ts`, `tests/e2e/ingredients.spec.ts`, `tests/e2e/recipe-builder.spec.ts`, `tests/e2e/dashboard.spec.ts`

**Acceptance Criteria**:
- [ ] `auth.spec.ts`: sign up with new email → verify email (stub token) → login → see dashboard; invalid credentials show error
- [ ] `ingredients.spec.ts`: add ingredient → appears in list; edit price → impact panel shown; delete ingredient used in recipe → error shown
- [ ] `recipe-builder.spec.ts`: create recipe → add 2 ingredients → see food cost % calculated; save → appears in recipe list
- [ ] `dashboard.spec.ts`: dashboard loads with KPI cards; recipe list shows food cost badges; alert feed shows after ingredient price change
- [ ] Tests use a separate test DB (via `TEST_DATABASE_URL` env var)
- [ ] `npm run test:e2e` — all tests pass

**Complexity**: L
**Web search needed**: no

---

## TASK-53: Accessibility audit and fixes

**Skill**: accessibility
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: All feature components from Phase 2
**Outputs**: Updated component files (targeted fixes only)

**Acceptance Criteria**:
- [ ] All interactive elements reachable and operable by keyboard only
- [ ] `RecipeBuilder` item rows have keyboard delete support (Delete key or button focus)
- [ ] `MenuMatrix` SVG has ARIA `role="img"` + `aria-label`; each dish point has `title` element
- [ ] All `<Modal>` instances trap focus correctly and return focus to trigger on close
- [ ] Color is not the only means to convey food cost status (add text labels alongside `CostThresholdBadge`)
- [ ] `npm run typecheck` passes with zero errors after changes

**Complexity**: M
**Web search needed**: no

---

## TASK-54: RTL layout verification + Hebrew text pass

**Skill**: component-builder
**Phase**: 3-Polish
**Depends on**: TASK-47
**Inputs**: All layout and feature components
**Outputs**: Targeted RTL fixes in component files

**Acceptance Criteria**:
- [ ] `Sidebar` navigation items align to the right in RTL
- [ ] `RecipeBuilder` item rows use `rtl:flex-row-reverse` where needed
- [ ] `MenuMatrix` axis labels correct in RTL context
- [ ] `PriceAlertFeed` items flow right-to-left correctly
- [ ] Icons that imply direction (chevrons, arrows) are mirrored in RTL using Tailwind `rtl:rotate-180` or equivalent
- [ ] No hardcoded `ml-*`, `mr-*`, `pl-*`, `pr-*` in new components — use `ms-*`, `me-*`, `ps-*`, `pe-*` (logical properties) instead
- [ ] `npm run typecheck` passes with zero errors

**Complexity**: M
**Web search needed**: no

---

## TASK-55: VERIFY Phase 3 — Final quality checks

**Skill**: none
**Phase**: 3-VERIFY
**Depends on**: TASK-48 through TASK-54

**Acceptance Criteria**:
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm run test` — all unit + component tests pass
- [ ] `npm run test:e2e` — all E2E tests pass
- [ ] `npm run build` — succeeds, no build warnings
- [ ] Lighthouse accessibility score ≥ 90 on dashboard page
- [ ] No `any` types in codebase (`grep -r ": any" src/` returns nothing)
- [ ] No cross-feature imports (`grep -rn "from '@/features/" src/features/` shows only intra-feature imports)

**Complexity**: S
**Web search needed**: no
