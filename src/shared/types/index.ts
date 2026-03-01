// ─── Base Entity ────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

// ─── API Response (discriminated union) ─────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; fieldErrors?: Record<string, string[]> }

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export type WorkspaceRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'VIEWER'

// ─── Cost Calculation ─────────────────────────────────────────────────────────

export interface RecipeCostResult {
  recipeId: string
  // Per-portion costs
  ingredientCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  // Profitability
  sellingPrice: number
  sellingPriceWithVAT: number
  grossProfit: number
  grossMargin: number       // % (0-100)
  foodCostPercent: number   // % (0-100)
  netProfit: number
  netMargin: number         // % (0-100)
  // Meta
  isStale: boolean
  computedAt: string        // ISO timestamp
  breakdown: RecipeCostLineItem[]
}

export interface RecipeCostLineItem {
  ingredientId: string | null
  subRecipeId: string | null
  name: string
  quantity: number
  unit: string
  unitCostILS: number
  totalCostILS: number
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

// ─── Utility types ───────────────────────────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
