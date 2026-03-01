# ARCHITECTURE.md
## MenuCost — Technical Architecture Decisions

---

## 1. Routing Structure

**Decision**: Multi-tenant via `/[workspaceSlug]/...` URL segments.

```
/                              → Landing / redirect to app
/(auth)/login                  → Login page
/(auth)/signup                 → Sign up
/(auth)/forgot-password        → Password reset request
/(auth)/verify-email           → Email verification gate
/[workspaceSlug]/dashboard     → Main KPI dashboard
/[workspaceSlug]/ingredients   → Ingredient list + management
/[workspaceSlug]/ingredients/[id] → Ingredient detail + impact
/[workspaceSlug]/recipes       → Recipe list
/[workspaceSlug]/recipes/new   → Recipe builder (new)
/[workspaceSlug]/recipes/[id]  → Recipe detail + cost view
/[workspaceSlug]/recipes/[id]/edit → Recipe builder (edit)
/[workspaceSlug]/menu-engineering  → Profitability × Popularity matrix
/[workspaceSlug]/settings      → Workspace settings
/[workspaceSlug]/settings/members → Member management + invitations
```

**Rationale**: Workspace slug in the URL makes the context explicit, enables bookmarking, and supports multi-workspace switching without re-auth. `/app/` prefix omitted for cleaner URLs.

**Middleware** (`src/middleware.ts`): Validates session and workspace membership on every `[workspaceSlug]` route. Redirects unauthenticated users to `/login`. Returns 403 for workspace access violations.

---

## 2. Authentication

**Decision**: NextAuth v5 (Auth.js) with `Credentials` provider (email + bcrypt password hash). JWT sessions stored as signed cookies.

**Rationale**:
- Email/password is the only auth method in MVP per PRD
- JWT sessions avoid DB round-trips on every request
- NextAuth v5 natively integrates with Next.js App Router middleware
- Password reset and email verification handled via custom token flow (stored in DB, not email magic link)

**Session shape**:
```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
  }
}
```

**Workspace membership** is NOT stored in the session. Each Server Action independently queries `WorkspaceMember` using the session `userId` + `workspaceId` from the URL. This avoids stale role caching.

---

## 3. Recursive Cost Engine

**Decision**: Pure TypeScript server-side recursion in `src/shared/lib/cost-engine.ts`. Called from Server Actions — never exposed directly to the client.

**Rationale**: Simpler than a PostgreSQL recursive CTE, fully testable with Vitest (pure function), avoids raw SQL, and the 5-level nesting limit keeps runtime well within the 500ms target.

**Algorithm**:
```typescript
// Pseudocode — see src/shared/lib/cost-engine.ts for full implementation
function calculateCost(recipeId: string, allRecipes: Map, allIngredients: Map): number {
  const recipe = allRecipes.get(recipeId)
  let total = 0
  for (const item of recipe.items) {
    if (item.ingredientId) {
      const ing = allIngredients.get(item.ingredientId)
      const effectivePrice = ing.pricePerUnit * (1 + ing.wastePercent / 100)
      const conversionFactor = getConversionFactor(item.unit, ing.unit)
      total += item.quantity * effectivePrice * conversionFactor
    } else {
      const subCostPerYield = calculateCost(item.subRecipeId, allRecipes, allIngredients)
      const subRecipe = allRecipes.get(item.subRecipeId)
      total += item.quantity * (subCostPerYield / subRecipe.yield)
    }
  }
  return total
}
```

**Pre-fetching**: The Server Action fetches the entire recipe tree (all sub-recipes transitively) + all referenced ingredients in **2 queries** before calling the pure function. No N+1 queries.

**Circular reference guard**: Detected at write time in `src/features/recipes/utils/circular-check.ts`. Returns an error before saving.

---

## 4. Cost Caching Strategy

**Decision**: `next/cache` `unstable_cache` with tag-based invalidation.

```typescript
// In a Server Action:
const data = await unstable_cache(
  () => fetchRecipeCostData(recipeId),
  [`recipe-cost-${recipeId}`],
  { tags: [`recipe:${recipeId}`, `workspace:${workspaceId}`] }
)()

// On ingredient price update:
revalidateTag(`workspace:${workspaceId}`) // invalidates all recipe costs in workspace
```

**Rationale**:
- Dashboard loads < 2s target is met without recomputing all costs on every load
- `revalidateTag` is instant (no TTL drift)
- No stale cost indicator needed on the client — server always serves fresh data after mutation

**Stale indicator**: A `costStaleSince` timestamp on `Recipe` is set optimistically when an ingredient changes price. Shown in the UI as "recalculating..." until the next page load resolves via cache invalidation.

---

## 5. RSC vs Client Component Decisions

| Component | Type | Reason |
|-----------|------|--------|
| DashboardPage | RSC (async) | Fetches KPI data at render time, no interactivity |
| FoodCostKPICard | RSC | Pure display from props |
| IngredientList | RSC | Server-fetched list, pagination via URL |
| IngredientForm | Client | `useForm`, `onChange`, `onSubmit` |
| RecipeBuilder | Client | Complex real-time state (items array, live cost) |
| RecipeCostSummary | Client | Live-updating display driven by builder state |
| MenuMatrix | Client | Canvas/SVG chart, mouse events for hover labels |
| Sidebar | Client | Active route highlighting via `usePathname` |
| WorkspaceSwitcher | Client | Dropdown open/close state |
| AppShell | RSC | Layout wrapper, passes workspace data from server |
| MemberList | RSC | Simple data table, no interactivity |
| InviteMemberForm | Client | Form with `useForm` + email validation |

---

## 6. State Management

| State | Location | Reason |
|-------|----------|--------|
| Authenticated user (id, name, email) | Zustand `useAuthStore` | Cross-feature, survives route changes |
| Active workspace (slug, id, role) | Zustand `useWorkspaceStore` | Cross-feature, needed in every Server Action call |
| Recipe items in builder | `useState` in `RecipeBuilder` | Purely local, no sharing needed |
| Ingredient search input | `useState` + `useDebounce` | UI-only, component-local |
| Recipe list category filter | URL `searchParams` | Shareable, browser back works correctly |
| Dashboard data | TanStack Query | Async server data with cache |
| Ingredient list | TanStack Query | Async server data with cache + mutation invalidation |
| Matrix data for Menu Engineering | TanStack Query | Async, benefits from cache |
| Modal open/closed | `useState` colocated | UI-only, single component |
| Sidebar collapsed | Zustand (persisted to localStorage) | Cross-page UI preference |

---

## 7. RBAC Implementation

**Decision**: Enforced at the Server Action level. Each action checks the caller's role before executing.

```typescript
// Pattern used in every mutation Server Action
async function updateIngredient(input: UpdateIngredientInput) {
  const session = await auth()
  if (!session) throw new Error('UNAUTHENTICATED')

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: input.workspaceId, userId: session.user.id } }
  })
  if (!member || !['OWNER', 'MANAGER'].includes(member.role)) {
    throw new Error('FORBIDDEN')
  }
  // ... proceed with mutation
}
```

**Role visibility matrix**:
| Data | OWNER | MANAGER | CHEF | VIEWER |
|------|-------|---------|------|--------|
| Ingredient costs | ✅ | ✅ | ❌ | ❌ |
| Recipe cost/margin | ✅ | ✅ | ❌ | ❌ |
| Selling price | ✅ | ❌ | ❌ | ❌ |
| Recipe items (quantities) | ✅ | ✅ | ✅ | ✅ |
| Dashboard KPIs | ✅ | ✅ | ❌ | ❌ |
| Menu Engineering | ✅ | ✅ | ❌ | ❌ |
| Settings / members | ✅ | ❌ | ❌ | ❌ |

**UI gate**: Sensitive components receive a `canViewCosts: boolean` prop derived from the session role. Server Action double-checks — the UI gate is UX only, not a security control.

---

## 8. Monetary Values

**Decision**: All prices stored as `Decimal` in PostgreSQL (Prisma `@db.Decimal(10, 4)`). Never `Float`.

**Rationale**: Floating-point arithmetic errors are unacceptable for financial calculations. Prisma's `Decimal` type maps to `decimal.js` on the JS side. All arithmetic uses `Decimal` operations.

---

## 9. Soft Delete

**Decision**: All major entities have `deletedAt DateTime?`. Hard deletes are never used.

**Implementation**: Prisma middleware (in `src/shared/lib/prisma.ts`) appends `where: { deletedAt: null }` to all `findMany`, `findUnique`, and `findFirst` queries automatically. Mutations use `update({ data: { deletedAt: new Date() } })`.

---

## 10. RTL (Hebrew) Layout

**Decision**: Full RTL via `dir="rtl"` on `<html>` element. Tailwind RTL utilities (`rtl:flex-row-reverse`, `rtl:text-right`, etc.) handle layout mirroring.

**Rationale**: Primary market is Hebrew. Full RTL is the correct UX, not just right-aligned text. Tailwind v3 has solid `rtl:` support.

**Font**: `Noto Sans Hebrew` loaded via `next/font/google` as the primary font, with system fallback for Latin characters.

---

## 11. Workspace Invitations

**Decision**: Email link via **Resend**. A `WorkspaceInvitation` record is created with a signed token (short UUID). Link: `/invite/[token]`.

**Flow**:
1. Owner submits invite form → Server Action creates `WorkspaceInvitation` + sends email via Resend
2. Invitee clicks link → Route Handler at `GET /api/invitations/[token]` validates token
3. If logged in → adds `WorkspaceMember` + redirects to workspace dashboard
4. If not logged in → redirects to `/signup?invite=[token]` → after signup, token is consumed

---

## 12. Rendering Strategy

| Route | Strategy | Reason |
|-------|----------|--------|
| `/(auth)/*` | Dynamic | Auth state changes frequently |
| `/[workspaceSlug]/dashboard` | Dynamic RSC | Personalized, auth-gated, real-time KPIs |
| `/[workspaceSlug]/ingredients` | Dynamic RSC | Workspace-scoped, changes on mutation |
| `/[workspaceSlug]/recipes` | Dynamic RSC | Workspace-scoped |
| `/[workspaceSlug]/menu-engineering` | Dynamic RSC | Computed from current data |
| `/[workspaceSlug]/settings/*` | Dynamic RSC | Membership data is real-time |
| `/` (landing) | Static | No personalization |

All `[workspaceSlug]` routes use `export const dynamic = 'force-dynamic'`.

---

## 13. API Routes (minimal)

Only two Route Handlers — everything else is Server Actions:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler |
| `/api/invitations/[token]` | GET | Accept workspace invitation link |

---

## 14. Unit Conversion

**Decision**: Predefined metric conversion table stored in the database (`UnitConversion` entity). Seeded on first migration. No manual override in MVP.

**Common conversions seeded**:
- kg ↔ g (factor: 1000)
- liter ↔ ml (factor: 1000)
- kg ↔ mg (factor: 1,000,000)
- liter ↔ cl (factor: 100)

**Same-unit**: No conversion needed (factor = 1).
**Unknown conversion**: Server Action returns an error asking user to use matching units.
