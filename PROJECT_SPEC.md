# PROJECT_SPEC.md

## Overview
**Product name**: MenuCost
**Purpose**: Web application that gives restaurant owners real-time visibility and control over menu profitability — tracking ingredient costs, recipe trees, and food cost percentages in one place. Eliminates manual spreadsheet calculations and surfaces cost overruns instantly when ingredient prices change.
**Target users**: Primary — restaurant owners and managers of small-to-medium restaurants, cafes, catering businesses, and institutional kitchens. Secondary — chefs who need to view/edit recipes without seeing financials.
**Success metrics**:
- User can calculate the true cost of any dish within 2 minutes of entering ingredients
- Food Cost % visible on dashboard without manual calculation
- Price change impact reflected across all affected recipes automatically

---

## Actors & Roles

| Actor | Description | Permissions Summary |
|-------|-------------|---------------------|
| Owner | Restaurant/business owner | Full access: ingredients, recipes, costs, pricing, dashboard, menu engineering, settings, workspace management |
| Manager | Operations manager | Ingredients + recipes + costs — no pricing decisions, no workspace settings |
| Chef | Kitchen staff | View and edit recipes only — no cost or profitability data visible |
| Viewer | Read-only stakeholder | View recipes and menu — no cost data, no editing |
| (Guest) | Unauthenticated | No access — all routes require auth |

---

## Features

| Feature | Priority | Complexity | Entities Touched | Core User Flow |
|---------|----------|------------|-----------------|----------------|
| Auth — Email/Password signup + login | P0 | S | User | User signs up → verifies email → logs in → redirected to workspace |
| Workspace creation + management | P0 | S | Workspace, WorkspaceMember | Owner creates workspace → sets name → invites team members |
| Workspace member invitations + RBAC | P0 | M | Workspace, WorkspaceMember, User | Owner invites by email → invitee accepts → assigned role applied |
| Ingredient management (CRUD + waste %) | P0 | M | Ingredient, Unit | User navigates to Ingredients → adds/edits/deletes → system shows net effective price |
| Recipe builder with nested sub-recipes | P0 | L | Recipe, RecipeItem, Ingredient | User creates recipe → adds ingredient/sub-recipe items → sees real-time cost |
| Recursive cost engine (server-side) | P0 | L | Recipe, Ingredient, RecipeItem | System computes cost recursively on demand — never stored, always fresh |
| Pricing & profitability per dish | P0 | M | Recipe, PricingConfig | User sets selling price + VAT → system shows gross margin, food cost %, net profit |
| Dashboard — Food Cost KPIs | P0 | M | Recipe, Ingredient (aggregations) | Owner opens dashboard → sees avg food cost %, top/bottom dishes, recent alerts |
| Menu Engineering matrix | P0 | M | Recipe, SalesData | Owner views Profitability × Popularity matrix → dishes classified Star/Workhorse/Puzzle/Dog |
| Price change impact analysis | P0 | M | Ingredient, Recipe | User edits ingredient price → system shows affected recipes and cost delta |
| Unit conversion engine | P1 | M | Unit, Conversion | System converts kg→g, liter→ml automatically when adding recipe items |
| Audit log for price changes | P1 | S | AuditLog | System records before/after for every price change — visible to Owner/Manager |
| Multiple branches per workspace | P2 | L | Branch, Ingredient | Chain owner sets branch-level ingredient prices |
| Sales data import (CSV) | P2 | M | SalesData | Owner imports POS export → system uses it for Menu Engineering popularity axis |

---

## Data Entities (Draft)

> These are rough — db-schema skill will finalize with Prisma models, indexes, and relations.

```typescript
// User — platform-level identity
interface User {
  id: string            // cuid()
  email: string         // unique
  name: string
  passwordHash: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// Workspace — isolated tenant (one restaurant / chain HQ)
interface Workspace {
  id: string
  name: string
  slug: string          // unique, URL-safe
  currency: 'ILS'       // MVP: ILS only
  foodCostThreshold: number  // default 30 (%)
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// WorkspaceMember — user ↔ workspace join with role
interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'
  invitedAt: string
  acceptedAt: string | null
}

// Ingredient — raw material with cost and waste
interface Ingredient {
  id: string
  workspaceId: string
  name: string
  unit: string           // 'kg' | 'g' | 'liter' | 'ml' | 'unit' | ...
  pricePerUnit: number   // Decimal — price in ILS per unit
  wastePercent: number   // 0–100, default 0
  supplier?: string
  pricedAt: string       // last price update date
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// Recipe — dish or sub-recipe
interface Recipe {
  id: string
  workspaceId: string
  name: string
  category?: string
  yield: number          // how many portions this recipe produces
  yieldUnit: string      // 'portion' | 'kg' | 'liter' | ...
  isSubRecipe: boolean   // true = nestable inside other recipes
  sellingPrice?: number  // null for sub-recipes
  vatPercent?: number    // e.g. 17
  laborCost?: number     // manual labor cost per portion
  overheadCost?: number  // manual overhead per portion
  salesVolume?: number   // manual input for Menu Engineering popularity
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// RecipeItem — one line in a recipe (ingredient OR sub-recipe)
interface RecipeItem {
  id: string
  recipeId: string
  ingredientId?: string  // mutually exclusive with subRecipeId
  subRecipeId?: string
  quantity: number
  unit: string
}

// RecipeCostResult — computed server-side, never stored
interface RecipeCostResult {
  recipeId: string
  ingredientCost: number     // recursive sum of all ingredients per portion
  laborCost: number
  overheadCost: number
  totalCost: number          // ingredientCost + laborCost + overheadCost
  sellingPrice: number
  grossProfit: number        // sellingPrice - ingredientCost
  grossMargin: number        // grossProfit / sellingPrice * 100
  foodCostPercent: number    // ingredientCost / sellingPrice * 100
  netProfit: number          // sellingPrice - totalCost
  netMargin: number          // netProfit / sellingPrice * 100
}

// AuditLog — price change history
interface AuditLog {
  id: string
  workspaceId: string
  entityType: 'Ingredient' | 'Recipe' | 'RecipeItem'
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  changes: { before: unknown; after: unknown }
  actorId: string
  createdAt: string
}

// UnitConversion — predefined metric conversion factors
interface UnitConversion {
  id: string
  fromUnit: string     // e.g. 'kg'
  toUnit: string       // e.g. 'g'
  factor: number       // multiply fromUnit quantity by factor to get toUnit quantity
}
```

---

## User Flows (P0 features)

### Flow 1 — Sign Up & Create Workspace
1. User visits `/signup`
2. Fills: name, email, password
3. System creates User + sends verification email
4. User verifies email → redirected to `/onboarding`
5. User creates first Workspace (name, slug)
6. System creates WorkspaceMember with role `OWNER`
7. Success: User lands on Dashboard of new workspace
8. Error: Email already in use → show inline error

### Flow 2 — Add an Ingredient
1. User navigates to `/[workspace]/ingredients`
2. Clicks "Add Ingredient"
3. Fills: name, unit, price per unit, waste %, supplier (optional)
4. System saves and displays effective net price (price × (1 + waste/100))
5. System flags all recipes that use this ingredient as "stale"
6. Error: Duplicate name in workspace → validation error shown inline

### Flow 3 — Build a Recipe
1. User navigates to `/[workspace]/recipes` → "New Recipe"
2. Sets: name, category, yield (count + unit), selling price, VAT
3. Adds items: search ingredient or sub-recipe → set quantity + unit
4. System calculates cost in real-time (debounced Server Action call)
5. User sees: ingredient cost, food cost %, gross margin
6. User saves → system persists and marks cost as fresh
7. Error: circular sub-recipe reference → prevented server-side + shown as error

### Flow 4 — Update Ingredient Price
1. User edits an ingredient's `pricePerUnit`
2. System saves → marks all dependent recipes as "stale"
3. Impact summary shown: "X recipes affected, avg Food Cost changed from Y% → Z%"
4. Panel lists recipes now exceeding Food Cost threshold
5. User can click each recipe to see full impact detail
6. Error: No recipes use this ingredient → summary shows 0 affected

### Flow 5 — View Dashboard
1. Owner opens `/[workspace]/dashboard`
2. System triggers cost calculations for all non-deleted recipes
3. KPIs shown: avg Food Cost %, most profitable dish, most expensive-to-produce
4. Recipe list: sorted by food cost % with color coding (green < threshold, yellow ±5%, red > threshold)
5. Recent price change alerts shown in sidebar
6. Error: No recipes yet → empty state with CTA to add first recipe

### Flow 6 — Menu Engineering Analysis
1. Owner navigates to `/[workspace]/menu-engineering`
2. System plots each dish on Profitability (Y) × Popularity (X) matrix
3. Each dish classified: Star (high profit + high pop) / Workhorse (low profit + high pop) / Puzzle (high profit + low pop) / Dog (low profit + low pop)
4. Owner can filter by category
5. Click on dish → detail panel with recommendations
6. Error: No salesVolume data → popularity axis uses 0 for all, note shown to user

### Flow 7 — Invite Team Member
1. Owner navigates to Workspace Settings → Members
2. Clicks "Invite Member" → enters email + selects role
3. System sends invitation email with accept link
4. Invitee clicks link → signs up (if new) or logs in → added to workspace
5. Success: Member appears in workspace member list
6. Error: Email already a member → show error

---

## Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
| Security | RLS: users only see their workspace data | P0 |
| Security | Role-based access — Chef cannot see any cost data | P0 |
| Security | All mutations require auth + workspace membership check | P0 |
| Security | All inputs validated with Zod at action/route boundary | P0 |
| Performance | Recursive cost recalculation < 500ms for recipes up to 5 levels deep | P0 |
| Performance | Dashboard loads < 2s on desktop | P0 |
| Performance | Ingredient search autocomplete < 100ms | P1 |
| Correctness | All monetary values stored as Decimal (Prisma `@db.Decimal`) — never Float | P0 |
| Correctness | Soft delete only — `deletedAt` timestamp, never `DELETE FROM` | P0 |
| Correctness | Circular sub-recipe reference prevented at write time | P0 |
| Accessibility | WCAG 2.1 AA compliance | P1 |
| i18n | Hebrew RTL support (primary market) | P1 |
| Availability | 99.9% uptime target | P1 |

---

## Ambiguities & Open Questions

| # | Question | Impact | Default Assumption |
|---|----------|--------|-------------------|
| 1 | Currency — fixed ILS or configurable per workspace? | DB schema, formatting | ILS only in MVP — stored on Workspace for future flexibility |
| 2 | Food Cost threshold — fixed 30% or configurable? | Dashboard alert logic | Configurable per workspace (`foodCostThreshold`), default 30% |
| 3 | Menu Engineering without sales data — disable popularity axis or use manual input? | Feature scope | Manual `salesVolume` field on Recipe — popularity axis optional |
| 4 | Unit conversion — full metric table or manual override? | RecipeItem data entry | Predefined common conversions (kg/g, liter/ml, etc.), no manual override in MVP |
| 5 | Are sub-recipes shareable across workspaces? | Multi-tenant isolation | No — each workspace owns its own sub-recipes |
| 6 | Price change recalculation — eager (on save) or lazy (on view)? | Performance | Lazy: stale indicator set on save, cost computed on view or manual refresh |
| 7 | Email verification — required before access? | Auth + onboarding UX | Required — unverified users cannot create/join workspaces |
| 8 | Password reset flow — is it in scope for MVP? | Auth completeness | Yes — implied by email/password auth |
| 9 | Workspace invitation acceptance — what if invitee is not yet registered? | Invite + signup flow | Invite link → signup page pre-filled with email → auto-joins workspace after signup |
| 10 | Can a Chef edit a recipe without seeing ingredient costs? | UI split + RBAC | Chef sees recipe items (quantities) but cost columns are hidden |
| 11 | How is VAT handled in food cost % calculation? | Cost engine correctness | VAT applied to selling price only for net margin; food cost % uses pre-VAT selling price |
| 12 | Can a Manager remove a member or only the Owner can? | RBAC scope | Only Owner can manage membership in MVP |

---

## Explicitly Out of Scope (MVP)
- POS integration / sales import automation
- Inventory tracking (quantities on hand)
- Purchase orders / supplier management
- Mobile native app (iOS/Android)
- Multi-branch ingredient pricing (P2)
- Nutritional values / allergen tracking
- Invoice scanning / OCR
- Multi-currency support
- API for external integrations
- White-label / custom domain per workspace

---

## Open Decisions for Architecture Review
These require a decision before system-planner runs:

- [ ] **Recursive cost calculation**: Pure TypeScript server-side recursion vs PostgreSQL recursive CTE? — _Recommendation: TypeScript recursion in Server Action (simpler, testable, avoids raw SQL)_
- [ ] **Cost caching strategy**: TanStack Query with `revalidatePath`/tag invalidation vs in-memory server cache? — _Recommendation: Next.js `unstable_cache` with tag invalidation on ingredient/recipe mutation_
- [ ] **RTL layout**: Full RTL via `dir="rtl"` on `<html>` + Tailwind RTL utilities vs Hebrew text with LTR layout? — _Recommendation: Full RTL — primary market is Hebrew_
- [ ] **Workspace invitation flow**: Email link via Resend vs direct add by admin with no email? — _Recommendation: Email link (Resend) — needed for proper onboarding_
- [ ] **Stale cost indicator**: How to mark a recipe as "cost is stale"? Timestamp on Recipe vs no state (always lazy recompute)? — _Recommendation: `costStaleAt` timestamp on Recipe — set when any dependent ingredient price changes_
- [ ] **URL structure**: `/[workspaceSlug]/...` vs `/app/[workspaceSlug]/...`? — _Recommendation: `/[workspaceSlug]/...` — cleaner URLs for multi-tenant SaaS_
