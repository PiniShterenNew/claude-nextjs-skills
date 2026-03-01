# DATA_MODEL.md
## MenuCost — Data Model & Entity Relationships

---

## Entity Relationship Overview

```
User ──────────────────┐
                       │ (many-to-many via WorkspaceMember)
Workspace ─────────────┤
   │                   └─ WorkspaceMember (role: OWNER|MANAGER|CHEF|VIEWER)
   │
   ├── Ingredient[] ───────────────────────────────────┐
   │      └── AuditLog[] (price changes)               │
   │                                                   │
   ├── Recipe[] ──────────────────────────────────┐    │
   │      ├── RecipeItem[] ──── ingredientId? ────┘    │
   │      │         └──────── subRecipeId? ────────── Recipe (self-ref)
   │      └── AuditLog[]
   │
   └── WorkspaceInvitation[]

UnitConversion (global, not workspace-scoped)
```

---

## TypeScript Interfaces

```typescript
// ─── Shared Base ─────────────────────────────────────────────────────────────

interface BaseEntity {
  id: string            // cuid()
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
  deletedAt: string | null  // soft delete — null = active
}

// ─── User ─────────────────────────────────────────────────────────────────────

interface User extends BaseEntity {
  email: string           // unique, indexed
  name: string
  passwordHash: string    // bcrypt, never returned to client
  emailVerified: boolean
  emailVerifyToken: string | null   // one-time token, cleared after use
  passwordResetToken: string | null // one-time token, expires after 1hr
  passwordResetExpiresAt: string | null
}

// Client-safe subset (never include passwordHash)
interface UserPublic {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

// ─── Workspace ────────────────────────────────────────────────────────────────

interface Workspace extends BaseEntity {
  name: string
  slug: string          // unique, URL-safe (e.g. "my-restaurant")
  currency: 'ILS'       // MVP: ILS only; field exists for Phase 2 expansion
  foodCostThreshold: number  // default 30 — alert when food cost % exceeds this
}

// ─── WorkspaceMember ─────────────────────────────────────────────────────────

type WorkspaceRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'

interface WorkspaceMember {
  id: string
  workspaceId: string   // FK → Workspace
  userId: string        // FK → User
  role: WorkspaceRole
  invitedAt: string
  acceptedAt: string | null   // null = invite pending
  // Unique constraint: (workspaceId, userId)
}

// ─── WorkspaceInvitation ──────────────────────────────────────────────────────

interface WorkspaceInvitation {
  id: string
  workspaceId: string   // FK → Workspace
  invitedByUserId: string // FK → User (the inviter)
  email: string         // invited email (may or may not be a registered user)
  role: WorkspaceRole
  token: string         // unique signed token in email link
  expiresAt: string     // 48 hours from creation
  acceptedAt: string | null
  createdAt: string
}

// ─── Ingredient ───────────────────────────────────────────────────────────────

interface Ingredient extends BaseEntity {
  workspaceId: string   // FK → Workspace
  name: string          // unique within workspace
  unit: IngredientUnit
  pricePerUnit: string  // Decimal as string (avoid float precision loss in JSON)
  wastePercent: number  // 0–100, default 0
  supplier: string | null
  pricedAt: string      // ISO date of last price update
  // Derived (not stored): effectivePrice = pricePerUnit * (1 + wastePercent/100)
}

type IngredientUnit =
  | 'kg' | 'g' | 'mg'
  | 'liter' | 'ml' | 'cl'
  | 'unit'              // countable items (eggs, pieces)
  | 'tbsp' | 'tsp'     // tablespoon, teaspoon
  | 'cup'

// ─── Recipe ───────────────────────────────────────────────────────────────────

interface Recipe extends BaseEntity {
  workspaceId: string   // FK → Workspace
  name: string
  category: string | null   // free text (e.g. "Starters", "Desserts")
  yield: number         // how many portions this recipe produces (Decimal)
  yieldUnit: string     // 'portion' | 'kg' | 'liter' | 'unit' | ...
  isSubRecipe: boolean  // true = can be nested inside other recipes
  sellingPrice: string | null   // Decimal; null for sub-recipes
  vatPercent: number | null     // e.g. 17 (ILS standard); null = exclude from calc
  laborCost: string | null      // Decimal per portion; optional manual cost
  overheadCost: string | null   // Decimal per portion; optional overhead
  salesVolume: number | null    // manual input for Menu Engineering popularity axis
  costStaleSince: string | null // set when a dependent ingredient price changes
  items: RecipeItem[]   // relation — populated on fetch
}

// ─── RecipeItem ───────────────────────────────────────────────────────────────

interface RecipeItem {
  id: string
  recipeId: string           // FK → Recipe (parent)
  // Exactly one of the two must be non-null:
  ingredientId: string | null  // FK → Ingredient
  subRecipeId: string | null   // FK → Recipe (child)
  quantity: number             // Decimal
  unit: string                 // unit for this line item (must be convertible to ingredient unit)
  // Constraint: ingredientId XOR subRecipeId (enforced at application layer)
}

// ─── RecipeCostResult (computed, never stored) ───────────────────────────────

interface RecipeCostResult {
  recipeId: string
  // Per-portion costs (Decimal as number for client use)
  ingredientCost: number    // recursive sum of all ingredient costs
  laborCost: number         // from Recipe.laborCost or 0
  overheadCost: number      // from Recipe.overheadCost or 0
  totalCost: number         // ingredientCost + laborCost + overheadCost
  // Profitability metrics
  sellingPrice: number      // from Recipe.sellingPrice (pre-VAT)
  sellingPriceWithVAT: number  // sellingPrice * (1 + vatPercent/100)
  grossProfit: number       // sellingPrice - ingredientCost
  grossMargin: number       // grossProfit / sellingPrice * 100 (%)
  foodCostPercent: number   // ingredientCost / sellingPrice * 100 (%)
  netProfit: number         // sellingPrice - totalCost
  netMargin: number         // netProfit / sellingPrice * 100 (%)
  // Meta
  isStale: boolean          // true if costStaleSince is set
  computedAt: string        // ISO timestamp of this calculation
}

// ─── AuditLog ─────────────────────────────────────────────────────────────────

type AuditEntityType = 'Ingredient' | 'Recipe' | 'RecipeItem'
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

interface AuditLog {
  id: string
  workspaceId: string       // FK → Workspace (for RLS)
  entityType: AuditEntityType
  entityId: string
  action: AuditAction
  changes: {
    before: Record<string, unknown> | null
    after: Record<string, unknown> | null
  }
  actorId: string           // FK → User
  createdAt: string
}

// ─── UnitConversion (global seed data) ───────────────────────────────────────

interface UnitConversion {
  id: string
  fromUnit: string    // e.g. 'kg'
  toUnit: string      // e.g. 'g'
  factor: number      // multiply fromUnit qty by factor to get toUnit qty
  // e.g. fromUnit='kg', toUnit='g', factor=1000
  // Unique constraint: (fromUnit, toUnit)
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationMeta {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}
```

---

## Prisma Schema (draft)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  name                   String
  passwordHash           String
  emailVerified          Boolean   @default(false)
  emailVerifyToken       String?   @unique
  passwordResetToken     String?   @unique
  passwordResetExpiresAt DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  deletedAt              DateTime?

  memberships    WorkspaceMember[]
  invitationsSent WorkspaceInvitation[] @relation("InvitedBy")
  auditLogs      AuditLog[]

  @@index([email])
}

model Workspace {
  id                 String    @id @default(cuid())
  name               String
  slug               String    @unique
  currency           String    @default("ILS")
  foodCostThreshold  Decimal   @default(30) @db.Decimal(5, 2)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  deletedAt          DateTime?

  members      WorkspaceMember[]
  invitations  WorkspaceInvitation[]
  ingredients  Ingredient[]
  recipes      Recipe[]
  auditLogs    AuditLog[]

  @@index([slug])
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole
  invitedAt   DateTime  @default(now())
  acceptedAt  DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  user      User      @relation(fields: [userId], references: [id])

  @@unique([workspaceId, userId])
  @@index([userId])
}

model WorkspaceInvitation {
  id              String    @id @default(cuid())
  workspaceId     String
  invitedByUserId String
  email           String
  role            WorkspaceRole
  token           String    @unique
  expiresAt       DateTime
  acceptedAt      DateTime?
  createdAt       DateTime  @default(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  invitedBy   User      @relation("InvitedBy", fields: [invitedByUserId], references: [id])

  @@index([workspaceId])
  @@index([token])
}

model Ingredient {
  id           String    @id @default(cuid())
  workspaceId  String
  name         String
  unit         String
  pricePerUnit Decimal   @db.Decimal(10, 4)
  wastePercent Decimal   @default(0) @db.Decimal(5, 2)
  supplier     String?
  pricedAt     DateTime  @default(now())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  workspace   Workspace    @relation(fields: [workspaceId], references: [id])
  recipeItems RecipeItem[]

  @@unique([workspaceId, name])
  @@index([workspaceId])
}

model Recipe {
  id            String    @id @default(cuid())
  workspaceId   String
  name          String
  category      String?
  yield         Decimal   @db.Decimal(10, 3)
  yieldUnit     String
  isSubRecipe   Boolean   @default(false)
  sellingPrice  Decimal?  @db.Decimal(10, 4)
  vatPercent    Decimal?  @db.Decimal(5, 2)
  laborCost     Decimal?  @db.Decimal(10, 4)
  overheadCost  Decimal?  @db.Decimal(10, 4)
  salesVolume   Int?
  costStaleSince DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  workspace    Workspace    @relation(fields: [workspaceId], references: [id])
  items        RecipeItem[] @relation("ParentRecipe")
  usedInItems  RecipeItem[] @relation("SubRecipe")

  @@unique([workspaceId, name])
  @@index([workspaceId])
  @@index([workspaceId, isSubRecipe])
  @@index([workspaceId, category])
}

model RecipeItem {
  id           String  @id @default(cuid())
  recipeId     String
  ingredientId String?
  subRecipeId  String?
  quantity     Decimal @db.Decimal(10, 4)
  unit         String

  recipe      Recipe      @relation("ParentRecipe", fields: [recipeId], references: [id])
  ingredient  Ingredient? @relation(fields: [ingredientId], references: [id])
  subRecipe   Recipe?     @relation("SubRecipe", fields: [subRecipeId], references: [id])

  @@index([recipeId])
  @@index([ingredientId])
  @@index([subRecipeId])
}

model AuditLog {
  id          String          @id @default(cuid())
  workspaceId String
  entityType  AuditEntityType
  entityId    String
  action      AuditAction
  changes     Json            // { before: {...} | null, after: {...} | null }
  actorId     String
  createdAt   DateTime        @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id])
  actor     User      @relation(fields: [actorId], references: [id])

  @@index([workspaceId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
}

model UnitConversion {
  id       String  @id @default(cuid())
  fromUnit String
  toUnit   String
  factor   Decimal @db.Decimal(15, 6)

  @@unique([fromUnit, toUnit])
}

enum WorkspaceRole {
  OWNER
  MANAGER
  CHEF
  VIEWER
}

enum AuditEntityType {
  Ingredient
  Recipe
  RecipeItem
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
}
```

---

## Relationships Summary

| From | To | Type | Via |
|------|----|------|-----|
| User | Workspace | Many-to-Many | WorkspaceMember |
| Workspace | Ingredient | One-to-Many | Ingredient.workspaceId |
| Workspace | Recipe | One-to-Many | Recipe.workspaceId |
| Recipe | RecipeItem | One-to-Many | RecipeItem.recipeId ("ParentRecipe") |
| RecipeItem | Ingredient | Many-to-One | RecipeItem.ingredientId (optional) |
| RecipeItem | Recipe | Many-to-One | RecipeItem.subRecipeId (optional, "SubRecipe") |
| Workspace | AuditLog | One-to-Many | AuditLog.workspaceId |
| User | AuditLog | One-to-Many | AuditLog.actorId |
| Workspace | WorkspaceInvitation | One-to-Many | WorkspaceInvitation.workspaceId |

## Indexes Rationale

| Index | Reason |
|-------|--------|
| `User.email` | Login lookup |
| `Workspace.slug` | URL routing lookup |
| `WorkspaceMember(workspaceId, userId)` unique | Prevent duplicate memberships |
| `Ingredient(workspaceId, name)` unique | Prevent duplicate names per workspace |
| `Recipe(workspaceId)` | Filter recipes by workspace (all list queries) |
| `Recipe(workspaceId, isSubRecipe)` | Quickly find sub-recipes for selector |
| `Recipe(workspaceId, category)` | Category filter on recipe list |
| `RecipeItem(recipeId)` | Load items for a recipe |
| `RecipeItem(ingredientId)` | Find all recipes using an ingredient (impact analysis) |
| `RecipeItem(subRecipeId)` | Find all recipes using a sub-recipe (circular check) |
| `AuditLog(workspaceId, createdAt DESC)` | Dashboard: recent price alerts |
| `UnitConversion(fromUnit, toUnit)` unique | Fast conversion lookup |
