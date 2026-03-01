# Product Requirements Document
## Menu Cost & Profit Control System

---

## Overview

**Product name**: MenuCost  
**Purpose**: Web application that gives restaurant owners real-time visibility and control over menu profitability — tracking ingredient costs, recipe trees, and food cost percentages in one place.  
**Target users**: Restaurant owners and managers of small-to-medium restaurants, cafes, catering businesses, and institutional kitchens.  
**Success metrics**: User can calculate the true cost of any dish within 2 minutes of entering ingredients. Food Cost % visible on dashboard without manual calculation.

---

## Actors & Roles

| Actor | Description | Permissions |
|-------|-------------|-------------|
| Owner | Restaurant/business owner | Full access including profitability data, pricing, settings |
| Manager | Operations manager | Access to recipes, ingredients, costs — no pricing decisions |
| Chef | Kitchen staff | View and edit recipes only — no cost/profitability visibility |
| Viewer | Read-only stakeholder | View recipes and menu — no cost data |

---

## Multi-Tenant Architecture

Each business (restaurant/chain) is an isolated **Workspace**. A user can belong to multiple workspaces with different roles per workspace. Row-Level Security (RLS) enforces data isolation at the DB level. Ingredient prices can differ per workspace (branch-level pricing in Phase 2).

---

## Features

| Feature | Priority | Complexity | Entities |
|---------|----------|------------|---------|
| Ingredient management (CRUD + waste %) | P0 | M | Ingredient, Unit |
| Recipe builder with nested sub-recipes | P0 | L | Recipe, RecipeItem |
| Recursive cost engine (server-side) | P0 | L | Recipe, Ingredient |
| Pricing & profitability per dish | P0 | M | Recipe, PricingConfig |
| Dashboard — Food Cost KPIs | P0 | M | aggregations |
| Menu Engineering (Stars/Workhorses/Puzzles/Dogs) | P0 | M | Recipe, SalesData |
| Price change impact analysis | P0 | M | Ingredient, Recipe |
| Workspace management + invitations | P0 | S | Workspace, Member |
| Auth — Email/Password | P0 | S | User |
| Role-based access control (RBAC) | P0 | M | Role, Permission |
| Unit conversion engine | P1 | M | Unit, Conversion |
| Audit log for price changes | P1 | S | AuditLog |
| Multiple branches per workspace | P2 | L | Branch, Ingredient |
| Sales data import (for Menu Engineering popularity) | P2 | M | SalesData |

---

## Data Entities (Draft)

```typescript
interface Workspace {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'
}

interface Ingredient {
  id: string
  workspaceId: string
  name: string
  unit: string           // kg, g, liter, ml, unit, etc.
  pricePerUnit: number   // Decimal — price in ILS per unit
  wastePercent: number   // 0–100, default 0
  supplier?: string
  pricedAt: string       // last price update date
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface Recipe {
  id: string
  workspaceId: string
  name: string
  category?: string
  yield: number          // how many portions this recipe produces
  yieldUnit: string      // 'portion' | 'kg' | 'liter' etc.
  isSubRecipe: boolean   // true = can be nested inside other recipes
  sellingPrice?: number  // null if sub-recipe
  vatPercent?: number    // e.g. 17
  laborCost?: number     // optional manual labor cost
  overheadCost?: number  // optional overhead
  salesVolume?: number   // optional — for Menu Engineering
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface RecipeItem {
  id: string
  recipeId: string
  // Either ingredient OR sub-recipe — never both
  ingredientId?: string
  subRecipeId?: string
  quantity: number
  unit: string
}

// Computed — never stored, always calculated server-side
interface RecipeCostResult {
  recipeId: string
  ingredientCost: number     // recursive sum of all ingredients
  laborCost: number
  overheadCost: number
  totalCost: number          // per portion
  sellingPrice: number
  grossProfit: number        // sellingPrice - ingredientCost
  grossMargin: number        // %
  foodCostPercent: number    // ingredientCost / sellingPrice * 100
  netProfit: number          // sellingPrice - totalCost
  netMargin: number          // %
}

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
```

---

## Core User Flows (P0)

### Flow 1 — Add an Ingredient
1. User navigates to Ingredients
2. Clicks "Add Ingredient"
3. Fills: name, unit, price per unit, waste %, supplier (optional)
4. System saves and displays effective net price (after waste)
5. System flags all recipes that use this ingredient

### Flow 2 — Build a Recipe
1. User navigates to Recipes → New Recipe
2. Sets name, category, yield (portions), selling price
3. Adds items: search ingredient or sub-recipe, set quantity + unit
4. System calculates cost in real-time as items are added
5. User sees: ingredient cost, food cost %, gross margin
6. User saves — system persists and recalculates

### Flow 3 — Update Ingredient Price
1. User edits an ingredient's price
2. System recalculates all recipes containing this ingredient (recursive)
3. Dashboard shows: "X recipes affected, average Food Cost changed from Y% to Z%"
4. Impact panel shows which recipes now exceed Food Cost threshold

### Flow 4 — View Dashboard
1. Owner opens Dashboard
2. Sees: average Food Cost %, most profitable dish, most expensive-to-produce dish
3. Sees: list of recipes with food cost % colored (green/yellow/red by threshold)
4. Sees: recent price change alerts

### Flow 5 — Menu Engineering Analysis
1. Owner navigates to Menu Engineering
2. System plots each dish on Profitability × Popularity matrix
3. Dishes classified as: Star / Workhorse / Puzzle / Dog
4. Owner can filter by category and act on underperforming dishes

---

## Recursive Cost Engine (critical logic)

The cost of a recipe is calculated server-side, recursively:

```
costOf(recipe, portionQty):
  total = 0
  for each item in recipe.items:
    if item.isIngredient:
      effectivePrice = ingredient.pricePerUnit × (1 + wastePercent/100)
      total += item.quantity × effectivePrice × unitConversionFactor
    if item.isSubRecipe:
      subCostPerYieldUnit = costOf(subRecipe, subRecipe.yield) / subRecipe.yield
      total += item.quantity × subCostPerYieldUnit
  return total / portionQty
```

This runs entirely in Server Actions. Result is never stored — always recomputed on demand (or cached with tag invalidation on ingredient/recipe update).

---

## Non-Functional Requirements

| Category | Requirement | Priority |
|----------|-------------|----------|
| Security | RLS: users only see their workspace data | P0 |
| Security | Role-based access — Chef cannot see costs | P0 |
| Performance | Cost recalculation < 500ms for recipes up to 5 levels deep | P0 |
| Performance | Dashboard loads < 2s | P0 |
| Correctness | All monetary values use Decimal (never Float) | P0 |
| Correctness | Soft delete only — no hard deletes | P0 |
| Accessibility | WCAG 2.1 AA | P1 |
| i18n | Hebrew RTL support (primary market) | P1 |
| Availability | 99.9% uptime | P1 |

---

## Ambiguities & Open Questions

| # | Question | Impact | Assumption |
|---|----------|--------|------------|
| 1 | What currency? Fixed ILS or configurable per workspace? | Formatting + DB | ILS only in MVP |
| 2 | Food Cost threshold for alerts — fixed (30%?) or configurable per workspace? | Dashboard logic | Configurable per workspace, default 30% |
| 3 | Menu Engineering without sales data — use manual sales volume or disable popularity axis? | Feature scope | Manual sales volume input, popularity axis optional |
| 4 | Unit conversion (kg → g, liter → ml) — full conversion table or manual? | RecipeItem entry | Predefined common conversions (metric), manual override |
| 5 | Are sub-recipes sharable across workspaces (e.g. chain-wide sauce)? | Multi-tenant model | No — each workspace owns its own sub-recipes |
| 6 | Price change recalculation — eager (on save) or lazy (on view)? | Performance | Lazy with stale indicator, triggered on view or manual refresh |

---

## Explicitly Out of Scope (MVP)
- POS integration / sales import automation
- Inventory tracking (quantities on hand)
- Purchase orders / supplier management
- Mobile app
- Multi-branch ingredient pricing
- Nutritional values
- Allergen tracking
- Invoice scanning / OCR

---

## Open Decisions for Architecture
- [ ] Recursive cost calculation: pure TypeScript recursion vs PostgreSQL recursive CTE?
- [ ] Caching strategy for computed costs: TanStack Query with tag invalidation vs server-side cache?
- [ ] RTL: full RTL layout via Tailwind `dir="rtl"` or Hebrew-only text with LTR layout?
- [ ] Workspace invitation flow: email link (requires Resend) or direct add by email?
