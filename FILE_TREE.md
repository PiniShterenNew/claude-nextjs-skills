# FILE_TREE.md
## MenuCost — Full Directory Structure

```
/
├── prisma/
│   ├── schema.prisma              # Prisma data model (see DATA_MODEL.md)
│   ├── migrations/                # Auto-generated migration history
│   └── seed.ts                    # Unit conversions + dev seed data
│
├── src/
│   ├── app/                       # Next.js App Router — routing ONLY, thin files
│   │   ├── layout.tsx             # Root layout: fonts, Providers, dir="rtl"
│   │   ├── page.tsx               # Landing page → redirect to /login or workspace
│   │   │
│   │   ├── (auth)/                # Auth route group — no workspace context
│   │   │   ├── layout.tsx         # Centered auth card layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Renders LoginForm (from features/auth)
│   │   │   ├── signup/
│   │   │   │   └── page.tsx       # Renders SignupForm; reads ?invite= param
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx       # Renders ForgotPasswordForm
│   │   │   └── verify-email/
│   │   │       └── page.tsx       # Email verification gate; reads ?token= param
│   │   │
│   │   ├── [workspaceSlug]/       # Workspace-scoped routes
│   │   │   ├── layout.tsx         # AppShell: sidebar + header; validates membership
│   │   │   ├── page.tsx           # Redirect → /[workspaceSlug]/dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Renders DashboardPage (RSC)
│   │   │   ├── ingredients/
│   │   │   │   ├── page.tsx       # Renders IngredientListPage (RSC)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Renders IngredientDetailPage (RSC)
│   │   │   ├── recipes/
│   │   │   │   ├── page.tsx       # Renders RecipeListPage (RSC)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Renders RecipeBuilder (Client)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Renders RecipeDetailPage (RSC)
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Renders RecipeBuilder (Client, edit mode)
│   │   │   ├── menu-engineering/
│   │   │   │   └── page.tsx       # Renders MenuEngineeringPage (RSC + Client matrix)
│   │   │   └── settings/
│   │   │       ├── page.tsx       # Workspace general settings
│   │   │       └── members/
│   │   │           └── page.tsx   # Member management + invite form
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts   # NextAuth handler
│   │       └── invitations/
│   │           └── [token]/
│   │               └── route.ts   # GET: accept invite link, redirect
│   │
│   ├── features/                  # Feature modules — vertical slices
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx             # 'use client' — RHF + Zod
│   │   │   │   ├── SignupForm.tsx            # 'use client' — RHF + Zod
│   │   │   │   └── ForgotPasswordForm.tsx   # 'use client' — RHF + Zod
│   │   │   ├── actions/
│   │   │   │   ├── login.ts                 # Server Action: credentials auth
│   │   │   │   ├── signup.ts                # Server Action: create user + send verify email
│   │   │   │   ├── forgot-password.ts       # Server Action: create reset token + email
│   │   │   │   └── verify-email.ts          # Server Action: consume token, set emailVerified
│   │   │   └── types/
│   │   │       └── index.ts                 # LoginInput, SignupInput, AuthError
│   │   │
│   │   ├── workspace/
│   │   │   ├── components/
│   │   │   │   ├── WorkspaceCreateForm.tsx  # 'use client' — onboarding
│   │   │   │   ├── WorkspaceSettingsForm.tsx # 'use client' — general settings
│   │   │   │   ├── MemberList.tsx           # RSC — server-fetched table
│   │   │   │   ├── InviteMemberForm.tsx     # 'use client' — email + role selector
│   │   │   │   └── MemberRoleSelector.tsx   # 'use client' — inline role change
│   │   │   ├── hooks/
│   │   │   │   └── useWorkspaceMembers.ts   # TanStack Query: member list
│   │   │   ├── actions/
│   │   │   │   ├── create-workspace.ts      # Server Action
│   │   │   │   ├── update-workspace.ts      # Server Action: name, threshold, currency
│   │   │   │   ├── invite-member.ts         # Server Action: create invite + Resend email
│   │   │   │   ├── update-member-role.ts    # Server Action: OWNER only
│   │   │   │   └── remove-member.ts         # Server Action: OWNER only, soft delete
│   │   │   └── types/
│   │   │       └── index.ts                 # WorkspaceInput, InviteInput, MemberRow
│   │   │
│   │   ├── ingredients/
│   │   │   ├── components/
│   │   │   │   ├── IngredientListPage.tsx   # RSC — async, direct Prisma
│   │   │   │   ├── IngredientListClient.tsx # 'use client' — search/filter bar
│   │   │   │   ├── IngredientForm.tsx       # 'use client' — create/edit modal
│   │   │   │   ├── IngredientCard.tsx       # RSC — display card
│   │   │   │   ├── IngredientDetailPage.tsx # RSC — detail + impact panel
│   │   │   │   └── IngredientImpactPanel.tsx # RSC — affected recipes list
│   │   │   ├── hooks/
│   │   │   │   ├── useIngredients.ts        # TanStack Query: list with filter
│   │   │   │   └── useIngredientMutations.ts # useMutation: create/update/delete
│   │   │   ├── actions/
│   │   │   │   ├── create-ingredient.ts     # Server Action + Zod validation
│   │   │   │   ├── update-ingredient.ts     # Server Action — triggers cost staleness
│   │   │   │   ├── delete-ingredient.ts     # Server Action — soft delete
│   │   │   │   ├── get-ingredients.ts       # Server Action: list with search
│   │   │   │   └── get-ingredient-impact.ts # Server Action: recipes affected by price
│   │   │   ├── utils/
│   │   │   │   └── effective-price.ts       # effectivePrice(price, wastePercent): Decimal
│   │   │   └── types/
│   │   │       └── index.ts                 # IngredientInput, IngredientRow, ImpactResult
│   │   │
│   │   ├── recipes/
│   │   │   ├── components/
│   │   │   │   ├── RecipeListPage.tsx       # RSC — async, category filter via URL
│   │   │   │   ├── RecipeListClient.tsx     # 'use client' — category filter tabs
│   │   │   │   ├── RecipeBuilder.tsx        # 'use client' — main builder (items, cost)
│   │   │   │   ├── RecipeItemRow.tsx        # 'use client' — single ingredient/sub-recipe line
│   │   │   │   ├── RecipeItemSearch.tsx     # 'use client' — ingredient/sub-recipe typeahead
│   │   │   │   ├── RecipeCostSummary.tsx    # 'use client' — live cost breakdown panel
│   │   │   │   ├── RecipeDetailPage.tsx     # RSC — view-only with computed cost
│   │   │   │   └── RecipeForm.tsx           # 'use client' — meta fields (name, yield, price)
│   │   │   ├── hooks/
│   │   │   │   ├── useRecipes.ts            # TanStack Query: list with filters
│   │   │   │   ├── useRecipeMutations.ts    # useMutation: create/update/delete
│   │   │   │   └── useRecipeCost.ts         # useMutation: calls calculateRecipeCost SA
│   │   │   ├── actions/
│   │   │   │   ├── create-recipe.ts         # Server Action
│   │   │   │   ├── update-recipe.ts         # Server Action
│   │   │   │   ├── delete-recipe.ts         # Server Action — soft delete
│   │   │   │   ├── get-recipes.ts           # Server Action: list with category filter
│   │   │   │   ├── get-recipe.ts            # Server Action: single recipe + items
│   │   │   │   ├── calculate-recipe-cost.ts # Server Action: fetches tree + calls cost-engine
│   │   │   │   ├── add-recipe-item.ts       # Server Action + circular check
│   │   │   │   ├── update-recipe-item.ts    # Server Action
│   │   │   │   └── remove-recipe-item.ts    # Server Action
│   │   │   ├── utils/
│   │   │   │   └── circular-check.ts        # detectCircularRef(recipeId, subRecipeId): bool
│   │   │   └── types/
│   │   │       └── index.ts                 # RecipeInput, RecipeRow, RecipeItemInput
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── DashboardPage.tsx        # RSC (async) — top-level dashboard
│   │   │   │   ├── FoodCostKPICard.tsx      # RSC — single KPI metric card
│   │   │   │   ├── RecipeCostTable.tsx      # RSC — all recipes with cost % + color badge
│   │   │   │   ├── PriceAlertFeed.tsx       # RSC — recent price changes (AuditLog)
│   │   │   │   └── CostThresholdBadge.tsx   # RSC — green/yellow/red based on threshold
│   │   │   ├── actions/
│   │   │   │   └── get-dashboard-data.ts    # Server Action: aggregates all recipe costs
│   │   │   └── types/
│   │   │       └── index.ts                 # DashboardKPI, RecipeCostRow, AlertRow
│   │   │
│   │   └── menu-engineering/
│   │       ├── components/
│   │       │   ├── MenuEngineeringPage.tsx  # RSC — data fetch, passes to client matrix
│   │       │   ├── MenuMatrix.tsx           # 'use client' — SVG scatter plot
│   │       │   ├── MenuMatrixFilters.tsx    # 'use client' — category filter chips
│   │       │   ├── DishDetailPanel.tsx      # 'use client' — slide-over on click
│   │       │   └── QuadrantLabel.tsx        # RSC — Star/Workhorse/Puzzle/Dog label
│   │       ├── hooks/
│   │       │   └── useMenuEngineering.ts    # TanStack Query: dish matrix data
│   │       ├── actions/
│   │       │   └── get-menu-engineering-data.ts # Server Action: cost + salesVolume per recipe
│   │       ├── utils/
│   │       │   └── classify-dish.ts         # classifyDish(profit, popularity): Quadrant
│   │       └── types/
│   │           └── index.ts                 # DishMatrixPoint, Quadrant, MenuEngineeringData
│   │
│   ├── shared/                    # Cross-feature code — imported by any feature
│   │   ├── components/
│   │   │   ├── ui/                # Base UI component library
│   │   │   │   ├── Button.tsx     # RSC-compatible (no state)
│   │   │   │   ├── Input.tsx      # RSC-compatible
│   │   │   │   ├── Card.tsx       # RSC-compatible
│   │   │   │   ├── Badge.tsx      # RSC-compatible
│   │   │   │   ├── Typography.tsx # RSC-compatible
│   │   │   │   ├── Skeleton.tsx   # RSC-compatible
│   │   │   │   ├── Select.tsx     # 'use client' (controlled select)
│   │   │   │   ├── Modal.tsx      # 'use client' (focus trap, portal)
│   │   │   │   ├── Table.tsx      # RSC-compatible
│   │   │   │   ├── Tabs.tsx       # 'use client' (active tab state)
│   │   │   │   ├── Toast.tsx      # 'use client' (Sonner wrapper)
│   │   │   │   └── Tooltip.tsx    # 'use client' (hover state)
│   │   │   └── layout/
│   │   │       ├── AppShell.tsx         # RSC — outer layout wrapper
│   │   │       ├── Sidebar.tsx          # 'use client' — active nav, collapse toggle
│   │   │       ├── Header.tsx           # RSC — workspace name, user avatar
│   │   │       └── WorkspaceSwitcher.tsx # 'use client' — dropdown, switches workspace
│   │   │
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts           # Generic debounce hook
│   │   │   └── useMediaQuery.ts         # Responsive breakpoint hook
│   │   │
│   │   ├── lib/
│   │   │   ├── auth.ts                  # NextAuth v5 config (providers, callbacks)
│   │   │   ├── prisma.ts                # PrismaClient singleton + soft-delete middleware
│   │   │   ├── env.ts                   # Zod env validation (throws on startup if invalid)
│   │   │   ├── cn.ts                    # clsx + tailwind-merge utility
│   │   │   ├── cost-engine.ts           # Recursive cost calculation (pure TS, testable)
│   │   │   ├── decimal.ts               # Decimal.js helpers: formatILS, toDecimal
│   │   │   ├── resend.ts                # Resend client + email templates
│   │   │   └── unit-conversion.ts       # getConversionFactor(from, to): number
│   │   │
│   │   └── types/
│   │       └── index.ts                 # BaseEntity, ApiResponse<T>, PaginationMeta,
│   │                                    # WorkspaceRole, CostResult
│   │
│   ├── store/                     # Zustand stores (cross-feature global state)
│   │   ├── auth-store.ts          # User identity (id, name, email)
│   │   └── workspace-store.ts     # Active workspace (id, slug, role, threshold)
│   │
│   └── middleware.ts              # NextAuth session check + workspace membership guard
│
├── .env.local                     # Local secrets (never committed)
├── .env.example                   # Template for required env vars
├── CLAUDE.md                      # Project instructions for Claude
├── PROJECT_SPEC.md                # Output of prd-analyzer skill
├── ARCHITECTURE.md                # This file
├── FILE_TREE.md                   # This file
├── DATA_MODEL.md                  # Output of system-planner skill
├── tailwind.config.ts             # Design tokens, RTL support
├── tsconfig.json                  # Strict mode
├── next.config.ts                 # Next.js config
└── package.json
```

---

## Feature Import Rules

```
✅ features/ingredients → shared/lib/cost-engine.ts       (allowed)
✅ features/recipes     → shared/lib/cost-engine.ts       (allowed)
✅ features/dashboard   → shared/components/ui/Card.tsx   (allowed)
✅ features/auth        → shared/lib/auth.ts              (allowed)

❌ features/ingredients → features/recipes/               (FORBIDDEN)
❌ features/dashboard   → features/ingredients/           (FORBIDDEN)
❌ features/recipes     → features/dashboard/             (FORBIDDEN)

Cross-feature data sharing → Go through shared/ or use Zustand store
```

---

## Key File Responsibilities

| File | Responsibility |
|------|---------------|
| `src/middleware.ts` | Protect all `[workspaceSlug]` routes; validate session + membership |
| `src/shared/lib/cost-engine.ts` | Pure recursive cost function — no DB calls, no side effects |
| `src/shared/lib/prisma.ts` | Singleton client + soft-delete middleware |
| `src/shared/lib/auth.ts` | NextAuth config, session shape, JWT callbacks |
| `src/shared/lib/env.ts` | Zod schema for all env vars — validated at startup |
| `src/store/workspace-store.ts` | Active workspace context across all features |
| `prisma/schema.prisma` | Source of truth for all data models |
